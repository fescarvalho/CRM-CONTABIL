import { getControles } from '@/app/actions/fechamentos'
import { ControleTableClient } from './ControleTableClient'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CalendarCheck } from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Controle Contábil - CloudAbreu'
}

export default async function FechamentosPage({
  searchParams
}: {
  searchParams: Promise<{ ano?: string }>
}) {
  const { ano } = await searchParams
  
  const anoAtual = ano ? parseInt(ano, 10) : new Date().getFullYear()

  const data = await getControles(anoAtual)

  if (!data) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 shadow-xl shadow-black/20">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-zinc-800 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-white">Controle Contábil</h1>
              </div>
              <p className="text-zinc-400 mt-1">
                Gerenciamento de obrigações mensais e fechamentos anuais
              </p>
            </div>
          </div>
        </div>

        {/* Tabela Interativa */}
        <ControleTableClient empresas={data.empresas} anoAtual={anoAtual} />
        
      </div>
    </div>
  )
}
