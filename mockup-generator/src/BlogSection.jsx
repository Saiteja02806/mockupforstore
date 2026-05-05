import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import blogManifest from './data/blogManifest.json'
import { getBlogSlugFromLocation } from './utils/siteLinks'

function useBlogSlug() {
  const [, setTick] = useState(0)
  const bump = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    window.addEventListener('hashchange', bump)
    window.addEventListener('popstate', bump)
    return () => {
      window.removeEventListener('hashchange', bump)
      window.removeEventListener('popstate', bump)
    }
  }, [bump])

  return getBlogSlugFromLocation()
}

function BlogList({ posts }) {
  if (!posts.length) {
    return (
      <div className="blog-app-empty">
        <p>No guides loaded yet.</p>
        <p className="blog-app-empty-hint">
          Run <code>npm run sync-blog</code> after adding Markdown under{' '}
          <code>marketing-site/src/content/blog/</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="blog-app-grid">
      {posts.map((post) => (
        <article key={post.slug} className="blog-app-card">
          <p className="blog-app-card-eyebrow">{post.category}</p>
          <h2>
            <a href={`/blog/${encodeURIComponent(post.slug)}/`}>{post.title}</a>
          </h2>
          <p className="blog-app-card-desc">{post.description}</p>
          <div className="blog-app-card-meta">
            {post.readingTime ? <span>{post.readingTime}</span> : null}
            <a href={`/blog/${encodeURIComponent(post.slug)}/`}>Read article</a>
          </div>
        </article>
      ))}
    </div>
  )
}

function BlogPostView({ slug }) {
  const [md, setMd] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr(null)
    const root = import.meta.env.BASE_URL || '/'
    const normalized = root.endsWith('/') ? root : `${root}/`
    fetch(`${normalized}blog-posts/${encodeURIComponent(slug)}.md`)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load article (${r.status})`)
        return r.text()
      })
      .then((text) => {
        if (!cancelled) setMd(text)
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const meta = blogManifest.find((p) => p.slug === slug)

  return (
    <article className="blog-app-article">
      <a href="/blog/" className="blog-app-back">
        ← All articles
      </a>
      {meta ? (
        <>
          <p className="blog-app-card-eyebrow">{meta.category}</p>
          <h1 className="blog-app-article-title">{meta.title}</h1>
          <p className="blog-app-article-lede">{meta.description}</p>
        </>
      ) : (
        <h1 className="blog-app-article-title">{slug}</h1>
      )}

      {loading && <p className="blog-app-muted">Loading…</p>}
      {err && <p className="blog-app-error">{err}</p>}
      {!loading && !err ? (
        <div className="blog-app-prose">
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>
      ) : null}
    </article>
  )
}

export default function BlogSection() {
  const slug = useBlogSlug()
  const posts = Array.isArray(blogManifest) ? blogManifest : []
  const showPost = Boolean(slug)

  return (
    <div className="landing-page blog-app">
      <header className="landing-header blog-app-header">
        <a className="landing-brand blog-app-brand-btn" href="/">
          <img
            src="/frames/circular%20courosel/logo/Screenshot%202026-04-25%20231338-modified.png"
            alt=""
            className="landing-brand-logo"
          />
          <span>Mockup Studio</span>
        </a>
        <nav className="landing-nav" aria-label="Blog">
          <a href="/">Home</a>
          <span className="blog-app-nav-current" aria-current="page">
            Blog
          </span>
        </nav>
      </header>

      <main className="blog-app-main">
        {!showPost ? (
          <>
            <div className="blog-app-hero">
              <h1 className="section-title">Guides &amp; blog</h1>
              <p className="blog-app-intro">
                Practical articles on Play Store and App Store screenshots. This page uses{' '}
                <strong>/blog/</strong> on the same deployment (Vercel serves the app shell; articles load from{' '}
                <code>/blog-posts/</code>).
              </p>
            </div>
            <BlogList posts={posts} />
          </>
        ) : (
          <BlogPostView slug={slug} />
        )}
      </main>
    </div>
  )
}
