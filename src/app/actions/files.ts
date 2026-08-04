'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { r2, BUCKET_NAME } from '@/lib/s3'
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { revalidatePath } from 'next/cache'

async function checkAccess(empresaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
  if (!dbUser) throw new Error('Usuário não encontrado')
  
  if (dbUser.role === 'ADMIN') return dbUser

  const acesso = await prisma.acessoEmpresa.findUnique({
    where: { usuarioId_empresaId: { usuarioId: dbUser.id, empresaId } }
  })

  if (!acesso) throw new Error('Acesso negado a esta empresa')

  return dbUser
}

export async function criarPasta(formData: FormData) {
  const nome = formData.get('nome') as string
  const empresaId = formData.get('empresaId') as string
  const parentId = formData.get('parentId') as string | null
  
  await checkAccess(empresaId)

  await prisma.pasta.create({
    data: {
      nome,
      empresaId,
      parentId: parentId || null
    }
  })

  revalidatePath(`/empresas/${empresaId}`)
}

export async function uploadDocumento(formData: FormData) {
  const files = formData.getAll('file') as File[]
  const empresaId = formData.get('empresaId') as string
  const pastaId = formData.get('pastaId') as string | null

  await checkAccess(empresaId)

  const validFiles = files.filter(f => f.size > 0)

  if (validFiles.length === 0) {
    throw new Error('Nenhum arquivo enviado')
  }

  if (validFiles.length > 10) {
    throw new Error('Você pode enviar no máximo 10 arquivos por vez')
  }

  for (const file of validFiles) {
    if (file.type !== 'application/pdf') {
      throw new Error(`O arquivo ${file.name} não é um PDF válido`)
    }
  }

  await Promise.all(validFiles.map(async (file) => {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const docId = crypto.randomUUID()
    const urlStorage = `${empresaId}/${pastaId || 'raiz'}/${docId}.pdf`

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: urlStorage,
      Body: buffer,
      ContentType: file.type
    }))

    await prisma.documento.create({
      data: {
        id: docId,
        nome: file.name,
        urlStorage,
        tamanhoBytes: file.size,
        tipoMime: file.type,
        pastaId: pastaId || null,
        empresaId,
      }
    })
  }))

  revalidatePath(`/empresas/${empresaId}`)
}

export async function getSignedDownloadUrl(empresaId: string, urlStorage: string) {
  await checkAccess(empresaId)
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: urlStorage,
  })

  // URL expira em 1 hora
  return await getSignedUrl(r2, command, { expiresIn: 3600 })
}

export async function excluirDocumento(formData: FormData) {
  const id = formData.get('id') as string
  const empresaId = formData.get('empresaId') as string
  const urlStorage = formData.get('urlStorage') as string

  await checkAccess(empresaId)

  await r2.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: urlStorage,
  }))

  await prisma.documento.delete({ where: { id } })
  revalidatePath(`/empresas/${empresaId}`)
}
