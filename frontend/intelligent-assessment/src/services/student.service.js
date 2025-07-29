import api, { apiUtils } from './api'

class StudentService {
  // Dashboard data
  async getDashboardData(timeframe = 'week') {
    try {
      const response = await api.get('/student/dashboard', {
        params: { timeframe }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      throw error
    }
  }

  // Quiz Management
  async getAvailableQuizzes(filters = {}) {
    try {
      const response = await apiUtils.getPaginated('/student/quizzes/available',
        filters.page || 1,
        filters.limit || 20,
        {
          subject: filters.subject,
          difficulty: filters.difficulty,
          status: filters.status,
          search: filters.search
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch available quizzes:', error)
      throw error
    }
  }

  async getQuizById(quizId) {
    try {
      const response = await api.get(`/student/quizzes/${quizId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
      throw error
    }
  }

  async startQuiz(quizId) {
    try {
      const response = await api.post(`/student/quizzes/${quizId}/start`)
      return response.data
    } catch (error) {
      console.error('Failed to start quiz:', error)
      throw error
    }
  }

  async submitAnswer(quizId, questionId, answer) {
    try {
      const response = await api.post(`/student/quizzes/${quizId}/answers`, {
        questionId,
        answer,
        timestamp: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit answer:', error)
      throw error
    }
  }

  async saveProgress(quizId, progress) {
    try {
      const response = await api.put(`/student/quizzes/${quizId}/progress`, {
        currentQuestionIndex: progress.currentQuestionIndex,
        answers: progress.answers,
        timeSpent: progress.timeSpent,
        flaggedQuestions: progress.flaggedQuestions
      })
      return response.data
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    }
  }

  async submitQuiz(quizId, answers) {
    try {
      const response = await api.post(`/student/quizzes/${quizId}/submit`, {
        answers,
        submittedAt: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      throw error
    }
  }

  async pauseQuiz(quizId) {
    try {
      const response = await api.post(`/student/quizzes/${quizId}/pause`)
      return response.data
    } catch (error) {
      console.error('Failed to pause quiz:', error)
      throw error
    }
  }

  async resumeQuiz(quizId) {
    try {
      const response = await api.post(`/student/quizzes/${quizId}/resume`)
      return response.data
    } catch (error) {
      console.error('Failed to resume quiz:', error)
      throw error
    }
  }

  // Results and Feedback
  async getQuizResult(quizId, attemptNumber = null) {
    try {
      const params = attemptNumber ? { attempt: attemptNumber } : {}
      const response = await api.get(`/student/quizzes/${quizId}/result`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz result:', error)
      throw error
    }
  }

  async getQuizFeedback(quizId, attemptNumber = null) {
    try {
      const params = attemptNumber ? { attempt: attemptNumber } : {}
      const response = await api.get(`/student/quizzes/${quizId}/feedback`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz feedback:', error)
      throw error
    }
  }

  async getAllResults(filters = {}) {
    try {
      const response = await apiUtils.getPaginated('/student/results',
        filters.page || 1,
        filters.limit || 20,
        {
          subject: filters.subject,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          minScore: filters.minScore,
          maxScore: filters.maxScore
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch results:', error)
      throw error
    }
  }

  async getQuizAttempts(quizId) {
    try {
      const response = await api.get(`/student/quizzes/${quizId}/attempts`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch quiz attempts:', error)
      throw error
    }
  }

  // Progress and Analytics
  async getProgressData(filters = {}) {
    try {
      const response = await api.get('/student/progress', {
        params: {
          timeframe: filters.timeframe || 'month',
          subject: filters.subject || 'all'
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch progress data:', error)
      throw error
    }
  }

  async getStatistics() {
    try {
      const response = await api.get('/student/statistics')
      return response.data
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      throw error
    }
  }

  async getSubjectProgress(subjectId, timeframe = 'month') {
    try {
      const response = await api.get(`/student/subjects/${subjectId}/progress`, {
        params: { timeframe }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch subject progress:', error)
      throw error
    }
  }

  async getPerformanceAnalytics(filters = {}) {
    try {
      const response = await api.get('/student/analytics/performance', {
        params: filters
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch performance analytics:', error)
      throw error
    }
  }

  async getStrengthsAndWeaknesses() {
    try {
      const response = await api.get('/student/analytics/strengths-weaknesses')
      return response.data
    } catch (error) {
      console.error('Failed to fetch strengths and weaknesses:', error)
      throw error
    }
  }

  // Achievements and Gamification
  async getAchievements() {
    try {
      const response = await api.get('/student/achievements')
      return response.data
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
      throw error
    }
  }

  async getBadges() {
    try {
      const response = await api.get('/student/badges')
      return response.data
    } catch (error) {
      console.error('Failed to fetch badges:', error)
      throw error
    }
  }

  async getLeaderboard(type = 'overall', timeframe = 'month') {
    try {
      const response = await api.get('/student/leaderboard', {
        params: { type, timeframe }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      throw error
    }
  }

  async getStreak() {
    try {
      const response = await api.get('/student/streak')
      return response.data
    } catch (error) {
      console.error('Failed to fetch streak:', error)
      throw error
    }
  }

  // Study Plans and Recommendations
  async getStudyPlan() {
    try {
      const response = await api.get('/student/study-plan')
      return response.data
    } catch (error) {
      console.error('Failed to fetch study plan:', error)
      throw error
    }
  }

  async updateStudyPlan(planData) {
    try {
      const response = await api.put('/student/study-plan', planData)
      return response.data
    } catch (error) {
      console.error('Failed to update study plan:', error)
      throw error
    }
  }

  async getRecommendations(type = 'topics') {
    try {
      const response = await api.get('/student/recommendations', {
        params: { type }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      throw error
    }
  }

  async getPersonalizedQuestions(count = 10, difficulty = 'mixed') {
    try {
      const response = await api.post('/student/questions/personalized', {
        count,
        difficulty
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch personalized questions:', error)
      throw error
    }
  }

  // Practice and Learning
  async getPracticeQuestions(filters = {}) {
    try {
      const response = await api.get('/student/practice/questions', {
        params: {
          subject: filters.subject,
          topic: filters.topic,
          difficulty: filters.difficulty,
          count: filters.count || 10
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch practice questions:', error)
      throw error
    }
  }

  async submitPracticeAnswer(questionId, answer) {
    try {
      const response = await api.post('/student/practice/submit', {
        questionId,
        answer,
        timestamp: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit practice answer:', error)
      throw error
    }
  }

  async getHints(questionId) {
    try {
      const response = await api.get(`/student/questions/${questionId}/hints`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch hints:', error)
      throw error
    }
  }

  async getExplanation(questionId) {
    try {
      const response = await api.get(`/student/questions/${questionId}/explanation`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch explanation:', error)
      throw error
    }
  }

  // Bookmarks and Favorites
  async getBookmarks() {
    try {
      const response = await api.get('/student/bookmarks')
      return response.data
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
      throw error
    }
  }

  async addBookmark(itemType, itemId, notes = '') {
    try {
      const response = await api.post('/student/bookmarks', {
        itemType,
        itemId,
        notes
      })
      return response.data
    } catch (error) {
      console.error('Failed to add bookmark:', error)
      throw error
    }
  }

  async removeBookmark(bookmarkId) {
    try {
      const response = await api.delete(`/student/bookmarks/${bookmarkId}`)
      return response.data
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
      throw error
    }
  }

  async updateBookmark(bookmarkId, updates) {
    try {
      const response = await api.put(`/student/bookmarks/${bookmarkId}`, updates)
      return response.data
    } catch (error) {
      console.error('Failed to update bookmark:', error)
      throw error
    }
  }

  // Goals and Targets
  async getGoals() {
    try {
      const response = await api.get('/student/goals')
      return response.data
    } catch (error) {
      console.error('Failed to fetch goals:', error)
      throw error
    }
  }

  async createGoal(goalData) {
    try {
      const response = await api.post('/student/goals', goalData)
      return response.data
    } catch (error) {
      console.error('Failed to create goal:', error)
      throw error
    }
  }

  async updateGoal(goalId, updates) {
    try {
      const response = await api.put(`/student/goals/${goalId}`, updates)
      return response.data
    } catch (error) {
      console.error('Failed to update goal:', error)
      throw error
    }
  }

  async deleteGoal(goalId) {
    try {
      const response = await api.delete(`/student/goals/${goalId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete goal:', error)
      throw error
    }
  }

  // Notifications and Communications
  async getNotifications(filters = {}) {
    try {
      const response = await apiUtils.getPaginated('/student/notifications',
        filters.page || 1,
        filters.limit || 20,
        {
          type: filters.type,
          read: filters.read,
          priority: filters.priority
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.put(`/student/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const response = await api.put('/student/notifications/mark-all-read')
      return response.data
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/student/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }

  // Feedback and Support
  async submitFeedback(feedbackData) {
    try {
      const response = await api.post('/student/feedback', {
        type: feedbackData.type,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        quizId: feedbackData.quizId,
        questionId: feedbackData.questionId
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      throw error
    }
  }

  async reportIssue(issueData) {
    try {
      const response = await api.post('/student/support/report', {
        category: issueData.category,
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority || 'medium',
        attachments: issueData.attachments
      })
      return response.data
    } catch (error) {
      console.error('Failed to report issue:', error)
      throw error
    }
  }

  async getSupportTickets() {
    try {
      const response = await api.get('/student/support/tickets')
      return response.data
    } catch (error) {
      console.error('Failed to fetch support tickets:', error)
      throw error
    }
  }

  // Settings and Preferences
  async getPreferences() {
    try {
      const response = await api.get('/student/preferences')
      return response.data
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
      throw error
    }
  }

  async updatePreferences(preferences) {
    try {
      const response = await api.put('/student/preferences', preferences)
      return response.data
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }

  async getNotificationSettings() {
    try {
      const response = await api.get('/student/notifications/settings')
      return response.data
    } catch (error) {
      console.error('Failed to fetch notification settings:', error)
      throw error
    }
  }

  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/student/notifications/settings', settings)
      return response.data
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      throw error
    }
  }

  // Export and Reports
  async exportProgress(format = 'pdf') {
    try {
      const response = await api.post('/student/export/progress', {
        format
      }, {
        responseType: 'blob'
      })
      
      // Create download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `progress-report.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      return response.data
    } catch (error) {
      console.error('Failed to export progress:', error)
      throw error
    }
  }

  async generatePerformanceReport(filters = {}) {
    try {
      const response = await api.post('/student/reports/performance', {
        timeframe: filters.timeframe || 'month',
        subjects: filters.subjects || [],
        format: filters.format || 'pdf'
      })
      return response.data
    } catch (error) {
      console.error('Failed to generate performance report:', error)
      throw error
    }
  }
}

// Create and export singleton instance
const studentService = new StudentService()
export default studentService
