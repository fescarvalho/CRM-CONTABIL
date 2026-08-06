'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FechamentoCell } from './FechamentoCell'

interface ControleTableClientProps {
  empresas: any[]
  anoAtual: number
}

const meses = [
  { val: 1, nome: 'Jan' },
  { val: 2, nome: 'Fev' },
  { val: 3, nome: 'Mar' },
  { val: 4, nome: 'Abr' },
  { val: 5, nome: 'Mai' },
  { val: 6, nome: 'Jun' },
  { val: 7, nome: 'Jul' },
  { val: 8, nome: 'Ago' },
  { val: 9, nome: 'Set' },
  { val: 10, nome: 'Out' },
  { val: 11, nome: 'Nov' },
  { val: 12, nome: 'Dez' },
]

export function ControleTableClient({ empresas, anoAtual }: ControleTableClientProps) {
  const router = useRouter()
  const [busca, setBusca] = useState('')

  const handleAnoChange = (delta: number) => {
    router.push(`/fechamentos?ano=${anoAtual + delta}`)
  }

  const empresasFiltradas = empresas.filter(e => 
    e.razaoSocial.toLowerCase().includes(busca.toLowerCase()) || 
    e.cnpj.includes(busca)
  )

  return (
    <div className="space-y-6">
      {/* Controles do topo */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Buscar empresa por nome ou CNPJ..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800"
          />
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-950/40 p-2 rounded-xl border border-zinc-800/50">
          <Button variant="ghost" size="icon" onClick={() => handleAnoChange(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-xl font-bold text-white min-w-[4ch] text-center">{anoAtual}</span>
          <Button variant="ghost" size="icon" onClick={() => handleAnoChange(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/40">
                <th className="p-4 font-semibold text-zinc-400">Empresa</th>
                {meses.map(m => (
                  <th key={m.val} className="p-4 font-semibold text-zinc-400 text-center w-12">{m.nome}</th>
                ))}
                <th className="p-4 font-semibold text-primary text-center w-12 border-l border-zinc-800/50">Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-12 text-center text-zinc-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map(empresa => (
                  <tr key={empresa.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white truncate max-w-[200px] sm:max-w-xs">{empresa.razaoSocial}</span>
                        <span className="text-xs text-zinc-500">{empresa.cnpj}</span>
                      </div>
                    </td>
                    
                    {/* Meses */}
                    {meses.map(m => {
                      const controle = empresa.controlesMensais.find(
                        (c: any) => c.tipo === 'MENSAL' && c.mes === m.val
                      )
                      return (
                        <td key={m.val} className="p-4 text-center">
                          <div className="flex justify-center">
                            <FechamentoCell 
                              empresaId={empresa.id} 
                              ano={anoAtual} 
                              mes={m.val} 
                              tipo="MENSAL" 
                              controle={controle} 
                            />
                          </div>
                        </td>
                      )
                    })}

                    {/* Anual */}
                    <td className="p-4 text-center border-l border-zinc-800/50 bg-primary/5">
                      <div className="flex justify-center">
                        <FechamentoCell 
                          empresaId={empresa.id} 
                          ano={anoAtual} 
                          mes={null} 
                          tipo="ANUAL" 
                          controle={empresa.controlesMensais.find((c: any) => c.tipo === 'ANUAL')} 
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
