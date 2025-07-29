import { useState, useEffect, useContext, createContext } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '@services/auth.service'
import { toast } from 'react-toastify'

// Create Auth Context
const AuthContext = createContext({})

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  // Set up token refresh timer
  useEffect(() => {
    if (isAuthenticated) {
      authService.setupTokenRefresh()
    }
  }, [isAuthenticated])

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setLoading(true)
      
      const token = authService.getToken()
      const storedUser = authService.getCurrentUser()
      
      if (token && storedUser && !authService.isTokenExpired()) {
        setUser(storedUser)
        setIsAuthenticated(true)
        
        // Validate token with server
        try {
          const profileData = await authService.getProfile()
          setUser(profileData.user)
        } catch (error) {
          // Token is invalid, clear auth
          await logout()
        }
      } else {
        // Clear invalid/expired auth
        authService.clearAuth()
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      authService.clearAuth()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true)
      
      const response = await authService.login(credentials)
      const { user: userData, accessToken } = response
      
      setUser(userData)
      setIsAuthenticated(true)
      
      toast.success(`Welcome back, ${userData.name}!`)
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
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
      
      const response = await authService.register(userData)
      const { user: newUser } = response
      
      setUser(newUser)
      setIsAuthenticated(true)
      
      toast.success(`Welcome to IntelliAssess, ${newUser.name}!`)
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)
      
      await authService.logout()
      
      setUser(null)
      setIsAuthenticated(false)
      
      toast.success('You have been logged out successfully.')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      // Clear local state even if server request fails
      authService.clearAuth()
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      
      const response = await authService.updateProfile(profileData)
      const { user: updatedUser } = response
      
      setUser(updatedUser)
      toast.success('Profile updated successfully!')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed.'
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
      
      const response = await authService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed.'
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
      
      const response = await authService.forgotPassword(email)
      toast.success('Password reset instructions sent to your email.')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email.'
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
      
      const response = await authService.resetPassword(token, newPassword)
      toast.success('Password reset successfully! Please log in.')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed.'
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
      
      const response = await authService.uploadProfilePicture(file)
      const { user: updatedUser } = response
      
      setUser(updatedUser)
      toast.success('Profile picture updated successfully!')
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile picture upload failed.'
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
      
      const response = await authService.socialLogin(provider, token)
      const { user: userData } = response
      
      setUser(userData)
      setIsAuthenticated(true)
      
      toast.success(`Welcome, ${userData.name}!`)
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || `${provider} login failed.`
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return authService.hasRole(role)
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return authService.hasAnyRole(roles)
  }

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return authService.hasPermission(permission)
  }

  // Get user permissions
  const getUserPermissions = () => {
    return authService.getUserPermissions()
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      const profileData = await authService.getProfile()
      setUser(profileData.user)
      return profileData.user
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      throw error
    }
  }

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    uploadProfilePicture,
    socialLogin,
    hasRole,
    hasAnyRole,
    hasPermission,
    getUserPermissions,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
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

// Protected route helper
export const useAuthGuard = (requiredRoles = [], requiredPermissions = []) => {
  const { user, isAuthenticated, hasAnyRole, hasPermission, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      navigate('/login', { replace: true })
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
  }, [user, isAuthenticated, loading, requiredRoles, requiredPermissions, navigate])

  return {
    user,
    isAuthenticated,
    loading,
    isAuthorized: isAuthenticated && 
      (requiredRoles.length === 0 || hasAnyRole(requiredRoles)) &&
      (requiredPermissions.length === 0 || requiredPermissions.every(p => hasPermission(p)))
  }
}

export default useAuth
