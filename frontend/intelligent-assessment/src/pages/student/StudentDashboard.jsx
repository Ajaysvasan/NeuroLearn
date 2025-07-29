import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

const StudentDashboard = () => {
  const [user, setUser] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('neurolearn-user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      // Redirect to login if no user data
      navigate('/auth/login')
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('neurolearn-user')
    localStorage.removeItem('neurolearn-token')
    navigate('/', { replace: true })
  }

  // Navigation handlers
  const handleTakeQuiz = () => {
    navigate('/pages/student/takequiz')
  }

  const handleViewResults = () => {
    navigate('/pages/student/results')
  }

  const handleViewProgress = () => {
    // You can add progress page later
    console.log('Navigate to progress page')
  }

  const handleViewAchievements = () => {
    // You can add achievements page later
    console.log('Navigate to achievements page')
  }

  const handlePracticeMode = () => {
    // You can add practice mode later
    console.log('Navigate to practice mode')
  }

  const handleSettings = () => {
    // You can add settings page later
    console.log('Navigate to settings')
  }

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

  const dashboardStyles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    header: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#2d3748'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#4299e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '1.2rem'
    },
    userName: {
      fontWeight: '500',
      color: '#2d3748'
    },
    logoutButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#e53e3e',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    content: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    welcomeCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },
    welcomeTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    welcomeSubtitle: {
      fontSize: '1.1rem',
      color: '#718096',
      marginBottom: '1rem'
    },
    timeDisplay: {
      backgroundColor: '#f7fafc',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem'
    },
    time: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2d3748'
    },
    date: {
      fontSize: '0.9rem',
      color: '#718096'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      textAlign: 'center',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    },
    statIcon: {
      fontSize: '2.5rem',
      marginBottom: '1rem'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#718096',
      fontWeight: '500'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    actionButton: {
      backgroundColor: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '1.5rem',
      cursor: 'pointer',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      color: 'inherit'
    },
    actionIcon: {
      fontSize: '2rem',
      marginBottom: '1rem'
    },
    actionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    actionDesc: {
      fontSize: '0.9rem',
      color: '#718096'
    }
  }

  if (!user) {
    return (
      <div style={dashboardStyles.container}>
        <div style={{ ...dashboardStyles.content, textAlign: 'center', color: 'white' }}>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Student Dashboard - NeuroLearn | {user.name}</title>
        <meta name="description" content="Welcome to your NeuroLearn student dashboard. Access quizzes, track progress, and enhance your learning." />
      </Helmet>

      <div style={dashboardStyles.container}>
        {/* Header */}
        <header style={dashboardStyles.header}>
          <div style={dashboardStyles.logo}>
            <span></span>
            <span>NeuroLearn</span>
          </div>
          
          <div style={dashboardStyles.userInfo}>
            <div style={dashboardStyles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={dashboardStyles.userName}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>Student</div>
            </div>
            <button style={dashboardStyles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={dashboardStyles.content}>
          {/* Welcome Card */}
          <div style={dashboardStyles.welcomeCard}>
            <h1 style={dashboardStyles.welcomeTitle}>
              Welcome back, {user.name}! 🎓
            </h1>
          </div>

          {/* Stats Grid */}
          <div style={dashboardStyles.statsGrid}>
          </div>

          {/* Action Buttons */}
          <div style={dashboardStyles.actionsGrid}>
            <button 
              style={dashboardStyles.actionButton}
              onClick={handleTakeQuiz}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>📝</div>
              <div style={dashboardStyles.actionTitle}>Take Quiz</div>
              <div style={dashboardStyles.actionDesc}>Start a new assessment</div>
            </button>
            
            <button 
              style={dashboardStyles.actionButton}
              onClick={handleViewResults}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>📊</div>
              <div style={dashboardStyles.actionTitle}>View Results</div>
              <div style={dashboardStyles.actionDesc}>Check your quiz results</div>
            </button>
          </div>
        </main>
      </div>
    </>
  )
}

export default StudentDashboard
