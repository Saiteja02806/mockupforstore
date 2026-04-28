/**
 * Desktop category - photo rasters + measured screen-hole geometry.
 * Keep this isolated from mobile/tablet/watch frame math.
 */
import { rasterFrameFromSpec, rasterRectFromVanilla } from './framesRasterCore'

function rectFromRatios(w, h, ratios) {
  const minSide = Math.min(w, h)
  return {
    x: Math.round(w * ratios.x),
    y: Math.round(h * ratios.y),
    width: Math.round(w * ratios.width),
    height: Math.round(h * ratios.height),
    radius: Math.round(minSide * (ratios.radius || 0)),
    shape: 'rect',
  }
}

function insetRect(rect, ratioW, ratioH) {
  const dx = rect.width * ratioW
  const dy = rect.height * ratioH
  return {
    ...rect,
    x: Math.round(rect.x + dx),
    y: Math.round(rect.y + dy),
    width: Math.max(1, Math.round(rect.width - 2 * dx)),
    height: Math.max(1, Math.round(rect.height - 2 * dy)),
    radius: rect.radius,
    shape: 'rect',
  }
}

function vanillaLaptopGlass(w, h) {
  return insetRect(rasterRectFromVanilla(w, h, 1200, 780, 86, 46, 1028, 628, 4), 0.018, 0.018)
}

const DESKTOP_SCREEN_RATIOS = {
  // Measured from enclosed transparent holes in the WebP assets. Do not reuse vector laptop ratios here.
  'laptop-studio-square-photo': { x: 0.185, y: 0.291, width: 0.63, height: 0.395, radius: 0.004 },
  'apple-macbook-air-13-photo': { x: 0.103, y: 0.1043, width: 0.794, height: 0.7914, radius: 0.0276 },
  'apple-macbook-pro-14-photo': { x: 0.117, y: 0.1185, width: 0.766, height: 0.7631, radius: 0.0246 },
  'apple-macbook-gold-photo': { x: 0.143, y: 0.268, width: 0.713, height: 0.443, radius: 0.004 },
  'dell-xps-15-photo': { x: 0.132, y: 0.259, width: 0.737, height: 0.415, radius: 0.004 },
  // Perspective photo; use the flat visible black display area so artwork does not sit under the bezel.
  'laptop-realistic-photo': { x: 0.169, y: 0.283, width: 0.662, height: 0.412, radius: 0.004 },
}

function desktopPhotoScreenRect(w, h, frameId) {
  const ratios = DESKTOP_SCREEN_RATIOS[frameId]
  if (ratios) return rectFromRatios(w, h, ratios)
  return vanillaLaptopGlass(w, h)
}

const RASTER_DESKTOP_SPECS = [
  ['laptop-studio-square-photo', 'MacBook', '90969 (4).webp', 4165, 4165],
  ['apple-macbook-air-13-photo', 'MacBook Air 13" (photo)', 'apple-macbookair13-front.webp', 3220, 2100],
  ['apple-macbook-pro-14-photo', 'MacBook Pro 14" (photo)', 'apple-macbookpro14-front.webp', 3944, 2564],
  ['apple-macbook-gold-photo', 'MacBook (gold, photo)', 'apple-macbook-gold-front.webp', 530, 530],
  ['dell-xps-15-photo', 'Dell XPS 15 (photo)', 'dell-xps15-front.webp', 2000, 2000],
  ['laptop-realistic-photo', 'Laptop (photo, realistic)', 'laptop_realistic.webp', 8000, 8000],
]

export const RASTER_DESKTOP_FRAMES = RASTER_DESKTOP_SPECS.map(([id, label, file, width, height]) =>
  rasterFrameFromSpec(id, label, file, width, height, (iw, ih) => desktopPhotoScreenRect(iw, ih, id))
)

const DESKTOP_RASTER_PHOTO_IDS = new Set(RASTER_DESKTOP_FRAMES.map((f) => f.id))

export function isDesktopRasterPhotoFrame(frame) {
  return Boolean(frame?.id && DESKTOP_RASTER_PHOTO_IDS.has(frame.id))
}
