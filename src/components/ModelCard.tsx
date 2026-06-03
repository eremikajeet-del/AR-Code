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

  // Format size info or clean name
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
      className={`relative flex flex-col justify-between p-5 rounded-2xl cursor-pointer text-left transition-all duration-300 ${
        isSelected
          ? 'bg-slate-900 border-2 border-indigo-500 shadow-lg shadow-indigo-500/10'
          : 'glass-card border border-slate-800 bg-slate-900/40'
      }`}
    >
      <div>
        {/* Model Icon / Badge header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl transition-colors duration-300 ${
            isSelected ? 'bg-indigo-650/20 text-indigo-400' : 'bg-slate-850 text-slate-400'
          }`}>
            <Box className="w-6 h-6 animate-float" />
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
            {extension}
          </span>
        </div>

        {/* Text Details */}
        <h4 className="font-display font-bold text-white text-base leading-snug line-clamp-1 mb-1">
          {displayName}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Button Actions */}
      <div className="flex items-center justify-between gap-2 mt-auto" onClick={handleStopPropagation}>
        {/* View Details / Toggle QR */}
        <button
          onClick={onSelect}
          className={`flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-350 ${
            isSelected
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/20 hover:bg-indigo-500'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Show QR</span>
        </button>

        {/* Open View Link */}
        <a
          href={`/view/${model.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/60 hover:border-transparent transition-all duration-300"
          title="Open in AR View"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Delete button */}
        <button
          disabled={isDeleting}
          onClick={() => {
            if (confirm(`Are you sure you want to delete "${model.file_name}"?`)) {
              onDelete(model)
            }
          }}
          className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-red-650 text-slate-400 hover:text-white border border-slate-700/60 hover:border-transparent transition-all duration-300 disabled:opacity-50"
          title="Delete Model"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
