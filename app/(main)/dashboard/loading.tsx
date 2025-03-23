import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 p-8 shadow-xl">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 bg-white/20" />
              <Skeleton className="h-6 w-48 bg-white/10" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32 bg-white/20" />
              <Skeleton className="h-10 w-32 bg-white/20" />
            </div>
          </div>
          <Skeleton className="h-24 w-full bg-white/20 rounded-lg" />
        </div>
      </div>

      {/* Recent Transactions & Overview Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Skeleton className="h-64 w-64 rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart Skeleton */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </CardHeader>
                </Card>
              ))}
            </div>
            {/* Chart Skeleton */}
            <Skeleton className="h-96 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout Skeleton */}
      <div className="grid gap-8 xl:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Accounts Section Skeleton */}
      <Card className="shadow-lg">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

