import { Skeleton } from "@/components/ui/Skeleton";

export default function PortailLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden select-none animate-fade-in">
      {/* Grille de fond IT */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0" />

      {/* Header Portail Skeleton */}
      <header className="h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9" />
          <div className="border-l border-slate-200 pl-3 ml-2">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <Skeleton className="h-4 w-28 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20 relative z-10">
        <div className="w-full max-w-[1000px] flex flex-col items-center text-center mb-12 mt-8">
          <Skeleton className="h-6 w-52 mb-4" />
          <Skeleton className="h-10 w-96 mb-3" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* 3 Applications Grid Skeletons */}
        <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col bg-white border border-slate-200 shadow-sm rounded-none border-t-4 border-t-slate-300 overflow-hidden"
            >
              <div className="p-6 pb-4">
                <Skeleton className="w-12 h-12 mb-4" />
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <div className="mt-auto px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
