import React, { useEffect, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'

// Import toast CSS
import 'react-toastify/dist/ReactToastify.css'

// Store
import { configureStore } from '@reduxjs/toolkit'

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const StudentDashboard = React.lazy(() => import('./pages/student/studentdashboard'))
const TeacherDashboard = React.lazy(() => import('./pages/teacher/teacherDashboard'))

// Basic error fallback
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  }}>
    <div style={{
      maxWidth: '500px',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>
        🚨 Something went wrong
      </h2>
      <p style={{ color: '#666', margin: '1rem 0', lineHeight: '1.5' }}>
        {error.message || 'An unexpected error occurred in NeuroLearn'}
      </p>
      <button 
        onClick={resetErrorBoundary}
        style={{
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}
      >
        🔄 Try again
      </button>
    </div>
  </div>
)

// Enhanced loading component
const LoadingSpinner = ({ text = "Loading NeuroLearn..." }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    color: 'white',
    textAlign: 'center'
  }}>
    <div style={{
      marginBottom: '2rem',
      fontSize: '3rem'
    }}>
      🧠
    </div>
    <h1 style={{ 
      fontSize: '2rem', 
      marginBottom: '1rem',
      fontWeight: '700'
    }}>
      NeuroLearn
    </h1>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderTop: '3px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }}></div>
    <p style={{ 
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '1.1rem'
    }}>
      {text}
    </p>
    <p style={{ 
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.9rem',
      marginTop: '0.5rem'
    }}>
      Chennai's Intelligent Assessment Platform
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

// Simple Redux store
const store = configureStore({
  reducer: {
    app: (state = { 
      initialized: true,
      user: null,
      theme: 'light'
    }, action) => {
      switch (action.type) {
        case 'SET_USER':
          return { ...state, user: action.payload }
        case 'SET_THEME':
          return { ...state, theme: action.payload }
        default:
          return state
      }
    }
  }
})

// React Query Client with Chennai-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

// Router Component
const AppRouter = () => (
  <Routes>
    {/* Home Route */}
    <Route 
      path="/" 
      element={
        <Suspense fallback={<LoadingSpinner text="Loading Home..." />}>
          <Home />
        </Suspense>
      } 
    />
    
    {/* Authentication Routes */}
    <Route 
      path="/auth/login" 
      element={
        <Suspense fallback={<LoadingSpinner text="Loading Login..." />}>
          <Login />
        </Suspense>
      } 
    />
    
    <Route 
      path="/auth/register" 
      element={
        <Suspense fallback={<LoadingSpinner text="Loading Register..." />}>
          <Register />
        </Suspense>
      } 
    />
    
    {/* Dashboard Routes */}
    <Route 
      path="/pages/student/studentdashboard" 
      element={
        <Suspense fallback={<LoadingSpinner text="Loading Student Dashboard..." />}>
          <StudentDashboard />
        </Suspense>
      } 
    />
    
    <Route 
      path="/pages/teacher/teacherDashboard" 
      element={
        <Suspense fallback={<LoadingSpinner text="Loading Teacher Dashboard..." />}>
          <TeacherDashboard />
        </Suspense>
      } 
    />
    
    {/* Redirect any unknown routes to home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

// Main App Component
const App = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎓 NeuroLearn - Chennai Educational Platform')
      console.log('📍 Location: Chennai, Tamil Nadu, India')
      console.log('🚀 Environment:', import.meta.env.MODE)
      console.log('✅ App successfully initialized!')
    }

    const savedTheme = localStorage.getItem('neurolearn-theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    
    document.documentElement.setAttribute('data-theme', initialTheme)
    store.dispatch({ type: 'SET_THEME', payload: initialTheme })
  }, [])

  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global error in NeuroLearn:', event.error)
      
      if (event.error?.message?.includes('fetch') || event.error?.message?.includes('network')) {
        console.log('Network error detected - optimizing for Chennai connectivity')
      }
    }

    window.addEventListener('error', handleGlobalError)
    return () => window.removeEventListener('error', handleGlobalError)
  }, [])

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('NeuroLearn Error Boundary:', error, errorInfo)
      }}
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <BrowserRouter>
              <div className="app" style={{ minHeight: '100vh' }}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AppRouter />
                </Suspense>
                
                <ToastContainer
                  position="top-right"
                  autoClose={4000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                  toastClassName="neurolearn-toast"
                  style={{
                    fontSize: '14px'
                  }}
                />
              </div>
            </BrowserRouter>
          </Provider>
          
          {import.meta.env.DEV && (
            <ReactQueryDevtools 
              initialIsOpen={false}
              position="bottom-right"
            />
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
