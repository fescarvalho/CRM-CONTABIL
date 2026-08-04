import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Folder, File as FileIcon, Plus, Download, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { criarPasta, excluirPasta } from '@/app/actions/files'
import Link from 'next/link'
import { UploadDocumentoModal } from './UploadDocumentoModal'
import { RenomearPastaModal } from './RenomearPastaModal'
import { CriarPastaModal } from './CriarPastaModal'
import { DocumentosListClient } from './DocumentosListClient'
import { FileFilters } from './FileFilters'
import { DeleteFolderButton } from './DeleteFolderButton'
import { formatCNPJ } from '@/lib/utils'
import { MoverPastaModal } from './MoverPastaModal'
import { PastasListClient } from './PastasListClient'

export default async function FileManagerPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ folder?: string, q?: string, sort?: string }>
}) {
  const { id: empresaId } = await params
  const { folder: currentFolderId, q: searchQuery, sort: sortQuery } = await searchParams

  const supabase = await createClient()
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

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } })
  if (!empresa) return <div>Empresa não encontrada</div>

  // Busca a lista completa de pastas da empresa para o modal de mover
  const todasPastas = await prisma.pasta.findMany({
    where: { empresaId }
  })

  // Pastas da view atual
  const isGlobalSearch = !!searchQuery
  const pastas = isGlobalSearch 
    ? todasPastas.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.nome.localeCompare(b.nome))
    : todasPastas.filter(p => p.parentId === (currentFolderId || null)).sort((a, b) => a.nome.localeCompare(b.nome))

  // Configuração da Ordenação
  let orderBy: any = { nome: 'asc' }
  if (sortQuery === 'name_desc') orderBy = { nome: 'desc' }
  else if (sortQuery === 'date_desc') orderBy = { criadoEm: 'desc' }
  else if (sortQuery === 'date_asc') orderBy = { criadoEm: 'asc' }
  else if (sortQuery === 'size_desc') orderBy = { tamanhoBytes: 'desc' }
  else if (sortQuery === 'size_asc') orderBy = { tamanhoBytes: 'asc' }

  // Configuração do Filtro
  let docWhere: any = { empresaId }
  if (isGlobalSearch) {
    docWhere.nome = { contains: searchQuery, mode: 'insensitive' }
  } else {
    docWhere.pastaId = currentFolderId || null
  }

  const documentos = await prisma.documento.findMany({
    where: docWhere,
    orderBy
  })

  // Breadcrumb
  let breadcrumbs: { id: string, nome: string }[] = []
  if (currentFolderId) {
    let curr = todasPastas.find(p => p.id === currentFolderId)
    while (curr) {
      breadcrumbs.unshift({ id: curr.id, nome: curr.nome })
      if (curr.parentId) {
        curr = todasPastas.find(p => p.id === curr?.parentId)
      } else {
        break
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <Link href="/empresas">
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white pl-0">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Empresas
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{empresa.razaoSocial}</h1>
            <p className="text-muted-foreground mt-1">CNPJ: {formatCNPJ(empresa.cnpj)}</p>
            <div className="flex items-center text-muted-foreground gap-2 mt-2">
              <Link href={`/empresas/${empresaId}`} className="hover:underline">Home</Link>
              {breadcrumbs.map(b => (
                <span key={b.id} className="flex items-center gap-2">
                  <span>/</span>
                  <Link href={`/empresas/${empresaId}?folder=${b.id}`} className="hover:underline">
                    {b.nome}
                  </Link>
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <CriarPastaModal empresaId={empresaId} currentFolderId={currentFolderId} />
            <UploadDocumentoModal empresaId={empresaId} pastaId={currentFolderId} />
          </div>
        </div>

        <FileFilters />

        <div className="border rounded-lg bg-card overflow-hidden">
          <PastasListClient 
            empresaId={empresaId}
            pastas={pastas.map(p => ({ id: p.id, nome: p.nome, parentId: p.parentId }))}
            todasPastas={todasPastas.map(p => ({ id: p.id, nome: p.nome, parentId: p.parentId }))}
            hasDocumentos={documentos.length > 0}
          />
          
          <DocumentosListClient 
            empresaId={empresaId}
            documentos={documentos.map(d => ({
              id: d.id,
              nome: d.nome,
              urlStorage: d.urlStorage,
              tamanhoBytes: d.tamanhoBytes,
              pastaId: d.pastaId,
              criadoEm: d.criadoEm.toISOString(),
              pastaNome: isGlobalSearch && d.pastaId ? todasPastas.find(p => p.id === d.pastaId)?.nome : undefined
            }))}
            todasPastas={todasPastas.map(p => ({
              id: p.id,
              nome: p.nome,
              parentId: p.parentId
            }))}
          />
        </div>
      </div>
    </div>
  )
}
