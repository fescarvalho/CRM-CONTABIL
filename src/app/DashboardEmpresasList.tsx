'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FolderOpen, Building2, ChevronDown, ChevronRight } from 'lucide-react'

type EmpresaItem = {
  id: string
  razaoSocial: string
  cnpj: string
  matrizId: string | null
  filiais?: EmpresaItem[]
}

export function DashboardEmpresasList({ empresas }: { empresas: EmpresaItem[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Agrupar empresas
  const matrizesMap = new Map<string, EmpresaItem>()
  const filiais: EmpresaItem[] = []

  empresas.forEach(e => {
    e.filiais = []
    if (!e.matrizId) {
      matrizesMap.set(e.id, e)
    } else {
      filiais.push(e)
    }
  })

  filiais.forEach(f => {
    if (matrizesMap.has(f.matrizId!)) {
      matrizesMap.get(f.matrizId!)!.filiais!.push(f)
    } else {
      matrizesMap.set(f.id, f)
    }
  })

  const agrupadas = Array.from(matrizesMap.values())

  return (
    <div className="space-y-4">
      {agrupadas.map(empresa => {
        const isExpanded = expanded.has(empresa.id)
        const hasFiliais = empresa.filiais && empresa.filiais.length > 0

        return (
          <div key={empresa.id} className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/50 rounded-xl overflow-hidden transition-all">
            <div className="flex items-center justify-between p-4 hover:bg-zinc-900/40 group">
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                {hasFiliais ? (
                  <button onClick={() => toggle(empresa.id)} className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                ) : (
                  <div className="w-7 flex justify-center"><Building2 className="w-4 h-4 text-zinc-600" /></div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors truncate">{empresa.razaoSocial}</h3>
                    {hasFiliais && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">{empresa.filiais!.length} Filiais</span>}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-1">CNPJ: {empresa.cnpj}</p>
                </div>
              </div>
              <Link prefetch={true} href={`/empresas/${empresa.id}`} className="shrink-0">
                <Button variant="secondary" size="sm" className="bg-zinc-900 text-zinc-300 hover:bg-primary hover:text-white transition-all h-8">
                  <FolderOpen className="w-4 h-4 mr-2" /> Abrir
                </Button>
              </Link>
            </div>
            
            {isExpanded && hasFiliais && (
              <div className="bg-zinc-900/20 border-t border-zinc-800/50 divide-y divide-zinc-800/30">
                {empresa.filiais!.map(filial => (
                  <div key={filial.id} className="flex items-center justify-between p-3 pl-12 hover:bg-zinc-900/40 group">
                    <div className="overflow-hidden pr-2">
                      <h4 className="font-medium text-sm text-zinc-300 group-hover:text-primary transition-colors truncate">{filial.razaoSocial}</h4>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">CNPJ: {filial.cnpj}</p>
                    </div>
                    <Link prefetch={true} href={`/empresas/${filial.id}`} className="shrink-0">
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all h-7 px-2">
                        <FolderOpen className="w-3 h-3 mr-1.5" /> Abrir
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
