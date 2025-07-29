import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
  School,
  Quiz,
  Timer,
  Speed,
  EmojiEvents,
  Share,
  Download,
  Refresh,
  Home,
  Visibility,
  Psychology,
  Star,
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
  Tooltip,
  LineChart,
  Line,
  Legend
} from 'recharts'

import FeedbackDisplay from '@components/student/FeedbackDisplay'
import { studentService } from '@services/student.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const ViewResults = () => {
  const { quizId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [error, setError] = useState('')

  // Get result from navigation state if coming directly from quiz
  const resultFromQuiz = location.state?.result

  useEffect(() => {
    if (quizId) {
      if (resultFromQuiz) {
        setResults(resultFromQuiz)
        setLoading(false)
      } else {
        fetchResults()
      }
    }
  }, [quizId, resultFromQuiz])

  const fetchResults = async () => {
    try {
      setLoading(true)
      
      // Mock results data for demonstration
      const mockResults = {
        quiz: {
          id: parseInt(quizId),
          title: 'Advanced Mathematics Quiz',
          subject: 'Mathematics',
          duration: 45,
          totalQuestions: 20,
          difficulty: 'Hard',
          teacherName: 'Dr. Rajesh Kumar',
          passingScore: 70,
          maxScore: 100
        },
        attempt: {
          attemptNumber: 2,
          score: 85,
          percentage: 85,
          totalMarks: 100,
          obtainedMarks: 85,
          timeSpent: 2580, // seconds (43 minutes)
          completedAt: new Date().toISOString(),
          status: 'passed', // passed, failed
          rank: 8,
          totalStudents: 45,
          percentile: 82
        },
        performance: {
          correct: 17,
          incorrect: 3,
          unanswered: 0,
          accuracy: 85,
          speed: 2.3, // questions per minute
          improvement: 12, // percentage improvement from last attempt
          totalTime: 2580,
          averageTimePerQuestion: 129
        },
        subjectBreakdown: [
          { topic: 'Differential Calculus', total: 5, correct: 5, percentage: 100, color: '#0088FE' },
          { topic: 'Integral Calculus', total: 6, correct: 5, percentage: 83, color: '#00C49F' },
          { topic: 'Linear Algebra', total: 4, correct: 3, percentage: 75, color: '#FFBB28' },
          { topic: 'Statistics', total: 5, correct: 4, percentage: 80, color: '#FF8042' }
        ],
        difficultyBreakdown: [
          { level: 'Easy', total: 5, correct: 5, percentage: 100, color: '#00C49F' },
          { level: 'Medium', total: 10, correct: 8, percentage: 80, color: '#FFBB28' },
          { level: 'Hard', total: 5, correct: 4, percentage: 80, color: '#FF8042' }
        ],
        classComparison: {
          classAverage: 72,
          yourScore: 85,
          betterThan: 76, // percentage of students
          rank: 8,
          totalStudents: 45,
          highestScore: 96,
          lowestScore: 45
        },
        timeAnalysis: [
          { questionRange: '1-5', averageTime: 120, yourTime: 115 },
          { questionRange: '6-10', averageTime: 130, yourTime: 125 },
          { questionRange: '11-15', averageTime: 135, yourTime: 140 },
          { questionRange: '16-20', averageTime: 125, yourTime: 120 }
        ],
        previousAttempts: [
          {
            attemptNumber: 1,
            score: 73,
            completedAt: '2024-01-20',
            timeSpent: 2700,
            improvement: 0
          }
        ],
        strengths: [
          'Excellent performance in differential calculus',
          'Strong analytical thinking skills',
          'Good time management overall',
          'Consistent accuracy in easy and medium questions'
        ],
        improvements: [
          'Focus more on integral calculus concepts',
          'Practice complex problem-solving techniques',
          'Review statistics and probability topics',
          'Work on hard-level questions for better mastery'
        ],
        recommendations: [
          {
            category: 'Study Focus',
            items: [
              'Spend 30% more time on integral calculus',
              'Practice 5 hard-level problems daily',
              'Review statistics fundamentals'
            ]
          },
          {
            category: 'Resources',
            items: [
              'Khan Academy - Integral Calculus',
              'MIT OpenCourseWare - Linear Algebra',
              'StatQuest - Statistics Basics'
            ]
          }
        ],
        nextSteps: [
          'Take the Advanced Calculus quiz next week',
          'Complete the Statistics practice set',
          'Review incorrect answers with teacher',
          'Join the peer study group for mathematics'
        ]
      }
      
      setResults(mockResults)
    } catch (err) {
      setError('Failed to load quiz results')
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'info'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getPerformanceIcon = (score) => {
    if (score >= 70) return <TrendingUp color="success" />
    return <TrendingDown color="error" />
  }

  const getGradeFromScore = (score) => {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B+'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C'
    return 'F'
  }

  const CircularProgressWithLabel = ({ value, size = 80, thickness = 6 }) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        color={getScoreColor(value)}
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
        <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  )

  const handleRetakeQuiz = () => {
    navigate(`/student/quiz/${quizId}`)
  }

  const handleShareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quiz Results - ${results?.quiz?.title}`,
          text: `I scored ${results?.attempt?.score}% in ${results?.quiz?.title}!`,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Results link copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Results link copied to clipboard!')
    }
  }

  const handleDownloadResults = () => {
    const resultData = {
      quiz: results.quiz.title,
      score: results.attempt.score,
      rank: results.attempt.rank,
      timeSpent: formatTime(results.attempt.timeSpent),
      completedAt: new Date(results.attempt.completedAt).toLocaleString(),
      breakdown: results.subjectBreakdown
    }
    
    const dataStr = JSON.stringify(resultData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quiz-results-${results.quiz.title.replace(/\s+/g, '-').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Results downloaded successfully!')
  }

  if (loading) {
    return <LoadingSpinner text="Loading your results..." />
  }

  if (error || !results) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Results not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {results.quiz.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {results.quiz.subject} • {results.quiz.teacherName}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Completed on {new Date(results.attempt.completedAt).toLocaleString()}
        </Typography>
      </Box>

      {/* Result Status */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        {results.attempt.status === 'passed' ? (
          <Alert severity="success" sx={{ display: 'inline-flex', alignItems: 'center', mb: 2, maxWidth: 600 }}>
            <CheckCircle sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6">
                🎉 Congratulations! You passed the quiz!
              </Typography>
              <Typography variant="body2">
                You scored {results.attempt.score}% and ranked #{results.attempt.rank} in your class
              </Typography>
            </Box>
          </Alert>
        ) : (
          <Alert severity="error" sx={{ display: 'inline-flex', alignItems: 'center', mb: 2, maxWidth: 600 }}>
            <Cancel sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6">
                Quiz not passed. Don't give up!
              </Typography>
              <Typography variant="body2">
                You can retake the quiz to improve your score. Review the feedback below.
              </Typography>
            </Box>
          </Alert>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/student/dashboard')}
        >
          Dashboard
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRetakeQuiz}
        >
          Retake Quiz
        </Button>
        <Button
          variant="outlined"
          startIcon={<Share />}
          onClick={handleShareResults}
        >
          Share
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadResults}
        >
          Download
        </Button>
      </Box>

      {/* Score Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
            <CardContent>
              <CircularProgressWithLabel value={results.attempt.score} size={100} thickness={8} />
              <Typography variant="h4" sx={{ mt: 2 }} color={`${getScoreColor(results.attempt.score)}.main`}>
                {results.attempt.score}%
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Your Score
              </Typography>
              <Chip 
                label={getGradeFromScore(results.attempt.score)}
                color={getScoreColor(results.attempt.score)}
                sx={{ mt: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                {getPerformanceIcon(results.attempt.score)}
                {results.performance.improvement > 0 && (
                  <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                    +{results.performance.improvement}% improvement
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
            <CardContent>
              <EmojiEvents sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" color="warning.main">
                #{results.attempt.rank}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Class Rank
              </Typography>
              <Typography variant="body2" color="text.secondary">
                out of {results.attempt.totalStudents} students
              </Typography>
              <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                Top {results.attempt.percentile}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
            <CardContent>
              <Timer sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" color="info.main">
                {formatTime(results.attempt.timeSpent)}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Time Taken
              </Typography>
              <Typography variant="body2" color="text.secondary">
                out of {results.quiz.duration} minutes
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Avg: {Math.round(results.performance.averageTimePerQuestion)}s per question
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
            <CardContent>
              <Speed sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" color="primary.main">
                {results.performance.accuracy}%
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Accuracy Rate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {results.performance.correct}/{results.quiz.totalQuestions} correct
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Speed: {results.performance.speed} q/min
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main">
              {results.performance.correct}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Correct Answers
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(results.performance.correct / results.quiz.totalQuestions) * 100}
              color="success"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Cancel sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" color="error.main">
              {results.performance.incorrect}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Incorrect Answers
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(results.performance.incorrect / results.quiz.totalQuestions) * 100}
              color="error"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main">
              {results.performance.unanswered}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unanswered
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(results.performance.unanswered / results.quiz.totalQuestions) * 100}
              color="warning"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Star sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary.main">
              {results.attempt.obtainedMarks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Marks
            </Typography>
            <Typography variant="caption" color="text.secondary">
              out of {results.attempt.totalMarks}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for Detailed Analysis */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          scrollButtons="auto"
        >
          <Tab label="Topic Analysis" />
          <Tab label="Difficulty Breakdown" />
          <Tab label="Class Comparison" />
          <Tab label="Time Analysis" />
          <Tab label="AI Feedback" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance by Topic
              </Typography>
              {results.subjectBreakdown.map((topic, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {topic.topic}
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {topic.correct}/{topic.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({topic.percentage}%)
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={topic.percentage}
                    color={getScoreColor(topic.percentage)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {topic.percentage < 70 ? 'Needs improvement' : 
                       topic.percentage < 90 ? 'Good performance' : 'Excellent!'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {topic.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Topic Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={results.subjectBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="total"
                    label={({ topic, percentage }) => `${topic}: ${percentage}%`}
                  >
                    {results.subjectBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance by Difficulty Level
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.difficultyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" name="Score %" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {results.difficultyBreakdown.map((level, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={level.level}
                        color={level.level === 'Easy' ? 'success' : level.level === 'Medium' ? 'warning' : 'error'}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="h4" color={getScoreColor(level.percentage) + '.main'}>
                        {level.percentage}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {level.correct}/{level.total} questions
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={level.percentage}
                        color={getScoreColor(level.percentage)}
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Performance vs Class
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Your Score', score: results.classComparison.yourScore },
                  { name: 'Class Average', score: results.classComparison.classAverage },
                  { name: 'Highest Score', score: results.classComparison.highestScore }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class Ranking
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h3" color="primary.main" sx={{ mr: 2 }}>
                        #{results.classComparison.rank}
                      </Typography>
                      <Box>
                        <Typography variant="body1">
                          out of {results.classComparison.totalStudents} students
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          Better than {results.classComparison.betterThan}% of class
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Score Comparison
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Your Score</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {results.classComparison.yourScore}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Class Average</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {results.classComparison.classAverage}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Difference</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          +{results.classComparison.yourScore - results.classComparison.classAverage} points
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Previous Attempts Comparison */}
          {results.previousAttempts && results.previousAttempts.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Progress Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    ...results.previousAttempts.map(attempt => ({
                      attempt: `Attempt ${attempt.attemptNumber}`,
                      score: attempt.score,
                      date: new Date(attempt.completedAt).toLocaleDateString()
                    })),
                    {
                      attempt: `Attempt ${results.attempt.attemptNumber}`,
                      score: results.attempt.score,
                      date: new Date(results.attempt.completedAt).toLocaleDateString()
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Time Analysis by Question Groups
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="questionRange" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yourTime" fill="#8884d8" name="Your Time (s)" />
                  <Bar dataKey="averageTime" fill="#82ca9d" name="Class Average (s)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Time Statistics
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Total Time"
                    secondary={formatTime(results.performance.totalTime)}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Average per Question"
                    secondary={`${results.performance.averageTimePerQuestion}s`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Questions per Minute"
                    secondary={results.performance.speed}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Time Efficiency"
                    secondary={`${Math.round((results.quiz.duration * 60 - results.performance.totalTime) / (results.quiz.duration * 60) * 100)}%`}
                  />
                </ListItem>
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {results.performance.totalTime < (results.quiz.duration * 60 * 0.8) 
                    ? "Great time management! You completed the quiz efficiently."
                    : results.performance.totalTime > (results.quiz.duration * 60 * 0.95)
                    ? "Consider practicing time management for future quizzes."
                    : "Good pacing throughout the quiz."
                  }
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 4 && (
        <FeedbackDisplay 
          quizId={parseInt(quizId)} 
          quizResult={results}
        />
      )}

      {/* Recommendations Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents color="success" />
              Your Strengths
            </Typography>
            <List>
              {results.strengths.map((strength, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemText 
                    primary={strength}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="warning" />
              Areas for Improvement
            </Typography>
            <List>
              {results.improvements.map((improvement, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemText 
                    primary={improvement}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Detailed Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personalized Study Recommendations
            </Typography>
            <Grid container spacing={3}>
              {results.recommendations.map((category, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="primary.main">
                        {category.category}
                      </Typography>
                      <List dense>
                        {category.items.map((item, itemIndex) => (
                          <ListItem key={itemIndex} sx={{ pl: 0 }}>
                            <ListItemText 
                              primary={item}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Next Steps */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="primary" />
              Recommended Next Steps
            </Typography>
            <Grid container spacing={2}>
              {results.nextSteps.map((step, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ 
                          minWidth: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Box>
                        {step}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Actions */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="body2">
            <strong>Keep Learning!</strong> Use this feedback to improve your performance in future quizzes. 
            Your teacher has been notified of your results.
          </Typography>
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/student/dashboard')}
            startIcon={<Home />}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/student/progress')}
            startIcon={<TrendingUp />}
          >
            View Progress
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ViewResults
