import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { FileUp, AlertCircle } from 'lucide-react'

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
  progress: number;
}

export default function UploadZone({ onUpload, loading, progress }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndUpload = async (file: File) => {
    setLocalError(null)
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExt !== 'glb' && fileExt !== 'gltf') {
      setLocalError('Invalid file type. Only .glb and .gltf 3D formats are allowed.')
      return
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setLocalError('File size exceeds the 50MB limit.')
      return
    }

    try {
      await onUpload(file)
    } catch (err: any) {
      setLocalError(err.message || 'Upload failed')
    }
  }

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateAndUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await validateAndUpload(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    if (loading) return
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[220px] ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
            : 'border-slate-800 bg-slate-900/35 hover:border-slate-700 hover:bg-slate-900/50'
        } ${loading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div className="w-full text-center">
              <p className="font-display font-medium text-white text-base">Uploading 3D Model...</p>
              <p className="text-xs text-slate-400 mt-1">Saving file and writing to database</p>
              
              {/* Real-time Progress Bar */}
              <div className="w-full mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-indigo-400 font-semibold">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="h-full bg-indigo-500 shadow-glow shadow-indigo-500/50 transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-indigo-500/10 text-indigo-400 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileUp className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-white text-lg mb-1">
              Drag & drop your 3D model
            </h3>
            <p className="text-slate-400 text-sm mb-4 max-w-sm">
              Supports <strong className="text-indigo-300">.glb</strong> or <strong className="text-indigo-300">.gltf</strong> formats (max 50MB)
            </p>
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-600/10"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      {localError && (
        <div className="mt-4 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm leading-relaxed animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{localError}</span>
        </div>
      )}
    </div>
  )
}
