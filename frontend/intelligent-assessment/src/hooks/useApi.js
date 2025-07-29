import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import api from '@services/api'
import { useAuth } from './useAuth'

/**
 * Custom hook for API calls with loading, error, and data states
 * @param {string|Function} url - API endpoint URL or function that returns URL
 * @param {Object} options - Configuration options
 * @returns {Object} - API state and methods
 */
export const useApi = (url, options = {}) => {
  const {
    method = 'GET',
    Data = null,
    immediate = true,
    onSuccess = null,
    onError = null,
    transform = null,
    dependencies = [],
    retry = 0,
    retryDelay = 1000,
    cache = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    showErrorToast = true,
    showSuccessToast = false,
    debounceDelay = 0,
  } = options

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const { isAuthenticated } = useAuth()
  const abortControllerRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const debounceTimeoutRef = useRef(null)
  const cacheRef = useRef(new Map())

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }, [])

  // Get cache key
  const getCacheKey = useCallback((requestUrl, requestData) => {
    return `${method}:${requestUrl}:${JSON.stringify(requestData || {})}`
  }, [method])

  // Check if cached data is valid
  const isCacheValid = useCallback((cacheEntry) => {
    if (!cache || !cacheEntry) return false
    return Date.now() - cacheEntry.timestamp < cacheTime
  }, [cache, cacheTime])

  // Execute API call
  const execute = useCallback(async (executeUrl = url, executeData = data, options = {}) => {
    const finalUrl = typeof executeUrl === 'function' ? executeUrl() : executeUrl
    
    if (!finalUrl) {
      setError('URL is required')
      return
    }

    // Check cache first
    if (cache && method === 'GET') {
      const cacheKey = getCacheKey(finalUrl, executeData)
      const cachedData = cacheRef.current.get(cacheKey)
      
      if (isCacheValid(cachedData)) {
        setData(cachedData.data)
        setError(null)
        setLastFetch(cachedData.timestamp)
        return cachedData.data
      }
    }

    // Cancel previous request
    cleanup()

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const config = {
        method,
        url: finalUrl,
        signal: abortControllerRef.current.signal,
        ...options
      }

      // Add data based on method
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = executeData
      } else if (executeData) {
        config.params = executeData
      }

      const response = await api(config)
      
      // Transform data if transformer provided
      const transformedData = transform ? transform(response.data) : response.data
      
      setData(transformedData)
      setLastFetch(Date.now())

      // Cache the response
      if (cache && method === 'GET') {
        const cacheKey = getCacheKey(finalUrl, executeData)
        cacheRef.current.set(cacheKey, {
          data: transformedData,
          timestamp: Date.now()
        })
      }

      // Success callback
      if (onSuccess) {
        onSuccess(transformedData, response)
      }

      // Success toast
      if (showSuccessToast) {
        toast.success('Operation completed successfully')
      }

      return transformedData

    } catch (err) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return
      }

      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)

      // Error callback
      if (onError) {
        onError(err)
      }

      // Error toast
      if (showErrorToast) {
        toast.error(errorMessage)
      }

      // Retry logic
      if (retry > 0 && !err.response?.status?.toString().startsWith('4')) {
        retryTimeoutRef.current = setTimeout(() => {
          execute(executeUrl, executeData, { ...options, retry: retry - 1 })
        }, retryDelay)
      }

      throw err
    } finally {
      setLoading(false)
    }
  }, [
    url,
    data,
    method,
    cache,
    cacheTime,
    transform,
    onSuccess,
    onError,
    showErrorToast,
    showSuccessToast,
    retry,
    retryDelay,
    getCacheKey,
    isCacheValid,
    cleanup
  ])

  // Debounced execute function
  const debouncedExecute = useCallback((executeUrl, executeData, options) => {
    if (debounceDelay > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        execute(executeUrl, executeData, options)
      }, debounceDelay)
    } else {
      execute(executeUrl, executeData, options)
    }
  }, [execute, debounceDelay])

  // Refresh function
  const refresh = useCallback(() => {
    return execute()
  }, [execute])

  // Clear cache function
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  // Reset state function
  const reset = useCallback(() => {
    cleanup()
    setData(null)
    setError(null)
    setLoading(false)
    setLastFetch(null)
  }, [cleanup])

  // Execute on mount and dependency changes
  useEffect(() => {
    if (immediate && isAuthenticated !== null) {
      debouncedExecute()
    }

    return cleanup
  }, [immediate, isAuthenticated, debouncedExecute, cleanup, ...dependencies])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    loading,
    data,
    error,
    lastFetch,
    execute: debouncedExecute,
    refresh,
    reset,
    clearCache,
  }
}

/**
 * Hook for paginated API requests
 * @param {string} url - Base URL for the paginated endpoint
 * @param {Object} options - Configuration options
 * @returns {Object} - Pagination state and methods
 */
export const usePaginatedApi = (url, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    ...apiOptions
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [allData, setAllData] = useState([])
  const [hasMore, setHasMore] = useState(true)

  const { loading, data, error, execute, refresh } = useApi(
    () => `${url}?page=${currentPage}&limit=${pageSize}`,
    {
      ...apiOptions,
      immediate: false,
      onSuccess: (responseData) => {
        if (currentPage === 1) {
          setAllData(responseData.items || [])
        } else {
          setAllData(prev => [...prev, ...(responseData.items || [])])
        }
        
        setHasMore(
          responseData.pagination ? 
            responseData.pagination.hasNext : 
            (responseData.items?.length === pageSize)
        )
        
        if (apiOptions.onSuccess) {
          apiOptions.onSuccess(responseData)
        }
      }
    }
  )

  // Load first page
  useEffect(() => {
    execute()
  }, [execute])

  // Load next page
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1)
    }
  }, [loading, hasMore])

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage)
    setAllData([])
    setHasMore(true)
  }, [initialPage])

  // Refresh from beginning
  const refreshAll = useCallback(() => {
    resetPagination()
    setTimeout(() => execute(), 0)
  }, [resetPagination, execute])

  return {
    loading,
    data: allData,
    error,
    hasMore,
    currentPage,
    loadMore,
    refresh: refreshAll,
    reset: resetPagination,
  }
}

/**
 * Hook for search API requests with debouncing
 * @param {string} baseUrl - Base URL for search endpoint
 * @param {Object} options - Configuration options
 * @returns {Object} - Search state and methods
 */
export const useSearchApi = (baseUrl, options = {}) => {
  const {
    searchParam = 'q',
    minQueryLength = 2,
    debounceDelay = 300,
    ...apiOptions
  } = options

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const { loading, error, execute } = useApi(
    () => query.length >= minQueryLength ? `${baseUrl}?${searchParam}=${encodeURIComponent(query)}` : null,
    {
      ...apiOptions,
      immediate: false,
      debounceDelay,
      onSuccess: (data) => {
        setResults(data.results || data.items || data)
        if (apiOptions.onSuccess) {
          apiOptions.onSuccess(data)
        }
      }
    }
  )

  // Execute search when query changes
  useEffect(() => {
    if (query.length >= minQueryLength) {
      execute()
    } else {
      setResults([])
    }
  }, [query, minQueryLength, execute])

  const search = useCallback((searchQuery) => {
    setQuery(searchQuery)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    query,
    results,
    loading,
    error,
    search,
    clearSearch,
  }
}

/**
 * Hook for mutation API requests (POST, PUT, DELETE)
 * @param {string} url - API endpoint URL
 * @param {Object} options - Configuration options
 * @returns {Object} - Mutation state and methods
 */
export const useMutationApi = (url, options = {}) => {
  const {
    method = 'POST',
    invalidateCache = [],
    optimisticUpdate = null,
    rollbackUpdate = null,
    ...apiOptions
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (data, mutationOptions = {}) => {
    try {
      setIsLoading(true)
      setError(null)

      // Optimistic update
      if (optimisticUpdate) {
        optimisticUpdate(data)
      }

      const config = {
        method,
        url,
        data,
        ...mutationOptions
      }

      const response = await api(config)

      // Success callback
      if (apiOptions.onSuccess) {
        apiOptions.onSuccess(response.data, response)
      }

      // Invalidate cache
      if (invalidateCache.length > 0) {
        // This would integrate with a cache invalidation system
        // For now, we'll just log the cache keys to invalidate
        console.log('Cache keys to invalidate:', invalidateCache)
      }

      // Success toast
      if (apiOptions.showSuccessToast) {
        toast.success('Operation completed successfully')
      }

      return response.data

    } catch (err) {
      // Rollback optimistic update
      if (rollbackUpdate) {
        rollbackUpdate(data)
      }

      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)

      // Error callback
      if (apiOptions.onError) {
        apiOptions.onError(err)
      }

      // Error toast
      if (apiOptions.showErrorToast !== false) {
        toast.error(errorMessage)
      }

      throw err
    } finally {
      setIsLoading(false)
    }
  }, [url, method, optimisticUpdate, rollbackUpdate, invalidateCache, apiOptions])

  return {
    mutate,
    isLoading,
    error,
    reset: () => {
      setError(null)
      setIsLoading(false)
    }
  }
}

export default useApi
