# Tech Mockup Generator — Complete Production Documentation

**Version:** 2.0.0  
**Platform:** Web (Browser-Based)  
**Stack:** React 18 + Vite + Fabric.js v7 + Tailwind CSS  
**Frame Strategy:** SVG via Code with `<mask>` transparency (validated, confirmed, locked)  
**Frame Count:** 17 frames across 4 categories (Mobile 9, Tablet 3, Desktop 3, Watch 2)

---

## Table of Contents

1. [Decision Validation: SVG via Code](#1-decision-validation)
2. [Product Specification](#2-product-specification)
3. [System Architecture](#3-system-architecture)
4. [Complete File Structure](#4-complete-file-structure)
5. [Frame Library — Full SVG Code](#5-frame-library)
6. [Frame Registry — frames.js](#6-frame-registry)
7. [Component Specifications](#7-component-specifications)
8. [Core Algorithms](#8-core-algorithms)
9. [State Management](#9-state-management)
10. [Installation & Setup](#10-installation--setup)
11. [Environment Configuration](#11-environment-configuration)
12. [Build & Deployment](#12-build--deployment)
13. [Testing Strategy](#13-testing-strategy)
14. [Performance Benchmarks](#14-performance-benchmarks)
15. [Error Handling](#15-error-handling)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Decision Validation

### Why SVG via Code — Validated Across 8 Dimensions

| Dimension | SVG Code | Figma Export | Real PNG |
|---|---|---|---|
| Coordinate Precision | ✅ Source of truth IS the code | ⚠️ 3 extra manual steps | ❌ Measured, breaks on resize |
| Scalability (new frames) | ✅ 2 minutes per frame | ⚠️ 15-20 minutes per frame | ❌ Not scalable |
| Resolution Independence | ✅ Perfect at any DPI | ✅ If exported as SVG | ❌ Blurry on retina |
| File Size | ✅ ~1-2KB per frame | ⚠️ 10-50KB bloated export | ❌ 100-500KB per frame |
| Git Version Control | ✅ Plain text, clean diffs | ❌ Unreadable diffs | ❌ Binary, no diff |
| Fabric.js Integration | ✅ Direct, zero friction | ⚠️ Groups/transforms interfere | ⚠️ Manual clipPath mapping |
| Fit for This Use Case | ✅ Frames = simple geometry | ❌ Overkill for rectangles | ❌ Wrong tool entirely |
| Visual Quality Capable | ✅ Gradients, shadows, gloss | ✅ Equal | ❌ Raster limitations |
| **SCORE** | **8/8** | **1/8** | **0/8** |

**Final Verdict:** SVG via Code is the only correct choice for this product. The user's requirement — logo-free, button-free, pure frame shells — is exactly what SVG code was built for. The coordinate system is mathematically unified: what you write in the SVG is what you pass to Fabric.js as screenArea. Zero translation, zero guesswork, zero error.

---

## 2. Product Specification

### What This Product Is

A browser-based mockup generator where users select a device frame, upload their screenshot or UI image, and the image is placed inside the frame instantly. The user downloads a professional mockup in one click. No account required. No backend required. No AI. Just fast, precise, useful.

### What This Product Is Not

- Not a design editor
- Not a photo editor  
- Not an AI image generator
- Not a branding tool
- Not a social media scheduler

### Core Value Proposition

**Under 30 seconds from landing page to downloaded mockup.** That is the single metric this product must nail.

### Frame Inventory (v2.0 — 17 Frames)

#### MOBILE — 9 Frames

| # | Frame ID | Frame Name | Canvas Size | Screen Area | Description |
|---|---|---|---|---|---|
| 1 | pill-phone | Dynamic Island | 400 × 800 | x:38, y:60, w:324, h:680 | iPhone 14 Pro–17, pill cutout + front camera dot |
| 2 | dynamic-island-camera | Dynamic Island + Camera | 400 × 800 | x:38, y:60, w:324, h:680 | Same + rear camera dot on bezel |
| 3 | punchhole-phone | Punch-hole | 400 × 800 | x:38, y:58, w:324, h:682 | Samsung/Pixel style, centred punch-hole |
| 4 | punchhole-camera | Punch-hole + Camera | 400 × 800 | x:38, y:58, w:324, h:682 | Same + rear camera dot on bezel |
| 5 | notch-phone | Notch | 400 × 800 | x:38, y:62, w:324, h:678 | iPhone 12/13/16e, wide notch + speaker + camera |
| 6 | borderless-phone | Borderless | 400 × 800 | x:14, y:14, w:372, h:772 | Ultra-thin bezel, no cutout, chin indicator |
| 7 | classic-phone | Classic (home button) | 400 × 800 | x:42, y:88, w:316, h:574 | Thick bezels, earpiece, home button ring |
| 8 | foldable-closed | Foldable (closed) | 300 × 800 | x:30, y:52, w:240, h:696 | Narrow cover screen, hinge line, punch-hole |
| 9 | foldable-open | Foldable (open) | 760 × 800 | x:32, y:32, w:696, h:736 | Wide inner screen, hinge crease, punch-hole |

#### TABLET — 3 Frames

| # | Frame ID | Frame Name | Canvas Size | Screen Area | Description |
|---|---|---|---|---|---|
| 10 | portrait-tablet | Tablet portrait | 600 × 800 | x:32, y:32, w:536, h:736 | Thin bezels, front camera top-centre |
| 11 | portrait-tablet-camera | Tablet portrait + Camera | 600 × 800 | x:32, y:32, w:536, h:736 | Same + rear camera dot, front camera |
| 12 | landscape-tablet | Tablet landscape | 800 × 600 | x:32, y:32, w:736, h:536 | Horizontal, front camera right bezel |

#### DESKTOP — 3 Frames

| # | Frame ID | Frame Name | Canvas Size | Screen Area | Description |
|---|---|---|---|---|---|
| 13 | slim-laptop | Laptop | 1200 × 780 | x:90, y:48, w:1020, h:626 | Slim lid, webcam dot, hinge, keyboard deck, trackpad |
| 14 | monitor | Monitor | 1200 × 860 | x:50, y:30, w:1100, h:680 | Monitor bezel, webcam dot, stand, base |
| 15 | browser-window | Browser window | 1200 × 800 | x:28, y:76, w:1144, h:696 | macOS-style window, traffic lights, address bar |

#### WATCH — 2 Frames

| # | Frame ID | Frame Name | Canvas Size | Screen Area | Description |
|---|---|---|---|---|---|
| 16 | rect-watch | Watch square | 240 × 290 | x:30, y:56, w:180, h:176 | Rectangular case, straps, digital crown |
| 17 | round-watch | Watch round | 240 × 290 | cx:120, cy:145, r:88 | Circular case, straps, crown button |

**Total: 17 frames across 4 device categories.**

### Key Design Decisions (v2.0)

- **Camera dots only** — All camera variants use small dot indicators (r=4–5) in the bezel. No large camera bumps or lens arrays that would block the screen area.
- **SVG `<mask>` transparency** — Every SVG uses a `<mask>` element to cut a transparent hole at the screen area in the body/bezel elements. The screen area `rect`/`circle` has `fill="none"` so user images are visible through the frame.
- **Minimalist design language** — Flat dark fills (#1c1c20 body, #0c0c10 bezel), no gradients, no gloss strokes. Clean and professional.
- **4 categories** — Mobile, Tablet, Desktop, Watch (replaced old "Laptop" category with "Desktop" to include monitor and browser window).

### Supported Image Formats for Upload

- PNG
- JPG / JPEG
- WebP
- GIF (first frame only)

### Export Format

- PNG (primary, lossless)
- JPG (optional, lossy, smaller file size)
- Transparent background option for PNG

---

## 3. System Architecture

### High-Level Data Flow

```
User selects frame
        ↓
Frame SVG loaded into Fabric.js canvas
        ↓
User uploads image (drag-drop or click)
        ↓
Image decoded in browser memory
        ↓
Image placed at screenArea coordinates via Fabric.js
        ↓
Image clipped to screenArea bounds (never bleeds)
        ↓
Canvas composited: frame layer on top, image layer below
        ↓
User clicks download
        ↓
canvas.toDataURL('image/png') called
        ↓
Browser triggers file download
        ↓
Done. User has mockup.
```

### Canvas Layer Model

```
Layer 3 (top):    Frame SVG — the device border shell
Layer 2:          Gloss/shine overlay (optional, subtle SVG gradient)
Layer 1:          User's uploaded image (clipped to screenArea)
Layer 0 (bottom): Background color (configurable, default transparent)
```

### Why No Backend

Every operation in this product is a browser-native operation:

- **Image upload:** FileReader API — browser built-in
- **Canvas rendering:** Fabric.js on HTML5 Canvas — browser built-in
- **Image compositing:** Canvas API — browser built-in
- **File download:** anchor.click() with data URL — browser built-in
- **Image scaling/clipping:** Fabric.js clipPath — runs in memory

Zero server roundtrips. Zero latency from network. Zero server cost. Works offline after first page load.

---

## 4. Complete File Structure

```
mockup-generator/
│
├── public/
│   └── frames/
│       ├── mobile/                    ← 9 mobile frames
│       │   ├── pill-phone.svg
│       │   ├── dynamic-island-camera.svg
│       │   ├── punchhole-phone.svg
│       │   ├── punchhole-camera.svg
│       │   ├── notch-phone.svg
│       │   ├── borderless-phone.svg
│       │   ├── classic-phone.svg
│       │   ├── foldable-closed.svg
│       │   └── foldable-open.svg
│       ├── tablet/                    ← 3 tablet frames
│       │   ├── portrait-tablet.svg
│       │   ├── portrait-tablet-camera.svg
│       │   └── landscape-tablet.svg
│       ├── laptop/                    ← 3 desktop frames
│       │   ├── slim-laptop.svg
│       │   ├── monitor.svg
│       │   └── browser-window.svg
│       └── watch/                     ← 2 watch frames
│           ├── rect-watch.svg
│           └── round-watch.svg
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx          ← Root layout wrapper
│   │   │   ├── Sidebar.jsx           ← Left panel (frame picker)
│   │   │   └── WorkArea.jsx          ← Right panel (canvas + controls)
│   │   │
│   │   ├── frames/
│   │   │   ├── CategoryTabs.jsx      ← Mobile / Tablet / Desktop / Watch tabs
│   │   │   ├── FrameGrid.jsx         ← Grid of frame thumbnails
│   │   │   └── FrameCard.jsx         ← Single frame thumbnail card
│   │   │
│   │   ├── canvas/
│   │   │   ├── MockupCanvas.jsx      ← Main Fabric.js canvas component
│   │   │   ├── FrameRenderer.jsx     ← Loads SVG frame onto canvas
│   │   │   └── ImagePlacer.jsx       ← Places user image into screenArea
│   │   │
│   │   ├── upload/
│   │   │   ├── UploadZone.jsx        ← Drag & drop + click to upload
│   │   │   └── UploadButton.jsx      ← Fallback file input button
│   │   │
│   │   └── export/
│   │       ├── ExportBar.jsx         ← Download controls
│   │       ├── DownloadButton.jsx    ← Triggers canvas export
│   │       └── BackgroundPicker.jsx  ← Background color selector
│   │
│   ├── data/
│   │   └── frames.js                 ← Single source of truth for all 17 frames
│   │
│   ├── hooks/
│   │   ├── useCanvas.js              ← Fabric.js v7 canvas instance management
│   │   ├── useFrameLoader.js         ← SVG frame loading (fetch + loadSVGFromString)
│   │   └── useImageUpload.js         ← File upload and validation
│   │
│   ├── utils/
│   │   ├── canvasHelpers.js          ← Image placement, scaling, clipping (Fabric v7 API)
│   │   ├── exportHelpers.js          ← PNG/JPG export logic
│   │   └── imageValidation.js        ← File type and size validation
│   │
│   ├── store/
│   │   └── mockupStore.js            ← Zustand global state
│   │
│   ├── App.jsx
│   ├── main.jsx                      ← React 18 entry (StrictMode removed)
│   └── index.css
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 5. Frame Library

### SVG Design Principles (v2.0 — Updated)

Every frame SVG follows these rules without exception:

1. **viewBox matches canvas dimensions exactly.** No scaling ambiguity.
2. **Screen area uses `fill="none"`** — transparent so user images show through. The body and bezel elements use an SVG `<mask>` to cut a transparent hole at the screen area position.
3. **Frame uses only geometric primitives.** `rect`, `circle`, `path` — no images embedded.
4. **Unique filter/mask IDs per SVG.** Each SVG uses `shXX` for shadow filters and `mXX` for masks (where XX is a 2-digit number unique across all frames).
5. **No brand names, logos, or text** anywhere in the file.
6. **Camera dots only.** Small circles (r=4–5) in the bezel. No large camera bumps or lens arrays.
7. **Minimalist flat fills.** Body: `#1c1c20`, Bezel: `#0c0c10`, Camera: `#080810`/`#040408`. No gradients, no gloss strokes.

### The SVG Mask Pattern (Critical — v2.0)

Every SVG frame uses this structure to ensure the screen area is transparent:

```svg
<defs>
  <!-- Drop shadow filter -->
  <filter id="sh01" x="-20%" y="-10%" width="140%" height="130%">
    <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
  </filter>
  <!-- Mask: white = visible, black = transparent hole -->
  <mask id="m01">
    <rect width="400" height="800" fill="white"/>          <!-- full canvas = visible -->
    <rect x="38" y="60" width="324" height="680" rx="4" ry="4" fill="black"/>  <!-- screen = hole -->
  </mask>
</defs>
<!-- Body — mask cuts the screen hole -->
<rect x="20" y="20" width="360" height="760" rx="50" ry="50"
      fill="#1c1c20" filter="url(#sh01)" mask="url(#m01)"/>
<!-- Inner bezel — same mask -->
<rect x="27" y="27" width="346" height="746" rx="45" ry="45"
      fill="#0c0c10" mask="url(#m01)"/>
<!-- Screen area — transparent, no fill -->
<rect x="38" y="60" width="324" height="680" rx="4" ry="4"
      fill="none"/>
```

**Why this works:** The `<mask>` makes the body and bezel elements transparent where the screen area is. The screen area `rect` itself has `fill="none"`. When Fabric.js renders the SVG, the user's image (placed below the frame layer) is visible through the transparent screen hole.

---

### Mobile Frame 1 — Dynamic Island (pill-phone)

**File:** `/public/frames/mobile/pill-phone.svg`  
**Canvas:** 400 × 800  
**Screen Area:** x:38, y:60, width:324, height:680

```svg
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" width="400" height="800">
  <defs>
    <filter id="sh01" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m01">
      <rect width="400" height="800" fill="white"/>
      <rect x="38" y="60" width="324" height="680" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <!-- Body -->
  <rect x="20" y="20" width="360" height="760" rx="50" ry="50"
        fill="#1c1c20" filter="url(#sh01)" mask="url(#m01)"/>
  <!-- Inner bezel -->
  <rect x="27" y="27" width="346" height="746" rx="45" ry="45"
        fill="#0c0c10" mask="url(#m01)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="38" y="60" width="324" height="680" rx="4" ry="4"
        fill="none"/>
  <!-- Dynamic Island pill -->
  <rect x="140" y="30" width="120" height="30" rx="15" ry="15"
        fill="#0c0c10"/>
  <!-- Camera dot inside island -->
  <circle cx="234" cy="45" r="5" fill="#080810"/>
  <circle cx="234" cy="45" r="2.5" fill="#050508"/>
  <!-- Side buttons — right -->
  <rect x="378" y="160" width="7" height="64" rx="3.5" fill="#1c1c22"/>
  <rect x="378" y="246" width="7" height="44" rx="3.5" fill="#1c1c22"/>
  <!-- Side button — left (power/lock) -->
  <rect x="15" y="200" width="7" height="80" rx="3.5" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 2 — Dynamic Island + Camera (dynamic-island-camera)

**File:** `/public/frames/mobile/dynamic-island-camera.svg`  
**Canvas:** 400 × 800  
**Screen Area:** x:38, y:60, width:324, height:680

```svg
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" width="400" height="800">
  <defs>
    <filter id="sh02" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m02">
      <rect width="400" height="800" fill="white"/>
      <rect x="38" y="60" width="324" height="680" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <!-- Body -->
  <rect x="20" y="20" width="360" height="760" rx="50" ry="50"
        fill="#1c1c20" filter="url(#sh02)" mask="url(#m02)"/>
  <!-- Inner bezel -->
  <rect x="27" y="27" width="346" height="746" rx="45" ry="45"
        fill="#0c0c10" mask="url(#m02)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="38" y="60" width="324" height="680" rx="4" ry="4"
        fill="none"/>
  <!-- Rear camera dot (top-left bezel) -->
  <circle cx="42" cy="44" r="4" fill="#080810"/>
  <circle cx="42" cy="44" r="2" fill="#040408"/>
  <!-- Dynamic Island pill -->
  <rect x="140" y="30" width="120" height="30" rx="15" ry="15"
        fill="#0c0c10"/>
  <circle cx="234" cy="45" r="5" fill="#080810"/>
  <circle cx="234" cy="45" r="2.5" fill="#050508"/>
  <!-- Side buttons -->
  <rect x="378" y="160" width="7" height="64" rx="3.5" fill="#1c1c22"/>
  <rect x="378" y="246" width="7" height="44" rx="3.5" fill="#1c1c22"/>
  <rect x="15" y="200" width="7" height="80" rx="3.5" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 3 — Punch-hole (punchhole-phone)

**File:** `/public/frames/mobile/punchhole-phone.svg`  
**Canvas:** 400 × 800  
**Screen Area:** x:38, y:58, width:324, height:682

```svg
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" width="400" height="800">
  <defs>
    <filter id="sh03" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m03">
      <rect width="400" height="800" fill="white"/>
      <rect x="38" y="58" width="324" height="682" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <rect x="20" y="20" width="360" height="760" rx="50" ry="50"
        fill="#1c1c20" filter="url(#sh03)" mask="url(#m03)"/>
  <rect x="27" y="27" width="346" height="746" rx="45" ry="45"
        fill="#0c0c10" mask="url(#m03)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="38" y="58" width="324" height="682" rx="4" ry="4"
        fill="none"/>
  <!-- Punch-hole camera — centred top -->
  <circle cx="200" cy="40" r="9" fill="#0c0c10"/>
  <circle cx="200" cy="40" r="6" fill="#080810"/>
  <circle cx="200" cy="40" r="3.5" fill="#040408"/>
  <!-- Lens glint -->
  <circle cx="197" cy="37" r="1.2" fill="#1a2030" opacity="0.7"/>
  <!-- Side buttons -->
  <rect x="378" y="170" width="7" height="60" rx="3.5" fill="#1c1c22"/>
  <rect x="378" y="250" width="7" height="40" rx="3.5" fill="#1c1c22"/>
  <rect x="15" y="210" width="7" height="76" rx="3.5" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 4 — Punch-hole + Camera (punchhole-camera)

**File:** `/public/frames/mobile/punchhole-camera.svg`  
**Canvas:** 400 × 800  
**Screen Area:** x:38, y:58, width:324, height:682

```svg
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" width="400" height="800">
  <defs>
    <filter id="sh04" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m04">
      <rect width="400" height="800" fill="white"/>
      <rect x="38" y="58" width="324" height="682" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <rect x="20" y="20" width="360" height="760" rx="50" ry="50"
        fill="#1c1c20" filter="url(#sh04)" mask="url(#m04)"/>
  <!-- Inner bezel -->
  <rect x="27" y="27" width="346" height="746" rx="45" ry="45"
        fill="#0c0c10" mask="url(#m04)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="38" y="58" width="324" height="682" rx="4" ry="4"
        fill="none"/>
  <!-- Rear camera dot (top-left bezel) -->
  <circle cx="42" cy="44" r="4" fill="#080810"/>
  <circle cx="42" cy="44" r="2" fill="#040408"/>
  <!-- Punch-hole -->
  <circle cx="200" cy="40" r="9" fill="#0c0c10"/>
  <circle cx="200" cy="40" r="6" fill="#080810"/>
  <circle cx="200" cy="40" r="3.5" fill="#040408"/>
  <circle cx="197" cy="37" r="1.2" fill="#1a2030" opacity="0.7"/>
  <!-- Side buttons -->
  <rect x="378" y="170" width="7" height="60" rx="3.5" fill="#1c1c22"/>
  <rect x="378" y="250" width="7" height="40" rx="3.5" fill="#1c1c22"/>
  <rect x="15" y="210" width="7" height="76" rx="3.5" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 5 — Notch (notch-phone)

**File:** `/public/frames/mobile/notch-phone.svg`  
**Canvas:** 400 × 800  
**Screen Area:** x:38, y:62, width:324, height:678

```svg
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" width="400" height="800">
  <defs>
    <filter id="sh05" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m05">
      <rect width="400" height="800" fill="white"/>
      <rect x="38" y="62" width="324" height="678" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <rect x="20" y="20" width="360" height="760" rx="50" ry="50"
        fill="#1c1c20" filter="url(#sh05)" mask="url(#m05)"/>
  <rect x="27" y="27" width="346" height="746" rx="45" ry="45"
        fill="#0c0c10" mask="url(#m05)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="38" y="62" width="324" height="678" rx="4" ry="4"
        fill="none"/>
  <!-- Notch — wide pill shape -->
  <rect x="144" y="27" width="112" height="34" rx="17" ry="17"
        fill="#0c0c10"/>
  <!-- Speaker slit -->
  <rect x="175" y="37" width="50" height="5" rx="2.5" fill="#090912"/>
  <!-- Front camera -->
  <circle cx="242" cy="44" r="5" fill="#080810"/>
  <circle cx="242" cy="44" r="2.5" fill="#040408"/>
  <circle cx="240" cy="42" r="1" fill="#1a2030" opacity="0.6"/>
  <!-- Side buttons -->
  <rect x="378" y="170" width="7" height="60" rx="3.5" fill="#1c1c22"/>
  <rect x="378" y="250" width="7" height="40" rx="3.5" fill="#1c1c22"/>
  <rect x="15" y="210" width="7" height="76" rx="3.5" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 6 — Borderless (borderless-phone)

**File:** `/public/frames/mobile/borderless-phone.svg`  
**Canvas:** 400 × 800  
**Screen Area:** x:14, y:14, width:372, height:772

```svg
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" width="400" height="800">
  <defs>
    <filter id="sh06" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m06">
      <rect width="400" height="800" fill="white"/>
      <rect x="14" y="14" width="372" height="772" rx="48" ry="48" fill="black"/>
    </mask>
  </defs>
  <!-- Ultra-thin shell — screen IS the face -->
  <rect x="10" y="10" width="380" height="780" rx="52" ry="52"
        fill="#1c1c20" filter="url(#sh06)" mask="url(#m06)"/>
  <!-- Screen area — MUST match frames.js: x:14, y:14, w:372, h:772 -->
  <rect x="14" y="14" width="372" height="772" rx="48" ry="48"
        fill="none"/>
  <!-- Subtle chin indicator line -->
  <line x1="172" y1="775" x2="228" y2="775"
        stroke="#2a3040" stroke-width="2" stroke-linecap="round"/>
  <!-- Side buttons (barely visible on edge) -->
  <rect x="388" y="180" width="5" height="60" rx="2.5" fill="#1c1c22"/>
  <rect x="388" y="258" width="5" height="40" rx="2.5" fill="#1c1c22"/>
  <rect x="7" y="220" width="5" height="76" rx="2.5" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 7 — Classic (home button) (classic-phone)

**File:** `/public/frames/mobile/classic-phone.svg`  
**Canvas:** 400 × 800  
**Screen Area:** x:42, y:88, width:316, height:574

```svg
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" width="400" height="800">
  <defs>
    <filter id="sh07" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m07">
      <rect width="400" height="800" fill="white"/>
      <rect x="42" y="88" width="316" height="574" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <rect x="20" y="20" width="360" height="760" rx="40" ry="40"
        fill="#1c1c20" filter="url(#sh07)" mask="url(#m07)"/>
  <rect x="27" y="27" width="346" height="746" rx="34" ry="34"
        fill="#0c0c10" mask="url(#m07)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="42" y="88" width="316" height="574" rx="4" ry="4"
        fill="none"/>
  <!-- Earpiece -->
  <rect x="152" y="54" width="96" height="7" rx="3.5" fill="#090912"/>
  <!-- Front camera (small, beside earpiece) -->
  <circle cx="270" cy="58" r="5" fill="#080810"/>
  <circle cx="270" cy="58" r="2.5" fill="#040408"/>
  <circle cx="268" cy="56" r="1" fill="#1a2030" opacity="0.6"/>
  <!-- Proximity / ambient sensor dots -->
  <circle cx="130" cy="58" r="3" fill="#090912"/>
  <!-- Home button ring -->
  <circle cx="200" cy="728" r="28" fill="#0c0c10"/>
  <circle cx="200" cy="728" r="24" fill="#101014"/>
  <!-- Squircle icon inside -->
  <rect x="190" y="718" width="20" height="20" rx="5" ry="5"
        fill="none" stroke="#1e1e28" stroke-width="1.2"/>
  <!-- Side buttons -->
  <rect x="378" y="180" width="6" height="56" rx="3" fill="#1c1c22"/>
  <rect x="16" y="180" width="6" height="36" rx="3" fill="#1c1c22"/>
  <rect x="16" y="226" width="6" height="56" rx="3" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 8 — Foldable Closed (foldable-closed)

**File:** `/public/frames/mobile/foldable-closed.svg`  
**Canvas:** 300 × 800  
**Screen Area:** x:30, y:52, width:240, height:696

```svg
<svg viewBox="0 0 300 800" xmlns="http://www.w3.org/2000/svg" width="300" height="800">
  <defs>
    <filter id="sh08" x="-30%" y="-10%" width="160%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m08">
      <rect width="300" height="800" fill="white"/>
      <rect x="30" y="52" width="240" height="696" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <rect x="16" y="16" width="268" height="768" rx="38" ry="38"
        fill="#1c1c20" filter="url(#sh08)" mask="url(#m08)"/>
  <rect x="22" y="22" width="256" height="756" rx="33" ry="33"
        fill="#0c0c10" mask="url(#m08)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="30" y="52" width="240" height="696" rx="4" ry="4"
        fill="none"/>
  <!-- Hinge line — subtle horizontal crease midpoint -->
  <line x1="30" y1="400" x2="270" y2="400"
        stroke="#0f0f16" stroke-width="1.5"/>
  <!-- Punch-hole -->
  <circle cx="150" cy="36" r="7" fill="#0c0c10"/>
  <circle cx="150" cy="36" r="4.5" fill="#080810"/>
  <circle cx="150" cy="36" r="2.5" fill="#040408"/>
  <circle cx="148" cy="34" r="1" fill="#1a2030" opacity="0.6"/>
  <!-- Side buttons right -->
  <rect x="280" y="170" width="7" height="54" rx="3.5" fill="#1c1c22"/>
  <rect x="280" y="240" width="7" height="36" rx="3.5" fill="#1c1c22"/>
  <!-- Side button left (volume) -->
  <rect x="13" y="200" width="7" height="68" rx="3.5" fill="#1c1c22"/>
</svg>
```

---

### Mobile Frame 9 — Foldable Open (foldable-open)

**File:** `/public/frames/mobile/foldable-open.svg`  
**Canvas:** 760 × 800  
**Screen Area:** x:32, y:32, width:696, height:736

```svg
<svg viewBox="0 0 760 800" xmlns="http://www.w3.org/2000/svg" width="760" height="800">
  <defs>
    <filter id="sh09" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m09">
      <rect width="760" height="800" fill="white"/>
      <rect x="32" y="32" width="696" height="736" rx="6" ry="6" fill="black"/>
    </mask>
  </defs>
  <rect x="16" y="16" width="728" height="768" rx="26" ry="26"
        fill="#1c1c20" filter="url(#sh09)" mask="url(#m09)"/>
  <rect x="22" y="22" width="716" height="756" rx="21" ry="21"
        fill="#0c0c10" mask="url(#m09)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="32" y="32" width="696" height="736" rx="6" ry="6"
        fill="none"/>
  <!-- Hinge crease — vertical center -->
  <rect x="374" y="22" width="12" height="756" rx="0"
        fill="#0c0c10"/>
  <!-- Subtle hinge texture lines -->
  <line x1="378" y1="60" x2="382" y2="60" stroke="#151520" stroke-width="1"/>
  <line x1="378" y1="80" x2="382" y2="80" stroke="#151520" stroke-width="1"/>
  <line x1="378" y1="100" x2="382" y2="100" stroke="#151520" stroke-width="1"/>
  <line x1="378" y1="120" x2="382" y2="120" stroke="#151520" stroke-width="1"/>
  <line x1="378" y1="680" x2="382" y2="680" stroke="#151520" stroke-width="1"/>
  <line x1="378" y1="700" x2="382" y2="700" stroke="#151520" stroke-width="1"/>
  <line x1="378" y1="720" x2="382" y2="720" stroke="#151520" stroke-width="1"/>
  <!-- Punch-hole (right panel, top centre) -->
  <circle cx="556" cy="50" r="7" fill="#0c0c10"/>
  <circle cx="556" cy="50" r="4.5" fill="#080810"/>
  <circle cx="556" cy="50" r="2.5" fill="#040408"/>
  <circle cx="554" cy="48" r="1" fill="#1a2030" opacity="0.6"/>
  <!-- Side buttons right -->
  <rect x="742" y="180" width="7" height="54" rx="3.5" fill="#1c1c22"/>
  <rect x="742" y="252" width="7" height="36" rx="3.5" fill="#1c1c22"/>
  <!-- Side button left -->
  <rect x="11" y="220" width="7" height="68" rx="3.5" fill="#1c1c22"/>
</svg>
```

---

### Tablet Frame 1 — Portrait Tablet (portrait-tablet)

**File:** `/public/frames/tablet/portrait-tablet.svg`  
**Canvas:** 600 × 800  
**Screen Area:** x:32, y:32, width:536, height:736

```svg
<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" width="600" height="800">
  <defs>
    <filter id="sh10" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <mask id="m10">
      <rect width="600" height="800" fill="white"/>
      <rect x="32" y="32" width="536" height="736" rx="8" ry="8" fill="black"/>
    </mask>
  </defs>
  <rect x="18" y="18" width="564" height="764" rx="24" ry="24"
        fill="#1c1c20" filter="url(#sh10)" mask="url(#m10)"/>
  <rect x="24" y="24" width="552" height="752" rx="19" ry="19"
        fill="#0c0c10" mask="url(#m10)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="32" y="32" width="536" height="736" rx="8" ry="8"
        fill="none"/>
  <!-- Front camera top-centre -->
  <circle cx="300" cy="28" r="5" fill="#080810"/>
  <circle cx="300" cy="28" r="2.5" fill="#040408"/>
  <circle cx="298" cy="26" r="1" fill="#1a2030" opacity="0.6"/>
  <!-- Side button right -->
  <rect x="582" y="280" width="6" height="80" rx="3" fill="#1c1c22"/>
  <!-- Volume buttons left -->
  <rect x="12" y="250" width="6" height="50" rx="3" fill="#1c1c22"/>
  <rect x="12" y="316" width="6" height="50" rx="3" fill="#1c1c22"/>
</svg>
```

---

### Tablet Frame 2 — Portrait Tablet + Camera (portrait-tablet-camera)

**File:** `/public/frames/tablet/portrait-tablet-camera.svg`  
**Canvas:** 600 × 800  
**Screen Area:** x:32, y:32, width:536, height:736

```svg
<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" width="600" height="800">
  <defs>
    <filter id="sh11" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <mask id="m11">
      <rect width="600" height="800" fill="white"/>
      <rect x="32" y="32" width="536" height="736" rx="8" ry="8" fill="black"/>
    </mask>
  </defs>
  <rect x="18" y="18" width="564" height="764" rx="24" ry="24"
        fill="#1c1c20" filter="url(#sh11)" mask="url(#m11)"/>
  <!-- Inner bezel -->
  <rect x="24" y="24" width="552" height="752" rx="19" ry="19"
        fill="#0c0c10" mask="url(#m11)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="32" y="32" width="536" height="736" rx="8" ry="8"
        fill="none"/>
  <!-- Rear camera dot (top-left bezel) -->
  <circle cx="38" cy="28" r="4" fill="#080810"/>
  <circle cx="38" cy="28" r="2" fill="#040408"/>
  <!-- Front camera -->
  <circle cx="300" cy="28" r="5" fill="#080810"/>
  <circle cx="300" cy="28" r="2.5" fill="#040408"/>
  <circle cx="298" cy="26" r="1" fill="#1a2030" opacity="0.6"/>
  <rect x="582" y="280" width="6" height="80" rx="3" fill="#1c1c22"/>
  <rect x="12" y="250" width="6" height="50" rx="3" fill="#1c1c22"/>
  <rect x="12" y="316" width="6" height="50" rx="3" fill="#1c1c22"/>
</svg>
```

---

### Tablet Frame 3 — Landscape Tablet (landscape-tablet)

**File:** `/public/frames/tablet/landscape-tablet.svg`  
**Canvas:** 800 × 600  
**Screen Area:** x:32, y:32, width:736, height:536

```svg
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <filter id="sh12" x="-10%" y="-20%" width="120%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <mask id="m12">
      <rect width="800" height="600" fill="white"/>
      <rect x="32" y="32" width="736" height="536" rx="8" ry="8" fill="black"/>
    </mask>
  </defs>
  <rect x="18" y="18" width="764" height="564" rx="24" ry="24"
        fill="#1c1c20" filter="url(#sh12)" mask="url(#m12)"/>
  <rect x="24" y="24" width="752" height="552" rx="19" ry="19"
        fill="#0c0c10" mask="url(#m12)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="32" y="32" width="736" height="536" rx="8" ry="8"
        fill="none"/>
  <!-- Front camera — right edge centre (landscape orientation) -->
  <circle cx="775" cy="300" r="5" fill="#080810"/>
  <circle cx="775" cy="300" r="2.5" fill="#040408"/>
  <circle cx="773" cy="298" r="1" fill="#1a2030" opacity="0.6"/>
  <!-- Side buttons top (landscape) -->
  <rect x="250" y="12" width="50" height="6" rx="3" fill="#1c1c22"/>
  <rect x="316" y="12" width="50" height="6" rx="3" fill="#1c1c22"/>
  <!-- Power top-right -->
  <rect x="650" y="12" width="80" height="6" rx="3" fill="#1c1c22"/>
</svg>
```

---

### Desktop Frame 1 — Laptop (slim-laptop)

**File:** `/public/frames/laptop/slim-laptop.svg`  
**Canvas:** 1200 × 780  
**Screen Area:** x:90, y:48, width:1020, height:626

```svg
<svg viewBox="0 0 1200 780" xmlns="http://www.w3.org/2000/svg" width="1200" height="780">
  <defs>
    <filter id="sh13" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m13">
      <rect width="1200" height="780" fill="white"/>
      <rect x="90" y="48" width="1020" height="626" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <!-- Lid -->
  <rect x="36" y="18" width="1128" height="694" rx="14" ry="14"
        fill="#1c1c20" filter="url(#sh13)" mask="url(#m13)"/>
  <!-- Lid inner bezel -->
  <rect x="42" y="24" width="1116" height="682" rx="10" ry="10"
        fill="#0c0c10" mask="url(#m13)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="90" y="48" width="1020" height="626" rx="4" ry="4"
        fill="none"/>
  <!-- Webcam dot -->
  <circle cx="600" cy="36" r="4.5" fill="#080810"/>
  <circle cx="600" cy="36" r="2" fill="#040408"/>
  <!-- Webcam glow ring -->
  <circle cx="600" cy="36" r="6" fill="none" stroke="#101018" stroke-width="1"/>
  <!-- Hinge bar -->
  <rect x="36" y="710" width="1128" height="10" rx="5" ry="5" fill="#181820"/>
  <!-- Base / keyboard deck -->
  <rect x="0" y="718" width="1200" height="50" rx="0" ry="0" fill="#1a1a1e"/>
  <!-- Keyboard area -->
  <rect x="100" y="724" width="1000" height="32" rx="4" ry="4"
        fill="#0f0f14" opacity="0.6"/>
  <!-- Trackpad -->
  <rect x="460" y="730" width="280" height="26" rx="6" ry="6"
        fill="#0f0f14" opacity="0.5"/>
  <!-- Base front edge -->
  <rect x="0" y="766" width="1200" height="14" rx="0" ry="0" fill="#151518"/>
</svg>
```

---

### Desktop Frame 2 — Monitor (monitor)

**File:** `/public/frames/laptop/monitor.svg`  
**Canvas:** 1200 × 860  
**Screen Area:** x:50, y:30, width:1100, height:680

```svg
<svg viewBox="0 0 1200 860" xmlns="http://www.w3.org/2000/svg" width="1200" height="860">
  <defs>
    <filter id="sh14" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m14">
      <rect width="1200" height="860" fill="white"/>
      <rect x="50" y="30" width="1100" height="680" rx="4" ry="4" fill="black"/>
    </mask>
  </defs>
  <!-- Monitor bezel -->
  <rect x="36" y="18" width="1128" height="712" rx="14" ry="14"
        fill="#1c1c20" filter="url(#sh14)" mask="url(#m14)"/>
  <!-- Inner bezel -->
  <rect x="42" y="24" width="1116" height="700" rx="10" ry="10"
        fill="#0c0c10" mask="url(#m14)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="50" y="30" width="1100" height="680" rx="4" ry="4"
        fill="none"/>
  <!-- Webcam dot (top centre) -->
  <circle cx="600" cy="27" r="4" fill="#080810"/>
  <circle cx="600" cy="27" r="1.8" fill="#040408"/>
  <!-- Power LED -->
  <circle cx="1140" cy="720" r="3" fill="#0a2010"/>
  <!-- Neck / stand -->
  <rect x="550" y="730" width="100" height="64" rx="4" ry="4" fill="#181820"/>
  <!-- Base -->
  <rect x="380" y="792" width="440" height="20" rx="8" ry="8" fill="#1a1a1e"/>
  <rect x="340" y="810" width="520" height="12" rx="6" ry="6" fill="#151518"/>
</svg>
```

---

### Desktop Frame 3 — Browser Window (browser-window)

**File:** `/public/frames/laptop/browser-window.svg`  
**Canvas:** 1200 × 800  
**Screen Area:** x:28, y:76, width:1144, height:696

```svg
<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  <defs>
    <filter id="sh15" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <mask id="m15">
      <rect width="1200" height="800" fill="white"/>
      <rect x="28" y="76" width="1144" height="696" fill="black"/>
    </mask>
  </defs>
  <!-- Window body -->
  <rect x="20" y="20" width="1160" height="760" rx="12" ry="12"
        fill="#1c1c20" filter="url(#sh15)" mask="url(#m15)"/>
  <!-- Title bar — top-rounded only via path -->
  <path d="M32,20 H1168 a12,12 0 0 1 12,12 V76 H20 V32 a12,12 0 0 1 12,-12 Z"
        fill="#161620" mask="url(#m15)"/>
  <!-- Traffic light buttons -->
  <circle cx="52" cy="48" r="8" fill="#3d1212"/>
  <circle cx="52" cy="48" r="5" fill="#e05050"/>
  <circle cx="80" cy="48" r="8" fill="#3d3212"/>
  <circle cx="80" cy="48" r="5" fill="#e0b040"/>
  <circle cx="108" cy="48" r="8" fill="#123d12"/>
  <circle cx="108" cy="48" r="5" fill="#40c050"/>
  <!-- Tab bar area (subtle) -->
  <rect x="200" y="20" width="120" height="32" rx="6" ry="0"
        fill="#1a1a24"/>
  <!-- Address bar -->
  <rect x="200" y="34" width="700" height="28" rx="14" ry="14"
        fill="#0c0c10"/>
  <!-- Address bar lock icon suggestion -->
  <rect x="220" y="44" width="6" height="8" rx="2" fill="#2a3050"/>
  <circle cx="223" cy="43" r="3.5" fill="none" stroke="#2a3050" stroke-width="1.2"/>
  <!-- Address bar text placeholder -->
  <rect x="240" y="44" width="240" height="6" rx="3" fill="#1e2030" opacity="0.6"/>
  <!-- Content area / screen — MUST match frames.js: x:28, y:76, w:1144, h:696 -->
  <rect x="28" y="76" width="1144" height="696" rx="0" ry="0"
        fill="none"/>
</svg>
```

---

### Watch Frame 1 — Rectangular Watch (rect-watch)

**File:** `/public/frames/watch/rect-watch.svg`  
**Canvas:** 240 × 290  
**Screen Area:** x:30, y:56, width:180, height:176

```svg
<svg viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" width="240" height="290">
  <defs>
    <filter id="sh16" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <mask id="m16">
      <rect width="240" height="290" fill="white"/>
      <rect x="30" y="56" width="180" height="176" rx="28" ry="28" fill="black"/>
    </mask>
  </defs>
  <!-- Top strap -->
  <rect x="80" y="0" width="80" height="54" rx="10" fill="#1c1c20"/>
  <!-- Strap texture lines -->
  <line x1="80" y1="18" x2="160" y2="18" stroke="#1a1a24" stroke-width="1"/>
  <line x1="80" y1="30" x2="160" y2="30" stroke="#1a1a24" stroke-width="1"/>
  <line x1="80" y1="42" x2="160" y2="42" stroke="#1a1a24" stroke-width="1"/>
  <!-- Bottom strap -->
  <rect x="80" y="238" width="80" height="52" rx="10" fill="#1c1c20"/>
  <line x1="80" y1="250" x2="160" y2="250" stroke="#1a1a24" stroke-width="1"/>
  <line x1="80" y1="262" x2="160" y2="262" stroke="#1a1a24" stroke-width="1"/>
  <line x1="80" y1="274" x2="160" y2="274" stroke="#1a1a24" stroke-width="1"/>
  <!-- Watch case -->
  <rect x="14" y="40" width="212" height="208" rx="44" ry="44"
        fill="#1c1c20" filter="url(#sh16)" mask="url(#m16)"/>
  <!-- Inner bezel -->
  <rect x="20" y="46" width="200" height="196" rx="38" ry="38"
        fill="#0c0c10" mask="url(#m16)"/>
  <!-- Screen area — transparent for clipPath -->
  <rect x="30" y="56" width="180" height="176" rx="28" ry="28"
        fill="none"/>
  <!-- Digital crown (right side) -->
  <rect x="225" y="118" width="10" height="30" rx="5" fill="#1c1c22"/>
  <!-- Side button below crown -->
  <rect x="225" y="158" width="8" height="18" rx="4" fill="#1c1c22"/>
</svg>
```

---

### Watch Frame 2 — Circular Watch (round-watch)

**File:** `/public/frames/watch/round-watch.svg`  
**Canvas:** 240 × 290  
**Screen Area:** circle at cx:120, cy:145, r:88

```svg
<svg viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" width="240" height="290">
  <defs>
    <filter id="sh17" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <mask id="m17">
      <rect width="240" height="290" fill="white"/>
      <circle cx="120" cy="145" r="88" fill="black"/>
    </mask>
  </defs>
  <!-- Top strap (narrower for round watch) -->
  <rect x="88" y="0" width="64" height="60" rx="8" fill="#1c1c20"/>
  <line x1="88" y1="16" x2="152" y2="16" stroke="#1a1a24" stroke-width="1"/>
  <line x1="88" y1="28" x2="152" y2="28" stroke="#1a1a24" stroke-width="1"/>
  <line x1="88" y1="40" x2="152" y2="40" stroke="#1a1a24" stroke-width="1"/>
  <line x1="88" y1="52" x2="152" y2="52" stroke="#1a1a24" stroke-width="1"/>
  <!-- Bottom strap -->
  <rect x="88" y="232" width="64" height="58" rx="8" fill="#1c1c20"/>
  <line x1="88" y1="244" x2="152" y2="244" stroke="#1a1a24" stroke-width="1"/>
  <line x1="88" y1="256" x2="152" y2="256" stroke="#1a1a24" stroke-width="1"/>
  <line x1="88" y1="268" x2="152" y2="268" stroke="#1a1a24" stroke-width="1"/>
  <line x1="88" y1="280" x2="152" y2="280" stroke="#1a1a24" stroke-width="1"/>
  <!-- Watch case circle — centred at 120,145 so straps align -->
  <circle cx="120" cy="145" r="106" fill="#1c1c20" filter="url(#sh17)" mask="url(#m17)"/>
  <!-- Bezel ring -->
  <circle cx="120" cy="145" r="100" fill="#0c0c10" mask="url(#m17)"/>
  <!-- Screen area — MUST match frames.js: cx:120, cy:145, r:88 -->
  <circle cx="120" cy="145" r="88" fill="none"/>
  <!-- Crown (right) -->
  <rect x="224" y="128" width="10" height="18" rx="5" fill="#1c1c22"/>
  <!-- Button (right lower) -->
  <rect x="224" y="154" width="8" height="14" rx="4" fill="#1c1c22"/>
</svg>
```

> **Note on circular screen area:** Fabric.js clipPath must use `fabric.Circle` instead of `fabric.Rect` when `shape === 'circle'`. The canvasHelpers.js utility handles this automatically based on the `shape` property.

---

## 6. Frame Registry

**File:** `/src/data/frames.js`

This is the single source of truth for the entire application. Every piece of frame-related data lives here. No frame data should exist anywhere else in the codebase.

```javascript
export const CATEGORIES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  WATCH: 'watch'
}

export const frames = {
  mobile: [
    {
      id: 'pill-phone',
      label: 'Dynamic Island',
      file: '/frames/mobile/pill-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 60, width: 324, height: 680, shape: 'rect' }
    },
    {
      id: 'dynamic-island-camera',
      label: 'Dynamic Island + Camera',
      file: '/frames/mobile/dynamic-island-camera.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 60, width: 324, height: 680, shape: 'rect' }
    },
    {
      id: 'punchhole-phone',
      label: 'Punch-hole',
      file: '/frames/mobile/punchhole-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 58, width: 324, height: 682, shape: 'rect' }
    },
    {
      id: 'punchhole-camera',
      label: 'Punch-hole + Camera',
      file: '/frames/mobile/punchhole-camera.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 58, width: 324, height: 682, shape: 'rect' }
    },
    {
      id: 'notch-phone',
      label: 'Notch',
      file: '/frames/mobile/notch-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 62, width: 324, height: 678, shape: 'rect' }
    },
    {
      id: 'borderless-phone',
      label: 'Borderless',
      file: '/frames/mobile/borderless-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 14, y: 14, width: 372, height: 772, shape: 'rect' }
    },
    {
      id: 'classic-phone',
      label: 'Classic (home button)',
      file: '/frames/mobile/classic-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 42, y: 88, width: 316, height: 574, shape: 'rect' }
    },
    {
      id: 'foldable-closed',
      label: 'Foldable (closed)',
      file: '/frames/mobile/foldable-closed.svg',
      canvasWidth: 300,
      canvasHeight: 800,
      screenArea: { x: 30, y: 52, width: 240, height: 696, shape: 'rect' }
    },
    {
      id: 'foldable-open',
      label: 'Foldable (open)',
      file: '/frames/mobile/foldable-open.svg',
      canvasWidth: 760,
      canvasHeight: 800,
      screenArea: { x: 32, y: 32, width: 696, height: 736, shape: 'rect' }
    }
  ],
  tablet: [
    {
      id: 'portrait-tablet',
      label: 'Tablet portrait',
      file: '/frames/tablet/portrait-tablet.svg',
      canvasWidth: 600,
      canvasHeight: 800,
      screenArea: { x: 32, y: 32, width: 536, height: 736, shape: 'rect' }
    },
    {
      id: 'portrait-tablet-camera',
      label: 'Tablet portrait + Camera',
      file: '/frames/tablet/portrait-tablet-camera.svg',
      canvasWidth: 600,
      canvasHeight: 800,
      screenArea: { x: 32, y: 32, width: 536, height: 736, shape: 'rect' }
    },
    {
      id: 'landscape-tablet',
      label: 'Tablet landscape',
      file: '/frames/tablet/landscape-tablet.svg',
      canvasWidth: 800,
      canvasHeight: 600,
      screenArea: { x: 32, y: 32, width: 736, height: 536, shape: 'rect' }
    }
  ],
  desktop: [
    {
      id: 'slim-laptop',
      label: 'Laptop',
      file: '/frames/laptop/slim-laptop.svg',
      canvasWidth: 1200,
      canvasHeight: 780,
      screenArea: { x: 90, y: 48, width: 1020, height: 626, shape: 'rect' }
    },
    {
      id: 'monitor',
      label: 'Monitor',
      file: '/frames/laptop/monitor.svg',
      canvasWidth: 1200,
      canvasHeight: 860,
      screenArea: { x: 50, y: 30, width: 1100, height: 680, shape: 'rect' }
    },
    {
      id: 'browser-window',
      label: 'Browser window',
      file: '/frames/laptop/browser-window.svg',
      canvasWidth: 1200,
      canvasHeight: 800,
      screenArea: { x: 28, y: 76, width: 1144, height: 696, shape: 'rect' }
    }
  ],
  watch: [
    {
      id: 'rect-watch',
      label: 'Watch square',
      file: '/frames/watch/rect-watch.svg',
      canvasWidth: 240,
      canvasHeight: 290,
      screenArea: { x: 30, y: 56, width: 180, height: 176, shape: 'rect' }
    },
    {
      id: 'round-watch',
      label: 'Watch round',
      file: '/frames/watch/round-watch.svg',
      canvasWidth: 240,
      canvasHeight: 290,
      screenArea: { shape: 'circle', cx: 120, cy: 145, r: 88 }
    }
  ]
}

export const getAllFrames = () => Object.values(frames).flat()
export const getFrameById = (id) => getAllFrames().find(f => f.id === id) || null
export const getFramesByCategory = (category) => frames[category] || []
```

---

## 7. Component Specifications

### MockupCanvas.jsx

**Responsibility:** Manages the Fabric.js canvas instance. Renders frames. Accepts user images.

**Props:**
```typescript
{
  frame: FrameObject,          // from frames.js
  userImage: File | null,      // uploaded image file
  backgroundColor: string,     // hex color or 'transparent'
  onReady: (canvas) => void    // callback when canvas is initialized
}
```

**Key behaviors:**
- On `frame` prop change: clear canvas, load new frame SVG, re-place user image if one exists
- On `userImage` prop change: place image at frame.screenArea coordinates
- Canvas width/height always set to `frame.canvasWidth` × `frame.canvasHeight`
- Canvas displayed at 50% scale in UI for all laptop frames (too wide at full size)

---

### UploadZone.jsx

**Responsibility:** Accepts image files via drag-drop or file picker.

**Accepted types:** `image/png, image/jpeg, image/webp, image/gif`  
**Max file size:** 20MB  
**Events emitted:** `onImageSelected(file: File)`

**Behavior:**
- Drag over → highlight border
- Drop → validate type → validate size → call onImageSelected
- Click → open file picker → same validation → call onImageSelected
- Invalid file → show inline error message (not alert/toast)

---

### CategoryTabs.jsx

**Responsibility:** Four tabs — Mobile, Tablet, Desktop, Watch.

**Props:** `activeCategory, onCategoryChange`  
**Output:** calls `onCategoryChange('mobile' | 'tablet' | 'desktop' | 'watch')`

---

### FrameGrid.jsx

**Responsibility:** Renders a grid of FrameCard components for the active category.

**Props:** `frames: FrameObject[], selectedFrameId: string, onFrameSelect`

---

### ExportBar.jsx

**Responsibility:** Download controls.

**Props:** `canvas: FabricCanvas, frameName: string`  
**Buttons:** Download PNG, Download JPG  
**Extra:** Background color picker (color input)

---

## 8. Core Algorithms

### canvasHelpers.js — Complete Implementation

```javascript
import { Canvas, loadSVGFromString, util, FabricImage, Rect, Circle } from 'fabric'

/**
 * Load an SVG frame onto the Fabric.js canvas.
 * Uses manual fetch + loadSVGFromString (Fabric v7) because
 * loadSVGFromURL silently swallows fetch errors.
 * The SVG renders on top of all other layers (frame is always topmost).
 */
export async function loadFrame(fabricCanvas, frameConfig) {
  fabricCanvas.clear()
  fabricCanvas.setDimensions({
    width: frameConfig.canvasWidth,
    height: frameConfig.canvasHeight
  })

  const response = await fetch(frameConfig.file)
  if (!response.ok) {
    throw new Error(`Failed to fetch frame: ${frameConfig.file}`)
  }
  const svgText = await response.text()

  const { objects, options } = await loadSVGFromString(svgText)
  if (!objects || objects.length === 0) {
    throw new Error(`Failed to parse frame: ${frameConfig.file}`)
  }

  const frameGroup = util.groupSVGElements(objects, options)
  frameGroup.set({
    left: 0,
    top: 0,
    selectable: false,
    evented: false,
    excludeFromExport: false
  })

  // Store frame reference for layering
  fabricCanvas._frameObject = frameGroup
  fabricCanvas.add(frameGroup)
  fabricCanvas.renderAll()
  return frameGroup
}

/**
 * Place user image inside the frame's screen area.
 * Image is scaled to fill (cover) the screen area.
 * Image is clipped so it never bleeds outside the screen area.
 */
export function placeImage(fabricCanvas, imgElement, screenArea) {
  // Remove previous user image if any
  if (fabricCanvas._userImage) {
    fabricCanvas.remove(fabricCanvas._userImage)
  }

  const fabricImage = new FabricImage(imgElement)

  // Calculate scale to COVER the screen area (fill, not fit)
  const scaleX = screenArea.width / fabricImage.width
  const scaleY = screenArea.height / fabricImage.height
  const scale = Math.max(scaleX, scaleY)

  // Build clip path based on screen shape
  let clipPath
  if (screenArea.shape === 'circle') {
    clipPath = new Circle({
      radius: screenArea.r,
      left: screenArea.cx - screenArea.r,
      top: screenArea.cy - screenArea.r,
      absolutePositioned: true
    })
  } else {
    clipPath = new Rect({
      left: screenArea.x,
      top: screenArea.y,
      width: screenArea.width,
      height: screenArea.height,
      absolutePositioned: true
    })
  }

  fabricImage.set({
    left: screenArea.x + screenArea.width / 2,
    top: screenArea.y + screenArea.height / 2,
    scaleX: scale,
    scaleY: scale,
    originX: 'center',
    originY: 'center',
    clipPath: clipPath,
    selectable: true,  // user can reposition
    hasControls: true
  })

  // Store reference
  fabricCanvas._userImage = fabricImage

  // Image must be BELOW the frame layer
  fabricCanvas.add(fabricImage)
  bringFrameToFront(fabricCanvas)
  fabricCanvas.setActiveObject(fabricImage)
  fabricCanvas.renderAll()

  return fabricImage
}

/**
 * Always keep the frame SVG on top.
 * Called after adding any new object to the canvas.
 */
export function bringFrameToFront(fabricCanvas) {
  if (fabricCanvas._frameObject) {
    fabricCanvas.bringToFront(fabricCanvas._frameObject)
    fabricCanvas._frameObject.set({
      selectable: false,
      evented: false
    })
  }
}

/**
 * Load a File object as an HTML Image element,
 * ready to pass to placeImage().
 */
export function fileToImageElement(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Image failed to load'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}
```

---

### exportHelpers.js — Complete Implementation

```javascript
/**
 * Export canvas as PNG and trigger browser download.
 */
export function downloadAsPNG(fabricCanvas, fileName = 'mockup') {
  const dataURL = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2  // 2x for retina quality
  })
  triggerDownload(dataURL, `${fileName}.png`)
}

/**
 * Export canvas as JPG and trigger browser download.
 */
export function downloadAsJPG(fabricCanvas, fileName = 'mockup') {
  const dataURL = fabricCanvas.toDataURL({
    format: 'jpeg',
    quality: 0.95,
    multiplier: 2
  })
  triggerDownload(dataURL, `${fileName}.jpg`)
}

/**
 * Create anchor element and programmatically click it to download.
 */
function triggerDownload(dataURL, fileName) {
  const link = document.createElement('a')
  link.href = dataURL
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

---

### imageValidation.js

```javascript
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 20 * 1024 * 1024  // 20MB

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file provided.' }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Please use PNG, JPG, WebP, or GIF.`
    }
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is 20MB.`
    }
  }

  return { valid: true, error: null }
}
```

---

## 9. State Management

**Library:** Zustand (lightweight, no boilerplate)  
**File:** `/src/store/mockupStore.js`

```javascript
import { create } from 'zustand'
import { CATEGORIES } from '../data/frames'

export const useMockupStore = create((set) => ({

  // Active category tab
  activeCategory: CATEGORIES.MOBILE,
  setActiveCategory: (category) => set({ activeCategory: category }),

  // Selected frame
  selectedFrame: null,
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  // User uploaded image file
  userImageFile: null,
  setUserImageFile: (file) => set({ userImageFile: file }),

  // Background color behind the mockup
  backgroundColor: '#f5f5f5',
  setBackgroundColor: (color) => set({ backgroundColor: color }),

  // Whether a mockup is ready to download
  isReadyToExport: false,
  setIsReadyToExport: (ready) => set({ isReadyToExport: ready }),

  // Loading state during frame switch
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error state
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })

}))
```

---

## 10. Installation & Setup

### Prerequisites

```
Node.js: 18.0.0 or higher
npm: 9.0.0 or higher
Git: any recent version
```

### Step 1 — Clone or Initialize Project

```bash
npm create vite@latest mockup-generator -- --template react
cd mockup-generator
```

### Step 2 — Install All Dependencies

```bash
# Core dependencies
npm install fabric zustand

# Development dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 3 — Configure Tailwind

Replace contents of `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4 — Configure Vite

Replace `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 0  // keep SVG files as separate files, not inlined
  }
})
```

### Step 5 — Create Frame Directories

```bash
mkdir -p public/frames/mobile
mkdir -p public/frames/tablet
mkdir -p public/frames/laptop
mkdir -p public/frames/watch
```

Then place each SVG from Section 5 of this document into the corresponding directory.

### Step 6 — Start Development

```bash
npm run dev
```

Application runs at `http://localhost:5173`

---

## 11. Environment Configuration

This application has **no environment variables** in the MVP. Everything is static.

For future phases (user accounts, analytics, backend), create a `.env` file:

```env
VITE_APP_NAME=MockupGenerator
VITE_API_URL=https://your-api.com
```

Access in code: `import.meta.env.VITE_APP_NAME`

---

## 12. Build & Deployment

### Production Build

```bash
npm run build
```

Output in `dist/` directory. This is what gets deployed.

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

**Vercel settings:**
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### Deploy to Netlify (Alternative)

```bash
npm install -g netlify-cli
netlify deploy --dir=dist --prod
```

Add `public/_redirects` file for SPA routing:
```
/* /index.html 200
```

---

## 13. Testing Strategy

### Unit Tests — canvasHelpers.js

Test that:
- `validateImageFile()` rejects non-image files
- `validateImageFile()` rejects files over 20MB
- `getFrameById()` returns correct frame or null
- `getFramesByCategory()` returns correct array

### Integration Tests

Test that:
- Selecting a frame updates canvas dimensions
- Uploading an image places it within screenArea bounds
- Switching frames clears previous image placement
- Download button produces a non-empty data URL

### Manual QA Checklist (before each release — v2.0)

```
[ ] All 17 frames render without visual artifacts
[ ] Screen area is transparent (user image visible through frame)
[ ] Camera dots are in bezel only (not blocking screen)
[ ] Image upload via drag-drop works
[ ] Image upload via click works
[ ] Image stays within frame boundary (no bleed)
[ ] Frame is always on top of user image
[ ] Background color change applies immediately
[ ] Download PNG produces correct file
[ ] Download JPG produces correct file
[ ] Works in Chrome (latest)
[ ] Works in Firefox (latest)
[ ] Works in Safari (latest)
[ ] Works on mobile browser (Chrome Android / Safari iOS)
[ ] No console errors on any frame selection
[ ] Large image files (10MB+) handled without crash
[ ] Category tabs show Mobile / Tablet / Desktop / Watch
[ ] Switching categories updates frame grid correctly
```

---

## 14. Performance Benchmarks

### Target Metrics

| Metric | Target |
|---|---|
| Initial page load | < 1.5 seconds |
| Frame switch time | < 200ms |
| Image placement after upload | < 300ms |
| PNG export (mobile frame) | < 500ms |
| PNG export (laptop frame) | < 800ms |
| Total JS bundle size | < 400KB gzipped |

### Why These Are Achievable

- All 17 SVG frames combined = under 40KB total
- Fabric.js v7 minified = ~300KB (largest dependency)
- No API calls, no network latency for core operations
- Canvas operations are GPU-accelerated in all modern browsers
- SVG `<mask>` pattern is lightweight and renders efficiently

---

## 15. Error Handling

### Error States to Handle

| Scenario | What to show |
|---|---|
| SVG frame fails to load | "Frame failed to load. Please refresh." |
| Image file invalid type | "Unsupported file type. Use PNG, JPG, or WebP." |
| Image file too large | "File too large. Maximum size is 20MB." |
| Canvas export fails | "Export failed. Please try again." |
| Browser doesn't support Canvas | "Your browser doesn't support this tool. Please use a modern browser." |

### Error Display Rule

All errors display as **inline messages** near the relevant action. Never use browser `alert()`. Never use floating toasts for errors (they disappear before the user reads them).

---

## 16. Future Roadmap

### ✅ Completed in v2.0
- ~~8 frames → 17 frames across 4 categories (Mobile, Tablet, Desktop, Watch)~~
- ~~SVG `<mask>` transparency pattern for all frames~~
- ~~Camera dot indicators (removed large camera bumps)~~
- ~~Foldable phone frames (closed + open)~~
- ~~Tablet frames (portrait, portrait+camera, landscape)~~
- ~~Desktop frames (laptop, monitor, browser window)~~
- ~~Fabric.js v7 migration (named imports, setDimensions, loadSVGFromString)~~
- ~~React StrictMode removed (fixes double-mount canvas bug)~~
- ~~Category tabs: Mobile / Tablet / Desktop / Watch~~
- ~~Browser window frame with macOS-style title bar~~

### ✅ Phase 3 — Polish & Testing (Completed)
- Full UI redesign with design tokens, custom scrollbar, animations
- Category tabs with Lucide icons (Smartphone/Tablet/Monitor/Watch)
- Frame grid with SVG thumbnail previews + selection badges
- Upload zone with Upload icon, drag pulse, success state, auto-dismiss errors
- Download buttons with icons + disabled state (no more layout jump)
- Responsive canvas scaling via ResizeObserver (replaces fixed 0.45/0.75)
- Background color from store applied to Fabric canvas
- Checkerboard pattern behind canvas for transparency indication
- Frame info bar (label + dimensions) above canvas
- 10 preset background color swatches + custom picker
- Inter font loaded via Google Fonts
- Section labels with icons (Frames, Image, Background, Export)

### Phase 3 Design Audit Findings & Fixes
1. **Canvas area had no height** — ResizeObserver returned 0. Fixed with `style={{ height: '100vh' }}` + absolute positioning.
2. **Inter font referenced but not loaded** — Added Google Fonts preconnect + stylesheet in `index.html`.
3. **Frame thumbnails invisible** — SVG previews were dark-on-dark. Added `bg-[#1e1e22]` behind thumbnails + padding.
4. **Color swatches too small (24px)** — Enlarged to 28px with `rounded-lg` + ring on active state.
5. **Section labels too small (10px)** — Enlarged to 11px for readability.
6. **Download disabled state low contrast** — Added border + reduced opacity for clear disabled appearance.
7. **Frame info missing** — Added info bar showing frame label + canvas dimensions above canvas area.

### ✅ Phase 4 — Enhanced Features (Completed)
- Scroll-wheel zoom on user image (0.1x–5x range)
- Image is draggable + resizable with Fabric.js controls (blue corner handles)
- Copy to clipboard button (PNG via Clipboard API)
- Keyboard shortcuts: Delete/Backspace removes image, Ctrl+S exports PNG
- Image adjustment panel: brightness, contrast, opacity sliders + reset/remove buttons
- Frame color variants: Midnight (default), Silver, Gold — recolors all SVG elements
- Background gradient support: 5 presets (sunset, ocean, aurora, ember, radial-dark)
- Selecting a solid color clears gradient; selecting a gradient clears solid color
- Frame info bar shows label + canvas dimensions above canvas area

### Phase 5 — Scale (Current)
- Browser QA: test all 17 frames with image upload + export
- Watermark toggle for free tier
- Responsive mobile layout (sidebar collapses to bottom sheet)
- Additional frames: teardrop phone, ultra-watch, gaming laptop
- Bulk mode: upload multiple images, generate multiple mockups
- Angled laptop frame (perspective transform)
- User accounts (save projects)
- Custom frame upload (brands can upload their own device frames)
- API access (programmatic mockup generation)
- Paid tier with watermark removal and HD export

---

## Appendix — Package.json Reference

```json
{
  "name": "mockup-generator",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "fabric": "^7.2.0",
    "lucide-react": "^0.460.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.4.27",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "postcss": "^8.5.9",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.4"
  }
}
```

---

*End of Production Documentation — Tech Mockup Generator v2.0.0*

### v2.0 Validation Report

All 17 SVG frames validated end-to-end:
- **ViewBox ↔ canvasWidth/canvasHeight**: All 17 match ✅
- **SVG screen rect ↔ frames.js screenArea**: All 17 match ✅
- **Mask black rect ↔ screen area**: All 17 match ✅
- **Screen area `fill="none"`**: All 17 confirmed ✅
- **Body + bezel have `mask="url(#mXX)"`**: All 17 confirmed ✅
- **Camera dots in bezel, no screen blocking**: All 17 confirmed ✅
- **No big camera bumps remaining**: All 3 camera variants use small dots only ✅

Key bugs found and fixed during v2.0 development:
1. **Screen area `fill="#000000"`** — opaque black rects covered user images. Fixed with SVG `<mask>` pattern.
2. **Camera bumps blocking screen** — large camera modules overlapped screen area. Fixed by replacing with small dot indicators.
3. **Landscape tablet camera outside body** — `cx=791` was beyond the 782px body edge. Fixed to `cx=775`.
4. **Browser window title bar misalignment** — two separate rects didn't align. Fixed with single `<path>` element.
5. **Fabric.js v6→v7 API migration** — `canvas.setWidth()` removed, `loadSVGFromURL()` swallows errors. Fixed with `setDimensions()` and manual `fetch + loadSVGFromString`.

---

# Complete Expanded Frame List (Future Reference)
## All Frames Planned for Full Library

---

## 📱 MOBILE FRAMES — 18 Frames

Divided into 3 sub-groups so users can find them easily.

### Sub-group A — iPhone Style Frames (7 frames)

Almost every iPhone since the iPhone X has done its best to eliminate bezels, transitioning through the notch to the Dynamic Island. This evolution gives you 7 distinct iPhone-inspired frame styles covering every generation still in active use.

| # | Frame Name | Generation It Covers | Priority |
|---|---|---|---|
| 1 | **iPhone — Dynamic Island** | iPhone 14 Pro, 15, 16, 17 — entire current lineup | 🔴 Must Have |
| 2 | **iPhone — Notch Standard** | iPhone 12, 13, iPhone 16e | 🔴 Must Have |
| 3 | **iPhone — Wide Notch** | iPhone X, XS, XR, iPhone 11 | 🔴 Must Have |
| 4 | **iPhone — Classic Home Button** | iPhone SE, iPhone 8 and older — still millions in use | 🟡 High Value |
| 5 | **iPhone — Mini Size** | iPhone 12 Mini, 13 Mini — smaller form factor | 🟡 High Value |
| 6 | **iPhone — Pro Max Size** | iPhone 15/16/17 Pro Max — largest iPhone size | 🟡 High Value |
| 7 | **iPhone — Edge to Edge** | Future-forward design, borderless concept | 🟢 Good to Have |

---

### Sub-group B — Android Style Frames (7 frames)

The Google Pixel 10 series features hole-punch cutout displays. The Google Pixel 9 features a 6.1-inch flat display with a centred punch-hole camera. Google Pixel has a very distinct look — flat edges, very thin bezels, centered hole punch — that designers specifically want.

| # | Frame Name | What It Covers | Priority |
|---|---|---|---|
| 8 | **Google Pixel Style** | Pixel 9, Pixel 10 — flat edges, centered punch-hole, clean minimalist frame | 🔴 Must Have |
| 9 | **Samsung Galaxy S Style** | Galaxy S21–S25 — curved subtle edges, ultra-thin bezel, punch-hole | 🔴 Must Have |
| 10 | **Samsung Galaxy A Style** | Galaxy A-series — slightly thicker bezel, punch-hole, most-sold Android globally | 🔴 Must Have |
| 11 | **OnePlus / Xiaomi Flagship** | OnePlus 13, Xiaomi 15 — ultra thin, punch-hole, slim body | 🟡 High Value |
| 12 | **Teardrop Android** | Realme, Vivo, Oppo, Redmi budget — small oval notch, massive India/Asia market | 🔴 Must Have |
| 13 | **Budget Android Slab** | Thick bezel, no cutout — entry-level devices still widely used in emerging markets | 🟡 High Value |
| 14 | **Android Foldable (Unfolded)** | Samsung Galaxy Z Fold, OnePlus Open — wider tall screen, punch-hole | 🟢 Good to Have |

---

### Sub-group C — Generic / Universal Frames (4 frames)

These have no brand association at all. Clean, neutral, professional.

| # | Frame Name | Use Case | Priority |
|---|---|---|---|
| 15 | **Minimal Borderless Phone** | Ultra-thin bezel concept, no cutout — premium universal | 🟡 High Value |
| 16 | **Flat Clay Phone** | Neutral matte grey clay look — popular in design portfolios | 🔴 Must Have |
| 17 | **White Frame Phone** | Light coloured frame — works for light-background screenshots | 🟡 High Value |
| 18 | **Dark Frame Phone** | Pure black minimal frame — most professional mockup style | 🟡 High Value |

---

## 💻 LAPTOP FRAMES — 10 Frames

| # | Frame Name | What It Covers | Priority |
|---|---|---|---|
| 1 | **Slim Silver Laptop** | MacBook Air style — light aluminium, most used for clean UI mockups | 🔴 Must Have |
| 2 | **Dark Black Laptop** | MacBook Pro / Dell XPS dark style | 🔴 Must Have |
| 3 | **Screen Only — Dark** | Just the screen panel, no keyboard shown — best for web/dashboard showcase | 🔴 Must Have |
| 4 | **Screen Only — Light** | Same, light bezel — suits light-theme web designs | 🔴 Must Have |
| 5 | **Gaming Laptop** | Chunky thick frame — Asus ROG, Lenovo Legion, Acer Nitro audience | 🟡 High Value |
| 6 | **Ultrabook Borderless** | Razor thin bezel — Dell XPS, Samsung Galaxy Book, LG Gram | 🟡 High Value |
| 7 | **Windows Laptop Style** | Slightly thicker bezel, neutral grey — generic Windows laptop look | 🟡 High Value |
| 8 | **Laptop Open Side Angle** | Slightly angled open lid — more dynamic than straight-on view | 🟡 High Value |
| 9 | **Chromebook Style** | Slightly smaller screen ratio, plastic-feel frame — education/budget audience | 🟢 Good to Have |
| 10 | **2-in-1 Laptop (Tablet Mode)** | Wide screen, no keyboard shown, touch-screen style frame | 🟢 Good to Have |

---

## 📱 TABLET FRAMES — 12 Frames

Apple iPad held almost 32 percent share of the global tablet market. Android acquired the prominent share of 51.7% in 2025 owing to its affordability and wide OEM support. Tablets split almost evenly between iPad and Android — you need both.

Divided into 3 sub-groups.

### Sub-group A — iPad Style Frames (5 frames)

| # | Frame Name | What It Covers | Priority |
|---|---|---|---|
| 1 | **iPad Standard — Dark** | iPad 10th gen, iPad Air — centre punch-hole, thin aluminium frame | 🔴 Must Have |
| 2 | **iPad Standard — Silver** | Same geometry, silver/light colourway | 🔴 Must Have |
| 3 | **iPad Pro — Borderless Dark** | iPad Pro 11" / 13" — ultra thin Face ID no-home-button design | 🔴 Must Have |
| 4 | **iPad Mini** | Compact 8.3" form factor — noticeably smaller canvas than standard iPad | 🟡 High Value |
| 5 | **iPad Pro — Landscape** | Horizontal orientation — used heavily for productivity and web design mockups | 🟡 High Value |

---

### Sub-group B — Android Tablet Frames (4 frames)

Samsung came in second in tablet market share, shipping 6.8 million units. Samsung Galaxy Tab is the clear Android tablet leader.

| # | Frame Name | What It Covers | Priority |
|---|---|---|---|
| 6 | **Android Tablet Standard — Dark** | Samsung Galaxy Tab A-series, Lenovo Tab, Redmi Pad — most-sold Android tablets | 🔴 Must Have |
| 7 | **Android Tablet Standard — Light** | Same, light frame colourway | 🟡 High Value |
| 8 | **Samsung Galaxy Tab S Style** | Tab S9, Tab S10 — premium thin-bezel Android tablet, punch-hole front camera | 🔴 Must Have |
| 9 | **Android Tablet — Landscape** | Horizontal orientation — most tablets used this way for video/productivity | 🟡 High Value |

---

### Sub-group C — Windows / Universal Tablet Frames (3 frames)

The Surface Pro proved there's a niche for a device that is part tablet, part laptop. By 2019–2025, virtually every major platform offered a 2-in-1 solution.

| # | Frame Name | What It Covers | Priority |
|---|---|---|---|
| 10 | **Windows Tablet / Surface Style** | Microsoft Surface Pro, Lenovo IdeaPad detachable — wide screen, Windows productivity | 🟡 High Value |
| 11 | **Universal Tablet — Borderless** | Clean neutral tablet no brand — works for any platform presentation | 🟡 High Value |
| 12 | **Universal Tablet — Landscape Borderless** | Horizontal neutral — best for dashboard and web UI tablet mockups | 🟡 High Value |

---

## ⌚ SMARTWATCH FRAMES — 7 Frames

| # | Frame Name | What It Covers | Priority |
|---|---|---|---|
| 1 | **Rectangular Watch — Black** | Apple Watch Series / Samsung Galaxy Watch style | 🔴 Must Have |
| 2 | **Rectangular Watch — Silver** | Same geometry, silver / aluminium colourway | 🔴 Must Have |
| 3 | **Circular Watch — Dark** | Samsung Galaxy Watch Classic, Motorola 360, Wear OS round | 🔴 Must Have |
| 4 | **Circular Watch — Silver** | Same geometry, light colourway | 🟡 High Value |
| 5 | **Ultra Watch — Titanium** | Apple Watch Ultra / Galaxy Watch Ultra — larger flat-edge case | 🟡 High Value |
| 6 | **Sport Watch — Rugged** | Garmin, Fitbit, outdoor rugged — thicker bezel, sports audience | 🟡 High Value |
| 7 | **Square Pixel Watch Style** | Google Pixel Watch — circular but slightly squarish, distinct look | 🟢 Good to Have |

---

## Complete Count Summary

| Category | Sub-Group | Frames | Must Have |
|---|---|---|---|
| Mobile | iPhone Style | 7 | 3 |
| Mobile | Android Style | 7 | 5 |
| Mobile | Generic/Clay | 4 | 2 |
| Laptop | — | 10 | 4 |
| Tablet | iPad Style | 5 | 3 |
| Tablet | Android Tablet | 4 | 2 |
| Tablet | Windows/Universal | 3 | 0 |
| Smartwatch | — | 7 | 3 |
| **TOTAL** | | **47 frames** | **22 must-have** |

---

## Launch Strategy — 3 Tiers

**Launch Day — 22 frames (all Must Haves)**
Ship the must-haves first. Every major device category covered on day one.

**Version 1.1 — 38 frames (add all High Value)**
Add these within first month. User requests will tell you which ones to prioritize.

**Version 1.2 — 47 frames (complete library)**
All Good to Have frames added. You now have the most comprehensive free mockup tool available.




Great question. The design part is what separates a professional mockup tool from an average one. Let me break this down completely.Now let me build the complete visual design guide.Now the complete design guide — how to actually build every frame.

---

## How to Design the Frames — Complete Guide

---

### The Core Principle

Every single frame in your entire library — whether phone, laptop, tablet, or watch — is built from the same 5 layers stacked on top of each other in SVG. You saw this in the diagram. This is the pattern you repeat for every device.

```
Layer 1  →  Outer body shape       (the visible device shell)
Layer 2  →  Inner bezel ring       (slightly darker inset ring)
Layer 3  →  Screen background      (pure black fill)
Layer 4  →  Camera cutout          (pill / hole / notch / teardrop)
Layer 5  →  Gloss edge stroke      (white stroke at 5-9% opacity)
```

Once you understand these 5 layers, designing any new frame is just adjusting the geometry. Nothing else changes.

---

### The Design Properties That Make Frames Look Premium

These are the specific values that separate professional-looking frames from amateur ones.

**Corner radius (rx value)** is the most important visual property. Get this wrong and the frame looks cheap immediately.

| Device Type | Outer rx | Inner rx | Screen rx |
|---|---|---|---|
| Modern slim phone | 50–54px | 46–50px | 0 (flat) |
| Classic slab phone | 38–44px | 34–40px | 0 |
| Laptop lid | 12–16px | 8–12px | 0 |
| Tablet | 24–30px | 20–26px | 0 |
| Rectangular watch | 34–40px | 30–36px | 24–28px |
| Circular watch | circle | circle | circle |

**The bezel gap** — the space between the outer body edge and the screen edge — is what defines the device character.

| Device Style | Bezel Gap (each side) |
|---|---|
| Ultra-thin flagship phone | 6–8px |
| Standard mid-range phone | 10–14px |
| Classic home-button phone | 16–20px side / 60–80px top-bottom |
| Modern laptop | 14–18px all sides |
| iPad Pro | 10–14px |
| Standard iPad | 16–20px |
| Watch | 10–14px |

**Frame colour values** — use these exact values for each colour variant.

```
Dark Black frame:    outer #1a1a1e  /  inner #0d0d10  /  screen #000000
Space Grey frame:    outer #2a2a2e  /  inner #1a1a1e  /  screen #000000
Silver frame:        outer #d4d4d8  /  inner #b8b8bc  /  screen #000000
Midnight Blue frame: outer #1a1a2e  /  inner #0d0d1e  /  screen #000000
Clay / Neutral:      outer #c8c4bc  /  inner #b0aca4  /  screen #000000
```

**The gradient** — every frame looks significantly better with a subtle 2-stop linear gradient instead of a flat fill.

```svg
<linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" style="stop-color:#2a2a2e; stop-opacity:1"/>
  <stop offset="100%" style="stop-color:#1a1a1e; stop-opacity:1"/>
</linearGradient>
```

The gradient goes from top-left (slightly lighter) to bottom-right (slightly darker). This creates the illusion of a light source hitting the device from the top-left — exactly how real device photography works. This single addition makes every frame look 10x more professional.

**The drop shadow** — applied as an SVG filter on the outer body. Keep it subtle.

```svg
<filter id="frame-shadow">
  <feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.35"/>
</filter>
```

Values by frame size:
- Phone: dy=8, stdDeviation=16
- Laptop: dy=12, stdDeviation=24
- Tablet: dy=10, stdDeviation=18
- Watch: dy=6, stdDeviation=10

**The gloss edge** — a white stroke at very low opacity on the outer body. This simulates light catching the edge of the device frame. One line of SVG, massive visual impact.

```svg
<rect ... fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.08"/>
```

---

### How to Design Each Category

#### Mobile Frames — Exact Design Steps

**Step 1 — Define your canvas.** All mobile frames use 400 × 800 canvas. This gives a clean 1:2 aspect ratio. Do not change this.

**Step 2 — Draw the outer body.** Start with a rect that fills almost the entire canvas with a 2px margin on all sides.

```svg
<rect x="2" y="2" width="396" height="796" rx="52" ry="52"
      fill="url(#body-grad)" filter="url(#shadow)"/>
```

**Step 3 — Draw the inner bezel ring.** This sits 6px inside the outer body on all sides. The rx is 6 less than the outer rx.

```svg
<rect x="8" y="8" width="384" height="784" rx="46" ry="46"
      fill="#0d0d10"/>
```

**Step 4 — Draw the screen area.** This is your critical measurement. The screen starts where the bezel ends. For a standard modern phone with thin bezels:

```
Top gap:     60–70px   (this accommodates the camera cutout above the screen)
Bottom gap:  60–70px   (bottom chin of the device)
Side gap:    38–44px   (left and right bezels)
```

```svg
<rect x="42" y="68" width="316" height="664" fill="#000000"/>
```

**Step 5 — Add the camera cutout.** This sits above or overlapping the top of the screen. Position it centered horizontally.

```svg
<!-- Pill (iPhone Dynamic Island style) -->
<rect x="148" y="72" width="104" height="32" rx="16" fill="#0d0d10"/>

<!-- Punch-hole (Samsung/Pixel style) -->
<circle cx="200" cy="90" r="12" fill="#0d0d10"/>

<!-- Notch (iPhone 12/13 style) -->
<rect x="136" y="60" width="128" height="28" rx="0" fill="#0d0d10"/>

<!-- Teardrop (Realme/Vivo budget style) -->
<ellipse cx="200" cy="80" rx="16" ry="20" fill="#0d0d10"/>
```

**Step 6 — Add the gloss edge.** Duplicate the outer body rect exactly. Remove fill, add white stroke.

```svg
<rect x="2" y="2" width="396" height="796" rx="52" ry="52"
      fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.08"/>
```

**Done.** Your mobile frame is complete. The screenArea coordinates to put in frames.js are the x, y, width, height values from Step 4.

---

#### Laptop Frames — Exact Design Steps

Laptop frames have one extra element the phone does not — the keyboard deck below the screen.

**Canvas size:** 1200 × 800

**The structure has 2 parts:**

```
Part 1: Screen lid (the tall rectangle showing the display)
Part 2: Keyboard deck (flat base below the hinge)
```

**Screen lid geometry:**

```svg
<!-- Lid body -->
<rect x="40" y="20" width="1120" height="700" rx="14" fill="url(#laptop-grad)"/>

<!-- Bezel ring -->
<rect x="50" y="30" width="1100" height="680" rx="10" fill="#0d0d10"/>

<!-- Screen area -->
<rect x="96" y="52" width="1008" height="630" fill="#000000"/>

<!-- Webcam dot — always centered at top of screen -->
<circle cx="600" cy="42" r="5" fill="#1a1a1e"/>
```

**Keyboard deck geometry (below the lid):**

```svg
<!-- Main keyboard base -->
<rect x="0" y="728" width="1200" height="60" fill="url(#deck-grad)"/>

<!-- Hinge line -->
<rect x="40" y="720" width="1120" height="10" fill="#111116"/>

<!-- Bottom curve -->
<rect x="0" y="760" width="1200" height="28" rx="8" fill="#222226"/>

<!-- Trackpad suggestion (center, lower third of deck) -->
<rect x="480" y="740" width="240" height="36" rx="6" fill="#242428"/>
```

The screen area coordinates for frames.js: x:96, y:52, width:1008, height:630.

**For the Screen Only frame** (no keyboard deck shown) — simply omit the keyboard deck entirely and reduce canvas height to 750. The bezel ring becomes thicker proportionally since there is no deck to frame it.

---

#### Tablet Frames — Exact Design Steps

Tablets are essentially phones at a different aspect ratio. The key differences are the canvas size and bezel geometry.

**Portrait tablet canvas:** 600 × 800
**Landscape tablet canvas:** 900 × 680

**The critical difference between iPad and Android tablet frames:**

iPad Pro style — almost no bezels, front camera is a small punch-hole at the top center:
```
Canvas: 600 × 800
Side bezels: 14px each side
Top/bottom bezels: 16px each
Screen area: x:14, y:16, width:572, height:768
Camera: punch-hole circle, cx:300, cy:24, r:8
```

Standard iPad / Android tablet — moderate uniform bezels, home button era or rounded bezel:
```
Canvas: 600 × 800
Side bezels: 20px each side
Top/bottom bezels: 28px each
Screen area: x:20, y:28, width:560, height:744
```

**Landscape mode** — everything rotated. Camera moves to the left or right side bezel:
```
Canvas: 900 × 680
Screen area: x:18, y:14, width:864, height:652
Camera: punch-hole, cx:22, cy:340, r:8
```

---

#### Watch Frames — Exact Design Steps

Watches have one unique element — the band/strap above and below the body.

**Canvas:** 240 × 290 (the extra 50px height beyond the body accommodates the straps)

**Rectangular watch:**

```svg
<!-- Top strap -->
<rect x="72" y="0" width="96" height="50" rx="8" fill="#1e1e22"/>

<!-- Watch body -->
<rect x="16" y="38" width="208" height="214" rx="38" fill="url(#watch-grad)"/>

<!-- Inner bezel -->
<rect x="22" y="44" width="196" height="202" rx="34" fill="#111116"/>

<!-- Screen area (note: screen has rounded corners on watch) -->
<rect x="28" y="50" width="184" height="192" rx="28" fill="#000000"/>

<!-- Bottom strap -->
<rect x="72" y="240" width="96" height="50" rx="8" fill="#1e1e22"/>
```

**Circular watch — the key difference:**

For circular watches, the screen area is a circle, not a rectangle. This requires special handling in Fabric.js — you must use `fabric.Circle` as the clipPath instead of `fabric.Rect`. This is already handled in the canvasHelpers.js code from the documentation.

```svg
<!-- Top strap -->
<rect x="86" y="0" width="68" height="68" rx="6" fill="#1e1e22"/>

<!-- Watch body circle -->
<circle cx="120" cy="155" r="108" fill="url(#watch-grad)"/>

<!-- Inner bezel ring -->
<circle cx="120" cy="155" r="104" fill="#111116"/>

<!-- Screen background circle -->
<circle cx="120" cy="155" r="88" fill="#000000"/>

<!-- Bottom strap -->
<rect x="86" y="240" width="68" height="50" rx="6" fill="#1e1e22"/>
```

frames.js entry for the round watch:
```js
screenArea: {
  shape: 'circle',
  cx: 120, cy: 155, r: 88,
  x: 32, y: 67, width: 176, height: 176
}
```

---

### The Colour Variant System

For frames like "Rectangular Watch Black" and "Rectangular Watch Silver" — same geometry, different colours — you do not need two separate SVG files. You define the geometry once and pass a colour parameter.

The cleanest way to do this is through CSS custom properties inside the SVG:

```svg
<svg viewBox="0 0 240 290">
  <style>
    :root {
      --frame-outer: #1e1e22;
      --frame-inner: #111116;
    }
  </style>
  <!-- Use var(--frame-outer) everywhere -->
</svg>
```

Then in frames.js, add a `colorVariant` property, and in your `loadFrame` function inject the colour values before rendering.

Alternatively — and simpler for your MVP — just create two separate SVG files with different hex values. Takes 30 seconds per variant. Keep it simple.

---

### Design Quality Checklist

Before marking any frame as complete, verify every item:

```
[ ] Outer body rx and inner bezel rx differ by exactly 5-6px
[ ] Screen area is perfectly centered left-right in the body
[ ] Camera cutout is perfectly centered horizontally
[ ] Camera cutout colour matches inner bezel colour (not black)
[ ] Drop shadow is applied to outer body only — not inner elements
[ ] Gloss stroke is 0.5px at 6-9% white opacity — not higher
[ ] Gradient goes top-left lighter to bottom-right darker
[ ] All gradient and filter IDs are unique across all SVG files
[ ] Screen area coordinates exactly match what you put in frames.js
[ ] viewBox dimensions exactly match canvasWidth × canvasHeight in frames.js
[ ] No text, no logos, no brand marks anywhere in the file
[ ] SVG file size is under 3KB
```

---

### Build Order for All 47 Frames

**Do not design all 47 at once.** Build in this order:

First build the 4 mobile cutout types — these establish your design language. Once these 4 look right, every other frame is just geometry adjustment. Then build the 2 laptop frames, then 2 tablet frames, then 2 watch frames. That is 10 frames covering every category. Test all 10 working in the app. Then add colour variants and additional styles for the remaining 37 frames — each takes under 10 minutes since the design language is already defined.