import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Copy, Check, ExternalLink } from 'lucide-react'

interface QRCodeProps {
  url: string;
  fileName: string;
}

export default function QRCodeComponent({ url, fileName }: QRCodeProps) {
  const [qrSrc, setQrSrc] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function generateQR() {
      setLoading(true)
      try {
        const viewerUrl = url
        const qrDataUrl = await QRCode.toDataURL(viewerUrl, { width: 512, margin: 2 })
        setQrSrc(qrDataUrl)
      } catch (err) {
        console.error('Error generating QR Code:', err)
      } finally {
        setLoading(false)
      }
    }
    generateQR()
  }, [url])

  const downloadQR = () => {
    if (!qrSrc) return
    const link = document.createElement('a')
    // Format download file name
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_')
    link.download = `ar_qr_${cleanName}.png`
    link.href = qrSrc
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-2xl glow-indigo">
      <div className="relative bg-white p-4 rounded-xl shadow-lg border border-slate-700/50 mb-5">
        {loading ? (
          <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex items-center justify-center bg-slate-100 rounded-lg">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          qrSrc && (
            <img
              src={qrSrc}
              alt="AR Model QR Code"
              className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] object-contain rounded-lg"
            />
          )
        )}
      </div>

      <div className="w-full space-y-3">
        <div className="text-center">
          <p className="text-sm font-semibold text-white mb-1">Scan to View in AR</p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-300 font-mono select-all bg-slate-950/50 px-3 py-1.5 rounded-lg border border-indigo-900/30 max-w-[240px] mx-auto truncate">
            <span>{url}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Download Button */}
          <button
            onClick={downloadQR}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-1.5 w-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700/70 transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </>
              )}
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700/70 transition-all duration-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
