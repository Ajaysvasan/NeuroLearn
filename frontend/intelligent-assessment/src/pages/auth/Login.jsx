import React, { useState, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  Person,
  Google,
  Facebook,
  GitHub
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { useAuth } from '@context/AuthContext'
import LoadingSpinner from '@components/common/LoadingSpinner'

const Login = () => {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginError, setLoginError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (data) => {
    try {
      setLoginError('')
      const result = await login({
        ...data,
        rememberMe
      })
      
      // Redirect based on user role
      if (result.user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true })
      } else if (result.user.role === 'student') {
        navigate('/student/dashboard', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login coming soon!`)
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (loading) {
    return <LoadingSpinner text="Authenticating..." overlay />
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Grid container maxWidth="lg" sx={{ height: '100%' }}>
        {/* Left Side - Branding */}
        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              p: 4
            }}
          >
            <School sx={{ fontSize: 80, mb: 3 }} />
            <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
              Intelligent Assessment System
            </Typography>
            <Typography variant="h6" align="center" sx={{ opacity: 0.9, mb: 4 }}>
              AI-Powered Learning & Assessment Platform
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                Transform your education experience with:
              </Typography>
              <Box sx={{ textAlign: 'left', maxWidth: 300 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  🤖 AI-Generated Questions
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  📊 Real-time Analytics
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  🎯 Personalized Feedback
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  📈 Progress Tracking
                </Typography>
              </Box>
            </Box>

            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              🇮🇳 Proudly made in Chennai, India
            </Typography>
          </Box>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              p: 2
            }}
          >
            <Paper
              elevation={24}
              sx={{
                p: 4,
                width: '100%',
                maxWidth: 450,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <School 
                  sx={{ 
                    fontSize: 48, 
                    color: 'primary.main', 
                    mb: 2,
                    display: { xs: 'block', md: 'none' }
                  }} 
                />
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to your account to continue learning
                </Typography>
              </Box>

              {/* Error Alert */}
              {loginError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {loginError}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {/* Remember Me & Forgot Password */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Remember me"
                  />
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#1976d2',
                      fontSize: '0.875rem'
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                {/* Login Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ 
                    mb: 3, 
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Divider */}
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Or continue with
                  </Typography>
                </Divider>

                {/* Social Login Buttons */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleSocialLogin('Google')}
                      sx={{ py: 1.5 }}
                    >
                      <Google />
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleSocialLogin('Facebook')}
                      sx={{ py: 1.5 }}
                    >
                      <Facebook />
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleSocialLogin('GitHub')}
                      sx={{ py: 1.5 }}
                    >
                      <GitHub />
                    </Button>
                  </Grid>
                </Grid>

                {/* Register Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      style={{ 
                        textDecoration: 'none', 
                        color: '#1976d2',
                        fontWeight: 500
                      }}
                    >
                      Sign up here
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Login
