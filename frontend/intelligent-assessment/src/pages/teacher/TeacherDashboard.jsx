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
  ListItemAvatar,
  Avatar,
  IconButton,
  Alert,
  Divider,
  ButtonGroup
} from '@mui/material'
import {
  School,
  Quiz,
  People,
  Analytics,
  TrendingUp,
  TrendingDown,
  Assignment,
  CheckCircle,
  Warning,
  Add,
  Visibility,
  Edit,
  NotificationsActive,
  CalendarToday,
  Speed,
  EmojiEvents
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
  BarChart,
  Bar,
  Legend
} from 'recharts'

import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { useAuth } from '@context/AuthContext'
import { toast } from 'react-toastify'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('week')
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockData = {
        stats: {
          totalStudents: 45,
          activeStudents: 38,
          totalQuizzes: 12,
          pendingReviews: 8,
          averageScore: 78.5,
          completionRate: 85,
          trend: {
            students: 12,
            quizzes: 25,
            scores: 8,
            completion: -3
          }
        },
        chartData: {
          performance: [
            { date: '2024-01-01', score: 72, participation: 80 },
            { date: '2024-01-08', score: 75, participation: 85 },
            { date: '2024-01-15', score: 78, participation: 88 },
            { date: '2024-01-22', score: 82, participation: 90 },
            { date: '2024-01-29', score: 85, participation: 92 }
          ],
          subjectDistribution: [
            { name: 'Mathematics', value: 35, students: 15 },
            { name: 'Physics', value: 30, students: 12 },
            { name: 'Chemistry', value: 25, students: 10 },
            { name: 'Biology', value: 10, students: 8 }
          ],
          weeklyActivity: [
            { day: 'Mon', quizzes: 2, submissions: 25 },
            { day: 'Tue', quizzes: 3, submissions: 30 },
            { day: 'Wed', quizzes: 1, submissions: 20 },
            { day: 'Thu', quizzes: 4, submissions: 35 },
            { day: 'Fri', quizzes: 2, submissions: 28 },
            { day: 'Sat', quizzes: 1, submissions: 15 },
            { day: 'Sun', quizzes: 0, submissions: 5 }
          ]
        },
        recentQuizzes: [
          { id: 1, title: 'Algebra Basics', students: 25, avgScore: 82, status: 'active' },
          { id: 2, title: 'Physics Motion', students: 22, avgScore: 75, status: 'completed' },
          { id: 3, title: 'Chemical Bonding', students: 18, avgScore: 88, status: 'draft' }
        ],
        topPerformers: [
          { name: 'Priya Sharma', subject: 'Mathematics', score: 96 },
          { name: 'Arjun Kumar', subject: 'Physics', score: 94 },
          { name: 'Ananya Reddy', subject: 'Chemistry', score: 92 }
        ],
        alerts: [
          { type: 'warning', message: '8 questions pending review', action: 'Review Now' },
          { type: 'info', message: '3 new student registrations', action: 'View Students' },
          { type: 'success', message: 'Quiz completion rate increased by 12%', action: null }
        ]
      }

      const mockActivity = [
        { id: 1, type: 'quiz_created', title: 'Created "Advanced Calculus" quiz', time: '2 hours ago', user: 'You' },
        { id: 2, type: 'student_joined', title: 'New student Raj Kumar joined', time: '4 hours ago', user: 'System' },
        { id: 3, type: 'quiz_completed', title: '15 students completed Physics quiz', time: '6 hours ago', user: 'Students' },
        { id: 4, type: 'question_reviewed', title: 'Approved 5 AI-generated questions', time: '1 day ago', user: 'You' },
        { id: 5, type: 'syllabus_uploaded', title: 'Uploaded new Chemistry syllabus', time: '2 days ago', user: 'You' }
      ]

      setDashboardData(mockData)
      setRecentActivity(mockActivity)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp color="success" fontSize="small" />
    if (trend < 0) return <TrendingDown color="error" fontSize="small" />
    return null
  }

  const getTrendColor = (trend) => {
    if (trend > 0) return 'success.main'
    if (trend < 0) return 'error.main'
    return 'text.secondary'
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz_created': return <Quiz color="primary" />
      case 'student_joined': return <People color="success" />
      case 'quiz_completed': return <CheckCircle color="info" />
      case 'question_reviewed': return <Assignment color="warning" />
      case 'syllabus_uploaded': return <School color="secondary" />
      default: return <NotificationsActive />
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your classes today
        </Typography>
      </Box>

      {/* Time Period Selector */}
      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button 
            variant={timeframe === 'week' ? 'contained' : 'outlined'}
            onClick={() => setTimeframe('week')}
          >
            This Week
          </Button>
          <Button 
            variant={timeframe === 'month' ? 'contained' : 'outlined'}
            onClick={() => setTimeframe('month')}
          >
            This Month
          </Button>
          <Button 
            variant={timeframe === 'semester' ? 'contained' : 'outlined'}
            onClick={() => setTimeframe('semester')}
          >
            This Semester
          </Button>
        </ButtonGroup>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {dashboardData?.stats?.totalStudents || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon(dashboardData?.stats?.trend?.students)}
                <Typography 
                  variant="caption" 
                  color={getTrendColor(dashboardData?.stats?.trend?.students)}
                  sx={{ ml: 0.5 }}
                >
                  {dashboardData?.stats?.trend?.students > 0 ? '+' : ''}{dashboardData?.stats?.trend?.students}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Quiz sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {dashboardData?.stats?.totalQuizzes || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Quizzes
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon(dashboardData?.stats?.trend?.quizzes)}
                <Typography 
                  variant="caption" 
                  color={getTrendColor(dashboardData?.stats?.trend?.quizzes)}
                  sx={{ ml: 0.5 }}
                >
                  {dashboardData?.stats?.trend?.quizzes > 0 ? '+' : ''}{dashboardData?.stats?.trend?.quizzes}%
                </Typography>
              </Box>
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
                {getTrendIcon(dashboardData?.stats?.trend?.scores)}
                <Typography 
                  variant="caption" 
                  color={getTrendColor(dashboardData?.stats?.trend?.scores)}
                  sx={{ ml: 0.5 }}
                >
                  {dashboardData?.stats?.trend?.scores > 0 ? '+' : ''}{dashboardData?.stats?.trend?.scores}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {dashboardData?.stats?.pendingReviews || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Reviews
              </Typography>
              <Button size="small" sx={{ mt: 1 }}>
                Review Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {dashboardData.alerts.map((alert, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Alert 
                severity={alert.type} 
                action={
                  alert.action && (
                    <Button color="inherit" size="small">
                      {alert.action}
                    </Button>
                  )
                }
              >
                {alert.message}
              </Alert>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Performance Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Class Performance Trends
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
                  name="Average Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="participation" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Participation %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Subject Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subject Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData?.chartData?.subjectDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(dashboardData?.chartData?.subjectDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Recent Quizzes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Quizzes
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<Add />}
              >
                Create Quiz
              </Button>
            </Box>
            
            <List>
              {(dashboardData?.recentQuizzes || []).map((quiz, index) => (
                <ListItem key={quiz.id} divider={index < dashboardData.recentQuizzes.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Quiz />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={quiz.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {quiz.students} students • Avg: {quiz.avgScore}%
                        </Typography>
                        <Chip 
                          label={quiz.status} 
                          size="small" 
                          color={
                            quiz.status === 'active' ? 'success' :
                            quiz.status === 'completed' ? 'info' : 'default'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Top Performers & Recent Activity */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Top Performers */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Performers This Week
                </Typography>
                <List dense>
                  {(dashboardData?.topPerformers || []).map((student, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <EmojiEvents />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.name}
                        secondary={`${student.subject} • ${student.score}%`}
                      />
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        color="primary"
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Weekly Activity Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Activity
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboardData?.chartData?.weeklyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quizzes" fill="#8884d8" name="Quizzes Created" />
                    <Bar dataKey="submissions" fill="#82ca9d" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Activity Feed */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem key={activity.id} divider={index < recentActivity.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'grey.100' }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={`${activity.time} • by ${activity.user}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TeacherDashboard
