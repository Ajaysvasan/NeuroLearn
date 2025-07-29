import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Edit,
  Preview,
  FilterList,
  Search,
  Close,
  AutoAwesome,
  Psychology,
  QuestionMark,
  ThumbUp,
  ThumbDown,
  Visibility
} from '@mui/icons-material'

import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const QuestionReview = ({ syllabusId }) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [tabValue, setTabValue] = useState(0)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [previewQuestion, setPreviewQuestion] = useState(null)
  const [batchAction, setBatchAction] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (syllabusId) {
      fetchQuestions()
    }
  }, [syllabusId, filter])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getGeneratedQuestions(syllabusId, filter)
      setQuestions(response.data)
    } catch (err) {
      setError('Failed to fetch questions')
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (questionId) => {
    try {
      await teacherService.approveQuestion(questionId)
      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId ? { ...q, status: 'approved' } : q
        )
      )
      toast.success('Question approved!')
    } catch (err) {
      toast.error('Failed to approve question')
    }
  }

  const handleReject = async (questionId, reason = '') => {
    try {
      await teacherService.rejectQuestion(questionId, reason)
      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId ? { ...q, status: 'rejected', rejectionReason: reason } : q
        )
      )
      toast.success('Question rejected')
    } catch (err) {
      toast.error('Failed to reject question')
    }
  }

  const handleBatchAction = async () => {
    if (selectedQuestions.length === 0) {
      toast.warning('Please select questions first')
      return
    }

    try {
      const promises = selectedQuestions.map(questionId => {
        if (batchAction === 'approve') {
          return teacherService.approveQuestion(questionId)
        } else if (batchAction === 'reject') {
          return teacherService.rejectQuestion(questionId)
        }
      })

      await Promise.all(promises)
      
      setQuestions(prev => 
        prev.map(q => 
          selectedQuestions.includes(q.id) 
            ? { ...q, status: batchAction === 'approve' ? 'approved' : 'rejected' }
            : q
        )
      )
      
      setSelectedQuestions([])
      setBatchAction('')
      toast.success(`${selectedQuestions.length} questions ${batchAction}d successfully!`)
    } catch (err) {
      toast.error(`Failed to ${batchAction} questions`)
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion({ ...question })
  }

  const handleSaveEdit = async () => {
    try {
      await teacherService.editQuestion(editingQuestion.id, editingQuestion)
      setQuestions(prev => 
        prev.map(q => 
          q.id === editingQuestion.id ? editingQuestion : q
        )
      )
      setEditingQuestion(null)
      toast.success('Question updated successfully!')
    } catch (err) {
      toast.error('Failed to save changes')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topic?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty
    const matchesType = selectedType === 'all' || question.type === selectedType
    
    return matchesSearch && matchesDifficulty && matchesType
  })

  const getTabCounts = () => {
    return {
      all: questions.length,
      pending: questions.filter(q => q.status === 'pending').length,
      approved: questions.filter(q => q.status === 'approved').length,
      rejected: questions.filter(q => q.status === 'rejected').length
    }
  }

  const tabCounts = getTabCounts()

  if (loading) {
    return <LoadingSpinner text="Loading questions..." />
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Psychology color="primary" />
          Review AI Generated Questions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review, edit, and approve questions generated by our AI system
        </Typography>
      </Box>

      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="mcq">Multiple Choice</MenuItem>
                <MenuItem value="short_answer">Short Answer</MenuItem>
                <MenuItem value="essay">Essay</MenuItem>
                <MenuItem value="true_false">True/False</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {selectedQuestions.length > 0 && (
                <>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={batchAction}
                      onChange={(e) => setBatchAction(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">Batch Action</MenuItem>
                      <MenuItem value="approve">Approve All</MenuItem>
                      <MenuItem value="reject">Reject All</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleBatchAction}
                    disabled={!batchAction}
                  >
                    Apply ({selectedQuestions.length})
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue)
            const filters = ['all', 'pending', 'approved', 'rejected']
            setFilter(filters[newValue])
          }}
          variant="fullWidth"
        >
          <Tab 
            label={
              <Badge badgeContent={tabCounts.all} color="default">
                All Questions
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.pending} color="warning">
                Pending Review
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.approved} color="success">
                Approved
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.rejected} color="error">
                Rejected
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Questions Grid */}
      <Grid container spacing={3}>
        {filteredQuestions.map((question) => (
          <Grid item xs={12} lg={6} xl={4} key={question.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: selectedQuestions.includes(question.id) ? 2 : 1,
                borderColor: selectedQuestions.includes(question.id) ? 'primary.main' : 'divider'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Question Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={question.status}
                      color={getStatusColor(question.status)}
                      size="small"
                    />
                    <Chip
                      label={question.type.replace('_', ' ').toUpperCase()}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={question.difficulty}
                      color={getDifficultyColor(question.difficulty)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuestions(prev => [...prev, question.id])
                        } else {
                          setSelectedQuestions(prev => prev.filter(id => id !== question.id))
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Question Content */}
                <Typography variant="h6" gutterBottom sx={{ minHeight: 60 }}>
                  {question.text}
                </Typography>

                {/* Options for MCQ */}
                {question.type === 'mcq' && question.options && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Options:</Typography>
                    <List dense>
                      {question.options.map((option, index) => (
                        <ListItem 
                          key={index}
                          sx={{ 
                            py: 0.5,
                            backgroundColor: option.isCorrect ? 'success.50' : 'transparent',
                            borderRadius: 1,
                            mb: 0.5
                          }}
                        >
                          <ListItemText 
                            primary={option.text}
                            secondary={option.isCorrect ? 'Correct Answer' : null}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Correct Answer for non-MCQ */}
                {question.type !== 'mcq' && question.correctAnswer && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Correct Answer:</Typography>
                    <Typography variant="body2" sx={{ p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                      {question.correctAnswer}
                    </Typography>
                  </Box>
                )}

                {/* Metadata */}
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Topic: {question.topic} • Chapter: {question.chapter || 'General'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    AI Confidence: {(question.confidence * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Preview">
                    <IconButton 
                      size="small" 
                      onClick={() => setPreviewQuestion(question)}
                      color="info"
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(question)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </Box>

                {question.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<ThumbUp />}
                      onClick={() => handleApprove(question.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<ThumbDown />}
                      onClick={() => handleReject(question.id)}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredQuestions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuestionMark sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No questions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || selectedDifficulty !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your filters to see more questions.'
              : 'Upload a syllabus to generate questions automatically.'
            }
          </Typography>
        </Paper>
      )}

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={true} onClose={() => setEditingQuestion(null)} maxWidth="md" fullWidth>
          <DialogTitle>
            Edit Question
            <IconButton
              onClick={() => setEditingQuestion(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Question Text"
                multiline
                rows={3}
                value={editingQuestion.text}
                onChange={(e) => setEditingQuestion(prev => ({
                  ...prev,
                  text: e.target.value
                }))}
                sx={{ mb: 3 }}
              />
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={editingQuestion.difficulty}
                      onChange={(e) => setEditingQuestion(prev => ({
                        ...prev,
                        difficulty: e.target.value
                      }))}
                      label="Difficulty"
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Topic"
                    value={editingQuestion.topic}
                    onChange={(e) => setEditingQuestion(prev => ({
                      ...prev,
                      topic: e.target.value
                    }))}
                  />
                </Grid>
              </Grid>

              {editingQuestion.type === 'mcq' && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Options:</Typography>
                  {editingQuestion.options?.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Radio
                        checked={option.isCorrect}
                        onChange={() => {
                          const newOptions = editingQuestion.options.map((opt, i) => ({
                            ...opt,
                            isCorrect: i === index
                          }))
                          setEditingQuestion(prev => ({
                            ...prev,
                            options: newOptions
                          }))
                        }}
                      />
                      <TextField
                        fullWidth
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options]
                          newOptions[index].text = e.target.value
                          setEditingQuestion(prev => ({
                            ...prev,
                            options: newOptions
                          }))
                        }}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Preview Question Dialog */}
      {previewQuestion && (
        <Dialog open={true} onClose={() => setPreviewQuestion(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Question Preview
            <IconButton
              onClick={() => setPreviewQuestion(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {previewQuestion.text}
              </Typography>
              
              {previewQuestion.type === 'mcq' && (
                <RadioGroup>
                  {previewQuestion.options?.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option.text}
                      control={<Radio />}
                      label={option.text}
                      disabled
                    />
                  ))}
                </RadioGroup>
              )}
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Type: {previewQuestion.type} • Difficulty: {previewQuestion.difficulty} • Topic: {previewQuestion.topic}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewQuestion(null)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default QuestionReview