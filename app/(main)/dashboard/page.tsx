import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import { AccountCard } from "./_components/accountCard";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CreditCard } from "lucide-react";
import CreateAccount from "@/components/CreateAccount";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_components/budgetProgress";
import { DashboardOverview } from "./_components/transactionOverview";
import { TrendChart } from "./_components/trendChart";
import ExportData from "@/components/ExportData";
import ImportData from "@/components/ImportData";
import CategoryBudgets from "@/components/CategoryBudgets";
import { getCategoryBudgetsWithSpending } from "@/actions/categoryBudget";
import SpendingInsights from "@/components/SpendingInsights";
import { getSpendingInsights } from "@/actions/insights";

export default async function DashboardPage() {
  const [accounts, transactions, categoryBudgets, insights] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
    getCategoryBudgetsWithSpending(),
    getSpendingInsights(),
  ]);
  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8 pb-12 bg-background">
      {/* Header Section */}
      <div className="rounded-2xl bg-card p-8 border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <p className="text-primary font-medium text-sm uppercase tracking-wider mb-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              Your Financial Overview 💰
            </h1>
            <p className="text-muted-foreground text-lg">
              Track, manage, and grow your wealth
            </p>
          </div>
          {accounts && accounts.length > 0 && (
            <div className="flex gap-2">
              <ExportData />
              <ImportData accounts={accounts || []} />
            </div>
          )}
        </div>
      <BudgetProgress
        initialBudget={
          budgetData?.budget
            ? { amount: budgetData.budget.amount }
            : { amount: 0 }
        }
        currentExpenses={budgetData?.currentExpenses || 0}
      />
      </div>

      {/* Recent Transactions & Overview */}
      <DashboardOverview
        accounts={accounts||[]}
        transactions={transactions || []}
      />

      {/* Analytics Chart - Full Width with proper spacing */}
      <div className="w-full">
        <TrendChart transactions={transactions || []} />
      </div>

      {/* Two Column Layout: Insights & Category Budgets */}
      <div className="grid gap-8 xl:grid-cols-2">
        <SpendingInsights initialInsights={insights || []} />
        <CategoryBudgets budgets={categoryBudgets || []} />
      </div>

      {/* Accounts Section - Full Width */}
      <Card className="shadow-lg bg-card border-border">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            Your Accounts
          </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccount>
              <Card className="group hover:shadow-md transition-all cursor-pointer border-2 border-dashed border-border hover:border-primary/50 bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-40 pt-6">
                  <div className="p-3 bg-background rounded-full mb-3 transition-colors group-hover:bg-primary/10">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccount>
        {accounts &&
          accounts.length > 0 &&
          accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
        </div>
      </Card>
    </div>
  );
}
