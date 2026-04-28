/**
 * Marketing hero — uses the actual SVG vector frames from /public/frames/mobile/.
 *
 * Technique: screen content (gradient / UI) sits in a div positioned exactly over
 * the transparent screenArea of each SVG, then the SVG bezel is layered on top via
 * an <img> tag.  Because the SVGs have a transparent screen hole the content shows
 * through perfectly, identical to how the editor Fabric canvas works.
 *
 * Layout: 3 column grid, matching the reference image.
 */

/* ── SVG frame catalogue (subset used in the hero) ───────────────────── */
const F = {
  pill: {
    src: '/frames/mobile/pill-phone.svg',
    cw: 400, ch: 800,
    sa: { x: 38, y: 60, w: 324, h: 680, r: 4 },
  },
  punchhole: {
    src: '/frames/mobile/punchhole-phone.svg',
    cw: 400, ch: 800,
    sa: { x: 38, y: 58, w: 324, h: 682, r: 4 },
  },
  notch: {
    src: '/frames/mobile/notch-phone.svg',
    cw: 400, ch: 800,
    sa: { x: 38, y: 62, w: 324, h: 678, r: 4 },
  },
  borderless: {
    src: '/frames/mobile/borderless-phone.svg',
    cw: 400, ch: 800,
    sa: { x: 14, y: 14, w: 372, h: 772, r: 48 },
  },
}

/* ── Rich screen content components ─────────────────────────────────── */

const GRADIENTS = [
  /* 0 */ 'linear-gradient(155deg,#ff2d55 0%,#af52de 48%,#5856d6 100%)',
  /* 1 */ 'linear-gradient(145deg,#34aadc 0%,#007aff 42%,#5856d6 100%)',
  /* 2 */ 'linear-gradient(155deg,#ff6b6b 0%,#feca57 55%,#ff9f43 100%)',
  /* 3 */ 'linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
  /* 4 */ 'linear-gradient(155deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
  /* 5 */ 'linear-gradient(150deg,#f093fb 0%,#f5576c 50%,#4facfe 100%)',
  /* 6 */ 'linear-gradient(155deg,#43e97b 0%,#38f9d7 55%,#0ea5e9 100%)',
]

function GradientScreen({ seed = 0, children }) {
  const bg = GRADIENTS[seed % GRADIENTS.length]
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: bg }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.8),transparent_55%)]" />
      {children}
    </div>
  )
}

/** "Welcome to Pro" onboarding / splash screen */
function WelcomeScreen() {
  return (
    <div className="relative flex h-full w-full flex-col bg-[#05070a] px-[10%] pt-[16%] pb-[10%]">
      <div className="mb-[8%] h-[4%] w-[60%] rounded-full bg-white/8" />
      <div
        className="mx-auto mb-[8%] flex h-[22%] w-[55%] items-center justify-center rounded-2xl bg-[#0d1b3e]"
        style={{ boxShadow: '0 0 0 1px rgba(26,105,255,0.3)' }}
      >
        <div className="flex h-[50%] w-[50%] items-center justify-center rounded-xl bg-[#1A69FF]">
          <span className="font-bold text-white" style={{ fontSize: '1.4em' }}>M</span>
        </div>
      </div>
      <div className="mb-[3%] text-center font-bold text-white leading-snug" style={{ fontSize: '0.82em' }}>
        Welcome to Pro
      </div>
      <div className="mb-[10%] text-center text-white/50" style={{ fontSize: '0.62em' }}>
        Your mockup studio
      </div>
      <div className="space-y-[5%]">
        <div
          className="flex h-[11%] min-h-[18px] w-full items-center rounded-xl bg-white/6 px-[8%] text-white/40"
          style={{ fontSize: '0.6em', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Email address
        </div>
        <div
          className="flex h-[11%] min-h-[18px] w-full items-center rounded-xl bg-white/6 px-[8%] text-white/40"
          style={{ fontSize: '0.6em', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Password
        </div>
      </div>
      <div
        className="mt-[8%] flex h-[12%] min-h-[22px] w-full items-center justify-center rounded-full bg-[#1A69FF] font-bold text-white"
        style={{ fontSize: '0.65em', boxShadow: '0 4px 20px rgba(26,105,255,0.5)' }}
      >
        Sign Up Free
      </div>
      <div className="mt-[8%] text-center text-white/30" style={{ fontSize: '0.55em' }}>
        Already have an account? Log in
      </div>
    </div>
  )
}

/** Sign-in screen */
function SignInScreen() {
  return (
    <div className="relative flex h-full w-full flex-col bg-[#08090d] px-[10%] pt-[20%] pb-[10%]">
      <div className="mb-[4%] h-[4%] w-[50%] rounded-full bg-white/8" />
      <div className="mb-[3%] font-bold text-white" style={{ fontSize: '0.9em' }}>
        Sign in
      </div>
      <div className="mb-[12%] text-white/40" style={{ fontSize: '0.6em' }}>
        Welcome back
      </div>
      <div className="space-y-[5%]">
        <div
          className="flex h-[11%] min-h-[18px] w-full items-center rounded-xl bg-white/6 px-[8%] text-white/40"
          style={{ fontSize: '0.6em', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Username
        </div>
        <div
          className="flex h-[11%] min-h-[18px] w-full items-center rounded-xl bg-white/6 px-[8%] text-white/40"
          style={{ fontSize: '0.6em', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Password
        </div>
      </div>
      <div className="mt-[4%] self-end text-white/40" style={{ fontSize: '0.55em' }}>
        Forgot password?
      </div>
      <div
        className="mt-[8%] flex h-[12%] min-h-[22px] w-full items-center justify-center rounded-full bg-[#1A69FF] font-semibold text-white"
        style={{ fontSize: '0.65em', boxShadow: '0 4px 16px rgba(26,105,255,0.45)' }}
      >
        Log in
      </div>
      <div className="mt-[6%] text-center text-white/25" style={{ fontSize: '0.55em' }}>
        New here? Create account
      </div>
    </div>
  )
}

/** Calendar / task overview screen */
function CalendarScreen() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const dates = [
    [null, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
  ]
  return (
    <div className="flex h-full w-full flex-col bg-[#05070a] px-[6%] pt-[12%] pb-[8%]">
      <div className="mb-[3%] h-[3.5%] w-[40%] rounded-full bg-white/8" />
      <div className="mb-[1%] font-bold text-white/90" style={{ fontSize: '0.78em' }}>
        Tuesday Apr 1
      </div>
      <div className="mb-[6%] text-white/40" style={{ fontSize: '0.58em' }}>
        3 events today
      </div>
      {/* Day headers */}
      <div className="mb-[2%] grid grid-cols-7 text-center text-white/35" style={{ fontSize: '0.52em' }}>
        {days.map((d) => <span key={d}>{d}</span>)}
      </div>
      {/* Date grid */}
      {dates.map((row, ri) => (
        <div key={ri} className="mb-[1%] grid grid-cols-7 text-center text-white/70" style={{ fontSize: '0.55em' }}>
          {row.map((d, ci) => (
            <span
              key={ci}
              className={`inline-flex items-center justify-center rounded-full ${d === 1 ? 'bg-[#1A69FF] text-white font-bold' : ''}`}
              style={{ aspectRatio: '1', margin: '1px auto' }}
            >
              {d ?? ''}
            </span>
          ))}
        </div>
      ))}
      {/* Event cards */}
      <div className="mt-[5%] space-y-[4%]">
        <div
          className="flex items-center gap-[6%] rounded-xl px-[6%] py-[4%]"
          style={{ background: 'rgba(26,105,255,0.15)', border: '1px solid rgba(26,105,255,0.25)' }}
        >
          <div className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#1A69FF]" />
          <div>
            <div className="text-white/80" style={{ fontSize: '0.6em' }}>Design Review</div>
            <div className="text-white/40" style={{ fontSize: '0.5em' }}>10:00 AM</div>
          </div>
        </div>
        <div
          className="flex items-center gap-[6%] rounded-xl px-[6%] py-[4%]"
          style={{ background: 'rgba(193,255,77,0.08)', border: '1px solid rgba(193,255,77,0.18)' }}
        >
          <div className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#C1FF4D]" />
          <div>
            <div className="text-white/80" style={{ fontSize: '0.6em' }}>Launch Prep</div>
            <div className="text-white/40" style={{ fontSize: '0.5em' }}>2:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Gradient + minimal "app" overlay (feeds, lists) */
function AppListScreen({ seed = 0 }) {
  return (
    <GradientScreen seed={seed}>
      <div className="absolute inset-x-[8%] top-[18%] space-y-[4%]">
        {[70, 90, 55, 80, 65].map((w, i) => (
          <div
            key={i}
            className="h-[4px] rounded-full bg-white/25"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div
        className="absolute inset-x-[8%] bottom-[12%] flex h-[12%] min-h-[20px] items-center justify-center rounded-full bg-white/20 font-semibold text-white/80 backdrop-blur-sm"
        style={{ fontSize: '0.65em' }}
      >
        Get Started
      </div>
    </GradientScreen>
  )
}

/* ── One composited frame ───────────────────────────────────────────── */
/**
 * Renders a single SVG vector frame with synthetic screen content.
 * The content div is positioned to cover exactly the `screenArea` (sa) rectangle,
 * then the SVG is layered on top so its opaque bezel covers the edges and its
 * transparent screen hole shows the content.
 */
function SvgPhoneFrame({ frame, widthPx, screenContent }) {
  const { src, cw, ch, sa } = frame
  const heightPx = Math.round(widthPx * ch / cw)
  const r = Math.round(sa.r * (widthPx / cw))

  return (
    <div
      className="relative shrink-0 overflow-visible"
      style={{ width: widthPx, height: heightPx }}
    >
      {/* Screen content — sits behind the SVG bezel */}
      <div
        className="absolute overflow-hidden"
        style={{
          zIndex: 1,
          left: `${(sa.x / cw) * 100}%`,
          top: `${(sa.y / ch) * 100}%`,
          width: `${(sa.w / cw) * 100}%`,
          height: `${(sa.h / ch) * 100}%`,
          borderRadius: r,
        }}
      >
        {screenContent}
      </div>

      {/* SVG frame bezel — transparent over screen, opaque on the bezel edges */}
      <img
        src={src}
        alt=""
        width={cw}
        height={ch}
        decoding="async"
        loading="lazy"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  )
}

/* ── 3-column grid layout (matches reference image) ─────────────────── */
/**
 * Each entry: [ frame key, screen component ]
 * Laid out as 3 columns × N rows; first/last columns clip at the container edge.
 */
const GRID = [
  // Row 0
  [F.pill,      <AppListScreen seed={0} key="a0" />],
  [F.punchhole, <GradientScreen seed={1} key="g1" />],
  [F.notch,     <WelcomeScreen key="w" />],
  // Row 1
  [F.punchhole, <GradientScreen seed={4} key="g4" />],
  [F.pill,      <AppListScreen seed={5} key="a5" />],
  [F.notch,     <SignInScreen key="s" />],
  // Row 2
  [F.borderless, <GradientScreen seed={2} key="g2" />],
  [F.punchhole,  <CalendarScreen key="cal" />],
  [F.pill,       <AppListScreen seed={6} key="a6" />],
]

export function MarketingHeroFrames() {
  const PHONE_W = 146          // px per phone
  const PHONE_H = Math.round(PHONE_W * 800 / 400)  // 292px
  const GAP = 10               // column + row gap
  const COLS = 3

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minHeight: PHONE_H * 3 + GAP * 2 }}
      aria-hidden="true"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 30%, rgba(26,105,255,0.28), transparent 58%),' +
            'radial-gradient(ellipse 55% 45% at 15% 75%, rgba(193,255,77,0.09), transparent 52%)',
          filter: 'blur(36px)',
        }}
      />

      {/* 3-column CSS grid, starting just before the left edge to allow left bleed */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -16,            // first column slightly clipped
          right: -16,           // last column slightly clipped
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: GAP,
        }}
      >
        {GRID.map(([frame, screenNode], idx) => (
          <div
            key={idx}
            style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.7))' }}
          >
            <SvgPhoneFrame
              frame={frame}
              widthPx={PHONE_W}
              screenContent={screenNode}
            />
          </div>
        ))}
      </div>

      {/* Bottom fade into the next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: 80,
          background: 'linear-gradient(to top, #05070A, transparent)',
        }}
      />
    </div>
  )
}
