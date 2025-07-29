import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Critical error boundary for initialization failures
const CriticalErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Critical error:', error)
      setHasError(true)
      setError(error)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', (event) => {
      handleError(event.reason)
    })

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  if (hasError) {
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
            NeuroLearn Failed to Load
          </h1>
          <p style={{ 
            color: '#666', 
            marginBottom: '1.5rem',
            lineHeight: '1.5'
          }}>
            We're sorry, but the application failed to initialize properly. 
            This might be due to a configuration issue or missing dependencies.
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
              marginRight: '0.5rem'
            }}
          >
            Reload Application
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.reload()
            }}
            style={{
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Clear Data & Reload
          </button>
          {import.meta.env.DEV && error && (
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

  return children
}

// Initialize the application
const initializeApp = async () => {
  try {
    // Check browser compatibility
    if (!window.fetch || !window.Promise || !window.localStorage) {
      throw new Error('Browser not supported. Please update your browser.')
    }

    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Root element not found')
    }

    const root = ReactDOM.createRoot(rootElement)

    root.render(
      <React.StrictMode>
        <CriticalErrorBoundary>
          <App />
        </CriticalErrorBoundary>
      </React.StrictMode>
    )

    // Development logging
    if (import.meta.env.DEV) {
      console.log('🚀 NeuroLearn initialized successfully!')
      console.log('📍 Location: Chennai, Tamil Nadu, India')
      console.log('🎓 Educational Assessment Platform Ready')
    }

  } catch (error) {
    console.error('Failed to initialize NeuroLearn:', error)
    
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; text-align: center; background-color: #f5f5f5; font-family: Inter, system-ui, sans-serif;">
          <div style="max-width: 500px; padding: 2rem; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #d32f2f; margin-bottom: 1rem;">Initialization Failed</h1>
            <p style="color: #666; margin-bottom: 1.5rem;">NeuroLearn could not start. Please check your internet connection and try again.</p>
            <button onclick="location.reload()" style="background-color: #1976d2; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
              Try Again
            </button>
          </div>
        </div>
      `
    }
  }
}

// Start the application
initializeApp()

// Hot Module Replacement for development
if (import.meta.hot) {
  import.meta.hot.accept()
}
