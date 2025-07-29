import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import studentService from '@services/student.service'
import { toast } from 'react-toastify'
import { QUIZ_CONFIG } from '@utils/constants'
import { debounce } from '@utils/helpers'

export const useQuiz = (quizId) => {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved') // 'saving', 'saved', 'error'
  const [quizStartTime, setQuizStartTime] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const navigate = useNavigate()
  const timerRef = useRef(null)
  const autoSaveRef = useRef(null)
  const startTimeRef = useRef(null)

  // Load quiz data
  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
  }, [quizId])

  // Set up timer when quiz starts
  useEffect(() => {
    if (quiz && quizStartTime && !isPaused) {
      setupTimer()
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [quiz, quizStartTime, isPaused])

  // Auto-save progress
  useEffect(() => {
    if (quiz && quizStartTime && Object.keys(answers).length > 0) {
      debouncedAutoSave()
    }
  }, [answers, flaggedQuestions])

  // Calculate progress
  useEffect(() => {
    if (quiz) {
      const totalQuestions = quiz.questions.length
      const answeredQuestions = Object.keys(answers).length
      setProgress(Math.round((answeredQuestions / totalQuestions) * 100))
    }
  }, [answers, quiz])

  // Load quiz data
  const loadQuiz = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await studentService.getQuizById(quizId)
      setQuiz(response.quiz)
      
      // Initialize timer if quiz has time limit
      if (response.quiz.timeLimit) {
        setTimeRemaining(response.quiz.timeLimit)
      }
      
      // Load saved progress if exists
      if (response.savedProgress) {
        setCurrentQuestionIndex(response.savedProgress.currentQuestionIndex || 0)
        setAnswers(response.savedProgress.answers || {})
        setFlaggedQuestions(new Set(response.savedProgress.flaggedQuestions || []))
        setQuizStartTime(new Date(response.savedProgress.startTime))
        startTimeRef.current = new Date(response.savedProgress.startTime)
        
        // Calculate remaining time
        const elapsedTime = (Date.now() - new Date(response.savedProgress.startTime).getTime()) / 1000
        const remaining = Math.max(0, response.quiz.timeLimit - elapsedTime)
        setTimeRemaining(remaining)
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz')
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  // Start quiz
  const startQuiz = async () => {
    try {
      setLoading(true)
      
      const response = await studentService.startQuiz(quizId)
      setQuizStartTime(new Date())
      startTimeRef.current = new Date()
      
      toast.success('Quiz started! Good luck!')
      
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to start quiz'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Setup timer
  const setupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        
        // Warning at 5 minutes
        if (newTime === 300) {
          toast.warning('⚠️ 5 minutes remaining!', {
            autoClose: 5000,
            position: 'top-center'
          })
        }
        
        // Warning at 1 minute
        if (newTime === 60) {
          toast.error('⚠️ Only 1 minute left!', {
            autoClose: false,
            position: 'top-center'
          })
        }
        
        // Auto-submit when time runs out
        if (newTime <= 0) {
          clearInterval(timerRef.current)
          handleTimeUp()
          return 0
        }
        
        return newTime
      })
    }, 1000)
  }

  // Handle time up
  const handleTimeUp = async () => {
    try {
      toast.error('Time\'s up! Quiz is being submitted automatically.')
      await submitQuiz(true) // Auto-submit
    } catch (err) {
      console.error('Auto-submit failed:', err)
      toast.error('Failed to auto-submit quiz. Please submit manually.')
    }
  }

  // Navigate to question
  const goToQuestion = (index) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  // Go to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Go to previous question
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Answer question
  const answerQuestion = async (questionId, answer) => {
    try {
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          answer,
          timestamp: new Date().toISOString(),
          questionIndex: currentQuestionIndex
        }
      }))
      
      // Submit answer to server
      await studentService.submitAnswer(quizId, questionId, answer)
      
    } catch (err) {
      console.error('Failed to submit answer:', err)
      toast.error('Failed to save answer. Please try again.')
    }
  }

  // Toggle question flag
  const toggleQuestionFlag = (questionId) => {
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

  // Auto-save progress
  const autoSave = async () => {
    try {
      setAutoSaveStatus('saving')
      
      const progressData = {
        currentQuestionIndex,
        answers,
        flaggedQuestions: Array.from(flaggedQuestions),
        timeSpent: startTimeRef.current ? 
          Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) : 0
      }
      
      await studentService.saveProgress(quizId, progressData)
      setAutoSaveStatus('saved')
      
    } catch (err) {
      console.error('Auto-save failed:', err)
      setAutoSaveStatus('error')
    }
  }

  // Debounced auto-save
  const debouncedAutoSave = useCallback(
    debounce(autoSave, QUIZ_CONFIG.AUTO_SAVE_INTERVAL),
    [currentQuestionIndex, answers, flaggedQuestions]
  )

  // Pause quiz
  const pauseQuiz = async () => {
    try {
      setIsPaused(true)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      await studentService.pauseQuiz(quizId)
      toast.info('Quiz paused')
      
    } catch (err) {
      console.error('Failed to pause quiz:', err)
      toast.error('Failed to pause quiz')
      setIsPaused(false)
    }
  }

  // Resume quiz
  const resumeQuiz = async () => {
    try {
      setIsPaused(false)
      
      await studentService.resumeQuiz(quizId)
      setupTimer()
      toast.success('Quiz resumed')
      
    } catch (err) {
      console.error('Failed to resume quiz:', err)
      toast.error('Failed to resume quiz')
      setIsPaused(true)
    }
  }

  // Submit quiz
  const submitQuiz = async (isAutoSubmit = false) => {
    try {
      setIsSubmitting(true)
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Prepare submission data
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, answerData]) => ({
          questionId,
          answer: answerData.answer,
          timestamp: answerData.timestamp
        })),
        timeSpent: startTimeRef.current ? 
          Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) : 0,
        isAutoSubmit
      }
      
      const response = await studentService.submitQuiz(quizId, submissionData)
      
      toast.success('Quiz submitted successfully!')
      
      // Navigate to results page
      navigate(`/student/results/${quizId}`, {
        state: { result: response.result }
      })
      
      return response
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit quiz'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get quiz statistics
  const getQuizStats = () => {
    if (!quiz) return null
    
    const totalQuestions = quiz.questions.length
    const answeredQuestions = Object.keys(answers).length
    const flaggedCount = flaggedQuestions.size
    const unansweredQuestions = totalQuestions - answeredQuestions
    
    return {
      totalQuestions,
      answeredQuestions,
      unansweredQuestions,
      flaggedCount,
      progress: Math.round((answeredQuestions / totalQuestions) * 100),
      timeSpent: startTimeRef.current ? 
        Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) : 0
    }
  }

  // Get current question
  const getCurrentQuestion = () => {
    return quiz?.questions[currentQuestionIndex] || null
  }

  // Check if question is answered
  const isQuestionAnswered = (questionId) => {
    return answers.hasOwnProperty(questionId)
  }

  // Check if question is flagged
  const isQuestionFlagged = (questionId) => {
    return flaggedQuestions.has(questionId)
  }

  // Get answer for question
  const getQuestionAnswer = (questionId) => {
    return answers[questionId]?.answer || null
  }

  // Format time remaining
  const formatTimeRemaining = () => {
    if (timeRemaining <= 0) return '00:00'
    
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = Math.floor(timeRemaining % 60)
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Check if quiz can be submitted
  const canSubmitQuiz = () => {
    return quiz && Object.keys(answers).length > 0 && !isSubmitting
  }

  // Cleanup function
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [])

  return {
    // State
    quiz,
    loading,
    error,
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    timeRemaining,
    isSubmitting,
    autoSaveStatus,
    quizStartTime,
    isPaused,
    progress,
    
    // Actions
    loadQuiz,
    startQuiz,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    answerQuestion,
    toggleQuestionFlag,
    pauseQuiz,
    resumeQuiz,
    submitQuiz,
    
    // Helpers
    getQuizStats,
    getCurrentQuestion,
    isQuestionAnswered,
    isQuestionFlagged,
    getQuestionAnswer,
    formatTimeRemaining,
    canSubmitQuiz,
    cleanup,
  }
}

export default useQuiz
