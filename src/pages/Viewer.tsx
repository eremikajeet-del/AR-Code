import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useModels } from '../hooks/useModels'
import type { ModelRecord } from '../hooks/useModels'
import { Box, Home, AlertCircle, Share2, HelpCircle } from 'lucide-react'

export default function Viewer() {
  const { id } = useParams<{ id: string }>()
  const { fetchModelById } = useModels()
  const [model, setModel] = useState<ModelRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [arSupported, setArSupported] = useState(true)

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

  // Detect if browser/device supports WebXR / AR Quick Look
  useEffect(() => {
    if (!model) return

    const checkArSupport = () => {
      const modelViewer = document.getElementById('viewer-element') as any
      if (modelViewer) {
        // If canActivateAR is explicitly false, AR is unsupported
        if (modelViewer.canActivateAR === false) {
          setArSupported(false)
        }
      }
    }

    // Set a timeout to check after element initializes, and also listen to load event
    const timer = setTimeout(checkArSupport, 1200)

    const modelViewer = document.getElementById('viewer-element')
    if (modelViewer) {
      modelViewer.addEventListener('load', checkArSupport)
    }

    return () => {
      clearTimeout(timer)
      if (modelViewer) {
        modelViewer.removeEventListener('load', checkArSupport)
      }
    }
  }, [model])

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
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white min-h-[80vh] px-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <h2 className="font-display font-semibold text-lg">Loading Immersive 3D Experience...</h2>
        <p className="text-slate-400 text-sm mt-1">Preparing WebXR assets</p>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white min-h-[80vh] px-4 text-center">
        <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-display font-extrabold text-2xl mb-2">Failed to load Model</h2>
        <p className="text-slate-400 text-sm max-w-md mb-8">{error || 'Model not found'}</p>
        <Link
          to="/"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 flex flex-col overflow-hidden z-50">
      {/* Immersive Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Top Floating Control Bar */}
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Navigation Home */}
        <Link
          to="/dashboard"
          className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-350"
        >
          <Home className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {/* Model Title */}
        <div className="bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md max-w-[200px] sm:max-w-md truncate">
          <span className="text-white text-xs font-bold font-display">
            {model.file_name.replace(/\.[^/.]+$/, '')}
          </span>
        </div>

        {/* Copy/Share view */}
        <button
          onClick={handleShare}
          className="pointer-events-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-650/15 backdrop-blur-md transition-all duration-300"
          title="Copy Link to Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </header>

      {/* Floating Instructions/Indicator */}
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-center pointer-events-none">
        {copied && (
          <div className="bg-emerald-500/90 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg border border-emerald-400/20 backdrop-blur-sm animate-fade-in pointer-events-auto">
            Link copied to clipboard!
          </div>
        )}
      </div>

      {/* Google Model-Viewer Canvas: Fills 100vw x 100vh exactly */}
      <div className="absolute inset-0 w-full h-full z-10">
        <model-viewer
          id="viewer-element"
          src={model.public_url}
          alt={`3D representation of ${model.file_name}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          ar-scale="auto"
          touch-action="pan-y"
          style={{ width: '100vw', height: '100vh' }}
        >
          {/* Custom AR Trigger Button Overlay (Visible only in non-AR preview modes on mobile). Min tap target is 48px. */}
          <button
            slot="ar-button"
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: '600',
              minHeight: '48px',
              minWidth: '200px',
              cursor: 'pointer',
              zIndex: 999,
            }}
          >
            📦 Place in your room (AR)
          </button>
          {/* AR Quick Look placement instruction */}
          <div id="ar-prompt" className="hidden border border-slate-700/50">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Move your phone to scan the floor</span>
          </div>
        </model-viewer>
      </div>

      {/* Device AR Status Notification */}
      <div className="absolute bottom-6 left-4 right-4 z-25 text-center pointer-events-none">
        {!arSupported ? (
          <p className="inline-block bg-slate-900/95 border border-red-500/20 text-xs text-red-400 py-2 px-4 rounded-full shadow-lg backdrop-blur-md">
            AR not available — enjoy the 3D view
          </p>
        ) : (
          <p className="inline-block bg-slate-900/95 border border-slate-800/80 text-[11px] text-slate-400 py-1.5 px-4 rounded-full shadow-lg backdrop-blur-md max-w-xs mx-auto">
            Rotate with 1 finger • Zoom with 2 fingers
          </p>
        )}
      </div>
    </div>
  )
}
