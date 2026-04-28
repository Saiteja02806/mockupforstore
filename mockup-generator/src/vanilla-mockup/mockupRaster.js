import { CS } from './frames.js'
import { buildSVG } from './mockupSvg.js'

/**
 * Rasterize the device mockup (same pipeline as Export PNG).
 * @param {object} opts
 * @param {object} opts.frame - Frame definition from FRAMES
 * @param {string} opts.finishKey - keyof CS
 * @param {string|null} opts.img - data URL or URL for screen image
 * @param {string} opts.fit - 'meet' | 'slice'
 * @param {string} opts.bg - solid hex or CSS gradient string (when includeSceneBg)
 * @param {number} [opts.scale=2]
 * @param {number} [opts.padPerScaleUnit=80] - padding = this * scale when includeSceneBg
 * @param {boolean} [opts.includeSceneBg=true] - if false, transparent background, no pad, device only
 * @param {'full' | 'bezel_only'} [opts.chassis='full'] - bezel_only strips outer chassis in SVG (store device)
 * @param {string} [opts.idSuffix='export']
 * @param {HTMLCanvasElement|null} [opts.canvas] - reuse canvas
 * @returns {Promise<HTMLCanvasElement>}
 */
/** Sentinel from mockup generator when the user picks “No background”. */
export const SCENE_BG_NONE = 'none'

export async function rasterizeMockupToCanvas({
  frame,
  finishKey,
  img,
  fit,
  bg,
  scale = 2,
  padPerScaleUnit = 80,
  includeSceneBg = true,
  chassis = 'full',
  idSuffix = 'export',
  canvas = null,
}) {
  const c = CS[finishKey]
  if (!c) throw new Error(`Unknown finish: ${finishKey}`)

  const sceneNone = bg === SCENE_BG_NONE
  const paintScene = includeSceneBg && !sceneNone

  const svgStr = buildSVG(frame, c, img, fit, idSuffix, { chassis })
  const pad = paintScene ? padPerScaleUnit * scale : 0
  const W = frame.vw * scale + pad * 2
  const H = frame.vh * scale + pad * 2

  const off = canvas || document.createElement('canvas')
  off.width = W
  off.height = H
  const ctx = off.getContext('2d', { alpha: true })

  if (paintScene) {
    if (typeof bg === 'string' && bg.includes('gradient')) {
      const stops = bg.match(/#[0-9a-f]{6}/gi) || ['#0b0c10', '#1a1c2e']
      const g = ctx.createLinearGradient(0, 0, W, H)
      g.addColorStop(0, stops[0])
      g.addColorStop(1, stops[stops.length - 1])
      ctx.fillStyle = g
    } else {
      ctx.fillStyle = typeof bg === 'string' ? bg : '#0b0c10'
    }
    ctx.fillRect(0, 0, W, H)
  } else {
    ctx.clearRect(0, 0, W, H)
  }

  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    await new Promise((res, rej) => {
      const image = new Image()
      image.onload = () => {
        ctx.drawImage(image, pad, pad, frame.vw * scale, frame.vh * scale)
        res()
      }
      image.onerror = rej
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }

  return off
}
