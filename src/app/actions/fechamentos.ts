'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getControles(ano: number, searchQuery?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const dbUser = await prisma.usuario.findUnique({
    where: { email: user.email },
  })

  if (!dbUser) return null

  let empresasCondition: any = {}

  if (dbUser.role !== 'ADMIN') {
    const acessos = await prisma.acessoEmpresa.findMany({
      where: { usuarioId: dbUser.id },
      select: { empresaId: true }
    })
    const empresaIds = acessos.map(a => a.empresaId)
    empresasCondition = { id: { in: empresaIds } }
  }

  const whereCondition: any = {
    ...empresasCondition,
  }

  if (searchQuery) {
    whereCondition.OR = [
      { razaoSocial: { contains: searchQuery, mode: 'insensitive' } },
      { cnpj: { contains: searchQuery, mode: 'insensitive' } }
    ]
  }

  const empresas = await prisma.empresa.findMany({
    where: whereCondition,
    orderBy: { razaoSocial: 'asc' },
    include: {
      controlesMensais: {
        where: { ano },
        include: {
          concluidoPor: {
            select: { nome: true }
          }
        }
      }
    }
  })

  return {
    empresas,
    role: dbUser.role
  }
}

export async function toggleControle(
  empresaId: string, 
  ano: number, 
  mes: number | null, 
  tipo: 'MENSAL' | 'ANUAL', 
  currentState: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Não autenticado')

  const dbUser = await prisma.usuario.findUnique({
    where: { email: user.email },
  })

  if (!dbUser) throw new Error('Usuário não encontrado')

  // Check access if not admin
  if (dbUser.role !== 'ADMIN') {
    const acesso = await prisma.acessoEmpresa.findUnique({
      where: {
        usuarioId_empresaId: {
          usuarioId: dbUser.id,
          empresaId
        }
      }
    })
    if (!acesso) throw new Error('Acesso negado a esta empresa')
  }

  const newState = !currentState
  
  // Find if it exists first because unique with nulls in Prisma sometimes requires workarounds
  const existing = await prisma.controleMensal.findFirst({
    where: {
      empresaId,
      ano,
      tipo,
      mes: mes === null ? null : mes
    }
  })

  if (newState) {
    // Marking as done
    if (existing) {
      await prisma.controleMensal.update({
        where: { id: existing.id },
        data: {
          concluido: true,
          concluidoPorId: dbUser.id,
          concluidoEm: new Date()
        }
      })
    } else {
      await prisma.controleMensal.create({
        data: {
          empresaId,
          ano,
          mes,
          tipo,
          concluido: true,
          concluidoPorId: dbUser.id,
          concluidoEm: new Date()
        }
      })
    }
  } else {
    // Marking as undone (pending)
    if (existing) {
      await prisma.controleMensal.update({
        where: { id: existing.id },
        data: {
          concluido: false,
          concluidoPorId: null,
          concluidoEm: null
        }
      })
    }
    // if not existing, it's already undone
  }

  revalidatePath('/fechamentos')
  return { success: true }
}
