import { Skeleton } from "@/components/ui/skeleton"

export default function EmpresaLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Botão Voltar */}
        <Skeleton className="h-9 w-40 bg-zinc-800/50" />

        {/* Header (Título e botões) */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 bg-zinc-800/50" />
            <Skeleton className="h-4 w-40 bg-zinc-800/50" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-4 w-12 bg-zinc-800/50" />
              <Skeleton className="h-4 w-24 bg-zinc-800/50" />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Skeleton className="h-10 w-28 bg-zinc-800/50" />
            <Skeleton className="h-10 w-32 bg-zinc-800/50" />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full max-w-sm bg-zinc-800/50" />
          <Skeleton className="h-10 w-32 bg-zinc-800/50" />
        </div>

        {/* Tabela/Lista */}
        <div className="border border-zinc-800/50 rounded-lg bg-zinc-950/40 overflow-hidden shadow-xl">
          <div className="bg-zinc-900/50 p-4 border-b border-zinc-800/50 flex gap-4">
            <Skeleton className="h-5 w-5 bg-zinc-800/50" />
            <Skeleton className="h-5 w-1/3 bg-zinc-800/50" />
            <Skeleton className="h-5 w-24 ml-auto bg-zinc-800/50" />
          </div>
          
          <div className="divide-y divide-zinc-800/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-8 w-8 rounded bg-zinc-800/50" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2 bg-zinc-800/50" />
                  <Skeleton className="h-3 w-32 bg-zinc-800/50" />
                </div>
                <Skeleton className="h-8 w-8 rounded bg-zinc-800/50" />
                <Skeleton className="h-8 w-8 rounded bg-zinc-800/50" />
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  )
}
