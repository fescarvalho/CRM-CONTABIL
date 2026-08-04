'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCallback, useTransition } from 'react'

export function EmpresaFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('q') || ''

  const updateSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [pathname, router, searchParams])

  return (
    <div className="relative mb-8 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <Input 
        placeholder="Pesquisar por nome ou CNPJ..." 
        className="h-10 pl-9 bg-zinc-900/50 border-zinc-800/80 text-white rounded-full shadow-inner focus-visible:ring-primary/30 transition-all hover:bg-zinc-900"
        defaultValue={currentSearch}
        onChange={(e) => {
          const timeoutId = setTimeout(() => {
            updateSearch(e.target.value)
          }, 300)
          return () => clearTimeout(timeoutId)
        }}
      />
    </div>
  )
}
