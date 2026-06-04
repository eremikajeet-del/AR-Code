import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { ModelRecord } from '../hooks/useModels'

export default function Viewer() {
  const { id } = useParams<{ id: string }>()
  const [model, setModel] = useState<ModelRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0E0D] px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border border-[#FAFAF8] border-t-transparent animate-spin" />
          <p className="text-[13px] text-[#FAFAF8]">Loading</p>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4 text-center">
        <div className="max-w-md rounded-[8px] border border-[#E8E4DC] bg-white px-6 py-10">
          <h1 className="text-[24px] font-serif text-[#1A1714]">Dish not found</h1>
          <p className="mt-4 text-[14px] text-[#8C8479]">This dish may have been removed.</p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-[4px] border border-[#E8E4DC] bg-transparent px-4 py-3 text-[14px] text-[#C17D3C] transition-colors duration-200 hover:bg-[#F5EBE0]"
          >
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0F0E0D] text-[#FAFAF8]">
      <div className="absolute inset-0" />
      <header className="absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between bg-[rgba(15,14,13,0.7)] px-4 backdrop-blur-[12px] sm:px-6">
        <span className="text-[15px] font-serif text-[#F5EBE0]">Tamtara</span>
        <span className="max-w-[160px] truncate text-[13px] font-sans text-[#FAFAF8]">{model.file_name.replace(/\.[^/.]+$/, '')}</span>
      </header>

      <div className="absolute inset-0">
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
              bottom: '32px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#FAFAF8',
              color: '#1A1714',
              border: 'none',
              borderRadius: '4px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              zIndex: 99999,
              minHeight: '48px',
              width: 'auto',
              display: 'block',
              letterSpacing: '0.02em',
              boxSizing: 'border-box',
            }}
          >
            View in AR
          </button>
        </model-viewer>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[92px] z-20 flex justify-center px-4">
        <p className="rounded-full border border-white/15 bg-[rgba(15,14,13,0.75)] px-3 py-2 text-[11px] text-[rgba(250,250,248,0.7)]">
          Rotate · Pinch to zoom
        </p>
      </div>
    </div>
  )
}
