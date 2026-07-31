import { getTodosUsuarios } from '@/app/actions/usuarios'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AddUsuarioModal } from './AddUsuarioModal'

export default async function UsuariosPage() {
  let usuarios: any[] = []

  try {
    usuarios = await getTodosUsuarios()
  } catch (err) {
    console.error("Erro ao carregar usuários:", err)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-red-500">Erro ou Acesso Negado</h1>
        <p className="text-zinc-400">Você não tem permissão para acessar esta página ou ocorreu um erro.</p>
        <Link href="/">
          <Button variant="outline">Voltar ao Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Botão Voltar */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Usuários</h1>
          </div>
          
          <AddUsuarioModal />
        </div>

        <div className="border border-zinc-800/50 rounded-2xl bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">Nome</TableHead>
                <TableHead className="text-zinc-400 font-medium">E-mail</TableHead>
                <TableHead className="text-zinc-400 font-medium">Nível (Role)</TableHead>
                <TableHead className="text-zinc-400 font-medium">Empresas (Acessos)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32 text-zinc-500">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id} className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
                  <TableCell className="font-medium text-white">{usuario.nome}</TableCell>
                  <TableCell className="text-zinc-400">{usuario.email}</TableCell>
                  <TableCell>
                    <Badge className={usuario.role === 'ADMIN' ? 'bg-primary/20 text-primary hover:bg-primary/30 border-primary/20' : 'bg-zinc-800 text-zinc-400'}>
                      {usuario.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {usuario.role === 'ADMIN' ? (
                        <span className="text-zinc-500 text-sm">Todas (Admin)</span>
                      ) : (
                        usuario.empresasAtribuidas?.map((a: any) => (
                          <Badge key={a.empresaId} variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-900/50">
                            {a.empresa.razaoSocial}
                          </Badge>
                        ))
                      )}
                      {usuario.role !== 'ADMIN' && (!usuario.empresasAtribuidas || usuario.empresasAtribuidas.length === 0) && (
                        <span className="text-zinc-600 text-sm italic">Nenhum</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
