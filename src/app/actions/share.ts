'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'
import { getSignedDownloadUrl } from './files'

const JWT_SECRET = process.env.JWT_SECRET || 'cloudabreu-secret-key-123'

export async function generateShareLink(documentId: string, empresaId: string, expiresInHours: number = 24) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Verifica acesso
  const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
  if (!dbUser) throw new Error('Usuário não encontrado')

  if (dbUser.role !== 'ADMIN') {
    const acesso = await prisma.acessoEmpresa.findUnique({
      where: { usuarioId_empresaId: { usuarioId: dbUser.id, empresaId } }
    })
    if (!acesso) throw new Error('Acesso negado')
  }

  // Gera o token
  const payload = {
    docId: documentId,
    empId: empresaId,
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: `${expiresInHours}h` })
  
  // Como estamos no server, retornamos a URL base + token
  return token // O frontend vai concatenar com o domínio atual
}

export async function getSharedDocument(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { docId: string, empId: string }
    
    const doc = await prisma.documento.findUnique({
      where: { id: decoded.docId },
      include: { empresa: true }
    })

    if (!doc || doc.empresaId !== decoded.empId) {
      return null
    }

    // Como o acesso é público (via token validado), precisamos buscar a URL assinada diretamente
    // pulando a verificação de auth (pois a função getSignedDownloadUrl exige auth).
    // Então vamos importar do s3 diretamente aqui para acesso anônimo:
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { r2, BUCKET_NAME } = await import('@/lib/s3')

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: doc.urlStorage,
    })

    // URL válida por 1 hora (o token pode ser válido por 24h, mas a URL do S3 expira em 1h a cada clique)
    const downloadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })

    return {
      doc,
      downloadUrl
    }
  } catch (error) {
    return null
  }
}
