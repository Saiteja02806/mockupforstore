function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function getFrameShadowFilter(strength, scale = 1) {
  const s = clamp(Number(strength) || 0, 0, 100)
  if (s <= 0) return 'none'

  const blur = Math.round((10 + s * 0.72) * scale)
  const offsetY = Math.round((2 + s * 0.28) * scale)
  const opacity = Math.round((0.08 + s * 0.0032) * 1000) / 1000

  return `drop-shadow(0px ${offsetY}px ${blur}px rgba(0,0,0,${opacity}))`
}
