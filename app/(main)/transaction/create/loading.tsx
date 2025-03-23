import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionCreateLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Form Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Receipt Scanner Skeleton */}
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

