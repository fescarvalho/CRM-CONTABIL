'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadProvider } from './UploadContext'
import { GlobalDropzone } from './GlobalDropzone'
import { CriarPastaModal } from './CriarPastaModal'
import { UploadDocumentoModal } from './UploadDocumentoModal'
import { PastasListClient } from './PastasListClient'
import { DocumentosListClient } from './DocumentosListClient'
import { formatCNPJ } from '@/lib/utils'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Empresa = { id: string, razaoSocial: string, cnpj: string }
type Pasta = { id: string, nome: string, parentId: string | null }
type Documento = { id: string, nome: string, urlStorage: string, tamanhoBytes: number, pastaId: string | null, criadoEm: string, tags?: string[] }

type Props = {
  empresa: Empresa
  todasPastas: Pasta[]
  todosDocumentos: Documento[]
  isLixeira: boolean
  initialFolderId: string | null
  initialSearch: string
  initialSort: string
}

export function FileManagerClient({ empresa, todasPastas, todosDocumentos, isLixeira, initialFolderId, initialSearch, initialSort }: Props) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortQuery, setSortQuery] = useState(initialSort)

  // Sync URL on state change
  useEffect(() => {
    const url = new URL(window.location.href)
    let changed = false

    if (currentFolderId !== url.searchParams.get('folder')) {
      if (currentFolderId) url.searchParams.set('folder', currentFolderId)
      else url.searchParams.delete('folder')
      changed = true
    }

    if (searchQuery !== (url.searchParams.get('q') || '')) {
      if (searchQuery) url.searchParams.set('q', searchQuery)
      else url.searchParams.delete('q')
      changed = true
    }
    
    if (sortQuery !== (url.searchParams.get('sort') || 'name_asc')) {
      if (sortQuery !== 'name_asc') url.searchParams.set('sort', sortQuery)
      else url.searchParams.delete('sort')
      changed = true
    }

    if (changed) {
      window.history.pushState({}, '', url.toString())
    }
  }, [currentFolderId, searchQuery, sortQuery])

  // Listen to browser Back/Forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setCurrentFolderId(params.get('folder'))
      setSearchQuery(params.get('q') || '')
      setSortQuery(params.get('sort') || 'name_asc')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const isGlobalSearch = !!searchQuery

  // Filtragem Local Instântanea
  const pastasFiltradas = useMemo(() => {
    let result = todasPastas
    if (isGlobalSearch) {
      result = result.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    } else {
      result = result.filter(p => p.parentId === currentFolderId)
    }
    return result.sort((a, b) => a.nome.localeCompare(b.nome))
  }, [todasPastas, currentFolderId, isGlobalSearch, searchQuery])

  const documentosFiltrados = useMemo(() => {
    let result = todosDocumentos
    if (isGlobalSearch) {
      result = result.filter(d => d.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    } else {
      result = result.filter(d => d.pastaId === currentFolderId)
    }

    // Sort
    result.sort((a, b) => {
      if (sortQuery === 'name_desc') return b.nome.localeCompare(a.nome)
      if (sortQuery === 'date_desc') return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      if (sortQuery === 'date_asc') return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
      if (sortQuery === 'size_desc') return b.tamanhoBytes - a.tamanhoBytes
      if (sortQuery === 'size_asc') return a.tamanhoBytes - b.tamanhoBytes
      return a.nome.localeCompare(b.nome) // name_asc
    })

    return result
  }, [todosDocumentos, currentFolderId, isGlobalSearch, searchQuery, sortQuery])

  // Breadcrumb
  const breadcrumbs = useMemo(() => {
    let crumbs: { id: string, nome: string }[] = []
    if (currentFolderId) {
      let curr = todasPastas.find(p => p.id === currentFolderId)
      while (curr) {
        crumbs.unshift({ id: curr.id, nome: curr.nome })
        if (curr.parentId) {
          curr = todasPastas.find(p => p.id === curr?.parentId)
        } else {
          break
        }
      }
    }
    return crumbs
  }, [currentFolderId, todasPastas])

  const handleVoltar = () => {
    if (isGlobalSearch) {
      setSearchQuery('')
      return
    }
    if (currentFolderId) {
      const currentFolder = todasPastas.find(p => p.id === currentFolderId)
      setCurrentFolderId(currentFolder?.parentId || null)
    }
  }

  return (
    <UploadProvider>
      <GlobalDropzone>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{empresa.razaoSocial} {isLixeira && <span className="text-red-500 ml-2">(Lixeira)</span>}</h1>
                <p className="text-muted-foreground mt-1">CNPJ: {formatCNPJ(empresa.cnpj)}</p>
                
                <div className="flex items-center gap-3 mt-4">
                  {(currentFolderId || isGlobalSearch) ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleVoltar} 
                      className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full px-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> 
                      {isGlobalSearch ? 'Limpar Pesquisa' : '⬅ Voltar uma pasta'}
                    </Button>
                  ) : (
                    <Link href="/empresas">
                      <Button variant="secondary" size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full px-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Empresas
                      </Button>
                    </Link>
                  )}
                  
                  {!isLixeira && !isGlobalSearch && currentFolderId && (
                    <span className="text-sm text-zinc-500 font-medium">
                      📁 {breadcrumbs.map(b => b.nome).join(' / ')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                {isLixeira ? (
                  <Link prefetch={true} href={`/empresas/${empresa.id}`}>
                    <Button variant="outline" className="border-zinc-700">
                      Voltar para Arquivos
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link prefetch={true} href={`/empresas/${empresa.id}?lixeira=true`}>
                      <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" /> Lixeira
                      </Button>
                    </Link>
                    <CriarPastaModal empresaId={empresa.id} currentFolderId={currentFolderId || undefined} />
                    <UploadDocumentoModal empresaId={empresa.id} pastaId={currentFolderId || undefined} />
                  </>
                )}
              </div>
            </div>

            {!isLixeira && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input 
                    placeholder="Pesquisar pastas e arquivos em toda a empresa..." 
                    className="h-9 pl-9 bg-zinc-900/50 border-zinc-800/80 text-white w-full rounded-full shadow-inner focus-visible:ring-primary/30 transition-all hover:bg-zinc-900 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select 
                  className="h-9 px-3 py-0 rounded-full bg-zinc-900/50 border border-zinc-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 text-white text-sm transition-all hover:bg-zinc-900 cursor-pointer"
                  value={sortQuery}
                  onChange={(e) => setSortQuery(e.target.value)}
                >
                  <option value="name_asc">Nome (A - Z)</option>
                  <option value="name_desc">Nome (Z - A)</option>
                  <option value="date_desc">Mais recentes</option>
                  <option value="date_asc">Mais antigos</option>
                  <option value="size_desc">Maior tamanho</option>
                  <option value="size_asc">Menor tamanho</option>
                </select>
              </div>
            )}

            <div className="border rounded-lg bg-card overflow-hidden">
              <PastasListClient 
                empresaId={empresa.id}
                pastas={pastasFiltradas}
                todasPastas={todasPastas}
                hasDocumentos={documentosFiltrados.length > 0}
                isLixeira={isLixeira}
                onNavigate={(id) => { setCurrentFolderId(id); setSearchQuery('') }}
              />
              
              <DocumentosListClient 
                empresaId={empresa.id}
                documentos={documentosFiltrados.map(d => ({
                  ...d,
                  pastaNome: (isGlobalSearch || isLixeira) && d.pastaId ? todasPastas.find(p => p.id === d.pastaId)?.nome : undefined
                }))}
                todasPastas={todasPastas}
                isLixeira={isLixeira}
              />
            </div>
          </div>
        </div>
      </GlobalDropzone>
    </UploadProvider>
  )
}
