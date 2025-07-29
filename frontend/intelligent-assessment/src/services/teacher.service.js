import api, { apiUtils } from './api'

class TeacherService {
  // Dashboard data
  async getDashboardData(timeframe = 'week') {
    try {
      const response = await api.get('/teacher/dashboard', {
        params: { timeframe }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      throw error
    }
  }

  // Syllabus Management
  async uploadSyllabus(syllabusData, file, onProgress) {
    try {
      const formData = new FormData()
      formData.append('syllabus', file)
      formData.append('name', syllabusData.name)
      formData.append('subject', syllabusData.subject)
      formData.append('grade', syllabusData.grade)
      formData.append('difficulty', syllabusData.difficulty)
      formData.append('description', syllabusData.description)

      const response = await api.post('/teacher/syllabus/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Syllabus upload failed:', error)
      throw error
    }
  }

  async getSyllabusList(filters = {}) {
    try {
      const response = await api.get('/teacher/syllabus', {
        params: filters
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch syllabus list:', error)
      throw error
    }
  }

  async getSyllabusById(syllabusId) {
    try {
      const response = await api.get(`/teacher/syllabus/${syllabusId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch syllabus:', error)
      throw error
    }
  }

  async updateSyllabus(syllabusId, updateData) {
    try {
      const response = await api.put(`/teacher/syllabus/${syllabusId}`, updateData)
      return response.data
    } catch (error) {
      console.error('Failed to update syllabus:', error)
      throw error
    }
  }

  async deleteSyllabus(syllabusId) {
    try {
      const response = await api.delete(`/teacher/syllabus/${syllabusId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete syllabus:', error)
      throw error
    }
  }

  async processSyllabus(syllabusId, options = {}) {
    try {
      const response = await api.post(`/teacher/syllabus/${syllabusId}/process`, options)
      return response.data
    } catch (error) {
      console.error('Failed to process syllabus:', error)
      throw error
    }
  }

  // Question Management
  async generateQuestions(syllabusId, options = {}) {
    try {
      const response = await api.post(`/teacher/questions/generate`, {
        syllabusId,
        count: options.count || 10,
        difficulty: options.difficulty || 'mixed',
        types: options.types || ['mcq', 'short_answer'],
        topics: options.topics || [],
        ...options
      })
      return response.data
    } catch (error) {
      console.error('Failed to generate questions:', error)
      throw error
    }
  }

  async getQuestions(filters = {}) {
    try {
      const response = await apiUtils.getPaginated('/teacher/questions', 
        filters.page || 1,
        filters.limit || 20,
        {
          syllabusId: filters.syllabusId,
          difficulty: filters.difficulty,
          type: filters.type,
          status: filters.status,
          search: filters.search
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      throw error
    }
  }

  async getQuestionById(questionId) {
    try {
      const response = await api.get(`/teacher/questions/${questionId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch question:', error)
      throw error
    }
  }

  async updateQuestion(questionId, updateData) {
    try {
      const response = await api.put(`/teacher/questions/${questionId}`, updateData)
      return response.data
    } catch (error) {
      console.error('Failed to update question:', error)
      throw error
    }
  }

  async deleteQuestion(questionId) {
    try {
      const response = await api.delete(`/teacher/questions/${questionId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete question:', error)
      throw error
    }
  }

  async approveQuestion(questionId) {
    try {
      const response = await api.post(`/teacher/questions/${questionId}/approve`)
      return response.data
    } catch (error) {
      console.error('Failed to approve question:', error)
      throw error
    }
  }

  async rejectQuestion(questionId, reason) {
    try {
      const response = await api.post(`/teacher/questions/${questionId}/reject`, { reason })
      return response.data
    } catch (error) {
      console.error('Failed to reject question:', error)
      throw error
    }
  }

  async bulkActionQuestions(questionIds, action, data = {}) {
    try {
      const response = await api.post('/teacher/questions/bulk-action', {
        questionIds,
        action,
        data
      })
      return response.data
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      throw error
    }
  }

  // Quiz Management
  async createQuiz(quizData) {
    try {
      const response = await api.post('/teacher/quizzes', {
        title: quizData.title,
        description: quizData.description,
        syllabusId: quizData.syllabusId,
        questions: quizData.questions,
        duration: quizData.duration,
        passingScore: quizData.passingScore,
        maxAttempts: quizData.maxAttempts,
        startDate: quizData.startDate,
        endDate: quizData.endDate,
        settings: quizData.settings
      })
      return response.data
    } catch (error) {
      console.error('Failed to create quiz:', error)
      throw error
    }
  }

  async getQuizzes(filters = {}) {
    try {
      const response = await apiUtils.getPaginated('/teacher/quizzes',
        filters.page || 1,
        filters.limit || 20,
        {
          status: filters.status,
          subject: filters.subject,
          search: filters.search
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
      throw error
    }
  }

  async getQuizById(quizId) {
    try {
      const response = await api.get(`/teacher/quizzes/${quizId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
      throw error
    }
  }

  async updateQuiz(quizId, updateData) {
    try {
      const response = await api.put(`/teacher/quizzes/${quizId}`, updateData)
      return response.data
    } catch (error) {
      console.error('Failed to update quiz:', error)
      throw error
    }
  }

  async deleteQuiz(quizId) {
    try {
      const response = await api.delete(`/teacher/quizzes/${quizId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete quiz:', error)
      throw error
    }
  }

  async publishQuiz(quizId) {
    try {
      const response = await api.post(`/teacher/quizzes/${quizId}/publish`)
      return response.data
    } catch (error) {
      console.error('Failed to publish quiz:', error)
      throw error
    }
  }

  async duplicateQuiz(quizId, newTitle) {
    try {
      const response = await api.post(`/teacher/quizzes/${quizId}/duplicate`, {
        title: newTitle
      })
      return response.data
    } catch (error) {
      console.error('Failed to duplicate quiz:', error)
      throw error
    }
  }

  // Student Management
  async getStudents(filters = {}) {
    try {
      const response = await apiUtils.getPaginated('/teacher/students',
        filters.page || 1,
        filters.limit || 20,
        {
          class: filters.class,
          subject: filters.subject,
          status: filters.status,
          search: filters.search,
          performance: filters.performance
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch students:', error)
      throw error
    }
  }

  async getStudentById(studentId) {
    try {
      const response = await api.get(`/teacher/students/${studentId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch student:', error)
      throw error
    }
  }

  async getStudentProgress(studentId, filters = {}) {
    try {
      const response = await api.get(`/teacher/students/${studentId}/progress`, {
        params: filters
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch student progress:', error)
      throw error
    }
  }

  async enrollStudent(studentData) {
    try {
      const response = await api.post('/teacher/students/enroll', studentData)
      return response.data
    } catch (error) {
      console.error('Failed to enroll student:', error)
      throw error
    }
  }

  async bulkEnrollStudents(studentsData) {
    try {
      const response = await api.post('/teacher/students/bulk-enroll', {
        students: studentsData
      })
      return response.data
    } catch (error) {
      console.error('Failed to bulk enroll students:', error)
      throw error
    }
  }

  async removeStudent(studentId) {
    try {
      const response = await api.delete(`/teacher/students/${studentId}`)
      return response.data
    } catch (error) {
      console.error('Failed to remove student:', error)
      throw error
    }
  }

  // Results and Analytics
  async getQuizResults(quizId, filters = {}) {
    try {
      const response = await apiUtils.getPaginated(`/teacher/quizzes/${quizId}/results`,
        filters.page || 1,
        filters.limit || 20,
        {
          studentId: filters.studentId,
          status: filters.status,
          minScore: filters.minScore,
          maxScore: filters.maxScore
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz results:', error)
      throw error
    }
  }

  async getStudentResult(quizId, studentId, attemptNumber = null) {
    try {
      const params = attemptNumber ? { attempt: attemptNumber } : {}
      const response = await api.get(`/teacher/quizzes/${quizId}/results/${studentId}`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch student result:', error)
      throw error
    }
  }

  async getAnalytics(type, filters = {}) {
    try {
      const response = await api.get(`/teacher/analytics/${type}`, {
        params: filters
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      throw error
    }
  }

  async getClassPerformance(filters = {}) {
    try {
      const response = await api.get('/teacher/analytics/class-performance', {
        params: filters
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch class performance:', error)
      throw error
    }
  }

  async getQuestionAnalytics(questionId) {
    try {
      const response = await api.get(`/teacher/questions/${questionId}/analytics`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch question analytics:', error)
      throw error
    }
  }

  // Communication
  async sendMessage(recipientIds, message) {
    try {
      const response = await api.post('/teacher/messages', {
        recipients: recipientIds,
        subject: message.subject,
        content: message.content,
        type: message.type || 'general'
      })
      return response.data
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async sendBulkEmail(studentIds, emailData) {
    try {
      const response = await api.post('/teacher/communications/bulk-email', {
        recipients: studentIds,
        subject: emailData.subject,
        content: emailData.content,
        template: emailData.template
      })
      return response.data
    } catch (error) {
      console.error('Failed to send bulk email:', error)
      throw error
    }
  }

  async sendQuizNotification(quizId, studentIds, message) {
    try {
      const response = await api.post(`/teacher/quizzes/${quizId}/notify`, {
        recipients: studentIds,
        message
      })
      return response.data
    } catch (error) {
      console.error('Failed to send quiz notification:', error)
      throw error
    }
  }

  // Reports and Exports
  async generateReport(type, filters = {}) {
    try {
      const response = await api.post('/teacher/reports/generate', {
        type,
        filters,
        format: filters.format || 'pdf'
      })
      return response.data
    } catch (error) {
      console.error('Failed to generate report:', error)
      throw error
    }
  }

  async exportStudentData(studentIds, format = 'csv') {
    try {
      const response = await api.post('/teacher/export/students', {
        studentIds,
        format
      }, {
        responseType: 'blob'
      })
      
      // Create download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `students-export.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      return response.data
    } catch (error) {
      console.error('Failed to export student data:', error)
      throw error
    }
  }

  async exportQuizResults(quizId, format = 'csv') {
    try {
      const response = await api.post(`/teacher/quizzes/${quizId}/export`, {
        format
      }, {
        responseType: 'blob'
      })
      
      // Create download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quiz-results-${quizId}.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      return response.data
    } catch (error) {
      console.error('Failed to export quiz results:', error)
      throw error
    }
  }

  // Settings and Preferences
  async getSettings() {
    try {
      const response = await api.get('/teacher/settings')
      return response.data
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      throw error
    }
  }

  async updateSettings(settings) {
    try {
      const response = await api.put('/teacher/settings', settings)
      return response.data
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }

  async getNotificationPreferences() {
    try {
      const response = await api.get('/teacher/notifications/preferences')
      return response.data
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error)
      throw error
    }
  }

  async updateNotificationPreferences(preferences) {
    try {
      const response = await api.put('/teacher/notifications/preferences', preferences)
      return response.data
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      throw error
    }
  }
}

// Create and export singleton instance
const teacherService = new TeacherService()
export default teacherService