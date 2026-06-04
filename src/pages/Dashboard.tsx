import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Copy, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useModels } from '../hooks/useModels'
import { useAccessControl } from '../hooks/useAccessControl'
import type { ModelRecord } from '../hooks/useModels'
import QRCode from '../components/QRCode'

export default function Dashboard() {
  const { checking, allowed } = useAccessControl()
  const { user, signOut } = useAuth()
  const { models, loading, error, uploadProgress, fetchMyModels, uploadModel, deleteModel } = useModels()
  const [selectedModel, setSelectedModel] = useState<ModelRecord | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleUpload(file)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await handleUpload(file)
  }

  const getViewUrl = (id: string) => `${window.location.origin}/view/${id}`

  const handleCopy = async (model: ModelRecord) => {
    try {
      await navigator.clipboard.writeText(getViewUrl(model.id))
      setCopiedId(model.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // ignore
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const getDisplayName = (fileName: string) =>
    fileName.endsWith('.glb') || fileName.endsWith('.gltf')
      ? fileName.slice(0, fileName.lastIndexOf('.'))
      : fileName

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#080808',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
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
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#555555', letterSpacing: '0.1em' }}>
            Verifying access...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!allowed) return null

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Navbar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '18px',
            fontWeight: 400,
            color: '#F0F0F0',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Tamtara
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              color: '#555555',
            }}
          >
            {user?.email}
          </span>
          <button
            onClick={() => signOut()}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              color: '#555555',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0F0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Page */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: '#080808',
          minHeight: '100vh',
          paddingTop: '64px',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '64px 24px',
          }}
        >
          {/* Upload Section */}
          <section style={{ marginBottom: '80px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: 400,
                color: '#F0F0F0',
                marginBottom: '8px',
              }}
            >
              Studio
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#555555',
                marginBottom: '32px',
              }}
            >
              Upload a 3D dish model
            </p>

            <label htmlFor="file-upload" style={{ display: 'block', cursor: loading ? 'not-allowed' : 'pointer' }}>
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  background: isDragActive ? 'rgba(201,168,76,0.03)' : '#111111',
                  border: isDragActive
                    ? '1px dashed rgba(201,168,76,0.4)'
                    : '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '56px 40px',
                  textAlign: 'center',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(201,168,76,0.4)'
                    el.style.background = 'rgba(201,168,76,0.03)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && !isDragActive) {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(255,255,255,0.1)'
                    el.style.background = '#111111'
                  }
                }}
              >
                <Upload
                  size={24}
                  style={{ color: '#555555', margin: '0 auto 16px' }}
                />
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: '#F0F0F0',
                    marginBottom: '4px',
                  }}
                >
                  {loading ? 'Uploading...' : 'Drop your .glb file here'}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: '#555555',
                  }}
                >
                  .glb or .gltf · Max 50MB
                </p>

                <div
                  onClick={(e) => e.preventDefault()}
                  style={{ marginTop: '20px' }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      height: '36px',
                      lineHeight: '34px',
                      padding: '0 20px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '6px',
                      color: '#F0F0F0',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#C9A84C'
                      e.currentTarget.style.color = '#C9A84C'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                      e.currentTarget.style.color = '#F0F0F0'
                    }}
                  >
                    Choose file
                  </span>
                </div>

                {loading && uploadProgress > 0 && (
                  <div style={{ marginTop: '16px', padding: '0 8px' }}>
                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '1px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${uploadProgress}%`,
                          background: '#C9A84C',
                          borderRadius: '1px',
                          transition: 'width 0.15s ease-out',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>

            <input
              id="file-upload"
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileInputChange}
              disabled={loading}
              style={{ display: 'none' }}
            />

            {uploadError && (
              <p
                style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif",
                  marginTop: '12px',
                }}
              >
                {uploadError}
              </p>
            )}
          </section>

          {/* Dishes Section */}
          <section>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: 400,
                color: '#F0F0F0',
                marginBottom: '8px',
              }}
            >
              Your dishes
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#555555',
                marginBottom: '32px',
              }}
            >
              {models.length} {models.length === 1 ? 'dish' : 'dishes'}
            </p>

            {loading && models.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '96px 0',
                  gap: '24px',
                }}
              >
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
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#555555' }}>
                  Loading dishes...
                </p>
              </div>
            ) : models.length === 0 ? (
              <div style={{ padding: '96px 0', textAlign: 'center' }}>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#F0F0F0',
                    marginBottom: '8px',
                  }}
                >
                  No dishes yet
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: '#555555',
                  }}
                >
                  Upload your first 3D model above
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                }}
                className="dishes-grid"
              >
                {models.map((model, index) => (
                  <DishCard
                    key={model.id}
                    model={model}
                    index={index}
                    isSelected={selectedModel?.id === model.id}
                    onSelect={() => setSelectedModel(model)}
                    onDelete={handleDelete}
                    onCopy={handleCopy}
                    deletingId={deletingId}
                    copiedId={copiedId}
                    getViewUrl={getViewUrl}
                    formatDate={formatDate}
                    getDisplayName={getDisplayName}
                  />
                ))}
              </div>
            )}
          </section>

          {/* QR Panel — shown when a model is selected */}
          {selectedModel && (
            <section style={{ marginTop: '64px' }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '24px',
                  fontWeight: 400,
                  color: '#F0F0F0',
                  marginBottom: '8px',
                }}
              >
                Share
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: '#555555',
                  marginBottom: '32px',
                }}
              >
                {getDisplayName(selectedModel.file_name)}
              </p>
              <div style={{ maxWidth: '360px' }}>
                <QRCode url={getViewUrl(selectedModel.id)} fileName={selectedModel.file_name} />
              </div>
            </section>
          )}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .dishes-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .dishes-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

interface DishCardProps {
  model: ModelRecord
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: (model: ModelRecord) => Promise<void>
  onCopy: (model: ModelRecord) => Promise<void>
  deletingId: string | null
  copiedId: string | null
  getViewUrl: (id: string) => string
  formatDate: (d: string) => string
  getDisplayName: (f: string) => string
}

function DishCard({
  model,
  index,
  onDelete,
  onCopy,
  deletingId,
  copiedId,
  getViewUrl,
  formatDate,
  getDisplayName,
}: DishCardProps) {
  const isDeleting = deletingId === model.id
  const isCopied = copiedId === model.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
      onHoverStart={(e) => {
        const el = e.target as HTMLElement
        const card = el.closest('[data-card]') as HTMLElement
        if (card) {
          card.style.borderColor = 'rgba(201,168,76,0.35)'
          card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)'
        }
      }}
      onHoverEnd={(e) => {
        const el = e.target as HTMLElement
        const card = el.closest('[data-card]') as HTMLElement
        if (card) {
          card.style.borderColor = 'rgba(255,255,255,0.07)'
          card.style.boxShadow = 'none'
        }
      }}
      data-card
    >
      {/* Model preview */}
      <div
        style={{
          height: '200px',
          background: '#0D0D0D',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <model-viewer
          src={model.public_url}
          alt={`3D model of ${model.file_name}`}
          auto-rotate
          camera-controls
          shadow-intensity="0.5"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Card body */}
      <div style={{ padding: '20px' }}>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '16px',
            fontWeight: 400,
            color: '#F0F0F0',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {getDisplayName(model.file_name)}
        </p>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: '#555555',
            marginBottom: '16px',
          }}
        >
          {formatDate(model.created_at)}
        </p>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* AR button */}
          <a
            href={getViewUrl(model.id)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '30px',
              padding: '0 14px',
              background: '#C9A84C',
              color: '#080808',
              border: 'none',
              borderRadius: '4px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#B8963E')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#C9A84C')}
          >
            AR
          </a>

          {/* Copy button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCopy(model) }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: '30px',
              padding: '0 12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: '#F0F0F0',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            {isCopied ? (
              <Check size={12} />
            ) : (
              <Copy size={12} />
            )}
            {isCopied ? 'Copied' : 'Copy'}
          </button>

          {/* Delete button */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete "${model.file_name}"?`)) {
                onDelete(model)
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '30px',
              padding: '0 8px',
              background: 'transparent',
              border: 'none',
              color: '#555555',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              marginLeft: 'auto',
              transition: 'color 0.2s',
              opacity: isDeleting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={(e) => { if (!isDeleting) e.currentTarget.style.color = '#555555' }}
          >
            {isDeleting ? (
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '1.5px solid #555555',
                  borderTop: '1.5px solid #EF4444',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              <Trash2 size={12} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
