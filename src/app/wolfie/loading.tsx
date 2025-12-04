import { Skeleton } from "@/components/ui/skeleton";

export default function WolfieLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Welcome Message Skeleton */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="flex-shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-[60px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
