'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Contraseña incorrecta.')
        setLoading(false)
        return
      }
      router.push('/admin/dashboard')
    } catch {
      setError('Error de conexión.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">⚙️</div>
          <h1 className="font-serif text-3xl text-gold mb-1">Panel de Administración</h1>
          <p className="text-white/40 text-sm">Los Premios · Gala de Amigos</p>
        </div>

        <div className="card-gold rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-4 py-3 transition-colors"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-gold w-full py-3 rounded-lg"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Acceso restringido a administradores
        </p>
      </div>
    </main>
  )
}
