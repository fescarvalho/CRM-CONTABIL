'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit } from 'lucide-react'
import { renamePasta } from '@/app/actions/files'

type RenomearPastaModalProps = {
  empresaId: string
  pasta: {
    id: string
    nome: string
  }
}

export function RenomearPastaModal({ empresaId, pasta }: RenomearPastaModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    formData.append('id', pasta.id)
    formData.append('empresaId', empresaId)
    
    try {
      await renamePasta(formData)
      setOpen(false)
    } catch (e: any) {
      alert(e.message || 'Erro ao renomear pasta')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white transition-colors" title="Renomear">
          <Edit className="w-4 h-4" />
        </Button>
      }>
        Renomear
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Renomear Pasta</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Novo Nome da Pasta</Label>
            <Input 
              id="nome" 
              name="nome" 
              required 
              defaultValue={pasta.nome}
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
