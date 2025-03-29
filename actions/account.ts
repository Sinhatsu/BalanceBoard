"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser, serializeTransaction } from "@/lib/server-utils";

export async function updateDefaultAccount(accountId: string) {
  try {
    const user = await getAuthUser();

    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAccountWithTransactions(accountId: string) {
  const user = await getAuthUser();
  
  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });
  if (!account) return null;
  return {
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

export async function bulkDeleteTransactions(transactionIds: string[]) {
  try {
    const user = await getAuthUser();

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc: any, transaction: any) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        const incrementValue = typeof balanceChange === 'number' ? balanceChange : parseFloat(balanceChange as string);
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: incrementValue,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/[id]`, "page");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(accountId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: (await getAuthUser()).clerkUserId },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accounts = user.accounts;
    const account = accounts.find((a) => a.id === accountId);

    if (!account) {
      throw new Error("Account not found");
    }

    if (accounts.length <= 1) {
      return {
        success: false,
        code: "ONLY_ACCOUNT",
        message: "You must create another account before deleting the only account.",
      };
    }

    if (account.isDefault) {
      return {
        success: false,
        code: "DEFAULT_ACCOUNT",
        message: "Set another account as default before deleting this one.",
      };
    }

    await db.account.delete({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    // Transactions for this account are deleted automatically via onDelete: Cascade
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}