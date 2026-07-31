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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo(a), {data.user.nome} ({data.role})
            </p>
          </div>
          <div className="flex items-center gap-4">
            {data.role === 'ADMIN' && (
              <Link href="/empresas">
                <Button variant="outline"><Building2 className="w-4 h-4 mr-2"/> Gerenciar Empresas</Button>
              </Link>
            )}
            <form action={logout}>
              <Button variant="destructive" type="submit">
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </Button>
            </form>
          </div>
        </div>

        {/* ADMIN Stats */}
        {data.role === 'ADMIN' && data.stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalEmpresas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários (Contadores)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalUsuarios}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalDocumentos}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Empresas (Acesso Rápido) */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {data.role === 'ADMIN' ? 'Todas as Empresas' : 'Suas Empresas Atribuídas'}
          </h2>
          {data.empresas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhuma empresa encontrada.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.empresas.map(empresa => (
                <Card key={empresa.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{empresa.razaoSocial}</CardTitle>
                    <p className="text-sm text-muted-foreground">CNPJ: {empresa.cnpj}</p>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/empresas/${empresa.id}`}>
                      <Button className="w-full">
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
