import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    institution: '',
    grade: '',
    subject: '',
    agreeTerms: false
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
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
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution is required'
    }
    
    if (formData.userType === 'student' && !formData.grade) {
      newErrors.grade = 'Grade is required for students'
    }
    
    if (formData.userType === 'teacher' && !formData.subject.trim()) {
      newErrors.subject = 'Subject is required for teachers'
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions'
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
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Registration successful:', formData)
      
      // Store user data (you can use Redux/Context later)
      const userData = {
        name: formData.name,
        email: formData.email,
        userType: formData.userType,
        institution: formData.institution,
        grade: formData.grade,
        subject: formData.subject,
        registrationTime: new Date().toISOString()
      }
      
      // Store in localStorage for persistence
      localStorage.setItem('neurolearn-user', JSON.stringify(userData))
      localStorage.setItem('neurolearn-token', 'demo-jwt-token-' + Date.now())
      
      // Show success message
      toast.success(`Account created successfully! Welcome to NeuroLearn, ${formData.name}!`)
      
      // Small delay to show success message
      setTimeout(() => {
        // Navigate directly to respective dashboard after registration
        if (formData.userType === 'student') {
          navigate('/pages/student/studentdashboard', { replace: true })
        } else if (formData.userType === 'teacher') {
          navigate('/pages/teacher/teacherDashboard', { replace: true })
        }
      }, 1500)
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'Registration failed. Please try again.' })
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const registerStyles = {
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
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      maxHeight: '90vh',
      overflowY: 'auto'
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
      marginBottom: '1.5rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
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
    select: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      backgroundColor: 'white'
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
      alignItems: 'flex-start',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      marginTop: '2px'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#4a5568',
      lineHeight: '1.4'
    },
    button: {
      width: '100%',
      padding: '0.875rem 1rem',
      backgroundColor: '#2e7d32',
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

  const grades = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12', 'Undergraduate', 'Postgraduate'
  ]

  return (
    <>
      <Helmet>
        <title>Register - NeuroLearn | Join Chennai's Smart Learning Platform</title>
        <meta name="description" content="Register for NeuroLearn and join thousands of Chennai students and teachers using AI-powered assessment tools." />
      </Helmet>

      <div style={registerStyles.container}>
        <div style={registerStyles.card}>
          <button 
            style={registerStyles.backButton}
            onClick={handleBackToHome}
            title="Back to Home"
          >
            ←
          </button>

          <div style={registerStyles.header}>
            <div style={registerStyles.logo}>🧠</div>
            <h1 style={registerStyles.title}>Join NeuroLearn!</h1>
            <p style={registerStyles.subtitle}>Create your account</p>
            <div style={registerStyles.userTypeBadge}>
              {formData.userType === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Teacher'} Registration
            </div>
          </div>

          <form style={registerStyles.form} onSubmit={handleSubmit}>
            <div style={registerStyles.formGroup}>
              <label style={registerStyles.label} htmlFor="name">
                Full Name *
              </label>
              <input
                style={{
                  ...registerStyles.input,
                  ...(errors.name ? registerStyles.inputError : {})
                }}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.name && (
                <div style={registerStyles.errorText}>{errors.name}</div>
              )}
            </div>

            <div style={registerStyles.formGroup}>
              <label style={registerStyles.label} htmlFor="email">
                Email Address *
              </label>
              <input
                style={{
                  ...registerStyles.input,
                  ...(errors.email ? registerStyles.inputError : {})
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
                <div style={registerStyles.errorText}>{errors.email}</div>
              )}
            </div>

            <div style={registerStyles.formRow}>
              <div>
                <label style={registerStyles.label} htmlFor="password">
                  Password *
                </label>
                <input
                  style={{
                    ...registerStyles.input,
                    ...(errors.password ? registerStyles.inputError : {})
                  }}
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <div style={registerStyles.errorText}>{errors.password}</div>
                )}
              </div>

              <div>
                <label style={registerStyles.label} htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <input
                  style={{
                    ...registerStyles.input,
                    ...(errors.confirmPassword ? registerStyles.inputError : {})
                  }}
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <div style={registerStyles.errorText}>{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            <div style={registerStyles.formGroup}>
              <label style={registerStyles.label} htmlFor="institution">
                Institution/School *
              </label>
              <input
                style={{
                  ...registerStyles.input,
                  ...(errors.institution ? registerStyles.inputError : {})
                }}
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                placeholder="Enter your school/college name"
                disabled={isLoading}
              />
              {errors.institution && (
                <div style={registerStyles.errorText}>{errors.institution}</div>
              )}
            </div>

            {formData.userType === 'student' ? (
              <div style={registerStyles.formGroup}>
                <label style={registerStyles.label} htmlFor="grade">
                  Grade/Class *
                </label>
                <select
                  style={{
                    ...registerStyles.select,
                    ...(errors.grade ? registerStyles.inputError : {})
                  }}
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select your grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && (
                  <div style={registerStyles.errorText}>{errors.grade}</div>
                )}
              </div>
            ) : (
              <div style={registerStyles.formGroup}>
                <label style={registerStyles.label} htmlFor="subject">
                  Subject Specialization *
                </label>
                <input
                  style={{
                    ...registerStyles.input,
                    ...(errors.subject ? registerStyles.inputError : {})
                  }}
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Science, English"
                  disabled={isLoading}
                />
                {errors.subject && (
                  <div style={registerStyles.errorText}>{errors.subject}</div>
                )}
              </div>
            )}

            <div style={registerStyles.checkboxContainer}>
              <input
                style={{
                  ...registerStyles.checkbox,
                  ...(errors.agreeTerms ? { outline: '2px solid #e53e3e' } : {})
                }}
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label style={registerStyles.checkboxLabel} htmlFor="agreeTerms">
                I agree to the{' '}
                <Link to="/terms" style={registerStyles.link}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" style={registerStyles.link}>
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <div style={{ ...registerStyles.errorText, marginTop: '-1rem', marginBottom: '1rem' }}>
                {errors.agreeTerms}
              </div>
            )}

            {errors.submit && (
              <div style={{ ...registerStyles.errorText, textAlign: 'center', marginBottom: '1rem' }}>
                {errors.submit}
              </div>
            )}

            <button
              style={{
                ...registerStyles.button,
                ...(isLoading ? registerStyles.buttonDisabled : {})
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
                  Creating Account...
                </>
              ) : (
                <>
                  📝 Create {formData.userType === 'student' ? 'Student' : 'Teacher'} Account
                </>
              )}
            </button>
          </form>

          <div style={registerStyles.links}>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                state={{ userType: formData.userType }}
                style={registerStyles.link}
              >
                Login here
              </Link>
            </p>
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

export default Register
