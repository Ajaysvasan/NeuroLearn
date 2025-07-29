import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'

const TakeQuiz = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const [user, setUser] = useState(null)
  const [availableQuizzes, setAvailableQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('neurolearn-user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      navigate('/auth/login')
      return
    }

    // Load available quizzes
    loadAvailableQuizzes()
  }, [navigate])

  const loadAvailableQuizzes = () => {
    // Mock data for available quizzes
    const mockQuizzes = [
      {
        id: 1,
        title: 'Mathematics - Algebra Basics',
        subject: 'Mathematics',
        duration: 30,
        questions: 15,
        difficulty: 'Medium',
        dueDate: '2024-02-15',
        description: 'Test your understanding of algebraic expressions and equations.'
      },
      {
        id: 2,
        title: 'Physics - Motion and Forces',
        subject: 'Physics',
        duration: 45,
        questions: 20,
        difficulty: 'Hard',
        dueDate: '2024-02-18',
        description: 'Comprehensive quiz on mechanics and Newton\'s laws.'
      },
      {
        id: 3,
        title: 'Chemistry - Organic Compounds',
        subject: 'Chemistry',
        duration: 25,
        questions: 12,
        difficulty: 'Easy',
        dueDate: '2024-02-20',
        description: 'Basic concepts of organic chemistry and compounds.'
      }
    ]

    setAvailableQuizzes(mockQuizzes)
    
    // If quizId is provided, select that quiz
    if (quizId) {
      const quiz = mockQuizzes.find(q => q.id === parseInt(quizId))
      setSelectedQuiz(quiz)
    }
    
    setLoading(false)
  }

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    // You can implement the actual quiz interface here
    console.log('Starting quiz:', quiz.title)
  }

  const handleBackToDashboard = () => {
    navigate('/pages/student/studentdashboard')
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4caf50'
      case 'Medium': return '#ff9800'
      case 'Hard': return '#f44336'
      default: return '#757575'
    }
  }

  const quizStyles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      maxWidth: '1000px',
      margin: '0 auto'
    },
    quizzesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    quizCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    quizTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    quizSubject: {
      fontSize: '0.9rem',
      color: '#4299e1',
      fontWeight: '500',
      marginBottom: '1rem'
    },
    quizDescription: {
      fontSize: '0.9rem',
      color: '#718096',
      marginBottom: '1rem',
      lineHeight: '1.4'
    },
    quizMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      fontSize: '0.85rem',
      color: '#718096'
    },
    difficultyBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '500',
      color: 'white'
    },
    startButton: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: '#48bb78',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease'
    },
    selectedQuizContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }
  }

  if (loading) {
    return (
      <div style={quizStyles.container}>
        <div style={{ textAlign: 'center', color: 'white', paddingTop: '4rem' }}>
          <h2>Loading Quizzes...</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Take Quiz - NeuroLearn | {user?.name}</title>
        <meta name="description" content="Take your assigned quizzes and test your knowledge with NeuroLearn's intelligent assessment system." />
      </Helmet>

      <div style={quizStyles.container}>
        {/* Header */}
        <div style={quizStyles.header}>
          <h1 style={quizStyles.title}>
            {selectedQuiz ? `Quiz: ${selectedQuiz.title}` : 'Available Quizzes'}
          </h1>
          <button style={quizStyles.backButton} onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={quizStyles.content}>
          {!selectedQuiz ? (
            // Show available quizzes
            <>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#718096', margin: 0 }}>
                  Welcome {user?.name}! Here are your available quizzes. Click on any quiz to start.
                </p>
              </div>

              <div style={quizStyles.quizzesGrid}>
                {availableQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    style={quizStyles.quizCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <div style={quizStyles.quizTitle}>{quiz.title}</div>
                    <div style={quizStyles.quizSubject}>{quiz.subject}</div>
                    <div style={quizStyles.quizDescription}>{quiz.description}</div>
                    
                    <div style={quizStyles.quizMeta}>
                      <span>⏱️ {quiz.duration} min</span>
                      <span>📝 {quiz.questions} questions</span>
                      <span 
                        style={{
                          ...quizStyles.difficultyBadge,
                          backgroundColor: getDifficultyColor(quiz.difficulty)
                        }}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: '#e53e3e', marginBottom: '1rem' }}>
                      📅 Due: {new Date(quiz.dueDate).toLocaleDateString()}
                    </div>
                    
                    <button 
                      style={quizStyles.startButton}
                      onClick={() => handleStartQuiz(quiz)}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#38a169'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#48bb78'}
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Show selected quiz start screen
            <div style={quizStyles.selectedQuizContainer}>
              <h2 style={{ color: '#2d3748', marginBottom: '1rem' }}>
                Ready to start: {selectedQuiz.title}?
              </h2>
              <p style={{ color: '#718096', marginBottom: '2rem' }}>
                {selectedQuiz.description}
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748' }}>
                    {selectedQuiz.duration}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>Minutes</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748' }}>
                    {selectedQuiz.questions}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>Questions</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: getDifficultyColor(selectedQuiz.difficulty) }}>
                    {selectedQuiz.difficulty}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>Difficulty</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#e2e8f0',
                    color: '#2d3748',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onClick={() => setSelectedQuiz(null)}
                >
                  Back to Quizzes
                </button>
                <button 
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onClick={() => {
                    // This is where you would implement the actual quiz interface
                    console.log('Starting quiz interface for:', selectedQuiz.title)
                    alert(`Starting ${selectedQuiz.title}! (Quiz interface would load here)`)
                  }}
                >
                  Begin Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TakeQuiz
