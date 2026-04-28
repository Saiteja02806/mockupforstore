/** Premium vector frame geometry + finish-driven opacities (see buildDefs in main.js). */
export const CS = {
  midnight: {
    body: '#1e1e26',
    bodyLight: '#343442',
    bodyDark: '#0c0c10',
    bodyBounce: '#181820',
    bezel: '#0e0e16',
    bezelLight: '#1c1c26',
    btn: '#1a1a22',
    btnLight: '#2c2c3c',
    lens: '#090912',
    lens2: '#050508',
    screen: '#080812',
    specOpacity: 0.25,
    glassOpacity: 0.065,
    rimOpacity: 0.18,
    rimShadowOpacity: 0.55,
  },
  silver: {
    body: '#cfd1d5',
    bodyLight: '#ffffff',
    bodyDark: '#75777c',
    bodyBounce: '#a8aab0',
    bezel: '#1c1c1e',
    bezelLight: '#3a3a40',
    btn: '#c2c4c8',
    btnLight: '#ffffff',
    lens: '#141418',
    lens2: '#0a0a0c',
    screen: '#080812',
    specOpacity: 0.65,
    glassOpacity: 0.22,
    rimOpacity: 0.85,
    rimShadowOpacity: 0.35,
  },
  gold: {
    body: '#d4af37',
    bodyLight: '#fff5c2',
    bodyDark: '#6a4c0a',
    bodyBounce: '#9c7a1c',
    bezel: '#221a0a',
    bezelLight: '#3d2e15',
    btn: '#c8a32d',
    btnLight: '#fce488',
    lens: '#120e04',
    lens2: '#0a0802',
    screen: '#080812',
    specOpacity: 0.55,
    glassOpacity: 0.15,
    rimOpacity: 0.65,
    rimShadowOpacity: 0.45,
  },
}

/**
 * Join `frame.bgLayers(c)` for mockup SVG. `bezel_only` drops the outer chassis (see `bgChassisLayerCount`, default 2).
 * @param {{ bgLayers: (c: object) => string[], bgChassisLayerCount?: number }} frame
 * @param {'full' | 'bezel_only'} [mode]
 */
export function stitchFrameBg(frame, c, mode = 'full') {
  const layers = frame.bgLayers(c)
  const skip = mode === 'bezel_only' ? frame.bgChassisLayerCount ?? 2 : 0
  return layers.slice(skip).join('\n')
}

/** Continuous-curve rounded rect path (squircle-style) for chassis outlines. */
export function drawSquircle(x, y, w, h, r) {
  return `M ${x + r} ${y} H ${x + w - r} C ${x + w - r * 0.2} ${y}, ${x + w} ${y + r * 0.2}, ${x + w} ${y + r} V ${y + h - r} C ${x + w} ${y + h - r * 0.2}, ${x + w - r * 0.2} ${y + h}, ${x + w - r} ${y + h} H ${x + r} C ${x + r * 0.2} ${y + h}, ${x} ${y + h - r * 0.2}, ${x} ${y + h - r} V ${y + r} C ${x} ${y + r * 0.2}, ${x + r * 0.2} ${y}, ${x + r} ${y} Z`
}

export const FRAMES = [
  {
    id: 'iphone-13',
    name: 'iPhone 13',
    cat: 'mobile',
    vw: 400,
    vh: 820,
    sc: { x: 22, y: 22, w: 356, h: 776, rx: 38 },
    bgLayers: (c) => [
      `<rect x="14" y="14" width="372" height="792" rx="46" fill="${c.body}"/>`,
      `<rect x="14" y="14" width="372" height="792" rx="46" fill="url(#gspec)"/>`,
      `<rect x="20" y="20" width="360" height="780" rx="40" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.75"/>
      <rect x="20" y="20" width="360" height="780" rx="40" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="18" y="130" width="3" height="3" fill="${c.lens2}"/>
      <rect x="18" y="688" width="3" height="3" fill="${c.lens2}"/>
      <rect x="379" y="130" width="3" height="3" fill="${c.lens2}"/>
      <rect x="379" y="688" width="3" height="3" fill="${c.lens2}"/>
      <rect x="16" y="80" width="3" height="660" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="381" y="80" width="3" height="660" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <path d="M 125 20 C 135 20 135 48 145 48 L 255 48 C 265 48 265 20 275 20 Z" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.6"/>
      <rect x="175" y="22" width="50" height="4" rx="2" fill="${c.lens}" opacity="0.8"/>
      <circle cx="150" cy="34" r="5" fill="${c.screen}"/>
      <circle cx="150" cy="34" r="3.2" fill="none" stroke="#3a3a45" stroke-width="0.9"/>
      <circle cx="150" cy="34" r="2.4" fill="url(#optic-lens)"/>
      <circle cx="148.5" cy="32.5" r="1" fill="#182030" opacity=".7"/>
      <rect x="10" y="138" width="5" height="28" rx="1.5" fill="${c.lens2}"/>
      <rect x="11" y="142" width="3" height="20" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="10" y="188" width="5" height="54" rx="1.5" fill="${c.lens2}"/>
      <rect x="11" y="192" width="3" height="46" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="10" y="253" width="5" height="54" rx="1.5" fill="${c.lens2}"/>
      <rect x="11" y="257" width="3" height="46" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="385" y="208" width="5" height="79" rx="1.5" fill="${c.lens2}"/>
      <rect x="386" y="212" width="3" height="71" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="22" y="22" width="356" height="776" rx="38" fill="url(#gglass)"/>
      <rect x="22" y="22" width="356" height="776" rx="38" fill="url(#gvign)"/>
      <rect x="22" y="22" width="356" height="1.5" rx="0.75" fill="#ffffff" opacity="0.05"/>`,
  },
  {
    id: 'flagship-pro',
    name: 'Flagship Pro',
    cat: 'mobile',
    vw: 400,
    vh: 820,
    sc: { x: 22, y: 22, w: 356, h: 776, rx: 38 },
    bgLayers: (c) => {
      const outer = drawSquircle(12, 12, 376, 796, 50)
      const inner = drawSquircle(18, 18, 364, 784, 44)
      return [
        `<path d="${outer}" fill="${c.body}"/>`,
        `<path d="${outer}" fill="url(#gspec)"/>`,
        `<path d="${outer}" fill="none" stroke="url(#rim-light)" stroke-width="2"/>
      <rect x="12" y="130" width="3" height="4" fill="${c.lens2}" opacity="0.85"/>
      <rect x="385" y="130" width="3" height="4" fill="${c.lens2}" opacity="0.85"/>
      <rect x="12" y="674" width="3" height="4" fill="${c.lens2}" opacity="0.85"/>
      <rect x="385" y="674" width="3" height="4" fill="${c.lens2}" opacity="0.85"/>
      <path d="${inner}" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.75"/>
      <path d="${inner}" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="16" y="85" width="3.5" height="650" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="381" y="85" width="3.5" height="650" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
      ]
    },
    fg: (c) => `
      <rect x="135" y="32" width="130" height="34" rx="17" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.55"/>
      <rect x="157" y="42" width="86" height="5" rx="2.5" fill="${c.lens}" opacity="0.75"/>
      <circle cx="248" cy="49" r="6" fill="${c.screen}"/>
      <circle cx="248" cy="49" r="4" fill="none" stroke="#3a3a45" stroke-width="0.9"/>
      <circle cx="248" cy="49" r="3" fill="url(#optic-lens)"/>
      <circle cx="246.5" cy="47.5" r="1" fill="#182030" opacity=".65"/>
      <rect x="10" y="138" width="5" height="28" rx="1.5" fill="${c.lens2}"/>
      <rect x="11" y="142" width="3" height="20" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="10" y="188" width="5" height="54" rx="1.5" fill="${c.lens2}"/>
      <rect x="11" y="192" width="3" height="46" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="10" y="253" width="5" height="54" rx="1.5" fill="${c.lens2}"/>
      <rect x="11" y="257" width="3" height="46" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="385" y="208" width="5" height="79" rx="1.5" fill="${c.lens2}"/>
      <rect x="386" y="212" width="3" height="71" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="22" y="22" width="356" height="776" rx="38" fill="url(#gglass)"/>
      <rect x="22" y="22" width="356" height="776" rx="38" fill="url(#gvign)"/>
      <rect x="22" y="22" width="356" height="1.5" rx="0.75" fill="#ffffff" opacity="0.05"/>`,
  },
  {
    id: 'dynamic-island',
    name: 'Dynamic Island',
    cat: 'mobile',
    vw: 400,
    vh: 800,
    sc: { x: 38, y: 60, w: 324, h: 680, rx: 6 },
    bgLayers: (c) => [
      `<rect x="20" y="20" width="360" height="760" rx="50" fill="${c.body}"/>`,
      `<rect x="20" y="20" width="360" height="760" rx="50" fill="url(#gspec)"/>`,
      `<rect x="27" y="27" width="346" height="746" rx="45" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.75"/>
      <rect x="27" y="27" width="346" height="746" rx="45" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="20" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="20" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="23" y="68" width="3.5" height="642" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="374" y="68" width="3.5" height="642" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <rect x="144" y="30" width="112" height="26" rx="13" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.55"/>
      <circle cx="232" cy="43" r="5" fill="${c.screen}"/>
      <circle cx="232" cy="43" r="3.2" fill="none" stroke="#3a3a45" stroke-width="0.85"/>
      <circle cx="232" cy="43" r="2.5" fill="url(#optic-lens)"/>
      <circle cx="230.5" cy="41.5" r="0.9" fill="#182030" opacity=".65"/>
      <rect x="374" y="168" width="8" height="62" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="172" width="6" height="54" rx="3" fill="url(#btn-vol)"/>
      <rect x="374" y="246" width="8" height="42" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="250" width="6" height="34" rx="3" fill="url(#btn-vol)"/>
      <rect x="18" y="208" width="8" height="78" rx="3" fill="${c.lens2}"/>
      <rect x="19" y="212" width="6" height="70" rx="3" fill="url(#btn-vol)"/>
      <rect x="38" y="60" width="324" height="680" rx="6" fill="url(#gglass)"/>
      <rect x="38" y="60" width="324" height="680" rx="6" fill="url(#gvign)"/>
      <rect x="38" y="60" width="324" height="1.5" rx="0.75" fill="#ffffff" opacity="0.05"/>`,
  },
  {
    id: 'punch-hole',
    name: 'Punch-hole',
    cat: 'mobile',
    vw: 400,
    vh: 800,
    sc: { x: 38, y: 58, w: 324, h: 682, rx: 6 },
    bgLayers: (c) => [
      `<rect x="20" y="20" width="360" height="760" rx="50" fill="${c.body}"/>`,
      `<rect x="20" y="20" width="360" height="760" rx="50" fill="url(#gspec)"/>`,
      `<rect x="27" y="27" width="346" height="746" rx="45" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.75"/>
      <rect x="27" y="27" width="346" height="746" rx="45" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="20" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="20" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="23" y="68" width="3.5" height="642" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="374" y="68" width="3.5" height="642" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <circle cx="200" cy="40" r="9" fill="${c.screen}"/>
      <circle cx="200" cy="40" r="5.5" fill="none" stroke="#3a3a45" stroke-width="1"/>
      <circle cx="200" cy="40" r="3.8" fill="url(#optic-lens)"/>
      <circle cx="198.5" cy="38.5" r="1.1" fill="#182030" opacity=".7"/>
      <rect x="374" y="176" width="8" height="60" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="180" width="6" height="52" rx="3" fill="url(#btn-vol)"/>
      <rect x="374" y="252" width="8" height="40" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="256" width="6" height="32" rx="3" fill="url(#btn-vol)"/>
      <rect x="18" y="216" width="8" height="76" rx="3" fill="${c.lens2}"/>
      <rect x="19" y="220" width="6" height="68" rx="3" fill="url(#btn-vol)"/>
      <rect x="38" y="58" width="324" height="682" rx="6" fill="url(#gglass)"/>
      <rect x="38" y="58" width="324" height="682" rx="6" fill="url(#gvign)"/>
      <rect x="38" y="58" width="324" height="1.5" rx="0.75" fill="#ffffff" opacity="0.05"/>`,
  },
  {
    id: 'notch',
    name: 'Notch',
    cat: 'mobile',
    vw: 400,
    vh: 800,
    sc: { x: 38, y: 62, w: 324, h: 678, rx: 6 },
    bgLayers: (c) => [
      `<rect x="20" y="20" width="360" height="760" rx="50" fill="${c.body}"/>`,
      `<rect x="20" y="20" width="360" height="760" rx="50" fill="url(#gspec)"/>`,
      `<rect x="27" y="27" width="346" height="746" rx="45" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.75"/>
      <rect x="27" y="27" width="346" height="746" rx="45" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="20" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="20" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="23" y="68" width="3.5" height="642" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="374" y="68" width="3.5" height="642" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <rect x="148" y="27" width="104" height="32" rx="16" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.55"/>
      <rect x="170" y="37" width="44" height="5" rx="2.5" fill="url(#glens)" opacity="0.8"/>
      <circle cx="240" cy="43" r="5" fill="${c.screen}"/>
      <circle cx="240" cy="43" r="3.2" fill="none" stroke="#3a3a45" stroke-width="0.95"/>
      <circle cx="240" cy="43" r="2.4" fill="url(#optic-lens)"/>
      <circle cx="238.5" cy="41.5" r="0.95" fill="#182030" opacity=".7"/>
      <rect x="374" y="176" width="8" height="60" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="180" width="6" height="52" rx="3" fill="url(#btn-vol)"/>
      <rect x="374" y="252" width="8" height="40" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="256" width="6" height="32" rx="3" fill="url(#btn-vol)"/>
      <rect x="18" y="216" width="8" height="76" rx="3" fill="${c.lens2}"/>
      <rect x="19" y="220" width="6" height="68" rx="3" fill="url(#btn-vol)"/>
      <rect x="38" y="62" width="324" height="678" rx="6" fill="url(#gglass)"/>
      <rect x="38" y="62" width="324" height="678" rx="6" fill="url(#gvign)"/>
      <rect x="38" y="62" width="324" height="1.5" rx="0.75" fill="#ffffff" opacity="0.05"/>`,
  },
  {
    id: 'teardrop',
    name: 'Teardrop',
    cat: 'mobile',
    vw: 400,
    vh: 800,
    sc: { x: 40, y: 64, w: 320, h: 674, rx: 6 },
    bgLayers: (c) => [
      `<rect x="20" y="20" width="360" height="760" rx="48" fill="${c.body}"/>`,
      `<rect x="20" y="20" width="360" height="760" rx="48" fill="url(#gspec)"/>`,
      `<rect x="27" y="27" width="346" height="746" rx="43" fill="${c.bezel}" stroke="#2a2a30" stroke-width="0.75"/>
      <rect x="27" y="27" width="346" height="746" rx="43" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="20" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="20" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="120" width="3" height="3" fill="${c.lens2}"/>
      <rect x="377" y="678" width="3" height="3" fill="${c.lens2}"/>
      <rect x="23" y="68" width="3.5" height="642" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="374" y="68" width="3.5" height="642" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <ellipse cx="200" cy="46" rx="12" ry="15" fill="${c.screen}"/>
      <ellipse cx="200" cy="46" rx="8.5" ry="10.5" fill="none" stroke="#3a3a45" stroke-width="0.85"/>
      <ellipse cx="200" cy="46" rx="5.2" ry="6.5" fill="url(#optic-lens)"/>
      <ellipse cx="198.5" cy="44" rx="1.6" ry="1.9" fill="#182030" opacity=".7"/>
      <rect x="374" y="180" width="8" height="56" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="184" width="6" height="48" rx="3" fill="url(#btn-vol)"/>
      <rect x="374" y="252" width="8" height="38" rx="3" fill="${c.lens2}"/>
      <rect x="375" y="256" width="6" height="30" rx="3" fill="url(#btn-vol)"/>
      <rect x="18" y="220" width="8" height="72" rx="3" fill="${c.lens2}"/>
      <rect x="19" y="224" width="6" height="64" rx="3" fill="url(#btn-vol)"/>
      <rect x="40" y="64" width="320" height="674" rx="6" fill="url(#gglass)"/>
      <rect x="40" y="64" width="320" height="674" rx="6" fill="url(#gvign)"/>
      <rect x="40" y="64" width="320" height="1.5" rx="0.75" fill="#ffffff" opacity="0.05"/>`,
  },
  {
    id: 'borderless',
    name: 'Borderless',
    cat: 'mobile',
    vw: 400,
    vh: 800,
    sc: { x: 14, y: 14, w: 372, h: 772, rx: 48 },
    bgLayers: (c) => [
      `<rect x="10" y="10" width="380" height="780" rx="52" fill="${c.body}"/>`,
      `<rect x="10" y="10" width="380" height="780" rx="52" fill="url(#gspec)"/>`,
      `<rect x="10" y="10" width="380" height="780" rx="52" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.09"/>
      <rect x="12" y="60" width="3" height="660" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="386" y="60" width="3" height="660" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <rect x="173" y="776" width="54" height="4" rx="2" fill="${c.btn}" opacity=".65"/>
      <rect x="386" y="186" width="7" height="58" rx="2.5" fill="${c.lens2}"/>
      <rect x="387" y="190" width="5" height="50" rx="2.5" fill="url(#btn-vol)"/>
      <rect x="386" y="260" width="7" height="38" rx="2.5" fill="${c.lens2}"/>
      <rect x="387" y="264" width="5" height="30" rx="2.5" fill="url(#btn-vol)"/>
      <rect x="7" y="226" width="7" height="74" rx="2.5" fill="${c.lens2}"/>
      <rect x="8" y="230" width="5" height="66" rx="2.5" fill="url(#btn-vol)"/>
      <rect x="14" y="14" width="372" height="772" rx="48" fill="url(#gglass)"/>
      <rect x="14" y="14" width="372" height="772" rx="48" fill="url(#gvign)"/>`,
  },
  {
    id: 'foldable-closed',
    name: 'Foldable (closed)',
    cat: 'mobile',
    vw: 300,
    vh: 800,
    sc: { x: 30, y: 52, w: 240, h: 696, rx: 6 },
    bgLayers: (c) => [
      `<rect x="16" y="16" width="268" height="768" rx="38" fill="${c.body}"/>`,
      `<rect x="16" y="16" width="268" height="768" rx="38" fill="url(#gspec)"/>`,
      `<rect x="22" y="22" width="256" height="756" rx="33" fill="${c.bezel}"/>
      <rect x="22" y="22" width="256" height="756" rx="33" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="18" y="60" width="3" height="668" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="280" y="60" width="3" height="668" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <line x1="30" y1="400" x2="270" y2="400" stroke="${c.lens}" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.7"/>
      <circle cx="150" cy="36" r="7.5" fill="${c.bezel}"/>
      <circle cx="150" cy="36" r="5" fill="url(#glens)"/>
      <circle cx="150" cy="36" r="2.8" fill="url(#optic-lens)"/>
      <circle cx="149" cy="35" r="1" fill="#182030" opacity=".7"/>
      <rect x="276" y="178" width="8" height="52" rx="3" fill="${c.lens2}"/>
      <rect x="277" y="182" width="6" height="44" rx="3" fill="url(#btn-vol)"/>
      <rect x="276" y="246" width="8" height="34" rx="3" fill="${c.lens2}"/>
      <rect x="277" y="250" width="6" height="26" rx="3" fill="url(#btn-vol)"/>
      <rect x="16" y="208" width="8" height="66" rx="3" fill="${c.lens2}"/>
      <rect x="17" y="212" width="6" height="58" rx="3" fill="url(#btn-vol)"/>
      <rect x="30" y="52" width="240" height="696" rx="6" fill="url(#gglass)"/>
      <rect x="30" y="52" width="240" height="696" rx="6" fill="url(#gvign)"/>`,
  },
  {
    id: 'foldable-open',
    name: 'Foldable (open)',
    cat: 'mobile',
    vw: 760,
    vh: 800,
    sc: { x: 32, y: 32, w: 340, h: 736, rx: 6 },
    sc2: { x: 388, y: 32, w: 340, h: 736, rx: 6 },
    bgLayers: (c) => [
      `<rect x="16" y="16" width="728" height="768" rx="26" fill="${c.body}"/>`,
      `<rect x="16" y="16" width="728" height="768" rx="26" fill="url(#gspec)"/>`,
      `<rect x="22" y="22" width="716" height="756" rx="21" fill="${c.bezel}"/>
      <rect x="22" y="22" width="716" height="756" rx="21" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="18" y="40" width="3" height="718" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="741" y="40" width="3" height="718" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <rect x="372" y="22" width="16" height="756" fill="${c.bezel}"/>
      <rect x="375" y="22" width="10" height="756" fill="#ffffff" opacity="0.025"/>
      <circle cx="558" cy="48" r="7" fill="${c.bezel}"/>
      <circle cx="558" cy="48" r="4.5" fill="url(#glens)"/>
      <circle cx="558" cy="48" r="2.5" fill="url(#optic-lens)"/>
      <circle cx="557" cy="47" r="0.9" fill="#182030" opacity=".7"/>
      <rect x="739" y="188" width="8" height="52" rx="3" fill="${c.lens2}"/>
      <rect x="740" y="192" width="6" height="44" rx="3" fill="url(#btn-vol)"/>
      <rect x="739" y="256" width="8" height="34" rx="3" fill="${c.lens2}"/>
      <rect x="740" y="260" width="6" height="26" rx="3" fill="url(#btn-vol)"/>
      <rect x="13" y="228" width="8" height="66" rx="3" fill="${c.lens2}"/>
      <rect x="14" y="232" width="6" height="58" rx="3" fill="url(#btn-vol)"/>
      <rect x="32" y="32" width="340" height="736" rx="6" fill="url(#gglass)"/>
      <rect x="388" y="32" width="340" height="736" rx="6" fill="url(#gglass)"/>
      <rect x="32" y="32" width="340" height="736" rx="6" fill="url(#gvign)"/>
      <rect x="388" y="32" width="340" height="736" rx="6" fill="url(#gvign)"/>`,
  },
  {
    id: 'tab-portrait',
    name: 'Tablet portrait',
    cat: 'tablet',
    vw: 600,
    vh: 800,
    sc: { x: 32, y: 32, w: 536, h: 736, rx: 8 },
    bgLayers: (c) => [
      `<rect x="18" y="18" width="564" height="764" rx="24" fill="${c.body}"/>`,
      `<rect x="18" y="18" width="564" height="764" rx="24" fill="url(#gspec)"/>`,
      `<rect x="24" y="24" width="552" height="752" rx="19" fill="${c.bezel}"/>
      <rect x="24" y="24" width="552" height="752" rx="19" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="20" y="40" width="3" height="712" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="579" y="40" width="3" height="712" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <circle cx="300" cy="28" r="5.5" fill="url(#glens)"/>
      <circle cx="300" cy="28" r="3.2" fill="url(#optic-lens)"/>
      <circle cx="299" cy="27" r="1.1" fill="#182030" opacity=".7"/>
      <rect x="579" y="288" width="8" height="78" rx="3" fill="${c.lens2}"/>
      <rect x="580" y="292" width="6" height="70" rx="3" fill="url(#btn-vol)"/>
      <rect x="13" y="258" width="8" height="48" rx="3" fill="${c.lens2}"/>
      <rect x="14" y="262" width="6" height="40" rx="3" fill="url(#btn-vol)"/>
      <rect x="13" y="324" width="8" height="48" rx="3" fill="${c.lens2}"/>
      <rect x="14" y="328" width="6" height="40" rx="3" fill="url(#btn-vol)"/>
      <rect x="32" y="32" width="536" height="736" rx="8" fill="url(#gglass)"/>
      <rect x="32" y="32" width="536" height="736" rx="8" fill="url(#gvign)"/>
      <rect x="32" y="32" width="536" height="1.5" rx="0.75" fill="#ffffff" opacity="0.04"/>`,
  },
  {
    id: 'tab-landscape',
    name: 'Tablet landscape',
    cat: 'tablet',
    vw: 800,
    vh: 600,
    sc: { x: 32, y: 32, w: 736, h: 536, rx: 8 },
    bgLayers: (c) => [
      `<rect x="18" y="18" width="764" height="564" rx="24" fill="${c.body}"/>`,
      `<rect x="18" y="18" width="764" height="564" rx="24" fill="url(#gspec)"/>`,
      `<rect x="24" y="24" width="752" height="552" rx="19" fill="${c.bezel}"/>
      <rect x="24" y="24" width="752" height="552" rx="19" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.08"/>
      <rect x="20" y="32" width="3" height="518" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="779" y="32" width="3" height="518" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <circle cx="790" cy="300" r="5.5" fill="url(#glens)"/>
      <circle cx="790" cy="300" r="3.2" fill="url(#optic-lens)"/>
      <circle cx="789" cy="299" r="1.1" fill="#182030" opacity=".7"/>
      <rect x="257" y="13" width="46" height="7" rx="2.5" fill="${c.lens2}"/>
      <rect x="258" y="15" width="44" height="3" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="323" y="13" width="46" height="7" rx="2.5" fill="${c.lens2}"/>
      <rect x="324" y="15" width="44" height="3" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="653" y="13" width="76" height="7" rx="2.5" fill="${c.lens2}"/>
      <rect x="654" y="15" width="74" height="3" rx="1.5" fill="url(#btn-vol)"/>
      <rect x="32" y="32" width="736" height="536" rx="8" fill="url(#gglass)"/>
      <rect x="32" y="32" width="736" height="536" rx="8" fill="url(#gvign)"/>
      <rect x="32" y="32" width="736" height="1.5" rx="0.75" fill="#ffffff" opacity="0.04"/>`,
  },
  {
    id: 'laptop',
    name: 'Laptop',
    cat: 'desktop',
    vw: 1200,
    vh: 780,
    sc: { x: 86, y: 46, w: 1028, h: 628, rx: 4 },
    bgLayers: (c) => [
      `<rect x="36" y="18" width="1128" height="694" rx="14" fill="${c.body}"/>`,
      `<rect x="36" y="18" width="1128" height="694" rx="14" fill="url(#gspec)"/>`,
      `<rect x="40" y="22" width="1120" height="686" rx="12" fill="${c.bezel}"/>
      <rect x="40" y="22" width="1120" height="686" rx="12" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.07"/>
      <rect x="36" y="28" width="3" height="672" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="1163" y="28" width="3" height="672" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <circle cx="600" cy="36" r="4.5" fill="url(#glens)"/>
      <circle cx="600" cy="36" r="2.2" fill="url(#optic-lens)"/>
      <circle cx="600" cy="36" r="6.5" fill="none" stroke="${c.bezel}" stroke-width="1.2"/>
      <rect x="36" y="710" width="1128" height="8" rx="4" fill="${c.btn}" opacity="0.65"/>
      <rect x="0" y="716" width="1200" height="64" fill="${c.body}"/>
      <rect x="0" y="716" width="1200" height="64" fill="url(#gspec)" opacity="0.6"/>
      <rect x="0" y="716" width="1200" height="64" fill="none" stroke="${c.bezel}" stroke-width="1" opacity="0.3"/>
      <rect x="78" y="722" width="864" height="36" rx="5" fill="${c.bezel}" opacity="0.45"/>
      <rect x="84" y="727" width="852" height="9" rx="3" fill="${c.lens}" opacity="0.11"/>
      <rect x="84" y="741" width="852" height="9" rx="3" fill="${c.lens}" opacity="0.09"/>
      <rect x="464" y="724" width="272" height="26" rx="7" fill="${c.bezel}" opacity="0.5"/>
      <rect x="466" y="726" width="268" height="22" rx="6" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.08"/>
      <rect x="0" y="770" width="1200" height="10" rx="5" fill="${c.btn}" opacity="0.65"/>
      <rect x="86" y="46" width="1028" height="628" rx="4" fill="url(#gglass)"/>
      <rect x="86" y="46" width="1028" height="628" rx="4" fill="url(#gvign)"/>
      <rect x="86" y="46" width="1028" height="1.5" rx="0.75" fill="#ffffff" opacity="0.04"/>`,
  },
  {
    id: 'monitor',
    name: 'Monitor',
    cat: 'desktop',
    vw: 1200,
    vh: 860,
    sc: { x: 50, y: 30, w: 1100, h: 680, rx: 4 },
    bgLayers: (c) => [
      `<rect x="36" y="18" width="1128" height="712" rx="14" fill="${c.body}"/>`,
      `<rect x="36" y="18" width="1128" height="712" rx="14" fill="url(#gspec)"/>`,
      `<rect x="42" y="24" width="1116" height="700" rx="10" fill="${c.bezel}"/>
      <rect x="42" y="24" width="1116" height="700" rx="10" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.07"/>
      <rect x="38" y="28" width="3" height="696" rx="1.5" fill="#ffffff" opacity="${c.rimOpacity}"/>
      <rect x="1161" y="28" width="3" height="696" rx="1.5" fill="#000000" opacity="${c.rimShadowOpacity}"/>`,
    ],
    fg: (c) => `
      <circle cx="600" cy="27" r="4" fill="url(#glens)"/>
      <circle cx="600" cy="27" r="2" fill="url(#optic-lens)"/>
      <circle cx="1142" cy="718" r="3" fill="#0a2010"/>
      <rect x="548" y="730" width="104" height="68" rx="6" fill="${c.btn}"/>
      <rect x="548" y="730" width="104" height="68" rx="6" fill="url(#gspec)" opacity="0.4"/>
      <rect x="548" y="794" width="104" height="4" rx="2" fill="${c.lens}" opacity="0.25"/>
      <rect x="348" y="794" width="504" height="24" rx="10" fill="${c.body}"/>
      <rect x="318" y="814" width="564" height="12" rx="6" fill="${c.btn}"/>
      <rect x="50" y="30" width="1100" height="680" rx="4" fill="url(#gglass)"/>
      <rect x="50" y="30" width="1100" height="680" rx="4" fill="url(#gvign)"/>
      <rect x="50" y="30" width="1100" height="1.5" rx="0.75" fill="#ffffff" opacity="0.04"/>`,
  },
  {
    id: 'browser',
    name: 'Browser window',
    cat: 'desktop',
    vw: 1200,
    vh: 800,
    sc: { x: 28, y: 76, w: 1144, h: 696, rx: 0 },
    bgLayers: (c) => [
      `<rect x="20" y="20" width="1160" height="760" rx="12" fill="${c.body}"/>`,
      `<rect x="20" y="20" width="1160" height="56" rx="12" fill="url(#gspec)" opacity="0.22"/>`,
      `<rect x="20" y="20" width="1160" height="38" rx="12" fill="${c.bezel}"/>
      <line x1="20" y1="58" x2="1180" y2="58" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>
      <rect x="20" y="58" width="1160" height="18" fill="${c.bezel}"/>
      <circle cx="38" cy="39" r="6" fill="#3d1212"/><circle cx="38" cy="39" r="3.8" fill="#e05050"/>
      <circle cx="60" cy="39" r="6" fill="#3d3212"/><circle cx="60" cy="39" r="3.8" fill="#e0b040"/>
      <circle cx="82" cy="39" r="6" fill="#123d12"/><circle cx="82" cy="39" r="3.8" fill="#42c055"/>
      <rect x="108" y="28" width="150" height="22" rx="6" fill="${c.btn}"/>
      <rect x="266" y="30" width="894" height="18" rx="9" fill="url(#glens)" opacity="0.88"/>
      <rect x="282" y="36" width="5" height="6" rx="1" fill="#3a4060"/>
      <circle cx="284.5" cy="37" r="2.5" fill="none" stroke="#3a4060" stroke-width="1"/>
      <rect x="296" y="38" width="220" height="4" rx="2" fill="#1e2030" opacity=".42"/>
      <rect x="24" y="62" width="96" height="8" rx="4" fill="#1e2030" opacity="0.32"/>
      <rect x="128" y="62" width="72" height="8" rx="4" fill="#1e2030" opacity="0.24"/>
      <rect x="208" y="62" width="88" height="8" rx="4" fill="#1e2030" opacity="0.2"/>`,
    ],
    fg: (c) => `
      <rect x="20" y="756" width="1160" height="24" rx="12" fill="${c.body}"/>
      <rect x="28" y="76" width="1144" height="696" fill="url(#gglass)"/>
      <rect x="28" y="76" width="1144" height="696" fill="url(#gvign)"/>`,
  },
  {
    id: 'watch-square',
    name: 'Watch square',
    cat: 'watch',
    vw: 240,
    vh: 290,
    sc: { x: 30, y: 56, w: 180, h: 176, rx: 28 },
    bgChassisLayerCount: 7,
    bgLayers: (c) => [
      `<rect x="80" y="0" width="80" height="60" rx="12" fill="${c.body}"/>`,
      `<rect x="80" y="0" width="80" height="60" rx="12" fill="url(#gspec)" opacity="0.35"/>`,
      `<rect x="80" y="0" width="80" height="60" rx="12" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.06"/>`,
      `<rect x="80" y="232" width="80" height="58" rx="12" fill="${c.body}"/>`,
      `<rect x="80" y="232" width="80" height="58" rx="12" fill="url(#gspec)" opacity="0.28"/>`,
      `<rect x="80" y="232" width="80" height="58" rx="12" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.06"/>`,
      `<rect x="14" y="40" width="212" height="210" rx="44" fill="${c.body}"/>`,
      `<rect x="20" y="46" width="200" height="198" rx="38" fill="${c.bezel}"/>
      <rect x="20" y="46" width="200" height="198" rx="38" fill="none" stroke="#ffffff" stroke-width="0.55" opacity="0.07"/>`,
    ],
    fg: (c) => `
      <rect x="224" y="116" width="12" height="32" rx="5" fill="${c.lens2}"/>
      <rect x="225" y="120" width="10" height="24" rx="4" fill="url(#btn-vol)"/>
      <rect x="224" y="154" width="10" height="20" rx="4" fill="${c.lens2}"/>
      <rect x="225" y="158" width="8" height="12" rx="3" fill="url(#btn-vol)"/>`,
  },
  {
    id: 'watch-round',
    name: 'Watch round',
    cat: 'watch',
    vw: 240,
    vh: 290,
    sc: { cx: 120, cy: 145, r: 88 },
    circle: true,
    bgChassisLayerCount: 7,
    bgLayers: (c) => [
      `<rect x="90" y="0" width="60" height="62" rx="10" fill="${c.body}"/>`,
      `<rect x="90" y="0" width="60" height="62" rx="10" fill="url(#gspec)" opacity="0.35"/>`,
      `<rect x="90" y="0" width="60" height="62" rx="10" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.06"/>`,
      `<rect x="90" y="230" width="60" height="60" rx="10" fill="${c.body}"/>`,
      `<rect x="90" y="230" width="60" height="60" rx="10" fill="url(#gspec)" opacity="0.28"/>`,
      `<rect x="90" y="230" width="60" height="60" rx="10" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.06"/>`,
      `<circle cx="120" cy="145" r="108" fill="${c.body}"/>`,
      `<circle cx="120" cy="145" r="102" fill="${c.bezel}"/>
      <circle cx="120" cy="145" r="102" fill="none" stroke="#ffffff" stroke-width="0.55" opacity="0.07"/>`,
    ],
    fg: (c) => `
      <rect x="227" y="130" width="12" height="20" rx="5" fill="${c.lens2}"/>
      <rect x="228" y="134" width="10" height="12" rx="4" fill="url(#btn-vol)"/>
      <rect x="227" y="154" width="10" height="16" rx="4" fill="${c.lens2}"/>
      <rect x="228" y="158" width="8" height="8" rx="3" fill="url(#btn-vol)"/>`,
  },
]
