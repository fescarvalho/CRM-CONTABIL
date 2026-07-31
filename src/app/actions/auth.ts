'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Verifica se o usuário existe na tabela Usuario, se não, pode criar (opcional) ou dar erro.
  // Como o admin cria os usuários, vamos apenas assumir que existe.
  const dbUser = await prisma.usuario.findUnique({
    where: { email }
  })

  if (!dbUser) {
    // Para fins de teste/setup, se for o primeiro login e não existir, 
    // podemos criá-lo como ADMIN caso seja um email específico, 
    // mas vamos seguir o fluxo normal.
    await supabase.auth.signOut()
    return { error: 'Usuário não cadastrado no sistema contábil.' }
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
