'use client'

import { useState } from 'react'
import { Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getSignedDownloadUrl } from '@/app/actions/files'

type Props = {
  empresaId: string
  nome: string
  urlStorage: string
}

export function DocumentPreviewModal({ empresaId, nome, urlStorage }: Props) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isImage = nome.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i)

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !url) {
      setLoading(true)
      try {
        const signedUrl = await getSignedDownloadUrl(empresaId, urlStorage)
        setUrl(signedUrl)
      } catch (error) {
        console.error('Erro ao carregar preview', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 h-9 w-9 text-zinc-500 dark:text-zinc-500 hover:!text-blue-500">
        <Eye className="w-4 h-4" />
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl w-[90vw] h-[90vh] flex flex-col p-0 bg-zinc-950 border-zinc-800">
        <DialogHeader className="p-4 border-b border-zinc-800 bg-zinc-900/50">
          <DialogTitle className="text-zinc-100">{nome}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-zinc-900/20 flex items-center justify-center overflow-hidden p-4">
          {loading ? (
            <div className="flex flex-col items-center text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Carregando visualização segura...</p>
            </div>
          ) : url ? (
            isImage ? (
              <img src={url} alt={nome} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            ) : (
              <iframe src={url} className="w-full h-full rounded-lg bg-white" title={nome} />
            )
          ) : (
            <p className="text-zinc-500">Não foi possível carregar a visualização.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
