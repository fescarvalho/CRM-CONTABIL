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
import { DocumentosListClient } from './DocumentosListClient'
import { formatCNPJ } from '@/lib/utils'

export default async function FileManagerPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ folder?: string }>
}) {
  const { id: empresaId } = await params
  const { folder: currentFolderId } = await searchParams

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

  // Busca pastas e documentos da pasta atual
  const pastas = todasPastas.filter(p => p.parentId === (currentFolderId || null)).sort((a, b) => a.nome.localeCompare(b.nome))

  const documentos = await prisma.documento.findMany({
    where: { empresaId, pastaId: currentFolderId || null },
    orderBy: { nome: 'asc' }
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
            <Dialog>
              <DialogTrigger render={<Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Nova Pasta</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                </DialogHeader>
                <form action={criarPasta} className="space-y-4">
                  <input type="hidden" name="empresaId" value={empresaId} />
                  {currentFolderId && <input type="hidden" name="parentId" value={currentFolderId} />}
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Pasta</Label>
                    <Input id="nome" name="nome" required />
                  </div>
                  <Button type="submit" className="w-full">Criar</Button>
                </form>
              </DialogContent>
            </Dialog>

            <UploadDocumentoModal empresaId={empresaId} pastaId={currentFolderId} />
          </div>
        </div>

        <div className="border rounded-lg bg-card">
          {pastas.length === 0 && documentos.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Esta pasta está vazia.
            </div>
          ) : (
            <div className="divide-y">
              {pastas.map(pasta => (
                <div key={pasta.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
                  <Link href={`/empresas/${empresaId}?folder=${pasta.id}`} className="flex items-center gap-3 flex-1">
                    <Folder className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{pasta.nome}</span>
                  </Link>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RenomearPastaModal empresaId={empresaId} pasta={pasta} />
                    <form action={excluirPasta}>
                      <input type="hidden" name="id" value={pasta.id} />
                      <input type="hidden" name="empresaId" value={empresaId} />
                      <Button variant="ghost" size="icon" type="submit" title="Excluir Pasta" className="text-zinc-500 hover:text-red-500 transition-colors" onClick={(e) => {
                        if (!confirm('Tem certeza que deseja excluir esta pasta? Os arquivos dentro dela NÃO serão apagados, mas voltarão para a raiz da empresa.')) {
                          e.preventDefault()
                        }
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <DocumentosListClient 
            empresaId={empresaId}
            documentos={documentos.map(d => ({
              id: d.id,
              nome: d.nome,
              urlStorage: d.urlStorage,
              tamanhoBytes: d.tamanhoBytes,
              pastaId: d.pastaId
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
