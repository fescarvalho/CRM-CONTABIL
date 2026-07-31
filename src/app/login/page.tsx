'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      {/* Efeitos de fundo (bolhas de cor) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />

      <Card className="w-full max-w-sm z-10 bg-zinc-950/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-center bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            CRM Contábil
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Acesse o seu painel de gestão
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-5">
            {state?.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive-foreground flex items-center justify-center text-center">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@exemplo.com.br"
                className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary/50 placeholder:text-zinc-600 transition-all"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary/50 placeholder:text-zinc-600 transition-all"
                required
                disabled={isPending}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all shadow-lg shadow-primary/20" 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
