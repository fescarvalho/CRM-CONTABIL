'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { File as FileIcon, Upload, X } from 'lucide-react'
import { uploadDocumento, syncFolderStructure } from '@/app/actions/files'
import { FolderUp } from 'lucide-react'

type UploadModalProps = {
  empresaId: string
  pastaId?: string
}

export function UploadDocumentoModal({ empresaId, pastaId }: UploadModalProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [progressMsg, setProgressMsg] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const pdfs = selectedFiles.filter(f => f.type === 'application/pdf')
      
      if (pdfs.length < selectedFiles.length) {
        setError('Alguns arquivos não são PDF e foram ignorados.')
      } else {
        setError('')
      }

      setFiles(prev => [...prev, ...pdfs])
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAction = async () => {
    if (files.length === 0) {
      setError('Selecione ao menos um arquivo PDF.')
      return
    }

    setIsPending(true)
    setError('')
    setProgressMsg('Analisando estrutura de pastas...')
    
    try {
      // 1. Mapear pastas locais dos arquivos
      const paths = new Set<string>()
      files.forEach(f => {
        if (f.webkitRelativePath) {
          const parts = f.webkitRelativePath.split('/')
          parts.pop() // remove o nome do arquivo
          if (parts.length > 0) {
            paths.add(parts.join('/'))
          }
        }
      })

      // 2. Sincronizar pastas no backend
      let pathMap: Record<string, string> = {}
      if (paths.size > 0) {
        pathMap = await syncFolderStructure(empresaId, pastaId || null, Array.from(paths))
      }

      // 3. Agrupar arquivos por pasta de destino
      const groups: Record<string, File[]> = {}
      files.forEach(f => {
        let destPastaId = pastaId || ''
        if (f.webkitRelativePath) {
          const parts = f.webkitRelativePath.split('/')
          parts.pop()
          const p = parts.join('/')
          if (p && pathMap[p]) {
            destPastaId = pathMap[p]
          }
        }
        if (!groups[destPastaId]) groups[destPastaId] = []
        groups[destPastaId].push(f)
      })

      // 4. Enviar em Lotes de 10 por pasta para evitar limites
      let totalEnviados = 0
      for (const [destPastaId, groupFiles] of Object.entries(groups)) {
        for (let i = 0; i < groupFiles.length; i += 10) {
          const chunk = groupFiles.slice(i, i + 10)
          const formData = new FormData()
          formData.append('empresaId', empresaId)
          if (destPastaId) formData.append('pastaId', destPastaId)
          chunk.forEach(f => formData.append('file', f))
          
          setProgressMsg(`Enviando ${totalEnviados + chunk.length} de ${files.length} arquivos...`)
          await uploadDocumento(formData)
          totalEnviados += chunk.length
        }
      }

      setFiles([])
      setOpen(false)
    } catch (e: any) {
      setError(e.message || 'Erro ao enviar documentos')
    } finally {
      setIsPending(false)
      setProgressMsg('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setFiles([]); setError(''); setProgressMsg(''); }}>
      <DialogTrigger render={
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
          <Upload className="w-4 h-4 mr-2" /> Upload
        </Button>
      }>
        Upload
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload de Documentos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-700 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                <span className="text-zinc-400 text-xs font-semibold">Selecionar PDFs</span>
              </Label>
              <Input id="fileInput" type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileChange} />
            </div>
            
            <div>
              <Label htmlFor="folderInput" className="cursor-pointer flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-700 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors">
                <FolderUp className="w-6 h-6 text-zinc-500 mb-1" />
                <span className="text-zinc-400 text-xs font-semibold">Selecionar Pasta</span>
              </Label>
              {/* @ts-ignore - webkitdirectory não é padrão mas funciona em todos os navegadores modernos */}
              <Input id="folderInput" type="file" webkitdirectory="" directory="" multiple className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
          )}

          {files.length > 0 && (
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Arquivos Selecionados ({files.length}):</p>
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div className="truncate">
                      <div className="text-sm text-zinc-300 truncate">{f.name}</div>
                      {f.webkitRelativePath && <div className="text-xs text-zinc-500 truncate">{f.webkitRelativePath}</div>}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" className="text-zinc-500 hover:text-red-400 h-6 w-6 ml-2" onClick={() => removeFile(idx)} disabled={isPending}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="button" onClick={handleAction} className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isPending || files.length === 0}>
            {isPending ? (progressMsg || 'Enviando...') : `Confirmar Upload (${files.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
