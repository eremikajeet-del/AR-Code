import { Box, Calendar, QrCode, Trash2, ExternalLink } from 'lucide-react'
import type { ModelRecord } from '../hooks/useModels'

interface ModelCardProps {
  model: ModelRecord;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (model: ModelRecord) => Promise<void>;
  deletingId: string | null;
}

export default function ModelCard({
  model,
  isSelected,
  onSelect,
  onDelete,
  deletingId,
}: ModelCardProps) {
  const isDeleting = deletingId === model.id
  const formattedDate = new Date(model.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const displayName = model.file_name.endsWith('.glb') || model.file_name.endsWith('.gltf')
    ? model.file_name.slice(0, model.file_name.lastIndexOf('.'))
    : model.file_name

  const extension = model.file_name.split('.').pop()?.toUpperCase()

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col justify-between overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300 ${
        isSelected
          ? 'border-[#c9973a]/35 bg-[#1a1510] shadow-[0_0_35px_rgba(201,151,58,0.18)]'
          : 'border-[#2d2318] bg-[#1a1510] hover:border-[#c9973a]/20 hover:shadow-[0_0_30px_rgba(201,151,58,0.12)]'
      }`}
    >
      <div>
        <div className="mb-5 h-40 rounded-3xl border border-[#2d2318] bg-[#120d09] flex items-center justify-center text-sm text-[#a89880]">
          3D Dish Preview
        </div>
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isSelected ? 'bg-[#38210d]' : 'bg-[#110b08]'} text-[#e8b86d]`}>
            <Box className="h-5 w-5" />
          </div>
          <span className="rounded-full border border-[#2d2318] bg-[#120d09] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8b86d]">
            {extension}
          </span>
        </div>

        <h4 className="font-display text-base font-semibold text-white leading-snug line-clamp-2 mb-2">
          {displayName}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4" onClick={handleStopPropagation}>
        <button
          type="button"
          onClick={onSelect}
          className={`flex-1 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
            isSelected
              ? 'border-[#c9973a]/35 bg-[#c9973a]/10 text-[#e8b86d]'
              : 'border-[#c9973a]/20 bg-[#120d09] text-[#e8b86d] hover:border-[#c9973a]/30 hover:bg-[#c9973a]/10'
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <QrCode className="h-3.5 w-3.5" />
            Show QR
          </span>
        </button>

        <a
          href={`/view/${model.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2d2318] bg-[#120d09] text-[#e8b86d] transition-all duration-300 hover:border-[#c9973a]/30 hover:bg-[#c9973a]/10"
          title="Open in AR View"
        >
          <ExternalLink className="h-4 w-4" />
        </a>

        <button
          disabled={isDeleting}
          onClick={() => {
            if (confirm(`Are you sure you want to delete "${model.file_name}"?`)) {
              onDelete(model)
            }
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2d2318] bg-[#120d09] text-[#ef5350] transition-all duration-300 hover:border-[#ef5350]/30 hover:bg-[#4c1212] disabled:opacity-50"
          title="Delete Model"
        >
          {isDeleting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#ef5350] border-t-transparent" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}
