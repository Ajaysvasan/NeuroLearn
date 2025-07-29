import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  School,
  Quiz,
  People,
  EmojiEvents,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  Notifications,
  Star
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
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Legend
} from 'recharts'

import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const TeacherStats = () => {
  const [stats, setStats] = useState(null)
  const [classPerformance, setClassPerformance] = useState([])
  const [subjectAnalytics, setSubjectAnalytics] = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [tabValue, setTabValue] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [selectedTimeframe])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [statsResponse, classResponse, subjectResponse] = await Promise.all([
        teacherService.getTeacherStats(selectedTimeframe),
        teacherService.getClassPerformance(selectedTimeframe),
        teacherService.getSubjectAnalytics(selectedTimeframe)
      ])

      setStats(statsResponse.data)
      setClassPerformance(classResponse.data)
      setSubjectAnalytics(subjectResponse.data)
      
      // Generate trend data for chart
      setTrendData(statsResponse.data.trendData || [])
    } catch (err) {
      setError('Failed to fetch statistics')
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceTrend = (current, previous) => {
    if (!previous || previous === 0) return { trend: 'neutral', percentage: 0 }
    
    const change = ((current - previous) / previous * 100)
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(1)
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
      case 'down': return <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
      default: return null
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'success.main'
      case 'down': return 'error.main'
      default: return 'text.secondary'
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />
  }

  const StatCard = ({ title, value, previousValue, icon, color = 'primary' }) => {
    const trend = getPerformanceTrend(value, previousValue)
    
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" color={`${color}.main`} gutterBottom>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              {trend.trend !== 'neutral' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {getTrendIcon(trend.trend)}
                  <Typography 
                    variant="caption" 
                    color={getTrendColor(trend.trend)}
                    sx={{ ml: 0.5 }}
                  >
                    {trend.percentage}% vs {selectedTimeframe === 'week' ? 'last week' : selectedTimeframe === 'month' ? 'last month' : 'last semester'}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ color: `${color}.main`, fontSize: 40 }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Analytics color="primary" />
            Teaching Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into your teaching performance and student progress
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            label="Time Period"
          >
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="semester">This Semester</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <>
          {/* Overview Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                previousValue={stats.previousStudents}
                icon={<School />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Quizzes Created"
                value={stats.quizzesCreated}
                previousValue={stats.previousQuizzes}
                icon={<Quiz />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Average Score"
                value={`${stats.averageScore}%`}
                previousValue={stats.previousAverage}
                icon={<EmojiEvents />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Students"
                value={stats.activeStudents}
                previousValue={stats.previousActive}
                icon={<People />}
                color="info"
              />
            </Grid>
          </Grid>

          {/* Tabs for Different Views */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="fullWidth"
            >
              <Tab label="Performance Trends" />
              <Tab label="Class Analysis" />
              <Tab label="Subject Insights" />
              <Tab label="Activity Feed" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Performance Trend Chart */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Student Performance Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="averageScore" 
                        stroke="#8884d8" 
                        strokeWidth={2}
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

              {/* Quick Stats */}
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Insights
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="success.dark">
                        Top Performing Class
                      </Typography>
                      <Typography variant="h6">
                        {stats.topClass?.name} ({stats.topClass?.average}%)
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.dark">
                        Most Improved Student
                      </Typography>
                      <Typography variant="h6">
                        {stats.mostImproved?.name}
                      </Typography>
                      <Typography variant="caption">
                        +{stats.mostImproved?.improvement}% improvement
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="warning.dark">
                        Attention Needed
                      </Typography>
                      <Typography variant="h6">
                        {stats.needsAttention} students
                      </Typography>
                      <Typography variant="caption">
                        Below 50% average
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Completion Rate */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quiz Completion Rates
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={stats.completionRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completionRate" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Difficulty Distribution */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Question Difficulty Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={stats.difficultyDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.difficultyDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              {/* Class Performance Table */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Class Performance Overview
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Class</TableCell>
                          <TableCell align="center">Students</TableCell>
                          <TableCell align="center">Average Score</TableCell>
                          <TableCell align="center">Completion Rate</TableCell>
                          <TableCell align="center">Top Performer</TableCell>
                          <TableCell align="center">Progress</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classPerformance.map((classData) => (
                          <TableRow key={classData.className}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <School fontSize="small" />
                                {classData.className}
                              </Box>
                            </TableCell>
                            <TableCell align="center">{classData.studentCount}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${classData.averageScore}%`}
                                color={classData.averageScore >= 70 ? 'success' : classData.averageScore >= 50 ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">{classData.completionRate}%</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Star fontSize="small" color="warning" />
                                {classData.topPerformer}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <LinearProgress
                                variant="determinate"
                                value={classData.averageScore}
                                color={classData.averageScore >= 70 ? 'success' : classData.averageScore >= 50 ? 'warning' : 'error'}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              {subjectAnalytics.map((subject, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {subject.icon || subject.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">
                          {subject.name}
                        </Typography>
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Questions
                          </Typography>
                          <Typography variant="h6">
                            {subject.totalQuestions}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Success Rate
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {subject.successRate}%
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Difficulty Distribution
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {['easy', 'medium', 'hard'].map((difficulty) => (
                            <Box key={difficulty} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ minWidth: 60 }}>
                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={subject.difficultyDistribution?.[difficulty] || 0}
                                sx={{ flexGrow: 1, height: 6 }}
                                color={
                                  difficulty === 'easy' ? 'success' :
                                  difficulty === 'medium' ? 'warning' : 'error'
                                }
                              />
                              <Typography variant="caption">
                                {subject.difficultyDistribution?.[difficulty] || 0}%
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      <Alert severity="info" variant="outlined">
                        <Typography variant="caption">
                          <strong>Most challenging topic:</strong> {subject.challengingTopic}
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <List>
                    {(stats.recentActivity || []).map((activity, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {activity.icon || <Notifications />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={activity.title}
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {activity.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {activity.timestamp}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < stats.recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Weekly Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="primary.dark">
                        Questions Generated
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {stats.weeklyStats?.questionsGenerated || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="success.dark">
                        Quizzes Completed
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.weeklyStats?.quizzesCompleted || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.dark">
                        Student Engagement
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {stats.weeklyStats?.engagement || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  )
}

export default TeacherStats
