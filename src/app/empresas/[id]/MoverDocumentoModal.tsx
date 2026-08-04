'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FolderSymlink } from 'lucide-react'
import { moverDocumento } from '@/app/actions/files'

type Pasta = {
  id: string
  nome: string
  parentId: string | null
}

type MoverDocumentoModalProps = {
  empresaId: string
  documentoId: string
  currentPastaId: string | null
  pastas: Pasta[]
}

export function MoverDocumentoModal({ empresaId, documentoId, currentPastaId, pastas }: MoverDocumentoModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  
  // Função auxiliar para construir o caminho completo da pasta
  const getCaminhoPasta = (pasta: Pasta): string => {
    let caminho = pasta.nome
    let parent = pastas.find(p => p.id === pasta.parentId)
    while (parent) {
      caminho = parent.nome + ' / ' + caminho
      parent = pastas.find(p => p.id === parent?.parentId)
    }
    return caminho
  }

  // Ordena por caminho alfabético para exibir bonito no select
  const pastasComCaminho = pastas.map(p => ({
    id: p.id,
    caminho: getCaminhoPasta(p)
  })).sort((a, b) => a.caminho.localeCompare(b.caminho))

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    formData.append('id', documentoId)
    formData.append('empresaId', empresaId)
    
    try {
      await moverDocumento(formData)
      setOpen(false)
    } catch (e: any) {
      alert(e.message || 'Erro ao mover arquivo')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-blue-400 transition-colors" title="Mover">
          <FolderSymlink className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Mover Arquivo</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="pastaId">Selecione a Pasta de Destino</Label>
            <select 
              id="pastaId" 
              name="pastaId" 
              className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-white"
              defaultValue={currentPastaId || 'root'}
            >
              <option value="root">Raiz da Empresa</option>
              {pastasComCaminho.map(p => (
                <option key={p.id} value={p.id}>{p.caminho}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
            {isPending ? 'Movendo...' : 'Confirmar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
