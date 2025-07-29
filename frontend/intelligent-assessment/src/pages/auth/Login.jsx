import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student',
    rememberMe: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get user type from navigation state
  useEffect(() => {
    const userType = location.state?.userType
    if (userType) {
      setFormData(prev => ({ ...prev, userType }))
    }
    
    // Show success message if coming from registration
    if (location.state?.message) {
      toast.success(location.state.message)
    }
  }, [location.state])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Login successful:', formData)
      
      // Store user data (you can use Redux/Context later)
      const userData = {
        email: formData.email,
        userType: formData.userType,
        name: formData.email.split('@')[0], // Extract name from email for demo
        loginTime: new Date().toISOString()
      }
      
      // Store in localStorage for persistence
      localStorage.setItem('neurolearn-user', JSON.stringify(userData))
      localStorage.setItem('neurolearn-token', 'demo-jwt-token-' + Date.now())
      
      // Show success message
      toast.success(`Welcome back! Redirecting to your ${formData.userType} dashboard...`)
      
      // Small delay to show success message
      setTimeout(() => {
        // Navigate based on user type to respective dashboard
        if (formData.userType === 'student') {
          navigate('/pages/student/studentdashboard', { replace: true })
        } else if (formData.userType === 'teacher') {
          navigate('/pages/teacher/teacherDashboard', { replace: true })
        }
      }, 1000)
      
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: 'Login failed. Please check your credentials.' })
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const loginStyles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '3rem 2rem',
      maxWidth: '450px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logo: {
      fontSize: '2.5rem',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '1rem',
      color: '#718096',
      marginBottom: '1rem'
    },
    userTypeBadge: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '500',
      backgroundColor: formData.userType === 'student' ? '#e3f2fd' : '#e8f5e8',
      color: formData.userType === 'student' ? '#1976d2' : '#2e7d32',
      border: `1px solid ${formData.userType === 'student' ? '#bbdefb' : '#c8e6c9'}`
    },
    form: {
      marginBottom: '2rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#2d3748'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease',
      outline: 'none'
    },
    inputError: {
      borderColor: '#e53e3e'
    },
    errorText: {
      color: '#e53e3e',
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    checkbox: {
      width: '16px',
      height: '16px'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#4a5568'
    },
    button: {
      width: '100%',
      padding: '0.875rem 1rem',
      backgroundColor: '#1976d2',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    links: {
      textAlign: 'center',
      marginTop: '1.5rem'
    },
    link: {
      color: '#4299e1',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    backButton: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '50%',
      transition: 'background-color 0.3s ease'
    }
  }

  return (
    <>
      <Helmet>
        <title>Login - NeuroLearn | Chennai's Intelligent Assessment Platform</title>
        <meta name="description" content="Login to NeuroLearn and access AI-powered assessment tools designed for Chennai students and teachers." />
      </Helmet>

      <div style={loginStyles.container}>
        <div style={loginStyles.card}>
          <button 
            style={loginStyles.backButton}
            onClick={handleBackToHome}
            title="Back to Home"
          >
            ←
          </button>

          <div style={loginStyles.header}>
            <div style={loginStyles.logo}>🧠</div>
            <h1 style={loginStyles.title}>Welcome Back!</h1>
            <p style={loginStyles.subtitle}>Sign in to NeuroLearn</p>
            <div style={loginStyles.userTypeBadge}>
              {formData.userType === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Teacher'} Login
            </div>
          </div>

          <form style={loginStyles.form} onSubmit={handleSubmit}>
            <div style={loginStyles.formGroup}>
              <label style={loginStyles.label} htmlFor="email">
                Email Address
              </label>
              <input
                style={{
                  ...loginStyles.input,
                  ...(errors.email ? loginStyles.inputError : {})
                }}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <div style={loginStyles.errorText}>{errors.email}</div>
              )}
            </div>

            <div style={loginStyles.formGroup}>
              <label style={loginStyles.label} htmlFor="password">
                Password
              </label>
              <input
                style={{
                  ...loginStyles.input,
                  ...(errors.password ? loginStyles.inputError : {})
                }}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <div style={loginStyles.errorText}>{errors.password}</div>
              )}
            </div>

            <div style={loginStyles.checkboxContainer}>
              <input
                style={loginStyles.checkbox}
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label style={loginStyles.checkboxLabel} htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            {errors.submit && (
              <div style={{ ...loginStyles.errorText, textAlign: 'center', marginBottom: '1rem' }}>
                {errors.submit}
              </div>
            )}

            <button
              style={{
                ...loginStyles.button,
                ...(isLoading ? loginStyles.buttonDisabled : {})
              }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Signing In...
                </>
              ) : (
                <>
                  🔑 Sign In to {formData.userType === 'student' ? 'Student' : 'Teacher'} Dashboard
                </>
              )}
            </button>
          </form>

          <div style={loginStyles.links}>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
              Don't have an account?{' '}
              <Link 
                to="/auth/register" 
                state={{ userType: formData.userType }}
                style={loginStyles.link}
              >
                Register here
              </Link>
            </p>
            <Link to="/auth/forgot-password" style={loginStyles.link}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default Login
