"use server";

import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthUser } from "@/lib/server-utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface SpendingInsight {
  type: "warning" | "success" | "info" | "tip";
  title: string;
  description: string;
  category?: string;
  amount?: number;
}

/**
 * Get spending insights using AI
 */
export async function getSpendingInsights(): Promise<SpendingInsight[]> {
  try {
    const user = await getAuthUser();

    // Get last 3 months of transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: threeMonthsAgo },
      },
      orderBy: { date: "desc" },
      select: {
        type: true,
        amount: true,
        category: true,
        date: true,
        description: true,
      },
    });

    if (transactions.length === 0) {
      return [
        {
          type: "info",
          title: "Start Tracking",
          description: "Add transactions to start receiving personalized insights about your spending patterns.",
        },
      ];
    }

    // Get basic analytics without AI first (fallback)
    const insights = generateBasicInsights(transactions);

    // Try to get AI insights if we have enough data
    if (transactions.length >= 10) {
      try {
        const aiInsights = await generateAIInsights(transactions);
        if (aiInsights.length > 0) {
          return aiInsights;
        }
      } catch (error: any) {
        console.error("AI insights failed, using basic insights:", error);
        // If AI service is down, add a note and return basic insights
        if (error.message?.includes('overloaded') || error.message?.includes('503')) {
          insights.unshift({
            type: "info",
            title: "Using Basic Insights",
            description: "AI service is temporarily busy. Showing analytics-based insights instead.",
          });
        }
      }
    }

    return insights;
  } catch (error) {
    console.error("Error getting spending insights:", error);
    // Return a friendly fallback instead of crashing
    return [
      {
        type: "info",
        title: "Insights Temporarily Unavailable",
        description: "We're having trouble loading your insights right now. Please refresh the page to try again.",
      },
    ];
  }
}

/**
 * Generate basic insights from transaction data
 */
function generateBasicInsights(transactions: any[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];

  // Calculate current month vs previous month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === "EXPENSE" && new Date(t.date) >= currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const previousMonthExpenses = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        new Date(t.date) >= previousMonthStart &&
        new Date(t.date) < currentMonthStart
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Compare month-over-month
  if (previousMonthExpenses > 0) {
    const change = ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;

    if (change > 20) {
      insights.push({
        type: "warning",
        title: "Spending Increased",
        description: `Your spending is up ${change.toFixed(1)}% compared to last month ($${currentMonthExpenses.toFixed(2)} vs $${previousMonthExpenses.toFixed(2)})`,
      });
    } else if (change < -20) {
      insights.push({
        type: "success",
        title: "Great Job!",
        description: `You've reduced spending by ${Math.abs(change).toFixed(1)}% this month. Keep it up!`,
      });
    }
  }

  // Find top spending category
  const categoryTotals = transactions
    .filter((t) => t.type === "EXPENSE" && new Date(t.date) >= currentMonthStart)
    .reduce((acc: { [key: string]: number }, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  if (Object.keys(categoryTotals).length > 0) {
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      type: "info",
      title: "Top Spending Category",
      description: `${topCategory[0]} is your biggest expense this month at $${topCategory[1].toFixed(2)}`,
      category: topCategory[0],
      amount: topCategory[1],
    });
  }

  // Detect unusual large transactions
  const avgTransaction =
    transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0) /
    transactions.filter((t) => t.type === "EXPENSE").length;

  const unusualTransactions = transactions
    .filter((t) => t.type === "EXPENSE" && Number(t.amount) > avgTransaction * 3)
    .slice(0, 1);

  if (unusualTransactions.length > 0) {
    const t = unusualTransactions[0];
    insights.push({
      type: "warning",
      title: "Unusual Expense Detected",
      description: `Large expense of $${Number(t.amount).toFixed(2)} in ${t.category} on ${new Date(t.date).toLocaleDateString()}`,
      category: t.category,
      amount: Number(t.amount),
    });
  }

  // Income insights
  const currentMonthIncome = transactions
    .filter((t) => t.type === "INCOME" && new Date(t.date) >= currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savingsRate =
    currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 : 0;

  if (savingsRate > 20) {
    insights.push({
      type: "success",
      title: "Excellent Savings Rate",
      description: `You're saving ${savingsRate.toFixed(1)}% of your income this month!`,
    });
  } else if (savingsRate < 0) {
    insights.push({
      type: "warning",
      title: "Spending Exceeds Income",
      description: `You've spent $${Math.abs(currentMonthIncome - currentMonthExpenses).toFixed(2)} more than your income this month.`,
    });
  }

  // Add general tips if we don't have enough insights
  if (insights.length < 2) {
    insights.push({
      type: "tip",
      title: "Track Regularly",
      description: "Regular tracking helps identify spending patterns and opportunities to save.",
    });
  }

  return insights;
}

/**
 * Generate AI-powered insights using Gemini
 */
async function generateAIInsights(transactions: any[]): Promise<SpendingInsight[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Prepare transaction summary
  const summary = {
    totalTransactions: transactions.length,
    expenses: transactions.filter((t) => t.type === "EXPENSE"),
    income: transactions.filter((t) => t.type === "INCOME"),
    categories: transactions.reduce((acc: { [key: string]: number }, t) => {
      if (t.type === "EXPENSE") {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      }
      return acc;
    }, {}),
  };

  const totalExpenses = summary.expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = summary.income.reduce((sum, t) => sum + Number(t.amount), 0);

  const prompt = `
You are a financial advisor analyzing spending patterns. Based on the following transaction data, provide 3-5 actionable insights.

Transaction Summary:
- Total Expenses: $${totalExpenses.toFixed(2)}
- Total Income: $${totalIncome.toFixed(2)}
- Number of Transactions: ${transactions.length}
- Categories: ${JSON.stringify(summary.categories)}

Provide insights in JSON format as an array of objects with this structure:
[
  {
    "type": "warning" | "success" | "info" | "tip",
    "title": "Brief title",
    "description": "Detailed description with specific numbers"
  }
]

Focus on:
1. Spending patterns and trends
2. Budget recommendations
3. Savings opportunities
4. Category-specific insights
5. Unusual spending behavior

Return ONLY valid JSON, no markdown formatting.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const insights = JSON.parse(cleanedText);

    // Validate the structure
    if (Array.isArray(insights) && insights.length > 0) {
      return insights.map((insight: any) => ({
        type: insight.type || "info",
        title: insight.title || "Insight",
        description: insight.description || "",
        category: insight.category,
        amount: insight.amount,
      }));
    }

    return [];
  } catch (error) {
    console.error("Failed to parse AI insights:", error);
    return [];
  }
}

