import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
  School,
  Psychology,
  Lightbulb,
  Target,
  BookmarkBorder,
  Share,
  Download,
  Close,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Comment,
  Insights,
  EmojiEvents,
  Speed,
  Timer
} from '@mui/icons-material'

import { studentService } from '@services/student.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const FeedbackDisplay = ({ quizId, quizResult }) => {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({})
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [bookmarkedTopics, setBookmarkedTopics] = useState(new Set())
  const [feedbackRating, setFeedbackRating] = useState(null)

  useEffect(() => {
    if (quizId) {
      fetchFeedback()
    }
  }, [quizId])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await studentService.getQuizFeedback(quizId)
      setFeedback(response.data)
    } catch (err) {
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleBookmarkTopic = (topic) => {
    setBookmarkedTopics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(topic)) {
        newSet.delete(topic)
      } else {
        newSet.add(topic)
      }
      return newSet
    })
    toast.success(`Topic ${bookmarkedTopics.has(topic) ? 'removed from' : 'added to'} bookmarks`)
  }

  const handleFeedbackRating = async (rating) => {
    try {
      setFeedbackRating(rating)
      await studentService.submitFeedback({
        quizId,
        rating,
        type: 'feedback_quality'
      })
      toast.success('Thank you for your feedback!')
    } catch (err) {
      toast.error('Failed to submit rating')
    }
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'info'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getPerformanceIcon = (score) => {
    if (score >= 70) return <TrendingUp color="success" />
    return <TrendingDown color="error" />
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

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
    return <LoadingSpinner text="Generating personalized feedback..." />
  }

  if (!feedback) {
    return (
      <Alert severity="info">
        Feedback is being generated. Please check back in a few moments.
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Psychology color="primary" />
          AI-Powered Feedback
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personalized insights and recommendations based on your performance
        </Typography>
      </Box>

      {/* Overall Performance Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <CircularProgressWithLabel 
                      value={feedback.overall?.score || 0} 
                      size={120}
                    />
                    <Typography variant="h5" sx={{ mt: 2 }} color={`${getPerformanceColor(feedback.overall?.score || 0)}.main`}>
                      {feedback.overall?.score || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall Score
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      {getPerformanceIcon(feedback.overall?.score || 0)}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Correct Answers
                      </Typography>
                      <Typography variant="h6">
                        {feedback.overall?.correct || 0} / {feedback.overall?.total || 0}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Time Taken
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(feedback.overall?.timeTaken || 0)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Difficulty Level
                      </Typography>
                      <Chip 
                        label={feedback.overall?.difficulty || 'Medium'}
                        color={
                          feedback.overall?.difficulty === 'Easy' ? 'success' :
                          feedback.overall?.difficulty === 'Medium' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grade & Rank
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h3" color="primary.main">
                  {feedback.grade?.letter || 'B+'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grade
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Class Rank
                </Typography>
                <Typography variant="h6">
                  {feedback.rank?.position || 15} of {feedback.rank?.total || 45}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={feedback.rank?.position ? (1 - feedback.rank.position / feedback.rank.total) * 100 : 67}
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Better than {feedback.rank?.percentile || 67}% of students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Insights color="primary" />
            AI Insights & Analysis
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Key Insight:</strong> {feedback.aiInsights?.keyInsight || "You show strong analytical skills but could benefit from more practice with complex problem-solving scenarios."}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="success.main">
                <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                Strengths
              </Typography>
              <List dense>
                {(feedback.aiInsights?.strengths || [
                  "Excellent understanding of fundamental concepts",
                  "Strong logical reasoning abilities",
                  "Good time management during assessments"
                ]).map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Star color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="warning.main">
                <Target sx={{ mr: 1, fontSize: 20 }} />
                Areas for Improvement
              </Typography>
              <List dense>
                {(feedback.aiInsights?.improvements || [
                  { area: "Complex problem solving", suggestion: "Practice more multi-step problems" },
                  { area: "Application of concepts", suggestion: "Work on real-world scenarios" }
                ]).map((improvement, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Lightbulb color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={improvement.area || improvement}
                      secondary={improvement.suggestion || "Focus on practice and review"}
                    />
                    <IconButton
                      onClick={() => handleBookmarkTopic(improvement.area || improvement)}
                      color={bookmarkedTopics.has(improvement.area || improvement) ? 'primary' : 'default'}
                    >
                      <BookmarkBorder fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Subject-wise Performance
          </Typography>
          
          {(feedback.subjectPerformance || [
            {
              name: "Mathematics",
              score: 85,
              questionsAttempted: 8,
              topics: [
                { name: "Algebra", score: 90 },
                { name: "Geometry", score: 80 },
                { name: "Statistics", score: 85 }
              ],
              recommendations: [
                { title: "Practice Geometry", description: "Focus on area and volume calculations" },
                { title: "Review Statistics", description: "Work on probability problems" }
              ]
            },
            {
              name: "Physics",
              score: 78,
              questionsAttempted: 6,
              topics: [
                { name: "Mechanics", score: 85 },
                { name: "Thermodynamics", score: 70 },
                { name: "Optics", score: 80 }
              ],
              recommendations: [
                { title: "Thermodynamics Review", description: "Study heat transfer concepts" },
                { title: "Practice Problems", description: "Solve more numerical problems" }
              ]
            }
          ]).map((subject, index) => (
            <Accordion 
              key={index}
              expanded={expandedSections[`subject-${index}`] || false}
              onChange={() => handleSectionToggle(`subject-${index}`)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <School />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                      {subject.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {subject.questionsAttempted} questions • {subject.score}% score
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${subject.score}%`}
                    color={getPerformanceColor(subject.score)}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Topic Breakdown
                    </Typography>
                    {subject.topics.map((topic, topicIndex) => (
                      <Box key={topicIndex} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            {topic.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {topic.score}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={topic.score}
                          color={getPerformanceColor(topic.score)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommendations
                    </Typography>
                    <List dense>
                      {subject.recommendations.map((rec, recIndex) => (
                        <ListItem key={recIndex}>
                          <ListItemIcon>
                            <Lightbulb color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={rec.title}
                            secondary={rec.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Detailed Question Analysis */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Question-by-Question Analysis
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowDetailedView(true)}
              startIcon={<Insights />}
            >
              Detailed View
            </Button>
          </Box>

          <Grid container spacing={2}>
            {(feedback.questionAnalysis || Array.from({ length: 6 }, (_, i) => ({
              number: i + 1,
              correct: i % 3 !== 0,
              topic: ["Algebra", "Geometry", "Physics", "Chemistry"][i % 4],
              question: `Sample question ${i + 1} content...`,
              userAnswer: `Answer ${i + 1}`,
              correctAnswer: `Correct Answer ${i + 1}`,
              explanation: `Explanation for question ${i + 1}`
            }))).slice(0, 6).map((question, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { elevation: 4 }
                  }}
                  onClick={() => setSelectedQuestion(question)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Q{question.number}
                      </Typography>
                      {question.correct ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      {question.topic}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      mt: 1, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {question.question}
                    </Typography>
                    
                    {!question.correct && (
                      <Chip 
                        label="Review"
                        size="small" 
                        color="warning" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {(feedback.questionAnalysis?.length || 6) > 6 && (
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 2 }}
              onClick={() => setShowDetailedView(true)}
            >
              View All {feedback.questionAnalysis?.length || 6} Questions
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Study Recommendations */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personalized Study Plan
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary.main">
                📚 Recommended Topics to Study
              </Typography>
              <List>
                {(feedback.studyPlan?.topics || [
                  { name: "Quadratic Equations", priority: "High", estimatedTime: "2 hours" },
                  { name: "Thermodynamics", priority: "Medium", estimatedTime: "1.5 hours" },
                  { name: "Optics", priority: "Low", estimatedTime: "1 hour" }
                ]).map((topic, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Box sx={{ 
                        width: 24, 
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
                    </ListItemIcon>
                    <ListItemText 
                      primary={topic.name}
                      secondary={`Priority: ${topic.priority} • Estimated time: ${topic.estimatedTime}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="success.main">
                🎯 Suggested Resources
              </Typography>
              <List>
                {(feedback.studyPlan?.resources || [
                  { type: "video", title: "Khan Academy - Algebra", description: "Interactive video lessons" },
                  { type: "article", title: "Physics Fundamentals", description: "Comprehensive study guide" },
                  { type: "practice", title: "Math Practice Problems", description: "100+ practice questions" }
                ]).map((resource, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Box sx={{ fontSize: '1.2rem' }}>
                        {resource.type === 'video' ? '🎥' : 
                         resource.type === 'article' ? '📖' : 
                         resource.type === 'practice' ? '✏️' : '📝'}
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={resource.title}
                      secondary={resource.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Feedback Rating */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How helpful was this feedback?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your feedback helps us improve our AI analysis
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <IconButton
                key={rating}
                onClick={() => handleFeedbackRating(rating)}
                color={feedbackRating >= rating ? 'primary' : 'default'}
              >
                {feedbackRating >= rating ? <Star /> : <StarBorder />}
              </IconButton>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button startIcon={<Share />} variant="outlined" size="small">
              Share Results
            </Button>
            <Button startIcon={<Download />} variant="outlined" size="small">
              Download Report
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Individual Question Detail Dialog */}
      {selectedQuestion && (
        <Dialog 
          open={true} 
          onClose={() => setSelectedQuestion(null)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Question {selectedQuestion.number} Analysis
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {selectedQuestion.question}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Your Answer:
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: selectedQuestion.correct ? 'success.50' : 'error.50' 
                }}>
                  {selectedQuestion.userAnswer}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Correct Answer:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                  {selectedQuestion.correctAnswer}
                </Paper>
              </Grid>
            </Grid>
            
            {selectedQuestion.explanation && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Explanation:
                </Typography>
                <Alert severity="info">
                  {selectedQuestion.explanation}
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedQuestion(null)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default FeedbackDisplay
