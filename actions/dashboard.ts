"use server";

import { AccountSchema } from "@/app/lib/schema";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser, serializeTransaction } from "@/lib/server-utils";

export async function getUserAccounts() {
  const user = await getAuthUser();

  try {
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return accounts.map(serializeTransaction);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createAccount(data: AccountSchema) {
  try {
    const user = await getAuthUser();

    const balanceFloat = parseFloat(data.balance.toString());
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const user = await getAuthUser();

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}
