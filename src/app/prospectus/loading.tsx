import { Skeleton } from "@/components/ui/skeleton";

export default function ProspectusLoading() {
  return (
    <div className="relative w-full">
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm h-[250px] p-6 flex flex-col">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-auto" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
