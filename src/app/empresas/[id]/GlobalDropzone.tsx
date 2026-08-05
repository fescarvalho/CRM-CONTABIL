'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUpload } from './UploadContext'
import { UploadCloud } from 'lucide-react'

// Função recursiva para ler itens soltos na tela (Arquivos e Pastas)
async function getFilesFromDataTransfer(items: DataTransferItemList): Promise<File[]> {
  const files: File[] = []
  
  const entries: FileSystemEntry[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry()
      if (entry) entries.push(entry)
    }
  }

  const readEntry = async (entry: FileSystemEntry, path = '') => {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry
      const file = await new Promise<File>((resolve) => fileEntry.file(resolve))
      
      if (path) {
        // Truque para injetar o caminho relativo no arquivo, assim o UploadDocumentoModal 
        // consegue recriar a estrutura de pastas perfeitamente
        Object.defineProperty(file, 'webkitRelativePath', {
          value: `${path}${file.name}`,
          writable: false
        })
      }
      files.push(file)
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry
      const dirReader = dirEntry.createReader()
      
      // Um diretório pode ter muitos arquivos, readEntries deve ser chamado até retornar vazio
      const readAllEntries = async (): Promise<FileSystemEntry[]> => {
        let allEntries: FileSystemEntry[] = []
        let hasMore = true
        while (hasMore) {
          const newEntries = await new Promise<FileSystemEntry[]>((resolve) => {
            dirReader.readEntries(resolve)
          })
          if (newEntries.length === 0) {
            hasMore = false
          } else {
            allEntries = allEntries.concat(newEntries)
          }
        }
        return allEntries
      }
      
      const dirEntries = await readAllEntries()
      for (const e of dirEntries) {
        await readEntry(e, `${path}${dirEntry.name}/`)
      }
    }
  }

  for (const entry of entries) {
    await readEntry(entry)
  }

  return files
}

export function GlobalDropzone({ children }: { children: React.ReactNode }) {
  const { openModalWithFiles } = useUpload()
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Ignora drags internos (como os do React DnD para mover arquivos dentro do sistema)
    if (e.dataTransfer.types.includes('application/x-documento-id')) return
    
    setDragCounter(prev => prev + 1)
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('application/x-documento-id')) return
    
    setDragCounter(prev => {
      const newCount = prev - 1
      if (newCount === 0) {
        setIsDragging(false)
      }
      return newCount
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('application/x-documento-id')) return
    
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('application/x-documento-id')) return
    
    setDragCounter(0)
    setIsDragging(false)
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const files = await getFilesFromDataTransfer(e.dataTransfer.items)
      if (files.length > 0) {
        openModalWithFiles(files)
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Fallback
      openModalWithFiles(Array.from(e.dataTransfer.files))
    }
  }, [openModalWithFiles])

  return (
    <div 
      className="relative min-h-screen"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm border-[6px] border-blue-500 border-dashed flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-blue-600 p-6 rounded-full shadow-2xl shadow-blue-500/50 mb-6 animate-bounce">
            <UploadCloud className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Solte os arquivos para upload</h2>
          <p className="text-blue-200 mt-3 text-lg font-medium">Pastas também são suportadas e manterão sua estrutura original</p>
        </div>
      )}
    </div>
  )
}
