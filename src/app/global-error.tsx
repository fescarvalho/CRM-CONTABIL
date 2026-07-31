'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex h-screen items-center justify-center bg-zinc-950 text-white flex-col gap-4">
        <h2 className="text-xl font-bold">Ocorreu um erro no servidor</h2>
        <p className="text-zinc-400 text-sm">Digest: {error.digest}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
