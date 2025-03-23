"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Lightbulb,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getSpendingInsights } from "@/actions/insights";
import { toast } from "sonner";

interface SpendingInsight {
  type: "warning" | "success" | "info" | "tip";
  title: string;
  description: string;
  category?: string;
  amount?: number;
}

interface SpendingInsightsProps {
  initialInsights: SpendingInsight[];
}

export default function SpendingInsights({ initialInsights }: SpendingInsightsProps) {
  const [insights, setInsights] = useState<SpendingInsight[]>(initialInsights);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5" />;
      case "tip":
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getVariant = (type: string): "default" | "destructive" => {
    return type === "warning" ? "destructive" : "default";
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case "warning":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "tip":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950";
    }
  };

  const getTextColorClasses = (type: string) => {
    switch (type) {
      case "warning":
        return "text-red-800 dark:text-red-200";
      case "success":
        return "text-green-800 dark:text-green-200";
      case "tip":
        return "text-blue-800 dark:text-blue-200";
      default:
        return "text-gray-800 dark:text-gray-200";
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const newInsights = await getSpendingInsights();
      setInsights(newInsights);
      toast.success("Insights refreshed");
    } catch (error: any) {
      toast.error("Failed to refresh insights");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your spending patterns
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Alert
              key={index}
              variant={getVariant(insight.type)}
              className={cn(getColorClasses(insight.type))}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={getTextColorClasses(insight.type)}>
                  {getIcon(insight.type)}
                </div>
                <AlertTitle className={cn("mb-0", getTextColorClasses(insight.type))}>
                  {insight.title}
                </AlertTitle>
              </div>
              <AlertDescription className={cn("text-sm", getTextColorClasses(insight.type))}>
                {insight.description}
              </AlertDescription>
            </Alert>
          ))}

          {insights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No insights available yet</p>
              <p className="text-xs mt-1">Add more transactions to get personalized insights</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

