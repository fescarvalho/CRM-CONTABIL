import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8 relative overflow-hidden">
      {/* Background Decorativo - estático para não piscar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 shadow-xl">
          <div>
            <Skeleton className="h-9 w-48 mb-2 bg-zinc-800/50" />
            <Skeleton className="h-5 w-64 bg-zinc-800/50" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 bg-zinc-800/50" />
            <Skeleton className="h-10 w-24 bg-zinc-800/50" />
          </div>
        </div>

        {/* Global Search Skeleton */}
        <div className="flex justify-center w-full">
          <Skeleton className="h-10 w-full max-w-md rounded-full bg-zinc-800/50" />
        </div>

        {/* ADMIN Stats Skeleton */}
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/50 shadow-xl rounded-xl p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 bg-zinc-800/50" />
                <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800/50" />
              </div>
              <Skeleton className="h-9 w-16 mt-2 bg-zinc-800/50" />
            </div>
          ))}
        </div>

        {/* Lista de Empresas Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary/30 rounded-full"></div>
            <Skeleton className="h-7 w-48 bg-zinc-800/50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-950/40 backdrop-blur-md border border-zinc-800/50 rounded-xl">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-zinc-800/50" />
                  <Skeleton className="h-3 w-24 bg-zinc-800/50" />
                </div>
                <Skeleton className="h-8 w-20 bg-zinc-800/50" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
