'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
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

    const empresas = await prisma.empresa.findMany({
      orderBy: { razaoSocial: 'asc' }
    })

    return {
      role: 'ADMIN',
      stats: {
        totalEmpresas,
        totalUsuarios,
        totalDocumentos
      },
      empresas,
      user: dbUser
    }
  } else {
    // É contador
    const acessos = await prisma.acessoEmpresa.findMany({
      where: { usuarioId: dbUser.id },
      include: { empresa: true }
    })

    const empresasAtribuidas = acessos.map(a => a.empresa)

    return {
      role: 'CONTADOR',
      stats: null,
      empresas: empresasAtribuidas,
      user: dbUser
    }
  }
}
