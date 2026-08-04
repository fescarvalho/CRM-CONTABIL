import { getEmpresas, getUsuarios } from '@/app/actions/empresas'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AcessosModal } from './AcessosModal'
import { EmpresaFormModal } from './EmpresaFormModal'
import { formatCNPJ } from '@/lib/utils'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmpresaFilters } from './EmpresaFilters'

export default async function EmpresasPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.usuario.findUnique({ where: { email: user.email as string } })
  if (!dbUser) redirect('/login')

  const isGlobalSearch = !!q
  let whereClause: any = {}
  if (isGlobalSearch) {
    whereClause = {
      OR: [
        { razaoSocial: { contains: q, mode: 'insensitive' } },
        { cnpj: { contains: q, mode: 'insensitive' } }
      ]
    }
  }

  // Se não for admin, filtra pelas empresas que tem acesso
  if (dbUser.role !== 'ADMIN') {
    whereClause = {
      ...whereClause,
      acessos: { some: { usuarioId: dbUser.id } }
    }
  }

  let empresas = []
  let usuarios = []

  try {
    const data = await Promise.all([
      prisma.empresa.findMany({ 
        where: whereClause,
        include: { acessos: { include: { usuario: true } } },
        orderBy: { razaoSocial: 'asc' } 
      }),
      prisma.usuario.findMany()
    ])
    empresas = data[0]
    usuarios = data[1]
  } catch (err) {
    console.error("Erro ao carregar empresas:", err)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-red-500">Erro de conexão com o banco de dados</h1>
        <p className="text-zinc-400">Não foi possível carregar a lista de empresas.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Botão Voltar */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Empresas</h1>
          </div>
          
          <EmpresaFormModal />
        </div>

        <EmpresaFilters />

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
              {empresas.map((empresa: any) => (
                <TableRow key={empresa.id} className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
                  <TableCell className="font-medium text-white">{empresa.razaoSocial}</TableCell>
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
                    <EmpresaFormModal empresa={{
                      id: empresa.id,
                      razaoSocial: empresa.razaoSocial,
                      cnpj: empresa.cnpj,
                      status: empresa.status
                    }} />
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
