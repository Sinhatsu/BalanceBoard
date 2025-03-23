"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, subMonths, startOfDay, endOfDay, eachDayOfInterval, eachMonthOfInterval, startOfMonth } from "date-fns";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Transaction } from "@prisma/client";
import { cn } from "@/lib/utils";

type TimeRange = "7d" | "30d" | "90d" | "6m" | "1y";

interface TrendChartProps {
  transactions: Transaction[];
}

export function TrendChart({ transactions }: TrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const { chartData, stats } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let interval: "day" | "month" = "day";

    // Determine date range and interval
    switch (timeRange) {
      case "7d":
        startDate = subDays(now, 6);
        interval = "day";
        break;
      case "30d":
        startDate = subDays(now, 29);
        interval = "day";
        break;
      case "90d":
        startDate = subDays(now, 89);
        interval = "day";
        break;
      case "6m":
        startDate = subMonths(now, 5);
        interval = "month";
        break;
      case "1y":
        startDate = subMonths(now, 11);
        interval = "month";
        break;
      default:
        startDate = subDays(now, 29);
        interval = "day";
    }

    // Create date buckets
    const dateBuckets =
      interval === "day"
        ? eachDayOfInterval({ start: startDate, end: now })
        : eachMonthOfInterval({ start: startOfMonth(startDate), end: now });

    // Initialize data structure
    const dataMap = new Map<string, { date: string; income: number; expense: number }>();

    dateBuckets.forEach((date) => {
      const key = interval === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");
      dataMap.set(key, {
        date: interval === "day" ? format(date, "MMM dd") : format(date, "MMM yyyy"),
        income: 0,
        expense: 0,
      });
    });

    // Aggregate transactions
    let totalIncome = 0;
    let totalExpense = 0;
    let previousPeriodIncome = 0;
    let previousPeriodExpense = 0;

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const key =
        interval === "day"
          ? format(transactionDate, "yyyy-MM-dd")
          : format(transactionDate, "yyyy-MM");

      const amount = Number(transaction.amount);

      // Check if transaction is in the selected range
      if (transactionDate >= startDate && transactionDate <= now) {
        const bucket = dataMap.get(key);
        if (bucket) {
          if (transaction.type === "INCOME") {
            bucket.income += amount;
            totalIncome += amount;
          } else {
            bucket.expense += amount;
            totalExpense += amount;
          }
        }
      }

      // Calculate previous period for comparison
      const daysInRange = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousPeriodStart = subDays(startDate, daysInRange);
      
      if (transactionDate >= previousPeriodStart && transactionDate < startDate) {
        if (transaction.type === "INCOME") {
          previousPeriodIncome += amount;
        } else {
          previousPeriodExpense += amount;
        }
      }
    });

    // Convert to array and add net
    const chartData = Array.from(dataMap.values()).map((item) => ({
      ...item,
      net: item.income - item.expense,
    }));

    // Calculate percentage changes
    const incomeChange = previousPeriodIncome > 0 
      ? ((totalIncome - previousPeriodIncome) / previousPeriodIncome) * 100 
      : 0;
    const expenseChange = previousPeriodExpense > 0 
      ? ((totalExpense - previousPeriodExpense) / previousPeriodExpense) * 100 
      : 0;
    const netTotal = totalIncome - totalExpense;
    const previousNet = previousPeriodIncome - previousPeriodExpense;
    const netChange = previousNet !== 0 
      ? ((netTotal - previousNet) / Math.abs(previousNet)) * 100 
      : 0;

    return {
      chartData,
      stats: {
        totalIncome,
        totalExpense,
        netTotal,
        incomeChange,
        expenseChange,
        netChange,
      },
    };
  }, [transactions, timeRange]);

  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalIncome.toFixed(2)}
            </div>
            <p className={cn(
              "text-xs flex items-center gap-1 mt-1",
              stats.incomeChange >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {stats.incomeChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(stats.incomeChange).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalExpense.toFixed(2)}
            </div>
            <p className={cn(
              "text-xs flex items-center gap-1 mt-1",
              stats.expenseChange <= 0 ? "text-green-600" : "text-red-600"
            )}>
              {stats.expenseChange <= 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {Math.abs(stats.expenseChange).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              stats.netTotal >= 0 ? "text-green-600" : "text-red-600"
            )}>
              ${stats.netTotal.toFixed(2)}
            </div>
            <p className={cn(
              "text-xs flex items-center gap-1 mt-1",
              stats.netChange >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {stats.netChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(stats.netChange).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Income & Expense Trends</CardTitle>
              <CardDescription>Track your financial flow over time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={chartType} onValueChange={(value: "line" | "bar") => setChartType(value)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No transaction data available for this period
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: "#22c55e" }}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444" }}
                      name="Expense"
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                      name="Net"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

