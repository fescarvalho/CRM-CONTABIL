'use client'

import { useState } from 'react'
import { Folder, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'
import { MoverPastaModal } from './MoverPastaModal'
import { RenomearPastaModal } from './RenomearPastaModal'
import { DeleteFolderButton } from './DeleteFolderButton'
import { MoverPastasEmMassaModal } from './MoverPastasEmMassaModal'
import { excluirPasta } from '@/app/actions/files'

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
}

export function PastasListClient({ empresaId, pastas, todasPastas, hasDocumentos }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  if (pastas.length === 0) {
    if (!hasDocumentos) {
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
      {selectedIds.length > 0 && (
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
        <button onClick={toggleAll} className="mr-3 text-zinc-500 hover:text-blue-400 transition-colors focus:outline-none">
          {selectedIds.length === pastas.length && pastas.length > 0 ? (
            <CheckSquare className="w-5 h-5 text-blue-400" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex-1">Pastas</span>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {pastas.map(pasta => {
          const isSelected = selectedIds.includes(pasta.id)
          return (
            <div 
              key={pasta.id} 
              className={`flex items-center justify-between p-4 transition-colors group ${isSelected ? 'bg-blue-500/5' : 'hover:bg-muted/50'}`}
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <button onClick={(e) => toggleSelection(pasta.id, e)} className="text-zinc-500 hover:text-blue-400 transition-colors focus:outline-none z-10">
                  {isSelected ? <CheckSquare className="w-5 h-5 text-blue-400" /> : <Square className="w-5 h-5" />}
                </button>
                <Link href={`/empresas/${empresaId}?folder=${pasta.id}`} className="flex items-center gap-3 flex-1 overflow-hidden">
                  <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium truncate">{pasta.nome}</span>
                </Link>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
