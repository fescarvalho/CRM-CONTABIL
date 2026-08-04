'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FolderSymlink, Check } from 'lucide-react'
import { moverPasta } from '@/app/actions/files'

type Pasta = {
  id: string
  nome: string
  parentId: string | null
}

type Props = {
  empresaId: string
  pastaId: string
  pastas: Pasta[]
}

export function MoverPastaModal({ empresaId, pastaId, pastas }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Filtra as pastas disponíveis para destino
  // Regra básica: Não pode mover para si mesma.
  // Regra extra anti-loop: não pode mover para uma pasta que seja filha/neta dela mesma.
  const getSubFoldersIds = (id: string, allFolders: Pasta[]): string[] => {
    const children = allFolders.filter(f => f.parentId === id)
    let ids = children.map(c => c.id)
    children.forEach(c => {
      ids = [...ids, ...getSubFoldersIds(c.id, allFolders)]
    })
    return ids
  }

  const invalidDestinations = [pastaId, ...getSubFoldersIds(pastaId, pastas)]
  const pastasDisponiveis = pastas.filter(p => !invalidDestinations.includes(p.id))

  const handleMover = async (destinoId: string) => {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.append('id', pastaId)
      formData.append('empresaId', empresaId)
      formData.append('parentId', destinoId)
      await moverPasta(formData)
      setOpen(false)
    } catch (error) {
      alert('Erro ao mover pasta')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Mover Pasta" className="text-zinc-500 hover:text-blue-400 transition-colors">
          <FolderSymlink className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800 text-white max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mover Pasta para...</DialogTitle>
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
