import { Component, Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import { getInitialAppPage } from './utils/siteLinks'

const initialPage = getInitialAppPage()
// #region agent log
fetch('http://127.0.0.1:7324/ingest/15c1e48c-1b67-4154-9d47-e4314289a078', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8707e8' },
  body: JSON.stringify({
    sessionId: '8707e8',
    location: 'main.jsx:initialPage',
    message: 'boot routing',
    data: {
      initialPage,
      hostname: typeof window !== 'undefined' ? window.location.hostname : null,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      marketingClassPre: typeof document !== 'undefined' ? document.documentElement.classList.contains('marketing-mode') : null,
    },
    timestamp: Date.now(),
    hypothesisId: 'B',
  }),
}).catch(() => {
  try {
    sessionStorage.setItem(
      'debug8707e8-main',
      JSON.stringify({ t: Date.now(), step: 'initialPage', initialPage, hostname: window.location.hostname })
    )
  } catch {}
})
// #endregion
if (initialPage === 'landing' || initialPage === 'blog') {
  document.documentElement.classList.add('marketing-mode')
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // #region agent log
    fetch('http://127.0.0.1:7324/ingest/15c1e48c-1b67-4154-9d47-e4314289a078', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8707e8' },
      body: JSON.stringify({
        sessionId: '8707e8',
        location: 'main.jsx:AppErrorBoundary',
        message: 'react render error',
        data: { err: String(error?.message || error), stack: String(error?.stack || '').slice(0, 500), info: String(info?.componentStack || '').slice(0, 400) },
        timestamp: Date.now(),
        hypothesisId: 'C',
      }),
    }).catch(() => {})
    // #endregion
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            background: '#0c0d10',
            color: '#e4e4e7',
          }}
        >
          <h1 style={{ fontSize: 18, marginBottom: 12 }}>Something went wrong</h1>
          <pre
            style={{
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              color: '#a1a1aa',
              marginBottom: 16,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #3f3f46',
              background: '#18181b',
              color: '#fafafa',
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
// #region agent log
fetch('http://127.0.0.1:7324/ingest/15c1e48c-1b67-4154-9d47-e4314289a078', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8707e8' },
  body: JSON.stringify({
    sessionId: '8707e8',
    location: 'main.jsx:root',
    message: 'dom root',
    data: { hasRoot: Boolean(rootEl), marketingClass: document.documentElement.classList.contains('marketing-mode') },
    timestamp: Date.now(),
    hypothesisId: 'A',
  }),
}).catch(() => {})
// #endregion
if (!rootEl) {
  throw new Error('Missing #root — check index.html')
}

createRoot(rootEl).render(
  <Fragment>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
    <Analytics mode="production" />
  </Fragment>
)
// #region agent log
fetch('http://127.0.0.1:7324/ingest/15c1e48c-1b67-4154-9d47-e4314289a078', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8707e8' },
  body: JSON.stringify({
    sessionId: '8707e8',
    location: 'main.jsx:afterRender',
    message: 'createRoot render invoked',
    data: {},
    timestamp: Date.now(),
    hypothesisId: 'A',
  }),
}).catch(() => {})
// #endregion
