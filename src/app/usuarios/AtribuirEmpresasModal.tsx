'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings2, CheckSquare, Square, Loader2 } from 'lucide-react'
import { atribuirEmpresas } from '@/app/actions/usuarios'
import { Input } from '@/components/ui/input'

type Empresa = {
  id: string
  razaoSocial: string
  cnpj: string
}

type Props = {
  usuarioId: string
  usuarioNome: string
  todasEmpresas: Empresa[]
  empresasAtribuidasIds: string[]
}

export function AtribuirEmpresasModal({ usuarioId, usuarioNome, todasEmpresas, empresasAtribuidasIds }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(empresasAtribuidasIds)
  const [busca, setBusca] = useState('')
  const [isPending, setIsPending] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === todasEmpresas.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(todasEmpresas.map(e => e.id))
    }
  }

  const empresasFiltradas = todasEmpresas.filter(e => 
    e.razaoSocial.toLowerCase().includes(busca.toLowerCase()) || 
    e.cnpj.includes(busca)
  )

  const handleSave = async () => {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.append('usuarioId', usuarioId)
      selectedIds.forEach(id => formData.append('empresaIds', id))
      
      await atribuirEmpresas(formData)
      setOpen(false)
    } catch (error) {
      console.error('Erro ao atribuir', error)
      alert('Erro ao salvar acessos.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (val) {
        setSelectedIds(empresasAtribuidasIds)
        setBusca('')
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-primary hover:bg-primary/10 ml-2">
          <Settings2 className="w-4 h-4 mr-2" /> Gerenciar Acessos
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl bg-zinc-950/95 backdrop-blur-xl border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Acessos: {usuarioNome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between gap-4">
            <Input 
              placeholder="Buscar empresa por nome ou CNPJ..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50"
            />
            <Button variant="outline" onClick={toggleAll} className="border-zinc-800 hover:bg-zinc-800 text-zinc-300">
              {selectedIds.length === todasEmpresas.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
            </Button>
          </div>

          <div className="border border-zinc-800 rounded-lg max-h-[50vh] overflow-y-auto bg-zinc-900/20 divide-y divide-zinc-800/50">
            {empresasFiltradas.length === 0 && (
              <div className="p-4 text-center text-zinc-500">Nenhuma empresa encontrada.</div>
            )}
            
            {empresasFiltradas.map(emp => {
              const isSelected = selectedIds.includes(emp.id)
              return (
                <div 
                  key={emp.id} 
                  onClick={() => toggleSelection(emp.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-zinc-800/50'}`}
                >
                  <button className={`focus:outline-none transition-colors ${isSelected ? 'text-primary' : 'text-zinc-500'}`}>
                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                  <div>
                    <p className="font-medium text-sm text-zinc-200">{emp.razaoSocial}</p>
                    <p className="text-xs text-zinc-500">{emp.cnpj}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-zinc-400">
              {selectedIds.length} de {todasEmpresas.length} selecionadas
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">Cancelar</Button>
              <Button onClick={handleSave} disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Acessos
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
