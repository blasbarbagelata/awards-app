'use client'

import { useEffect, useState } from 'react'

interface Ranking {
  candidate: { id: string; name: string }
  points: number
  position: number
}

interface CategoryResult {
  category: { id: string; name: string; description: string }
  rankings: Ranking[]
  hasTie: boolean
}

const POSITION_CONFIG = [
  { emoji: '👑', label: '1er lugar', bg: 'bg-gold/10', border: 'border-gold/40', text: 'text-gold' },
  { emoji: '🥈', label: '2do lugar', bg: 'bg-white/5', border: 'border-white/20', text: 'text-white/70' },
  { emoji: '🥉', label: '3er lugar', bg: 'bg-amber-900/10', border: 'border-amber-700/30', text: 'text-amber-600' },
]

export default function ResultadosPage() {
  const [results, setResults] = useState<CategoryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  // Guarda qué categorías están reveladas y cuántos candidatos se muestran
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({})

  async function fetchResults() {
    try {
      const res = await fetch('/api/results')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al cargar los resultados.')
        return
      }
      setResults(data)
      setLastUpdated(new Date())
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [])

  function revelarCategoria(categoryId: string, totalWithVotes: number) {
    setRevealed((prev) => ({ ...prev, [categoryId]: true }))
    // Empieza mostrando solo el último (menos puntos)
    setVisibleCount((prev) => ({ ...prev, [categoryId]: 1 }))
  }

  function mostrarSiguiente(categoryId: string, totalWithVotes: number) {
    setVisibleCount((prev) => {
      const current = prev[categoryId] ?? 1
      return { ...prev, [categoryId]: Math.min(current + 1, totalWithVotes) }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold text-4xl mb-4 animate-spin">✦</div>
          <p className="text-white/50">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchResults} className="btn-ghost px-6 py-2 rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const hasNoResults = results.every((r) => r.rankings.length === 0)

  return (
    <div className="min-h-screen bg-dark">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/3 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-dark-border bg-dark/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="font-serif text-4xl md:text-5xl shimmer-text mb-2">Resultados</h1>
          <p className="text-white/40 text-sm">Gala de Amigos · Los Premios</p>
          {lastUpdated && (
            <p className="text-white/20 text-xs mt-2">
              Actualizado: {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              {' · '}
              <button
                onClick={fetchResults}
                className="text-gold/40 hover:text-gold/70 transition-colors underline underline-offset-2"
              >
                Actualizar
              </button>
            </p>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {hasNoResults ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="font-serif text-2xl text-gold mb-3">Sin resultados aún</h2>
            <p className="text-white/40">
              La votación aún no ha cerrado o no se han registrado votos todavía.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result, catIndex) => {
              const isRevealed = revealed[result.category.id] ?? false
              // Solo candidatos con al menos 1 punto, ordenados de menor a mayor
              const rankingsWithVotes = [...result.rankings]
                .filter((r) => r.points > 0)
                .sort((a, b) => a.points - b.points)
              const totalWithVotes = rankingsWithVotes.length
              const count = visibleCount[result.category.id] ?? 1
              // Los que se muestran: tomamos los últimos `count` del array (de menos a más)
              const visible = rankingsWithVotes.slice(0, count)
              const allRevealed = count >= totalWithVotes

              return (
                <div
                  key={result.category.id}
                  className="rounded-xl border border-dark-border bg-dark-card overflow-hidden"
                >
                  {/* Category header — siempre visible */}
                  <div className="px-6 py-5 border-b border-dark-border bg-dark-surface">
                    <div className="flex items-start gap-3">
                      <span className="text-gold/40 font-mono text-sm mt-1">#{catIndex + 1}</span>
                      <div>
                        <h2 className="font-serif text-2xl text-white mb-1">{result.category.name}</h2>
                        <p className="text-white/40 text-sm">{result.category.description}</p>
                      </div>
                    </div>
                    {result.hasTie && isRevealed && allRevealed && (
                      <div className="mt-3 flex items-center gap-2 text-gold/60 text-xs">
                        <span>⚡</span>
                        <span>Hay empate en el primer lugar</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    {!isRevealed ? (
                      // Estado oculto
                      <div className="text-center py-6">
                        <div className="text-4xl mb-4">🔒</div>
                        <p className="text-white/40 text-sm mb-6">
                          Los resultados están ocultos
                        </p>
                        <button
                          onClick={() => revelarCategoria(result.category.id, totalWithVotes)}
                          className="btn-gold px-8 py-3 rounded-lg font-semibold text-sm"
                        >
                          Revelar resultados ✨
                        </button>
                      </div>
                    ) : (
                      // Estado revelado
                      <div className="space-y-3">
                        {totalWithVotes === 0 ? (
                          <p className="text-white/30 text-center py-4 text-sm">Sin votos registrados</p>
                        ) : (
                          <>
                            {visible.map((ranking) => {
                              // Posición real en el ranking final (de más a menos puntos)
                              const realIdx = rankingsWithVotes
                                .slice()
                                .sort((a, b) => b.points - a.points)
                                .findIndex((r) => r.candidate.id === ranking.candidate.id)
                              const isFirst = realIdx === 0 && allRevealed
                              const config = POSITION_CONFIG[realIdx] || {
                                emoji: `${realIdx + 1}.`,
                                label: `${realIdx + 1}º lugar`,
                                bg: 'bg-dark-surface',
                                border: 'border-dark-border',
                                text: 'text-white/40',
                              }

                              return (
                                <div
                                  key={ranking.candidate.id}
                                  className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all ${
                                    isFirst
                                      ? `${config.bg} ${config.border} shadow-lg shadow-gold/10`
                                      : 'bg-dark-surface border-dark-border'
                                  }`}
                                >
                                  <div className="flex-shrink-0 text-2xl">
                                    {allRevealed ? config.emoji : '·'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-base truncate ${isFirst ? 'text-white' : 'text-white/70'}`}>
                                      {ranking.candidate.name}
                                    </p>
                                    {allRevealed && (
                                      <p className={`text-xs ${config.text}`}>{config.label}</p>
                                    )}
                                  </div>
                                  <div className={`flex-shrink-0 text-right ${isFirst ? 'text-gold' : 'text-white/40'}`}>
                                    <p className="font-bold text-lg">{ranking.points}</p>
                                    <p className="text-xs text-white/30">pts</p>
                                  </div>
                                  {allRevealed && (
                                    <div className="flex-shrink-0 hidden sm:block w-24">
                                      <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-700 ${isFirst ? 'bg-gold' : 'bg-white/20'}`}
                                          style={{
                                            width: `${
                                              rankingsWithVotes.sort((a, b) => b.points - a.points)[0].points > 0
                                                ? (ranking.points / rankingsWithVotes.sort((a, b) => b.points - a.points)[0].points) * 100
                                                : 0
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}

                            {/* Botón para revelar el siguiente */}
                            {!allRevealed && (
                              <div className="text-center pt-4">
                                <p className="text-white/30 text-xs mb-3">
                                  Mostrando {count} de {totalWithVotes} candidatos con votos
                                </p>
                                <button
                                  onClick={() => mostrarSiguiente(result.category.id, totalWithVotes)}
                                  className="btn-gold px-6 py-2 rounded-lg text-sm font-semibold"
                                >
                                  Siguiente ▲
                                </button>
                              </div>
                            )}

                            {allRevealed && (
                              <div className="text-center pt-2">
                                <p className="text-gold/40 text-xs">✦ Resultados completos</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center mt-12 text-white/20 text-xs">
          <p>Los Premios · Gala de Amigos · {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  )
}