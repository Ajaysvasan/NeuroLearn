import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedUserType, setSelectedUserType] = useState('')
  const navigate = useNavigate()

  // Update time every minute (Chennai IST)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Format time for Chennai (IST)
  const formatTime = (date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Handle authentication navigation
  const handleLogin = () => {
    navigate('/auth/login', { 
      state: { userType: selectedUserType }
    })
  }

  const handleRegister = () => {
    navigate('/auth/register', { 
      state: { userType: selectedUserType }
    })
  }

  const homeStyles = {
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
      maxWidth: '650px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    cardBefore: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
    },
    logo: {
      fontSize: '4rem',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#718096',
      marginBottom: '2rem',
      fontWeight: '400'
    },
    location: {
      fontSize: '1rem',
      color: '#e53e3e',
      marginBottom: '2rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    timeSection: {
      backgroundColor: '#f7fafc',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      border: '1px solid #e2e8f0'
    },
    time: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    date: {
      fontSize: '1rem',
      color: '#718096'
    },
    sectionTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '1rem'
    },
    userTypeSection: {
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: '#f7fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: '1.5rem'
    },
    button: {
      padding: '0.75rem 1.5rem',
      border: '2px solid transparent',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '140px'
    },
    studentButton: {
      backgroundColor: selectedUserType === 'student' ? '#4299e1' : '#f7fafc',
      color: selectedUserType === 'student' ? 'white' : '#4299e1',
      borderColor: '#4299e1'
    },
    teacherButton: {
      backgroundColor: selectedUserType === 'teacher' ? '#48bb78' : '#f7fafc',
      color: selectedUserType === 'teacher' ? 'white' : '#48bb78',
      borderColor: '#48bb78'
    },
    authSection: {
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: selectedUserType ? '#edf2f7' : '#f7fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      opacity: selectedUserType ? 1 : 0.6,
      transition: 'all 0.3s ease'
    },
    authButtonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    authButton: {
      padding: '0.875rem 2rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: selectedUserType ? 'pointer' : 'not-allowed',
      transition: 'all 0.3s ease',
      minWidth: '120px',
      opacity: selectedUserType ? 1 : 0.5
    },
    loginButton: {
      backgroundColor: '#1976d2',
      color: 'white',
    },
    registerButton: {
      backgroundColor: '#2d3748',
      color: 'white',
    },
    orDivider: {
      margin: '1rem 0',
      position: 'relative',
      textAlign: 'center',
      color: '#718096',
      fontSize: '0.9rem'
    },
    orLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      backgroundColor: '#e2e8f0',
      zIndex: 1
    },
    orText: {
      backgroundColor: 'white',
      padding: '0 1rem',
      position: 'relative',
      zIndex: 2
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '2rem'
    },
    feature: {
      padding: '1rem',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    featureIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    featureTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.25rem'
    },
    featureDesc: {
      fontSize: '0.8rem',
      color: '#718096'
    },
    footer: {
      marginTop: '2rem',
      padding: '1rem',
      borderTop: '1px solid #e2e8f0',
      fontSize: '0.875rem',
      color: '#718096'
    },
    helpText: {
      fontSize: '0.85rem',
      color: '#718096',
      marginTop: '0.5rem',
      fontStyle: 'italic'
    }
  }

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type)
  }

  return (
    <>
      <Helmet>
        <title>NeuroLearn - Intelligent Assessment Platform | Chennai</title>
        <meta name="description" content="AI-powered assessment platform designed for Chennai students and teachers. Start your intelligent learning journey today." />
        <meta name="keywords" content="education, assessment, AI, Chennai, Tamil Nadu, learning, quiz, students, teachers" />
        <meta property="og:title" content="NeuroLearn - Chennai's Smart Education Platform" />
        <meta property="og:description" content="Transform education with AI-powered assessments in Chennai" />
      </Helmet>

      <div style={homeStyles.container}>
        <div style={homeStyles.card}>
          {/* Indian flag colors top border */}
          <div style={homeStyles.cardBefore}></div>
          
          <div style={homeStyles.logo}>🧠</div>
          
          <h1 style={homeStyles.title}>NeuroLearn</h1>
          <p style={homeStyles.subtitle}>
            Intelligent Assessment Platform
          </p>
          
          <div style={homeStyles.location}>
            <span>📍</span>
            <span>Chennai, Tamil Nadu, India</span>
          </div>

          {/* Current Time Display */}
          <div style={homeStyles.timeSection}>
            <div style={homeStyles.time}>
              {formatTime(currentTime)}
            </div>
            <div style={homeStyles.date}>
              {formatDate(currentTime)}
            </div>
          </div>

          {/* User Type Selection */}
          <div style={homeStyles.userTypeSection}>
            <div style={homeStyles.sectionTitle}>Choose Your Role</div>
            <div style={homeStyles.buttonContainer}>
              <button
                style={{
                  ...homeStyles.button,
                  ...homeStyles.studentButton,
                  transform: selectedUserType === 'student' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedUserType === 'student' ? '0 4px 12px rgba(66, 153, 225, 0.3)' : 'none'
                }}
                onClick={() => handleUserTypeSelect('student')}
              >
                👨‍🎓 I'm a Student
              </button>
              <button
                style={{
                  ...homeStyles.button,
                  ...homeStyles.teacherButton,
                  transform: selectedUserType === 'teacher' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedUserType === 'teacher' ? '0 4px 12px rgba(72, 187, 120, 0.3)' : 'none'
                }}
                onClick={() => handleUserTypeSelect('teacher')}
              >
                👨‍🏫 I'm a Teacher
              </button>
            </div>
            {!selectedUserType && (
              <div style={homeStyles.helpText}>
                Please select your role to continue
              </div>
            )}
          </div>

          {/* Authentication Section */}
          <div style={homeStyles.authSection}>
            <div style={homeStyles.sectionTitle}>
              {selectedUserType ? `Welcome, ${selectedUserType}!` : 'Authentication'}
            </div>
            
            <div style={homeStyles.authButtonContainer}>
              <button
                style={{
                  ...homeStyles.authButton,
                  ...homeStyles.loginButton,
                  ...(selectedUserType && {
                    transform: 'scale(1)',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                  })
                }}
                onClick={handleLogin}
                disabled={!selectedUserType}
                onMouseOver={(e) => {
                  if (selectedUserType) {
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = '0 4px 15px rgba(25, 118, 210, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedUserType) {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.3)'
                  }
                }}
              >
                🔑 Login
              </button>
              
              <div style={homeStyles.orDivider}>
                <div style={homeStyles.orLine}></div>
                <span style={homeStyles.orText}>or</span>
              </div>
              
              <button
                style={{
                  ...homeStyles.authButton,
                  ...homeStyles.registerButton,
                  ...(selectedUserType && {
                    transform: 'scale(1)',
                    boxShadow: '0 2px 8px rgba(45, 55, 72, 0.3)'
                  })
                }}
                onClick={handleRegister}
                disabled={!selectedUserType}
                onMouseOver={(e) => {
                  if (selectedUserType) {
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = '0 4px 15px rgba(45, 55, 72, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedUserType) {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = '0 2px 8px rgba(45, 55, 72, 0.3)'
                  }
                }}
              >
                📝 Register
              </button>
            </div>
            
            {selectedUserType && (
              <div style={homeStyles.helpText}>
                {selectedUserType === 'student' 
                  ? 'Join thousands of Chennai students already learning with AI!' 
                  : 'Empower your teaching with intelligent assessment tools!'
                }
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div style={homeStyles.features}>
            <div style={homeStyles.feature}>
              <div style={homeStyles.featureIcon}>🤖</div>
              <div style={homeStyles.featureTitle}>AI-Powered</div>
              <div style={homeStyles.featureDesc}>Smart question generation</div>
            </div>
            <div style={homeStyles.feature}>
              <div style={homeStyles.featureIcon}>📱</div>
              <div style={homeStyles.featureTitle}>Mobile Ready</div>
              <div style={homeStyles.featureDesc}>Works on all devices</div>
            </div>
            <div style={homeStyles.feature}>
              <div style={homeStyles.featureIcon}>🇮🇳</div>
              <div style={homeStyles.featureTitle}>Made for India</div>
              <div style={homeStyles.featureDesc}>CBSE & State boards</div>
            </div>
            <div style={homeStyles.feature}>
              <div style={homeStyles.featureIcon}>⚡</div>
              <div style={homeStyles.featureTitle}>Fast & Offline</div>
              <div style={homeStyles.featureDesc}>Works without internet</div>
            </div>
          </div>

          {/* Footer */}
          <div style={homeStyles.footer}>
            <p>🎓 Empowering Chennai's Educational Excellence</p>
            <p>Built with ❤️ for Indian Students & Teachers</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
