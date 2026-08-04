import { getDashboardData } from '@/app/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Building2, Users, FileText, LogOut, FolderOpen } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  let data
  try {
    data = await getDashboardData()
  } catch (e) {
    console.error('Dashboard error:', e)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-red-500">Erro de conexão com o banco de dados</h1>
        <p className="text-zinc-400">Verifique as variáveis DATABASE_URL no Vercel.</p>
        <form action={logout}>
          <Button variant="outline" type="submit">Sair da conta</Button>
        </form>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-yellow-500">Usuário não encontrado no sistema</h1>
        <p className="text-zinc-400">Você está logado, mas seu e-mail não foi cadastrado no banco de dados como ADMIN ou CONTADOR.</p>
        <form action={logout}>
          <Button variant="outline" type="submit">Sair e tentar novamente</Button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 shadow-xl shadow-black/20">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-zinc-400 mt-1">
              Bem-vindo(a), <span className="text-primary font-medium">{data.user.nome}</span> ({data.role})
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data.role === 'ADMIN' && (
              <>
                <Link href="/usuarios">
                  <Button variant="outline" className="bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors">
                    <Users className="w-4 h-4 mr-2"/> Gerenciar Usuários
                  </Button>
                </Link>
                <Link href="/empresas">
                  <Button variant="outline" className="bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors">
                    <Building2 className="w-4 h-4 mr-2"/> Gerenciar Empresas
                  </Button>
                </Link>
              </>
            )}
            <form action={logout}>
              <Button variant="destructive" type="submit" className="shadow-lg shadow-destructive/20 transition-all hover:scale-105">
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </Button>
            </form>
          </div>
        </div>

        {/* ADMIN Stats */}
        {data.role === 'ADMIN' && data.stats && (
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 shadow-xl hover:border-primary/30 transition-all group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Total Empresas</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.stats.totalEmpresas}</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 shadow-xl hover:border-primary/30 transition-all group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Total Usuários</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.stats.totalUsuarios}</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 shadow-xl hover:border-primary/30 transition-all group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Documentos</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.stats.totalDocumentos}</div>
              </CardContent>
            </Card>
            
            {/* Gerenciador de Armazenamento */}
            <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 shadow-xl hover:border-primary/30 transition-all group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Armazenamento (R2)</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {(data.stats.totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  de 10 GB livres do limite gratuito
                </div>
                <div className="mt-3 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${Math.min((data.stats.totalBytes / (10 * 1024 * 1024 * 1024)) * 100, 100)}%` }} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Empresas (Acesso Rápido) */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-white">
              {data.role === 'ADMIN' ? 'Todas as Empresas' : 'Suas Empresas Atribuídas'}
            </h2>
          </div>
          
          {data.empresas.length === 0 ? (
            <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 border-dashed">
              <CardContent className="p-12 text-center text-zinc-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Nenhuma empresa encontrada.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.empresas.map(empresa => (
                <Card key={empresa.id} className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 hover:border-primary/50 hover:shadow-primary/5 transition-all group flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg text-white group-hover:text-primary transition-colors">{empresa.razaoSocial}</CardTitle>
                    <p className="text-sm text-zinc-500 font-mono">CNPJ: {empresa.cnpj}</p>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    <Link href={`/empresas/${empresa.id}`}>
                      <Button className="w-full bg-zinc-900 text-zinc-300 hover:bg-primary hover:text-white transition-all">
                        <FolderOpen className="w-4 h-4 mr-2" /> Abrir Arquivos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
