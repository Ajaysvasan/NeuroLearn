import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import studentService from '@services/student.service'
import { toast } from 'react-toastify'

// Initial state
const initialState = {
  // Dashboard data
  dashboardData: null,
  dashboardLoading: false,
  
  // Quiz management
  availableQuizzes: [],
  quizzesLoading: false,
  currentQuiz: null,
  quizAttempts: {},
  
  // Quiz taking state
  activeQuiz: {
    quizId: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: new Set(),
    timeRemaining: 0,
    startTime: null,
    isSubmitting: false,
    isPaused: false,
    autoSaveStatus: 'saved', // 'saving', 'saved', 'error'
  },
  
  // Results and progress
  quizResults: [],
  resultsLoading: false,
  selectedResult: null,
  
  // Progress tracking
  progressData: {
    overall: null,
    subjects: [],
    weekly: [],
    monthly: [],
    trends: [],
  },
  progressLoading: false,
  
  // Achievements and gamification
  achievements: [],
  badges: [],
  leaderboard: [],
  streak: {
    current: 0,
    longest: 0,
    lastActivity: null,
  },
  achievementsLoading: false,
  
  // Study plans and recommendations
  studyPlan: null,
  recommendations: {
    topics: [],
    questions: [],
    resources: [],
  },
  recommendationsLoading: false,
  
  // Bookmarks and favorites
  bookmarks: [],
  bookmarksLoading: false,
  
  // Goals and targets
  goals: [],
  goalsLoading: false,
  
  // Notifications
  notifications: [],
  unreadNotifications: 0,
  notificationsLoading: false,
  
  // Practice mode
  practiceQuestions: [],
  practiceSession: {
    active: false,
    questions: [],
    currentIndex: 0,
    answers: {},
    score: 0,
  },
  
  // Settings and preferences
  preferences: {
    notifications: {
      quizReminders: true,
      resultUpdates: true,
      achievements: true,
      weeklyProgress: true,
    },
    study: {
      autoSave: true,
      showHints: true,
      showExplanations: true,
      timerWarnings: true,
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      animations: true,
      soundEffects: false,
    },
    privacy: {
      showInLeaderboard: true,
      shareProgress: false,
      analyticsOptIn: true,
    },
  },
  
  // UI state
  sidebarOpen: true,
  activeSection: 'dashboard',
  
  // Error handling
  error: null,
  lastAction: null,
}

// Async thunks

// Dashboard
export const fetchDashboardData = createAsyncThunk(
  'student/fetchDashboardData',
  async (timeframe = 'week', { rejectWithValue }) => {
    try {
      const response = await studentService.getDashboardData(timeframe)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch dashboard data',
        details: error.response?.data,
      })
    }
  }
)

// Quiz management
export const fetchAvailableQuizzes = createAsyncThunk(
  'student/fetchAvailableQuizzes',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getAvailableQuizzes(filters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch available quizzes',
      })
    }
  }
)

export const startQuiz = createAsyncThunk(
  'student/startQuiz',
  async (quizId, { dispatch, rejectWithValue }) => {
    try {
      const response = await studentService.startQuiz(quizId)
      
      // Initialize quiz state
      dispatch(initializeQuizState({
        quizId,
        questions: response.questions,
        timeLimit: response.timeLimit,
        startTime: new Date().toISOString(),
      }))
      
      return response
    } catch (error) {
      toast.error('Failed to start quiz')
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to start quiz',
      })
    }
  }
)

export const submitAnswer = createAsyncThunk(
  'student/submitAnswer',
  async ({ quizId, questionId, answer }, { rejectWithValue }) => {
    try {
      const response = await studentService.submitAnswer(quizId, questionId, answer)
      return { questionId, answer, response }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to submit answer',
      })
    }
  }
)

export const submitQuiz = createAsyncThunk(
  'student/submitQuiz',
  async ({ quizId, answers }, { dispatch, rejectWithValue }) => {
    try {
      const response = await studentService.submitQuiz(quizId, answers)
      
      // Reset quiz state
      dispatch(resetActiveQuiz())
      
      toast.success('Quiz submitted successfully!')
      return response
    } catch (error) {
      toast.error('Failed to submit quiz')
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to submit quiz',
      })
    }
  }
)

// Results and progress
export const fetchQuizResults = createAsyncThunk(
  'student/fetchQuizResults',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getAllResults(filters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch quiz results',
      })
    }
  }
)

export const fetchProgressData = createAsyncThunk(
  'student/fetchProgressData',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getProgressData(filters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch progress data',
      })
    }
  }
)

// Achievements
export const fetchAchievements = createAsyncThunk(
  'student/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const [achievements, badges, leaderboard, streak] = await Promise.all([
        studentService.getAchievements(),
        studentService.getBadges(),
        studentService.getLeaderboard(),
        studentService.getStreak(),
      ])
      
      return { achievements, badges, leaderboard, streak }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch achievements',
      })
    }
  }
)

// Study plan and recommendations
export const fetchStudyPlan = createAsyncThunk(
  'student/fetchStudyPlan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.getStudyPlan()
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch study plan',
      })
    }
  }
)

export const fetchRecommendations = createAsyncThunk(
  'student/fetchRecommendations',
  async (type = 'topics', { rejectWithValue }) => {
    try {
      const response = await studentService.getRecommendations(type)
      return { type, data: response }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch recommendations',
      })
    }
  }
)

// Bookmarks
export const fetchBookmarks = createAsyncThunk(
  'student/fetchBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.getBookmarks()
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch bookmarks',
      })
    }
  }
)

export const addBookmark = createAsyncThunk(
  'student/addBookmark',
  async ({ itemType, itemId, notes }, { dispatch, rejectWithValue }) => {
    try {
      const response = await studentService.addBookmark(itemType, itemId, notes)
      toast.success('Bookmark added successfully!')
      return response
    } catch (error) {
      toast.error('Failed to add bookmark')
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to add bookmark',
      })
    }
  }
)

// Goals
export const fetchGoals = createAsyncThunk(
  'student/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.getGoals()
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch goals',
      })
    }
  }
)

export const createGoal = createAsyncThunk(
  'student/createGoal',
  async (goalData, { dispatch, rejectWithValue }) => {
    try {
      const response = await studentService.createGoal(goalData)
      toast.success('Goal created successfully!')
      return response
    } catch (error) {
      toast.error('Failed to create goal')
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create goal',
      })
    }
  }
)

// Notifications
export const fetchNotifications = createAsyncThunk(
  'student/fetchNotifications',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getNotifications(filters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch notifications',
      })
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'student/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await studentService.markNotificationAsRead(notificationId)
      return notificationId
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to mark notification as read',
      })
    }
  }
)

// Practice mode
export const fetchPracticeQuestions = createAsyncThunk(
  'student/fetchPracticeQuestions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getPracticeQuestions(filters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch practice questions',
      })
    }
  }
)

// Student slice
const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    // Quiz taking actions
    initializeQuizState: (state, action) => {
      const { quizId, questions, timeLimit, startTime } = action.payload
      state.activeQuiz = {
        ...initialState.activeQuiz,
        quizId,
        questions,
        timeRemaining: timeLimit,
        startTime,
      }
    },
    
    setCurrentQuestion: (state, action) => {
      state.activeQuiz.currentQuestionIndex = action.payload
    },
    
    answerQuestion: (state, action) => {
      const { questionId, answer } = action.payload
      state.activeQuiz.answers[questionId] = {
        answer,
        timestamp: new Date().toISOString(),
      }
    },
    
    toggleQuestionFlag: (state, action) => {
      const questionId = action.payload
      if (state.activeQuiz.flaggedQuestions.has(questionId)) {
        state.activeQuiz.flaggedQuestions.delete(questionId)
      } else {
        state.activeQuiz.flaggedQuestions.add(questionId)
      }
    },
    
    updateTimeRemaining: (state, action) => {
      state.activeQuiz.timeRemaining = action.payload
    },
    
    setQuizPaused: (state, action) => {
      state.activeQuiz.isPaused = action.payload
    },
    
    setAutoSaveStatus: (state, action) => {
      state.activeQuiz.autoSaveStatus = action.payload
    },
    
    resetActiveQuiz: (state) => {
      state.activeQuiz = initialState.activeQuiz
    },
    
    // UI actions
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    
    setActiveSection: (state, action) => {
      state.activeSection = action.payload
    },
    
    // Preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    
    updateNotificationPreferences: (state, action) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...action.payload,
      }
    },
    
    updateStudyPreferences: (state, action) => {
      state.preferences.study = {
        ...state.preferences.study,
        ...action.payload,
      }
    },
    
    updateDisplayPreferences: (state, action) => {
      state.preferences.display = {
        ...state.preferences.display,
        ...action.payload,
      }
    },
    
    // Practice mode
    startPracticeSession: (state, action) => {
      state.practiceSession = {
        active: true,
        questions: action.payload.questions,
        currentIndex: 0,
        answers: {},
        score: 0,
      }
    },
    
    answerPracticeQuestion: (state, action) => {
      const { questionId, answer, isCorrect } = action.payload
      state.practiceSession.answers[questionId] = { answer, isCorrect }
      if (isCorrect) {
        state.practiceSession.score += 1
      }
    },
    
    nextPracticeQuestion: (state) => {
      if (state.practiceSession.currentIndex < state.practiceSession.questions.length - 1) {
        state.practiceSession.currentIndex += 1
      }
    },
    
    endPracticeSession: (state) => {
      state.practiceSession = initialState.practiceSession
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    
    setError: (state, action) => {
      state.error = action.payload
    },
    
    // Selected items
    setSelectedResult: (state, action) => {
      state.selectedResult = action.payload
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Dashboard cases
      .addCase(fetchDashboardData.pending, (state) => {
        state.dashboardLoading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.dashboardLoading = false
        state.dashboardData = action.payload
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.dashboardLoading = false
        state.error = action.payload
      })
      
      // Available quizzes cases
      .addCase(fetchAvailableQuizzes.pending, (state) => {
        state.quizzesLoading = true
      })
      .addCase(fetchAvailableQuizzes.fulfilled, (state, action) => {
        state.quizzesLoading = false
        state.availableQuizzes = action.payload.quizzes || action.payload
      })
      .addCase(fetchAvailableQuizzes.rejected, (state, action) => {
        state.quizzesLoading = false
        state.error = action.payload
      })
      
      // Start quiz cases
      .addCase(startQuiz.pending, (state) => {
        state.quizzesLoading = true
      })
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.quizzesLoading = false
        state.currentQuiz = action.payload
      })
      .addCase(startQuiz.rejected, (state, action) => {
        state.quizzesLoading = false
        state.error = action.payload
      })
      
      // Submit answer cases
      .addCase(submitAnswer.pending, (state) => {
        state.activeQuiz.autoSaveStatus = 'saving'
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.activeQuiz.autoSaveStatus = 'saved'
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.activeQuiz.autoSaveStatus = 'error'
        state.error = action.payload
      })
      
      // Submit quiz cases
      .addCase(submitQuiz.pending, (state) => {
        state.activeQuiz.isSubmitting = true
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.activeQuiz.isSubmitting = false
        // Quiz state is reset by the action creator
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.activeQuiz.isSubmitting = false
        state.error = action.payload
      })
      
      // Quiz results cases
      .addCase(fetchQuizResults.pending, (state) => {
        state.resultsLoading = true
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.resultsLoading = false
        state.quizResults = action.payload.results || action.payload
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.resultsLoading = false
        state.error = action.payload
      })
      
      // Progress data cases
      .addCase(fetchProgressData.pending, (state) => {
        state.progressLoading = true
      })
      .addCase(fetchProgressData.fulfilled, (state, action) => {
        state.progressLoading = false
        state.progressData = { ...state.progressData, ...action.payload }
      })
      .addCase(fetchProgressData.rejected, (state, action) => {
        state.progressLoading = false
        state.error = action.payload
      })
      
      // Achievements cases
      .addCase(fetchAchievements.pending, (state) => {
        state.achievementsLoading = true
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievementsLoading = false
        state.achievements = action.payload.achievements
        state.badges = action.payload.badges
        state.leaderboard = action.payload.leaderboard
        state.streak = action.payload.streak
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.achievementsLoading = false
        state.error = action.payload
      })
      
      // Study plan cases
      .addCase(fetchStudyPlan.pending, (state) => {
        state.recommendationsLoading = true
      })
      .addCase(fetchStudyPlan.fulfilled, (state, action) => {
        state.recommendationsLoading = false
        state.studyPlan = action.payload
      })
      .addCase(fetchStudyPlan.rejected, (state, action) => {
        state.recommendationsLoading = false
        state.error = action.payload
      })
      
      // Recommendations cases
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        const { type, data } = action.payload
        state.recommendations[type] = data
      })
      
      // Bookmarks cases
      .addCase(fetchBookmarks.pending, (state) => {
        state.bookmarksLoading = true
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.bookmarksLoading = false
        state.bookmarks = action.payload.bookmarks || action.payload
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.bookmarksLoading = false
        state.error = action.payload
      })
      
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.bookmarks.unshift(action.payload)
      })
      
      // Goals cases
      .addCase(fetchGoals.pending, (state) => {
        state.goalsLoading = true
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.goalsLoading = false
        state.goals = action.payload.goals || action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.goalsLoading = false
        state.error = action.payload
      })
      
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload)
      })
      
      // Notifications cases
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsLoading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false
        state.notifications = action.payload.notifications || action.payload
        state.unreadNotifications = state.notifications.filter(n => !n.read).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsLoading = false
        state.error = action.payload
      })
      
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload
        const notification = state.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read = true
          state.unreadNotifications = Math.max(0, state.unreadNotifications - 1)
        }
      })
      
      // Practice questions cases
      .addCase(fetchPracticeQuestions.fulfilled, (state, action) => {
        state.practiceQuestions = action.payload.questions || action.payload
      })
  },
})

// Selectors
export const selectStudent = (state) => state.student
export const selectDashboardData = (state) => state.student.dashboardData
export const selectDashboardLoading = (state) => state.student.dashboardLoading

export const selectAvailableQuizzes = (state) => state.student.availableQuizzes
export const selectQuizzesLoading = (state) => state.student.quizzesLoading
export const selectCurrentQuiz = (state) => state.student.currentQuiz

export const selectActiveQuiz = (state) => state.student.activeQuiz
export const selectCurrentQuestion = (state) => {
  const { activeQuiz } = state.student
  return activeQuiz.questions[activeQuiz.currentQuestionIndex] || null
}
export const selectQuizProgress = (state) => {
  const { activeQuiz } = state.student
  const totalQuestions = activeQuiz.questions.length
  const answeredQuestions = Object.keys(activeQuiz.answers).length
  return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
}

export const selectQuizResults = (state) => state.student.quizResults
export const selectResultsLoading = (state) => state.student.resultsLoading
export const selectSelectedResult = (state) => state.student.selectedResult

export const selectProgressData = (state) => state.student.progressData
export const selectProgressLoading = (state) => state.student.progressLoading

export const selectAchievements = (state) => state.student.achievements
export const selectBadges = (state) => state.student.badges
export const selectLeaderboard = (state) => state.student.leaderboard
export const selectStreak = (state) => state.student.streak
export const selectAchievementsLoading = (state) => state.student.achievementsLoading

export const selectStudyPlan = (state) => state.student.studyPlan
export const selectRecommendations = (state) => state.student.recommendations
export const selectRecommendationsLoading = (state) => state.student.recommendationsLoading

export const selectBookmarks = (state) => state.student.bookmarks
export const selectBookmarksLoading = (state) => state.student.bookmarksLoading

export const selectGoals = (state) => state.student.goals
export const selectGoalsLoading = (state) => state.student.goalsLoading

export const selectNotifications = (state) => state.student.notifications
export const selectUnreadNotifications = (state) => state.student.unreadNotifications
export const selectNotificationsLoading = (state) => state.student.notificationsLoading

export const selectPracticeSession = (state) => state.student.practiceSession
export const selectPracticeQuestions = (state) => state.student.practiceQuestions

export const selectStudentPreferences = (state) => state.student.preferences
export const selectNotificationPreferences = (state) => state.student.preferences.notifications
export const selectStudyPreferences = (state) => state.student.preferences.study
export const selectDisplayPreferences = (state) => state.student.preferences.display

export const selectStudentError = (state) => state.student.error
export const selectSidebarOpen = (state) => state.student.sidebarOpen
export const selectActiveSection = (state) => state.student.activeSection

// Actions
export const {
  initializeQuizState,
  setCurrentQuestion,
  answerQuestion,
  toggleQuestionFlag,
  updateTimeRemaining,
  setQuizPaused,
  setAutoSaveStatus,
  resetActiveQuiz,
  setSidebarOpen,
  setActiveSection,
  updatePreferences,
  updateNotificationPreferences,
  updateStudyPreferences,
  updateDisplayPreferences,
  startPracticeSession,
  answerPracticeQuestion,
  nextPracticeQuestion,
  endPracticeSession,
  clearError,
  setError,
  setSelectedResult,
} = studentSlice.actions

export default studentSlice.reducer
