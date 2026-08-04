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
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input 
          placeholder="Pesquisar arquivos em toda a empresa..." 
          className="pl-9 bg-zinc-900 border-zinc-800 text-white w-full"
          defaultValue={currentSearch}
          onChange={(e) => {
            // Debounce simples para a busca
            const timeoutId = setTimeout(() => {
              updateFilters('q', e.target.value)
            }, 500)
            return () => clearTimeout(timeoutId)
          }}
        />
      </div>
      
      <select 
        className="h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-white text-sm"
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
