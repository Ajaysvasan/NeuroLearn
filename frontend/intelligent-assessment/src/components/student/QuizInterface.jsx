import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Fade,
  Zoom
} from '@mui/material'
import {
  Timer,
  NavigateNext,
  NavigateBefore,
  Flag,
  Lightbulb,
  CheckCircle,
  Warning,
  PlayArrow,
  Pause,
  SkipNext,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material'

import { studentService } from '@services/student.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const QuizInterface = ({ quizId, onQuizComplete }) => {
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
  const [showHint, setShowHint] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef()
  const startTimeRef = useRef()

  useEffect(() => {
    if (quizId) {
      initializeQuiz()
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [quizId])

  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && !isTimerPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [quizStarted, timeRemaining, isTimerPaused])

  const initializeQuiz = async () => {
    try {
      setLoading(true)
      const response = await studentService.startQuiz(quizId)
      setQuiz(response.data.quiz)
      setQuestions(response.data.questions)
      setTimeRemaining(response.data.quiz.duration * 60) // Convert minutes to seconds
      startTimeRef.current = Date.now()
    } catch (err) {
      setError('Failed to load quiz')
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    startTimeRef.current = Date.now()
  }

  const handleTimeUp = async () => {
    toast.warning('Time is up! Submitting quiz automatically.')
    await handleSubmitQuiz()
  }

  const handleAnswerChange = async (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)

    // Auto-save answer
    try {
      await studentService.submitAnswer(quizId, questionId, answer)
    } catch (err) {
      console.error('Failed to auto-save answer:', err)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowHint(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowHint(false)
    }
  }

  const toggleFlag = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true)
      const response = await studentService.submitQuiz(quizId, answers)
      
      toast.success('Quiz submitted successfully!')
      onQuizComplete?.(response.data)
    } catch (err) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
      setShowSubmitDialog(false)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= 300) return 'error' // Last 5 minutes
    if (timeRemaining <= 600) return 'warning' // Last 10 minutes
    return 'primary'
  }

  const getProgressPercentage = () => {
    const answered = Object.keys(answers).length
    return (answered / questions.length) * 100
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (loading) {
    return <LoadingSpinner text="Loading quiz..." />
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!quizStarted) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" gutterBottom>
              {quiz?.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {quiz?.description}
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.main">
                    {questions.length}
                  </Typography>
                  <Typography variant="body2">Questions</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="warning.main">
                    {quiz?.duration} min
                  </Typography>
                  <Typography variant="body2">Duration</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.main">
                    {quiz?.difficulty}
                  </Typography>
                  <Typography variant="body2">Difficulty</Typography>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Instructions:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Read each question carefully before answering</li>
                <li>You can navigate between questions using the navigation buttons</li>
                <li>Flag questions for review if needed</li>
                <li>Your answers are auto-saved as you progress</li>
                <li>Submit the quiz before time runs out</li>
              </ul>
            </Alert>

            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={startQuiz}
              sx={{ mt: 2 }}
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header with Timer and Progress */}
      <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 0, zIndex: 100 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">{quiz?.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer color={getTimeColor()} />
              <Typography 
                variant="h6" 
                color={`${getTimeColor()}.main`}
                sx={{ minWidth: '60px' }}
              >
                {formatTime(timeRemaining)}
              </Typography>
              <Tooltip title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}>
                <IconButton 
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  color={getTimeColor()}
                >
                  {isTimerPaused ? <PlayArrow /> : <Pause />}
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              variant="contained"
              color="success"
              onClick={() => setShowSubmitDialog(true)}
              disabled={Object.keys(answers).length === 0}
            >
              Submit Quiz
            </Button>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">
              Progress: {Object.keys(answers).length}/{questions.length} answered
            </Typography>
            <Typography variant="caption">
              {Math.round(getProgressPercentage())}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Question Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 140 }}>
            <Typography variant="h6" gutterBottom>
              Question Navigation
            </Typography>
            
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {questions.map((_, index) => (
                <Grid item xs={3} key={index}>
                  <Button
                    variant={currentQuestionIndex === index ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentQuestionIndex(index)}
                    sx={{ 
                      minWidth: 40,
                      height: 40,
                      position: 'relative'
                    }}
                    color={
                      answers[questions[index].id] ? 'success' :
                      flaggedQuestions.has(questions[index].id) ? 'warning' :
                      'primary'
                    }
                  >
                    {index + 1}
                    {flaggedQuestions.has(questions[index].id) && (
                      <Flag 
                        sx={{ 
                          position: 'absolute', 
                          top: -4, 
                          right: -4, 
                          fontSize: 12 
                        }} 
                      />
                    )}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 1 }} />
                <Typography variant="caption">Answered</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: 1 }} />
                <Typography variant="caption">Flagged</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'grey.300', borderRadius: 1 }} />
                <Typography variant="caption">Not Visited</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Question Content */}
        <Grid item xs={12} md={9}>
          {currentQuestion && (
            <Fade in={true} key={currentQuestion.id}>
              <Paper sx={{ p: 3 }}>
                {/* Question Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={currentQuestion.type.toUpperCase()} size="small" />
                      <Chip 
                        label={currentQuestion.difficulty} 
                        size="small" 
                        color={
                          currentQuestion.difficulty === 'easy' ? 'success' :
                          currentQuestion.difficulty === 'medium' ? 'warning' : 'error'
                        }
                      />
                      {currentQuestion.points && (
                        <Chip label={`${currentQuestion.points} pts`} size="small" variant="outlined" />
                      )}
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      Question {currentQuestionIndex + 1}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Hint">
                      <IconButton 
                        onClick={() => setShowHint(!showHint)}
                        color={showHint ? 'primary' : 'default'}
                      >
                        <Lightbulb />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={flaggedQuestions.has(currentQuestion.id) ? 'Remove Flag' : 'Flag for Review'}>
                      <IconButton 
                        onClick={() => toggleFlag(currentQuestion.id)}
                        color={flaggedQuestions.has(currentQuestion.id) ? 'warning' : 'default'}
                      >
                        {flaggedQuestions.has(currentQuestion.id) ? <Bookmark /> : <BookmarkBorder />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Hint */}
                {showHint && currentQuestion.hint && (
                  <Zoom in={showHint}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>Hint:</strong> {currentQuestion.hint}
                      </Typography>
                    </Alert>
                  </Zoom>
                )}

                {/* Question Text */}
                <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  {currentQuestion.text}
                </Typography>

                {/* Question Image (if any) */}
                {currentQuestion.image && (
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <img 
                      src={currentQuestion.image} 
                      alt="Question" 
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                    />
                  </Box>
                )}

                {/* Answer Options */}
                <Box sx={{ mt: 3 }}>
                  {currentQuestion.type === 'mcq' && (
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      >
                        {currentQuestion.options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={option.id || option.text}
                            control={<Radio />}
                            label={
                              <Typography variant="body1" sx={{ py: 1 }}>
                                {option.text}
                              </Typography>
                            }
                            sx={{ 
                              mb: 1, 
                              p: 2, 
                              border: '1px solid transparent',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'action.hover',
                                borderColor: 'primary.main'
                              }
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  {currentQuestion.type === 'true_false' && (
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      >
                        <FormControlLabel
                          value="true"
                          control={<Radio />}
                          label="True"
                          sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                        />
                        <FormControlLabel
                          value="false"
                          control={<Radio />}
                          label="False"
                          sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                        />
                      </RadioGroup>
                    </FormControl>
                  )}

                  {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
                    <TextField
                      fullWidth
                      multiline
                      rows={currentQuestion.type === 'essay' ? 6 : 3}
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Enter your answer here..."
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<NavigateBefore />}
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => setShowSubmitDialog(true)}
                      >
                        Finish Quiz
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        endIcon={<NavigateNext />}
                        onClick={handleNextQuestion}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Fade>
          )}
        </Grid>
      </Grid>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Submit Quiz
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to submit your quiz?
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Quiz Summary:</strong>
            </Typography>
            <Typography variant="body2">
              • Total Questions: {questions.length}
            </Typography>
            <Typography variant="body2">
              • Answered: {Object.keys(answers).length}
            </Typography>
            <Typography variant="body2">
              • Unanswered: {questions.length - Object.keys(answers).length}
            </Typography>
            <Typography variant="body2">
              • Flagged for Review: {flaggedQuestions.size}
            </Typography>
            <Typography variant="body2">
              • Time Remaining: {formatTime(timeRemaining)}
            </Typography>
          </Box>

          {questions.length - Object.keys(answers).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have {questions.length - Object.keys(answers).length} unanswered questions. 
              These will be marked as incorrect.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitQuiz} 
            variant="contained" 
            color="success"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizInterface
