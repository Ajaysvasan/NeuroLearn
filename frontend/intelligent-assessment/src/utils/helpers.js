import { STORAGE_KEYS, DEVICE_TYPES, THEME_CONFIG } from './constants'

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Generate unique ID
 * @param {number} length - Length of ID (default: 8)
 * @returns {string} - Unique ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate UUID v4
 * @returns {string} - UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Get random items from array
 * @param {Array} array - Source array
 * @param {number} count - Number of items to get
 * @returns {Array} - Random items
 */
export const getRandomItems = (array, count) => {
  const shuffled = shuffleArray(array)
  return shuffled.slice(0, Math.min(count, array.length))
}

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} - Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

/**
 * Sort array by multiple keys
 * @param {Array} array - Array to sort
 * @param {Array} keys - Keys to sort by with direction
 * @returns {Array} - Sorted array
 */
export const sortBy = (array, keys) => {
  return array.sort((a, b) => {
    for (const key of keys) {
      const { field, direction = 'asc' } = typeof key === 'string' ? { field: key } : key
      
      let aVal = a[field]
      let bVal = b[field]
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) continue
      if (aVal == null) return 1
      if (bVal == null) return -1
      
      // Convert to comparable values
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * Filter array with multiple conditions
 * @param {Array} array - Array to filter
 * @param {Object} filters - Filter conditions
 * @returns {Array} - Filtered array
 */
export const filterArray = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true
      
      const itemValue = item[key]
      
      // Handle array filters
      if (Array.isArray(value)) {
        return value.includes(itemValue)
      }
      
      // Handle string search
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      
      // Handle exact match
      return itemValue === value
    })
  })
}

/**
 * Calculate statistics for numerical array
 * @param {Array} numbers - Array of numbers
 * @returns {Object} - Statistics object
 */
export const calculateStats = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, mode: null, min: 0, max: 0 }
  }
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n))
  const count = validNumbers.length
  
  if (count === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, mode: null, min: 0, max: 0 }
  }
  
  const sum = validNumbers.reduce((acc, n) => acc + n, 0)
  const mean = sum / count
  
  const sorted = [...validNumbers].sort((a, b) => a - b)
  const median = count % 2 === 0 
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)]
  
  // Calculate mode
  const frequency = {}
  validNumbers.forEach(n => {
    frequency[n] = (frequency[n] || 0) + 1
  })
  
  const maxFreq = Math.max(...Object.values(frequency))
  const modes = Object.keys(frequency).filter(n => frequency[n] === maxFreq)
  const mode = modes.length === count ? null : modes.map(Number)
  
  return {
    count,
    sum,
    mean: Math.round(mean * 100) / 100,
    median,
    mode: mode && mode.length === 1 ? mode[0] : mode,
    min: Math.min(...validNumbers),
    max: Math.max(...validNumbers)
  }
}

/**
 * Local storage wrapper with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store (optional)
 * @returns {any} - Stored value or null
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}

/**
 * Session storage wrapper with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store (optional)
 * @returns {any} - Stored value or null
 */
export const sessionStorage = {
  get: (key) => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from sessionStorage:', error)
      return null
    }
  },
  
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to sessionStorage:', error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from sessionStorage:', error)
      return false
    }
  },
  
  clear: () => {
    try {
      window.sessionStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
      return false
    }
  }
}

/**
 * Detect device type
 * @returns {string} - Device type ('mobile', 'tablet', 'desktop')
 */
export const detectDeviceType = () => {
  const width = window.innerWidth
  
  if (width < 768) return DEVICE_TYPES.MOBILE
  if (width < 1024) return DEVICE_TYPES.TABLET
  return DEVICE_TYPES.DESKTOP
}

/**
 * Check if device is mobile
 * @returns {boolean} - True if mobile device
 */
export const isMobile = () => {
  return detectDeviceType() === DEVICE_TYPES.MOBILE
}

/**
 * Check if device is tablet
 * @returns {boolean} - True if tablet device
 */
export const isTablet = () => {
  return detectDeviceType() === DEVICE_TYPES.TABLET
}

/**
 * Check if device is desktop
 * @returns {boolean} - True if desktop device
 */
export const isDesktop = () => {
  return detectDeviceType() === DEVICE_TYPES.DESKTOP
}

/**
 * Get current theme from storage or system preference
 * @returns {string} - Theme ('light', 'dark', 'auto')
 */
export const getCurrentTheme = () => {
  const savedTheme = storage.get(STORAGE_KEYS.THEME)
  
  if (savedTheme && Object.values(THEME_CONFIG).includes(savedTheme)) {
    return savedTheme
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEME_CONFIG.DARK
  }
  
  return THEME_CONFIG.LIGHT
}

/**
 * Set theme and save to storage
 * @param {string} theme - Theme to set
 */
export const setTheme = (theme) => {
  if (!Object.values(THEME_CONFIG).includes(theme)) {
    console.warn('Invalid theme:', theme)
    return
  }
  
  storage.set(STORAGE_KEYS.THEME, theme)
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

/**
 * Download data as file
 * @param {any} data - Data to download
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export const downloadFile = (data, filename, type = 'application/json') => {
  const file = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type })
  
  if (window.navigator.msSaveOrOpenBlob) {
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename)
  } else {
    // Others
    const a = document.createElement('a')
    const url = URL.createObjectURL(file)
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 0)
  }
}

/**
 * Scroll to element smoothly
 * @param {string|Element} element - Element selector or element
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element
  
  if (!targetElement) {
    console.warn('Element not found:', element)
    return
  }
  
  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options
  }
  
  targetElement.scrollIntoView(defaultOptions)
}

/**
 * Get query parameters from URL
 * @param {string} url - URL to parse (optional, uses current URL)
 * @returns {Object} - Query parameters object
 */
export const getQueryParams = (url = window.location.href) => {
  const params = {}
  const urlObj = new URL(url)
  
  for (const [key, value] of urlObj.searchParams.entries()) {
    if (params[key]) {
      // Handle multiple values for same key
      if (Array.isArray(params[key])) {
        params[key].push(value)
      } else {
        params[key] = [params[key], value]
      }
    } else {
      params[key] = value
    }
  }
  
  return params
}

/**
 * Set query parameters in URL
 * @param {Object} params - Parameters to set
 * @param {boolean} replace - Replace current history entry
 */
export const setQueryParams = (params, replace = false) => {
  const url = new URL(window.location.href)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key)
    } else if (Array.isArray(value)) {
      url.searchParams.delete(key)
      value.forEach(v => url.searchParams.append(key, v))
    } else {
      url.searchParams.set(key, value)
    }
  })
  
  if (replace) {
    window.history.replaceState({}, '', url.toString())
  } else {
    window.history.pushState({}, '', url.toString())
  }
}

/**
 * Check if user is online
 * @returns {boolean} - Online status
 */
export const isOnline = () => {
  return navigator.onLine
}

/**
 * Wait for specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after timeout
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} - Function result or throws error
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) {
        throw error
      }
      
      await sleep(delay * Math.pow(2, i))
    }
  }
  
  throw lastError
}

/**
 * Validate required environment variables
 * @param {Array} requiredVars - Array of required variable names
 * @throws {Error} - If any required variable is missing
 */
export const validateEnvVars = (requiredVars) => {
  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Format error for display
 * @param {Error|string} error - Error to format
 * @returns {string} - Formatted error message
 */
export const formatError = (error) => {
  if (typeof error === 'string') return error
  
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred'
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.message) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// Export commonly used helpers
export default {
  deepClone,
  debounce,
  throttle,
  generateId,
  generateUUID,
  shuffleArray,
  getRandomItems,
  groupBy,
  sortBy,
  filterArray,
  calculateStats,
  storage,
  sessionStorage,
  detectDeviceType,
  isMobile,
  isTablet,
  isDesktop,
  getCurrentTheme,
  setTheme,
  copyToClipboard,
  downloadFile,
  scrollToElement,
  getQueryParams,
  setQueryParams,
  isOnline,
  sleep,
  retry,
  validateEnvVars,
  formatError,
}
