"use client";

import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { updateDefaultAccount, deleteAccount } from "@/actions/account";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Account = {
  name: string;
  type: string;
  balance: number;
  id: string;
  isDefault: boolean;
};

export function AccountCard({ account }: { account: Account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const {
    loading: deleteLoading,
    fn: deleteAccountFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteAccount);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDefaultChange = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    await updateDefaultFn(id);
  };

  const handleDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteAccountFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Account deleted successfully");
      setDeleteDialogOpen(false);
    } else if (deleteResult && !deleteResult.success) {
      const message =
        deleteResult.message ||
        deleteResult.error ||
        (deleteResult.code === "ONLY_ACCOUNT"
          ? "You must create another account before deleting this one."
          : deleteResult.code === "DEFAULT_ACCOUNT"
          ? "Set another account as default before deleting this one."
          : "Failed to delete account");
      toast.error(message);
    }
  }, [deleteResult]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError.message || "Failed to delete account");
    }
  }, [deleteError]);

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(balance) || 0);

  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <Card className="hover:shadow-md transition-shadow group relative">
        <Link href={`/account/${id}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium capitalize">
              {name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={isDefault}
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading}
              />
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleteLoading}
                className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete account"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-all">
              {formattedBalance}
            </div>
            <p className="text-xs text-muted-foreground">
              {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              Income
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              Expense
            </div>
          </CardFooter>
        </Link>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This will permanently delete the account <strong>{name}</strong> and
            all of its transactions. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}