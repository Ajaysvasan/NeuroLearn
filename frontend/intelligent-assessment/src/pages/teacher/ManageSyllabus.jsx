import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  Visibility,
  Edit,
  AutoAwesome,
  CheckCircle,
  Description,
  School,
  Analytics,
  Quiz
} from '@mui/icons-material'

import SyllabusUpload from '@components/teacher/SyllabusUpload'
import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const ManageSyllabus = () => {
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)

  useEffect(() => {
    fetchSyllabi()
  }, [])

  const fetchSyllabi = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockSyllabi = [
        {
          id: 1,
          name: 'Advanced Mathematics - Grade 12',
          fileName: 'math_grade12_syllabus.pdf',
          uploadDate: '2024-01-15',
          status: 'processed',
          size: '2.5 MB',
          type: 'PDF',
          chapters: 15,
          topics: 45,
          questionsGenerated: 120,
          difficulty: 'Advanced',
          subject: 'Mathematics',
          description: 'Comprehensive syllabus covering calculus, algebra, and statistics for grade 12 students.',
          aiAnalysis: {
            confidence: 92,
            keyTopics: ['Differential Calculus', 'Integral Calculus', 'Probability', 'Statistics'],
            estimatedQuestions: 150,
            difficultyDistribution: {
              easy: 30,
              medium: 50,
              hard: 20
            }
          }
        },
        {
          id: 2,
          name: 'Physics Mechanics - Class 11',
          fileName: 'physics_mechanics.docx',
          uploadDate: '2024-01-12',
          status: 'processing',
          size: '1.8 MB',
          type: 'DOCX',
          chapters: 8,
          topics: 24,
          questionsGenerated: 0,
          difficulty: 'Intermediate',
          subject: 'Physics',
          description: 'Mechanics syllabus covering motion, forces, and energy for class 11 physics.',
          progress: 65
        },
        {
          id: 3,
          name: 'Organic Chemistry Basics',
          fileName: 'organic_chemistry.pdf',
          uploadDate: '2024-01-10',
          status: 'draft',
          size: '3.2 MB',
          type: 'PDF',
          chapters: 12,
          topics: 36,
          questionsGenerated: 85,
          difficulty: 'Beginner',
          subject: 'Chemistry',
          description: 'Introduction to organic chemistry concepts and reactions.'
        }
      ]
      
      setSyllabi(mockSyllabi)
    } catch (err) {
      toast.error('Failed to load syllabi')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSyllabus = async (syllabusId) => {
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
      await teacherService.generateQuestions(syllabusId, {
        count: 50,
        difficulty: 'mixed',
        types: ['mcq', 'short_answer', 'essay']
      })
      
      // Update syllabus status
      setSyllabi(prev => prev.map(s => 
        s.id === syllabusId 
          ? { ...s, questionsGenerated: s.questionsGenerated + 50, status: 'processed' }
          : s
      ))
      
      toast.success('Questions generated successfully!')
    } catch (err) {
      toast.error('Failed to generate questions')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const handleUploadSuccess = (newSyllabus) => {
    setSyllabi(prev => [...prev, newSyllabus])
    setShowUpload(false)
    toast.success('Syllabus uploaded and processed successfully!')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'success'
      case 'processing': return 'warning'
      case 'draft': return 'info'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📄'
      case 'docx': 
      case 'doc': return '📝'
      case 'txt': return '📋'
      default: return '📁'
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading syllabi..." />
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Manage Syllabus
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload, manage, and generate AI questions from your course syllabi
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => setShowUpload(true)}
          size="large"
        >
          Upload Syllabus
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label={`All Syllabi (${syllabi.length})`} />
          <Tab label={`Processed (${syllabi.filter(s => s.status === 'processed').length})`} />
          <Tab label={`Processing (${syllabi.filter(s => s.status === 'processing').length})`} />
          <Tab label={`Drafts (${syllabi.filter(s => s.status === 'draft').length})`} />
        </Tabs>
      </Paper>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Description sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {syllabi.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Syllabi
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Quiz sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {syllabi.reduce((acc, s) => acc + (s.questionsGenerated || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Questions Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {syllabi.reduce((acc, s) => acc + (s.chapters || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Chapters
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {syllabi.filter(s => s.status === 'processed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI Ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Syllabi Grid */}
      <Grid container spacing={3}>
        {syllabi
          .filter(syllabus => {
            if (tabValue === 0) return true
            if (tabValue === 1) return syllabus.status === 'processed'
            if (tabValue === 2) return syllabus.status === 'processing'
            if (tabValue === 3) return syllabus.status === 'draft'
            return true
          })
          .map((syllabus) => (
            <Grid item xs={12} md={6} lg={4} key={syllabus.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>
                        {getFileIcon(syllabus.type)}
                      </Typography>
                      <Chip
                        label={syllabus.status}
                        color={getStatusColor(syllabus.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {syllabus.size}
                    </Typography>
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" gutterBottom>
                    {syllabus.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {syllabus.description}
                  </Typography>

                  {/* Progress Bar for Processing */}
                  {syllabus.status === 'processing' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Processing... {syllabus.progress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={syllabus.progress} 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  )}

                  {/* Metadata */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Subject
                      </Typography>
                      <Typography variant="body2">
                        {syllabus.subject}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Difficulty
                      </Typography>
                      <Typography variant="body2">
                        {syllabus.difficulty}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Chapters
                      </Typography>
                      <Typography variant="body2">
                        {syllabus.chapters}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Topics
                      </Typography>
                      <Typography variant="body2">
                        {syllabus.topics}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* AI Analysis */}
                  {syllabus.aiAnalysis && (
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        AI Analysis
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Confidence: {syllabus.aiAnalysis.confidence}% • 
                        Est. Questions: {syllabus.aiAnalysis.estimatedQuestions}
                      </Typography>
                    </Box>
                  )}

                  {/* Questions Generated */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Questions Generated: {syllabus.questionsGenerated}
                    </Typography>
                    {syllabus.questionsGenerated > 0 && (
                      <CheckCircle color="success" fontSize="small" />
                    )}
                  </Box>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedSyllabus(syllabus)
                        setShowDetails(true)
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteSyllabus(syllabus.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  {syllabus.status === 'processed' && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AutoAwesome />}
                      onClick={() => handleGenerateQuestions(syllabus.id)}
                      disabled={generatingQuestions}
                    >
                      Generate Questions
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Empty State */}
      {syllabi.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No syllabi uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload your first syllabus to start generating AI-powered questions
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setShowUpload(true)}
          >
            Upload Your First Syllabus
          </Button>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog 
        open={showUpload} 
        onClose={() => setShowUpload(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Upload New Syllabus
        </DialogTitle>
        <DialogContent>
          <SyllabusUpload onUploadSuccess={handleUploadSuccess} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpload(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      {selectedSyllabus && (
        <Dialog 
          open={showDetails} 
          onClose={() => setShowDetails(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Syllabus Details - {selectedSyllabus.name}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Basic Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="File Name" 
                      secondary={selectedSyllabus.fileName} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Upload Date" 
                      secondary={new Date(selectedSyllabus.uploadDate).toLocaleDateString()} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Subject" 
                      secondary={selectedSyllabus.subject} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Difficulty Level" 
                      secondary={selectedSyllabus.difficulty} 
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Content Analysis
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Total Chapters" 
                      secondary={selectedSyllabus.chapters} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total Topics" 
                      secondary={selectedSyllabus.topics} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Questions Generated" 
                      secondary={selectedSyllabus.questionsGenerated} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip 
                          label={selectedSyllabus.status}
                          color={getStatusColor(selectedSyllabus.status)}
                          size="small"
                        />
                      } 
                    />
                  </ListItem>
                </List>
              </Grid>

              {selectedSyllabus.aiAnalysis && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    AI Analysis Report
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Analysis Confidence:</strong> {selectedSyllabus.aiAnalysis.confidence}%
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Key Topics Identified:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {selectedSyllabus.aiAnalysis.keyTopics.map((topic, index) => (
                        <Chip key={index} label={topic} size="small" variant="outlined" />
                      ))}
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Estimated Questions:</strong> {selectedSyllabus.aiAnalysis.estimatedQuestions}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Difficulty Distribution:</strong> 
                      Easy: {selectedSyllabus.aiAnalysis.difficultyDistribution.easy}% | 
                      Medium: {selectedSyllabus.aiAnalysis.difficultyDistribution.medium}% | 
                      Hard: {selectedSyllabus.aiAnalysis.difficultyDistribution.hard}%
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {selectedSyllabus.status === 'processed' && (
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={() => {
                  handleGenerateQuestions(selectedSyllabus.id)
                  setShowDetails(false)
                }}
              >
                Generate More Questions
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default ManageSyllabus