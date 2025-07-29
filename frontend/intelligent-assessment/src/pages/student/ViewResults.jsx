import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const ViewStudents = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    class: 'all',
    subject: 'all',
    performance: 'all',
    status: 'all'
  })
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    highPerformers: 0,
    needsAttention: 0
  })
  const [students, setStudents] = useState([])

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('neurolearn-user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchStats()
      fetchStudents()
    } else {
      navigate('/auth/login')
    }
  }, [navigate])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Mock stats for demonstration
      const mockStats = {
        total: 156,
        active: 142,
        inactive: 14,
        highPerformers: 28,
        needsAttention: 12
      }
      setStats(mockStats)
    } catch (err) {
      toast.error('Failed to load student statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      // Mock student data
      const mockStudents = [
        {
          id: 1,
          name: 'Adithya Kumar',
          email: 'adithya.kumar@email.com',
          class: 'Class 12A',
          rollNumber: 'TC001',
          performance: 92,
          status: 'active',
          lastActivity: '2024-01-28',
          quizzesCompleted: 8,
          averageScore: 92
        },
        {
          id: 2,
          name: 'Priya Sharma',
          email: 'priya.sharma@email.com',
          class: 'Class 12A',
          rollNumber: 'TC002',
          performance: 87,
          status: 'active',
          lastActivity: '2024-01-27',
          quizzesCompleted: 7,
          averageScore: 87
        },
        {
          id: 3,
          name: 'Arjun Patel',
          email: 'arjun.patel@email.com',
          class: 'Class 11B',
          rollNumber: 'TC045',
          performance: 45,
          status: 'needs_attention',
          lastActivity: '2024-01-20',
          quizzesCompleted: 3,
          averageScore: 45
        }
      ]
      setStudents(mockStudents)
    } catch (err) {
      toast.error('Failed to load students')
    }
  }

  const handleTabChange = (newValue) => {
    setTabValue(newValue)
    const statusMap = ['all', 'active', 'inactive', 'high_performers', 'needs_attention']
    setFilters(prev => ({
      ...prev,
      status: statusMap[newValue]
    }))
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      toast.success('Student data exported successfully!')
    } catch (err) {
      toast.error('Failed to export student data')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkEmail = () => {
    toast.info('Bulk email feature coming soon!')
  }

  const handleBackToDashboard = () => {
    navigate('/pages/teacher/teacherDashboard')
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return '#4caf50'
    if (score >= 70) return '#2196f3'
    if (score >= 50) return '#ff9800'
    return '#f44336'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50'
      case 'inactive': return '#757575'
      case 'needs_attention': return '#f44336'
      default: return '#2196f3'
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = !filters.search || 
      student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.email.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesClass = filters.class === 'all' || student.class === filters.class
    const matchesStatus = filters.status === 'all' || student.status === filters.status
    
    let matchesPerformance = true
    if (filters.performance !== 'all') {
      switch (filters.performance) {
        case 'excellent':
          matchesPerformance = student.performance >= 90
          break
        case 'good':
          matchesPerformance = student.performance >= 70 && student.performance < 90
          break
        case 'average':
          matchesPerformance = student.performance >= 50 && student.performance < 70
          break
        case 'needs_improvement':
          matchesPerformance = student.performance < 50
          break
      }
    }

    return matchesSearch && matchesClass && matchesStatus && matchesPerformance
  })

  const studentStyles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 25%, #764ba2 75%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '2rem'
    },
    header: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem 2rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#2d3748',
      margin: 0
    },
    backButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#4299e1',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#718096'
    },
    filtersContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '0.875rem'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    button: {
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease'
    },
    primaryButton: {
      backgroundColor: '#2e7d32',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#e2e8f0',
      color: '#2d3748'
    },
    tabContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      marginBottom: '2rem',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    tabButtons: {
      display: 'flex',
      overflowX: 'auto'
    },
    tabButton: {
      padding: '1rem 1.5rem',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderBottom: '3px solid transparent',
      whiteSpace: 'nowrap'
    },
    activeTab: {
      borderBottomColor: '#2e7d32',
      backgroundColor: '#f0f9ff',
      color: '#2e7d32'
    },
    studentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    studentCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease'
    },
    studentHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    studentAvatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#4299e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '1.2rem',
      marginRight: '1rem'
    },
    studentName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.25rem'
    },
    studentEmail: {
      fontSize: '0.875rem',
      color: '#718096'
    },
    studentMeta: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    performanceBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '0.5rem'
    },
    performanceFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    }
  }

  if (!user) {
    return (
      <div style={studentStyles.container}>
        <div style={{ textAlign: 'center', color: 'white', paddingTop: '4rem' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Manage Students - NeuroLearn | {user.name}</title>
        <meta name="description" content="View and manage your students' performance, track progress, and analyze class statistics." />
      </Helmet>

      <div style={studentStyles.container}>
        {/* Header */}
        <div style={studentStyles.header}>
          <h1 style={studentStyles.title}>Manage Students</h1>
          <button style={studentStyles.backButton} onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={studentStyles.content}>
          {/* Stats Grid */}
          <div style={studentStyles.statsGrid}>
            <div style={studentStyles.statCard}>
              <div style={studentStyles.statNumber}>{stats.total}</div>
              <div style={studentStyles.statLabel}>Total Students</div>
            </div>
            <div style={studentStyles.statCard}>
              <div style={studentStyles.statNumber}>{stats.active}</div>
              <div style={studentStyles.statLabel}>Active Students</div>
            </div>
            <div style={studentStyles.statCard}>
              <div style={studentStyles.statNumber}>{stats.highPerformers}</div>
              <div style={studentStyles.statLabel}>High Performers</div>
            </div>
            <div style={studentStyles.statCard}>
              <div style={studentStyles.statNumber}>{stats.needsAttention}</div>
              <div style={studentStyles.statLabel}>Needs Attention</div>
            </div>
            <div style={studentStyles.statCard}>
              <div style={studentStyles.statNumber}>{stats.inactive}</div>
              <div style={studentStyles.statLabel}>Inactive Students</div>
            </div>
          </div>

          {/* Filters */}
          <div style={studentStyles.filtersContainer}>
            <div style={studentStyles.filterGrid}>
              <input
                style={studentStyles.input}
                type="text"
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />

              <select
                style={studentStyles.select}
                value={filters.class}
                onChange={(e) => handleFilterChange('class', e.target.value)}
              >
                <option value="all">All Classes</option>
                <option value="Class 10A">Class 10A</option>
                <option value="Class 10B">Class 10B</option>
                <option value="Class 11A">Class 11A</option>
                <option value="Class 11B">Class 11B</option>
                <option value="Class 12A">Class 12A</option>
                <option value="Class 12B">Class 12B</option>
              </select>

              <select
                style={studentStyles.select}
                value={filters.performance}
                onChange={(e) => handleFilterChange('performance', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="excellent">Excellent (90+)</option>
                <option value="good">Good (70-89)</option>
                <option value="average">Average (50-69)</option>
                <option value="needs_improvement">Needs Improvement (&lt;50)</option>
              </select>
            </div>

            <div style={studentStyles.buttonGroup}>
              <button
                style={{ ...studentStyles.button, ...studentStyles.primaryButton }}
                onClick={handleBulkEmail}
              >
                📧 Bulk Email
              </button>
              <button
                style={{ ...studentStyles.button, ...studentStyles.primaryButton }}
                onClick={handleExportData}
                disabled={loading}
              >
                📄 Export Data
              </button>
              <button
                style={{ ...studentStyles.button, ...studentStyles.secondaryButton }}
                onClick={() => {
                  setFilters({
                    search: '',
                    class: 'all',
                    subject: 'all',
                    performance: 'all',
                    status: 'all'
                  })
                  setTabValue(0)
                }}
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div style={studentStyles.tabContainer}>
            <div style={studentStyles.tabButtons}>
              {['All Students', 'Active', 'Inactive', 'High Performers', 'Needs Attention'].map((tab, index) => (
                <button
                  key={index}
                  style={{
                    ...studentStyles.tabButton,
                    ...(tabValue === index ? studentStyles.activeTab : {})
                  }}
                  onClick={() => handleTabChange(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Students Grid */}
          <div style={studentStyles.studentsGrid}>
            {filteredStudents.map((student) => (
              <div 
                key={student.id} 
                style={studentStyles.studentCard}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={studentStyles.studentHeader}>
                  <div style={studentStyles.studentAvatar}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={studentStyles.studentName}>{student.name}</div>
                    <div style={studentStyles.studentEmail}>{student.email}</div>
                  </div>
                </div>

                <div style={studentStyles.studentMeta}>
                  <span><strong>Class:</strong> {student.class}</span>
                  <span><strong>Roll:</strong> {student.rollNumber}</span>
                  <span><strong>Quizzes:</strong> {student.quizzesCompleted}</span>
                  <span><strong>Last Active:</strong> {new Date(student.lastActivity).toLocaleDateString()}</span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Performance</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: getPerformanceColor(student.performance) }}>
                      {student.performance}%
                    </span>
                  </div>
                  <div style={studentStyles.performanceBar}>
                    <div 
                      style={{
                        ...studentStyles.performanceFill,
                        width: `${student.performance}%`,
                        backgroundColor: getPerformanceColor(student.performance)
                      }}
                    />
                  </div>
                </div>

                <div style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: getStatusColor(student.status)
                }}>
                  {student.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredStudents.length === 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>No students found</h3>
              <p style={{ color: '#718096' }}>Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ViewStudents
