import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useModels } from '../hooks/useModels'
import { useAccessControl } from '../hooks/useAccessControl'
import type { ModelRecord } from '../hooks/useModels'
import UploadZone from '../components/UploadZone'
import ModelCard from '../components/ModelCard'
import QRCode from '../components/QRCode'
import { HelpCircle } from 'lucide-react'

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
      <div className="flex min-h-screen items-center justify-center bg-panel px-4 py-10 text-center">
        <div className="space-y-4 rounded-[28px] border border-[#2d2318] bg-[#120d09]/90 p-10 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
          <div className="mx-auto h-14 w-14 rounded-full border-4 border-[#c9973a]/20 border-t-[#c9973a] animate-spin" />
          <p className="text-sm text-muted">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!allowed) return null

  const getViewUrl = (id: string) => {
    return `${window.location.origin}/view/${id}`
  }

  return (
    <div className="min-h-screen bg-panel px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="card-panel overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] items-center p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#e8b86d]">Tamtara Dashboard</p>
              <h1 className="mt-3 text-3xl font-display font-semibold text-white sm:text-4xl">Premium dish management</h1>
              <p className="mt-3 max-w-2xl text-base text-muted leading-relaxed">Upload mouth-watering 3D dishes, generate crisp QR codes, and keep every menu item ready for guests to explore in augmented reality.</p>
            </div>
            <div className="rounded-full border border-[#2d2318] bg-[#120d09] px-5 py-3 text-sm text-[#e8b86d] shadow-[0_10px_35px_rgba(201,151,58,0.12)]">
              Signed in as {user?.email}
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-8">
            <section className="card-panel p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#e8b86d]">Upload New Dish</p>
                  <h2 className="mt-3 text-2xl font-display font-semibold text-white">Upload your latest 3D dish</h2>
                </div>
                <div className="badge">Supports .glb & .gltf</div>
              </div>
              <div className="mt-8">
                <UploadZone
                  onUpload={handleUpload}
                  loading={loading && models.length === 0 ? false : loading}
                  progress={uploadProgress}
                />
              </div>
              {uploadError && (
                <div className="mt-6 rounded-2xl border border-[#ef5350]/25 bg-[#3f1210] p-4 text-sm text-[#ef5350]">
                  {uploadError}
                </div>
              )}
            </section>

            <section className="card-panel p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#e8b86d]">Your Dishes</p>
                  <h2 className="mt-3 text-2xl font-display font-semibold text-white">Your 3D menu library</h2>
                </div>
                <div className="rounded-full border border-[#2d2318] bg-[#120d09] px-4 py-2 text-sm text-[#e8b86d]">
                  {models.length} {models.length === 1 ? 'dish' : 'dishes'}
                </div>
              </div>

              <div className="mt-8">
                {loading && models.length === 0 ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#2d2318] bg-[#120d09] p-10 text-center">
                    <div className="mb-5 h-14 w-14 rounded-full border-4 border-[#c9973a]/20 border-t-[#c9973a] animate-spin" />
                    <p className="text-sm text-muted">Loading your 3D dishes...</p>
                  </div>
                ) : models.length === 0 ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#2d2318] bg-[#120d09] p-10 text-center">
                    <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1510] text-3xl text-[#e8b86d]">🍽️</div>
                    <h3 className="font-display text-xl font-semibold text-white mb-2">No dishes added yet</h3>
                    <p className="max-w-sm text-sm text-muted">Upload your first 3D dish model to get started with an immersive menu experience.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            </section>
          </div>

          <aside className="card-panel p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#e8b86d]">Model Sharing</p>
                <h2 className="mt-3 text-xl font-display font-semibold text-white">QR code center</h2>
              </div>
              <div className="badge">Instant share</div>
            </div>

            {selectedModel ? (
              <div className="mt-8 space-y-6">
                <QRCode url={getViewUrl(selectedModel.id)} fileName={selectedModel.file_name} />
                <div className="rounded-3xl border border-[#2d2318] bg-[#120d09] p-6 text-sm text-muted">
                  <div className="mb-4 border-b border-[#2d2318] pb-3 text-sm font-semibold text-white">Metadata Details</div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>File Name</span>
                      <span className="max-w-[140px] truncate text-[#f5f0e8]">{selectedModel.file_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ID</span>
                      <span className="max-w-[140px] truncate text-[#a89880]">{selectedModel.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Created</span>
                      <span className="text-[#a89880]">{new Date(selectedModel.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-[24px] border border-[#2d2318] bg-[#120d09] p-8 text-center text-sm text-muted">
                <HelpCircle className="mx-auto mb-4 h-12 w-12 text-[#a89880]" />
                <p>Select a dish to reveal its QR code and quick share link.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
