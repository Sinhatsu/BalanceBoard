"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { exportTransactionsToCSV } from "@/actions/export";
import { toast } from "sonner";

interface ExportDataProps {
  accountId?: string;
}

export default function ExportData({ accountId }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await exportTransactionsToCSV(accountId);

      if (result.success) {
        // Create blob and download
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Transactions exported successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}

