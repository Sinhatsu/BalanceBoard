"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Export all transactions to CSV format
 */
export async function exportTransactionsToCSV(accountId?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch transactions with account details
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...(accountId && { accountId }),
      },
      include: {
        account: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (transactions.length === 0) {
      throw new Error("No transactions found to export");
    }

    // Create CSV header
    const headers = [
      "Date",
      "Type",
      "Amount",
      "Category",
      "Description",
      "Account",
      "Recurring",
      "Recurring Interval",
      "Status",
    ];

    // Create CSV rows
    const rows = transactions.map((transaction: any) => [
      new Date(transaction.date).toISOString().split("T")[0], // Date in YYYY-MM-DD
      transaction.type,
      transaction.amount.toString(),
      transaction.category,
      transaction.description || "",
      transaction.account.name,
      transaction.isRecurring ? "Yes" : "No",
      transaction.recurringInterval || "",
      transaction.status,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) =>
        row.map((cell: any) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return {
      success: true,
      data: csvContent,
      filename: `balanceboard_transactions_${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error: any) {
    console.error("Export error:", error);
    throw new Error(error.message || "Failed to export transactions");
  }
}

/**
 * Parse and validate CSV file for import
 */
export async function parseTransactionCSV(csvContent: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Split CSV into lines
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file is empty or invalid");
    }

    // Parse header
    const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    // Check if user has any accounts
    if (!user.accounts || user.accounts.length === 0) {
      throw new Error("No accounts found. Please create an account first.");
    }

    // Validate required columns
    const requiredColumns = ["Date", "Type", "Amount", "Category"];
    const missingColumns = requiredColumns.filter(
      (col) => !header.includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Missing required columns: ${missingColumns.join(", ")}`
      );
    }

    // Parse transactions
    const parsedTransactions = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Simple CSV parsing (handles quoted values)
        const values: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        // Create object from values
        const transaction: any = {};
        header.forEach((key, index) => {
          transaction[key] = values[index]?.replace(/^"|"$/g, "") || "";
        });

        // Validate and transform
        const date = new Date(transaction.Date);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date format");
        }

        const amount = parseFloat(transaction.Amount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Invalid amount");
        }

        const type = transaction.Type.toUpperCase();
        if (!["INCOME", "EXPENSE"].includes(type)) {
          throw new Error("Type must be INCOME or EXPENSE");
        }

        // Always use the first/default account - ignore Account column in CSV
        const accountId = user.accounts[0].id;

        parsedTransactions.push({
          date: date.toISOString(), // Return as ISO string for serialization
          type,
          amount,
          category: transaction.Category,
          description: transaction.Description || "", // Use empty string instead of null
          accountId,
          isRecurring:
            transaction.Recurring?.toLowerCase() === "yes" ? true : false,
          recurringInterval: transaction["Recurring Interval"] || "", // Use empty string instead of null
          status: transaction.Status || "COMPLETED",
        });
      } catch (error: any) {
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    if (errors.length > 0 && parsedTransactions.length === 0) {
      throw new Error(`Failed to parse CSV:\n${errors.join("\n")}`);
    }

    return {
      success: true,
      transactions: parsedTransactions,
      errors: errors.length > 0 ? errors : null,
      totalRows: lines.length - 1,
      successfulRows: parsedTransactions.length,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to parse CSV");
  }
}

/**
 * Import transactions from parsed CSV data
 * Optionally into a specific account chosen by the user
 */
export async function importTransactions(transactions: any, targetAccountId?: string) {
  try {
    console.log("=== IMPORT DEBUG ===");
    console.log("Received transactions:", transactions);
    console.log("Type:", typeof transactions);
    console.log("Is Array:", Array.isArray(transactions));
    console.log("Length:", transactions?.length);
    
    if (!transactions) {
      throw new Error("No transactions data provided");
    }

    if (!Array.isArray(transactions)) {
      throw new Error("Transactions must be an array");
    }

    if (transactions.length === 0) {
      throw new Error("No transactions to import");
    }

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    
    if (!user.accounts || user.accounts.length === 0) {
      throw new Error("No accounts found. Please create an account first.");
    }

    // Determine which account to import into
    const fallbackAccountId = user.accounts[0].id;
    const accountIdToUse =
      targetAccountId &&
      user.accounts.some((acc) => acc.id === targetAccountId)
        ? targetAccountId
        : fallbackAccountId;

    console.log("User found:", user.id);
    console.log("Using account:", accountIdToUse);
    console.log("First transaction to import:", transactions[0]);

    // Import transactions and update account balances
    const result = await db.$transaction(async (tx: any) => {
      const imported = [];

      for (const transaction of transactions) {
        if (!transaction) continue;
        
        console.log("Processing transaction:", transaction);
        
        // Validate and clean the data
        const transactionDate = new Date(transaction.date);
        if (isNaN(transactionDate.getTime())) {
          console.error("Invalid date:", transaction.date);
          continue;
        }
        
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount)) {
          console.error("Invalid amount:", transaction.amount);
          continue;
        }
        
        // Create transaction with properly formatted date
        const newTransaction = await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: amount,
            category: transaction.category,
            description: transaction.description && transaction.description.trim() !== "" ? transaction.description : null,
            date: transactionDate,
            accountId: accountIdToUse,
            isRecurring: transaction.isRecurring === true,
            recurringInterval: transaction.recurringInterval && transaction.recurringInterval.trim() !== "" ? transaction.recurringInterval : null,
            status: transaction.status || "COMPLETED",
            userId: user.id,
          },
        });
        
        console.log("Created transaction:", newTransaction.id);

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -amount
            : amount;

        console.log("Updating balance by:", balanceChange);

        await tx.account.update({
          where: { id: accountIdToUse },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        console.log("Balance updated successfully");
        imported.push(newTransaction);
      }

      return imported;
    });

    return {
      success: true,
      count: result.length,
      message: `Successfully imported ${result.length} transaction(s)`,
    };
  } catch (error: any) {
    console.error("Import error:", error);
    
    // Extract only the message to avoid serialization issues
    const errorMessage = error?.message || error?.toString() || "Failed to import transactions";
    
    // Return an error response instead of throwing
    return {
      success: false,
      count: 0,
      message: errorMessage,
    };
  }
}

