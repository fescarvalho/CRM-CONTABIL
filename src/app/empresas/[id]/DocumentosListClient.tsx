'use client'

import { useState } from 'react'
import { FileText, Download, Trash2, ArrowUpDown, RotateCcw, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/lib/utils'
import { getSignedDownloadUrl, excluirDocumento, restaurarDocumento, excluirDocumentoPermanente } from '@/app/actions/files'
import { MoverDocumentoModal } from './MoverDocumentoModal'
import { MoverEmMassaModal } from './MoverEmMassaModal'
import { ShareButton } from './ShareButton'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { GerenciarTagsModal, getTagColor, getContrastColor } from './GerenciarTagsModal'

type Documento = {
  id: string
  nome: string
  urlStorage: string
  tamanhoBytes: number
  pastaId: string | null
  criadoEm: string
  pastaNome?: string
  tags?: string[]
}

export function DocumentosListClient({
  empresaId,
  documentos,
  todasPastas,
  isLixeira
}: {
  empresaId: string
  documentos: Documento[]
  todasPastas: any[]
  isLixeira?: boolean
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleDownload = async (urlStorage: string) => {
    setDownloadingId(urlStorage)
    try {
      const signedUrl = await getSignedDownloadUrl(empresaId, urlStorage)
      const link = document.createElement('a')
      link.href = signedUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      alert('Erro ao baixar documento')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (id: string, urlStorage: string) => {
    if (!confirm('Deseja mover este arquivo para a lixeira?')) return
    setDeletingId(id)
    try {
      const formData = new FormData()
      formData.append('id', id)
      formData.append('empresaId', empresaId)
      formData.append('urlStorage', urlStorage)
      await excluirDocumento(formData)
    } catch (e) {
      alert('Erro ao excluir documento')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRestaurar = async (id: string) => {
    if (!confirm('Deseja restaurar este arquivo?')) return
    setDeletingId(id)
    try {
      await restaurarDocumento(id, empresaId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleExcluirPermanente = async (id: string, urlStorage: string) => {
    if (!confirm('ATENÇÃO: O arquivo será excluído para sempre. Continuar?')) return
    setDeletingId(id)
    try {
      await excluirDocumentoPermanente(id, empresaId, urlStorage)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === documentos.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(documentos.map(d => d.id))
    }
  }

  const handleDragStart = (e: React.DragEvent, doc: Documento) => {
    if (isLixeira) return
    e.dataTransfer.setData('application/x-documento-id', doc.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Fallback visually
    const ghost = document.createElement('div')
    ghost.style.padding = '8px 16px'
    ghost.style.background = '#2563eb'
    ghost.style.color = '#fff'
    ghost.style.borderRadius = '8px'
    ghost.textContent = doc.nome
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  if (documentos.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Nenhum documento nesta {isLixeira ? 'lixeira' : 'pasta'}.
      </div>
    )
  }

  return (
    <div>
      {!isLixeira && selectedIds.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20 p-2 flex items-center justify-between">
          <span className="text-sm font-medium text-primary px-2">{selectedIds.length} selecionado(s)</span>
          <MoverEmMassaModal empresaId={empresaId} docIds={selectedIds} pastas={todasPastas} onSuccess={() => setSelectedIds([])} />
        </div>
      )}

      <div className="divide-y divide-zinc-800">
        <div className="flex items-center px-4 py-3 bg-zinc-900/50 text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {!isLixeira && (
            <div className="w-8 flex justify-center">
              <button onClick={toggleSelectAll} className="text-zinc-500 hover:text-primary transition-colors focus:outline-none">
                {selectedIds.length === documentos.length && documentos.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
          <div className="flex-1 flex items-center gap-1 cursor-pointer hover:text-zinc-300">
            Nome do Arquivo <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="w-32 hidden md:block">Tamanho</div>
          <div className="w-32 hidden md:block">Data</div>
          <div className="w-32 text-right">Ações</div>
        </div>

        {documentos.map((doc) => (
          <div 
            key={doc.id} 
            draggable={!isLixeira}
            onDragStart={(e) => handleDragStart(e, doc)}
            className={`flex items-center px-4 py-3 hover:bg-zinc-900/40 transition-colors group ${deletingId === doc.id ? 'opacity-50' : ''} ${selectedIds.includes(doc.id) ? 'bg-primary/5' : ''} ${!isLixeira && 'cursor-grab active:cursor-grabbing'}`}
          >
            {!isLixeira && (
              <div className="w-8 flex justify-center">
                <button onClick={() => toggleSelect(doc.id)} className="text-zinc-500 hover:text-primary transition-colors focus:outline-none">
                  {selectedIds.includes(doc.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                </button>
              </div>
            )}
            
            <div className="flex-1 flex items-center gap-3 overflow-hidden">
              <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex flex-col truncate pr-4">
                <span className="font-medium text-white truncate">{doc.nome}</span>
                <div className="flex items-center gap-2 mt-1">
                  {doc.pastaNome && (
                    <span className="text-xs text-zinc-500 truncate">Em: {doc.pastaNome}</span>
                  )}
                  {doc.tags && doc.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-[10px] px-1.5 py-0.5 rounded-sm font-bold shadow-sm"
                      style={{ backgroundColor: getTagColor(tag), color: getContrastColor(getTagColor(tag)) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-32 hidden md:block text-sm text-zinc-500">
              {formatBytes(doc.tamanhoBytes)}
            </div>
            
            <div className="w-32 hidden md:block text-sm text-zinc-500">
              {new Date(doc.criadoEm).toLocaleDateString()}
            </div>
            
            <div className="w-32 flex items-center justify-end">
              {isLixeira ? (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" title="Restaurar" onClick={() => handleRestaurar(doc.id)} disabled={!!deletingId} className="text-zinc-500 hover:text-green-500">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Excluir Definitivamente" onClick={() => handleExcluirPermanente(doc.id, doc.urlStorage)} disabled={!!deletingId} className="text-zinc-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GerenciarTagsModal empresaId={empresaId} documentoId={doc.id} initialTags={doc.tags || []} />
                  <ShareButton documentoId={doc.id} empresaId={empresaId} />
                  <DocumentPreviewModal empresaId={empresaId} nome={doc.nome} urlStorage={doc.urlStorage} />
                  <MoverDocumentoModal empresaId={empresaId} documentoId={doc.id} currentPastaId={doc.pastaId} pastas={todasPastas} />
                  <Button variant="ghost" size="icon" title="Baixar" onClick={() => handleDownload(doc.urlStorage)} disabled={downloadingId === doc.urlStorage} className="text-zinc-500 hover:text-green-500">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDelete(doc.id, doc.urlStorage)} disabled={!!deletingId} className="text-zinc-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
