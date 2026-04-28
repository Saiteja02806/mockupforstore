const DETECT_MAX_SIDE = 1000
const ALPHA_THRESHOLD = 96
const MIN_HOLE_AREA_RATIO = 0.015
const EDGE_EXPAND_PX = 4

function pushIfTransparent(index, transparent, seen, queue) {
  if (index < 0 || index >= transparent.length) return
  if (!transparent[index] || seen[index]) return
  seen[index] = 1
  queue.push(index)
}

function detectTransparentHole(width, height, transparent) {
  const seen = new Uint8Array(width * height)
  const borderQueue = []

  for (let x = 0; x < width; x += 1) {
    pushIfTransparent(x, transparent, seen, borderQueue)
    pushIfTransparent((height - 1) * width + x, transparent, seen, borderQueue)
  }
  for (let y = 0; y < height; y += 1) {
    pushIfTransparent(y * width, transparent, seen, borderQueue)
    pushIfTransparent(y * width + width - 1, transparent, seen, borderQueue)
  }

  for (let i = 0; i < borderQueue.length; i += 1) {
    const index = borderQueue[i]
    const x = index % width
    const y = (index / width) | 0
    if (x > 0) pushIfTransparent(index - 1, transparent, seen, borderQueue)
    if (x < width - 1) pushIfTransparent(index + 1, transparent, seen, borderQueue)
    if (y > 0) pushIfTransparent(index - width, transparent, seen, borderQueue)
    if (y < height - 1) pushIfTransparent(index + width, transparent, seen, borderQueue)
  }

  let best = null

  for (let i = 0; i < transparent.length; i += 1) {
    if (!transparent[i] || seen[i]) continue

    let minX = width
    let minY = height
    let maxX = 0
    let maxY = 0
    let count = 0
    const queue = [i]
    seen[i] = 1

    for (let q = 0; q < queue.length; q += 1) {
      const index = queue[q]
      const x = index % width
      const y = (index / width) | 0
      count += 1
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y

      if (x > 0) pushIfTransparent(index - 1, transparent, seen, queue)
      if (x < width - 1) pushIfTransparent(index + 1, transparent, seen, queue)
      if (y > 0) pushIfTransparent(index - width, transparent, seen, queue)
      if (y < height - 1) pushIfTransparent(index + width, transparent, seen, queue)
    }

    if (!best || count > best.count) {
      const mask = new Uint8Array(width * height)
      for (const index of queue) {
        mask[index] = 1
      }
      best = { count, minX, minY, maxX, maxY, mask }
    }
  }

  if (!best) return null
  if (best.count < width * height * MIN_HOLE_AREA_RATIO) return null
  return best
}

function dilateMask(mask, width, height, steps) {
  if (!mask || !steps) return mask
  let current = mask
  for (let step = 0; step < steps; step += 1) {
    const next = current.slice()
    for (let y = 0; y < height; y += 1) {
      const rowOffset = y * width
      for (let x = 0; x < width; x += 1) {
        const index = rowOffset + x
        if (!current[index]) continue
        for (let dy = -1; dy <= 1; dy += 1) {
          const ny = y + dy
          if (ny < 0 || ny >= height) continue
          const nextRowOffset = ny * width
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx
            if (nx < 0 || nx >= width) continue
            next[nextRowOffset + nx] = 1
          }
        }
      }
    }
    current = next
  }
  return current
}

function buildRowSpans(mask, width, height) {
  const rows = []
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    let rowMin = -1
    let rowMax = -1
    const rowOffset = y * width
    for (let x = 0; x < width; x += 1) {
      if (!mask[rowOffset + x]) continue
      if (rowMin < 0) rowMin = x
      rowMax = x
    }
    if (rowMin < 0) continue
    rows.push({ y, minX: rowMin, maxX: rowMax })
    if (rowMin < minX) minX = rowMin
    if (rowMax > maxX) maxX = rowMax
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  if (!rows.length) return null
  return { rows, minX, minY, maxX, maxY }
}

function simplifyPolygon(points) {
  if (!points?.length) return []

  const deduped = []
  for (const point of points) {
    const last = deduped[deduped.length - 1]
    if (last && last.x === point.x && last.y === point.y) continue
    deduped.push(point)
  }

  if (deduped.length > 1) {
    const first = deduped[0]
    const last = deduped[deduped.length - 1]
    if (first.x === last.x && first.y === last.y) {
      deduped.pop()
    }
  }

  const simplified = []
  for (let i = 0; i < deduped.length; i += 1) {
    const prev = deduped[(i - 1 + deduped.length) % deduped.length]
    const current = deduped[i]
    const next = deduped[(i + 1) % deduped.length]
    const sameX = prev.x === current.x && current.x === next.x
    const sameY = prev.y === current.y && current.y === next.y
    if (sameX || sameY) continue
    simplified.push(current)
  }
  return simplified
}

function buildPolygonFromRows(rows) {
  if (!rows?.length) return []
  const points = [{ x: rows[0].minX, y: rows[0].y }]

  for (const row of rows) {
    points.push({ x: row.maxX + 1, y: row.y })
    points.push({ x: row.maxX + 1, y: row.y + 1 })
  }

  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i]
    points.push({ x: row.minX, y: row.y + 1 })
    points.push({ x: row.minX, y: row.y })
  }

  return simplifyPolygon(points)
}

export function detectRasterScreenAreaFromImage(image) {
  const naturalWidth = image?.naturalWidth || image?.width || 0
  const naturalHeight = image?.naturalHeight || image?.height || 0
  if (!naturalWidth || !naturalHeight) return null

  const scale = Math.min(1, DETECT_MAX_SIDE / Math.max(naturalWidth, naturalHeight))
  const width = Math.max(1, Math.round(naturalWidth * scale))
  const height = Math.max(1, Math.round(naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  context.clearRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  let imageData
  try {
    imageData = context.getImageData(0, 0, width, height)
  } catch {
    return null
  }

  const transparent = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i += 1) {
    transparent[i] = imageData.data[i * 4 + 3] <= ALPHA_THRESHOLD ? 1 : 0
  }

  const hole = detectTransparentHole(width, height, transparent)
  if (!hole) return null

  const expandedMask = dilateMask(hole.mask, width, height, EDGE_EXPAND_PX)
  const spans = buildRowSpans(expandedMask, width, height)
  if (!spans) return null

  const { rows, minX, minY, maxX, maxY } = spans
  const points = buildPolygonFromRows(rows).map((point) => ({
    x: Math.round(point.x / scale),
    y: Math.round(point.y / scale),
  }))

  return {
    x: Math.round(minX / scale),
    y: Math.round(minY / scale),
    width: Math.round((maxX - minX + 1) / scale),
    height: Math.round((maxY - minY + 1) / scale),
    radius: 0,
    shape: 'polygon',
    points,
  }
}
