"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";
import { getAuthUser } from "@/lib/server-utils";

// Categories with their typical amount ranges (in dollars)
const CATEGORIES: Record<string, Array<{ name: string; range: [number, number] }>> = {
  INCOME: [
    { name: "salary", range: [3000, 6000] },
    { name: "freelance", range: [500, 2000] },
    { name: "investments", range: [200, 1000] },
    { name: "business", range: [300, 1500] },
    { name: "other-income", range: [50, 500] },
  ],
  EXPENSE: [
    { name: "housing", range: [500, 1500] },
    { name: "transportation", range: [50, 200] },
    { name: "groceries", range: [100, 400] },
    { name: "utilities", range: [50, 150] },
    { name: "entertainment", range: [20, 100] },
    { name: "food", range: [30, 150] },
    { name: "shopping", range: [50, 300] },
    { name: "healthcare", range: [30, 500] },
    { name: "education", range: [50, 500] },
    { name: "travel", range: [100, 1000] },
    { name: "personal", range: [20, 100] },
    { name: "bills", range: [50, 200] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type: "INCOME" | "EXPENSE"): { category: string; amount: number } {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

export async function seedTransactions() {
  try {
    // Get authenticated user
    const user = await getAuthUser();
    
    // Get user's default account
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
      },
    });

    if (!account) {
      return { success: false, error: "No default account found. Please create an account first." };
    }

    // Generate 90 days of transactions
    const transactions: Array<any> = [];
    let totalBalance = account.balance.toNumber(); // Start with existing balance

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: date,
          updatedAt: date,
        };

        totalBalance += type === "INCOME" ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Insert transactions in batches and update account balance
    await db.$transaction(async (tx) => {
      // Clear existing transactions for this account
      await tx.transaction.deleteMany({
        where: { accountId: account.id },
      });

      // Insert new transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance
      await tx.account.update({
        where: { id: account.id },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions for account "${account.name}"`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}