import { LOCALE_CONFIG, GRADE_MAPPING } from './constants'

/**
 * Format date according to Indian locale
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('date', 'time', 'datetime', 'relative')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'date') => {
  if (!date) return ''
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  if (isNaN(dateObj.getTime())) return ''
  
  const options = {
    timeZone: LOCALE_CONFIG.TIMEZONE,
    locale: LOCALE_CONFIG.DEFAULT_LOCALE
  }
  
  switch (format) {
    case 'date':
      return dateObj.toLocaleDateString('en-IN', {
        ...options,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    
    case 'datetime':
      return dateObj.toLocaleString('en-IN', {
        ...options,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    
    case 'relative':
      return formatRelativeTime(dateObj)
    
    case 'long':
      return dateObj.toLocaleDateString('en-IN', {
        ...options,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    
    case 'short':
      return dateObj.toLocaleDateString('en-IN', {
        ...options,
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      })
    
    default:
      return dateObj.toLocaleDateString('en-IN', options)
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) {
    return diffSecs <= 0 ? 'just now' : `${diffSecs} seconds ago`
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
  } else {
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`
  }
}

/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, showDecimals = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0'
  
  const options = {
    style: 'currency',
    currency: LOCALE_CONFIG.CURRENCY,
    currencyDisplay: 'symbol',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }
  
  return new Intl.NumberFormat('en-IN', options).format(amount)
}

/**
 * Format number with Indian numbering system (lakhs, crores)
 * @param {number} num - Number to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num, showDecimals = false) => {
  if (num === null || num === undefined || isNaN(num)) return '0'
  
  const options = {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }
  
  return new Intl.NumberFormat('en-IN', options).format(num)
}

/**
 * Format large numbers with suffixes (K, L, Cr)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number with suffix
 */
export const formatNumberWithSuffix = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0'
  
  if (num >= 10000000) { // 1 crore
    return `${(num / 10000000).toFixed(1)}Cr`
  } else if (num >= 100000) { // 1 lakh
    return `${(num / 100000).toFixed(1)}L`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  
  return num.toString()
}

/**
 * Format duration in seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Format percentage with proper rounding
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  
  return `${value.toFixed(decimals)}%`
}

/**
 * Convert score to letter grade based on Indian grading system
 * @param {number} score - Numeric score (0-100)
 * @returns {string} - Letter grade
 */
export const scoreToGrade = (score) => {
  if (score === null || score === undefined || isNaN(score)) return 'N/A'
  
  for (const [grade, range] of Object.entries(GRADE_MAPPING)) {
    if (score >= range.min && score <= range.max) {
      return grade
    }
  }
  
  return 'F'
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Indian mobile number format
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  
  // With country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const number = cleaned.slice(2)
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`
  }
  
  // Return as-is if format is unclear
  return phone
}

/**
 * Format name with proper capitalization
 * @param {string} name - Name to format
 * @returns {string} - Formatted name
 */
export const formatName = (name) => {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

/**
 * Format text for display with truncation
 * @param {string} text - Text to format
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Formatted text
 */
export const formatText = (text, maxLength = 100) => {
  if (!text) return ''
  
  if (text.length <= maxLength) return text
  
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format quiz attempt number
 * @param {number} attempt - Attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {string} - Formatted attempt string
 */
export const formatAttempt = (attempt, maxAttempts) => {
  if (!attempt || !maxAttempts) return ''
  
  const suffix = attempt === 1 ? 'st' : attempt === 2 ? 'nd' : attempt === 3 ? 'rd' : 'th'
  return `${attempt}${suffix} attempt (${attempt}/${maxAttempts})`
}

/**
 * Format class/grade display
 * @param {string} grade - Grade/class value
 * @returns {string} - Formatted grade string
 */
export const formatGrade = (grade) => {
  if (!grade) return ''
  
  const gradeNum = parseInt(grade)
  if (!isNaN(gradeNum)) {
    const suffix = gradeNum === 1 ? 'st' : gradeNum === 2 ? 'nd' : gradeNum === 3 ? 'rd' : 'th'
    return `${gradeNum}${suffix} Grade`
  }
  
  return grade
}

/**
 * Format address for Indian format
 * @param {object} address - Address object
 * @returns {string} - Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return ''
  
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode
  ].filter(Boolean)
  
  return parts.join(', ')
}

/**
 * Format quiz status for display
 * @param {string} status - Quiz status
 * @returns {object} - Status display object with text and color
 */
export const formatQuizStatus = (status) => {
  const statusMap = {
    'draft': { text: 'Draft', color: 'default' },
    'scheduled': { text: 'Scheduled', color: 'info' },
    'active': { text: 'Active', color: 'success' },
    'completed': { text: 'Completed', color: 'primary' },
    'expired': { text: 'Expired', color: 'error' },
    'archived': { text: 'Archived', color: 'secondary' }
  }
  
  return statusMap[status] || { text: status, color: 'default' }
}

/**
 * Format difficulty level for display
 * @param {string} difficulty - Difficulty level
 * @returns {object} - Difficulty display object with text and color
 */
export const formatDifficulty = (difficulty) => {
  const difficultyMap = {
    'easy': { text: 'Easy', color: 'success' },
    'medium': { text: 'Medium', color: 'warning' },
    'hard': { text: 'Hard', color: 'error' }
  }
  
  return difficultyMap[difficulty] || { text: difficulty, color: 'default' }
}

/**
 * Format time remaining until deadline
 * @param {Date|string} deadline - Deadline date
 * @returns {string} - Time remaining string
 */
export const formatTimeRemaining = (deadline) => {
  if (!deadline) return ''
  
  const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Expired'
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`
  } else {
    return 'Less than a minute remaining'
  }
}

/**
 * Format analytics data for charts
 * @param {Array} data - Raw data array
 * @param {string} xKey - Key for x-axis
 * @param {string} yKey - Key for y-axis
 * @returns {Array} - Formatted data for charts
 */
export const formatChartData = (data, xKey, yKey) => {
  if (!Array.isArray(data)) return []
  
  return data.map(item => ({
    x: item[xKey],
    y: item[yKey],
    ...item
  }))
}

/**
 * Format search query for display
 * @param {string} query - Search query
 * @returns {string} - Formatted query
 */
export const formatSearchQuery = (query) => {
  if (!query) return ''
  
  return query.trim().replace(/\s+/g, ' ')
}

// Export commonly used formatters
export default {
  formatDate,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatNumberWithSuffix,
  formatDuration,
  formatFileSize,
  formatPercentage,
  scoreToGrade,
  formatPhoneNumber,
  formatName,
  formatText,
  formatAttempt,
  formatGrade,
  formatAddress,
  formatQuizStatus,
  formatDifficulty,
  formatTimeRemaining,
  formatChartData,
  formatSearchQuery,
}
