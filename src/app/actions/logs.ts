'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function registrarLogAuditoria(acao: string, detalhes: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return

    const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
    if (!dbUser) return

    await prisma.logAuditoria.create({
      data: {
        usuarioId: dbUser.id,
        acao,
        detalhes
      }
    })
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error)
  }
}

export async function getLogsAuditoria() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) throw new Error('Não autenticado')

  const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
  if (!dbUser || dbUser.role !== 'ADMIN') throw new Error('Acesso negado')

  return await prisma.logAuditoria.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
    include: {
      usuario: {
        select: { nome: true, email: true }
      }
    }
  })
}
