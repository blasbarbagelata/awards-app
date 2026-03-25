'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  electionOpen: boolean
  totalCodes: number
  usedCodes: number
  pendingCodes: number
  testTotal: number
  testUsed: number
  totalSubmissions: number
}

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
  isActive: boolean
}

interface VoteCode {
  id: string
  code: string
  label: string | null
  isTest: boolean
  usedAt: string | null
  createdAt: string
}

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

// ─── Main component ──────────────────────────────────────────────────────────

type Tab = 'resumen' | 'categorias' | 'candidatos' | 'codigos' | 'resultados'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('resumen')
  const [authChecked, setAuthChecked] = useState(false)

  // Verify admin auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (!res.ok) {
          router.replace('/admin')
          return
        }
        setAuthChecked(true)
      } catch {
        router.replace('/admin')
      }
    }
    checkAuth()
  }, [router])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold text-4xl mb-4 animate-spin">✦</div>
          <p className="text-white/50">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'resumen', label: 'Resumen', icon: '📊' },
    { id: 'categorias', label: 'Categorías', icon: '🏷️' },
    { id: 'candidatos', label: 'Candidatos', icon: '👥' },
    { id: 'codigos', label: 'Códigos', icon: '🔑' },
    { id: 'resultados', label: 'Resultados', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen bg-dark">
      {/* Top bar */}
      <header className="border-b border-dark-border bg-dark-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gold font-serif text-lg">⚙️ Admin</span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-sm">Los Premios</span>
          </div>
          <div className="flex items-center gap-2">
  
    <a href="/resultados"
    target="_blank"
    className="btn-ghost px-4 py-2 text-sm rounded-lg text-gold/70 hover:text-gold"
  >
    Ver resultados ↗
  </a>
  <button onClick={handleLogout} className="btn-ghost px-4 py-2 text-sm rounded-lg">
    Cerrar sesión
  </button>
  </div>    
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-dark-border bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'resumen' && <ResumenSection />}
        {activeTab === 'categorias' && <CategoriasSection />}
        {activeTab === 'candidatos' && <CandidatosSection />}
        {activeTab === 'codigos' && <CodigosSection />}
        {activeTab === 'resultados' && <ResultadosSection />}
      </div>
    </div>
  )
}

// ─── Resumen Section ──────────────────────────────────────────────────────────

function ResumenSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      setStats(data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  async function toggleElection() {
    if (!stats) return
    setToggling(true)
    try {
      const res = await fetch('/api/admin/election', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !stats.electionOpen }),
      })
      if (res.ok) {
        setMessage(stats.electionOpen ? 'Votación cerrada.' : 'Votación abierta.')
        await fetchStats()
        setTimeout(() => setMessage(''), 3000)
      }
    } finally {
      setToggling(false)
    }
  }

  async function resetTestVotes() {
    setResetting(true)
    try {
      const res = await fetch('/api/admin/reset-test', { method: 'POST' })
      const data = await res.json()
      setMessage(`Votos de prueba eliminados: ${data.deletedVotes}. Códigos restablecidos: ${data.resetCodes}.`)
      setTimeout(() => setMessage(''), 5000)
      setResetConfirm(false)
    } finally {
      setResetting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-gold">Resumen</h2>

      {message && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 text-gold text-sm">
          {message}
        </div>
      )}

      {/* Election status */}
      <div className={`rounded-xl border p-6 ${stats?.electionOpen ? 'border-green-500/40 bg-green-900/10' : 'border-dark-border bg-dark-card'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Estado de la votación</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stats?.electionOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={stats?.electionOpen ? 'text-green-400' : 'text-red-400'}>
                {stats?.electionOpen ? 'Abierta — Los votantes pueden votar' : 'Cerrada — No se aceptan votos'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleElection}
            disabled={toggling}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              stats?.electionOpen
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'btn-gold'
            }`}
          >
            {toggling ? 'Cambiando...' : stats?.electionOpen ? 'Cerrar votación' : 'Abrir votación'}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Votos enviados', value: stats?.totalSubmissions ?? 0, icon: '📨', color: 'text-gold' },
          { label: 'Códigos usados', value: stats?.usedCodes ?? 0, icon: '✅', color: 'text-green-400' },
          { label: 'Códigos pendientes', value: stats?.pendingCodes ?? 0, icon: '⏳', color: 'text-white/70' },
          { label: 'Total de códigos', value: stats?.totalCodes ?? 0, icon: '🔑', color: 'text-white/50' },
          { label: 'Códigos de prueba', value: stats?.testTotal ?? 0, icon: '🧪', color: 'text-blue-400' },
          { label: 'Prueba usados', value: stats?.testUsed ?? 0, icon: '🧪✅', color: 'text-blue-300' },
        ].map((stat) => (
          <div key={stat.label} className="card rounded-xl p-4">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Reset test votes */}
      <div className="card rounded-xl p-6">
        <h3 className="text-white font-semibold mb-2">Votos de prueba</h3>
        <p className="text-white/40 text-sm mb-4">
          Elimina todos los votos emitidos con códigos de prueba y restablece esos códigos para poder usarlos de nuevo.
        </p>
        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="btn-ghost px-4 py-2 text-sm rounded-lg border-red-500/50 text-red-400 hover:bg-red-900/20"
          >
            Resetear votos de prueba
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm">¿Confirmar?</span>
            <button
              onClick={resetTestVotes}
              disabled={resetting}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {resetting ? 'Reseteando...' : 'Sí, resetear'}
            </button>
            <button onClick={() => setResetConfirm(false)} className="btn-ghost px-4 py-2 text-sm rounded-lg">
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Categorías Section ───────────────────────────────────────────────────────

function CategoriasSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', type: 'normal', order: 0 })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', type: 'normal', order: 0 })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  function showMsg(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ name: '', description: '', type: 'normal', order: 0 })
      await fetchCategories()
      showMsg('Categoría creada.')
    }
    setSaving(false)
  }

  async function handleUpdate(id: string) {
    setSaving(true)
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setEditId(null)
      await fetchCategories()
      showMsg('Categoría actualizada.')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    await fetchCategories()
    showMsg('Categoría eliminada.')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-gold">Categorías</h2>

      {message && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 text-gold text-sm">{message}</div>
      )}

      {/* Create form */}
      <div className="card rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Nueva categoría</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/50 text-xs block mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre de la categoría"
              required
              className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="normal">Normal</option>
              <option value="media">Media</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-white/50 text-xs block mb-1">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción breve"
              required
              className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Orden</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="btn-gold px-6 py-2 rounded-lg text-sm">
              {saving ? 'Guardando...' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="card rounded-xl p-4">
            {editId === cat.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/50 text-xs block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-1">Orden</label>
                    <input
                      type="number"
                      value={editForm.order}
                      onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })}
                      className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/50 text-xs block mb-1">Descripción</label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(cat.id)} disabled={saving} className="btn-gold px-4 py-2 text-sm rounded-lg">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditId(null)} className="btn-ghost px-4 py-2 text-sm rounded-lg">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gold/40 text-xs font-mono">#{cat.order}</span>
                    <span className="text-white font-semibold">{cat.name}</span>
                    <span className="text-white/30 text-xs px-2 py-0.5 rounded bg-dark-surface border border-dark-border">
                      {cat.type}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm">{cat.description}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditId(cat.id); setEditForm({ name: cat.name, description: cat.description, type: cat.type, order: cat.order }) }}
                    className="text-gold/60 hover:text-gold text-sm px-3 py-1.5 rounded border border-dark-border hover:border-gold/40 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-400/60 hover:text-red-400 text-sm px-3 py-1.5 rounded border border-dark-border hover:border-red-500/40 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-white/30 text-center py-8">No hay categorías creadas.</p>
        )}
      </div>
    </div>
  )
}

// ─── Candidatos Section ───────────────────────────────────────────────────────

function CandidatosSection() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchCandidates = useCallback(async () => {
    const res = await fetch('/api/admin/candidates')
    const data = await res.json()
    setCandidates(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  function showMsg(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      setNewName('')
      await fetchCandidates()
      showMsg('Candidato creado.')
    }
    setSaving(false)
  }

  async function handleUpdate(id: string) {
    setSaving(true)
    await fetch(`/api/admin/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    setEditId(null)
    await fetchCandidates()
    showMsg('Candidato actualizado.')
    setSaving(false)
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    await fetchCandidates()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este candidato?')) return
    await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' })
    await fetchCandidates()
    showMsg('Candidato eliminado.')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-gold">Candidatos</h2>

      {message && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 text-gold text-sm">{message}</div>
      )}

      {/* Create form */}
      <div className="card rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Nuevo candidato</h3>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del candidato"
            className="flex-1 bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm transition-colors"
          />
          <button type="submit" disabled={saving || !newName.trim()} className="btn-gold px-6 py-2 rounded-lg text-sm">
            {saving ? 'Guardando...' : 'Agregar'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-2">
        {candidates.map((candidate) => (
          <div key={candidate.id} className={`card rounded-xl p-4 ${!candidate.isActive ? 'opacity-50' : ''}`}>
            {editId === candidate.id ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
                />
                <button onClick={() => handleUpdate(candidate.id)} disabled={saving} className="btn-gold px-4 py-2 text-sm rounded-lg">
                  Guardar
                </button>
                <button onClick={() => setEditId(null)} className="btn-ghost px-4 py-2 text-sm rounded-lg">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${candidate.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-white">{candidate.name}</span>
                  {!candidate.isActive && <span className="text-white/30 text-xs">(inactivo)</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(candidate.id, candidate.isActive)}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                      candidate.isActive
                        ? 'text-red-400/60 border-dark-border hover:border-red-500/40 hover:text-red-400'
                        : 'text-green-400/60 border-dark-border hover:border-green-500/40 hover:text-green-400'
                    }`}
                  >
                    {candidate.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => { setEditId(candidate.id); setEditName(candidate.name) }}
                    className="text-gold/60 hover:text-gold text-xs px-3 py-1.5 rounded border border-dark-border hover:border-gold/40 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(candidate.id)}
                    className="text-red-400/60 hover:text-red-400 text-xs px-3 py-1.5 rounded border border-dark-border hover:border-red-500/40 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {candidates.length === 0 && (
          <p className="text-white/30 text-center py-8">No hay candidatos.</p>
        )}
      </div>
    </div>
  )
}

// ─── Códigos Section ──────────────────────────────────────────────────────────

function CodigosSection() {
  const [codes, setCodes] = useState<VoteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [genForm, setGenForm] = useState({ count: 5, isTest: false, labelPrefix: 'Votante' })
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [newCodes, setNewCodes] = useState<string[]>([])

  const fetchCodes = useCallback(async () => {
    const res = await fetch('/api/admin/codes')
    const data = await res.json()
    setCodes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCodes() }, [fetchCodes])

  function showMsg(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(''), 5000)
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setNewCodes([])
    const res = await fetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genForm),
    })
    const data = await res.json()
    if (res.ok) {
      setNewCodes(data.codes.map((c: VoteCode) => c.code))
      await fetchCodes()
      showMsg(`${data.codes.length} código(s) generado(s).`)
    }
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este código?')) return
    const res = await fetch(`/api/admin/codes/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      showMsg(data.error || 'Error al eliminar.')
      return
    }
    await fetchCodes()
    showMsg('Código eliminado.')
  }

  const totalCodes = codes.length
  const usedCodes = codes.filter((c) => c.usedAt).length
  const testCodes = codes.filter((c) => c.isTest).length

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-gold">Códigos de acceso</h2>

      {message && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 text-gold text-sm">{message}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gold">{totalCodes}</div>
          <div className="text-white/40 text-xs">Total</div>
        </div>
        <div className="card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{usedCodes}</div>
          <div className="text-white/40 text-xs">Usados</div>
        </div>
        <div className="card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{testCodes}</div>
          <div className="text-white/40 text-xs">Prueba</div>
        </div>
      </div>

      {/* Generate form */}
      <div className="card rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Generar códigos</h3>
        <form onSubmit={handleGenerate} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-white/50 text-xs block mb-1">Cantidad</label>
            <input
              type="number"
              min={1}
              max={100}
              value={genForm.count}
              onChange={(e) => setGenForm({ ...genForm, count: parseInt(e.target.value) || 1 })}
              className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Prefijo etiqueta</label>
            <input
              type="text"
              value={genForm.labelPrefix}
              onChange={(e) => setGenForm({ ...genForm, labelPrefix: e.target.value })}
              placeholder="Votante"
              className="w-full bg-dark-surface border border-dark-border focus:border-gold outline-none text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="isTest"
              checked={genForm.isTest}
              onChange={(e) => setGenForm({ ...genForm, isTest: e.target.checked })}
              className="w-4 h-4 accent-gold"
            />
            <label htmlFor="isTest" className="text-white/60 text-sm cursor-pointer">Prueba</label>
          </div>
          <button type="submit" disabled={generating} className="btn-gold py-2 rounded-lg text-sm">
            {generating ? 'Generando...' : 'Generar'}
          </button>
        </form>

        {newCodes.length > 0 && (
          <div className="mt-4 p-4 bg-dark-surface rounded-lg border border-gold/20">
            <p className="text-gold text-xs font-semibold mb-2">Códigos generados:</p>
            <div className="flex flex-wrap gap-2">
              {newCodes.map((c) => (
                <span key={c} className="font-mono text-sm bg-dark border border-gold/30 text-gold px-3 py-1 rounded">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Codes list */}
      <div className="card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left px-4 py-3 text-white/40 font-medium">Código</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Etiqueta</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Usado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-gold bg-dark-surface px-2 py-1 rounded border border-dark-border">
                      {code.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">{code.label || '—'}</td>
                  <td className="px-4 py-3">
                    {code.isTest ? (
                      <span className="text-blue-400 text-xs bg-blue-900/20 px-2 py-0.5 rounded border border-blue-500/30">Prueba</span>
                    ) : (
                      <span className="text-white/40 text-xs">Real</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {code.usedAt ? (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <span>✓</span> Usado
                      </span>
                    ) : (
                      <span className="text-white/30 text-xs">Disponible</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs">
                    {code.usedAt ? new Date(code.usedAt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {!code.usedAt && (
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="text-red-400/50 hover:text-red-400 text-xs transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {codes.length === 0 && (
            <p className="text-white/30 text-center py-8">No hay códigos.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Resultados Section ───────────────────────────────────────────────────────

function ResultadosSection() {
  const [results, setResults] = useState<CategoryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/results')
      const data = await res.json()
      if (res.ok) {
        setResults(data)
        setLastUpdated(new Date())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [fetchResults])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-gold">Resultados en tiempo real</h2>
        <button onClick={fetchResults} className="btn-ghost px-4 py-2 text-sm rounded-lg">
          Actualizar
        </button>
      </div>

      {lastUpdated && (
        <p className="text-white/30 text-xs">
          Última actualización: {lastUpdated.toLocaleTimeString('es')} · Auto-actualiza cada 30s
        </p>
      )}

      {results.map((result) => (
        <div key={result.category.id} className="card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border bg-dark-surface">
            <h3 className="font-serif text-xl text-white">{result.category.name}</h3>
            <p className="text-white/40 text-sm">{result.category.description}</p>
            {result.hasTie && (
              <span className="text-gold/60 text-xs mt-1 inline-block">⚡ Empate</span>
            )}
          </div>
          <div className="p-4 space-y-2">
            {result.rankings.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">Sin votos aún</p>
            ) : (
              result.rankings.map((r, idx) => (
                <div key={r.candidate.id} className={`flex items-center gap-3 p-3 rounded-lg ${idx === 0 ? 'bg-gold/10 border border-gold/20' : 'bg-dark-surface'}`}>
                  <span className="text-xl flex-shrink-0">
                    {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                  </span>
                  <span className={`flex-1 font-medium ${idx === 0 ? 'text-gold' : 'text-white/70'}`}>
                    {r.candidate.name}
                  </span>
                  <span className={`font-bold text-lg flex-shrink-0 ${idx === 0 ? 'text-gold' : 'text-white/40'}`}>
                    {r.points} <span className="text-xs font-normal">pts</span>
                  </span>
                  <div className="w-24 h-1.5 bg-dark-border rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className={`h-full rounded-full ${idx === 0 ? 'bg-gold' : 'bg-white/20'}`}
                      style={{ width: `${result.rankings[0].points > 0 ? (r.points / result.rankings[0].points) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gold text-3xl animate-spin">✦</div>
    </div>
  )
}
