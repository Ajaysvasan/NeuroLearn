import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import teacherService from '@services/teacher.service'
import { toast } from 'react-toastify'

// Initial state
const initialState = {
  // Dashboard data
  dashboardData: null,
  dashboardLoading: false,
  
  // Syllabus management
  syllabusList: [],
  selectedSyllabus: null,
  syllabusLoading: false,
  syllabusUploadProgress: 0,
  
  // Question management
  questions: [],
  questionsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  questionsLoading: false,
  selectedQuestion: null,
  questionFilters: {
    syllabusId: null,
    difficulty: null,
    type: null,
    status: null,
    search: '',
  },
  
  // Quiz management
  quizzes: [],
  quizzesPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  quizzesLoading: false,
  selectedQuiz: null,
  quizFilters: {
    status: null,
    subject: null,
    search: '',
  },
  
  // Student management
  students: [],
  studentsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  studentsLoading: false,
  selectedStudent: null,
  studentFilters: {
    class: null,
    subject: null,
    status: null,
    search: '',
  },
  
  // Analytics
  analytics: {
    classPerformance: null,
    questionAnalytics: null,
    subjectProgress: null,
    studentProgress: null,
  },
  analyticsLoading: false,
  
  // Quiz results
  quizResults: [],
  resultsLoading: false,
  resultsPagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  
  // Settings
  settings: {
    notifications: true,
    autoSave: true,
    defaultQuizSettings: {
      duration: 30,
      passingScore: 70,
      maxAttempts: 2,
      shuffleQuestions: true,
      showResults: true,
    },
    grading: {
      scale: 'percentage',
      roundingRule: 'nearest',
    },
  },
  
  // UI state
  sidebarCollapsed: false,
  activeTab: 'dashboard',
  
  // Error handling
  error: null,
  lastAction: null,
}

// Async thunks

// Dashboard
export const fetchDashboardData = createAsyncThunk(
  'teacher/fetchDashboardData',
  async (timeframe = 'week', { rejectWithValue }) => {
    try {
      const response = await teacherService.getDashboardData(timeframe)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch dashboard data',
        details: error.response?.data,
      })
    }
  }
)

// Syllabus management
export const uploadSyllabus = createAsyncThunk(
  'teacher/uploadSyllabus',
  async ({ syllabusData, file }, { dispatch, rejectWithValue }) => {
    try {
      const response = await teacherService.uploadSyllabus(
        syllabusData,
        file,
        (progress) => {
          dispatch(setSyllabusUploadProgress(progress))
        }
      )
      
      toast.success('Syllabus uploaded successfully!')
      return response
    } catch (error) {
      toast.error('Failed to upload syllabus')
      return rejectWithValue({
        message: error.response?.data?.message || 'Upload failed',
        details: error.response?.data,
      })
    }
  }
)

export const fetchSyllabusList = createAsyncThunk(
  'teacher/fetchSyllabusList',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getSyllabusList(filters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch syllabus list',
      })
    }
  }
)

export const deleteSyllabus = createAsyncThunk(
  'teacher/deleteSyllabus',
  async (syllabusId, { dispatch, rejectWithValue }) => {
    try {
      await teacherService.deleteSyllabus(syllabusId)
      dispatch(fetchSyllabusList())
      toast.success('Syllabus deleted successfully!')
      return syllabusId
    } catch (error) {
      toast.error('Failed to delete syllabus')
      return rejectWithValue({
        message: error.response?.data?.message || 'Delete failed',
      })
    }
  }
)

// Question management
export const fetchQuestions = createAsyncThunk(
  'teacher/fetchQuestions',
  async ({ page = 1, filters = {} }, { getState, rejectWithValue }) => {
    try {
      const { teacher } = getState()
      const requestFilters = { ...teacher.questionFilters, ...filters, page }
      
      const response = await teacherService.getQuestions(requestFilters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch questions',
      })
    }
  }
)

export const generateQuestions = createAsyncThunk(
  'teacher/generateQuestions',
  async ({ syllabusId, options }, { dispatch, rejectWithValue }) => {
    try {
      const response = await teacherService.generateQuestions(syllabusId, options)
      
      // Refresh questions list
      dispatch(fetchQuestions({ page: 1 }))
      
      toast.success(`Generated ${response.questions.length} questions successfully!`)
      return response
    } catch (error) {
      toast.error('Failed to generate questions')
      return rejectWithValue({
        message: error.response?.data?.message || 'Generation failed',
      })
    }
  }
)

export const approveQuestion = createAsyncThunk(
  'teacher/approveQuestion',
  async (questionId, { dispatch, rejectWithValue }) => {
    try {
      await teacherService.approveQuestion(questionId)
      dispatch(fetchQuestions({ page: 1 }))
      toast.success('Question approved!')
      return questionId
    } catch (error) {
      toast.error('Failed to approve question')
      return rejectWithValue({
        message: error.response?.data?.message || 'Approval failed',
      })
    }
  }
)

export const rejectQuestion = createAsyncThunk(
  'teacher/rejectQuestion',
  async ({ questionId, reason }, { dispatch, rejectWithValue }) => {
    try {
      await teacherService.rejectQuestion(questionId, reason)
      dispatch(fetchQuestions({ page: 1 }))
      toast.success('Question rejected!')
      return questionId
    } catch (error) {
      toast.error('Failed to reject question')
      return rejectWithValue({
        message: error.response?.data?.message || 'Rejection failed',
      })
    }
  }
)

// Quiz management
export const fetchQuizzes = createAsyncThunk(
  'teacher/fetchQuizzes',
  async ({ page = 1, filters = {} }, { getState, rejectWithValue }) => {
    try {
      const { teacher } = getState()
      const requestFilters = { ...teacher.quizFilters, ...filters, page }
      
      const response = await teacherService.getQuizzes(requestFilters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch quizzes',
      })
    }
  }
)

export const createQuiz = createAsyncThunk(
  'teacher/createQuiz',
  async (quizData, { dispatch, rejectWithValue }) => {
    try {
      const response = await teacherService.createQuiz(quizData)
      dispatch(fetchQuizzes({ page: 1 }))
      toast.success('Quiz created successfully!')
      return response
    } catch (error) {
      toast.error('Failed to create quiz')
      return rejectWithValue({
        message: error.response?.data?.message || 'Creation failed',
      })
    }
  }
)

export const publishQuiz = createAsyncThunk(
  'teacher/publishQuiz',
  async (quizId, { dispatch, rejectWithValue }) => {
    try {
      await teacherService.publishQuiz(quizId)
      dispatch(fetchQuizzes({ page: 1 }))
      toast.success('Quiz published successfully!')
      return quizId
    } catch (error) {
      toast.error('Failed to publish quiz')
      return rejectWithValue({
        message: error.response?.data?.message || 'Publication failed',
      })
    }
  }
)

// Student management
export const fetchStudents = createAsyncThunk(
  'teacher/fetchStudents',
  async ({ page = 1, filters = {} }, { getState, rejectWithValue }) => {
    try {
      const { teacher } = getState()
      const requestFilters = { ...teacher.studentFilters, ...filters, page }
      
      const response = await teacherService.getStudents(requestFilters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch students',
      })
    }
  }
)

export const enrollStudent = createAsyncThunk(
  'teacher/enrollStudent',
  async (studentData, { dispatch, rejectWithValue }) => {
    try {
      const response = await teacherService.enrollStudent(studentData)
      dispatch(fetchStudents({ page: 1 }))
      toast.success('Student enrolled successfully!')
      return response
    } catch (error) {
      toast.error('Failed to enroll student')
      return rejectWithValue({
        message: error.response?.data?.message || 'Enrollment failed',
      })
    }
  }
)

// Analytics
export const fetchClassPerformance = createAsyncThunk(
  'teacher/fetchClassPerformance',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getClassPerformance(filters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch class performance',
      })
    }
  }
)

export const fetchQuizResults = createAsyncThunk(
  'teacher/fetchQuizResults',
  async ({ quizId, page = 1, filters = {} }, { rejectWithValue }) => {
    try {
      const requestFilters = { ...filters, page }
      const response = await teacherService.getQuizResults(quizId, requestFilters)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch quiz results',
      })
    }
  }
)

// Teacher slice
const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    // UI actions
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    
    // Filter actions
    setQuestionFilters: (state, action) => {
      state.questionFilters = { ...state.questionFilters, ...action.payload }
    },
    
    setQuizFilters: (state, action) => {
      state.quizFilters = { ...state.quizFilters, ...action.payload }
    },
    
    setStudentFilters: (state, action) => {
      state.studentFilters = { ...state.studentFilters, ...action.payload }
    },
    
    // Selection actions
    setSelectedSyllabus: (state, action) => {
      state.selectedSyllabus = action.payload
    },
    
    setSelectedQuestion: (state, action) => {
      state.selectedQuestion = action.payload
    },
    
    setSelectedQuiz: (state, action) => {
      state.selectedQuiz = action.payload
    },
    
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload
    },
    
    // Progress tracking
    setSyllabusUploadProgress: (state, action) => {
      state.syllabusUploadProgress = action.payload
    },
    
    // Settings
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    
    updateDefaultQuizSettings: (state, action) => {
      state.settings.defaultQuizSettings = {
        ...state.settings.defaultQuizSettings,
        ...action.payload,
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    
    setError: (state, action) => {
      state.error = action.payload
    },
    
    // Reset actions
    resetQuestions: (state) => {
      state.questions = []
      state.questionsPagination = initialState.questionsPagination
    },
    
    resetQuizzes: (state) => {
      state.quizzes = []
      state.quizzesPagination = initialState.quizzesPagination
    },
    
    resetStudents: (state) => {
      state.students = []
      state.studentsPagination = initialState.studentsPagination
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
      
      // Syllabus cases
      .addCase(uploadSyllabus.pending, (state) => {
        state.syllabusLoading = true
        state.error = null
        state.syllabusUploadProgress = 0
      })
      .addCase(uploadSyllabus.fulfilled, (state, action) => {
        state.syllabusLoading = false
        state.syllabusUploadProgress = 100
        state.syllabusList.unshift(action.payload.syllabus)
      })
      .addCase(uploadSyllabus.rejected, (state, action) => {
        state.syllabusLoading = false
        state.error = action.payload
        state.syllabusUploadProgress = 0
      })
      
      .addCase(fetchSyllabusList.pending, (state) => {
        state.syllabusLoading = true
      })
      .addCase(fetchSyllabusList.fulfilled, (state, action) => {
        state.syllabusLoading = false
        state.syllabusList = action.payload.syllabusList || action.payload
      })
      .addCase(fetchSyllabusList.rejected, (state, action) => {
        state.syllabusLoading = false
        state.error = action.payload
      })
      
      // Questions cases
      .addCase(fetchQuestions.pending, (state) => {
        state.questionsLoading = true
        state.error = null
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false
        state.questions = action.payload.questions || action.payload.items
        state.questionsPagination = action.payload.pagination || state.questionsPagination
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.questionsLoading = false
        state.error = action.payload
      })
      
      .addCase(generateQuestions.pending, (state) => {
        state.questionsLoading = true
      })
      .addCase(generateQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false
      })
      .addCase(generateQuestions.rejected, (state, action) => {
        state.questionsLoading = false
        state.error = action.payload
      })
      
      // Quizzes cases
      .addCase(fetchQuizzes.pending, (state) => {
        state.quizzesLoading = true
        state.error = null
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.quizzesLoading = false
        state.quizzes = action.payload.quizzes || action.payload.items
        state.quizzesPagination = action.payload.pagination || state.quizzesPagination
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.quizzesLoading = false
        state.error = action.payload
      })
      
      .addCase(createQuiz.pending, (state) => {
        state.quizzesLoading = true
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.quizzesLoading = false
        state.quizzes.unshift(action.payload.quiz)
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.quizzesLoading = false
        state.error = action.payload
      })
      
      // Students cases
      .addCase(fetchStudents.pending, (state) => {
        state.studentsLoading = true
        state.error = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.studentsLoading = false
        state.students = action.payload.students || action.payload.items
        state.studentsPagination = action.payload.pagination || state.studentsPagination
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.studentsLoading = false
        state.error = action.payload
      })
      
      // Analytics cases
      .addCase(fetchClassPerformance.pending, (state) => {
        state.analyticsLoading = true
      })
      .addCase(fetchClassPerformance.fulfilled, (state, action) => {
        state.analyticsLoading = false
        state.analytics.classPerformance = action.payload
      })
      .addCase(fetchClassPerformance.rejected, (state, action) => {
        state.analyticsLoading = false
        state.error = action.payload
      })
      
      // Quiz results cases
      .addCase(fetchQuizResults.pending, (state) => {
        state.resultsLoading = true
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.resultsLoading = false
        state.quizResults = action.payload.results || action.payload.items
        state.resultsPagination = action.payload.pagination || state.resultsPagination
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.resultsLoading = false
        state.error = action.payload
      })
  },
})

// Selectors
export const selectTeacher = (state) => state.teacher
export const selectDashboardData = (state) => state.teacher.dashboardData
export const selectDashboardLoading = (state) => state.teacher.dashboardLoading

export const selectSyllabusList = (state) => state.teacher.syllabusList
export const selectSelectedSyllabus = (state) => state.teacher.selectedSyllabus
export const selectSyllabusLoading = (state) => state.teacher.syllabusLoading
export const selectSyllabusUploadProgress = (state) => state.teacher.syllabusUploadProgress

export const selectQuestions = (state) => state.teacher.questions
export const selectQuestionsLoading = (state) => state.teacher.questionsLoading
export const selectQuestionsPagination = (state) => state.teacher.questionsPagination
export const selectQuestionFilters = (state) => state.teacher.questionFilters
export const selectSelectedQuestion = (state) => state.teacher.selectedQuestion

export const selectQuizzes = (state) => state.teacher.quizzes
export const selectQuizzesLoading = (state) => state.teacher.quizzesLoading
export const selectQuizzesPagination = (state) => state.teacher.quizzesPagination
export const selectQuizFilters = (state) => state.teacher.quizFilters
export const selectSelectedQuiz = (state) => state.teacher.selectedQuiz

export const selectStudents = (state) => state.teacher.students
export const selectStudentsLoading = (state) => state.teacher.studentsLoading
export const selectStudentsPagination = (state) => state.teacher.studentsPagination
export const selectStudentFilters = (state) => state.teacher.studentFilters
export const selectSelectedStudent = (state) => state.teacher.selectedStudent

export const selectAnalytics = (state) => state.teacher.analytics
export const selectAnalyticsLoading = (state) => state.teacher.analyticsLoading

export const selectQuizResults = (state) => state.teacher.quizResults
export const selectResultsLoading = (state) => state.teacher.resultsLoading
export const selectResultsPagination = (state) => state.teacher.resultsPagination

export const selectTeacherSettings = (state) => state.teacher.settings
export const selectDefaultQuizSettings = (state) => state.teacher.settings.defaultQuizSettings

export const selectTeacherError = (state) => state.teacher.error
export const selectSidebarCollapsed = (state) => state.teacher.sidebarCollapsed
export const selectActiveTab = (state) => state.teacher.activeTab

// Actions
export const {
  setSidebarCollapsed,
  setActiveTab,
  setQuestionFilters,
  setQuizFilters,
  setStudentFilters,
  setSelectedSyllabus,
  setSelectedQuestion,
  setSelectedQuiz,
  setSelectedStudent,
  setSyllabusUploadProgress,
  updateSettings,
  updateDefaultQuizSettings,
  clearError,
  setError,
  resetQuestions,
  resetQuizzes,
  resetStudents,
} = teacherSlice.actions

export default teacherSlice.reducer
