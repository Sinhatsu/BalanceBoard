"use client";

import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import CreateAccount from "@/components/CreateAccount";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ReceiptScanner } from "./reciptScanner";
import { Account, RecurringInterval, Transaction } from "@prisma/client";

interface TransactionFormProps {
  accounts: Account[] | [];
  categories: Category[];
  editMode?: boolean;
  initialData: Transaction | null;
}
type ScannedData = {
  amount: number;
  date: string;
  description?: string;
  category?: string;
};

const AddTransactionForm = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}: TransactionFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            category: "",
            accountId: accounts.find((ac: Account) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
            recurringInterval: undefined,
          },
  });
  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(
    editMode ? updateTransaction : (_, data) => createTransaction(data)
  );

  const onSubmit = (data: any) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    if (editMode && editId) {
      transactionFn(editId, formData);
    } else {
      transactionFn("", formData);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const handleScanComplete = (scannedData: ScannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  const filteredCategories = categories.filter(
    (category: Category) => category.type === type
  );
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select
            onValueChange={(value) => setValue("type", value)}
            defaultValue={type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
          {errors && errors.type && (
            <p className="text-sm text-red-500">{String(errors.type.message)}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step={0.01}
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">
              {String(errors.amount.message)}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setValue("date", date)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-red-500">{String(errors.date.message)}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value: string) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account: Account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (${parseFloat(account.balance.toString()).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccount>
                <Button
                  variant="ghost"
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  Create Account
                </Button>
              </CreateAccount>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">
              {String(errors.accountId.message)}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            onValueChange={(value) => setValue("category", value)}
            defaultValue={getValues("category")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category: Category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">
              {String(errors.category.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input
            placeholder="Enter description"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-red-500">
              {String(errors.description.message)}
            </p>
          )}
        </div>
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value: RecurringInterval) =>
              setValue("recurringInterval", value)
            }
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors && errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {String(errors.recurringInterval.message)}
            </p>
          )}
        </div>
      )}
      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full" disabled={transactionLoading}>
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
