'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Search, FileText, Loader2, FolderOpen, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { buscarDocumentosGlobais } from '@/app/actions/dashboard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type SearchResult = {
  id: string
  nome: string
  tamanhoBytes: number
  criadoEm: Date
  pastaId: string | null
  empresa: {
    id: string
    razaoSocial: string
  }
  pasta: {
    id: string
    nome: string
  } | null
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await buscarDocumentosGlobais(query)
          setResults(res as unknown as SearchResult[])
          setIsOpen(true)
        } catch (e) {
          console.error(e)
        }
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input 
          type="text" 
          placeholder="Busca global de documentos..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50 placeholder:text-zinc-500 rounded-full h-10 w-full shadow-inner"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">
              Nenhum documento encontrado.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto flex flex-col">
              <div className="px-3 py-2 bg-zinc-900/50 text-xs font-semibold tracking-wider text-zinc-500 uppercase border-b border-zinc-800/50">
                Resultados
              </div>
              {results.map((doc) => (
                <Link 
                  key={doc.id} 
                  href={`/empresas/${doc.empresa.id}${doc.pastaId ? `?folder=${doc.pastaId}` : ''}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-900/50 transition-colors border-b border-zinc-800/30 last:border-0 group"
                >
                  <FileText className="w-8 h-8 p-1.5 rounded bg-red-500/10 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-primary transition-colors">
                      {doc.nome}
                    </span>
                    <span className="text-xs text-zinc-500 truncate flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {doc.empresa.razaoSocial} {doc.pasta ? `/ ${doc.pasta.nome}` : ''}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
