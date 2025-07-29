import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  School,
  Phone,
  ArrowBack,
  ArrowForward,
  Google,
  Facebook,
  GitHub
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { useAuth } from '@context/AuthContext'
import LoadingSpinner from '@components/common/LoadingSpinner'

const steps = ['Account Type', 'Personal Info', 'Account Details']

const Register = () => {
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()
  
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [registerError, setRegisterError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    getValues
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      institution: '',
      class: '',
      subject: ''
    }
  })

  const password = watch('password')

  const handleNext = async () => {
    const isStepValid = await trigger(getStepFields(activeStep))
    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return []
      case 1:
        return ['firstName', 'lastName', 'email', 'phone']
      case 2:
        return ['password', 'confirmPassword', 'institution']
      default:
        return []
    }
  }

  const onSubmit = async (data) => {
    if (!userRole) {
      toast.error('Please select your role')
      setActiveStep(0)
      return
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions')
      return
    }

    try {
      setRegisterError('')
      const userData = {
        ...data,
        role: userRole,
        name: `${data.firstName} ${data.lastName}`
      }

      const result = await registerUser(userData)
      toast.success('Registration successful! Welcome to the platform.')
      
      // Redirect based on user role
      if (result.user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true })
      } else if (result.user.role === 'student') {
        navigate('/student/dashboard', { replace: true })
      }
    } catch (error) {
      setRegisterError(error.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} registration coming soon!`)
  }

  if (loading) {
    return <LoadingSpinner text="Creating your account..." overlay />
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              Choose Your Role
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Select how you'll be using the platform
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: userRole === 'student' ? 2 : 1,
                    borderColor: userRole === 'student' ? 'primary.main' : 'divider',
                    '&:hover': { elevation: 4 }
                  }}
                  onClick={() => setUserRole('student')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Take quizzes, track progress, and get personalized feedback
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: userRole === 'teacher' ? 2 : 1,
                    borderColor: userRole === 'teacher' ? 'primary.main' : 'divider',
                    '&:hover': { elevation: 4 }
                  }}
                  onClick={() => setUserRole('teacher')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Teacher
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create assessments, manage students, and analyze performance
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              Personal Information
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Tell us about yourself
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
            </Grid>

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
            />

            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              margin="normal"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Invalid phone number'
                }
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              Account Security
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Set up your password and institution details
            </Typography>

            <TextField
              fullWidth
              label="Institution/School Name"
              margin="normal"
              {...register('institution', {
                required: 'Institution name is required'
              })}
              error={!!errors.institution}
              helperText={errors.institution?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {userRole === 'student' && (
              <TextField
                fullWidth
                label="Class/Grade"
                margin="normal"
                {...register('class')}
                placeholder="e.g., 10th Grade, Class XII"
              />
            )}

            {userRole === 'teacher' && (
              <TextField
                fullWidth
                label="Subject Specialization"
                margin="normal"
                {...register('subject')}
                placeholder="e.g., Mathematics, Physics, Chemistry"
              />
            )}

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#1976d2' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" style={{ color: '#1976d2' }}>
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />
          </Box>
        )

      default:
        return 'Unknown step'
    }
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
      <Paper
        elevation={24}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 600,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Join Our Platform
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account and start your learning journey
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {registerError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {registerError}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !userRole || (activeStep === 2 && !acceptTerms)}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={activeStep === 0 && !userRole}
                sx={{ minWidth: 120 }}
              >
                Next
              </Button>
            )}
          </Box>
        </form>

        {/* Social Login (only on first step) */}
        {activeStep === 0 && (
          <>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Or register with
              </Typography>
            </Divider>

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
          </>
        )}

        {/* Login Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none', 
                color: '#1976d2',
                fontWeight: 500
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Register