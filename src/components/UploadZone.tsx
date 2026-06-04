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
        className={`relative group cursor-pointer rounded-[24px] p-10 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] border-2 border-dashed ${
          isDragActive
            ? 'border-[#c9973a]/40 bg-[#1f1913] shadow-[0_0_40px_rgba(201,151,58,0.18)]'
            : 'border-[#2d2318] bg-[#12100d] hover:border-[#c9973a]/25 hover:bg-[#1a120d]'
        } ${loading ? 'pointer-events-none opacity-70' : ''}`}
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#c9973a]/20 border-t-[#c9973a] animate-spin" />
            <div className="w-full text-center">
              <p className="font-display font-semibold text-white text-base">Uploading 3D Model...</p>
              <p className="text-sm text-muted mt-1">Saving file and preparing your immersive menu item.</p>
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-xs text-[#e8b86d] font-semibold">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#0f0a08] border border-[#2d2318] overflow-hidden">
                  <div
                    className="h-full bg-[#c9973a] transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1510] text-[#e8b86d] shadow-[0_15px_35px_rgba(201,151,58,0.16)]">
              <FileUp className="h-8 w-8" />
            </div>
            <h3 className="font-display font-semibold text-white text-xl">Drag & drop your 3D model</h3>
            <p className="max-w-sm text-sm text-muted">Supports <strong className="text-[#e8b86d]">.glb</strong> and <strong className="text-[#e8b86d]">.gltf</strong> files • Max 50MB</p>
            <button
              type="button"
              className="gold-button inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-[0_18px_45px_rgba(201,151,58,0.18)] transition-all duration-300"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      {localError && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#ef5350]/25 bg-[#3f1210] p-4 text-sm text-[#ef5350]">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <span>{localError}</span>
        </div>
      )}
    </div>
  )
}
