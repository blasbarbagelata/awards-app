'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) {
      setError('Por favor ingresa tu código de acceso.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/vote-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ocurrió un error. Inténtalo de nuevo.')
        setLoading(false)
        return
      }
      router.push('/votar')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-dark flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Decorative stars */}
      <div className="absolute top-16 left-8 text-gold/30 text-2xl select-none animate-float" style={{ animationDelay: '0s' }}>✦</div>
      <div className="absolute top-32 right-12 text-gold/20 text-lg select-none animate-float" style={{ animationDelay: '0.7s' }}>✧</div>
      <div className="absolute top-48 left-24 text-gold/15 text-sm select-none animate-float" style={{ animationDelay: '1.4s' }}>✦</div>
      <div className="absolute bottom-48 right-8 text-gold/30 text-2xl select-none animate-float" style={{ animationDelay: '0.3s' }}>✦</div>
      <div className="absolute bottom-32 left-16 text-gold/20 text-base select-none animate-float" style={{ animationDelay: '1s' }}>✧</div>
      <div className="absolute top-64 right-32 text-gold/15 text-xl select-none animate-float" style={{ animationDelay: '1.7s' }}>✦</div>
      <div className="absolute bottom-64 left-40 text-gold/20 text-sm select-none animate-float" style={{ animationDelay: '0.5s' }}>✧</div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Trophy icon */}
        <div className="text-6xl mb-6 animate-float">🏆</div>

        {/* Title */}
        <h1 className="font-serif text-6xl md:text-7xl font-bold shimmer-text text-center mb-2 tracking-tight">
          Los Premios
        </h1>

        {/* Subtitle */}
        <p className="font-serif text-xl md:text-2xl text-gold/80 text-center mb-3 tracking-widest uppercase">
          Gala de Amigos
        </p>

        {/* Decorative line */}
        <div className="flex items-center gap-3 mb-8 w-full max-w-xs">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-gold text-lg">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/50" />
        </div>

        {/* Description */}
        <p className="text-white/60 text-center text-sm md:text-base mb-10 max-w-sm leading-relaxed">
          La ceremonia de premiación más esperada del año ha llegado. Usa tu código de acceso exclusivo para emitir tus votos.
        </p>

        {/* Code input card */}
        <div className="w-full card-gold rounded-xl p-8 shadow-2xl shadow-black/50">
          <h2 className="font-serif text-xl text-gold text-center mb-6">
            Ingresa tu código
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white text-center text-2xl tracking-[0.5em] font-mono rounded-lg px-4 py-4 transition-colors placeholder:text-white/20 uppercase"
                disabled={loading}
                autoComplete="off"
                autoFocus
              />
              <p className="text-white/30 text-xs text-center mt-2">
                Código de 6 caracteres (letras y números)
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length === 0}
              className="btn-gold w-full py-4 text-base rounded-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Ingresar ✦'
              )}
            </button>
          </form>
        </div>

        {/* Decorative bottom */}
        <div className="flex items-center gap-3 mt-8 w-full max-w-xs">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold/40 text-sm">✦ ✦ ✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-white/20 text-xs">
        <p>Los Premios · Gala de Amigos · {new Date().getFullYear()}</p>
      </footer>
    </main>
  )
}
