import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { teacherService } from '../../services/teacher.service'

const ManageQuestions = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [syllabi, setSyllabi] = useState([])
  const [selectedSyllabus, setSelectedSyllabus] = useState('')
  const [questions, setQuestions] = useState([])
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [filters, setFilters] = useState({
    difficulty: 'all',
    type: 'all',
    status: 'all',
    search: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'mcq',
    difficulty: 'medium',
    subject: '',
    topic: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    explanation: '',
    points: 1
  })

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('neurolearn-user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchSyllabi()
      fetchStats()
    } else {
      navigate('/auth/login')
    }
  }, [navigate])

  const fetchSyllabi = async () => {
    try {
      const response = await teacherService.getSyllabusList()
      if (response.success && response.data) {
        setSyllabi(response.data)
        if (response.data.length > 0) {
          setSelectedSyllabus(response.data[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch syllabi:', err)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock stats for demonstration
      setStats({
        total: 245,
        pending: 18,
        approved: 180,
        rejected: 47
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getQuestions({
        syllabusId: selectedSyllabus,
        ...filters
      })
      
      if (response.success) {
        setQuestions(response.data.questions || [])
      }
    } catch (err) {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedSyllabus) {
      fetchQuestions()
    }
  }, [selectedSyllabus, filters])

  const handleTabChange = (newValue) => {
    setTabValue(newValue)
    // Update status filter based on tab
    const statusMap = ['all', 'pending', 'approved', 'rejected']
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

  const handleGenerateQuestions = async () => {
    if (!selectedSyllabus) {
      toast.warning('Please select a syllabus first')
      return
    }

    try {
      setLoading(true)
      const response = await teacherService.generateQuestions(selectedSyllabus, {
        count: 20,
        difficulty: 'mixed',
        types: ['mcq', 'short_answer']
      })
      
      if (response.success) {
        toast.success('20 new questions generated successfully!')
        fetchStats()
        fetchQuestions()
      }
    } catch (err) {
      toast.error('Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuestion = async () => {
    // Validate question
    if (!newQuestion.text.trim()) {
      toast.error('Question text is required')
      return
    }

    if (newQuestion.type === 'mcq') {
      const hasCorrectAnswer = newQuestion.options.some(opt => opt.isCorrect)
      const hasAllOptions = newQuestion.options.every(opt => opt.text.trim())
      
      if (!hasCorrectAnswer) {
        toast.error('Please mark at least one correct answer')
        return
      }
      
      if (!hasAllOptions) {
        toast.error('Please fill in all answer options')
        return
      }
    }

    try {
      setLoading(true)
      const response = await teacherService.createQuestion({
        ...newQuestion,
        syllabusId: selectedSyllabus,
        subject: user.subject || newQuestion.subject
      })
      
      if (response.success) {
        toast.success('Question created successfully!')
        setShowAddQuestion(false)
        setNewQuestion({
          text: '',
          type: 'mcq',
          difficulty: 'medium',
          subject: '',
          topic: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          explanation: '',
          points: 1
        })
        fetchQuestions()
        fetchStats()
      }
    } catch (err) {
      toast.error('Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveQuestion = async (questionId) => {
    try {
      await teacherService.approveQuestion(questionId)
      toast.success('Question approved!')
      fetchQuestions()
      fetchStats()
    } catch (err) {
      toast.error('Failed to approve question')
    }
  }

  const handleRejectQuestion = async (questionId) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      await teacherService.rejectQuestion(questionId, reason)
      toast.success('Question rejected!')
      fetchQuestions()
      fetchStats()
    } catch (err) {
      toast.error('Failed to reject question')
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return

    try {
      await teacherService.deleteQuestion(questionId)
      toast.success('Question deleted!')
      fetchQuestions()
      fetchStats()
    } catch (err) {
      toast.error('Failed to delete question')
    }
  }

  const handleBackToDashboard = () => {
    navigate('/pages/teacher/teacherDashboard')
  }

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setNewQuestion(prev => ({ ...prev, options: updatedOptions }))
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50'
      case 'medium': return '#ff9800'
      case 'hard': return '#f44336'
      default: return '#757575'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50'
      case 'pending': return '#ff9800'
      case 'rejected': return '#f44336'
      default: return '#757575'
    }
  }

  const questionStyles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #764ba2 25%, #667eea 75%)',
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
    controlsContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    controlsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '0.875rem'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '0.875rem',
      minHeight: '100px',
      resize: 'vertical'
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
      backgroundColor: '#4299e1',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#4299e1',
      color: '#2d3748'
    },
    questionCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    questionText: {
      fontSize: '1.1rem',
      fontWeight: '500',
      color: '#2d3748',
      marginBottom: '1rem'
    },
    optionsList: {
      marginBottom: '1rem'
    },
    option: {
      padding: '0.5rem',
      marginBottom: '0.5rem',
      borderRadius: '4px',
      backgroundColor: '#f7fafc',
      border: '1px solid #e2e8f0'
    },
    correctOption: {
      backgroundColor: '#f0fff4',
      borderColor: '#4caf50'
    },
    questionMeta: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: 'white'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
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
    optionInput: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    checkbox: {
      width: '16px',
      height: '16px'
    },
    optionTextInput: {
      flex: 1,
      padding: '0.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      fontSize: '0.875rem'
    }
  }

  if (!user) {
    return (
      <div style={questionStyles.container}>
        <div style={{ textAlign: 'center', color: 'white', paddingTop: '4rem' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Manage Questions - NeuroLearn | {user.name}</title>
        <meta name="description" content="Create, review, and manage questions for your quizzes and assessments." />
      </Helmet>

      <div style={questionStyles.container}>
        {/* Header */}
        <div style={questionStyles.header}>
          <h1 style={questionStyles.title}>Manage Questions</h1>
          <button style={questionStyles.backButton} onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={questionStyles.content}>
          {/* Quick Stats */}
          <div style={questionStyles.statsGrid}>
            <div style={questionStyles.statCard}>
              <div style={questionStyles.statNumber}>{stats.total}</div>
              <div style={questionStyles.statLabel}>Total Questions</div>
            </div>
            <div style={questionStyles.statCard}>
              <div style={questionStyles.statNumber}>{stats.pending}</div>
              <div style={questionStyles.statLabel}>Pending Review</div>
            </div>
            <div style={questionStyles.statCard}>
              <div style={questionStyles.statNumber}>{stats.approved}</div>
              <div style={questionStyles.statLabel}>Approved</div>
            </div>
            <div style={questionStyles.statCard}>
              <div style={questionStyles.statNumber}>{stats.rejected}</div>
              <div style={questionStyles.statLabel}>Rejected</div>
            </div>
          </div>

          {/* Controls */}
          <div style={questionStyles.controlsContainer}>
            <div style={questionStyles.controlsGrid}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Select Syllabus
                </label>
                <select
                  style={questionStyles.select}
                  value={selectedSyllabus}
                  onChange={(e) => setSelectedSyllabus(e.target.value)}
                >
                  <option value="">Select Syllabus</option>
                  {syllabi.map((syllabus) => (
                    <option key={syllabus.id} value={syllabus.id}>
                      {syllabus.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Search Questions
                </label>
                <input
                  style={questionStyles.input}
                  type="text"
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Difficulty
                </label>
                <select
                  style={questionStyles.select}
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Type
                </label>
                <select
                  style={questionStyles.select}
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="mcq">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="essay">Essay</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                style={{ ...questionStyles.button, ...questionStyles.primaryButton }}
                onClick={() => setShowAddQuestion(true)}
              >
               Add Question
              </button>
              <button
                style={{ ...questionStyles.button, ...questionStyles.primaryButton }}
                onClick={handleGenerateQuestions}
                disabled={loading || !selectedSyllabus}
              >
               Generate Questions
              </button>
            </div>

            {stats.pending > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                border: '1px solid #ffeaa7',
                color: '#856404'
              }}>
                You have {stats.pending} questions pending review. Review them to make them available for quizzes.
              </div>
            )}
          </div>

          {/* Status Tabs */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            marginBottom: '2rem',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', overflowX: 'auto' }}>
              {['All Questions', 'Pending Review', 'Approved', 'Rejected'].map((tab, index) => (
                <button
                  key={index}
                  style={{
                    padding: '1rem 1.5rem',
                    border: 'none',
                    backgroundColor: tabValue === index ? '#f0f9ff' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderBottom: tabValue === index ? '3px solid #2e7d32' : '3px solid transparent',
                    whiteSpace: 'nowrap',
                    color: tabValue === index ? '#2e7d32' : '#718096'
                  }}
                  onClick={() => handleTabChange(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          {selectedSyllabus ? (
            <div>
              {questions.length > 0 ? (
                questions.map((question) => (
                  <div key={question.id} style={questionStyles.questionCard}>
                    <div style={questionStyles.questionText}>
                      {question.text}
                    </div>

                    {question.type === 'mcq' && (
                      <div style={questionStyles.optionsList}>
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            style={{
                              ...questionStyles.option,
                              ...(option.isCorrect ? questionStyles.correctOption : {})
                            }}
                          >
                            {String.fromCharCode(65 + index)}. {option.text}
                            {option.isCorrect && <span style={{ color: '#4caf50', marginLeft: '0.5rem' }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={questionStyles.questionMeta}>
                      <span
                        style={{
                          ...questionStyles.badge,
                          backgroundColor: getDifficultyColor(question.difficulty)
                        }}
                      >
                        {question.difficulty}
                      </span>
                      <span
                        style={{
                          ...questionStyles.badge,
                          backgroundColor: getStatusColor(question.status)
                        }}
                      >
                        {question.status}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                        {question.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                        {question.topic}
                      </span>
                    </div>

                    <div style={questionStyles.actionButtons}>
                      {question.status === 'pending' && (
                        <>
                          <button
                            style={{
                              ...questionStyles.actionButton,
                              backgroundColor: '#4caf50',
                              color: 'white'
                            }}
                            onClick={() => handleApproveQuestion(question.id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            style={{
                              ...questionStyles.actionButton,
                              backgroundColor: '#f44336',
                              color: 'white'
                            }}
                            onClick={() => handleRejectQuestion(question.id)}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button
                        style={{
                          ...questionStyles.actionButton,
                          backgroundColor: '#2196f3',
                          color: 'white'
                        }}
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info('Edit functionality coming soon!')
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={{
                          ...questionStyles.actionButton,
                          backgroundColor: '#f44336',
                          color: 'white'
                        }}
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>No questions found</h3>
                  <p style={{ color: '#718096', marginBottom: '2rem' }}>
                    {filters.status !== 'all' || filters.difficulty !== 'all' || filters.type !== 'all' || filters.search
                      ? 'Try adjusting your filters to see more questions.'
                      : 'Start by generating questions from your syllabus or create them manually.'}
                  </p>
                  {!filters.search && filters.status === 'all' && (
                    <button
                      style={{ ...questionStyles.button, ...questionStyles.primaryButton }}
                      onClick={handleGenerateQuestions}
                      disabled={loading || !selectedSyllabus}
                    >
                      🤖 Generate Your First Questions
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Select a Syllabus to Start</h3>
              <p style={{ color: '#718096' }}>
                Choose a syllabus from the dropdown above to view and manage its questions.
              </p>
            </div>
          )}

          {/* Add Question Modal */}
          {showAddQuestion && (
            <div style={questionStyles.modal}>
              <div style={questionStyles.modalContent}>
                <h2 style={{ marginBottom: '2rem', color: '#2d3748' }}>Add New Question</h2>

                <div style={questionStyles.formGroup}>
                  <label style={questionStyles.label}>Question Text *</label>
                  <textarea
                    style={questionStyles.textarea}
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter your question here..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={questionStyles.label}>Question Type</label>
                    <select
                      style={questionStyles.select}
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="essay">Essay</option>
                      <option value="true_false">True/False</option>
                    </select>
                  </div>

                  <div>
                    <label style={questionStyles.label}>Difficulty</label>
                    <select
                      style={questionStyles.select}
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={questionStyles.label}>Topic</label>
                    <input
                      style={questionStyles.input}
                      type="text"
                      value={newQuestion.topic}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="e.g., Algebra, Calculus"
                    />
                  </div>

                  <div>
                    <label style={questionStyles.label}>Points</label>
                    <input
                      style={questionStyles.input}
                      type="number"
                      min="1"
                      max="10"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                {newQuestion.type === 'mcq' && (
                  <div style={questionStyles.formGroup}>
                    <label style={questionStyles.label}>Answer Options *</label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} style={questionStyles.optionInput}>
                        <input
                          type="checkbox"
                          style={questionStyles.checkbox}
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                        />
                        <span style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          style={questionStyles.optionTextInput}
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    ))}
                    <p style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.5rem' }}>
                      Check the box next to correct answer(s)
                    </p>
                  </div>
                )}

                <div style={questionStyles.formGroup}>
                  <label style={questionStyles.label}>Explanation (Optional)</label>
                  <textarea
                    style={{ ...questionStyles.textarea, minHeight: '80px' }}
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Provide an explanation for the correct answer..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    style={{ ...questionStyles.button, ...questionStyles.secondaryButton }}
                    onClick={() => setShowAddQuestion(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ ...questionStyles.button, ...questionStyles.primaryButton }}
                    onClick={handleCreateQuestion}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Question'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999
            }}>
              <div style={{
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #2e7d32',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ color: '#2d3748', margin: 0 }}>Processing...</p>
              </div>
            </div>
          )}
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

export default ManageQuestions
