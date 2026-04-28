import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle, Upload } from 'lucide-react'
import { validateImageFile } from '../../utils/imageValidation'
import { useMockupStore } from '../../store/mockupStore'

export default function UploadZone() {
  const { userImageFile, setUserImageFile, setImageFitMode } = useMockupStore()
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const hasImage = !!userImageFile
  const previewUrl = useMemo(() => (userImageFile ? URL.createObjectURL(userImageFile) : null), [userImageFile])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(timer)
  }, [error])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFile(file) {
    const result = validateImageFile(file)
    if (!result.valid) {
      setError(result.error)
      return
    }

    setError(null)
    setImageFitMode('fill')
    setUserImageFile(file)
  }

  function onDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onDragOver(event) {
    event.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function onInputChange(event) {
    const file = event.target.files[0]
    if (file) handleFile(file)
  }

  function onKeyDownZone(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image. Drop a file or press Enter to browse."
        onKeyDown={onKeyDownZone}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border px-6 text-center
          ${hasImage ? 'py-5' : 'py-8'}
          transition-all duration-[var(--transition)]
          ${hasImage
            ? 'border-[var(--success)]/25 bg-[var(--success)]/5 hover:border-[var(--success)]/35 hover:bg-[var(--success)]/8'
            : isDragging
              ? 'border-white/20 bg-white/[0.08]'
              : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
          }
        `}
      >
        {hasImage ? (
          <>
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview of your uploaded screenshot"
                  draggable={false}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CheckCircle size={26} className="text-[var(--success)]" />
                </div>
              )}
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium max-w-full truncate">{userImageFile.name}</p>
            <p className="text-xs text-[var(--text-muted)]">Click or drop to replace.</p>
          </>
        ) : (
          <>
            <Upload
              size={24}
              className={`mb-1 text-[var(--text-secondary)] transition-transform duration-[var(--transition)] ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`}
              aria-hidden
            />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {isDragging ? 'Drop to add' : 'Drop an image or click to browse'}
            </span>
            <span className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">
              PNG, JPG, or WebP · up to 20MB · fills the screen by default
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onInputChange}
          className="hidden"
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-2 px-1 animate-fade-in">
          <AlertCircle size={12} className="text-[var(--error)] shrink-0" />
          <p className="text-[var(--error)] text-xs">{error}</p>
        </div>
      )}
    </div>
  )
}
