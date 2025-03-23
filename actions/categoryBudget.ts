"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Get all category budgets for the current user
 */
export async function getCategoryBudgets() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const categoryBudgets = await db.categoryBudget.findMany({
      where: { userId: user.id },
      orderBy: { category: "asc" },
    });

    return categoryBudgets.map((budget: any) => ({
      ...budget,
      amount: budget.amount.toNumber(),
    }));
  } catch (error) {
    console.error("Error fetching category budgets:", error);
    throw error;
  }
}

/**
 * Get spending by category for the current month
 */
export async function getCategorySpending() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get current month date range
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

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
    console.error("Error fetching category spending:", error);
    throw error;
  }
}

/**
 * Set or update a category budget
 */
export async function setCategoryBudget(category: string, amount: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

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
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error: any) {
    console.error("Error setting category budget:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a category budget
 */
export async function deleteCategoryBudget(category: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

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
    console.error("Error deleting category budget:", error);
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

