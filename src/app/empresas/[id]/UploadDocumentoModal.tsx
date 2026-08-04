'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { File as FileIcon, Upload, X } from 'lucide-react'
import { uploadDocumento } from '@/app/actions/files'

type UploadModalProps = {
  empresaId: string
  pastaId?: string
}

export function UploadDocumentoModal({ empresaId, pastaId }: UploadModalProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      
      const pdfs = selectedFiles.filter(f => f.type === 'application/pdf')
      
      if (pdfs.length < selectedFiles.length) {
        setError('Alguns arquivos não são PDF e foram ignorados.')
      } else {
        setError('')
      }

      setFiles(prev => {
        const newArray = [...prev, ...pdfs]
        return newArray.slice(0, 10) // Limita a 10 arquivos no máximo
      })
      
      // Reseta o input para permitir selecionar o mesmo arquivo novamente se deletar
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAction = async (formData: FormData) => {
    if (files.length === 0) {
      setError('Selecione ao menos um arquivo PDF.')
      return
    }

    setIsPending(true)
    setError('')
    
    // Substitui o formData para ter exatamente os arquivos do estado
    const newFormData = new FormData()
    newFormData.append('empresaId', empresaId)
    if (pastaId) newFormData.append('pastaId', pastaId)
    
    files.forEach(f => {
      newFormData.append('file', f)
    })

    try {
      await uploadDocumento(newFormData)
      setFiles([])
      setOpen(false)
    } catch (e: any) {
      setError(e.message || 'Erro ao enviar documentos')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setFiles([]); }}>
      <DialogTrigger render={
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
          <Upload className="w-4 h-4 mr-2" /> Enviar PDF
        </Button>
      }>
        Enviar PDF
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload de Documentos</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-4">
          
          <div className="space-y-4">
            <Label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <Upload className="w-8 h-8 text-zinc-500 mb-2" />
              <span className="text-zinc-400 text-sm">Clique para selecionar até 10 PDFs</span>
            </Label>
            <Input id="fileInput" type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
          )}

          {files.length > 0 && (
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Arquivos Selecionados ({files.length}/10):</p>
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-zinc-300 truncate">{f.name}</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" className="text-zinc-500 hover:text-red-400 h-6 w-6 ml-2" onClick={() => removeFile(idx)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isPending || files.length === 0}>
            {isPending ? 'Enviando...' : `Confirmar Upload (${files.length})`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
