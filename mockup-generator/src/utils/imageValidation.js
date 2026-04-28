const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_BYTES = 20 * 1024 * 1024

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file provided.' }
  if (!ACCEPTED.includes(file.type))
    return { valid: false, error: 'Use PNG, JPG, WebP, or GIF.' }
  if (file.size > MAX_BYTES)
    return { valid: false, error: 'File too large. Max 20MB.' }
  return { valid: true, error: null }
}
