import {
  PageHeaderSkeleton,
  StatCardsGridSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto w-full animate-fade-in">
      <PageHeaderSkeleton />

      {/* KPI Cards Grid Skeleton */}
      <StatCardsGridSkeleton count={4} />

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex flex-col gap-4">
          <Skeleton className="h-6 w-36 mb-2" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
