"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { setCategoryBudget, deleteCategoryBudget } from "@/actions/categoryBudget";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { defaultCategories } from "@/data/categories";
import { cn } from "@/lib/utils";

interface CategoryBudget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  percentage: number;
}

interface CategoryBudgetsProps {
  budgets: CategoryBudget[];
}

export default function CategoryBudgets({ budgets }: CategoryBudgetsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const expenseCategories = defaultCategories.filter((cat) => cat.type === "EXPENSE");
  const availableCategories = expenseCategories.filter(
    (cat) => !budgets.find((b) => b.category === cat.id)
  );

  const handleAddBudget = async () => {
    if (!selectedCategory || !budgetAmount) {
      toast.error("Please select a category and enter an amount");
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const result = await setCategoryBudget(selectedCategory, amount);
      if (result.success) {
        toast.success("Budget added successfully");
        setIsAddDialogOpen(false);
        setSelectedCategory("");
        setBudgetAmount("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add budget");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBudget = async () => {
    if (!editingBudget || !budgetAmount) {
      toast.error("Please enter an amount");
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const result = await setCategoryBudget(editingBudget.category, amount);
      if (result.success) {
        toast.success("Budget updated successfully");
        setIsEditDialogOpen(false);
        setEditingBudget(null);
        setBudgetAmount("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update budget");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (category: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      const result = await deleteCategoryBudget(category);
      if (result.success) {
        toast.success("Budget deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete budget");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete budget");
    }
  };

  const openEditDialog = (budget: CategoryBudget) => {
    setEditingBudget(budget);
    setBudgetAmount(budget.amount.toString());
    setIsEditDialogOpen(true);
  };

  const getCategoryName = (categoryId: string) => {
    return defaultCategories.find((cat) => cat.id === categoryId)?.name || categoryId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>Set spending limits for each category</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category Budget</DialogTitle>
              <DialogDescription>
                Set a monthly spending limit for a specific category
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Budget Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={budgetAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudgetAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Budget"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No category budgets set</p>
            <p className="text-xs mt-1">Click "Add Budget" to create your first category budget</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const isOverBudget = budget.percentage > 100;
              const isWarning = budget.percentage > 80 && budget.percentage <= 100;

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getCategoryName(budget.category)}</p>
                      <p className="text-xs text-muted-foreground">
                        ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isOverBudget && "text-red-600",
                          isWarning && "text-yellow-600"
                        )}
                      >
                        {budget.percentage.toFixed(0)}%
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(budget)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteBudget(budget.category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className={cn(
                      isOverBudget && "[&>div]:bg-red-500",
                      isWarning && "[&>div]:bg-yellow-500"
                    )}
                  />
                  {isOverBudget && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Over budget by ${(budget.spent - budget.amount).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category Budget</DialogTitle>
            <DialogDescription>
              Update the monthly budget for {editingBudget && getCategoryName(editingBudget.category)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Budget Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudgetAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBudget} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

