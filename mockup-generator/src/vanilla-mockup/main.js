import './styles.css'
import { CS, FRAMES, stitchFrameBg } from './frames.js'
import { applySvgIdSuffix, buildSVG } from './mockupSvg.js'
import { rasterizeMockupToCanvas, SCENE_BG_NONE } from './mockupRaster.js'
import { openStoreEditor, closeStoreEditor } from '../store-editor/storeEditorMount.jsx'

const SOLIDS = [
  '#0b0c10',
  '#1c1c1c',
  '#ffffff',
  '#f2f2f0',
  '#e8eaf2',
  '#1a2030',
  '#1a3040',
  '#1a301e',
  '#38101e',
  '#281638',
  '#302208',
  '#262630',
]
const GRADS = [
  'linear-gradient(145deg,#0b0c10,#1a1c2e)',
  'linear-gradient(145deg,#0a1426,#0d3d5a)',
  'linear-gradient(145deg,#0a1c12,#0d3e26)',
  'linear-gradient(145deg,#1c0810,#48161e)',
  'linear-gradient(160deg,#ffffff,#e8eaf0)',
  'linear-gradient(160deg,#c8d8f2,#e8f0ff)',
  'linear-gradient(160deg,#d8c8f2,#f0e8ff)',
  'linear-gradient(145deg,#0e1018,#14182a)',
]

const st = {
  frameId: 'dynamic-island',
  finish: 'midnight',
  cat: 'mobile',
  img: null,
  imgName: '',
  imgSize: 0,
  fit: 'slice',
  bg: SOLIDS[0],
}

function render() {
  const frame = FRAMES.find((f) => f.id === st.frameId)
  if (!frame) return
  const c = CS[st.finish]
  const svgStr = buildSVG(frame, c, st.img, st.fit, 'canvas')

  document.getElementById('frame-output').innerHTML = svgStr
  document.getElementById('empty-hint').classList.add('hidden')

  const bg = document.getElementById('canvas-bg-layer')
  if (st.bg === SCENE_BG_NONE) {
    bg.classList.add('scene-none')
    bg.style.background = ''
  } else {
    bg.classList.remove('scene-none')
    bg.style.background = st.bg
  }
  bg.classList.toggle('no-grid', st.bg !== SOLIDS[0] && st.bg !== SCENE_BG_NONE)

  const noBgBtn = document.getElementById('btn-no-bg')
  if (noBgBtn) noBgBtn.classList.toggle('active', st.bg === SCENE_BG_NONE)
  document.querySelectorAll('#solid-swatches .swatch').forEach((el) => {
    el.classList.toggle('active', st.bg === el.getAttribute('data-s'))
  })
  document.querySelectorAll('#grad-swatches .grad-swatch').forEach((el) => {
    const i = parseInt(el.dataset.gi, 10)
    el.classList.toggle('active', st.bg === GRADS[i])
  })

  const jpgBtn = document.getElementById('btn-jpg')
  if (jpgBtn) {
    jpgBtn.disabled = st.bg === SCENE_BG_NONE
    jpgBtn.title = st.bg === SCENE_BG_NONE ? 'JPEG has no transparency — use PNG or pick a solid background' : ''
  }

  document.getElementById('tb-frame').textContent = frame.name
  document.getElementById('tb-fin').textContent = st.finish.charAt(0).toUpperCase() + st.finish.slice(1)
  document.getElementById('tb-img').textContent = st.img ? (st.fit === 'meet' ? 'Full image' : 'Fill screen') : 'No image'
  document.getElementById('canvas-dim').textContent = `${frame.vw} × ${frame.vh}`
  document.getElementById('cb-dims').textContent = `${frame.vw}×${frame.vh}px`

  const dot = document.getElementById('s-dot')
  const txt = document.getElementById('s-txt')
  const cbdot = document.getElementById('cb-dot')
  if (st.img) {
    dot.className = 'status-dot placed'
    txt.textContent = 'Image placed'
    cbdot.className = 'cb-dot has-img'
  } else {
    dot.className = 'status-dot ready'
    txt.textContent = 'Frame ready — upload artwork'
    cbdot.className = 'cb-dot on'
  }
  document.getElementById('cb-status').textContent = st.img ? 'Image placed' : 'Frame ready'

  const hint = document.getElementById('tb-hint')
  if (hint) hint.textContent = 'Move mouse over canvas for dynamic lighting'
}

function thumb(frame) {
  const c = CS.midnight
  const { vw, vh, sc } = frame
  const maxW = 50
  const maxH = 46
  const scale = Math.min(maxW / vw, maxH / vh)
  const tw = Math.round(vw * scale)
  const th = Math.round(vh * scale)
  let scFill = ''
  if (frame.circle) scFill = `<circle cx="${sc.cx}" cy="${sc.cy}" r="${sc.r}" fill="#080812"/>`
  else if (frame.sc2) {
    const s2 = frame.sc2
    scFill = `<rect x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}" rx="${sc.rx || 0}" fill="#080812"/>
            <rect x="${s2.x}" y="${s2.y}" width="${s2.w}" height="${s2.h}" rx="${s2.rx || 0}" fill="#080812"/>`
  } else scFill = `<rect x="${sc.x}" y="${sc.y}" width="${sc.w}" height="${sc.h}" rx="${sc.rx || 0}" fill="#080812"/>`

  const td = `<defs>
    <linearGradient id="gbody"><stop offset="0%" stop-color="${c.body}"/></linearGradient>
    <linearGradient id="gbezel"><stop offset="0%" stop-color="${c.bezel}"/></linearGradient>
    <linearGradient id="gbtn"><stop offset="0%" stop-color="${c.btn}"/></linearGradient>
    <linearGradient id="gspec"><stop offset="0%" stop-color="${c.body}" stop-opacity="0"/></linearGradient>
    <linearGradient id="gglass"><stop offset="0%" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="glens"><stop offset="0%" stop-color="${c.lens}"/></radialGradient>
    <radialGradient id="gvign"><stop offset="0%" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="optic-lens" cx="40%" cy="40%" r="60%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="15%" stop-color="#1a2b5a"/>
      <stop offset="50%" stop-color="#050508"/><stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <linearGradient id="btn-vol" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c.bodyDark}"/><stop offset="50%" stop-color="${c.bodyLight}"/><stop offset="100%" stop-color="${c.body}"/>
    </linearGradient>
    <linearGradient id="rim-light" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/><stop offset="30%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="70%" stop-color="#000000" stop-opacity="0.4"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
    </linearGradient>
  </defs>`

  const raw = `<svg viewBox="0 0 ${vw} ${vh}" width="${tw}" height="${th}" xmlns="http://www.w3.org/2000/svg">
    ${td}
    ${stitchFrameBg(frame, c, 'full')}${scFill}${frame.fg(c)}
  </svg>`
  return applySvgIdSuffix(raw, `thumb-${frame.id}`)
}

function buildGrid() {
  const grid = document.getElementById('frame-grid')
  const list = FRAMES.filter((f) => f.cat === st.cat)
  grid.innerHTML = list
    .map(
      (f) => `
    <div class="frame-card${f.id === st.frameId ? ' active' : ''}" data-fid="${f.id}">
      <div class="fc-preview">${thumb(f)}</div>
      <div class="fc-name">${f.name}</div>
    </div>`,
    )
    .join('')
  grid.onclick = (e) => {
    const card = e.target.closest('[data-fid]')
    if (!card) return
    st.frameId = card.dataset.fid
    document.querySelectorAll('.frame-card').forEach((c) => c.classList.toggle('active', c === card))
    render()
  }
}

function buildSwatches() {
  const sg = document.getElementById('solid-swatches')
  sg.innerHTML = SOLIDS.map((s) => `<div class="swatch${st.bg === s ? ' active' : ''}" data-s="${s}" style="background:${s};"></div>`).join('')
  sg.onclick = (e) => {
    const sw = e.target.closest('[data-s]')
    if (!sw) return
    st.bg = sw.dataset.s
    document.getElementById('custom-bg').value = ''
    render()
  }
  const gg = document.getElementById('grad-swatches')
  gg.innerHTML = GRADS.map(
    (g, i) => `<div class="grad-swatch${st.bg === g ? ' active' : ''}" data-gi="${i}" style="background:${g};"></div>`,
  ).join('')
  gg.onclick = (e) => {
    const sw = e.target.closest('[data-gi]')
    if (!sw) return
    st.bg = GRADS[parseInt(sw.dataset.gi, 10)]
    document.getElementById('custom-bg').value = ''
    render()
  }
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    st.img = e.target.result
    st.imgName = file.name
    st.imgSize = file.size
    const card = document.getElementById('img-card')
    card.classList.remove('hidden')
    document.getElementById('img-thumb').src = e.target.result
    document.getElementById('img-name').textContent = file.name
    const kb = Math.round(file.size / 1024)
    document.getElementById('img-meta').textContent = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
    document.getElementById('fit-controls').classList.remove('hidden')
    document.getElementById('upload-zone').classList.add('hidden')
    document.getElementById('n2').classList.add('active')
    render()
  }
  reader.readAsDataURL(file)
}

async function doExport(fmt) {
  const frame = FRAMES.find((f) => f.id === st.frameId)
  if (!frame) {
    alert('Select a frame first.')
    return
  }
  if (fmt === 'jpg' && st.bg === SCENE_BG_NONE) {
    alert('JPEG does not support transparency. Export as PNG or choose a solid or gradient background.')
    return
  }
  const scale = 2
  const off = document.getElementById('off-canvas')
  const includeScene = st.bg !== SCENE_BG_NONE
  await rasterizeMockupToCanvas({
    frame,
    finishKey: st.finish,
    img: st.img,
    fit: st.fit,
    bg: st.bg,
    scale,
    padPerScaleUnit: 80,
    includeSceneBg: includeScene,
    idSuffix: 'export',
    canvas: off,
  })

  const fname = (st.imgName || 'mockup').replace(/\.[^.]+$/, '')
  const a = document.createElement('a')
  a.download = `${fname}_mockup.${fmt}`
  a.href = fmt === 'png' ? off.toDataURL('image/png') : off.toDataURL('image/jpeg', 0.93)
  a.click()
}

function wireEvents() {
  const zone = document.getElementById('upload-zone')
  document.getElementById('file-in').onchange = (e) => handleFile(e.target.files[0])
  zone.addEventListener('dragover', (e) => {
    e.preventDefault()
    zone.classList.add('drag')
  })
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'))
  zone.addEventListener('drop', (e) => {
    e.preventDefault()
    zone.classList.remove('drag')
    handleFile(e.dataTransfer.files[0])
  })
  document.getElementById('img-rm').onclick = () => {
    st.img = null
    st.imgName = ''
    st.imgSize = 0
    document.getElementById('img-card').classList.add('hidden')
    document.getElementById('fit-controls').classList.add('hidden')
    document.getElementById('upload-zone').classList.remove('hidden')
    document.getElementById('file-in').value = ''
    document.getElementById('n2').classList.remove('active')
    render()
  }

  document.querySelectorAll('.fit-btn').forEach((btn) => {
    btn.onclick = () => {
      st.fit = btn.dataset.fit
      document.querySelectorAll('.fit-btn').forEach((b) => b.classList.toggle('active', b === btn))
      const hint = document.getElementById('fit-hint')
      hint.textContent =
        st.fit === 'meet' ? 'Full image visible · letterboxed if needed' : 'Image fills screen · edges may be cropped'
      render()
    }
  })

  document.getElementById('cat-grid').onclick = (e) => {
    const btn = e.target.closest('[data-cat]')
    if (!btn) return
    st.cat = btn.dataset.cat
    document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b === btn))
    const first = FRAMES.find((f) => f.cat === st.cat)
    if (first) st.frameId = first.id
    buildGrid()
    render()
  }
  document.getElementById('finish-row').onclick = (e) => {
    const chip = e.target.closest('[data-fin]')
    if (!chip) return
    st.finish = chip.dataset.fin
    document.querySelectorAll('[data-fin]').forEach((c) => c.classList.toggle('active', c === chip))
    render()
  }

  document.getElementById('custom-bg').oninput = (e) => {
    const v = e.target.value.trim()
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      st.bg = v
      render()
    }
  }

  document.getElementById('btn-no-bg').onclick = () => {
    st.bg = SCENE_BG_NONE
    document.getElementById('custom-bg').value = ''
    render()
  }

  document.getElementById('btn-png').onclick = () => doExport('png')
  document.getElementById('btn-jpg').onclick = () => doExport('jpg')

  document.getElementById('btn-store-edit').onclick = async () => {
    const frame = FRAMES.find((f) => f.id === st.frameId)
    if (!frame) {
      alert('Select a frame first.')
      return
    }
    try {
      const scale = 2
      const base = {
        frame,
        finishKey: st.finish,
        img: st.img,
        fit: st.fit,
        bg: st.bg,
        scale,
        padPerScaleUnit: 80,
      }
      if (st.bg === SCENE_BG_NONE) {
        const c = CS[st.finish]
        if (!c) throw new Error(`Unknown finish: ${st.finish}`)
        const svgStr = buildSVG(frame, c, st.img, st.fit, 'store-capture-device', {
          chassis: 'bezel_only',
        })
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`
        openStoreEditor({
          initialMockupWithSceneUrl: svgUrl,
          initialMockupDeviceOnlyUrl: svgUrl,
          mockupCapturesIdentical: true,
          suggestedBaseName: (st.imgName || 'mockup').replace(/\.[^.]+$/, ''),
          onClose: () => closeStoreEditor(),
        })
      } else {
        const canvasWithBg = await rasterizeMockupToCanvas({
          ...base,
          includeSceneBg: true,
          idSuffix: 'store-capture-scene',
        })
        const canvasDevice = await rasterizeMockupToCanvas({
          ...base,
          includeSceneBg: false,
          chassis: 'bezel_only',
          idSuffix: 'store-capture-device',
        })
        openStoreEditor({
          initialMockupWithSceneUrl: canvasWithBg.toDataURL('image/png'),
          initialMockupDeviceOnlyUrl: canvasDevice.toDataURL('image/png'),
          mockupCapturesIdentical: false,
          suggestedBaseName: (st.imgName || 'mockup').replace(/\.[^.]+$/, ''),
          onClose: () => closeStoreEditor(),
        })
      }
    } catch (e) {
      console.error(e)
      alert('Could not prepare mockup for the store editor.')
    }
  }

  document.getElementById('btn-copy').onclick = async () => {
    const frame = FRAMES.find((f) => f.id === st.frameId)
    if (!frame) {
      alert('Select a frame first.')
      return
    }
    const scale = 2
    const off = document.getElementById('off-canvas')
    await rasterizeMockupToCanvas({
      frame,
      finishKey: st.finish,
      img: st.img,
      fit: st.fit,
      bg: st.bg,
      scale,
      padPerScaleUnit: 80,
      includeSceneBg: st.bg !== SCENE_BG_NONE,
      idSuffix: 'clipboard',
      canvas: off,
    })
    off.toBlob(async (b) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })])
        const btn = document.getElementById('btn-copy')
        btn.textContent = '✓ Copied to clipboard!'
        setTimeout(() => {
          btn.textContent = 'Copy to clipboard'
        }, 2200)
      } catch {
        alert('Clipboard copy failed — use Export PNG instead.')
      }
    })
  }

  const view = document.getElementById('canvas-view')
  const output = document.getElementById('frame-output')
  const suf = 'canvas'

  function resetLightingGradients() {
    const gspec = document.getElementById(`gspec-${suf}`)
    const gglass = document.getElementById(`gglass-${suf}`)
    const gbody = document.getElementById(`gbody-${suf}`)
    if (gspec) {
      gspec.setAttribute('x1', '-20%')
      gspec.setAttribute('y1', '-20%')
      gspec.setAttribute('x2', '80%')
      gspec.setAttribute('y2', '100%')
    }
    if (gglass) {
      gglass.setAttribute('x1', '-20%')
      gglass.setAttribute('y1', '-20%')
      gglass.setAttribute('x2', '80%')
      gglass.setAttribute('y2', '100%')
    }
    if (gbody) {
      gbody.setAttribute('x1', '0%')
      gbody.setAttribute('y1', '0%')
      gbody.setAttribute('x2', '100%')
      gbody.setAttribute('y2', '100%')
    }
  }

  view.addEventListener('mousemove', (e) => {
    if (!output.innerHTML.trim()) return
    const rect = view.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    const gspec = document.getElementById(`gspec-${suf}`)
    const gglass = document.getElementById(`gglass-${suf}`)
    const gbody = document.getElementById(`gbody-${suf}`)

    if (gspec && gglass && gbody) {
      const shiftX = x * 120 - 60
      const shiftY = y * 120 - 60
      gspec.setAttribute('x1', `${-20 + shiftX}%`)
      gspec.setAttribute('y1', `${-20 + shiftY}%`)
      gspec.setAttribute('x2', `${80 + shiftX}%`)
      gspec.setAttribute('y2', `${100 + shiftY}%`)
      gglass.setAttribute('x1', `${-20 + shiftX}%`)
      gglass.setAttribute('y1', `${-20 + shiftY}%`)
      gglass.setAttribute('x2', `${80 + shiftX}%`)
      gglass.setAttribute('y2', `${100 + shiftY}%`)
      gbody.setAttribute('x1', `${shiftX * 0.2}%`)
      gbody.setAttribute('y1', `${shiftY * 0.2}%`)
      gbody.setAttribute('x2', `${100 + shiftX * 0.2}%`)
      gbody.setAttribute('y2', `${100 + shiftY * 0.2}%`)
    }

    const tiltX = (y - 0.5) * -4
    const tiltY = (x - 0.5) * 4
    output.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
  })

  view.addEventListener('mouseleave', () => {
    output.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    resetLightingGradients()
  })
}

buildGrid()
buildSwatches()
wireEvents()
render()
