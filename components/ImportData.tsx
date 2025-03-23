"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Loader2, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { parseTransactionCSV, importTransactions } from "@/actions/export";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportDataProps {
  accounts: {
    id: string;
    name: string;
    isDefault?: boolean | null;
  }[];
}

export default function ImportData({ accounts }: ImportDataProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const defaultAccountId =
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || "";
  const [targetAccountId, setTargetAccountId] =
    useState<string>(defaultAccountId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const result = await parseTransactionCSV(text);

      setParsedData(result);

      if (result.errors && result.errors.length > 0) {
        toast.warning(
          `Parsed ${result.successfulRows} of ${result.totalRows} rows. Some rows had errors.`
        );
      } else {
        toast.success(`Successfully parsed ${result.successfulRows} transactions`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to parse CSV file");
      setParsedData(null);
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !parsedData.transactions) return;
    if (!targetAccountId) {
      toast.error("Please select an account to import into");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("=== CLIENT SIDE DEBUG ===");
      console.log("Parsed data:", parsedData);
      console.log("Transactions:", parsedData.transactions);
      console.log("First transaction:", parsedData.transactions[0]);
      
      // Deep clone and ensure all values are serializable
      // Don't send accountId - server will use the user's default account
      const cleanTransactions = parsedData.transactions.map((t: any) => {
        const cleaned = {
          date: String(t.date || ""),
          type: String(t.type || ""),
          amount: Number(t.amount || 0),
          category: String(t.category || ""),
          description: String(t.description || ""),
          isRecurring: Boolean(t.isRecurring),
          recurringInterval: String(t.recurringInterval || ""),
          status: String(t.status || "COMPLETED"),
        };
        
        // Remove any undefined or null values
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key as keyof typeof cleaned] === undefined || 
              cleaned[key as keyof typeof cleaned] === null) {
            (cleaned as any)[key] = "";
          }
        });
        
        return cleaned;
      });
      
      console.log("Clean transactions:", cleanTransactions);
      console.log("First clean transaction:", cleanTransactions[0]);
      console.log("Stringified:", JSON.stringify(cleanTransactions[0]));
      
      // Pass the cleaned array and selected account
      const result = await importTransactions(cleanTransactions, targetAccountId);

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        setParsedData(null);
        setFile(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import transactions");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData(null);
    setTargetAccountId(defaultAccountId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import your transactions. Make sure it has the
            required columns: Date, Type, Amount, Category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  {file ? (
                    <span className="font-semibold">{file.name}</span>
                  ) : (
                    <>
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </div>

          {parsedData && (
            <div className="space-y-4">
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <AlertDescription className="text-sm text-green-800 dark:text-green-200 ml-2">
                  <strong>{parsedData.successfulRows}</strong> transactions ready
                  to import
                  {parsedData.totalRows !== parsedData.successfulRows && (
                    <span>
                      {" "}
                      ({parsedData.totalRows - parsedData.successfulRows} skipped)
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {parsedData.errors && parsedData.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Errors found:</strong>
                    <ul className="mt-2 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                      {parsedData.errors.slice(0, 5).map((error: string, i: number) => (
                        <li key={i} className="text-xs">
                          {error}
                        </li>
                      ))}
                      {parsedData.errors.length > 5 && (
                        <li className="text-xs">
                          ...and {parsedData.errors.length - 5} more
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {accounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Import into account</p>
                  <Select
                    value={targetAccountId}
                    onValueChange={(value) => setTargetAccountId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                          {account.isDefault ? " (Default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              !parsedData ||
              !parsedData.transactions ||
              parsedData.transactions.length === 0 ||
              !targetAccountId ||
              isProcessing
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>Import {parsedData?.successfulRows || 0} Transactions</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

