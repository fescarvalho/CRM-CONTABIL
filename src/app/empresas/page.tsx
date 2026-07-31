import { getEmpresas, getContadores, createEmpresa, updateAcessos } from '@/app/actions/empresas'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default async function EmpresasPage() {
  const [empresas, contadores] = await Promise.all([
    getEmpresas(),
    getContadores()
  ])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Empresas</h1>
          <Dialog>
            <DialogTrigger render={<Button />}>
              Nova Empresa
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Empresa</DialogTitle>
              </DialogHeader>
              <form action={createEmpresa} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input id="razaoSocial" name="razaoSocial" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" name="cnpj" required />
                </div>
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contadores Atribuídos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhuma empresa encontrada</TableCell>
                </TableRow>
              )}
              {empresas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">{empresa.razaoSocial}</TableCell>
                  <TableCell>{empresa.cnpj}</TableCell>
                  <TableCell>
                    <Badge variant={empresa.status === 'Ativo' ? 'default' : 'secondary'}>
                      {empresa.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {empresa.acessos.map(a => (
                        <Badge key={a.usuarioId} variant="outline">{a.usuario.nome}</Badge>
                      ))}
                      {empresa.acessos.length === 0 && <span className="text-muted-foreground text-sm">Nenhum</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* AQUI ENTRARIA O MULTI-SELECT DE CONTADORES */}
                    <Button variant="ghost" size="sm">Gerenciar Acessos</Button>
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
