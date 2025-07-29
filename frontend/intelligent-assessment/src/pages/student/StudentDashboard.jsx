import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Alert,
  Divider,
  IconButton,
  Badge
} from '@mui/material'
import {
  School,
  Quiz,
  TrendingUp,
  TrendingDown,
  Assignment,
  EmojiEvents,
  Speed,
  Timer,
  PlayArrow,
  Visibility,
  CheckCircle,
  Star,
  CalendarToday,
  Notifications,
  BookmarkBorder,
  Psychology
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'
import { useNavigate } from 'react-router-dom'

import { studentService } from '@services/student.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { useAuth } from '@context/AuthContext'
import { toast } from 'react-toastify'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const StudentDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availableQuizzes, setAvailableQuizzes] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockData = {
        stats: {
          totalQuizzes: 18,
          averageScore: 82.5,
          currentStreak: 7,
          classRank: 8,
          totalStudents: 45,
          improvement: 12,
          studyTime: 1450, // minutes
          completionRate: 89
        },
        chartData: {
          performance: [
            { date: '2024-01-01', score: 72, time: 25 },
            { date: '2024-01-08', score: 75, time: 22 },
            { date: '2024-01-15', score: 78, time: 20 },
            { date: '2024-01-22', score: 82, time: 18 },
            { date: '2024-01-29', score: 85, time: 17 }
          ],
          subjectProgress: [
            { subject: 'Mathematics', progress: 85, total: 100 },
            { subject: 'Physics', progress: 72, total: 100 },
            { subject: 'Chemistry', progress: 88, total: 100 },
            { subject: 'Biology', progress: 76, total: 100 }
          ],
          skillDistribution: [
            { name: 'Comprehension', value: 85 },
            { name: 'Analysis', value: 78 },
            { name: 'Application', value: 82 },
            { name: 'Synthesis', value: 74 }
          ]
        },
        weeklyGoals: [
          { title: 'Complete 5 Quizzes', current: 4, target: 5, completed: false },
          { title: 'Score Above 80%', current: 3, target: 3, completed: true },
          { title: 'Study Streak', current: 7, target: 7, completed: true }
        ],
        upcomingDeadlines: [
          { title: 'Physics Quiz: Motion', dueDate: '2024-02-05', subject: 'Physics' },
          { title: 'Math Assignment: Calculus', dueDate: '2024-02-07', subject: 'Mathematics' },
          { title: 'Chemistry Lab Quiz', dueDate: '2024-02-10', subject: 'Chemistry' }
        ]
      }

      const mockQuizzes = [
        {
          id: 1,
          title: 'Advanced Algebra',
          subject: 'Mathematics',
          duration: 30,
          questions: 15,
          difficulty: 'Medium',
          dueDate: '2024-02-05',
          attempts: 0,
          maxAttempts: 2,
          status: 'available'
        },
        {
          id: 2,
          title: 'Organic Reactions',
          subject: 'Chemistry',
          duration: 45,
          questions: 20,
          difficulty: 'Hard',
          dueDate: '2024-02-08',
          attempts: 1,
          maxAttempts: 2,
          status: 'available',
          lastScore: 78
        },
        {
          id: 3,
          title: 'Cell Biology',
          subject: 'Biology',
          duration: 25,
          questions: 12,
          difficulty: 'Easy',
          dueDate: '2024-02-03',
          attempts: 2,
          maxAttempts: 2,
          status: 'completed',
          bestScore: 92
        }
      ]

      const mockActivity = [
        { id: 1, type: 'quiz_completed', title: 'Completed "Trigonometry Basics" with 85%', time: '2 hours ago', score: 85 },
        { id: 2, type: 'achievement', title: 'Earned "Week Warrior" achievement', time: '1 day ago' },
        { id: 3, type: 'improvement', title: 'Mathematics score improved by 8%', time: '2 days ago' },
        { id: 4, type: 'streak', title: 'Reached 7-day study streak', time: '3 days ago' },
        { id: 5, type: 'quiz_started', title: 'Started "Chemical Bonding" quiz', time: '5 days ago' }
      ]

      const mockAchievements = [
        { id: 1, title: 'Perfect Score', description: 'Scored 100% in a quiz', icon: '🎯', earned: true },
        { id: 2, title: 'Week Warrior', description: '7-day study streak', icon: '🔥', earned: true },
        { id: 3, title: 'Speed Master', description: 'Complete quiz in under 10 minutes', icon: '⚡', earned: false, progress: 80 },
        { id: 4, title: 'Subject Expert', description: 'Master a subject with 90%+ average', icon: '🧠', earned: false, progress: 45 }
      ]

      setDashboardData(mockData)
      setAvailableQuizzes(mockQuizzes)
      setRecentActivity(mockActivity)
      setAchievements(mockAchievements)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (improvement) => {
    if (improvement > 0) return <TrendingUp color="success" fontSize="small" />
    if (improvement < 0) return <TrendingDown color="error" fontSize="small" />
    return null
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz_completed': return <CheckCircle color="success" />
      case 'achievement': return <EmojiEvents color="warning" />
      case 'improvement': return <TrendingUp color="info" />
      case 'streak': return <Speed color="primary" />
      case 'quiz_started': return <PlayArrow color="secondary" />
      default: return <Notifications />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const handleStartQuiz = (quizId) => {
    navigate(`/student/quiz/${quizId}`)
  }

  const handleViewResults = (quizId) => {
    navigate(`/student/results/${quizId}`)
  }

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}! 🎓
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ready to continue your learning journey? Let's see what's new today.
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Quiz sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {dashboardData?.stats?.totalQuizzes || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quizzes Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {dashboardData?.stats?.averageScore || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon(dashboardData?.stats?.improvement)}
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +{dashboardData?.stats?.improvement}% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                #{dashboardData?.stats?.classRank || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class Rank
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Out of {dashboardData?.stats?.totalStudents} students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timer sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {dashboardData?.stats?.currentStreak || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Day Streak
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Keep it going! 🔥
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Performance Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.chartData?.performance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  name="Score (%)"
                  dot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Time (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Skill Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Skill Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart data={dashboardData?.chartData?.skillDistribution || []}>
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background
                  clockWise
                  dataKey="value"
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Available Quizzes */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Available Quizzes
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/student/quizzes')}
              >
                View All
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {availableQuizzes.slice(0, 3).map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          {quiz.title}
                        </Typography>
                        <Chip 
                          label={quiz.difficulty}
                          color={getDifficultyColor(quiz.difficulty)}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {quiz.subject}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {quiz.questions} questions • {quiz.duration} minutes
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Due: {new Date(quiz.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {quiz.attempts > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Attempts: {quiz.attempts}/{quiz.maxAttempts}
                          </Typography>
                          {quiz.lastScore && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Last Score: {quiz.lastScore}%
                            </Typography>
                          )}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        {quiz.status === 'available' && quiz.attempts < quiz.maxAttempts && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PlayArrow />}
                            onClick={() => handleStartQuiz(quiz.id)}
                            fullWidth
                          >
                            {quiz.attempts > 0 ? 'Retake' : 'Start'}
                          </Button>
                        )}
                        {quiz.attempts > 0 && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewResults(quiz.id)}
                          >
                            Results
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Weekly Goals & Achievements */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Weekly Goals */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Goals
                </Typography>
                {(dashboardData?.weeklyGoals || []).map((goal, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {goal.current}/{goal.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(goal.current / goal.target) * 100}
                      color={goal.completed ? 'success' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Recent Achievements */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Achievements
                </Typography>
                <Grid container spacing={1}>
                  {achievements.slice(0, 4).map((achievement) => (
                    <Grid item xs={6} key={achievement.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          p: 1, 
                          textAlign: 'center',
                          opacity: achievement.earned ? 1 : 0.5,
                          border: achievement.earned ? 2 : 1,
                          borderColor: achievement.earned ? 'primary.main' : 'divider'
                        }}
                      >
                        <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>
                          {achievement.icon}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {achievement.title}
                        </Typography>
                        {!achievement.earned && achievement.progress && (
                          <LinearProgress
                            variant="determinate"
                            value={achievement.progress}
                            size="small"
                            sx={{ mt: 0.5, height: 4 }}
                          />
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Subject Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subject Progress
            </Typography>
            {(dashboardData?.chartData?.subjectProgress || []).map((subject, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {subject.subject}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {subject.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={subject.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Recent Activity & Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Recent Activity */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List dense>
                  {recentActivity.slice(0, 4).map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.100' }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.time}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Upcoming Deadlines */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Deadlines
                </Typography>
                <List dense>
                  {(dashboardData?.upcomingDeadlines || []).map((deadline, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CalendarToday color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={deadline.title}
                        secondary={`${deadline.subject} • Due: ${new Date(deadline.dueDate).toLocaleDateString()}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default StudentDashboard
