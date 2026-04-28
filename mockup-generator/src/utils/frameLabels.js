export function getDisplayFrameLabel(frameOrLabel) {
  const raw = typeof frameOrLabel === 'string' ? frameOrLabel : frameOrLabel?.label || ''
  let label = String(raw)
    .replace(/\b(photo|vector)\b/gi, '')
    .replace(/\(\s*,\s*/g, '(')
    .replace(/,\s*\)/g, ')')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+,/g, ',')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (!label) return String(raw).trim()
  return label
}
