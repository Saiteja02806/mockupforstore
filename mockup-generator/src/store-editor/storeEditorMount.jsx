import { createRoot } from 'react-dom/client'
import StoreScreenshotEditor from './StoreScreenshotEditor.jsx'

let root = null

/**
 * Open the store screenshot editor (React island).
 * @param {object} opts
 * @param {string} opts.initialMockupWithSceneUrl - mockup PNG including generator scene background
 * @param {string} opts.initialMockupDeviceOnlyUrl - mockup PNG without scene background (device only)
 * @param {string} [opts.suggestedBaseName] - download filename prefix
 * @param {boolean} [opts.mockupCapturesIdentical] - when true, scene/device captures are the same (hide scene toggle)
 * @param {() => void} [opts.onClose] - after unmount
 */
export function openStoreEditor({
  initialMockupWithSceneUrl,
  initialMockupDeviceOnlyUrl,
  suggestedBaseName,
  mockupCapturesIdentical = false,
  onClose,
}) {
  const el = document.getElementById('store-editor-root')
  if (!el) {
    console.warn('[store-editor] #store-editor-root missing')
    return
  }
  if (!root) root = createRoot(el)
  root.render(
    <StoreScreenshotEditor
      initialMockupWithSceneUrl={initialMockupWithSceneUrl}
      initialMockupDeviceOnlyUrl={initialMockupDeviceOnlyUrl}
      mockupCapturesIdentical={mockupCapturesIdentical}
      suggestedBaseName={suggestedBaseName}
      onRequestClose={() => {
        root.render(null)
        onClose?.()
      }}
    />,
  )
}

export function closeStoreEditor() {
  if (root) root.render(null)
}
