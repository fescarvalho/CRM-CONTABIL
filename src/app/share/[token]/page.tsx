import { getSharedDocument } from '@/app/actions/share'
import { formatBytes } from '@/lib/utils'
import { FileText, Download, AlertCircle, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  
  const data = await getSharedDocument(token)

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 backdrop-blur-md">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Link Inválido ou Expirado</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Este link de compartilhamento não é mais válido. Por favor, solicite um novo link ao seu contador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { doc, downloadUrl } = data
  const isPDF = doc.tipoMime?.includes('pdf') || doc.nome.toLowerCase().endsWith('.pdf')
  const isImage = doc.tipoMime?.includes('image') || doc.nome.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-lg bg-zinc-900/60 border-zinc-800/50 backdrop-blur-xl shadow-2xl relative z-10">
        <CardContent className="pt-8 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Cloud className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">CloudAbreu</h1>
          <p className="text-sm text-zinc-400 mb-8">{doc.empresa.razaoSocial} compartilhou um arquivo com você.</p>

          <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left overflow-hidden flex-1">
              <h2 className="text-sm font-semibold text-zinc-200 truncate">{doc.nome}</h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">{formatBytes(doc.tamanhoBytes)}</p>
            </div>
          </div>

          {(isPDF || isImage) ? (
            <div className="w-full flex gap-3">
              <Link href={downloadUrl} target="_blank" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-12">
                  <FileText className="w-4 h-4 mr-2" /> Visualizar
                </Button>
              </Link>
              <Link href={downloadUrl} download>
                <Button variant="outline" className="h-12 w-12 p-0 border-zinc-700 hover:bg-zinc-800">
                  <Download className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={downloadUrl} download className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-12">
                <Download className="w-4 h-4 mr-2" /> Baixar Arquivo
              </Button>
            </Link>
          )}

          <p className="text-xs text-zinc-600 mt-8">
            Plataforma Segura e Criptografada
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
