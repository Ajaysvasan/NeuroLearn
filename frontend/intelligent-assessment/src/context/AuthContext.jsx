import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '@services/auth.service'
import { toast } from 'react-toastify'
import { USER_ROLES, PERMISSIONS } from '@utils/constants'
import LoadingSpinner from '@components/common/LoadingSpinner'

// Create Auth Context
const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateProfile: () => {},
  changePassword: () => {},
  forgotPassword: () => {},
  resetPassword: () => {},
  uploadProfilePicture: () => {},
  socialLogin: () => {},
  hasRole: () => false,
  hasAnyRole: () => false,
  hasPermission: () => false,
  getUserPermissions: () => [],
  refreshUser: () => {},
  clearAuthError: () => {},
})

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [tokenRefreshTimer, setTokenRefreshTimer] = useState(null)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
    
    // Cleanup timer on unmount
    return () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
      }
    }
  }, [])

  // Set up token refresh timer when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setupTokenRefresh()
    } else {
      // Clear refresh timer if user is not authenticated
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
        setTokenRefreshTimer(null)
      }
    }
  }, [isAuthenticated, user])

  // Listen for storage changes (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' && !e.newValue && isAuthenticated) {
        // Token was removed from another tab
        handleLogoutFromAnotherTab()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [isAuthenticated])

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const token = authService.getToken()
      const storedUser = authService.getCurrentUser()
      
      if (token && storedUser && !authService.isTokenExpired()) {
        // Validate token with server
        try {
          const profileResponse = await authService.getProfile()
          setUser(profileResponse.user)
          setIsAuthenticated(true)
          
          // Setup automatic token refresh
          setupTokenRefresh()
          
        } catch (error) {
          // Token is invalid or expired
          console.warn('Token validation failed:', error)
          await handleAuthClear()
        }
      } else {
        // No valid auth data
        await handleAuthClear()
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setAuthError('Failed to initialize authentication')
      await handleAuthClear()
    } finally {
      setLoading(false)
    }
  }

  // Setup automatic token refresh
  const setupTokenRefresh = () => {
    try {
      const token = authService.getToken()
      if (!token) return

      // Clear existing timer
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
      }

      // Parse token to get expiration
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      const timeUntilExpiry = (payload.exp - currentTime) * 1000
      
      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0)
      
      const timer = setTimeout(async () => {
        try {
          await authService.refreshToken()
          setupTokenRefresh() // Setup next refresh
        } catch (error) {
          console.error('Token refresh failed:', error)
          await handleAuthClear()
          toast.error('Session expired. Please log in again.')
          navigate('/login')
        }
      }, refreshTime)
      
      setTokenRefreshTimer(timer)
    } catch (error) {
      console.error('Error setting up token refresh:', error)
    }
  }

  // Handle authentication clear
  const handleAuthClear = async () => {
    authService.clearAuth()
    setUser(null)
    setIsAuthenticated(false)
    setAuthError(null)
    
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer)
      setTokenRefreshTimer(null)
    }
  }

  // Handle logout from another tab
  const handleLogoutFromAnotherTab = () => {
    setUser(null)
    setIsAuthenticated(false)
    toast.info('You have been logged out from another tab.')
    navigate('/login')
  }

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.login(credentials)
      const { user: userData, accessToken } = response
      
      setUser(userData)
      setIsAuthenticated(true)
      
      // Success message based on user role
      const welcomeMessage = userData.role === USER_ROLES.TEACHER 
        ? `Welcome back, ${userData.name}! Ready to create amazing assessments?`
        : `Welcome back, ${userData.name}! Ready to learn something new?`
      
      toast.success(welcomeMessage)
      
      // Redirect based on role and intended destination
      const from = location.state?.from?.pathname
      let redirectPath = from || '/'
      
      if (!from) {
        redirectPath = userData.role === USER_ROLES.TEACHER 
          ? '/teacher/dashboard' 
          : '/student/dashboard'
      }
      
      navigate(redirectPath, { replace: true })
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.register(userData)
      const { user: newUser } = response
      
      setUser(newUser)
      setIsAuthenticated(true)
      
      // Welcome message based on role
      const welcomeMessage = newUser.role === USER_ROLES.TEACHER
        ? `Welcome to IntelliAssess, ${newUser.name}! Let's start creating intelligent assessments.`
        : `Welcome to IntelliAssess, ${newUser.name}! Your learning journey begins now.`
      
      toast.success(welcomeMessage)
      
      // Redirect to appropriate dashboard
      const redirectPath = newUser.role === USER_ROLES.TEACHER 
        ? '/teacher/dashboard' 
        : '/student/dashboard'
      
      navigate(redirectPath, { replace: true })
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async (showMessage = true) => {
    try {
      setLoading(true)
      
      // Call logout API
      await authService.logout()
      
      // Clear local state
      await handleAuthClear()
      
      if (showMessage) {
        toast.success('You have been logged out successfully.')
      }
      
      // Navigate to login
      navigate('/login', { replace: true })
      
    } catch (error) {
      console.error('Logout failed:', error)
      // Clear local state even if API call fails
      await handleAuthClear()
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.updateProfile(profileData)
      const { user: updatedUser } = response
      
      setUser(updatedUser)
      toast.success('Profile updated successfully!')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.forgotPassword(email)
      toast.success('Password reset instructions sent to your email.')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.resetPassword(token, newPassword)
      toast.success('Password reset successfully! Please log in with your new password.')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Upload profile picture function
  const uploadProfilePicture = async (file) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.uploadProfilePicture(file)
      const { user: updatedUser } = response
      
      setUser(updatedUser)
      toast.success('Profile picture updated successfully!')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile picture upload failed.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Social login function
  const socialLogin = async (provider, token) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await authService.socialLogin(provider, token)
      const { user: userData } = response
      
      setUser(userData)
      setIsAuthenticated(true)
      
      toast.success(`Welcome, ${userData.name}!`)
      
      // Redirect based on role
      const redirectPath = userData.role === USER_ROLES.TEACHER 
        ? '/teacher/dashboard' 
        : '/student/dashboard'
      
      navigate(redirectPath, { replace: true })
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || `${provider} login failed.`
      setAuthError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user?.role || !Array.isArray(roles)) return false
    return roles.includes(user.role)
  }

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user?.permissions || !Array.isArray(user.permissions)) return false
    return user.permissions.includes(permission)
  }

  // Get user permissions
  const getUserPermissions = () => {
    return user?.permissions || []
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      const profileResponse = await authService.getProfile()
      setUser(profileResponse.user)
      return profileResponse.user
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      throw error
    }
  }

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null)
  }

  // Check if user is teacher
  const isTeacher = () => hasRole(USER_ROLES.TEACHER)

  // Check if user is student
  const isStudent = () => hasRole(USER_ROLES.STUDENT)

  // Check if user is admin
  const isAdmin = () => hasRole(USER_ROLES.ADMIN)

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Guest'
    return user.name || user.email || 'User'
  }

  // Get user avatar URL
  const getUserAvatar = () => {
    return user?.avatar || user?.profilePicture || null
  }

  // Context value
  const contextValue = {
    // State
    user,
    loading,
    isAuthenticated,
    authError,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    uploadProfilePicture,
    socialLogin,
    refreshUser,
    clearAuthError,
    
    // Permissions
    hasRole,
    hasAnyRole,
    hasPermission,
    getUserPermissions,
    
    // Convenience methods
    isTeacher,
    isStudent,
    isAdmin,
    getUserDisplayName,
    getUserAvatar,
  }

  // Show loading spinner during initial authentication
  if (loading && !user && !authError) {
    return <LoadingSpinner text="Initializing..." overlay />
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// HOC for protected routes
export const withAuth = (WrappedComponent, options = {}) => {
  const { requiredRoles = [], requiredPermissions = [], redirectTo = '/login' } = options
  
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasAnyRole, hasPermission, loading } = useAuth()
    const navigate = useNavigate()
    
    useEffect(() => {
      if (loading) return
      
      if (!isAuthenticated) {
        navigate(redirectTo, { 
          state: { from: location },
          replace: true 
        })
        return
      }
      
      if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        navigate('/unauthorized', { replace: true })
        return
      }
      
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(permission => 
          hasPermission(permission)
        )
        
        if (!hasRequiredPermissions) {
          navigate('/unauthorized', { replace: true })
          return
        }
      }
    }, [isAuthenticated, loading, navigate])
    
    if (loading) {
      return <LoadingSpinner text="Checking authentication..." />
    }
    
    if (!isAuthenticated) {
      return null
    }
    
    return <WrappedComponent {...props} />
  }
}

export default AuthContext
