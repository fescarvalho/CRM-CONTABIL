import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileManagerClient } from './FileManagerClient'

export default async function FileManagerPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ folder?: string, q?: string, sort?: string, lixeira?: string }>
}) {
  const { id: empresaId } = await params
  const { folder: currentFolderId, q: searchQuery, sort: sortQuery, lixeira: lixeiraQuery } = await searchParams

  const isLixeira = lixeiraQuery === 'true'
  const supabase = await createClient()

  // Buscar TODOS os dados da empresa de uma vez (SPA Mode)
  const empresaPromise = prisma.empresa.findUnique({ where: { id: empresaId } })
  const todasPastasPromise = prisma.pasta.findMany({ 
    where: { empresaId, deletedAt: isLixeira ? { not: null } : null } 
  })
  const todosDocumentosPromise = prisma.documento.findMany({ 
    where: { empresaId, deletedAt: isLixeira ? { not: null } : null },
    orderBy: { criadoEm: 'desc' }
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
  if (!dbUser) redirect('/login')

  if (dbUser.role !== 'ADMIN') {
    const acesso = await prisma.acessoEmpresa.findUnique({
      where: { usuarioId_empresaId: { usuarioId: dbUser.id, empresaId } }
    })
    if (!acesso) redirect('/')
  }

  const [empresa, todasPastas, todosDocumentos] = await Promise.all([
    empresaPromise,
    todasPastasPromise,
    todosDocumentosPromise
  ])

  if (!empresa) return <div>Empresa não encontrada</div>

  return (
    <FileManagerClient 
      empresa={{ id: empresa.id, razaoSocial: empresa.razaoSocial, cnpj: empresa.cnpj }}
      todasPastas={todasPastas.map(p => ({ id: p.id, nome: p.nome, parentId: p.parentId }))}
      todosDocumentos={todosDocumentos.map(d => ({
        id: d.id,
        nome: d.nome,
        urlStorage: d.urlStorage,
        tamanhoBytes: d.tamanhoBytes,
        pastaId: d.pastaId,
        criadoEm: d.criadoEm.toISOString(),
        tags: d.tags
      }))}
      isLixeira={isLixeira}
      initialFolderId={currentFolderId || null}
      initialSearch={searchQuery || ''}
      initialSort={sortQuery || 'name_asc'}
    />
  )
}

