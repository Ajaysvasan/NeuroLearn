import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class StudentService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    })

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('neurolearn-token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('neurolearn-user')
          localStorage.removeItem('neurolearn-token')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Quiz Management
  async getAvailableQuizzes() {
    try {
      const response = await this.api.get('/student/quizzes/available')
      return response.data
    } catch (error) {
      console.error('Failed to fetch available quizzes:', error)
      // Return mock data
      return {
        success: true,
        data: [
          {
            id: 1,
            title: 'Mathematics - Algebra Basics',
            subject: 'Mathematics',
            duration: 30,
            questions: 15,
            difficulty: 'Medium',
            dueDate: '2024-02-15',
            description: 'Test your understanding of algebraic expressions and equations.'
          }
        ]
      }
    }
  }

  async getQuizDetails(quizId) {
    try {
      const response = await this.api.get(`/student/quizzes/${quizId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz details:', error)
      throw error
    }
  }

  async submitQuizAnswer(quizId, questionId, answer) {
    try {
      const response = await this.api.post(`/student/quizzes/${quizId}/answers`, {
        questionId,
        answer
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit quiz answer:', error)
      throw error
    }
  }

  async submitQuiz(quizId, answers) {
    try {
      const response = await this.api.post(`/student/quizzes/${quizId}/submit`, {
        answers
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      throw error
    }
  }

  // Results Management
  async getQuizResults(quizId) {
    try {
      const response = await this.api.get(`/student/results/${quizId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz results:', error)
      throw error
    }
  }

  async getAllResults() {
    try {
      const response = await this.api.get('/student/results')
      return response.data
    } catch (error) {
      console.error('Failed to fetch all results:', error)
      throw error
    }
  }

  // Progress Tracking
  async getProgress() {
    try {
      const response = await this.api.get('/student/progress')
      return response.data
    } catch (error) {
      console.error('Failed to fetch progress:', error)
      throw error
    }
  }
}

export const studentService = new StudentService()
export default studentService
