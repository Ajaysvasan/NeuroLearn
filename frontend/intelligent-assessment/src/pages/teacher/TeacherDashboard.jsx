import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

const TeacherDashboard = () => {
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

  // Format time for Chennai (IST)
  const formatTime = (date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }


  const dashboardStyles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7c3aed 25%, #4f46e5 75%)',
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
      color: 'linear-gradient(125deg, #920606 100%, #02060b 0%)'
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
      backgroundColor: '#02060b',
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
        <title>Teacher Dashboard - NeuroLearn | {user.name}</title>
        <meta name="description" content="Welcome to your NeuroLearn teacher dashboard. Create quizzes, manage students, and track class performance." />
      </Helmet>

      <div style={dashboardStyles.container}>
        {/* Header */}
        <header style={dashboardStyles.header}>
          <div style={dashboardStyles.logo}>
            <span>NeuroLearn</span>
          </div>
          
          <div style={dashboardStyles.userInfo}>
            <div style={dashboardStyles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={dashboardStyles.userName}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>Teacher</div>
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
              Welcome back, Prof. {user.name}! 👨‍🏫
            </h1>
            <p style={dashboardStyles.welcomeSubtitle}>
              Ready to inspire and educate your students at {user.institution}?
            </p>
            
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '1rem', 
              borderRadius: '8px',
              color: '#2e7d32',
              fontWeight: '500'
            }}>
              📚 Subject: {user.subject} • 🏫 {user.institution}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={dashboardStyles.statsGrid}>
            <div 
              style={dashboardStyles.statCard}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={dashboardStyles.statIcon}>👥</div>
              <div style={dashboardStyles.statNumber}>45</div>
              <div style={dashboardStyles.statLabel}>Active Students</div>
            </div>
            
            <div 
              style={dashboardStyles.statCard}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={dashboardStyles.statIcon}>📝</div>
              <div style={dashboardStyles.statNumber}>12</div>
              <div style={dashboardStyles.statLabel}>Quizzes Created</div>
            </div>
            
            <div 
              style={dashboardStyles.statCard}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={dashboardStyles.statIcon}>📊</div>
              <div style={dashboardStyles.statNumber}>78%</div>
              <div style={dashboardStyles.statLabel}>Class Average</div>
            </div>
            
            <div 
              style={dashboardStyles.statCard}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={dashboardStyles.statIcon}>🎯</div>
              <div style={dashboardStyles.statNumber}>156</div>
              <div style={dashboardStyles.statLabel}>Total Assessments</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={dashboardStyles.actionsGrid}>
            <button 
              style={dashboardStyles.actionButton}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>➕</div>
              <div style={dashboardStyles.actionTitle}>Create Quiz</div>
              <div style={dashboardStyles.actionDesc}>Design new assessments</div>
            </button>
            
            <button 
              style={dashboardStyles.actionButton}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>👥</div>
              <div style={dashboardStyles.actionTitle}>Manage Students</div>
              <div style={dashboardStyles.actionDesc}>View student progress</div>
            </button>
            
            <button 
              style={dashboardStyles.actionButton}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>📈</div>
              <div style={dashboardStyles.actionTitle}>Analytics</div>
              <div style={dashboardStyles.actionDesc}>View detailed reports</div>
            </button>
            
            <button 
              style={dashboardStyles.actionButton}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>🤖</div>
              <div style={dashboardStyles.actionTitle}>AI Assistant</div>
              <div style={dashboardStyles.actionDesc}>Generate questions with AI</div>
            </button>
            
            <button 
              style={dashboardStyles.actionButton}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>📚</div>
              <div style={dashboardStyles.actionTitle}>Question Bank</div>
              <div style={dashboardStyles.actionDesc}>Browse question library</div>
            </button>
            
            <button 
              style={dashboardStyles.actionButton}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={dashboardStyles.actionIcon}>⚙️</div>
              <div style={dashboardStyles.actionTitle}>Settings</div>
              <div style={dashboardStyles.actionDesc}>Configure preferences</div>
            </button>
          </div>
        </main>
      </div>
    </>
  )
}

export default TeacherDashboard
