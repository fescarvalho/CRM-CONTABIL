'use client'

import { useState, useTransition, useEffect } from 'react'
import { toggleControle } from '@/app/actions/fechamentos'
import { Check, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ControleData {
  id: string
  concluido: boolean
  concluidoEm: Date | null
  concluidoPor: { nome: string } | null
}

interface FechamentoCellProps {
  empresaId: string
  ano: number
  mes: number | null
  tipo: 'MENSAL' | 'ANUAL'
  controle: ControleData | undefined
}

export function FechamentoCell({ empresaId, ano, mes, tipo, controle }: FechamentoCellProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useState(controle?.concluido ?? false)
  const router = useRouter()

  useEffect(() => {
    setOptimisticState(controle?.concluido ?? false)
  }, [controle?.concluido])

  const isDone = optimisticState

  const tooltipText = isDone && controle?.concluidoPor 
    ? `Concluído por ${controle.concluidoPor.nome} em ${controle.concluidoEm ? new Date(controle.concluidoEm).toLocaleDateString() : ''}`
    : 'Pendente'

  const handleClick = () => {
    if (isPending) return
    const currentState = optimisticState
    const newState = !currentState
    setOptimisticState(newState)
    startTransition(async () => {
      try {
        await toggleControle(empresaId, ano, mes, tipo, currentState)
      } catch (error) {
        console.error('Failed to toggle', error)
        setOptimisticState(currentState) // revert
      }
    })
  }

  return (
    <div 
      className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border shrink-0
        ${isDone 
          ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30' 
          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}
      `}
      onClick={handleClick}
      title={tooltipText}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
      ) : isDone ? (
        <Check className="w-5 h-5" />
      ) : (
        <X className="w-4 h-4 opacity-30" />
      )}
    </div>
  )
}
