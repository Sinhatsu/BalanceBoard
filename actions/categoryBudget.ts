"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser, getCurrentMonthRange, serializeTransaction } from "@/lib/server-utils";

/**
 * Get all category budgets for the current user
 */
export async function getCategoryBudgets() {
  try {
    const user = await getAuthUser();

    const categoryBudgets = await db.categoryBudget.findMany({
      where: { userId: user.id },
      orderBy: { category: "asc" },
    });

    return categoryBudgets.map((budget: any) => serializeTransaction(budget));
  } catch (error) {
    throw error;
  }
}

/**
 * Get spending by category for the current month
 */
export async function getCategorySpending() {
  try {
    const user = await getAuthUser();

    // Get current month date range
    const { startOfMonth, endOfMonth } = getCurrentMonthRange();

    // Get all expenses for current month
    const expenses = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    // Group by category
    const spendingByCategory = expenses.reduce(
      (acc: { [key: string]: number }, transaction: any) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount.toNumber();
        return acc;
      },
      {}
    );

    return spendingByCategory;
  } catch (error) {
    throw error;
  }
}

/**
 * Set or update a category budget
 */
export async function setCategoryBudget(category: string, amount: number) {
  try {
    const user = await getAuthUser();

    if (amount <= 0) {
      throw new Error("Budget amount must be greater than 0");
    }

    const budget = await db.categoryBudget.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category,
        },
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        category,
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

/**
 * Delete a category budget
 */
export async function deleteCategoryBudget(category: string) {
  try {
    const user = await getAuthUser();

    await db.categoryBudget.delete({
      where: {
        userId_category: {
          userId: user.id,
          category,
        },
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get category budgets with current spending
 */
export async function getCategoryBudgetsWithSpending() {
  try {
    const [budgets, spending] = await Promise.all([
      getCategoryBudgets(),
      getCategorySpending(),
    ]);

    return budgets.map((budget: any) => ({
      ...budget,
      spent: spending[budget.category] || 0,
      percentage: spending[budget.category]
        ? (spending[budget.category] / budget.amount) * 100
        : 0,
    }));
  } catch (error) {
    console.error("Error fetching category budgets with spending:", error);
    throw error;
  }
}

