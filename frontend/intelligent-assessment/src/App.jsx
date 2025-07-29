import React, { useEffect, Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'

// Store and Context Providers
import { store } from '@store/store'
import { AuthProvider } from '@context/AuthContext'
import { ThemeProvider } from '@context/ThemeContext'
import { AppProvider } from '@context/AppContext'

// Router
import AppRouter from '@router/AppRouter'

// Components
import LoadingSpinner from '@components/common/LoadingSpinner'
import ErrorFallback from '@components/common/ErrorFallback'
import PWAInstallPrompt from '@components/common/PWAInstallPrompt'
import NetworkStatus from '@components/common/NetworkStatus'

// Styles
import '@styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

// Utils
import { validateEnvVars } from '@utils/helpers'
import { FEATURE_FLAGS } from '@utils/constants'

// Service Worker Registration
import { registerSW } from 'virtual:pwa-register'

// React Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error)
      },
    },
  },
})

// Service Worker Update Handler
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available, reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  },
})

// Environment Variables Validation
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_APP_NAME',
  'VITE_APP_VERSION',
]

// Global Error Handler
const handleGlobalError = (error, errorInfo) => {
  console.error('Global error caught:', error, errorInfo)
  
  // Send to error reporting service in production
  if (import.meta.env.PROD) {
    // analytics.track('error', {
    //   error: error.message,
    //   stack: error.stack,
    //   errorInfo,
    //   url: window.location.href,
    //   userAgent: navigator.userAgent,
    //   timestamp: new Date().toISOString(),
    // })
  }
}

// Keyboard Shortcuts Handler
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Global keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            // Open search (Ctrl/Cmd + K)
            event.preventDefault()
            // Dispatch search modal open event
            window.dispatchEvent(new CustomEvent('openSearch'))
            break
          case '/':
            // Open help (Ctrl/Cmd + /)
            event.preventDefault()
            window.dispatchEvent(new CustomEvent('openHelp'))
            break
          case '.':
            // Open settings (Ctrl/Cmd + .)
            event.preventDefault()
            window.dispatchEvent(new CustomEvent('openSettings'))
            break
        }
      }

      // Escape key to close modals
      if (event.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('closeModal'))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

// Performance Monitoring
const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value)
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (e) {
      // Browser doesn't support these metrics
    }

    return () => observer.disconnect()
  }, [])
}

// Network Status Monitoring
const useNetworkMonitoring = () => {
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online')
      // Retry failed requests
      queryClient.getQueryCache().getAll().forEach(query => {
        if (query.state.status === 'error') {
          query.fetch()
        }
      })
    }

    const handleOffline = () => {
      console.log('App is offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
}

// Main App Component
const App = () => {
  // Custom hooks
  useKeyboardShortcuts()
  usePerformanceMonitoring()
  useNetworkMonitoring()

  // Validate environment variables on app start
  useEffect(() => {
    try {
      validateEnvVars(requiredEnvVars)
    } catch (error) {
      console.error('Environment validation failed:', error)
    }
  }, [])

  // Initialize analytics
  useEffect(() => {
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }, [])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleGlobalError}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <BrowserRouter>
              <ThemeProvider>
                <AppProvider>
                  <AuthProvider>
                    <div className="app" id="app-root">
                      {/* Network Status Indicator */}
                      <NetworkStatus />
                      
                      {/* PWA Install Prompt */}
                      <PWAInstallPrompt />
                      
                      {/* Main App Router */}
                      <Suspense fallback={<LoadingSpinner text="Loading application..." overlay />}>
                        <AppRouter />
                      </Suspense>
                      
                      {/* Toast Notifications */}
                      <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                        toastClassName="custom-toast"
                        bodyClassName="custom-toast-body"
                        progressClassName="custom-toast-progress"
                      />
                    </div>
                  </AuthProvider>
                </AppProvider>
              </ThemeProvider>
            </BrowserRouter>
          </Provider>
          
          {/* React Query DevTools - Only in development */}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
