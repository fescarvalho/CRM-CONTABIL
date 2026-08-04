'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FolderSymlink } from 'lucide-react'
import { moverPastasEmMassa } from '@/app/actions/files'

type Pasta = {
  id: string
  nome: string
  parentId: string | null
}

type Props = {
  empresaId: string
  pastaIds: string[]
  pastas: Pasta[]
  onSuccess: () => void
}

export function MoverPastasEmMassaModal({ empresaId, pastaIds, pastas, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Previne loop infinito:
  // 1. Não pode mover para nenhuma das pastas que estão sendo movidas
  // 2. Não pode mover para dentro de NENHUMA subpasta de NENHUMA das pastas que estão sendo movidas
  const getSubFoldersIds = (ids: string[], allFolders: Pasta[]): string[] => {
    let currentIds = [...ids]
    let allFound = [...ids]
    let keepSearching = true

    while (keepSearching) {
      const children = allFolders.filter(f => currentIds.includes(f.parentId as string))
      if (children.length === 0) {
        keepSearching = false
      } else {
        const newIds = children.map(c => c.id).filter(id => !allFound.includes(id))
        if (newIds.length === 0) {
          keepSearching = false
        } else {
          allFound = [...allFound, ...newIds]
          currentIds = newIds
        }
      }
    }
    return allFound
  }

  const invalidDestinations = getSubFoldersIds(pastaIds, pastas)
  const pastasDisponiveis = pastas.filter(p => !invalidDestinations.includes(p.id))

  const handleMover = async (destinoId: string) => {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.append('empresaId', empresaId)
      formData.append('parentId', destinoId)
      pastaIds.forEach(id => formData.append('pastaIds', id))
      
      await moverPastasEmMassa(formData)
      setOpen(false)
      onSuccess()
    } catch (error) {
      alert('Erro ao mover pastas')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="secondary" size="sm" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700">
          <FolderSymlink className="w-4 h-4 mr-2" /> Mover
        </Button>
      }>
        Mover
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800 text-white max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mover {pastaIds.length} pastas para...</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2 mt-4 pr-2">
          {/* Opção para mover para a raiz */}
          <button
            onClick={() => handleMover('root')}
            disabled={isPending}
            className="w-full flex items-center justify-between p-3 rounded-md bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-left disabled:opacity-50"
          >
            <span className="text-sm font-medium text-zinc-300">🏢 Raiz da Empresa</span>
          </button>

          {pastasDisponiveis.map(p => (
            <button
              key={p.id}
              onClick={() => handleMover(p.id)}
              disabled={isPending}
              className="w-full flex items-center justify-between p-3 rounded-md bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-300">{p.nome}</span>
              </div>
            </button>
          ))}

          {pastasDisponiveis.length === 0 && (
            <div className="text-sm text-zinc-500 text-center p-4">
              Nenhuma outra pasta disponível.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
