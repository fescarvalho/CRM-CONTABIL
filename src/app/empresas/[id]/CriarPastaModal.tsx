'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { criarPasta } from '@/app/actions/files'

type Props = {
  empresaId: string
  currentFolderId?: string
}

export function CriarPastaModal({ empresaId, currentFolderId }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    try {
      await criarPasta(formData)
      setOpen(false)
    } catch (e) {
      alert('Erro ao criar pasta.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Nova Pasta</Button>
      }>
        Nova Pasta
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Criar Nova Pasta</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-4">
          <input type="hidden" name="empresaId" value={empresaId} />
          {currentFolderId && <input type="hidden" name="parentId" value={currentFolderId} />}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Pasta</Label>
            <Input id="nome" name="nome" required className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50" />
          </div>
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
            {isPending ? 'Criando...' : 'Criar Pasta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
