import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class TeacherService {
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

  // Student Management
  async getStudents(filters = {}) {
    try {
      const response = await this.api.get('/teacher/students', { params: filters })
      return response.data
    } catch (error) {
      console.error('Failed to fetch students:', error)
      // Return mock data for demonstration
      return {
        success: true,
        data: [
          {
            id: 1,
            name: 'Adithya Kumar',
            email: 'adithya.kumar@email.com',
            class: 'Class 12A',
            rollNumber: 'TC001',
            performance: 92,
            status: 'active',
            lastActivity: '2024-01-28',
            quizzesCompleted: 8,
            averageScore: 92
          },
          {
            id: 2,
            name: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            class: 'Class 12A',
            rollNumber: 'TC002',
            performance: 87,
            status: 'active',
            lastActivity: '2024-01-27',
            quizzesCompleted: 7,
            averageScore: 87
          },
          {
            id: 3,
            name: 'Arjun Patel',
            email: 'arjun.patel@email.com',
            class: 'Class 11B',
            rollNumber: 'TC045',
            performance: 45,
            status: 'needs_attention',
            lastActivity: '2024-01-20',
            quizzesCompleted: 3,
            averageScore: 45
          }
        ]
      }
    }
  }

  async getStudentDetails(studentId) {
    try {
      const response = await this.api.get(`/teacher/students/${studentId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch student details:', error)
      throw error
    }
  }

  // Syllabus Management
  async getSyllabusList() {
    try {
      const response = await this.api.get('/teacher/syllabi')
      return response.data
    } catch (error) {
      console.error('Failed to fetch syllabi:', error)
      // Return mock data
      return {
        success: true,
        data: [
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
            subject: 'Mathematics'
          }
        ]
      }
    }
  }

  async uploadSyllabus(formData) {
    try {
      const response = await this.api.post('/teacher/syllabi/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          // You can emit progress events here
          console.log(`Upload progress: ${percentCompleted}%`)
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to upload syllabus:', error)
      throw error
    }
  }

  async deleteSyllabus(syllabusId) {
    try {
      const response = await this.api.delete(`/teacher/syllabi/${syllabusId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete syllabus:', error)
      throw error
    }
  }

  // Question Management
  async generateQuestions(syllabusId, options = {}) {
    try {
      const response = await this.api.post(`/teacher/questions/generate`, {
        syllabusId,
        ...options
      })
      return response.data
    } catch (error) {
      console.error('Failed to generate questions:', error)
      // Simulate success for demo
      return {
        success: true,
        message: 'Questions generated successfully',
        data: { generated: options.count || 20 }
      }
    }
  }

  async getQuestions(filters = {}) {
    try {
      const response = await this.api.get('/teacher/questions', { params: filters })
      return response.data
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      // Return mock data
      return {
        success: true,
        data: {
          questions: [
            {
              id: 1,
              text: 'What is the derivative of x²?',
              type: 'mcq',
              difficulty: 'easy',
              subject: 'Mathematics',
              topic: 'Calculus',
              status: 'approved',
              options: [
                { text: '2x', isCorrect: true },
                { text: 'x²', isCorrect: false },
                { text: '2', isCorrect: false },
                { text: 'x', isCorrect: false }
              ]
            }
          ],
          total: 1
        }
      }
    }
  }

  async createQuestion(questionData) {
    try {
      const response = await this.api.post('/teacher/questions', questionData)
      return response.data
    } catch (error) {
      console.error('Failed to create question:', error)
      throw error
    }
  }

  async updateQuestion(questionId, questionData) {
    try {
      const response = await this.api.put(`/teacher/questions/${questionId}`, questionData)
      return response.data
    } catch (error) {
      console.error('Failed to update question:', error)
      throw error
    }
  }

  async deleteQuestion(questionId) {
    try {
      const response = await this.api.delete(`/teacher/questions/${questionId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete question:', error)
      throw error
    }
  }

  async approveQuestion(questionId) {
    try {
      const response = await this.api.patch(`/teacher/questions/${questionId}/approve`)
      return response.data
    } catch (error) {
      console.error('Failed to approve question:', error)
      throw error
    }
  }

  async rejectQuestion(questionId, reason) {
    try {
      const response = await this.api.patch(`/teacher/questions/${questionId}/reject`, { reason })
      return response.data
    } catch (error) {
      console.error('Failed to reject question:', error)
      throw error
    }
  }

  // Analytics and Reports
  async getTeacherAnalytics() {
    try {
      const response = await this.api.get('/teacher/analytics')
      return response.data
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      throw error
    }
  }

  async exportStudentData(filters = {}) {
    try {
      const response = await this.api.get('/teacher/students/export', {
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Failed to export student data:', error)
      throw error
    }
  }
}

export const teacherService = new TeacherService()
export default teacherService
