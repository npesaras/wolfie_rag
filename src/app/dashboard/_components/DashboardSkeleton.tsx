import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="relative w-full">
      <div className="relative z-10">
        <div className="space-y-10 pb-8">
          {/* Welcome Section Skeleton */}
          <div className="bg-gradient-to-br from-primary/5 to-sidebar/5 rounded-xl p-8 border border-primary/10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-12 w-64 md:w-96" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
              <Skeleton className="h-20 w-20 rounded-full opacity-20" />
            </div>
          </div>

          {/* Dashboard Cards Grid Skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm h-[200px] p-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
