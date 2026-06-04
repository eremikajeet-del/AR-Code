import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useModels } from '../hooks/useModels'
import { useAccessControl } from '../hooks/useAccessControl'
import type { ModelRecord } from '../hooks/useModels'
import UploadZone from '../components/UploadZone'
import ModelCard from '../components/ModelCard'
import QRCode from '../components/QRCode'
import { Box, HelpCircle, Layers, Library } from 'lucide-react'

export default function Dashboard() {
  const { checking, allowed } = useAccessControl()
  const { user } = useAuth()
  const { models, loading, error, uploadProgress, fetchMyModels, uploadModel, deleteModel } = useModels()
  const [selectedModel, setSelectedModel] = useState<ModelRecord | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchMyModels()
    }
  }, [user, fetchMyModels])

  // Automatically select the first uploaded/fetched model if none is selected
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0])
    } else if (models.length === 0) {
      setSelectedModel(null)
    }
  }, [models, selectedModel])

  const handleUpload = async (file: File) => {
    if (!user) return
    setUploadError(null)
    const newModel = await uploadModel(file, user.id)
    if (newModel) {
      setSelectedModel(newModel)
    } else {
      setUploadError(error || 'Failed to complete model upload.')
    }
  }

  const handleDelete = async (model: ModelRecord) => {
    setDeletingId(model.id)
    const success = await deleteModel(model)
    if (success) {
      if (selectedModel?.id === model.id) {
        setSelectedModel(null)
      }
    } else {
      alert(error || 'Failed to delete the model.')
    }
    setDeletingId(null)
  }

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: 'white',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(99,102,241,0.2)',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Verifying access...</p>
      </div>
    )
  }

  if (!allowed) return null

  // Get the public sharing view URL
  const getViewUrl = (id: string) => {
    return `${window.location.origin}/view/${id}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Welcome Banner */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold font-display text-white mb-2 tracking-tight">
          3D Model Dashboard
        </h1>
        <p className="text-slate-400 text-sm">
          Upload and manage your assets. Scan generated QR codes with any mobile device to view them in live AR.
        </p>
      </div>

      {/* Upload Zone Section */}
      <div className="mb-12">
        <UploadZone
          onUpload={handleUpload}
          loading={loading && models.length === 0 ? false : loading}
          progress={uploadProgress}
        />
        {uploadError && (
          <div className="max-w-2xl mx-auto mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {uploadError}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800/80 my-8"></div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Models list: spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-display font-bold text-lg">
              <Library className="w-5 h-5 text-indigo-400" />
              <h2>Your 3D Library</h2>
            </div>
            <span className="bg-slate-900 border border-slate-800 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
              {models.length} {models.length === 1 ? 'model' : 'models'}
            </span>
          </div>

          {loading && models.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/25 border border-slate-850 rounded-2xl min-h-[300px]">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-450 text-sm">Loading your 3D models...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl min-h-[300px] text-center">
              <div className="p-4 bg-slate-900/60 rounded-full text-slate-500 mb-4">
                <Box className="w-10 h-10" />
              </div>
              <h3 className="font-display font-semibold text-white text-base mb-1">No models found</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Drag and drop your first <strong>.glb</strong> or <strong>.gltf</strong> model into the upload zone above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {models.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selectedModel?.id === model.id}
                  onSelect={() => setSelectedModel(model)}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected model details / QR Code panel: spans 1 col */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <h2 className="text-white font-display font-bold text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Model Sharing
            </h2>

            {selectedModel ? (
              <div className="animate-fade-in space-y-4">
                {/* QR Code Generator */}
                <QRCode
                  url={getViewUrl(selectedModel.id)}
                  fileName={selectedModel.file_name}
                />

                {/* Details list card */}
                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3.5">
                  <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">
                    Metadata Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-450">File Name:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[180px]" title={selectedModel.file_name}>
                        {selectedModel.file_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">ID Reference:</span>
                      <span className="text-slate-300 font-mono text-[10px] select-all">
                        {selectedModel.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Created At:</span>
                      <span className="text-slate-350">
                        {new Date(selectedModel.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-900/30 border border-slate-800/80 rounded-2xl min-h-[340px] text-center">
                <HelpCircle className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
                <h3 className="font-display font-medium text-slate-300 text-sm mb-1.5">No selection</h3>
                <p className="text-slate-500 text-xs max-w-[200px]">
                  Select a model from your library to generate a QR Code and share public access.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
