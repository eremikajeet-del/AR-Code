import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
      } catch (err: unknown) {
        setError((err as Error).message || 'An error occurred while loading the 3D model.')
      } finally {
        setLoading(false)
      }
    }

    loadModel()
  }, [id])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#050505',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px',
            fontWeight: 400,
            color: '#F0F0F0',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          Tamtara
        </p>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1.5px solid rgba(201,168,76,0.15)',
            borderTop: '1.5px solid #C9A84C',
            animation: 'spin 1.2s linear infinite',
          }}
        />
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: '#555555',
            letterSpacing: '0.1em',
            marginTop: '16px',
          }}
        >
          Preparing your dish...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#080808',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '28px',
            fontWeight: 400,
            color: '#F0F0F0',
          }}
        >
          Dish not found
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: '#555555',
            marginTop: '12px',
          }}
        >
          This item may have been removed.
        </p>
      </div>
    )
  }

  const displayName = model.file_name.replace(/\.[^/.]+$/, '')

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050505' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'rgba(5,5,5,0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '14px',
            fontWeight: 400,
            color: '#F0F0F0',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Tamtara
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: '#F0F0F0',
            maxWidth: '160px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
        <div style={{ width: '40px' }} />
      </header>

      {/* Model viewer */}
      <div style={{ position: 'absolute', inset: 0 }}>
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
              bottom: '36px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#C9A84C',
              color: '#080808',
              border: 'none',
              borderRadius: '6px',
              padding: '14px 32px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              zIndex: 99999,
              minHeight: '48px',
              display: 'block',
            }}
          >
            VIEW IN AR
          </button>
        </model-viewer>
      </div>

      {/* Hint text */}
      <p
        style={{
          position: 'fixed',
          bottom: '96px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(240,240,240,0.25)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          letterSpacing: '0.08em',
          zIndex: 10,
        }}
      >
        ROTATE · PINCH TO ZOOM
      </p>
    </div>
  )
}
