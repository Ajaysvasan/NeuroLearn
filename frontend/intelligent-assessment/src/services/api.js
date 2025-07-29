import axios from 'axios'
import { toast } from 'react-toastify'

// Base API configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date()
    const duration = endTime - response.config.metadata.startTime
    
    // Log successful requests in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`)
    }
    
    return response
  },
  (error) => {
    // Calculate request duration for failed requests
    const duration = error.config?.metadata ? 
      new Date() - error.config.metadata.startTime : 'unknown'
    
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'} (${duration}ms)`)
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          handleUnauthorized()
          break
          
        case 403:
          // Forbidden - insufficient permissions
          toast.error('Access denied. You do not have permission to perform this action.')
          break
          
        case 404:
          // Not found
          toast.error('Requested resource not found.')
          break
          
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.message))
          } else {
            toast.error(data.message || 'Validation error occurred.')
          }
          break
          
        case 429:
          // Rate limiting
          toast.error('Too many requests. Please wait a moment and try again.')
          break
          
        case 500:
          // Server error
          toast.error('Server error occurred. Please try again later.')
          break
          
        case 502:
        case 503:
        case 504:
          // Gateway/Service errors
          toast.error('Service temporarily unavailable. Please try again later.')
          break
          
        default:
          // Generic error message
          toast.error(data.message || `Request failed with status ${status}`)
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error:', error.request)
      toast.error('Network error. Please check your internet connection.')
    } else {
      // Request setup error
      console.error('Request setup error:', error.message)
      toast.error('Request configuration error.')
    }
    
    return Promise.reject(error)
  }
)

// Handle unauthorized access
const handleUnauthorized = () => {
  // Clear stored tokens
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  sessionStorage.clear()
  
  // Show error message
  toast.error('Session expired. Please log in again.')
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = '/login'
  }, 1500)
}

// Token refresh functionality
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken
    })
    
    const { accessToken, refreshToken: newRefreshToken } = response.data
    
    // Update stored tokens
    localStorage.setItem('authToken', accessToken)
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    }
    
    return accessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    handleUnauthorized()
    throw error
  }
}

// Retry failed requests with token refresh
const retryWithRefresh = async (originalRequest) => {
  try {
    const newToken = await refreshToken()
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return api(originalRequest)
  } catch (error) {
    return Promise.reject(error)
  }
}

// API utility functions
export const apiUtils = {
  // File upload with progress tracking
  uploadFile: async (url, file, onProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    })
  },
  
  // Download file with proper handling
  downloadFile: async (url, filename = null) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob'
      })
      
      // Create download link
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      return response
    } catch (error) {
      toast.error('File download failed')
      throw error
    }
  },
  
  // Batch requests
  batchRequest: async (requests) => {
    try {
      const responses = await Promise.allSettled(
        requests.map(request => api(request))
      )
      
      return responses.map((result, index) => ({
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? result.reason : null,
        originalRequest: requests[index]
      }))
    } catch (error) {
      console.error('Batch request failed:', error)
      throw error
    }
  },
  
  // Paginated requests
  getPaginated: async (url, page = 1, limit = 10, filters = {}) => {
    const params = {
      page,
      limit,
      ...filters
    }
    
    return api.get(url, { params })
  },
  
  // Search with debouncing
  search: async (url, query, options = {}) => {
    const params = {
      q: query,
      ...options
    }
    
    return api.get(url, { params })
  }
}

// Health check endpoint
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

// Export configured axios instance
export default api