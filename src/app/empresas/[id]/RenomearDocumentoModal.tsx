'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit } from 'lucide-react'
import { renomearDocumento } from '@/app/actions/files'

type Props = {
  empresaId: string
  documentoId: string
  nomeAtual: string
}

export function RenomearDocumentoModal({ empresaId, documentoId, nomeAtual }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    formData.append('id', documentoId)
    formData.append('empresaId', empresaId)
    
    try {
      await renomearDocumento(formData)
      setOpen(false)
    } catch (e: any) {
      alert(e.message || 'Erro ao renomear arquivo')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-blue-500 transition-colors" title="Renomear">
          <Edit className="w-4 h-4" />
        </Button>
      }>
        Renomear
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Renomear Arquivo</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Novo Nome do Arquivo</Label>
            <Input 
              id="nome" 
              name="nome" 
              required 
              defaultValue={nomeAtual}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50" 
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
