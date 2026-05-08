/**
 * Layer pointer helpers for the Store Screenshot Editor.
 * Top z-order = end of `stack` array; we iterate from stack.length-1 down to 0.
 *
 * Manual QA matrix (Store editor, two device layers):
 * - Overlap both phones; plain click selects top / front; Alt+click cycles hit stack.
 * - List-select Phone 2, drag: only Phone 2 moves (x/y in one row).
 * - Change export format: auto width updates only mockups still on the previous auto width.
 * - Loose positioning off: device stays near canvas; on: can move to extreme % (export matches).
 */

/**
 * @param {Array<{ id: string }>} stack
 * @param {(layer: object) => boolean} isHit
 * @returns {string[]} layer ids, front (top) first
 */
export function collectHitLayerIdsFrontFirst(stack, isHit) {
  if (!Array.isArray(stack)) return []
  const ids = []
  for (let i = stack.length - 1; i >= 0; i--) {
    const layer = stack[i]
    if (isHit(layer)) ids.push(layer.id)
  }
  return ids
}

/**
 * @param {string | null} currentId
 * @param {string[]} hitIds front-first
 * @returns {string | null}
 */
export function cyclePickInHits(currentId, hitIds) {
  if (!hitIds?.length) return null
  const idx = hitIds.indexOf(currentId)
  const next = idx >= 0 ? (idx + 1) % hitIds.length : 0
  return hitIds[next]
}
