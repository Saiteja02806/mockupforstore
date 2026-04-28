import { stitchFrameBg } from './frames.js'

/** Longest first so `url(#gbody)` is not broken by replacing `url(#g)` first. */
export const DEF_IDS = [
  'optic-lens',
  'btn-vol',
  'rim-light',
  'gbody',
  'gbezel',
  'gbtn',
  'gglass',
  'gspec',
  'glens',
  'gvign',
  'sc',
  'fs',
]

export function applySvgIdSuffix(svg, suffix) {
  const s = String(suffix).replace(/[^a-zA-Z0-9_-]/g, '')
  let out = svg
  for (const id of DEF_IDS) {
    out = out.split(`id="${id}"`).join(`id="${id}-${s}"`)
    out = out.split(`url(#${id})`).join(`url(#${id}-${s})`)
  }
  return out
}

export function buildDefs(c, clipShape) {
  const specMidGspec = (c.specOpacity * 0.4).toFixed(3)
  return `<defs>
    <clipPath id="sc">${clipShape}</clipPath>

    <linearGradient id="gbody" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c.bodyLight}"/>
      <stop offset="35%" stop-color="${c.body}"/>
      <stop offset="75%" stop-color="${c.bodyDark}"/>
      <stop offset="100%" stop-color="${c.bodyBounce}"/>
    </linearGradient>

    <linearGradient id="gbezel" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c.bezelLight}"/>
      <stop offset="100%" stop-color="${c.bezel}"/>
    </linearGradient>

    <linearGradient id="gbtn" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c.btnLight}"/>
      <stop offset="100%" stop-color="${c.btn}"/>
    </linearGradient>

    <radialGradient id="glens" cx="35%" cy="35%" r="65%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="12%" stop-color="#2a3560"/>
      <stop offset="40%" stop-color="#090a12"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>

    <linearGradient id="gspec" x1="-20%" y1="-20%" x2="80%" y2="100%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${c.specOpacity}"/>
      <stop offset="15%" stop-color="#ffffff" stop-opacity="${specMidGspec}"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <linearGradient id="gglass" x1="-20%" y1="-20%" x2="80%" y2="100%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <radialGradient id="gvign" cx="50%" cy="50%" r="65%" gradientUnits="objectBoundingBox">
      <stop offset="70%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.06"/>
    </radialGradient>

    <radialGradient id="optic-lens" cx="40%" cy="40%" r="60%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="15%" stop-color="#1a2b5a"/>
      <stop offset="50%" stop-color="#050508"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>

    <linearGradient id="btn-vol" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c.bodyDark}"/>
      <stop offset="50%" stop-color="${c.bodyLight}"/>
      <stop offset="100%" stop-color="${c.body}"/>
    </linearGradient>

    <linearGradient id="rim-light" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="70%" stop-color="#000000" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
    </linearGradient>
  </defs>`
}

/**
 * @param {object} [options]
 * @param {'full' | 'bezel_only'} [options.chassis] - `bezel_only` omits outer body + spec layers (store editor device asset)
 */
export function buildSVG(frame, c, imgURL, fit, idSuffix = 'canvas', options = {}) {
  const chassis = options.chassis ?? 'full'
  const { vw, vh, sc } = frame

  let clipShape
  let screenPlaceholder
  let imgElem = ''
  let img2 = ''

  if (frame.circle) {
    clipShape = `<circle cx="${sc.cx}" cy="${sc.cy}" r="${sc.r}"/>`
    screenPlaceholder = `<circle cx="${sc.cx}" cy="${sc.cy}" r="${sc.r}" fill="${c.screen}"/>`
    if (imgURL) {
      const bx = sc.cx - sc.r
      const by = sc.cy - sc.r
      const bw = sc.r * 2
      const bh = sc.r * 2
      imgElem = `<image href="${imgURL}" x="${bx}" y="${by}" width="${bw}" height="${bh}"
        clip-path="url(#sc)" preserveAspectRatio="xMidYMid ${fit}"/>`
    }
  } else if (frame.sc2) {
    const s2 = frame.sc2
    clipShape = `
      <rect x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}" rx="${sc.rx || 0}"/>
      <rect x="${s2.x}" y="${s2.y}" width="${s2.w}" height="${s2.h}" rx="${s2.rx || 0}"/>`
    screenPlaceholder = `
      <rect x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}" rx="${sc.rx || 0}" fill="${c.screen}"/>
      <rect x="${s2.x}" y="${s2.y}" width="${s2.w}" height="${s2.h}" rx="${s2.rx || 0}" fill="${c.screen}"/>`
    if (imgURL) {
      imgElem = `<image href="${imgURL}" x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}"
        clip-path="url(#sc)" preserveAspectRatio="xMidYMid ${fit}"/>`
      img2 = `<image href="${imgURL}" x="${s2.x}" y="${s2.y}" width="${s2.w}" height="${s2.h}"
        clip-path="url(#sc)" preserveAspectRatio="xMidYMid ${fit}"/>`
    }
  } else {
    const rx = sc.rx || 0
    clipShape = `<rect x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}" rx="${rx}"/>`
    screenPlaceholder = `<rect x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}" rx="${rx}" fill="${c.screen}"/>`
    if (imgURL) {
      imgElem = `<image href="${imgURL}" x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}"
        clip-path="url(#sc)" preserveAspectRatio="xMidYMid ${fit}"/>`
    }
  }

  const ce = {
    ...c,
    body: 'url(#gbody)',
    bezel: 'url(#gbezel)',
    btn: 'url(#gbtn)',
  }

  const fgHtml = frame.fg(ce)

  const raw = `<svg viewBox="0 0 ${vw} ${vh}" width="${vw}" height="${vh}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:transparent">
  <rect x="0" y="0" width="${vw}" height="${vh}" fill="rgba(0,0,0,0)"/>
  ${buildDefs(c, clipShape)}
  ${stitchFrameBg(frame, ce, chassis)}
  ${screenPlaceholder}
  ${imgElem}${img2}
  ${fgHtml}
</svg>`
  return applySvgIdSuffix(raw, idSuffix)
}
