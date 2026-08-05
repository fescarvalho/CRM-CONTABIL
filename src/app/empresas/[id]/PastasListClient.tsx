'use client'

import { useState } from 'react'
import { Folder, CheckSquare, Square, Trash2, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { MoverPastaModal } from './MoverPastaModal'
import { RenomearPastaModal } from './RenomearPastaModal'
import { DeleteFolderButton } from './DeleteFolderButton'
import { MoverPastasEmMassaModal } from './MoverPastasEmMassaModal'
import { excluirPasta, restaurarPasta, excluirPastaPermanente, moverDocumento } from '@/app/actions/files'
import { Button } from '@/components/ui/button'

type Pasta = {
  id: string
  nome: string
  parentId: string | null
}

type Props = {
  empresaId: string
  pastas: Pasta[]
  todasPastas: Pasta[]
  hasDocumentos: boolean
  isLixeira?: boolean
  onNavigate?: (id: string) => void
}

export function PastasListClient({ empresaId, pastas, todasPastas, hasDocumentos, isLixeira, onNavigate }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleRestaurar = async (id: string) => {
    if (!confirm('Deseja restaurar esta pasta e seu conteúdo para o local original?')) return
    setLoadingId(id)
    try {
      await restaurarPasta(id, empresaId)
    } finally {
      setLoadingId(null)
    }
  }

  const handleExcluirPermanente = async (id: string) => {
    if (!confirm('ATENÇÃO: Isso excluirá permanentemente a pasta. Essa ação não pode ser desfeita. Continuar?')) return
    setLoadingId(id)
    try {
      await excluirPastaPermanente(id, empresaId)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDragOver = (e: React.DragEvent, pastaId: string) => {
    if (isLixeira) return
    e.preventDefault() // Permite soltar
    if (dragOverId !== pastaId) {
      setDragOverId(pastaId)
    }
  }

  const handleDragLeave = (e: React.DragEvent, pastaId: string) => {
    if (isLixeira) return
    e.preventDefault()
    if (dragOverId === pastaId) {
      setDragOverId(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, pastaId: string) => {
    if (isLixeira) return
    e.preventDefault()
    setDragOverId(null)
    
    const docId = e.dataTransfer.getData('application/x-documento-id')
    if (docId) {
      setLoadingId(pastaId)
      try {
        const formData = new FormData()
        formData.append('id', docId)
        formData.append('empresaId', empresaId)
        formData.append('pastaId', pastaId)
        await moverDocumento(formData)
      } catch (err) {
        alert('Erro ao mover documento')
      } finally {
        setLoadingId(null)
      }
    }
  }

  if (pastas.length === 0) {
    if (!hasDocumentos && !isLixeira) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          Esta pasta está vazia.
        </div>
      )
    }
    return null
  }

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === pastas.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pastas.map(p => p.id))
    }
  }

  return (
    <div className="flex flex-col">
      {/* Barra de Ações em Massa */}
      {!isLixeira && selectedIds.length > 0 && (
        <div className="bg-blue-900/20 border-b border-blue-500/20 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-400">
            {selectedIds.length} {selectedIds.length === 1 ? 'pasta selecionada' : 'pastas selecionadas'}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedIds([])} className="text-sm text-zinc-400 hover:text-white px-2">
              Cancelar
            </button>
            <MoverPastasEmMassaModal 
              empresaId={empresaId}
              pastaIds={selectedIds}
              pastas={todasPastas}
              onSuccess={() => setSelectedIds([])}
            />
          </div>
        </div>
      )}

      {/* Cabeçalho da Lista de Pastas */}
      <div className="flex items-center px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/20">
        {!isLixeira && (
          <button onClick={toggleAll} className="mr-3 text-zinc-500 hover:text-blue-400 transition-colors focus:outline-none">
            {selectedIds.length === pastas.length && pastas.length > 0 ? (
              <CheckSquare className="w-5 h-5 text-blue-400" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        )}
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex-1">Pastas</span>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {pastas.map(pasta => {
          const isSelected = selectedIds.includes(pasta.id)
          const isDragTarget = dragOverId === pasta.id
          
          return (
            <div 
              key={pasta.id} 
              onDragOver={(e) => handleDragOver(e, pasta.id)}
              onDragLeave={(e) => handleDragLeave(e, pasta.id)}
              onDrop={(e) => handleDrop(e, pasta.id)}
              className={`flex items-center justify-between p-4 transition-colors group 
                ${isSelected ? 'bg-blue-500/5' : 'hover:bg-muted/50'} 
                ${loadingId === pasta.id ? 'opacity-50' : ''}
                ${isDragTarget ? 'bg-blue-500/20 ring-2 ring-blue-500/50 ring-inset' : ''}
              `}
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                {!isLixeira && (
                  <button onClick={(e) => toggleSelection(pasta.id, e)} className="text-zinc-500 hover:text-blue-400 transition-colors focus:outline-none z-10">
                    {isSelected ? <CheckSquare className="w-5 h-5 text-blue-400" /> : <Square className="w-5 h-5" />}
                  </button>
                )}
                {isLixeira ? (
                  <div className="flex items-center gap-3">
                    <Folder className={`w-5 h-5 ${isDragTarget ? 'text-blue-400' : 'text-zinc-500'}`} />
                    <span className="font-medium truncate text-white">{pasta.nome}</span>
                  </div>
                ) : onNavigate ? (
                  <button onClick={() => onNavigate(pasta.id)} className="flex items-center gap-3 flex-1 overflow-hidden text-left focus:outline-none">
                    <Folder className={`w-5 h-5 flex-shrink-0 transition-colors ${isDragTarget ? 'text-white fill-blue-500/20' : 'text-blue-500'}`} />
                    <span className={`font-medium truncate transition-colors ${isDragTarget ? 'text-blue-400' : 'text-white'}`}>{pasta.nome}</span>
                  </button>
                ) : (
                  <Link href={`/empresas/${empresaId}?folder=${pasta.id}`} className="flex items-center gap-3 flex-1 overflow-hidden">
                    <Folder className={`w-5 h-5 flex-shrink-0 transition-colors ${isDragTarget ? 'text-white fill-blue-500/20' : 'text-blue-500'}`} />
                    <span className={`font-medium truncate transition-colors ${isDragTarget ? 'text-blue-400' : 'text-white'}`}>{pasta.nome}</span>
                  </Link>
                )}
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isLixeira ? (
                  <>
                    <Button variant="ghost" size="icon" title="Restaurar" onClick={() => handleRestaurar(pasta.id)} disabled={!!loadingId} className="text-zinc-500 hover:text-green-500">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir Definitivamente" onClick={() => handleExcluirPermanente(pasta.id)} disabled={!!loadingId} className="text-zinc-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <MoverPastaModal 
                      empresaId={empresaId} 
                      pastaId={pasta.id} 
                      pastas={todasPastas} 
                    />
                    <RenomearPastaModal empresaId={empresaId} pasta={pasta} />
                    <form action={excluirPasta}>
                      <input type="hidden" name="id" value={pasta.id} />
                      <input type="hidden" name="empresaId" value={empresaId} />
                      <DeleteFolderButton />
                    </form>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
