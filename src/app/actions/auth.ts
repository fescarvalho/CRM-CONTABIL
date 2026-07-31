'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function login(_prevState: { error: string } | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  try {
    const dbUser = await prisma.usuario.findUnique({ where: { email } })

    if (!dbUser) {
      await supabase.auth.signOut()
      return { error: 'Usuário não cadastrado no sistema contábil.' }
    }
  } catch (err: any) {
    console.error('Prisma Login Error:', err)
    return { error: 'Erro de conexão com o banco de dados (Prisma).' }
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
