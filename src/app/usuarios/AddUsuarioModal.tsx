'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { criarUsuarioAdmin } from '@/app/actions/usuarios'

export function AddUsuarioModal() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    setError('')
    try {
      await criarUsuarioAdmin(formData)
      setOpen(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Criar Usuário</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-5 mt-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive-foreground">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-zinc-300">Nome</Label>
            <Input id="nome" name="nome" required className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
            <Input id="email" name="email" type="email" required className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Senha Provisória</Label>
            <Input id="password" name="password" type="password" required className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-zinc-300">Nível de Acesso</Label>
            <select id="role" name="role" required className="w-full h-10 px-3 rounded-md bg-zinc-900/50 border border-zinc-800 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <option value="CONTADOR">Usuário Comum</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mt-4" disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar Conta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
