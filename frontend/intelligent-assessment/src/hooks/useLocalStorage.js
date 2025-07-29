import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @param {Object} options - Options object
 * @returns {Array} - [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = (error) => console.error('useLocalStorage error:', error),
    syncAcrossTabs = false
  } = options

  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      
      // Parse stored json or if none return initialValue
      if (item === null) {
        return initialValue
      }
      
      return deserialize(item)
    } catch (error) {
      onError(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, serialize(valueToStore))
      }
    } catch (error) {
      onError(error)
    }
  }, [key, serialize, storedValue, onError])

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      onError(error)
    }
  }, [key, initialValue, onError])

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    if (!syncAcrossTabs) return

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== serialize(storedValue)) {
        try {
          setStoredValue(e.newValue ? deserialize(e.newValue) : initialValue)
        } catch (error) {
          onError(error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, storedValue, initialValue, serialize, deserialize, onError, syncAcrossTabs])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for storing user preferences
 * @param {string} key - Preference key
 * @param {any} defaultValue - Default value
 * @returns {Array} - [preference, setPreference, resetPreference]
 */
export const useUserPreference = (key, defaultValue) => {
  return useLocalStorage(`user_pref_${key}`, defaultValue, {
    syncAcrossTabs: true
  })
}

/**
 * Hook for managing theme preference
 * @returns {Array} - [theme, setTheme, resetTheme]
 */
export const useThemePreference = () => {
  const [theme, setTheme, resetTheme] = useUserPreference('theme', 'light')
  
  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    
    // Also set CSS custom property for theme
    document.documentElement.style.setProperty('--app-theme', theme)
  }, [theme])
  
  return [theme, setTheme, resetTheme]
}

/**
 * Hook for managing language preference
 * @returns {Array} - [language, setLanguage, resetLanguage]
 */
export const useLanguagePreference = () => {
  return useUserPreference('language', 'en')
}

/**
 * Hook for storing form data temporarily
 * @param {string} formId - Unique form identifier
 * @param {Object} initialData - Initial form data
 * @returns {Array} - [formData, setFormData, clearFormData, saveFormData]
 */
export const useFormStorage = (formId, initialData = {}) => {
  const [formData, setFormData, clearFormData] = useLocalStorage(
    `form_${formId}`,
    initialData,
    {
      onError: (error) => console.warn(`Form storage error for ${formId}:`, error)
    }
  )

  // Auto-save form data with debouncing
  const saveFormData = useCallback((data) => {
    setFormData(data)
  }, [setFormData])

  // Clear form data after successful submission
  const onSubmitSuccess = useCallback(() => {
    clearFormData()
  }, [clearFormData])

  return [formData, setFormData, clearFormData, saveFormData, onSubmitSuccess]
}

/**
 * Hook for managing quiz draft data
 * @param {string} quizId - Quiz identifier
 * @returns {Object} - Quiz draft management functions
 */
export const useQuizDraft = (quizId) => {
  const [draftData, setDraftData, clearDraft] = useLocalStorage(`quiz_draft_${quizId}`, {
    answers: {},
    currentQuestionIndex: 0,
    flaggedQuestions: [],
    lastSaved: null
  })

  const saveDraft = useCallback((answers, currentQuestionIndex, flaggedQuestions) => {
    setDraftData({
      answers,
      currentQuestionIndex,
      flaggedQuestions,
      lastSaved: new Date().toISOString()
    })
  }, [setDraftData])

  const hasDraft = Object.keys(draftData.answers || {}).length > 0

  const getDraftAge = () => {
    if (!draftData.lastSaved) return null
    return Date.now() - new Date(draftData.lastSaved).getTime()
  }

  return {
    draftData,
    saveDraft,
    clearDraft,
    hasDraft,
    getDraftAge
  }
}

/**
 * Hook for managing recently viewed items
 * @param {string} category - Category of items (e.g., 'quizzes', 'results')
 * @param {number} maxItems - Maximum items to store
 * @returns {Array} - [recentItems, addRecentItem, clearRecentItems]
 */
export const useRecentItems = (category, maxItems = 10) => {
  const [recentItems, setRecentItems, clearRecentItems] = useLocalStorage(
    `recent_${category}`,
    []
  )

  const addRecentItem = useCallback((item) => {
    setRecentItems(prevItems => {
      // Remove item if it already exists
      const filteredItems = prevItems.filter(prevItem => prevItem.id !== item.id)
      
      // Add item to the beginning and limit the array
      return [
        { ...item, viewedAt: new Date().toISOString() },
        ...filteredItems
      ].slice(0, maxItems)
    })
  }, [setRecentItems, maxItems])

  return [recentItems, addRecentItem, clearRecentItems]
}

/**
 * Hook for managing search history
 * @param {string} context - Search context (e.g., 'quiz_search', 'student_search')
 * @param {number} maxHistory - Maximum search terms to store
 * @returns {Array} - [searchHistory, addSearchTerm, clearSearchHistory]
 */
export const useSearchHistory = (context, maxHistory = 10) => {
  const [searchHistory, setSearchHistory, clearSearchHistory] = useLocalStorage(
    `search_history_${context}`,
    []
  )

  const addSearchTerm = useCallback((term) => {
    if (!term || term.trim().length < 2) return

    setSearchHistory(prevHistory => {
      const trimmedTerm = term.trim()
      
      // Remove if already exists
      const filteredHistory = prevHistory.filter(
        historyItem => historyItem.term.toLowerCase() !== trimmedTerm.toLowerCase()
      )
      
      // Add to beginning
      return [
        {
          term: trimmedTerm,
          searchedAt: new Date().toISOString()
        },
        ...filteredHistory
      ].slice(0, maxHistory)
    })
  }, [setSearchHistory, maxHistory])

  return [searchHistory, addSearchTerm, clearSearchHistory]
}

/**
 * Hook for managing app settings
 * @returns {Object} - Settings management functions
 */
export const useAppSettings = () => {
  const [settings, setSettings, resetSettings] = useLocalStorage('app_settings', {
    autoSave: true,
    notifications: true,
    soundEffects: true,
    darkMode: false,
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-IN'
  }, {
    syncAcrossTabs: true
  })

  const updateSetting = useCallback((key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }))
  }, [setSettings])

  const updateSettings = useCallback((newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }))
  }, [setSettings])

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings
  }
}

/**
 * Hook for managing offline data cache
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Array} - [cachedData, setCachedData, clearCache, isCacheValid]
 */
export const useOfflineCache = (key, ttl = 60 * 60 * 1000) => { // Default 1 hour TTL
  const [cacheData, setCacheData, clearCache] = useLocalStorage(`offline_cache_${key}`, {
    data: null,
    timestamp: null
  })

  const setCachedData = useCallback((data) => {
    setCacheData({
      data,
      timestamp: Date.now()
    })
  }, [setCacheData])

  const isCacheValid = useCallback(() => {
    if (!cacheData.timestamp || !cacheData.data) return false
    return (Date.now() - cacheData.timestamp) < ttl
  }, [cacheData.timestamp, cacheData.data, ttl])

  const getCachedData = useCallback(() => {
    return isCacheValid() ? cacheData.data : null
  }, [isCacheValid, cacheData.data])

  return [getCachedData(), setCachedData, clearCache, isCacheValid()]
}

/**
 * Hook for managing user's quiz attempt history
 * @param {string} userId - User ID
 * @returns {Object} - Attempt history management
 */
export const useAttemptHistory = (userId) => {
  const [attemptHistory, setAttemptHistory, clearHistory] = useLocalStorage(
    `attempt_history_${userId}`,
    []
  )

  const addAttempt = useCallback((quizId, attemptData) => {
    setAttemptHistory(prevHistory => {
      const newAttempt = {
        quizId,
        ...attemptData,
        timestamp: Date.now()
      }

      // Keep only last 50 attempts
      return [newAttempt, ...prevHistory].slice(0, 50)
    })
  }, [setAttemptHistory])

  const getQuizAttempts = useCallback((quizId) => {
    return attemptHistory.filter(attempt => attempt.quizId === quizId)
  }, [attemptHistory])

  const getLastAttempt = useCallback((quizId) => {
    const quizAttempts = getQuizAttempts(quizId)
    return quizAttempts.length > 0 ? quizAttempts[0] : null
  }, [getQuizAttempts])

  return {
    attemptHistory,
    addAttempt,
    getQuizAttempts,
    getLastAttempt,
    clearHistory
  }
}

export default useLocalStorage
