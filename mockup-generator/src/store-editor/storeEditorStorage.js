export const STORE_EDITOR_LS_KEY = 'mockup-store-editor-v1'

/** @returns {Record<string, unknown>|null} */
export function loadStoreEditorPrefs() {
  try {
    const raw = localStorage.getItem(STORE_EDITOR_LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveStoreEditorPrefs(prefs) {
  try {
    localStorage.setItem(STORE_EDITOR_LS_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore quota */
  }
}
