'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { r2, BUCKET_NAME } from '@/lib/s3'
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { revalidatePath } from 'next/cache'
import { registrarLogAuditoria } from './logs'

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

  const pasta = await prisma.pasta.create({
    data: {
      nome,
      empresaId,
      parentId: parentId || null
    }
  })

  await registrarLogAuditoria('CRIAR_PASTA', `Criou a pasta ${nome}.`)

  revalidatePath(`/empresas/${empresaId}`)
}

export async function syncFolderStructure(empresaId: string, baseFolderId: string | null, folderPaths: string[]) {
// ... omitted code since it's too long, but wait!
// Actually let's just do replace_file_content on specific chunks.
// Since it's a huge file, I should be careful.
  await checkAccess(empresaId)

  const todasPastas = await prisma.pasta.findMany({ where: { empresaId } })
  const uniquePaths = Array.from(new Set(folderPaths)).sort((a, b) => a.length - b.length)

  const createdIds: Record<string, string> = {} 
  if (baseFolderId) {
    createdIds[''] = baseFolderId 
  }

  for (const path of uniquePaths) {
    if (!path) continue
    const parts = path.split('/')
    let currentParentId = baseFolderId

    let currentPath = ''
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      if (createdIds[currentPath]) {
        currentParentId = createdIds[currentPath]
        continue
      }

      let folder = todasPastas.find(p => p.nome === part && p.parentId === currentParentId)
      
      if (!folder) {
        folder = await prisma.pasta.create({
          data: {
            nome: part,
            empresaId,
            parentId: currentParentId
          }
        })
        todasPastas.push(folder)
      }
      
      createdIds[currentPath] = folder.id
      currentParentId = folder.id
    }
  }

  return createdIds
}

export async function renamePasta(formData: FormData) {
  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const empresaId = formData.get('empresaId') as string
  
  await checkAccess(empresaId)

  await prisma.pasta.update({
    where: { id },
    data: { nome }
  })

  revalidatePath(`/empresas/${empresaId}`)
}

export async function moverDocumento(formData: FormData) {
  const id = formData.get('id') as string
  const empresaId = formData.get('empresaId') as string
  const pastaId = formData.get('pastaId') as string
  
  await checkAccess(empresaId)

  await prisma.documento.update({
    where: { id },
    data: {
      pastaId: pastaId === 'root' ? null : pastaId
    }
  })

  revalidatePath(`/empresas/${empresaId}`)
}

export async function excluirPasta(formData: FormData) {
  const id = formData.get('id') as string
  const empresaId = formData.get('empresaId') as string
  
  await checkAccess(empresaId)

  // Soft Delete
  await prisma.pasta.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  revalidatePath(`/empresas/${empresaId}`)
}

export async function moverPasta(formData: FormData) {
  const id = formData.get('id') as string
  const empresaId = formData.get('empresaId') as string
  const parentId = formData.get('parentId') as string
  
  await checkAccess(empresaId)

  await prisma.pasta.update({
    where: { id },
    data: {
      parentId: parentId === 'root' ? null : parentId
    }
  })

  revalidatePath(`/empresas/${empresaId}`)
}

export async function moverPastasEmMassa(formData: FormData) {
  const empresaId = formData.get('empresaId') as string
  const parentId = formData.get('parentId') as string
  const pastaIds = formData.getAll('pastaIds') as string[]
  
  await checkAccess(empresaId)

  if (pastaIds.length > 0) {
    await prisma.pasta.updateMany({
      where: { 
        id: { in: pastaIds },
        empresaId
      },
      data: {
        parentId: parentId === 'root' ? null : parentId
      }
    })
  }

  revalidatePath(`/empresas/${empresaId}`)
}

export async function moverDocumentosEmMassa(formData: FormData) {
  const empresaId = formData.get('empresaId') as string
  const pastaId = formData.get('pastaId') as string
  const docIds = formData.getAll('docIds') as string[]
  
  await checkAccess(empresaId)

  if (docIds.length > 0) {
    await prisma.documento.updateMany({
      where: { 
        id: { in: docIds },
        empresaId // Segurança extra
      },
      data: {
        pastaId: pastaId === 'root' ? null : pastaId
      }
    })
  }

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

  await Promise.all(validFiles.map(async (file) => {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const docId = crypto.randomUUID()
    const extension = file.name.split('.').pop()
    const urlStorage = `${empresaId}/${pastaId || 'raiz'}/${docId}.${extension}`

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: urlStorage,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream'
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
    await registrarLogAuditoria('UPLOAD', `Fez o upload do arquivo ${file.name}.`)
  }))

  revalidatePath(`/empresas/${empresaId}`)
}

export async function getSignedDownloadUrl(empresaId: string, urlStorage: string) {
  await checkAccess(empresaId)
  
  const doc = await prisma.documento.findUnique({ where: { urlStorage } })
  if (doc) {
    await registrarLogAuditoria('VISUALIZAR', `Acessou/baixou o arquivo ${doc.nome}.`)
  }
  
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

  await checkAccess(empresaId)

  const doc = await prisma.documento.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
  
  await registrarLogAuditoria('EXCLUIR', `Moveu o documento ${doc.nome} para a lixeira.`)

  revalidatePath(`/empresas/${empresaId}`)
}

export async function restaurarDocumento(id: string, empresaId: string) {
  await checkAccess(empresaId)
  const doc = await prisma.documento.update({
    where: { id },
    data: { deletedAt: null }
  })
  await registrarLogAuditoria('RESTAURAR', `Restaurou o documento ${doc.nome} da lixeira.`)
  revalidatePath(`/empresas/${empresaId}`)
}

export async function restaurarPasta(id: string, empresaId: string) {
  await checkAccess(empresaId)
  const pasta = await prisma.pasta.update({
    where: { id },
    data: { deletedAt: null }
  })
  await registrarLogAuditoria('RESTAURAR', `Restaurou a pasta ${pasta.nome} da lixeira.`)
  revalidatePath(`/empresas/${empresaId}`)
}

export async function excluirDocumentoPermanente(id: string, empresaId: string, urlStorage: string) {
  await checkAccess(empresaId)

  await r2.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: urlStorage,
  }))

  const doc = await prisma.documento.delete({ where: { id } })
  await registrarLogAuditoria('EXCLUIR_PERMANENTE', `Excluiu permanentemente o documento ${doc.nome}.`)
  revalidatePath(`/empresas/${empresaId}`)
}

export async function excluirPastaPermanente(id: string, empresaId: string) {
  await checkAccess(empresaId)
  const pasta = await prisma.pasta.delete({ where: { id } })
  await registrarLogAuditoria('EXCLUIR_PERMANENTE', `Excluiu permanentemente a pasta ${pasta.nome}.`)
  revalidatePath(`/empresas/${empresaId}`)
}
