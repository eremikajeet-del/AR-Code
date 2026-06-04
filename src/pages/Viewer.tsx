import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { ModelRecord } from '../hooks/useModels'
import { Home, AlertCircle, Share2 } from 'lucide-react'

export default function Viewer() {
  const { id } = useParams<{ id: string }>()
  const [model, setModel] = useState<ModelRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadModel() {
      if (!id) {
        setError('No model ID specified.')
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data, error: fetchErr } = await supabase
          .from('models')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchErr) throw fetchErr
        if (data) {
          setModel(data)
        } else {
          setError('The requested 3D model could not be found or has been deleted.')
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading the 3D model.')
      } finally {
        setLoading(false)
      }
    }

    loadModel()
  }, [id])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel px-4 text-center">
        <div className="space-y-5 rounded-[28px] border border-[#2d2318] bg-[#120d09]/90 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="mx-auto h-14 w-14 rounded-full border-4 border-[#c9973a]/20 border-t-[#c9973a] animate-spin" />
          <h2 className="text-2xl font-display font-semibold text-white">Preparing your dish...</h2>
          <p className="text-sm text-muted">A premium 3D experience is on its way.</p>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel px-4 text-center">
        <div className="space-y-6 rounded-[28px] border border-[#2d2318] bg-[#120d09]/90 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1510] text-[#c9973a] shadow-[0_12px_40px_rgba(201,151,58,0.18)]">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-white">Dish not found</h2>
          <p className="max-w-md text-sm text-muted">{error || 'The menu item could not be loaded. Please try again later.'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#c9973a]/20 bg-[#1a1510] px-5 py-3 text-sm font-semibold text-[#e8b86d] shadow-[0_18px_45px_rgba(201,151,58,0.12)] transition-all duration-300 hover:bg-[#24190f]"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-panel text-text-primary overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,151,58,0.12),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(232,184,109,0.08),_transparent_20%)] pointer-events-none" />
      <header className="frosted-topbar absolute inset-x-0 top-0 z-20 border-b border-[#c9973a]/15 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#e8b86d]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1a1510] border border-[#2d2318]">🍽️</span>
            <span className="font-display text-white">Tamtara</span>
          </div>
          <div className="min-w-[0] px-4 py-2 text-center text-sm font-display text-white truncate">{model.file_name.replace(/\.[^/.]+$/, '')}</div>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center rounded-2xl border border-[#c9973a]/20 bg-[#1a1510]/90 px-4 py-2 text-sm font-semibold text-[#e8b86d] shadow-[0_16px_40px_rgba(201,151,58,0.12)] transition-all duration-300 hover:bg-[#24190f]"
            title="Copy Link to Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {copied && (
        <div className="absolute inset-x-0 top-20 z-20 flex justify-center px-4">
          <div className="rounded-full border border-[#c9973a]/20 bg-[#12100d]/95 px-4 py-2 text-xs text-[#e8b86d] shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
            Link copied to clipboard!
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-10">
        <model-viewer
          id="viewer-element"
          src={model.public_url}
          alt={`3D model of ${model.file_name}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          camera-controls
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="30deg"
          shadow-intensity="1"
          touch-action="pan-y"
          interaction-prompt="auto"
          style={{ width: '100vw', height: '100vh' }}
        >
          <button
            slot="ar-button"
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #c9973a, #e8b86d)',
              color: '#0a0705',
              border: 'none',
              borderRadius: '999px',
              padding: '16px 32px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700',
              fontSize: '15px',
              minHeight: '52px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              zIndex: 99999,
              boxShadow: '0 4px 24px rgba(201,151,58,0.4)',
              width: 'auto',
              display: 'block',
              boxSizing: 'border-box',
            }}
          >
            ✨ View in AR
          </button>
        </model-viewer>
      </div>

      <div className="absolute inset-x-0 bottom-[118px] z-20 flex justify-center px-4">
        <p className="rounded-full border border-[#2d2318] bg-[#110d09]/90 px-4 py-2 text-center text-xs text-muted backdrop-blur-md">
          Rotate • Pinch to zoom • Tap AR to place on table
        </p>
      </div>
    </div>
  )
}
