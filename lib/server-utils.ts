"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { User } from "@prisma/client";

/**
 * Get authenticated user from database
 * Throws error if user is not authenticated or not found
 */
export async function getAuthUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return user;
}

/**
 * Convert Prisma Decimal fields to numbers for serialization
 */
export function serializeTransaction<T extends Record<string, any>>(obj: T): any {
  const serialized = { ...obj } as any;
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = Number(obj.balance);
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = Number(obj.amount);
  }
  return serialized;
}

/**
 * Get current month date range
 */
export function getCurrentMonthRange() {
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

  return { startOfMonth, endOfMonth, currentDate };
}

/**
 * Calculate next recurring date based on interval
 */
export function calculateNextRecurringDate(startDate: Date, interval: string): Date {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

