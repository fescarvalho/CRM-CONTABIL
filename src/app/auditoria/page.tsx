import { getLogsAuditoria } from '@/app/actions/logs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AuditoriaPage() {
  let logs: any[] = []

  try {
    logs = await getLogsAuditoria()
  } catch (err) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-red-500">Acesso Negado</h1>
        <p className="text-zinc-400">Apenas administradores podem acessar esta página.</p>
        <Link href="/">
          <Button variant="outline">Voltar ao Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div>
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Histórico de Auditoria</h1>
          </div>
          <div className="text-zinc-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Últimos 1000 registros
          </div>
        </div>

        <div className="border border-zinc-800/50 rounded-2xl bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium w-48">Data e Hora</TableHead>
                <TableHead className="text-zinc-400 font-medium w-64">Usuário</TableHead>
                <TableHead className="text-zinc-400 font-medium w-48">Ação</TableHead>
                <TableHead className="text-zinc-400 font-medium">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32 text-zinc-500">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id} className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                  <TableCell className="text-zinc-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{log.usuario.nome}</span>
                      <span className="text-zinc-500 text-xs">{log.usuario.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.acao.includes('EXCLUIR') ? 'bg-red-500/20 text-red-500' :
                      log.acao.includes('RESTAURAR') ? 'bg-green-500/20 text-green-500' :
                      log.acao.includes('CRIAR') || log.acao.includes('UPLOAD') ? 'bg-blue-500/20 text-blue-500' :
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {log.acao}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {log.detalhes}
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
