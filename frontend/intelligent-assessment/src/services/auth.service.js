import api from './api'

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'authToken'
    this.REFRESH_TOKEN_KEY = 'refreshToken'
    this.USER_KEY = 'user'
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      })

      const { user, accessToken, refreshToken } = response.data

      // Store tokens based on remember me preference
      const storage = credentials.rememberMe ? localStorage : sessionStorage
      
      storage.setItem(this.TOKEN_KEY, accessToken)
      storage.setItem(this.USER_KEY, JSON.stringify(user))
      
      if (refreshToken) {
        storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
      }

      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        institution: userData.institution,
        class: userData.class,
        subject: userData.subject
      })

      const { user, accessToken, refreshToken } = response.data

      // Auto-login after registration
      localStorage.setItem(this.TOKEN_KEY, accessToken)
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
      }

      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken()
      
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      // Always clear local storage
      this.clearAuth()
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      console.error('Forgot password failed:', error)
      throw error
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      })
      return response.data
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token })
      return response.data
    } catch (error) {
      console.error('Email verification failed:', error)
      throw error
    }
  }

  // Resend verification email
  async resendVerification(email) {
    try {
      const response = await api.post('/auth/resend-verification', { email })
      return response.data
    } catch (error) {
      console.error('Resend verification failed:', error)
      throw error
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
      return response.data
    } catch (error) {
      console.error('Change password failed:', error)
      throw error
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      // Update stored user data
      const updatedUser = response.data.user
      const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage
      storage.setItem(this.USER_KEY, JSON.stringify(updatedUser))
      
      return response.data
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile')
      
      // Update stored user data
      const user = response.data.user
      const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage
      storage.setItem(this.USER_KEY, JSON.stringify(user))
      
      return response.data
    } catch (error) {
      console.error('Get profile failed:', error)
      throw error
    }
  }

  // Social login (Google, Facebook, etc.)
  async socialLogin(provider, token) {
    try {
      const response = await api.post(`/auth/social/${provider}`, { token })
      
      const { user, accessToken, refreshToken } = response.data
      
      localStorage.setItem(this.TOKEN_KEY, accessToken)
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
      }
      
      return response.data
    } catch (error) {
      console.error('Social login failed:', error)
      throw error
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Update stored user data
      const updatedUser = response.data.user
      const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage
      storage.setItem(this.USER_KEY, JSON.stringify(updatedUser))
      
      return response.data
    } catch (error) {
      console.error('Avatar upload failed:', error)
      throw error
    }
  }

  // Delete account
  async deleteAccount(password) {
    try {
      const response = await api.delete('/auth/account', {
        data: { password }
      })
      
      // Clear all auth data
      this.clearAuth()
      
      return response.data
    } catch (error) {
      console.error('Account deletion failed:', error)
      throw error
    }
  }

  // Refresh access token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await api.post('/auth/refresh', { refreshToken })
      
      const { accessToken, refreshToken: newRefreshToken } = response.data
      
      // Update tokens
      const storage = localStorage.getItem(this.TOKEN_KEY) ? localStorage : sessionStorage
      storage.setItem(this.TOKEN_KEY, accessToken)
      
      if (newRefreshToken) {
        storage.setItem(this.REFRESH_TOKEN_KEY, newRefreshToken)
      }
      
      return accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAuth()
      throw error
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY)
  }

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // Get current user from storage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  // Clear all authentication data
  clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    sessionStorage.removeItem(this.TOKEN_KEY)
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(this.USER_KEY)
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUser()
    return roles.includes(user?.role)
  }

  // Get user permissions
  getUserPermissions() {
    const user = this.getCurrentUser()
    return user?.permissions || []
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const permissions = this.getUserPermissions()
    return permissions.includes(permission)
  }

  // Validate token expiration
  isTokenExpired() {
    const token = this.getToken()
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return true
    }
  }

  // Setup token refresh timer
  setupTokenRefresh() {
    const token = this.getToken()
    if (!token || this.isTokenExpired()) return
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      const timeUntilExpiry = (payload.exp - currentTime) * 1000
      
      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0)
      
      setTimeout(() => {
        this.refreshToken().catch(() => {
          // Token refresh failed, redirect to login
          window.location.href = '/login'
        })
      }, refreshTime)
    } catch (error) {
      console.error('Error setting up token refresh:', error)
    }
  }
}

// Create and export singleton instance
const authService = new AuthService()
export default authService