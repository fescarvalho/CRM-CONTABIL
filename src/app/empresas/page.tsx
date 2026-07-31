import { getEmpresas, getContadores, createEmpresa, updateAcessos } from '@/app/actions/empresas'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default async function EmpresasPage() {
  let empresas = []
  let contadores = []

  try {
    const data = await Promise.all([
      getEmpresas(),
      getContadores()
    ])
    empresas = data[0]
    contadores = data[1]
  } catch (err) {
    console.error("Erro ao carregar empresas:", err)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-red-500">Erro de conexão com o banco de dados</h1>
        <p className="text-zinc-400">Não foi possível carregar a lista de empresas.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Empresas</h1>
          </div>
          
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105" />
            }>
              Nova Empresa
            </DialogTrigger>
            <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Cadastrar Empresa</DialogTitle>
              </DialogHeader>
              <form action={createEmpresa} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial" className="text-zinc-300">Razão Social</Label>
                  <Input id="razaoSocial" name="razaoSocial" required className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-zinc-300">CNPJ</Label>
                  <Input id="cnpj" name="cnpj" required className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary/50 font-mono" />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mt-4">
                  Salvar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-zinc-800/50 rounded-2xl bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">Razão Social</TableHead>
                <TableHead className="text-zinc-400 font-medium">CNPJ</TableHead>
                <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium">Contadores Atribuídos</TableHead>
                <TableHead className="text-right text-zinc-400 font-medium">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-zinc-500">
                    Nenhuma empresa encontrada
                  </TableCell>
                </TableRow>
              )}
              {empresas.map((empresa) => (
                <TableRow key={empresa.id} className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
                  <TableCell className="font-medium text-white">{empresa.razaoSocial}</TableCell>
                  <TableCell className="font-mono text-zinc-400">{empresa.cnpj}</TableCell>
                  <TableCell>
                    <Badge className={empresa.status === 'Ativo' ? 'bg-primary/20 text-primary hover:bg-primary/30 border-primary/20' : 'bg-zinc-800 text-zinc-400'}>
                      {empresa.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {empresa.acessos.map((a: any) => (
                        <Badge key={a.usuarioId} variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-900/50">
                          {a.usuario.nome}
                        </Badge>
                      ))}
                      {empresa.acessos.length === 0 && <span className="text-zinc-600 text-sm italic">Nenhum</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                      Gerenciar Acessos
                    </Button>
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
