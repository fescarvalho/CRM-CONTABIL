'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FolderSymlink } from 'lucide-react'
import { moverDocumentosEmMassa } from '@/app/actions/files'

type Pasta = {
  id: string
  nome: string
  parentId: string | null
}

type MoverEmMassaModalProps = {
  empresaId: string
  docIds: string[]
  pastas: Pasta[]
  onSuccess: () => void
}

export function MoverEmMassaModal({ empresaId, docIds, pastas, onSuccess }: MoverEmMassaModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  
  const getCaminhoPasta = (pasta: Pasta): string => {
    let caminho = pasta.nome
    let parent = pastas.find(p => p.id === pasta.parentId)
    while (parent) {
      caminho = parent.nome + ' / ' + caminho
      parent = pastas.find(p => p.id === parent?.parentId)
    }
    return caminho
  }

  const pastasComCaminho = pastas.map(p => ({
    id: p.id,
    caminho: getCaminhoPasta(p)
  })).sort((a, b) => a.caminho.localeCompare(b.caminho))

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    formData.append('empresaId', empresaId)
    // Adiciona cada ID ao formData
    docIds.forEach(id => {
      formData.append('docIds', id)
    })
    
    try {
      await moverDocumentosEmMassa(formData)
      setOpen(false)
      onSuccess()
    } catch (e: any) {
      alert(e.message || 'Erro ao mover arquivos')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <FolderSymlink className="w-4 h-4 mr-2" /> Mover Selecionados
        </Button>
      }>
        Mover Selecionados
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Mover Múltiplos Arquivos</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="pastaId">Selecione a Pasta de Destino</Label>
            <select 
              id="pastaId" 
              name="pastaId" 
              className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-white"
            >
              <option value="root">Raiz da Empresa</option>
              {pastasComCaminho.map(p => (
                <option key={p.id} value={p.id}>{p.caminho}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
            {isPending ? 'Movendo...' : `Mover ${docIds.length} arquivo(s)`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
