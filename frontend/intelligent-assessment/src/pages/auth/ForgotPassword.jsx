import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material'
import {
  Email,
  Lock,
  CheckCircle,
  ArrowBack,
  Send,
  VpnKey,
  School
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { authService } from '@services/auth.service'
import LoadingSpinner from '@components/common/LoadingSpinner'

const steps = ['Enter Email', 'Check Email', 'Reset Password']

const ForgotPassword = () => {
  const navigate = useNavigate()
  
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm()

  const password = watch('password')

  const handleSendResetEmail = async (data) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await authService.forgotPassword(data.email)
      setEmail(data.email)
      setActiveStep(1)
      setSuccess('Password reset instructions have been sent to your email.')
      toast.success('Reset email sent successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (data) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await authService.resetPassword(resetToken, data.password)
      setActiveStep(2)
      setSuccess('Your password has been reset successfully!')
      toast.success('Password reset successfully!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTokenSubmit = () => {
    if (!resetToken.trim()) {
      setError('Please enter the reset token from your email.')
      return
    }
    setActiveStep(2)
    setError('')
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Forgot your password?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(handleSendResetEmail)}>
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
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || loading}
                startIcon={<Send />}
                sx={{ mb: 3, py: 1.5 }}
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
            </form>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Check your email
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                We've sent password reset instructions to:
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                {email}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Didn't receive the email?</strong>
                <br />
                • Check your spam/junk folder
                <br />
                • Make sure you entered the correct email address
                <br />
                • Wait a few minutes and check again
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Reset Token"
              placeholder="Enter the token from your email"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleTokenSubmit}
              disabled={!resetToken.trim()}
              sx={{ mb: 2, py: 1.5 }}
            >
              Verify Token
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(0)}
              sx={{ mb: 2 }}
            >
              Resend Email
            </Button>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Lock sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Reset your password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a strong password for your account.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(handleResetPassword)}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
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
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                margin="normal"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match'
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || loading}
                sx={{ mb: 3, py: 1.5 }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Box>
        )

      default:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Password Reset Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Box>
        )
    }
  }

  if (loading && activeStep === 0) {
    return <LoadingSpinner text="Sending reset email..." overlay />
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
      <Grid container maxWidth="lg">
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
              Need Help?
            </Typography>
            <Typography variant="h6" align="center" sx={{ opacity: 0.9, mb: 4 }}>
              We're here to help you get back to learning
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                Password reset is simple and secure:
              </Typography>
              <Box sx={{ textAlign: 'left', maxWidth: 300 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  📧 Enter your email address
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  🔐 Check your inbox for instructions
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  ✨ Create a new secure password
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  🎯 Get back to learning!
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Side - Reset Form */}
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
                  Password Reset
                </Typography>
              </Box>

              {/* Stepper */}
              {activeStep < 3 && (
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel />
                    </Step>
                  ))}
                </Stepper>
              )}

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              {/* Step Content */}
              {renderStepContent()}

              {/* Back to Login */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  component={Link}
                  to="/login"
                  startIcon={<ArrowBack />}
                  color="inherit"
                >
                  Back to Login
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ForgotPassword
