'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  description: string
  type: string
  order: number
}

interface Candidate {
  id: string
  name: string
}

interface CategoryVote {
  categoryId: string
  firstId: string
  secondId: string
  thirdId: string
}

export default function VotarPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<Record<string, CategoryVote>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sessionChecked, setSessionChecked] = useState(false)

  // Check session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/vote-code/session')
        const data = await res.json()
        if (!data.valid) {
          router.replace('/')
          return
        }
        setSessionChecked(true)
      } catch {
        router.replace('/')
      }
    }
    checkSession()
  }, [router])

  // Fetch categories and candidates
  useEffect(() => {
    if (!sessionChecked) return
    async function fetchData() {
      try {
        const [catRes, candRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/candidates'),
        ])
        const [cats, cands] = await Promise.all([catRes.json(), candRes.json()])
        setCategories(cats)
        setCandidates(cands)

        // Initialize votes
        const initialVotes: Record<string, CategoryVote> = {}
        for (const cat of cats) {
          initialVotes[cat.id] = { categoryId: cat.id, firstId: '', secondId: '', thirdId: '' }
        }
        setVotes(initialVotes)
      } catch {
        setError('Error al cargar los datos. Recarga la página.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sessionChecked])

  const handleVoteChange = useCallback(
    (categoryId: string, position: 'firstId' | 'secondId' | 'thirdId', value: string) => {
      setVotes((prev) => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], [position]: value },
      }))
    },
    []
  )

  function getAvailableOptions(categoryId: string, position: 'firstId' | 'secondId' | 'thirdId') {
    const categoryVote = votes[categoryId]
    if (!categoryVote) return candidates

    const otherPositions = (['firstId', 'secondId', 'thirdId'] as const).filter(
      (p) => p !== position
    )
    const takenIds = otherPositions
      .map((p) => categoryVote[p])
      .filter((id) => id !== '')

    return candidates.filter((c) => !takenIds.includes(c.id))
  }

  function isCategoryComplete(categoryId: string): boolean {
    const v = votes[categoryId]
    return !!(v?.firstId && v?.secondId && v?.thirdId)
  }

  const completedCount = categories.filter((c) => isCategoryComplete(c.id)).length
  const allComplete = completedCount === categories.length && categories.length > 0

  async function handleSubmit() {
    if (!allComplete) {
      setError('Por favor completa todos los votos antes de enviar.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const votesArray = Object.values(votes)
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: votesArray }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al enviar los votos.')
        setSubmitting(false)
        return
      }
      router.push('/gracias')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setSubmitting(false)
    }
  }

  if (!sessionChecked || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold text-4xl mb-4 animate-spin">✦</div>
          <p className="text-white/50">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-sm border-b border-dark-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl text-gold">Los Premios</h1>
              <p className="text-white/40 text-xs">Gala de Amigos</p>
            </div>
            {/* Progress */}
            <div className="text-right">
              <p className="text-white/60 text-sm">
                <span className="text-gold font-semibold">{completedCount}</span>
                <span className="text-white/40"> / {categories.length}</span>
              </p>
              <p className="text-white/30 text-xs">categorías completadas</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-500 rounded-full"
              style={{ width: categories.length > 0 ? `${(completedCount / categories.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl shimmer-text mb-2">Emite tu voto</h2>
          <p className="text-white/50 text-sm">
            Elige los tres primeros lugares para cada categoría
          </p>
        </div>

        {categories.map((category, index) => {
          const v = votes[category.id] || { firstId: '', secondId: '', thirdId: '' }
          const isComplete = isCategoryComplete(category.id)

          return (
            <div
              key={category.id}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                isComplete
                  ? 'border-gold/40 bg-dark-card shadow-lg shadow-gold/5'
                  : 'border-dark-border bg-dark-card'
              }`}
            >
              {/* Category header */}
              <div className={`px-6 py-4 border-b ${isComplete ? 'border-gold/20' : 'border-dark-border'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold/40 text-sm font-mono">#{index + 1}</span>
                      <h3 className="font-serif text-xl text-white">{category.name}</h3>
                    </div>
                    <p className="text-white/50 text-sm">{category.description}</p>
                  </div>
                  {isComplete && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-gold text-sm">✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selects */}
              <div className="px-6 py-5 space-y-4">
                {/* 1st place */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-gold/70 font-semibold uppercase tracking-wider mb-2">
                    <span className="text-lg">🥇</span> 1er Lugar
                    <span className="text-white/30 font-normal normal-case tracking-normal">(3 puntos)</span>
                  </label>
                  <select
                    className="gold-select"
                    value={v.firstId}
                    onChange={(e) => handleVoteChange(category.id, 'firstId', e.target.value)}
                  >
                    <option value="" disabled>— Seleccionar candidato —</option>
                    {getAvailableOptions(category.id, 'firstId').map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {v.firstId && !getAvailableOptions(category.id, 'firstId').find(c => c.id === v.firstId) && (
                      <option value={v.firstId}>
                        {candidates.find(c => c.id === v.firstId)?.name}
                      </option>
                    )}
                  </select>
                </div>

                {/* 2nd place */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">
                    <span className="text-lg">🥈</span> 2do Lugar
                    <span className="text-white/30 font-normal normal-case tracking-normal">(2 puntos)</span>
                  </label>
                  <select
                    className="gold-select"
                    value={v.secondId}
                    onChange={(e) => handleVoteChange(category.id, 'secondId', e.target.value)}
                    style={{ color: v.secondId ? '#D4AF37' : '#888' }}
                  >
                    <option value="" disabled>— Seleccionar candidato —</option>
                    {getAvailableOptions(category.id, 'secondId').map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {v.secondId && !getAvailableOptions(category.id, 'secondId').find(c => c.id === v.secondId) && (
                      <option value={v.secondId}>
                        {candidates.find(c => c.id === v.secondId)?.name}
                      </option>
                    )}
                  </select>
                </div>

                {/* 3rd place */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
                    <span className="text-lg">🥉</span> 3er Lugar
                    <span className="text-white/30 font-normal normal-case tracking-normal">(1 punto)</span>
                  </label>
                  <select
                    className="gold-select"
                    value={v.thirdId}
                    onChange={(e) => handleVoteChange(category.id, 'thirdId', e.target.value)}
                    style={{ color: v.thirdId ? '#D4AF37' : '#888' }}
                  >
                    <option value="" disabled>— Seleccionar candidato —</option>
                    {getAvailableOptions(category.id, 'thirdId').map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {v.thirdId && !getAvailableOptions(category.id, 'thirdId').find(c => c.id === v.thirdId) && (
                      <option value={v.thirdId}>
                        {candidates.find(c => c.id === v.thirdId)?.name}
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-dark/95 backdrop-blur-sm border-t border-dark-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {error && (
            <div className="mb-3 bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-2 text-red-300 text-sm text-center">
              {error}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white/40 text-xs">
                {allComplete
                  ? '¡Todos los votos completados!'
                  : `Faltan ${categories.length - completedCount} categoría${categories.length - completedCount !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allComplete || submitting}
              className="btn-gold px-8 py-3 rounded-lg text-base"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar mis votos ✦'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
