import { create } from 'zustand'
import { CATEGORIES } from '../data/frames'

const STATUS_BAR_DEFAULT_POSITION = {
  timeX: 3,
  timeY: 0,
  iconsX: -2,
  iconsY: -1,
}

export const useMockupStore = create((set) => ({
  activeCategory: CATEGORIES.MOBILE,
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  selectedFrame: null,
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  userImageFile: null,
  setUserImageFile: (file) => set({ userImageFile: file }),

  imageFitMode: 'fill',
  setImageFitMode: (mode) => set({ imageFitMode: mode }),

  backgroundColor: '#ffffff',
  setBackgroundColor: (color) => set({ backgroundColor: color, bgGradient: null, bgImageDataUrl: null }),

  bgGradient: null,
  setBgGradient: (gradient) => set({ bgGradient: gradient, bgImageDataUrl: null }),

  /** Photo background — base64 data URL from user upload, or null */
  bgImageDataUrl: null,
  setBgImageDataUrl: (dataUrl) => set({ bgImageDataUrl: dataUrl, bgGradient: null }),

  /** Blur radius (px) applied to the photo background, 0 = no blur */
  bgBlur: 0,
  setBgBlur: (value) => set({ bgBlur: Math.max(0, Math.min(40, Number(value) || 0)) }),

  /** Device perspective tilt in degrees, -30..30. Positive = tilt right. */
  deviceTilt: 0,
  setDeviceTilt: (value) => set({ deviceTilt: Math.max(-30, Math.min(30, Number(value) || 0)) }),

  /**
   * Text overlays rendered on top of the mockup canvas.
   * Each entry: { id, text, fontSize, color, fontWeight, x, y, opacity }
   */
  textLayers: [],
  addTextLayer: () =>
    set((s) => ({
      textLayers: [
        ...s.textLayers,
        {
          id: `txt_${Date.now()}`,
          text: 'Your headline',
          fontSize: 28,
          color: '#ffffff',
          fontWeight: '700',
          x: 50,
          y: 10,
          opacity: 1,
        },
      ],
    })),
  updateTextLayer: (id, patch) =>
    set((s) => ({
      textLayers: s.textLayers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),
  removeTextLayer: (id) =>
    set((s) => ({ textLayers: s.textLayers.filter((l) => l.id !== id) })),
  clearTextLayers: () => set({ textLayers: [] }),

  frameColorVariant: 'midnight',
  setFrameColorVariant: (variant) => set({ frameColorVariant: variant }),

  frameShadowStrength: 0,
  setFrameShadowStrength: (value) =>
    set({ frameShadowStrength: Math.max(0, Math.min(100, Math.round(Number(value) || 0))) }),

  vectorStatusBarEnabled: false,
  setVectorStatusBarEnabled: (value) => set({ vectorStatusBarEnabled: Boolean(value) }),

  vectorStatusBarTime: '12:30',
  setVectorStatusBarTime: (value) =>
    set({ vectorStatusBarTime: String(value || '').replace(/\s+/g, ' ').slice(0, 10) }),

  vectorStatusBarColor: 'black',
  setVectorStatusBarColor: (value) => set({ vectorStatusBarColor: value === 'black' ? 'black' : 'white' }),

  vectorStatusBarTimeOffsetX: STATUS_BAR_DEFAULT_POSITION.timeX,
  setVectorStatusBarTimeOffsetX: (value) =>
    set({ vectorStatusBarTimeOffsetX: Math.max(-30, Math.min(30, Math.round(Number(value) || 0))) }),

  vectorStatusBarTimeOffsetY: STATUS_BAR_DEFAULT_POSITION.timeY,
  setVectorStatusBarTimeOffsetY: (value) =>
    set({ vectorStatusBarTimeOffsetY: Math.max(-30, Math.min(30, Math.round(Number(value) || 0))) }),

  vectorStatusBarIconsOffsetX: STATUS_BAR_DEFAULT_POSITION.iconsX,
  setVectorStatusBarIconsOffsetX: (value) =>
    set({ vectorStatusBarIconsOffsetX: Math.max(-30, Math.min(30, Math.round(Number(value) || 0))) }),

  vectorStatusBarIconsOffsetY: STATUS_BAR_DEFAULT_POSITION.iconsY,
  setVectorStatusBarIconsOffsetY: (value) =>
    set({ vectorStatusBarIconsOffsetY: Math.max(-30, Math.min(30, Math.round(Number(value) || 0))) }),

  resetVectorStatusBarPosition: () =>
    set({
      vectorStatusBarTimeOffsetX: STATUS_BAR_DEFAULT_POSITION.timeX,
      vectorStatusBarTimeOffsetY: STATUS_BAR_DEFAULT_POSITION.timeY,
      vectorStatusBarIconsOffsetX: STATUS_BAR_DEFAULT_POSITION.iconsX,
      vectorStatusBarIconsOffsetY: STATUS_BAR_DEFAULT_POSITION.iconsY,
    }),

  isReadyToExport: false,
  setIsReadyToExport: (ready) => set({ isReadyToExport: ready }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  /** Raster overlay intrinsic size — aligns clip rect with real asset pixels */
  rasterIntrinsic: null,
  setRasterIntrinsic: (payload) => set({ rasterIntrinsic: payload }),

  /**
   * Incremented after Fabric canvas clear + setDimensions in MockupCanvas.
   * Placement in App.jsx must depend on this: otherwise canvas.clear() removes the
   * user image while selectedFrame / userImageFile / rasterIntrinsic are unchanged,
   * and the placement effect never runs again (invisible or “cut off” artwork).
   */
  canvasLayoutGeneration: 0,
  bumpCanvasLayoutGeneration: () =>
    set((s) => ({ canvasLayoutGeneration: s.canvasLayoutGeneration + 1 })),

  /** Preview-only: CSS pixel size = logical canvas × this (no transform:scale — fixes canvas clip bugs). */
  previewFabricCssScale: 1,
  setPreviewFabricCssScale: (previewFabricCssScale) => set({ previewFabricCssScale }),

  /** Multiplier on auto preview scale (MockupCanvas). Reset when the frame changes. */
  previewZoomBoost: 1,
  bumpPreviewZoomBoost: (delta) =>
    set((s) => ({
      previewZoomBoost:
        Math.round(Math.min(2.25, Math.max(0.45, s.previewZoomBoost + delta)) * 100) / 100,
    })),
  resetPreviewZoomBoost: () => set({ previewZoomBoost: 1 }),
}))
