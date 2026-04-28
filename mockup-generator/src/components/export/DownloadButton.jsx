import { useState } from 'react'
import { Check, Clipboard, Download, Image } from 'lucide-react'
import { copyToClipboard, downloadAsJPG, downloadAsPNG } from '../../utils/exportHelpers'

export default function DownloadButton({
  canvasRef,
  selectedFrame,
  frameName,
  frameColorVariant,
  frameShadowStrength,
  backgroundColor,
  bgGradient,
  disabled,
}) {
  const [copied, setCopied] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const canExport = !!canvasRef?.current && !!selectedFrame && !disabled && !isBusy

  function getExportOptions() {
    return {
      fabricCanvas: canvasRef?.current,
      selectedFrame,
      frameColorVariant,
      frameShadowStrength,
      backgroundColor,
      bgGradient,
    }
  }

  async function handleExport(format) {
    if (!canvasRef?.current || !selectedFrame || disabled || isBusy) return

    setIsBusy(true)
    try {
      const exportOptions = getExportOptions()
      if (format === 'png') {
        await downloadAsPNG(exportOptions, frameName || 'mockup')
      } else {
        await downloadAsJPG(exportOptions, frameName || 'mockup')
      }
    } finally {
      setIsBusy(false)
    }
  }

  async function handleCopy() {
    if (!canvasRef?.current || !selectedFrame || disabled || isBusy) return

    setIsBusy(true)
    try {
      const ok = await copyToClipboard(getExportOptions())
      if (ok) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={() => handleExport('png')}
        disabled={!canExport}
        aria-busy={isBusy}
        className={`
          flex min-h-11 w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold
          transition-all duration-[var(--transition)]
          ${canExport
            ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)] hover:bg-[var(--accent-hover)]'
            : 'cursor-not-allowed border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]/70'
          }
        `}
      >
        <Download size={18} aria-hidden />
        {isBusy ? 'Rendering…' : 'Download PNG'}
      </button>

      {disabled ? (
        <p className="text-center text-xs leading-relaxed text-[var(--text-muted)]">Add artwork to enable export.</p>
      ) : null}

      <div className="flex gap-2 border-t border-[var(--border)] pt-3">
        <button
          type="button"
          onClick={() => handleExport('jpg')}
          disabled={!canExport}
          className={`
            flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold
            transition-all duration-[var(--transition)]
            ${canExport
              ? 'border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              : 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]/60'
            }
          `}
        >
          <Image size={15} aria-hidden />
          Download JPG
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!canExport}
          className={`
            flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium
            transition-all duration-[var(--transition)]
            ${copied
              ? 'border-[var(--success)]/30 bg-[var(--success)]/15 text-[var(--success)]'
              : canExport
                ? 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                : 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]/60'
            }
          `}
        >
          {copied ? <Check size={14} aria-hidden /> : <Clipboard size={14} aria-hidden />}
          {copied ? 'Copied' : isBusy ? '…' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
