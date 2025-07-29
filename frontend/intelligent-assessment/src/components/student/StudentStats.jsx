import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material'
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  School,
  Timer,
  Speed,
  Target,
  Star,
  Bookmark,
  Share,
  Download,
  Visibility,
  Close,
  CompareArrows,
  Psychology,
  Assignment,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

import { studentService } from '@services/student.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const StudentStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const [weakAreas, setWeakAreas] = useState([])
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    fetchAllStats()
  }, [])

  const fetchAllStats = async () => {
    try {
      setLoading(true)
      
      // Mock comprehensive stats data
      const mockStats = {
        overall: {
          averageScore: 78,
          trend: 12
        },
        quiz: {
          totalCompleted: 24,
          thisWeek: 5
        },
        time: {
          totalStudyTime: 7200, // in seconds
          averageSession: 2700 // 45 minutes
        },
        ranking: {
          classRank: 8,
          percentile: 82
        },
        subjectRadar: [
          { subject: 'Math', current: 85, average: 75 },
          { subject: 'Physics', current: 75, average: 78 },
          { subject: 'Chemistry', current: 80, average: 72 },
          { subject: 'Biology', current: 88, average: 80 },
          { subject: 'English', current: 92, average: 85 }
        ],
        scoreDistribution: [
          { name: '90-100%', count: 3 },
          { name: '80-89%', count: 8 },
          { name: '70-79%', count: 10 },
          { name: '60-69%', count: 2 },
          { name: '<60%', count: 1 }
        ],
        subjectDetails: [
          {
            name: 'Mathematics',
            quizCount: 10,
            averageScore: 85,
            bestScore: 95,
            improvement: 12,
            status: 'Excellent'
          },
          {
            name: 'Physics',
            quizCount: 8,
            averageScore: 75,
            bestScore: 88,
            improvement: 8,
            status: 'Good'
          },
          {
            name: 'Chemistry',
            quizCount: 6,
            averageScore: 80,
            bestScore: 92,
            improvement: 15,
            status: 'Good'
          }
        ],
        insights: {
          strongestSubject: 'English - 92% average',
          weakestSubject: 'Physics - needs focus on mechanics',
          learningPace: 'Steady progress with consistent improvement',
          studyPattern: 'Evening study sessions work best for you'
        },
        activityTimeline: [
          { date: '2024-01-01', quizzesCompleted: 2, averageScore: 75 },
          { date: '2024-01-08', quizzesCompleted: 3, averageScore: 78 },
          { date: '2024-01-15', quizzesCompleted: 4, averageScore: 82 },
          { date: '2024-01-22', quizzesCompleted: 2, averageScore: 85 },
          { date: '2024-01-29', quizzesCompleted: 3, averageScore: 80 }
        ],
        goals: [
          {
            title: 'Score 90%+ in Math',
            current: 3,
            target: 5,
            completed: false,
            description: 'Achieve excellent scores in mathematics'
          },
          {
            title: 'Complete Weekly Quizzes',
            current: 5,
            target: 5,
            completed: true,
            description: 'Stay consistent with weekly practice'
          },
          {
            title: 'Improve Physics Score',
            current: 75,
            target: 85,
            completed: false,
            description: 'Focus on physics concepts and problem-solving'
          }
        ],
        comparison: [
          { subject: 'Mathematics', yourScore: 85, classAverage: 75 },
          { subject: 'Physics', yourScore: 75, classAverage: 78 },
          { subject: 'Chemistry', yourScore: 80, classAverage: 72 },
          { subject: 'Biology', yourScore: 88, classAverage: 80 },
          { subject: 'English', yourScore: 92, classAverage: 85 }
        ]
      }

      const mockWeakAreas = [
        {
          topic: 'Physics - Thermodynamics',
          description: 'Heat transfer and thermal processes need attention',
          masteryLevel: 45
        },
        {
          topic: 'Mathematics - Statistics',
          description: 'Probability and data analysis concepts',
          masteryLevel: 60
        }
      ]

      const mockRecommendations = [
        {
          title: 'Focus on Physics Practice',
          description: 'Spend extra time on numerical problems in physics, especially thermodynamics',
          priority: 'High'
        },
        {
          title: 'Review Statistics Concepts',
          description: 'Go through probability theory and statistical methods',
          priority: 'Medium'
        },
        {
          title: 'Maintain English Excellence',
          description: 'Continue your strong performance in English literature and grammar',
          priority: 'Low'
        }
      ]

      setStats(mockStats)
      setWeakAreas(mockWeakAreas)
      setRecommendations(mockRecommendations)
    } catch (err) {
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'info'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp color="success" />
    if (trend < 0) return <TrendingDown color="error" />
    return null
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const handleExportStats = async () => {
    try {
      toast.success('Statistics exported successfully!')
    } catch (err) {
      toast.error('Failed to export statistics')
    }
  }

  // Custom Circular Progress Component
  const CircularProgressWithLabel = ({ value, size = 80 }) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={6}
        color={getPerformanceColor(value)}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  )

  if (loading) {
    return <LoadingSpinner text="Loading your statistics..." />
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Analytics color="primary" />
            My Statistics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive overview of your learning analytics and performance insights
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CompareArrows />}
            onClick={() => setShowComparison(true)}
          >
            Compare
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportStats}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => setSelectedMetric('overall')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CircularProgressWithLabel value={stats?.overall?.averageScore || 0} size={80} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Overall Average
              </Typography>
              {stats?.overall?.trend && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  {getTrendIcon(stats.overall.trend)}
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {Math.abs(stats.overall.trend)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {stats?.quiz?.totalCompleted || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quizzes Completed
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {stats?.quiz?.thisWeek || 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timer sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {formatTime(stats?.time?.totalStudyTime || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Study Time
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {formatTime(stats?.time?.averageSession || 0)} avg session
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                #{stats?.ranking?.classRank || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class Rank
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Top {stats?.ranking?.percentile || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Subject Performance Radar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subject Performance Radar
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={stats?.subjectRadar || []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Current Performance"
                  dataKey="current"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Class Average"
                  dataKey="average"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Performance Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.scoreDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats?.scoreDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Subject Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subject Performance Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell align="center">Quizzes</TableCell>
                    <TableCell align="center">Average Score</TableCell>
                    <TableCell align="center">Best Score</TableCell>
                    <TableCell align="center">Improvement</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(stats?.subjectDetails || []).map((subject) => (
                    <TableRow key={subject.name} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <School fontSize="small" />
                          </Avatar>
                          {subject.name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{subject.quizCount}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${subject.averageScore}%`}
                          color={getPerformanceColor(subject.averageScore)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{subject.bestScore}%</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getTrendIcon(subject.improvement)}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={subject.status}
                          color={
                            subject.status === 'Excellent' ? 'success' :
                            subject.status === 'Good' ? 'info' :
                            subject.status === 'Average' ? 'warning' : 'error'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Quick Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Insights
            </Typography>
            
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <Star />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Strongest Subject"
                  secondary={stats?.insights?.strongestSubject || 'N/A'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Target />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Needs Focus"
                  secondary={stats?.insights?.weakestSubject || 'N/A'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Speed />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Learning Pace"
                  secondary={stats?.insights?.learningPace || 'N/A'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Psychology />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Study Pattern"
                  secondary={stats?.insights?.studyPattern || 'N/A'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Weak Areas and Recommendations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              Areas Needing Attention
            </Typography>
            
            {weakAreas.length > 0 ? (
              <List>
                {weakAreas.map((area, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={area.topic}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {area.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={area.masteryLevel}
                              sx={{ flexGrow: 1, mr: 1 }}
                              color="warning"
                            />
                            <Typography variant="caption">
                              {area.masteryLevel}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <IconButton color="primary" size="small">
                      <Bookmark />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="success">
                Great job! No major weak areas identified.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" />
              AI Recommendations
            </Typography>
            
            <List>
              {recommendations.map((rec, index) => (
                <ListItem key={index} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={rec.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {rec.description}
                        </Typography>
                        <Chip
                          label={rec.priority}
                          size="small"
                          color={rec.priority === 'High' ? 'error' : rec.priority === 'Medium' ? 'warning' : 'info'}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity Timeline */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity Timeline
        </Typography>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats?.activityTimeline || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="quizzesCompleted" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Quizzes Completed"
            />
            <Line 
              type="monotone" 
              dataKey="averageScore" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Average Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Study Goals and Progress */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Study Goals & Progress
        </Typography>
        
        <Grid container spacing={3}>
          {(stats?.goals || []).map((goal, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Target />
                    </Avatar>
                    <Typography variant="h6">
                      {goal.title}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Progress
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
                  
                  <Typography variant="caption" color="text.secondary">
                    {goal.description}
                  </Typography>
                  
                  {goal.completed && (
                    <Chip
                      label="Completed!"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onClose={() => setShowComparison(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Performance Comparison
          <IconButton
            onClick={() => setShowComparison(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Compare your performance with class averages and your own historical data.
          </Typography>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats?.comparison || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="yourScore" fill="#8884d8" name="Your Score" />
              <Bar dataKey="classAverage" fill="#82ca9d" name="Class Average" />
            </BarChart>
          </ResponsiveContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComparison(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentStats
