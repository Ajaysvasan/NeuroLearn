import React, { createContext, useContext, useState, useEffect, useReducer } from 'react'
import { useLocation } from 'react-router-dom'
import { STORAGE_KEYS, FEATURE_FLAGS, REGIONAL_CONFIG } from '@utils/constants'
import { storage, isOnline } from '@utils/helpers'
import { toast } from 'react-toastify'

// Create App Context
const AppContext = createContext({
  // App State
  loading: false,
  online: true,
  sidebarOpen: false,
  notifications: [],
  settings: {},
  
  // Actions
  setLoading: () => {},
  setSidebarOpen: () => {},
  addNotification: () => {},
  removeNotification: () => {},
  updateSettings: () => {},
  toggleFeature: () => {},
  
  // Utilities
  isFeatureEnabled: () => false,
  getLocalizedText: () => '',
  formatCurrency: () => '',
  formatDate: () => '',
})

// Initial state
const initialState = {
  loading: false,
  online: navigator.onLine,
  sidebarOpen: false,
  notifications: [],
  settings: {
    language: REGIONAL_CONFIG.LANGUAGES.ENGLISH,
    theme: 'light',
    notifications: true,
    autoSave: true,
    soundEffects: true,
    animationsEnabled: true,
    offlineMode: false,
    dataUsageOptimization: false,
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
    },
    privacy: {
      analytics: true,
      cookies: true,
      dataCollection: true,
      locationServices: false,
    },
    regional: {
      state: REGIONAL_CONFIG.STATE,
      city: REGIONAL_CONFIG.CITY,
      board: REGIONAL_CONFIG.BOARD_TYPES.STATE_BOARD,
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      numberSystem: 'indian',
    },
  },
  featureFlags: {
    [FEATURE_FLAGS.AI_GENERATION]: true,
    [FEATURE_FLAGS.DARK_MODE]: true,
    [FEATURE_FLAGS.OFFLINE_MODE]: true,
    [FEATURE_FLAGS.ANALYTICS]: true,
    [FEATURE_FLAGS.NOTIFICATIONS]: true,
    [FEATURE_FLAGS.SOCIAL_LOGIN]: true,
    [FEATURE_FLAGS.GAMIFICATION]: true,
    [FEATURE_FLAGS.MULTILINGUAL]: false,
  },
  breadcrumbs: [],
  recentActivity: [],
  shortcuts: [],
}

// Reducer for complex state management
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ONLINE':
      return { ...state, online: action.payload }
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }
    
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload }
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50) // Keep only latest 50
      }
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    
    case 'UPDATE_NESTED_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.category]: {
            ...state.settings[action.category],
            ...action.payload
          }
        }
      }
    
    case 'TOGGLE_FEATURE':
      return {
        ...state,
        featureFlags: {
          ...state.featureFlags,
          [action.payload]: !state.featureFlags[action.payload]
        }
      }
    
    case 'UPDATE_BREADCRUMBS':
      return { ...state, breadcrumbs: action.payload }
    
    case 'ADD_RECENT_ACTIVITY':
      return {
        ...state,
        recentActivity: [action.payload, ...state.recentActivity].slice(0, 20)
      }
    
    case 'RESET_STATE':
      return { ...initialState, ...action.payload }
    
    default:
      return state
  }
}

// App Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const location = useLocation()

  // Initialize app state from storage
  useEffect(() => {
    const initializeApp = () => {
      try {
        // Load settings from storage
        const savedSettings = storage.get(STORAGE_KEYS.SETTINGS)
        if (savedSettings) {
          dispatch({ type: 'UPDATE_SETTINGS', payload: savedSettings })
        }

        // Load feature flags from storage or environment
        const savedFeatures = storage.get('feature_flags')
        if (savedFeatures) {
          dispatch({ type: 'RESET_STATE', payload: { featureFlags: savedFeatures } })
        }

        // Set initial online status
        dispatch({ type: 'SET_ONLINE', payload: isOnline() })

      } catch (error) {
        console.error('Failed to initialize app state:', error)
      }
    }

    initializeApp()
  }, [])

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', payload: true })
      toast.success('🌐 Back online!')
    }

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE', payload: false })
      toast.warning('📡 You are now offline. Some features may be limited.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update breadcrumbs based on location
  useEffect(() => {
    const updateBreadcrumbs = () => {
      const pathSegments = location.pathname.split('/').filter(Boolean)
      const breadcrumbs = pathSegments.map((segment, index) => ({
        id: index,
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: '/' + pathSegments.slice(0, index + 1).join('/'),
        isLast: index === pathSegments.length - 1
      }))

      dispatch({ type: 'UPDATE_BREADCRUMBS', payload: breadcrumbs })
    }

    updateBreadcrumbs()
  }, [location])

  // Save settings to storage when they change
  useEffect(() => {
    storage.set(STORAGE_KEYS.SETTINGS, state.settings)
  }, [state.settings])

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setSidebarOpen = (open) => {
    dispatch({ type: 'SET_SIDEBAR', payload: open })
  }

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

    // Auto-remove after specified time
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }

    return id
  }

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }

  const updateSettings = (newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings })
  }

  const updateNestedSetting = (category, settings) => {
    dispatch({ 
      type: 'UPDATE_NESTED_SETTING', 
      category, 
      payload: settings 
    })
  }

  const toggleFeature = (feature) => {
    dispatch({ type: 'TOGGLE_FEATURE', payload: feature })
  }

  const isFeatureEnabled = (feature) => {
    return state.featureFlags[feature] === true
  }

  const addRecentActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity
    }
    dispatch({ type: 'ADD_RECENT_ACTIVITY', payload: newActivity })
  }

  // Localization helpers
  const getLocalizedText = (key, defaultText = '') => {
    // This would integrate with a localization library
    // For now, return default text
    return defaultText || key
  }

  const formatCurrency = (amount) => {
    const { currency, numberSystem } = state.settings.regional
    
    if (currency === 'INR') {
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
      return formatter.format(amount)
    }
    
    return `₹${amount}`
  }

  const formatDate = (date, format = null) => {
    const { dateFormat, timezone } = state.settings.regional
    const dateObj = new Date(date)
    
    const options = {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    
    return dateObj.toLocaleDateString('en-IN', options)
  }

  const formatNumber = (number) => {
    const { numberSystem } = state.settings.regional
    
    if (numberSystem === 'indian') {
      return new Intl.NumberFormat('en-IN').format(number)
    }
    
    return number.toLocaleString()
  }

  // Performance monitoring
  const measurePerformance = (name, fn) => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    if (isFeatureEnabled(FEATURE_FLAGS.ANALYTICS)) {
      console.log(`Performance: ${name} took ${end - start} milliseconds`)
    }
    
    return result
  }

  // Error boundary helper
  const reportError = (error, errorInfo = {}) => {
    console.error('App Error:', error, errorInfo)
    
    if (isFeatureEnabled(FEATURE_FLAGS.ANALYTICS)) {
      // Send to analytics service
      // analytics.track('error', { error: error.message, ...errorInfo })
    }
    
    addNotification({
      type: 'error',
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try refreshing the page.',
      autoRemove: false,
    })
  }

  // Accessibility helpers
  const announceToScreenReader = (message) => {
    if (state.settings.accessibility.screenReader) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message
      
      document.body.appendChild(announcement)
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }

  // Keyboard shortcuts
  const registerShortcut = (key, callback, description) => {
    const shortcut = { key, callback, description }
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { 
        shortcuts: [...state.shortcuts, shortcut] 
      } 
    })
    
    return () => {
      dispatch({ 
        type: 'UPDATE_SETTINGS', 
        payload: { 
          shortcuts: state.shortcuts.filter(s => s.key !== key) 
        } 
      })
    }
  }

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setSidebarOpen,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    updateSettings,
    updateNestedSetting,
    toggleFeature,
    addRecentActivity,
    
    // Utilities
    isFeatureEnabled,
    getLocalizedText,
    formatCurrency,
    formatDate,
    formatNumber,
    measurePerformance,
    reportError,
    announceToScreenReader,
    registerShortcut,
    
    // Regional helpers
    isChennaiUser: () => state.settings.regional.city === 'Chennai',
    isTamilNaduUser: () => state.settings.regional.state === 'Tamil Nadu',
    getBoard: () => state.settings.regional.board,
    getTimezone: () => state.settings.regional.timezone,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext)
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  
  return context
}

// HOC for app-aware components
export const withApp = (WrappedComponent) => {
  return function AppAwareComponent(props) {
    const appContext = useApp()
    
    return <WrappedComponent {...props} app={appContext} />
  }
}

// Custom hooks for specific app functionality
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useApp()
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length,
  }
}

export const useSettings = () => {
  const { settings, updateSettings, updateNestedSetting } = useApp()
  
  return {
    settings,
    updateSettings,
    updateNestedSetting,
    isDarkMode: settings.theme === 'dark',
    isOfflineMode: settings.offlineMode,
    language: settings.language,
    regional: settings.regional,
  }
}

export const useFeatureFlags = () => {
  const { featureFlags, toggleFeature, isFeatureEnabled } = useApp()
  
  return {
    featureFlags,
    toggleFeature,
    isFeatureEnabled,
  }
}

export const useBreadcrumbs = () => {
  const { breadcrumbs } = useApp()
  
  return breadcrumbs
}

export const useConnectivity = () => {
  const { online } = useApp()
  
  return {
    online,
    offline: !online,
  }
}

export default AppContext
