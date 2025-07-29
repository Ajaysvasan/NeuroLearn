import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress,
  Avatar,
  Tooltip
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  BarChart,
  PieChart,
  CalendarToday,
  School,
  EmojiEvents,
  Speed,
  Target,
  Star,
  Insights,
  Assignment,
  CheckCircle
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts'

import { studentService } from '@services/student.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const ProgressChart = () => {
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month')
  const [subject, setSubject] = useState('all')
  const [tabValue, setTabValue] = useState(0)
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    fetchProgressData()
  }, [timeframe, subject])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      const [progressResponse, achievementsResponse] = await Promise.all([
        studentService.getProgressData({ timeframe, subject }),
        studentService.getAchievements()
      ])
      
      setProgressData(progressResponse.data)
      setAchievements(achievementsResponse.data || [])
    } catch (err) {
      toast.error('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp color="success" />
    if (trend < 0) return <TrendingDown color="error" />
    return null
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'info'
    if (score >= 50) return 'warning'
    return 'error'
  }

  if (loading) {
    return <LoadingSpinner text="Loading progress data..." />
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Timeline color="primary" />
            Learning Progress
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your academic journey and achievements
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Time Period"
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="semester">This Semester</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              label="Subject"
            >
              <MenuItem value="all">All Subjects</MenuItem>
              {progressData?.subjects?.map((subj) => (
                <MenuItem key={subj.id} value={subj.id}>
                  {subj.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {progressData?.stats?.totalQuizzes || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quizzes Completed
              </Typography>
              {progressData?.stats?.quizTrend && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  {getTrendIcon(progressData.stats.quizTrend)}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {Math.abs(progressData.stats.quizTrend)}% vs last period
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {progressData?.stats?.averageScore || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
              {progressData?.stats?.scoreTrend && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  {getTrendIcon(progressData.stats.scoreTrend)}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {Math.abs(progressData.stats.scoreTrend)}% improvement
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Target sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {progressData?.stats?.streak || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Day Streak
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Keep it up!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {progressData?.stats?.rank || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class Rank
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Out of {progressData?.stats?.totalStudents || 0} students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Different Views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Performance Trends" icon={<Timeline />} />
          <Tab label="Subject Analysis" icon={<BarChart />} />
          <Tab label="Achievements" icon={<EmojiEvents />} />
          <Tab label="Time Analysis" icon={<CalendarToday />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Performance Over Time */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Trends
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressData?.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
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
                    dataKey="speed" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Speed (q/min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Weekly Goals */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Weekly Goals
              </Typography>
              
              {(progressData?.weeklyGoals || []).map((goal, index) => (
                <Box key={index} sx={{ mb: 3 }}>
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
                  <Typography variant="caption" color="text.secondary">
                    {goal.description}
                  </Typography>
                </Box>
              ))}

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                This Week's Highlights
              </Typography>
              <List dense>
                {(progressData?.weeklyHighlights || []).map((highlight, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={highlight.title}
                      secondary={highlight.date}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Skill Development */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Skill Development Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={progressData?.skillData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="comprehension" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Comprehension"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="analysis" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    name="Analysis"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="application" 
                    stackId="1" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    name="Application"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Subject Performance Bar Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subject Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsBarChart data={progressData?.subjectPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="currentScore" fill="#8884d8" name="Current Score" />
                  <Bar dataKey="previousScore" fill="#82ca9d" name="Previous Score" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Subject Difficulty Distribution */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question Difficulty Mastery
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Pie
                    data={progressData?.difficultyMastery || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(progressData?.difficultyMastery || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Subject Detail Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {(progressData?.subjectDetails || []).map((subject, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <School />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {subject.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {subject.totalQuizzes} quizzes completed
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            Current Average
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {subject.currentAverage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={subject.currentAverage}
                          color={getPerformanceColor(subject.currentAverage)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Best Score: {subject.bestScore}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Improvement: +{subject.improvement}%
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {subject.strongTopics?.slice(0, 2).map((topic, topicIndex) => (
                          <Chip
                            key={topicIndex}
                            label={topic}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ))}
                        {subject.weakTopics?.slice(0, 1).map((topic, topicIndex) => (
                          <Chip
                            key={topicIndex}
                            label={`⚠️ ${topic}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Achievement Overview */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" color="warning.main">
                {achievements.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Achievements
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Achievement
                </Typography>
                {achievements[0] && (
                  <Chip
                    label={achievements[0].title}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Achievement Progress */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Achievement Progress
              </Typography>
              
              {(progressData?.achievementProgress || []).map((achievement, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ fontSize: '1.5rem', mr: 2 }}>
                      {achievement.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {achievement.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.current}/{achievement.target}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(achievement.current / achievement.target) * 100}
                    color={achievement.completed ? 'success' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Achievement Gallery */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Achievement Gallery
              </Typography>
              <Grid container spacing={2}>
                {achievements.map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Box sx={{ fontSize: '3rem', mb: 1 }}>
                        {achievement.icon || '🏆'}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {achievement.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {achievement.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          {/* Study Time Analysis */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Study Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={progressData?.dailyStudyTime || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="minutes" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Best Performance Times */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance by Time of Day
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData?.timeOfDayPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="averageScore" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Study Session Analysis */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Study Session Insights
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary.main">
                      {progressData?.sessionStats?.averageSessionTime || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Session (minutes)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main">
                      {progressData?.sessionStats?.optimalSessionTime || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Optimal Session (minutes)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.main">
                      {progressData?.sessionStats?.bestPerformanceHour || 0}:00
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Best Performance Hour
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recommendations:
                </Typography>
                <List dense>
                  {(progressData?.studyRecommendations || []).map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Insights color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ProgressChart
