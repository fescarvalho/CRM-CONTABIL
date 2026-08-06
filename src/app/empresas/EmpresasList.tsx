'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { EmpresaFormModal } from './EmpresaFormModal'
import { AcessosModal } from './AcessosModal'
import { formatCNPJ } from '@/lib/utils'

export type EmpresaRow = {
  id: string
  razaoSocial: string
  cnpj: string
  status: string
  acessos: any[]
  matrizId: string | null
  filiais?: EmpresaRow[]
}

export function EmpresasList({ empresas, usuarios, todasEmpresasParaMatriz }: { empresas: EmpresaRow[], usuarios: any[], todasEmpresasParaMatriz: { id: string, razaoSocial: string }[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderRow = (empresa: EmpresaRow, isFilial: boolean = false) => {
    const isExpanded = expandedRows.has(empresa.id)
    const hasFiliais = empresa.filiais && empresa.filiais.length > 0

    return (
      <TableRow key={empresa.id} className={`border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group ${isFilial ? 'bg-zinc-900/20' : ''}`}>
        <TableCell className="font-medium text-white">
          <div className="flex items-center gap-2" style={{ paddingLeft: isFilial ? '2rem' : '0' }}>
            {hasFiliais ? (
              <button onClick={() => toggleRow(empresa.id)} className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" /> // spacer
            )}
            {empresa.razaoSocial}
            {hasFiliais && <Badge variant="secondary" className="ml-2 text-xs bg-zinc-800 text-zinc-400 border-zinc-700">{empresa.filiais!.length} Filiais</Badge>}
          </div>
        </TableCell>
        <TableCell className="font-mono text-zinc-400">{formatCNPJ(empresa.cnpj)}</TableCell>
        <TableCell>
          <Badge className={empresa.status === 'Ativo' ? 'bg-primary/20 text-primary hover:bg-primary/30 border-primary/20' : 'bg-zinc-800 text-zinc-400'}>
            {empresa.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex gap-2 flex-wrap">
            {empresa.acessos.map((a: any) => (
              <Badge key={a.usuarioId} variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-900/50">
                {a.usuario.nome}
              </Badge>
            ))}
            {empresa.acessos.length === 0 && <span className="text-zinc-600 text-sm italic">Nenhum</span>}
          </div>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <EmpresaFormModal 
            empresa={{
              id: empresa.id,
              razaoSocial: empresa.razaoSocial,
              cnpj: empresa.cnpj,
              status: empresa.status,
              matrizId: empresa.matrizId
            }}
            matrizesDisponiveis={todasEmpresasParaMatriz.filter(m => m.id !== empresa.id)}
          />
          <AcessosModal 
            empresaId={empresa.id}
            razaoSocial={empresa.razaoSocial}
            usuarios={usuarios.map((u: any) => ({
              id: u.id,
              nome: u.nome,
              email: u.email,
              role: u.role
            }))}
            acessosAtuais={empresa.acessos.map((a: any) => a.usuarioId)}
          />
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="border border-zinc-800/50 rounded-2xl bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-zinc-800/50 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-medium">Razão Social</TableHead>
            <TableHead className="text-zinc-400 font-medium">CNPJ</TableHead>
            <TableHead className="text-zinc-400 font-medium">Status</TableHead>
            <TableHead className="text-zinc-400 font-medium">Usuários Atribuídos</TableHead>
            <TableHead className="text-right text-zinc-400 font-medium">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32 text-zinc-500">
                Nenhuma empresa encontrada
              </TableCell>
            </TableRow>
          )}
          {empresas.map(empresa => (
            <React.Fragment key={empresa.id}>
              {renderRow(empresa)}
              {expandedRows.has(empresa.id) && empresa.filiais && empresa.filiais.map(filial => renderRow(filial, true))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
