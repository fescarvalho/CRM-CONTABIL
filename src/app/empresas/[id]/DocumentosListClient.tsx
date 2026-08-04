'use client'

import { useState } from 'react'
import { File as FileIcon, Download, Trash2, CheckSquare, Square, FolderSymlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSignedDownloadUrl, excluirDocumento } from '@/app/actions/files'
import { MoverDocumentoModal } from './MoverDocumentoModal'
import { MoverEmMassaModal } from './MoverEmMassaModal'

type Documento = {
  id: string
  nome: string
  urlStorage: string
  tamanhoBytes: number
  pastaId: string | null
  criadoEm: string
  pastaNome?: string
}

type Pasta = {
  id: string
  nome: string
  parentId: string | null
}

type Props = {
  empresaId: string
  documentos: Documento[]
  todasPastas: Pasta[]
}

export function DocumentosListClient({ empresaId, documentos, todasPastas }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === documentos.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(documentos.map(d => d.id))
    }
  }

  const handleDownload = async (urlStorage: string) => {
    const url = await getSignedDownloadUrl(empresaId, urlStorage)
    window.location.href = url
  }

  if (documentos.length === 0) return (
    <div className="p-8 text-center text-muted-foreground">
      Nenhum arquivo encontrado.
    </div>
  )

  return (
    <div className="flex flex-col">
      {/* Barra de Ações em Massa */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-primary">
            {selectedIds.length} {selectedIds.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-zinc-400 hover:text-white">
              Cancelar
            </Button>
            <MoverEmMassaModal 
              empresaId={empresaId}
              docIds={selectedIds}
              pastas={todasPastas}
              onSuccess={() => setSelectedIds([])}
            />
          </div>
        </div>
      )}

      {/* Cabeçalho da Lista (Selecionar Tudo) */}
      <div className="flex items-center px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/20">
        <button onClick={toggleAll} className="mr-3 text-zinc-500 hover:text-primary transition-colors focus:outline-none">
          {selectedIds.length === documentos.length && documentos.length > 0 ? (
            <CheckSquare className="w-5 h-5 text-primary" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex-1">Nome</span>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider w-32 hidden md:block">Tamanho</span>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider w-32 hidden md:block text-right pr-4">Data</span>
      </div>

      {/* Lista de Documentos */}
      <div className="divide-y divide-zinc-800/50">
        {documentos.map(doc => {
          const isSelected = selectedIds.includes(doc.id)
          return (
            <div 
              key={doc.id} 
              className={`flex items-center justify-between p-4 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <button onClick={() => toggleSelection(doc.id)} className="text-zinc-500 hover:text-primary transition-colors focus:outline-none">
                  {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                </button>
                
                <FileIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="truncate pr-4 flex-1">
                  <div className="font-medium truncate text-white">{doc.nome}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {doc.pastaNome && (
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">Em: {doc.pastaNome}</span>
                    )}
                    <span className="md:hidden">{(doc.tamanhoBytes / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>
              
              <div className="w-32 hidden md:block text-sm text-zinc-400">
                {(doc.tamanhoBytes / 1024).toFixed(2)} KB
              </div>
              
              <div className="w-32 hidden md:block text-sm text-zinc-400 text-right pr-4">
                {new Date(doc.criadoEm).toLocaleDateString('pt-BR')}
              </div>
              
              <div className="flex items-center gap-1">
              <MoverDocumentoModal 
                empresaId={empresaId} 
                documentoId={doc.id} 
                currentPastaId={doc.pastaId} 
                pastas={todasPastas} 
              />
              <Button 
                variant="ghost" 
                size="icon" 
                title="Baixar" 
                onClick={() => handleDownload(doc.urlStorage)}
                className="text-zinc-500 hover:text-green-500 transition-colors"
              >
                <Download className="w-4 h-4" />
              </Button>
              <form action={excluirDocumento}>
                <input type="hidden" name="id" value={doc.id} />
                <input type="hidden" name="empresaId" value={empresaId} />
                <input type="hidden" name="urlStorage" value={doc.urlStorage} />
                <Button variant="ghost" size="icon" type="submit" title="Excluir" className="text-zinc-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
