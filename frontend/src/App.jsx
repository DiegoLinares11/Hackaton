import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const SECTION_STYLES = {
  snapshot: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-700', icon: '📋' },
  manufacturing_delivery: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', badge: 'bg-violet-100 text-violet-700', icon: '🏭' },
  performance_use: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700', icon: '⚙️' },
  research_standards: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700', icon: '📚' },
}

const STATUS_STYLES = {
  complete: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Completo' },
  partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Parcial' },
  missing: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Faltante' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.missing
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-gray-500">readiness</span>
      </div>
    </div>
  )
}

function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-700">{summary.complete}</div>
        <div className="text-xs text-green-600 mt-1">Completos</div>
      </div>
      <div className="bg-yellow-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-yellow-700">{summary.partial}</div>
        <div className="text-xs text-yellow-600 mt-1">Parciales</div>
      </div>
      <div className="bg-red-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-700">{summary.missing}</div>
        <div className="text-xs text-red-600 mt-1">Faltantes</div>
      </div>
    </div>
  )
}

function SectionCard({ sectionKey, section, expanded, onToggle }) {
  const style = SECTION_STYLES[sectionKey] || SECTION_STYLES.snapshot

  return (
    <div className={`border rounded-xl overflow-hidden ${style.border}`}>
      <button onClick={onToggle}
        className={`w-full px-5 py-4 flex items-center justify-between ${style.bg} hover:opacity-90 transition`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{style.icon}</span>
          <div className="text-left">
            <h3 className={`font-semibold ${style.text}`}>{section.label}</h3>
            <p className="text-xs text-gray-500">{section.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {section.complete > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{section.complete}</span>}
            {section.partial > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{section.partial}</span>}
            {section.missing > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{section.missing}</span>}
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-gray-100">
          {section.fields.map((field) => (
            <div key={field.key} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-medium text-gray-900">{field.label}</h4>
                <StatusBadge status={field.status} />
              </div>
              {field.evidence && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">Evidencia:</span> {field.evidence}
                </p>
              )}
              {field.status !== 'complete' && field.feedback && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Sugerencia:</span> {field.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadScreen({ onSubmitText, onSubmitFile, loading }) {
  const [text, setText] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) onSubmitFile(file)
  }, [onSubmitFile])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Check My Tech</h1>
        <p className="text-gray-500">Readiness Review con AI para el E4C Solutions Library</p>
      </div>

      {/* File upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition cursor-pointer
          ${dragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-gray-400 bg-white'}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input id="file-input" type="file" accept=".pdf,.txt,.md" className="hidden"
          onChange={(e) => e.target.files[0] && onSubmitFile(e.target.files[0])} />
        <div className="text-4xl mb-3">📄</div>
        <p className="font-medium text-gray-700 mb-1">Arrastra tu documento aquí o haz click para subir</p>
        <p className="text-sm text-gray-400">PDF o TXT — Documentación de tu tecnología</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">o pega tu texto</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Text input */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega aquí la documentación de tu tecnología..."
          rows={8}
          className="w-full px-4 py-3 text-sm resize-none focus:outline-none"
        />
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">{text.length} caracteres</span>
          <button
            onClick={() => text.trim().length >= 50 && onSubmitText(text)}
            disabled={text.trim().length < 50 || loading}
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg
              hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Analizando...' : 'Evaluar documentación'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Esta herramienta es solo advisory. No determina aceptación o rechazo en el Solutions Library.
      </p>
    </div>
  )
}

function ResultsScreen({ report, onReset }) {
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const expandAll = () => {
    const all = {}
    Object.keys(report.sections).forEach(k => { all[k] = true })
    setExpandedSections(all)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Readiness Snapshot</h1>
          {report.technology_name && (
            <p className="text-gray-500">{report.technology_name}</p>
          )}
        </div>
        <button onClick={onReset}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          Nueva evaluación
        </button>
      </div>

      {/* Score + Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-8">
          <ScoreRing score={report.readiness_score} />
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-3">Resumen de completitud</h2>
            <SummaryCards summary={report.summary} />
            <p className="text-xs text-gray-400 mt-3">
              {report.summary.total_fields} campos evaluados del framework E4C Solutions Library
            </p>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Detalle por sección</h2>
        <button onClick={expandAll} className="text-xs text-emerald-600 hover:underline">
          Expandir todas
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {Object.entries(report.sections).map(([key, section]) => (
          <SectionCard
            key={key}
            sectionKey={key}
            section={section}
            expanded={!!expandedSections[key]}
            onToggle={() => toggleSection(key)}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold">Aviso:</span> {report.disclaimer}
        </p>
      </div>

      {/* Priority actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Próximos pasos prioritarios</h2>
        <div className="space-y-3">
          {Object.values(report.sections)
            .flatMap(s => s.fields)
            .filter(f => f.status === 'missing')
            .slice(0, 5)
            .map((field, i) => (
              <div key={field.key} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-medium flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{field.label}</p>
                  <p className="text-sm text-gray-500">{field.feedback}</p>
                </div>
              </div>
            ))}
          {Object.values(report.sections)
            .flatMap(s => s.fields)
            .filter(f => f.status === 'partial')
            .slice(0, 3)
            .map((field, i) => (
              <div key={field.key} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium flex items-center justify-center mt-0.5">
                  {i + 1 + Math.min(5, Object.values(report.sections).flatMap(s => s.fields).filter(f => f.status === 'missing').length)}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{field.label}</p>
                  <p className="text-sm text-gray-500">{field.feedback}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmitText = async (text) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/assess/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, technology_name: '' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Error en la evaluación')
      }
      setReport(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFile = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/assess/file`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Error en la evaluación')
      }
      setReport(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-700">E4C</span>
            <span className="text-sm text-gray-400">Readiness Review</span>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium">
            Track 2: Check My Tech
          </span>
        </div>
      </nav>

      {/* Main */}
      <main className="px-6 py-8">
        {loading && (
          <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analizando documentación...</p>
              <p className="text-sm text-gray-400 mt-1">Evaluando 19 criterios del framework E4C</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-500 underline mt-1">Cerrar</button>
          </div>
        )}

        {report ? (
          <ResultsScreen report={report} onReset={() => setReport(null)} />
        ) : (
          <UploadScreen
            onSubmitText={handleSubmitText}
            onSubmitFile={handleSubmitFile}
            loading={loading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          E4C AI Pilot Hackathon 2026 — Track 2: Check My Tech — Advisory tool only
        </p>
      </footer>
    </div>
  )
}
