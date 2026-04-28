import { useState } from 'react'
import { LayoutTemplate, Loader2 } from 'lucide-react'
import { openStoreEditor } from '../../store-editor/storeEditorMount.jsx'
import { getStoreEditorCaptureDataUrls } from '../../utils/exportHelpers'

export default function StoreEditorLaunchButton({ buildExportOptions, disabled, suggestedBaseName }) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (disabled || busy) return
    const opts = buildExportOptions()
    if (!opts.selectedFrame) return
    if (!opts.fabricCanvas) {
      window.alert('Preview is still loading. Wait a moment, then try again.')
      return
    }

    setBusy(true)
    try {
      const { withScene, deviceOnly } = await getStoreEditorCaptureDataUrls(opts)
      openStoreEditor({
        initialMockupWithSceneUrl: withScene,
        initialMockupDeviceOnlyUrl: deviceOnly,
        mockupCapturesIdentical: false,
        suggestedBaseName: suggestedBaseName || 'mockup',
        onClose: () => {},
      })
    } catch (e) {
      console.error(e)
      window.alert(e?.message || 'Could not open the store editor. Try exporting a PNG first.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || busy}
      className={`
        flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-[var(--transition)]
        ${disabled || busy
          ? 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]/60'
          : 'border-[var(--accent)]/40 bg-[var(--accent-subtle)] text-[var(--accent)] hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/15'
        }
      `}
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : <LayoutTemplate size={18} />}
      {busy ? 'Preparing…' : 'Edit for App / Play Store'}
    </button>
  )
}
