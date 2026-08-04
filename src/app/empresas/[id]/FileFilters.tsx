'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCallback, useTransition } from 'react'

export function FileFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('q') || ''
  const currentSort = searchParams.get('sort') || 'name_asc'

  const updateFilters = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [pathname, router, searchParams])

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
      <div className="relative flex-1 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input 
          placeholder="Pesquisar pastas e arquivos em toda a empresa..." 
          className="h-9 pl-9 bg-zinc-900/50 border-zinc-800/80 text-white w-full rounded-full shadow-inner focus-visible:ring-primary/30 transition-all hover:bg-zinc-900 text-sm"
          defaultValue={currentSearch}
          onChange={(e) => {
            const timeoutId = setTimeout(() => {
              updateFilters('q', e.target.value)
            }, 300)
            return () => clearTimeout(timeoutId)
          }}
        />
      </div>
      
      <select 
        className="h-9 px-3 py-0 rounded-full bg-zinc-900/50 border border-zinc-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 text-white text-sm transition-all hover:bg-zinc-900 cursor-pointer"
        value={currentSort}
        onChange={(e) => updateFilters('sort', e.target.value)}
      >
        <option value="name_asc">Nome (A - Z)</option>
        <option value="name_desc">Nome (Z - A)</option>
        <option value="date_desc">Mais recentes</option>
        <option value="date_asc">Mais antigos</option>
        <option value="size_desc">Maior tamanho</option>
        <option value="size_asc">Menor tamanho</option>
      </select>
    </div>
  )
}
