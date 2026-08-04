'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteFolderButton() {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      type="submit" 
      title="Excluir Pasta" 
      className="text-zinc-500 hover:text-red-500 transition-colors" 
      onClick={(e) => {
        if (!window.confirm('Tem certeza que deseja excluir esta pasta? Os arquivos dentro dela NÃO serão apagados, mas voltarão para a raiz da empresa.')) {
          e.preventDefault()
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
