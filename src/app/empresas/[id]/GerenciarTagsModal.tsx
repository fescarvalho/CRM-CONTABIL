'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, X, Plus } from 'lucide-react'
import { atualizarTagsDocumento } from '@/app/actions/files'

// Uma função simples para gerar cores baseadas na string (hash)
export function getTagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  return '#' + '00000'.substring(0, 6 - c.length) + c
}

// Uma função para calcular contraste (texto branco ou preto)
export function getContrastColor(hexColor: string) {
  const r = parseInt(hexColor.substr(1, 2), 16)
  const g = parseInt(hexColor.substr(3, 2), 16)
  const b = parseInt(hexColor.substr(5, 2), 16)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return (yiq >= 128) ? '#000000' : '#FFFFFF'
}

type Props = {
  empresaId: string
  documentoId: string
  initialTags: string[]
}

export function GerenciarTagsModal({ empresaId, documentoId, initialTags }: Props) {
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<string[]>(initialTags || [])
  const [inputValue, setInputValue] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleAdd = () => {
    const newTag = inputValue.trim().toUpperCase()
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
    }
    setInputValue('')
  }

  const handleRemove = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleSave = async () => {
    setIsPending(true)
    try {
      await atualizarTagsDocumento(documentoId, empresaId, tags)
      setOpen(false)
    } catch (error) {
      alert('Erro ao salvar etiquetas')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (isOpen) setTags(initialTags || []) // Reseta ao abrir
    }}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" title="Gerenciar Etiquetas" className="text-zinc-500 hover:text-blue-500">
          <Tag className="w-4 h-4" />
        </Button>
      }>
        Gerenciar Etiquetas
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Etiquetas (Tags)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Digite uma nova tag (Ex: FISCAL)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-zinc-900 border-zinc-800 text-white"
            />
            <Button onClick={handleAdd} type="button" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-24 p-4 border border-zinc-800/50 rounded-lg bg-zinc-900/30">
            {tags.length === 0 && (
              <span className="text-zinc-500 text-sm italic">Nenhuma etiqueta atribuída.</span>
            )}
            {tags.map(tag => {
              const bg = getTagColor(tag)
              const fg = getContrastColor(bg)
              return (
                <div 
                  key={tag} 
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  {tag}
                  <button onClick={() => handleRemove(tag)} className="ml-1 opacity-70 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isPending} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? 'Salvando...' : 'Salvar Etiquetas'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
