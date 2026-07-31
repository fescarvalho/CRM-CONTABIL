'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { updateAcessos } from '@/app/actions/empresas'

type Usuario = {
  id: string
  nome: string
}

type AcessoModalProps = {
  empresaId: string
  razaoSocial: string
  usuarios: Usuario[]
  acessosAtuais: string[]
}

export function AcessosModal({ empresaId, razaoSocial, usuarios, acessosAtuais }: AcessoModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(acessosAtuais))
  const [isPending, setIsPending] = useState(false)

  const handleToggle = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleSave = async () => {
    setIsPending(true)
    try {
      await updateAcessos(empresaId, Array.from(selectedIds))
      setOpen(false)
    } catch (e) {
      console.error(e)
      alert('Erro ao salvar acessos')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          Gerenciar Acessos
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Acessos: <span className="text-primary">{razaoSocial}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {usuarios.length === 0 ? (
            <p className="text-zinc-400 text-sm">Nenhum usuário cadastrado.</p>
          ) : (
            usuarios.map(u => (
              <div key={u.id} className="flex items-center space-x-3 p-2 hover:bg-zinc-900/50 rounded-lg transition-colors cursor-pointer" onClick={() => handleToggle(u.id)}>
                <Checkbox 
                  id={`user-${u.id}`} 
                  checked={selectedIds.has(u.id)}
                  onCheckedChange={() => handleToggle(u.id)}
                  className="border-zinc-600 data-[state=checked]:bg-primary"
                />
                <label htmlFor={`user-${u.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                  {u.nome}
                </label>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50">
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white" disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Acessos'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
