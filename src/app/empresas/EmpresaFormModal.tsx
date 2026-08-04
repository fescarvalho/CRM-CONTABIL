'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Building2 } from 'lucide-react'
import { createEmpresa, updateEmpresa } from '@/app/actions/empresas'
import { formatCNPJ, cleanCNPJ } from '@/lib/utils'

type EmpresaFormModalProps = {
  empresa?: {
    id: string
    razaoSocial: string
    cnpj: string
    status: string
  }
}

export function EmpresaFormModal({ empresa }: EmpresaFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [cnpjValue, setCnpjValue] = useState(empresa ? formatCNPJ(empresa.cnpj) : '')

  const isEditing = !!empresa

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Apenas limpa a view e aplica máscara
    const formatted = formatCNPJ(e.target.value)
    setCnpjValue(formatted)
  }

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    
    // Sobrescreve o cnpj do formData com a versão limpa
    formData.set('cnpj', cleanCNPJ(cnpjValue))
    if (empresa) {
      formData.append('id', empresa.id)
    }

    try {
      if (isEditing) {
        await updateEmpresa(formData)
      } else {
        await createEmpresa(formData)
      }
      setOpen(false)
      if (!isEditing) {
        setCnpjValue('')
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao salvar empresa')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        isEditing ? (
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
        ) : (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
            Nova Empresa
          </Button>
        )
      }>
        {isEditing ? 'Editar' : 'Nova Empresa'}
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            {isEditing ? 'Editar Empresa' : 'Cadastrar Empresa'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="razaoSocial" className="text-zinc-300">Razão Social</Label>
            <Input 
              id="razaoSocial" 
              name="razaoSocial" 
              required 
              defaultValue={empresa?.razaoSocial}
              className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj" className="text-zinc-300">CNPJ (Alfanumérico)</Label>
            <Input 
              id="cnpj" 
              name="cnpj" 
              required 
              value={cnpjValue}
              onChange={handleCnpjChange}
              maxLength={18}
              placeholder="00.000.000/0000-00"
              className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50 font-mono" 
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-zinc-300">Status</Label>
              <select 
                id="status" 
                name="status" 
                defaultValue={empresa.status}
                className="w-full h-10 px-3 rounded-md bg-zinc-900/50 border border-zinc-800 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mt-4">
            {isPending ? 'Salvando...' : 'Salvar Empresa'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
