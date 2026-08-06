import { getEmpresas, getUsuarios } from '@/app/actions/empresas'
import { Button } from '@/components/ui/button'
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
import { EmpresasList } from './EmpresasList'

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

  // Preparar os dados para a listagem (agrupar filiais)
  const matrizesMap = new Map<string, any>()
  const filiais: any[] = []
  
  // Apenas empresas que não têm matriz podem ser selecionadas como matriz
  const todasEmpresasParaMatriz = empresas
    .filter((e: any) => !e.matrizId)
    .map((e: any) => ({ id: e.id, razaoSocial: e.razaoSocial }))

  empresas.forEach((empresa: any) => {
    empresa.filiais = []
    if (!empresa.matrizId) {
      matrizesMap.set(empresa.id, empresa)
    } else {
      filiais.push(empresa)
    }
  })

  // Aninhar filiais nas matrizes correspondentes
  filiais.forEach(filial => {
    if (matrizesMap.has(filial.matrizId)) {
      matrizesMap.get(filial.matrizId).filiais.push(filial)
    } else {
      // Se a matriz não está na lista (ex: usuário não tem acesso), adiciona como "matriz" avulsa
      matrizesMap.set(filial.id, filial)
    }
  })

  const empresasAgrupadas = Array.from(matrizesMap.values())

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
          
          <EmpresaFormModal matrizesDisponiveis={todasEmpresasParaMatriz} />
        </div>

        <EmpresaFilters />

        <EmpresasList 
          empresas={empresasAgrupadas} 
          usuarios={usuarios} 
          todasEmpresasParaMatriz={todasEmpresasParaMatriz}
        />
      </div>
    </div>
  )
}
