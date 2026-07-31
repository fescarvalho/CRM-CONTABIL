'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
  if (!dbUser || dbUser.role !== 'ADMIN') throw new Error('Acesso negado')
  
  return dbUser
}

export async function getEmpresas() {
  await checkAdmin()
  return await prisma.empresa.findMany({
    orderBy: { razaoSocial: 'asc' },
    include: { acessos: { include: { usuario: true } } }
  })
}

export async function createEmpresa(formData: FormData) {
  await checkAdmin()
  
  const razaoSocial = formData.get('razaoSocial') as string
  const cnpj = formData.get('cnpj') as string
  
  await prisma.empresa.create({
    data: {
      razaoSocial,
      cnpj,
    }
  })
  
  revalidatePath('/empresas')
}

export async function getContadores() {
  await checkAdmin()
  return await prisma.usuario.findMany({
    where: { role: 'CONTADOR' },
    orderBy: { nome: 'asc' }
  })
}

export async function updateAcessos(empresaId: string, usuarioIds: string[]) {
  await checkAdmin()
  
  // Limpa acessos atuais
  await prisma.acessoEmpresa.deleteMany({
    where: { empresaId }
  })
  
  // Cria novos
  if (usuarioIds.length > 0) {
    await prisma.acessoEmpresa.createMany({
      data: usuarioIds.map(uid => ({
        empresaId,
        usuarioId: uid
      }))
    })
  }
  
  revalidatePath('/empresas')
}
