import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { teacherService } from '../../services/teacher.service'

const ManageSyllabus = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('neurolearn-user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchSyllabi()
    } else {
      navigate('/auth/login')
    }
  }, [navigate])

  const fetchSyllabi = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getSyllabusList()
      if (response.success) {
        setSyllabi(response.data)
      }
    } catch (err) {
      toast.error('Failed to load syllabi')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSyllabus = async (syllabusId) => {
    if (!window.confirm('Are you sure you want to delete this syllabus?')) return

    try {
      await teacherService.deleteSyllabus(syllabusId)
      setSyllabi(prev => prev.filter(s => s.id !== syllabusId))
      toast.success('Syllabus deleted successfully')
    } catch (err) {
      toast.error('Failed to delete syllabus')
    }
  }

  const handleGenerateQuestions = async (syllabusId) => {
    try {
      setGeneratingQuestions(true)
      const response = await teacherService.generateQuestions(syllabusId, {
        count: 50,
        difficulty: 'mixed',
        types: ['mcq', 'short_answer', 'essay']
      })
      
      if (response.success) {
        // Update syllabus status
        setSyllabi(prev => prev.map(s =>
          s.id === syllabusId
            ? { ...s, questionsGenerated: (s.questionsGenerated || 0) + 50, status: 'processed' }
            : s
        ))
        toast.success('Questions generated successfully!')
      }
    } catch (err) {
      toast.error('Failed to generate questions')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const handleFileUpload = async (files) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    const formData = new FormData()
    formData.append('syllabus', file)
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
    formData.append('subject', user.subject || 'General')

    try {
      setUploadProgress(0)
      const response = await teacherService.uploadSyllabus(formData)
      
      if (response.success) {
        const newSyllabus = {
          id: Date.now(), // Temporary ID
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'processing',
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type.includes('pdf') ? 'PDF' : file.type.includes('word') ? 'DOCX' : 'TXT',
          chapters: 0,
          topics: 0,
          questionsGenerated: 0,
          difficulty: 'Intermediate',
          subject: user.subject || 'General',
          description: `Uploaded syllabus: ${file.name}`,
          progress: 0
        }

        setSyllabi(prev => [...prev, newSyllabus])
        setShowUpload(false)
        toast.success('Syllabus uploaded successfully! Processing will begin shortly.')

        // Simulate processing progress
        simulateProcessing(newSyllabus.id)
      }
    } catch (err) {
      toast.error('Failed to upload syllabus')
    } finally {
      setUploadProgress(0)
    }
  }

  const simulateProcessing = (syllabusId) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        // Update syllabus status to processed
        setSyllabi(prev => prev.map(s =>
          s.id === syllabusId
            ? { 
                ...s, 
                status: 'processed', 
                progress: 100,
                chapters: Math.floor(Math.random() * 15) + 5,
                topics: Math.floor(Math.random() * 40) + 20,
                questionsGenerated: Math.floor(Math.random() * 50) + 30
              }
            : s
        ))
        toast.success('Syllabus processing completed!')
      } else {
        setSyllabi(prev => prev.map(s =>
          s.id === syllabusId ? { ...s, progress: Math.floor(progress) } : s
        ))
      }
    }, 1000)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload([e.dataTransfer.files[0]])
    }
  }

  const handleBackToDashboard = () => {
    navigate('/pages/teacher/teacherDashboard')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return '#4caf50'
      case 'processing': return '#ff9800'
      case 'draft': return '#2196f3'
      case 'error': return '#f44336'
      default: return '#757575'
    }
  }

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return '📄'
      case 'docx':
      case 'doc': return '📝'
      case 'txt': return '📋'
      default: return '📁'
    }
  }

  const syllabusStyles = {
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
    uploadButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'white',
      color: '#667eea',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      marginBottom: '2rem'
    },
    uploadArea: {
      border: `2px dashed ${dragActive ? '#2e7d32' : '#e2e8f0'}`,
      borderRadius: '12px',
      padding: '3rem 2rem',
      textAlign: 'center',
      backgroundColor: dragActive ? '#f0f9ff' : 'white',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    syllabusGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    syllabusCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '1rem'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#ff9800',
      transition: 'width 0.3s ease'
    }
  }

  if (!user) {
    return (
      <div style={syllabusStyles.container}>
        <div style={{ textAlign: 'center', color: 'white', paddingTop: '4rem' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Manage Syllabus - NeuroLearn | {user.name}</title>
        <meta name="description" content="Upload and manage your course syllabi to generate AI-powered questions for your students." />
      </Helmet>

      <div style={syllabusStyles.container}>
        {/* Header */}
        <div style={syllabusStyles.header}>
          <h1 style={syllabusStyles.title}>Manage Syllabus</h1>
          <button style={syllabusStyles.backButton} onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={syllabusStyles.content}>
          {/* Upload Section */}
          {showUpload ? (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ marginBottom: '1rem' }}>Upload New Syllabus</h2>
              
              <div
                style={syllabusStyles.uploadArea}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('syllabusFile').click()}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <h3>Drag and drop your syllabus file here</h3>
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  or click to browse files
                </p>
                <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
                
                <input
                  id="syllabusFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  style={{ ...syllabusStyles.backButton, backgroundColor: '#e2e8f0', color: '#2d3748' }}
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              style={syllabusStyles.uploadButton}
              onClick={() => setShowUpload(true)}
            >
              Upload Syllabus
            </button>
          )}

          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.5rem' }}>
                {syllabi.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#718096' }}>Total Syllabi</div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.5rem' }}>
                {syllabi.reduce((acc, s) => acc + (s.questionsGenerated || 0), 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#718096' }}>Questions Generated</div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.5rem' }}>
                {syllabi.reduce((acc, s) => acc + (s.chapters || 0), 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#718096' }}>Total Chapters</div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.5rem' }}>
                {syllabi.filter(s => s.status === 'processed').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#718096' }}>AI Ready</div>
            </div>
          </div>

          {/* Syllabi Grid */}
          <div style={syllabusStyles.syllabusGrid}>
            {syllabi.map((syllabus) => (
              <div 
                key={syllabus.id} 
                style={syllabusStyles.syllabusCard}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getFileIcon(syllabus.type)}</span>
                    <span style={{ fontSize: '0.875rem', color: '#718096' }}>{syllabus.size}</span>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: getStatusColor(syllabus.status)
                  }}>
                    {syllabus.status.toUpperCase()}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>
                  {syllabus.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
                  {syllabus.description}
                </p>

                {/* Progress Bar for Processing */}
                {syllabus.status === 'processing' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Processing...</span>
                      <span style={{ fontSize: '0.875rem', color: '#718096' }}>{syllabus.progress || 0}%</span>
                    </div>
                    <div style={syllabusStyles.progressBar}>
                      <div 
                        style={{
                          ...syllabusStyles.progressFill,
                          width: `${syllabus.progress || 0}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div><strong>Subject:</strong> {syllabus.subject}</div>
                  <div><strong>Difficulty:</strong> {syllabus.difficulty}</div>
                  <div><strong>Chapters:</strong> {syllabus.chapters}</div>
                  <div><strong>Topics:</strong> {syllabus.topics}</div>
                </div>

                {/* Questions Generated */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Questions Generated: {syllabus.questionsGenerated || 0}
                  </div>
                  {(syllabus.questionsGenerated || 0) > 0 && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min((syllabus.questionsGenerated / 100) * 100, 100)}%`,
                        height: '100%',
                        backgroundColor: '#4caf50'
                      }} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#e2e8f0',
                      color: '#2d3748',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                    onClick={() => {
                      setSelectedSyllabus(syllabus)
                      setShowDetails(true)
                    }}
                  >
                    👁️ View
                  </button>

                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                    onClick={() => handleDeleteSyllabus(syllabus.id)}
                  >
                    🗑️ Delete
                  </button>

                  {syllabus.status === 'processed' && (
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2e7d32',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                      onClick={() => handleGenerateQuestions(syllabus.id)}
                      disabled={generatingQuestions}
                    >
                      🤖 Generate Questions
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {syllabi.length === 0 && !loading && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>No syllabi uploaded yet</h3>
              <p style={{ color: '#718096', marginBottom: '2rem' }}>
                Upload your first syllabus to start generating AI-powered questions
              </p>
              <button
                style={syllabusStyles.uploadButton}
                onClick={() => setShowUpload(true)}
              >
                📤 Upload Your First Syllabus
              </button>
            </div>
          )}

          {/* Details Modal */}
          {showDetails && selectedSyllabus && (
            <div style={{
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
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
              }}>
                <h2 style={{ marginBottom: '1rem' }}>Syllabus Details</h2>
                <h3>{selectedSyllabus.name}</h3>
                
                <div style={{ marginBottom: '2rem' }}>
                  <p><strong>File:</strong> {selectedSyllabus.fileName}</p>
                  <p><strong>Upload Date:</strong> {new Date(selectedSyllabus.uploadDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {selectedSyllabus.status}</p>
                  <p><strong>Size:</strong> {selectedSyllabus.size}</p>
                  <p><strong>Subject:</strong> {selectedSyllabus.subject}</p>
                  <p><strong>Chapters:</strong> {selectedSyllabus.chapters}</p>
                  <p><strong>Topics:</strong> {selectedSyllabus.topics}</p>
                  <p><strong>Questions Generated:</strong> {selectedSyllabus.questionsGenerated}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    style={syllabusStyles.backButton}
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </button>
                  {selectedSyllabus.status === 'processed' && (
                    <button
                      style={{ ...syllabusStyles.uploadButton, margin: 0 }}
                      onClick={() => {
                        handleGenerateQuestions(selectedSyllabus.id)
                        setShowDetails(false)
                      }}
                    >
                      Generate More Questions
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ManageSyllabus
