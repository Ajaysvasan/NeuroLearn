import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '@services/auth.service'
import { USER_ROLES } from '@utils/constants'
import { toast } from 'react-toastify'

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  loginAttempts: 0,
  lastLoginTime: null,
  sessionExpiry: null,
  rememberMe: false,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
    autoSave: true,
  },
  profile: {
    avatar: null,
    bio: '',
    phone: '',
    institution: '',
    subjects: [],
    experience: '',
  },
}

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      
      // Track successful login
      const loginData = {
        ...response,
        loginTime: new Date().toISOString(),
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }
      
      return loginData
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      return rejectWithValue({
        message,
        statusCode: error.response?.status,
        details: error.response?.data?.details || null,
      })
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      
      return {
        ...response,
        loginTime: new Date().toISOString(),
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      return rejectWithValue({
        message,
        statusCode: error.response?.status,
        details: error.response?.data?.details || null,
      })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      await authService.logout()
      
      // Clear all user-related data from localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      return { logoutTime: new Date().toISOString() }
    } catch (error) {
      // Even if logout API fails, clear local state
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      return rejectWithValue({
        message: 'Logout completed with warnings',
        details: error.message,
      })
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      
      if (!auth.refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await authService.refreshToken()
      
      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || auth.refreshToken,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      return rejectWithValue({
        message: 'Session expired. Please log in again.',
        details: error.message,
      })
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData)
      return response.user
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      return rejectWithValue({
        message,
        details: error.response?.data?.details || null,
      })
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await authService.changePassword(currentPassword, newPassword)
      return { message: 'Password changed successfully' }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      return rejectWithValue({
        message,
        details: error.response?.data?.details || null,
      })
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(email)
      return { message: 'Password reset instructions sent to your email' }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      return rejectWithValue({ message })
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      await authService.resetPassword(token, newPassword)
      return { message: 'Password reset successfully' }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      return rejectWithValue({ message })
    }
  }
)

export const uploadProfilePicture = createAsyncThunk(
  'auth/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const response = await authService.uploadProfilePicture(file)
      return response.user
    } catch (error) {
      const message = error.response?.data?.message || 'Profile picture upload failed'
      return rejectWithValue({ message })
    }
  }
)

export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async ({ provider, token }, { rejectWithValue }) => {
    try {
      const response = await authService.socialLogin(provider, token)
      
      return {
        ...response,
        loginTime: new Date().toISOString(),
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      const message = error.response?.data?.message || `${provider} login failed`
      return rejectWithValue({ message })
    }
  }
)

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = authService.getToken()
      const user = authService.getCurrentUser()
      
      if (token && user && !authService.isTokenExpired()) {
        // Validate with server
        const response = await authService.getProfile()
        
        return {
          user: response.user,
          token,
          refreshToken: authService.getRefreshToken(),
          isAuthenticated: true,
          loginTime: user.loginTime || new Date().toISOString(),
        }
      }
      
      return null
    } catch (error) {
      // Clear invalid tokens
      authService.clearAuth()
      return rejectWithValue({ message: 'Session invalid' })
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    
    clearAuth: (state) => {
      Object.assign(state, initialState)
    },
    
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload }
    },
    
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload
    },
    
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1
    },
    
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0
    },
    
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload
    },
    
    updateUserField: (state, action) => {
      const { field, value } = action.payload
      if (state.user) {
        state.user[field] = value
      }
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    
    setAuthError: (state, action) => {
      state.error = action.payload
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.lastLoginTime = action.payload.loginTime
        state.sessionExpiry = action.payload.sessionExpiry
        state.loginAttempts = 0
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.loginAttempts += 1
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.lastLoginTime = action.payload.loginTime
        state.sessionExpiry = action.payload.sessionExpiry
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState)
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails, clear the state
        Object.assign(state, initialState)
      })
      
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.loading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.sessionExpiry = action.payload.sessionExpiry
        state.error = null
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Clear auth on refresh failure
        Object.assign(state, initialState)
      })
      
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = { ...state.user, ...action.payload }
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Upload profile picture cases
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false
        state.user = { ...state.user, ...action.payload }
        state.error = null
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Social login cases
      .addCase(socialLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.lastLoginTime = action.payload.loginTime
        state.sessionExpiry = action.payload.sessionExpiry
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.user = action.payload.user
          state.token = action.payload.token
          state.refreshToken = action.payload.refreshToken
          state.isAuthenticated = action.payload.isAuthenticated
          state.lastLoginTime = action.payload.loginTime
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        Object.assign(state, initialState)
      })
  },
})

// Selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
export const selectUserRole = (state) => state.auth.user?.role
export const selectUserPermissions = (state) => state.auth.user?.permissions || []
export const selectUserPreferences = (state) => state.auth.preferences
export const selectUserProfile = (state) => state.auth.profile
export const selectSessionExpiry = (state) => state.auth.sessionExpiry
export const selectLoginAttempts = (state) => state.auth.loginAttempts

// Helper selectors
export const selectIsTeacher = (state) => state.auth.user?.role === USER_ROLES.TEACHER
export const selectIsStudent = (state) => state.auth.user?.role === USER_ROLES.STUDENT
export const selectIsAdmin = (state) => state.auth.user?.role === USER_ROLES.ADMIN

export const selectHasRole = (role) => (state) => state.auth.user?.role === role
export const selectHasPermission = (permission) => (state) => 
  state.auth.user?.permissions?.includes(permission) || false

export const selectIsSessionExpired = (state) => {
  if (!state.auth.sessionExpiry) return false
  return new Date() > new Date(state.auth.sessionExpiry)
}

// Actions
export const {
  clearError,
  clearAuth,
  updatePreferences,
  setRememberMe,
  incrementLoginAttempts,
  resetLoginAttempts,
  setSessionExpiry,
  updateUserField,
  setLoading,
  setAuthError,
} = authSlice.actions

export default authSlice.reducer
