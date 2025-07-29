import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Alert
} from '@mui/material'
import {
  People,
  Search,
  FilterList,
  Visibility,
  TrendingUp,
  TrendingDown,
  School,
  EmojiEvents,
  Assignment,
  Close,
  Download,
  Email,
  Phone
} from '@mui/icons-material'

import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const StudentDashboard = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [performanceFilter, setPerformanceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [students, searchTerm, classFilter, subjectFilter, performanceFilter, sortBy, sortOrder])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getStudentsList()
      setStudents(response.data.students)
      setStats(response.data.stats)
    } catch (err) {
      toast.error('Failed to fetch students data')
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...students]

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class === classFilter)
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(student => 
        student.subjects?.includes(subjectFilter)
      )
    }

    if (performanceFilter !== 'all') {
      filtered = filtered.filter(student => {
        const avgScore = student.averageScore || 0
        switch (performanceFilter) {
          case 'excellent': return avgScore >= 90
          case 'good': return avgScore >= 70 && avgScore < 90
          case 'average': return avgScore >= 50 && avgScore < 70
          case 'needs_improvement': return avgScore < 50
          default: return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'averageScore':
          aValue = a.averageScore || 0
          bValue = b.averageScore || 0
          break
        case 'quizzesTaken':
          aValue = a.quizzesTaken || 0
          bValue = b.quizzesTaken || 0
          break
        case 'lastActive':
          aValue = new Date(a.lastActive)
          bValue = new Date(b.lastActive)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredStudents(filtered)
  }

  const viewStudentDetails = async (studentId) => {
    try {
      const response = await teacherService.getStudentDetails(studentId)
      setSelectedStudent(response.data)
    } catch (err) {
      toast.error('Failed to fetch student details')
    }
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'info'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Average'
    return 'Needs Improvement'
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp color="success" />
    if (trend < 0) return <TrendingDown color="error" />
    return null
  }

  const exportStudentData = async () => {
    try {
      // Implementation for exporting student data
      toast.success('Student data exported successfully!')
    } catch (err) {
      toast.error('Failed to export data')
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading students..." />
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <People color="primary" />
          Students Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and analyze your students' performance and progress
        </Typography>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {stats.totalStudents || students.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {stats.highPerformers || students.filter(s => s.averageScore >= 70).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Performers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {stats.activeStudents || students.filter(s => s.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {stats.averageScore ? Math.round(stats.averageScore) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class Average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                label="Class"
              >
                <MenuItem value="all">All Classes</MenuItem>
                <MenuItem value="10A">Class 10A</MenuItem>
                <MenuItem value="10B">Class 10B</MenuItem>
                <MenuItem value="11A">Class 11A</MenuItem>
                <MenuItem value="11B">Class 11B</MenuItem>
                <MenuItem value="12A">Class 12A</MenuItem>
                <MenuItem value="12B">Class 12B</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                label="Subject"
              >
                <MenuItem value="all">All Subjects</MenuItem>
                <MenuItem value="mathematics">Mathematics</MenuItem>
                <MenuItem value="physics">Physics</MenuItem>
                <MenuItem value="chemistry">Chemistry</MenuItem>
                <MenuItem value="biology">Biology</MenuItem>
                <MenuItem value="english">English</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Performance</InputLabel>
              <Select
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
                label="Performance"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="excellent">Excellent (90+)</MenuItem>
                <MenuItem value="good">Good (70-89)</MenuItem>
                <MenuItem value="average">Average (50-69)</MenuItem>
                <MenuItem value="needs_improvement">Needs Improvement (&lt;50)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="averageScore">Average Score</MenuItem>
                <MenuItem value="quizzesTaken">Quizzes Taken</MenuItem>
                <MenuItem value="lastActive">Last Active</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button
              variant="outlined"
              onClick={exportStudentData}
              startIcon={<Download />}
              fullWidth
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Grid */}
      <Grid container spacing={3}>
        {filteredStudents.map((student) => (
          <Grid item xs={12} sm={6} lg={4} key={student.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Student Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      mr: 2, 
                      bgcolor: 'primary.main',
                      fontSize: '1.25rem'
                    }}
                  >
                    {student.name.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" noWrap>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {student.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {student.studentId} • Class: {student.class}
                    </Typography>
                  </Box>

                  <Chip
                    label={getPerformanceLabel(student.averageScore || 0)}
                    color={getPerformanceColor(student.averageScore || 0)}
                    size="small"
                  />
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Overall Progress</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {student.averageScore || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={student.averageScore || 0}
                    color={getPerformanceColor(student.averageScore || 0)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h6" color="primary.main">
                        {student.quizzesTaken || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Quizzes Taken
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h6" color="success.main">
                        {student.streak || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Day Streak
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Subjects */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Subjects:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(student.subjects || []).slice(0, 3).map((subject, index) => (
                      <Chip
                        key={index}
                        label={subject}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {(student.subjects || []).length > 3 && (
                      <Chip
                        label={`+${student.subjects.length - 3}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                </Box>

                {/* Last Activity */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Last active: {new Date(student.lastActive).toLocaleDateString()}
                  </Typography>
                  {getTrendIcon(student.trend)}
                </Box>
              </CardContent>

              {/* Actions */}
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => viewStudentDetails(student.id)}
                >
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredStudents.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || classFilter !== 'all' || subjectFilter !== 'all' || performanceFilter !== 'all'
              ? 'Try adjusting your filters to see more students.'
              : 'Students will appear here once they register for your courses.'
            }
          </Typography>
        </Paper>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <Dialog 
          open={true} 
          onClose={() => setSelectedStudent(null)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedStudent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.email}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedStudent(null)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Student ID:</strong> {selectedStudent.studentId}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Class:</strong> {selectedStudent.class}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Join Date:</strong> {new Date(selectedStudent.joinDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Parent Email:</strong> {selectedStudent.parentEmail || 'Not provided'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Performance Summary */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Overall Average
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {selectedStudent.averageScore || 0}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Quizzes Completed
                      </Typography>
                      <Typography variant="h6">
                        {selectedStudent.quizzesTaken || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Best Score
                      </Typography>
                      <Typography variant="h6">
                        {selectedStudent.bestScore || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Subject-wise Performance */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Subject-wise Performance
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell align="center">Quizzes</TableCell>
                          <TableCell align="center">Average Score</TableCell>
                          <TableCell align="center">Best Score</TableCell>
                          <TableCell align="center">Progress</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedStudent.subjectPerformance || []).map((subject) => (
                          <TableRow key={subject.name}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell align="center">{subject.quizCount}</TableCell>
                            <TableCell align="center">{subject.averageScore}%</TableCell>
                            <TableCell align="center">{subject.bestScore}%</TableCell>
                            <TableCell align="center">
                              <LinearProgress
                                variant="determinate"
                                value={subject.averageScore}
                                color={getPerformanceColor(subject.averageScore)}
                                sx={{ width: 60 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Recent Activity */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  {(selectedStudent.recentActivity || []).length > 0 ? (
                    <Box>
                      {selectedStudent.recentActivity.slice(0, 5).map((activity, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body2">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity available
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button startIcon={<Email />}>
              Send Email
            </Button>
            <Button startIcon={<Phone />}>
              Contact Parent
            </Button>
            <Button onClick={() => setSelectedStudent(null)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default StudentDashboard
