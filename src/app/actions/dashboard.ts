'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { Empresa } from '@prisma/client'

export async function getDashboardData(searchQuery?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const dbUser = await prisma.usuario.findUnique({
    where: { email: user.email },
  })

  if (!dbUser) return null

  if (dbUser.role === 'ADMIN') {
    const totalEmpresas = await prisma.empresa.count()
    const totalUsuarios = await prisma.usuario.count()
    const totalDocumentos = await prisma.documento.count()
    const docStats = await prisma.documento.aggregate({ _sum: { tamanhoBytes: true } })
    const totalBytes = docStats._sum.tamanhoBytes || 0

    const where = searchQuery ? {
      OR: [
        { razaoSocial: { contains: searchQuery, mode: 'insensitive' } as any },
        { cnpj: { contains: searchQuery, mode: 'insensitive' } as any }
      ]
    } : undefined

    const empresas = await prisma.empresa.findMany({
      where,
      orderBy: { razaoSocial: 'asc' }
    })

    return {
      role: 'ADMIN' as const,
      stats: {
        totalEmpresas,
        totalUsuarios,
        totalDocumentos,
        totalBytes
      },
      empresas,
      user: dbUser
    }
  } else {
    // É contador
    const where: any = { usuarioId: dbUser.id }
    if (searchQuery) {
      where.empresa = {
        OR: [
          { razaoSocial: { contains: searchQuery, mode: 'insensitive' } },
          { cnpj: { contains: searchQuery, mode: 'insensitive' } }
        ]
      }
    }

    const acessos = await prisma.acessoEmpresa.findMany({
      where,
      include: { empresa: true }
    })

    const empresasAtribuidas: Empresa[] = acessos.map(acesso => acesso.empresa)

    return {
      role: 'CONTADOR' as const,
      stats: null,
      empresas: empresasAtribuidas,
      user: dbUser
    }
  }
}
