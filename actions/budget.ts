"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser, getCurrentMonthRange, serializeTransaction } from "@/lib/server-utils";

export async function getCurrentBudget(accountId: string) {
  try {
    const user = await getAuthUser();

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Get current month's expenses
    const { startOfMonth, endOfMonth } = getCurrentMonthRange();

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? serializeTransaction(budget) : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    throw error;
  }
}

export async function updateBudget(amount: number) {
  try {
    const user = await getAuthUser();

    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: serializeTransaction(budget),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
