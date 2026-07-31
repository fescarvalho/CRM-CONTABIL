'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) throw new Error('Não autenticado')

  const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
  if (!dbUser || dbUser.role !== 'ADMIN') throw new Error('Acesso negado')
  return dbUser
}

export async function getTodosUsuarios() {
  await checkAdmin()
  return await prisma.usuario.findMany({
    orderBy: { nome: 'asc' },
    include: {
      empresasAtribuidas: {
        include: { empresa: true }
      }
    }
  })
}

export async function criarUsuarioAdmin(formData: FormData) {
  await checkAdmin()
  
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  if (!nome || !email || !role || !password) {
    throw new Error('Preencha todos os campos')
  }

  // 1. Criar no Supabase Auth usando a Service Role Key (bypassa confirmação de e-mail e regras normais)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error("Erro no Supabase Auth:", error)
    throw new Error(`Erro ao criar no Auth: ${error.message}`)
  }

  // 2. Criar no banco de dados (Prisma)
  try {
    await prisma.usuario.create({
      data: {
        email,
        nome,
        role
      }
    })
  } catch (err: any) {
    console.error("Erro Prisma ao criar usuário:", err)
    // Se falhar no banco, tenta deletar do Auth para evitar inconsistência
    if (data.user) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    }
    throw new Error("Erro ao salvar no banco de dados. O email já está em uso?")
  }

  revalidatePath('/usuarios')
}
