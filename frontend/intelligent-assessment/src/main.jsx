import { StrictMode } from 'react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Performance monitoring for development
if (import.meta.env.DEV) {
  // Enable React DevTools
  if (typeof window !== 'undefined') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {}
  }
}

// Error boundary for critical errors during rendering
const CriticalErrorBoundary = ({ children }) => {
  try {
    return children
  } catch (error) {
    console.error('Critical rendering error:', error)
    
    // Fallback UI for critical errors
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ 
            color: '#d32f2f', 
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Something went wrong
          </h1>
          <p style={{ 
            color: '#666', 
            marginBottom: '1.5rem',
            lineHeight: '1.5'
          }}>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#f5f5f5', 
                padding: '1rem', 
                borderRadius: '4px',
                overflow: 'auto',
                marginTop: '0.5rem'
              }}>
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}

// Initialize the app
const initializeApp = async () => {
  try {
    // Check for browser compatibility
    if (!window.fetch || !window.Promise || !window.localStorage) {
      throw new Error('Browser not supported')
    }
    // Check if service workers are supported
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      console.log('Service Worker supported')
    }

    // Get the root element
    const rootElement = document.getElementById('root')
    
    if (!rootElement) {
      throw new Error('Root element not found')
    }

    // Create React root
    const root = ReactDOM.createRoot(rootElement)

    // Render the app
    root.render(
      <React.StrictMode>
        <CriticalErrorBoundary>
          <App />
        </CriticalErrorBoundary>
      </React.StrictMode>
    )

    // Log app initialization in development
    if (import.meta.env.DEV) {
      console.log(`
        🚀 IntelliAssess initialized successfully!
        
        📊 Environment: ${import.meta.env.MODE}
        🔗 API Base URL: ${import.meta.env.VITE_API_BASE_URL}
        📱 Version: ${import.meta.env.VITE_APP_VERSION}
        🎯 Build Time: ${new Date().toLocaleString()}
        
        Happy coding! 🎉
      `)
      
      // Performance mark for development
      performance.mark('app-initialized')
    }

  } catch (error) {
    console.error('Failed to initialize app:', error)
    
    // Fallback for initialization errors
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          background-color: #f5f5f5;
          font-family: Inter, system-ui, sans-serif;
        ">
          <div style="
            max-width: 500px;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          ">
            <h1 style="color: #d32f2f; margin-bottom: 1rem;">
              Failed to Load Application
            </h1>
            <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.5;">
              There was a problem loading IntelliAssess. This might be due to:
            </p>
            <ul style="color: #666; text-align: left; margin-bottom: 1.5rem;">
              <li>Browser compatibility issues</li>
              <li>Network connectivity problems</li>
              <li>Outdated browser cache</li>
            </ul>
            <p style="color: #666; margin-bottom: 1.5rem;">
              Please try refreshing the page or updating your browser.
            </p>
            <button 
              onclick="location.reload()" 
              style="
                background-color: #1976d2;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                margin-right: 0.5rem;
              "
            >
              Refresh Page
            </button>
            <button 
              onclick="localStorage.clear(); sessionStorage.clear(); location.reload()" 
              style="
                background-color: #666;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
              "
            >
              Clear Cache & Refresh
            </button>
          </div>
        </div>
      `
    }
  }
}

// Initialize the application
initializeApp()

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept()
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  
  // Send to error reporting service in production
  if (import.meta.env.PROD) {
    // analytics.track('javascript_error', {
    //   message: event.message,
    //   filename: event.filename,
    //   lineno: event.lineno,
    //   colno: event.colno,
    //   stack: event.error?.stack,
    //   url: window.location.href,
    //   userAgent: navigator.userAgent,
    //   timestamp: new Date().toISOString(),
    // })
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  // Send to error reporting service in production
  if (import.meta.env.PROD) {
    // analytics.track('promise_rejection', {
    //   reason: event.reason?.toString(),
    //   stack: event.reason?.stack,
    //   url: window.location.href,
    //   userAgent: navigator.userAgent,
    //   timestamp: new Date().toISOString(),
    // })
  }
})

// Performance monitoring
if (import.meta.env.PROD) {
  // Monitor Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Log or send to analytics
      console.log(entry.name, entry.value)
    }
  })

  try {
    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
  } catch (e) {
    // Browser doesn't support these metrics
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  // Cleanup any ongoing operations
  // Cancel network requests, save data, etc.
})
