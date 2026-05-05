import { useEffect, useState, useCallback } from 'react'

/* ─── Rolling phones (hidden, kept for future use) ─────────────────── */
const firstPhoneImage = '/framesforphone/apple-iphone-15-photo-removebg-preview.png'
const secondPhoneImage = '/framesforphone/franespart1/borderless-phone-clean__2_-removebg-preview.png'
const thirdPhoneImage = '/framesforphone/franespart1/framespart2/google-pixel-5-photo-removebg-preview.png'
const fourthPhoneImage = '/framesforphone/apple-iphone-11-photo-removebg-preview.png'
const fifthPhoneImage = '/framesforphone/franespart1/borderless-phone-silver__1_-removebg-preview.png'
const sixthPhoneImage = '/framesforphone/franespart1/samsung-galaxy-s21-ultra-photo__2_-removebg-preview.png'
const seventhPhoneImage = '/framesforphone/franespart1/google-pixel-5-photo__1_-removebg-preview.png'
const eighthPhoneImage = '/framesforphone/franespart1/borderless-phone-clean__1_-removebg-preview.png'

const COL_1 = [
  { src: fifthPhoneImage,  alt: 'Silver borderless phone frame' },
  { src: firstPhoneImage,  alt: 'iPhone 15 app mockup' },
  { src: secondPhoneImage, alt: 'Borderless phone app mockup' },
]
const COL_2 = [
  { src: seventhPhoneImage, alt: 'Google Pixel phone mockup', pixel: true },
  { src: fourthPhoneImage,  alt: 'iPhone 11 app mockup' },
]
const COL_3 = [
  { src: sixthPhoneImage,  alt: 'Samsung Galaxy S21 Ultra mockup' },
  { src: thirdPhoneImage,  alt: 'Google Pixel 5 app mockup', pixel: true },
  { src: eighthPhoneImage, alt: 'Borderless phone app mockup' },
]

/* Hidden — keep the code, just not rendered */
function DeviceShowcase() {
  return (
    <div id="frames" className="landing-device-showcase" aria-label="Device mockup showcase">
      {[COL_1, COL_2, COL_3].map((phones, ci) => (
        <div key={ci} className={`dev-col dev-col--${ci + 1}`}>
          <div className="dev-strip">
            {[...phones, ...phones].map((ph, i) => (
              <div
                key={i}
                className={`dev-phone${ph.pixel ? ' dev-phone--pixel' : ''}`}
                aria-hidden={i >= phones.length ? 'true' : undefined}
              >
                <img
                  src={ph.src}
                  alt={i >= phones.length ? '' : ph.alt}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Hero Carousel (click-driven) ────────────────────────────────── */
const BASE = '/frames/circular%20courosel/'
const CAROUSEL_IMAGES = [
  /* Default hero order: user-specified first, then second, then remaining shots */
  BASE + 'WhatsApp%20Image%202026-04-14%20at%209.17.37%20AM_store_1080x1920%20%282%29.png',
  BASE + 'WhatsApp%20Image%202026-04-14%20at%209.16.04%20AM_store_1080x1920%20%281%29.png',
  BASE + 'WhatsApp%20Image%202026-04-14%20at%209.16.03%20AM%20%281%29_store_1080x1920.png',
  BASE + 'WhatsApp%20Image%202026-04-14%20at%209.16.03%20AM_store_1080x1920%20%286%29.png',
  BASE + 'WhatsApp%20Image%202026-04-14%20at%209.16.04%20AM%20%281%29_store_1080x1920%20%283%29.png',
  BASE + 'WhatsApp%20Image%202026-04-14%20at%209.16.04%20AM_store_1080x1920.png',
  BASE + 'WhatsApp%20Image%202026-04-14%20at%209.17.37%20AM_store_1080x1920.png',
  BASE + 'WhatsApp%20Image%202026-04-25%20at%2010.24.03%20PM_store_1080x1920.png',
]
const NUM_SLIDES = CAROUSEL_IMAGES.length

function carouselWebpUrl(pngSrc) {
  return pngSrc.replace(/\.png$/i, '.webp')
}

function ChevLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeroCarousel() {
  const [idx, setIdx] = useState(0)

  const prev = useCallback(() => setIdx(i => (i - 1 + NUM_SLIDES) % NUM_SLIDES), [])
  const next = useCallback(() => setIdx(i => (i + 1) % NUM_SLIDES), [])

  /* normalised offset: how far card i is from the current centre */
  const getOffset = (i) => {
    let off = ((i - idx) % NUM_SLIDES + NUM_SLIDES) % NUM_SLIDES
    if (off > NUM_SLIDES / 2) off -= NUM_SLIDES   // range: [-(N/2), N/2]
    return off
  }

  const cardClass = (off) => {
    if (off === 0)            return 'hc-card hc-card--center'
    if (Math.abs(off) === 1)  return 'hc-card hc-card--side'
    return 'hc-card hc-card--hidden'
  }

  return (
    <div className="hero-carousel" aria-label="App Store mockup screenshots">
      {/* Stage — all cards overlap here */}
      <div className="hc-stage">
        {CAROUSEL_IMAGES.map((src, i) => {
          const off = getOffset(i)
          return (
            <div
              key={i}
              className={cardClass(off)}
              style={{ '--off': off }}
              onClick={off === -1 ? prev : off === 1 ? next : undefined}
              aria-hidden={Math.abs(off) > 1}
            >
              <picture>
                <source type="image/webp" srcSet={carouselWebpUrl(src)} />
                <img
                  src={src}
                  alt={off === 0 ? `App Store mockup screenshot ${i + 1}` : ''}
                  loading={Math.abs(off) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  fetchPriority={off === 0 ? 'high' : undefined}
                />
              </picture>
            </div>
          )
        })}
      </div>

      {/* Controls: ‹ arrow · dots · › arrow */}
      <div className="hc-controls">
        <button className="hc-nav" onClick={prev} aria-label="Previous screenshot">
          <ChevLeft />
        </button>

        <div className="hc-dots" role="tablist" aria-label="Slide indicators">
          {CAROUSEL_IMAGES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Screenshot ${i + 1}`}
              className={`hc-dot${i === idx ? ' hc-dot--on' : ''}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>

        <button className="hc-nav" onClick={next} aria-label="Next screenshot">
          <ChevRight />
        </button>
      </div>
    </div>
  )
}

/* ─── Icon helpers ─────────────────────────────────────────────────── */
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FeatureIcon({ type }) {
  if (type === 'batch') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 5h3a2 2 0 0 1 2 2v3M10 19H7a2 2 0 0 1-2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'seo') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 9h6M7 12h4M15 15l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Main component ───────────────────────────────────────────────── */
export default function MarketingHome({ onEnterStudio }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [])

  const enter = (event) => {
    event.preventDefault()
    onEnterStudio()
  }

  return (
    <div className="landing-page">

      {/* ── NAVBAR ── */}
      <header className="landing-header">
        <a className="landing-brand" href="#top" aria-label="Mockup Studio home">
          <img
            src="/frames/circular%20courosel/logo/Screenshot%202026-04-25%20231338-modified.png"
            alt="Mockup Studio logo"
            className="landing-brand-logo"
          />
          <span>Mockup Studio</span>
        </a>

        <nav className="landing-nav" aria-label="Primary">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="/blog/">Blog</a>
          <a href="#comparison">Compare</a>
        </nav>

        <div className="landing-header-actions">
          <button type="button" className="landing-signup" onClick={enter}>Start Creating</button>
        </div>

        <button className="landing-menu" type="button" aria-label="Open menu">
          <MenuIcon />
        </button>
      </header>

      <main id="top">

        {/* ── HERO ── */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <h1 className="landing-hero-h1">
              Ship Store-Ready App<br />
              Mockups in Minutes —<br />
              <span className="landing-hero-h1-accent">Not Hours in Photoshop.</span>
            </h1>

            <p className="landing-subtitle">
              Built by an indie dev who wasted entire Saturdays making screenshots.
              Now it takes under 5 minutes.
            </p>

            <p className="landing-trust-line">
              <span>✦ No Photoshop</span>
              <span>✦ No Design Skills</span>
              <span>✦ No Wasted Afternoons</span>
            </p>

            <div className="landing-actions">
              <button type="button" className="landing-primary" onClick={enter}>
                Create mockups for store
              </button>
            </div>
          </div>

          {/* Hero carousel — replaces the rolling phones */}
          <HeroCarousel />

          {/* Rolling phones — hidden, preserved for later use */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <DeviceShowcase />
          </div>
        </section>

        {/* ── PAIN SECTION ── */}
        <section className="landing-pain" aria-labelledby="pain-heading">
          <div className="landing-section-inner">
            <h2 id="pain-heading" className="landing-section-h2">Sound Familiar?</h2>
            <p className="landing-section-sub">Every indie developer goes through this nightmare.</p>

            <div className="pain-cards">
              {[
                {
                  emoji: '😤',
                  title: 'The Setup Hell',
                  body: 'You just finished building your app after months of hard work. Now you need 8 screenshots for the Play Store submission. You open Photoshop… and the real work begins.',
                },
                {
                  emoji: '⏰',
                  title: 'The Time Sink',
                  body: '2 hours later: You\'ve downloaded device frame PNGs, aligned them manually, adjusted resolution, exported, realized the resolution was wrong, started over. It\'s midnight. You just wanted to ship.',
                },
                {
                  emoji: '🔁',
                  title: 'The Redo Problem',
                  body: 'You change one screenshot in your app. Now you have to redo ALL 8 mockups from scratch. Every. Single. Time.',
                },
              ].map(({ emoji, title, body }) => (
                <article key={title} className="pain-card">
                  <div className="pain-card-emoji">{emoji}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>

            <p className="pain-closing">
              "We've been there. That's exactly why we built Mockup Studio."
            </p>
          </div>
        </section>

        {/* ── SOLUTION SECTION ── */}
        <section id="how-it-works" className="landing-solution" aria-labelledby="solution-heading">
          <div className="landing-section-inner">
            <h2 id="solution-heading" className="landing-section-h2">There's a Better Way.</h2>
            <p className="landing-section-sub">
              From raw screenshot to store-ready mockup in under 5 minutes.
            </p>

            <div className="solution-steps">
              {[
                { num: '1', label: 'UPLOAD',       desc: 'Drop your raw app screenshot' },
                { num: '2', label: 'CHOOSE FRAME', desc: 'Pick from 200+ real device frames & backgrounds' },
                { num: '3', label: 'EXPORT',       desc: 'Download your store-ready mockup instantly' },
              ].map(({ num, label, desc }, i, arr) => (
                <div key={label} className="solution-step-wrap">
                  <div className="solution-step">
                    <div className="solution-step-num">{num}</div>
                    <div className="solution-step-label">{label}</div>
                    <p className="solution-step-desc">{desc}</p>
                  </div>
                  {i < arr.length - 1 && <div className="solution-arrow" aria-hidden="true">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF / STATS ── */}
        <section className="landing-stats" aria-label="Social proof statistics">
          <div className="landing-section-inner">
            <div className="stats-row">
              {[
                { number: '14,000+', label: 'Store-ready mockups generated' },
                { number: '3,800+',  label: 'Developers trust Mockup Studio' },
                { number: '40+',     label: 'Real device frames included' },
                { number: '5 mins',  label: 'Average mockup creation time' },
              ].map(({ number, label }) => (
                <div key={label} className="stat-item">
                  <div className="stat-number">{number}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES (existing — kept) ── */}
        <section id="features" className="landing-features" aria-labelledby="features-heading">
          <h2 id="features-heading">Why it wins</h2>
          <div className="landing-feature-grid">
            {[
              {
                type: 'frames',
                title: 'Real Device Frames',
                copy: 'Choose from hundreds of authentic phone and tablet frames, including latest models.',
              },
              {
                type: 'batch',
                title: 'Batch Editing',
                copy: 'Update eight screenshots simultaneously. Real-time preview of all changes.',
              },
              {
                type: 'seo',
                title: 'SEO-Optimized Export',
                copy: 'Generate search-friendly assets for better app store ranking.',
              },
            ].map((feature) => (
              <article key={feature.title} className={`landing-feature-card landing-feature-card--${feature.type}`}>
                <div className="landing-feature-icon">
                  <FeatureIcon type={feature.type} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── COMPARISON TABLE (existing — kept) ── */}
        <section id="comparison" className="landing-comparison" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading">The Old Way vs Mockup Studio</h2>
          <div className="landing-table" role="table" aria-label="Feature comparison">
            <div className="landing-table-row landing-table-head" role="row">
              <div role="columnheader"></div>
              <div role="columnheader">The Old Way</div>
              <div role="columnheader">Mockup Studio</div>
            </div>
            {[
              ['Cost',               '$60 / month',    'Free.'],
              ['Time for 8 mockups', '3–4 hours',      'Under 5 minutes'],
              ['Design skill',       'Intermediate+',  'Zero. None. Zip.'],
              ['Device frames',      'Manual setup',   '40+ built-in'],
              ['Batch editing',      'One by one',     'Edit all 8 at once'],
            ].map(([label, oldVal, goodVal]) => (
              <div key={label} className="landing-table-row" role="row">
                <div role="cell">{label}</div>
                <div className="landing-old" role="cell">{oldVal}</div>
                <div className="landing-good" role="cell">{goodVal}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER (existing — kept) ── */}
      <footer id="footer" className="landing-footer">
        {[
          ['Product', 'Product', 'App Store', 'Mockup Studio', 'Play Store', 'Ultr Shots'],
          ['Resources', 'About', 'Blog', 'Careers', 'Responsibility', 'Resources', 'Privacy Policy'],
          ['Company', 'Company', 'Terms of Use', 'Contact Us', 'Blog'],
        ].map(([title, ...links]) => (
          <div key={title} className="landing-footer-col">
            <h3>{title}</h3>
            {links.map((link, i) => (
              <a key={`${title}-${i}-${link}`} href={link === 'Blog' ? '/blog/' : '#top'}>
                {link}
              </a>
            ))}
          </div>
        ))}
        <p className="landing-credit">Prototyped by Mockup Studio</p>
      </footer>
    </div>
  )
}
