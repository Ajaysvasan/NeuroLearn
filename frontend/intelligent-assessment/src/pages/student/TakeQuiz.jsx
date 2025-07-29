import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material'
import {
  PlayArrow,
  Timer,
  Quiz,
  Warning,
  CheckCircle,
  School
} from '@mui/icons-material'

import QuizInterface from '@components/student/QuizInterface'
import { studentService } from '@services/student.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const TakeQuiz = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails()
    }
  }, [quizId])

  const fetchQuizDetails = async () => {
    try {
      setLoading(true)
      
      // Mock quiz data for demonstration
      const mockQuiz = {
        id: parseInt(quizId),
        title: 'Advanced Mathematics Quiz',
        description: 'Test your knowledge of advanced mathematical concepts including calculus, algebra, and statistics.',
        subject: 'Mathematics',
        duration: 45, // minutes
        totalQuestions: 20,
        difficulty: 'Hard',
        passingScore: 70,
        maxAttempts: 2,
        currentAttempt: 0,
        instructions: [
          'Read each question carefully before answering',
          'You can navigate between questions using the Next/Previous buttons',
          'Your answers are automatically saved as you progress',
          'You can flag questions for review using the flag button',
          'Submit the quiz before the time runs out',
          'Once submitted, you cannot change your answers'
        ],
        topics: ['Differential Calculus', 'Integral Calculus', 'Linear Algebra', 'Statistics'],
        timeLimit: 45 * 60, // seconds
        questions: [
          {
            id: 1,
            text: 'What is the derivative of x²?',
            type: 'mcq',
            difficulty: 'easy',
            points: 2,
            options: [
              { id: 'a', text: '2x', isCorrect: true },
              { id: 'b', text: 'x²', isCorrect: false },
              { id: 'c', text: '2', isCorrect: false },
              { id: 'd', text: 'x', isCorrect: false }
            ],
            hint: 'Remember the power rule: d/dx(xⁿ) = n·xⁿ⁻¹'
          },
          // Add more questions as needed
        ],
        previousAttempts: [
          {
            attemptNumber: 1,
            score: 65,
            completedAt: '2024-01-20',
            timeSpent: 2580 // seconds
          }
        ],
        dueDate: '2024-02-10',
        teacherName: 'Dr. Rajesh Kumar',
        createdAt: '2024-01-15'
      }
      
      setQuiz(mockQuiz)
    } catch (err) {
      setError('Failed to load quiz details. Please try again.')
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setShowInstructions(true)
  }

  const handleConfirmStart = () => {
    setShowInstructions(false)
    setQuizStarted(true)
  }

  const handleQuizComplete = (result) => {
    // Navigate to results page with the quiz result
    navigate(`/student/results/${quizId}`, { 
      state: { 
        result,
        fromQuiz: true 
      } 
    })
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return <LoadingSpinner text="Loading quiz..." />
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  if (!quiz) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Quiz not found or no longer available.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  // Show quiz interface if started
  if (quizStarted) {
    return (
      <QuizInterface 
        quizId={parseInt(quizId)} 
        onQuizComplete={handleQuizComplete}
      />
    )
  }

  // Show pre-quiz information and start interface
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {quiz.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {quiz.description}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Quiz Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Quiz color="primary" />
              Quiz Information
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1">
                    {quiz.subject}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Teacher
                  </Typography>
                  <Typography variant="body1">
                    {quiz.teacherName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timer fontSize="small" />
                    {formatTime(quiz.duration)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Questions
                  </Typography>
                  <Typography variant="body1">
                    {quiz.totalQuestions} questions
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Difficulty
                  </Typography>
                  <Chip 
                    label={quiz.difficulty}
                    color={getDifficultyColor(quiz.difficulty)}
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Passing Score
                  </Typography>
                  <Typography variant="body1">
                    {quiz.passingScore}%
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Attempts
                  </Typography>
                  <Typography variant="body1">
                    {quiz.currentAttempt}/{quiz.maxAttempts}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(quiz.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Topics Covered */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Topics Covered
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quiz.topics.map((topic, index) => (
                  <Chip
                    key={index}
                    label={topic}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            {/* Previous Attempts */}
            {quiz.previousAttempts && quiz.previousAttempts.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Previous Attempts
                </Typography>
                {quiz.previousAttempts.map((attempt, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ py: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3}>
                          <Typography variant="body2">
                            Attempt {attempt.attemptNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color={attempt.score >= quiz.passingScore ? 'success.main' : 'error.main'}>
                            Score: {attempt.score}%
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">
                            {formatTime(Math.floor(attempt.timeSpent / 60))}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Start Quiz Button */}
            <Box sx={{ textAlign: 'center' }}>
              {quiz.currentAttempt < quiz.maxAttempts ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleStartQuiz}
                  sx={{ minWidth: 200 }}
                >
                  {quiz.currentAttempt > 0 ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
              ) : (
                <Alert severity="warning">
                  You have used all your attempts for this quiz.
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Instructions Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <School color="primary" />
              Instructions
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Once you start the quiz, the timer will begin and cannot be paused.
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Before you begin:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {quiz.instructions.map((instruction, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <Typography variant="body2">
                      {instruction}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Stats:
              </Typography>
              <Typography variant="body2" gutterBottom>
                📝 {quiz.totalQuestions} questions
              </Typography>
              <Typography variant="body2" gutterBottom>
                ⏱️ {formatTime(quiz.duration)} time limit
              </Typography>
              <Typography variant="body2" gutterBottom>
                🎯 {quiz.passingScore}% to pass
              </Typography>
              <Typography variant="body2">
                🔄 {quiz.maxAttempts - quiz.currentAttempt} attempts remaining
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Instructions Dialog */}
      <Dialog 
        open={showInstructions} 
        onClose={() => setShowInstructions(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Ready to Start?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Once you click "Start Quiz", the timer will begin immediately and cannot be stopped.</strong>
            </Typography>
          </Alert>

          <Typography variant="body1" gutterBottom>
            Please confirm that you:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            <li>Have a stable internet connection</li>
            <li>Are in a quiet environment</li>
            <li>Have read all the instructions</li>
            <li>Are ready to complete the quiz in one sitting</li>
          </ul>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer fontSize="small" />
              <strong>Time Limit: {formatTime(quiz.duration)}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstructions(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStart} 
            variant="contained"
            startIcon={<PlayArrow />}
          >
            Start Quiz Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TakeQuiz
