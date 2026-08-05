'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type UploadContextType = {
  isModalOpen: boolean
  filesToUpload: File[]
  openModalWithFiles: (files: File[]) => void
  setIsModalOpen: (open: boolean) => void
  setFilesToUpload: (files: File[] | ((prev: File[]) => File[])) => void
}

export const UploadContext = createContext<UploadContextType | null>(null)

export function UploadProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])

  const openModalWithFiles = (files: File[]) => {
    setFilesToUpload(files)
    setIsModalOpen(true)
  }

  return (
    <UploadContext.Provider value={{ isModalOpen, filesToUpload, openModalWithFiles, setIsModalOpen, setFilesToUpload }}>
      {children}
    </UploadContext.Provider>
  )
}

export function useUpload() {
  const context = useContext(UploadContext)
  if (!context) throw new Error('useUpload must be used within UploadProvider')
  return context
}
