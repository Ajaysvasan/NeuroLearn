import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Paper,
  Alert
} from '@mui/material'
import {
  Search,
  FilterList,
  Add,
  AutoAwesome,
  Psychology
} from '@mui/icons-material'

import QuestionReview from '@components/teacher/QuestionReview'
import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const ManageQuestions = () => {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [syllabi, setSyllabi] = useState([])
  const [selectedSyllabus, setSelectedSyllabus] = useState('')
  const [filters, setFilters] = useState({
    difficulty: 'all',
    type: 'all',
    status: 'all',
    search: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchSyllabi()
    fetchStats()
  }, [])

  const fetchSyllabi = async () => {
    try {
      const response = await teacherService.getSyllabusList()
      setSyllabi(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedSyllabus(response.data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch syllabi:', err)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock stats for demonstration
      setStats({
        total: 245,
        pending: 18,
        approved: 180,
        rejected: 47
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    // Update status filter based on tab
    const statusMap = ['all', 'pending', 'approved', 'rejected']
    setFilters(prev => ({
      ...prev,
      status: statusMap[newValue]
    }))
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerateQuestions = async () => {
    if (!selectedSyllabus) {
      toast.warning('Please select a syllabus first')
      return
    }

    try {
      setLoading(true)
      await teacherService.generateQuestions(selectedSyllabus, {
        count: 20,
        difficulty: 'mixed',
        types: ['mcq', 'short_answer']
      })
      toast.success('20 new questions generated successfully!')
      // Refresh stats
      fetchStats()
    } catch (err) {
      toast.error('Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Questions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review AI-generated questions and manage your question bank
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Questions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Review
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {stats.approved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="error.main">
              {stats.rejected}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejected
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Select Syllabus</InputLabel>
              <Select
                value={selectedSyllabus}
                onChange={(e) => setSelectedSyllabus(e.target.value)}
                label="Select Syllabus"
              >
                {syllabi.map((syllabus) => (
                  <MenuItem key={syllabus.id} value={syllabus.id}>
                    {syllabus.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="mcq">Multiple Choice</MenuItem>
                <MenuItem value="short_answer">Short Answer</MenuItem>
                <MenuItem value="essay">Essay</MenuItem>
                <MenuItem value="true_false">True/False</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={handleGenerateQuestions}
              disabled={loading || !selectedSyllabus}
            >
              Generate Questions
            </Button>
          </Grid>
        </Grid>

        {stats.pending > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You have {stats.pending} questions pending review. Review them to make them available for quizzes.
          </Alert>
        )}
      </Paper>

      {/* Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Approved (${stats.approved})`} />
          <Tab label={`Rejected (${stats.rejected})`} />
        </Tabs>
      </Paper>

      {/* Question Review Component */}
      {selectedSyllabus ? (
        <QuestionReview 
          syllabusId={selectedSyllabus}
          filters={filters}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Select a Syllabus to Start
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a syllabus from the dropdown above to view and manage its questions
          </Typography>
        </Paper>
      )}

      {loading && (
        <LoadingSpinner overlay text="Generating questions..." />
      )}
    </Box>
  )
}

export default ManageQuestions