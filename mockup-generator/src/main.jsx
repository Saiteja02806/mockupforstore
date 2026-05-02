import { Component, Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import { getInitialAppPage } from './utils/siteLinks'

const initialPage = getInitialAppPage()
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
