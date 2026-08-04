'use client'

import { useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateShareLink } from '@/app/actions/share'

export function ShareButton({ documentoId, empresaId }: { documentoId: string, empresaId: string }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    try {
      setLoading(true)
      const token = await generateShareLink(documentoId, empresaId, 24)
      const shareUrl = `${window.location.origin}/share/${token}`
      
      await navigator.clipboard.writeText(shareUrl)
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao gerar link', error)
      alert('Erro ao gerar link de compartilhamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      title={copied ? "Link Copiado!" : "Compartilhar Link Público"} 
      onClick={handleShare}
      disabled={loading}
      className={`transition-colors ${copied ? 'text-green-500' : 'text-zinc-500 hover:text-purple-500'}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
    </Button>
  )
}
