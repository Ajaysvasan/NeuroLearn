import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert
} from '@mui/material'
import {
  Search,
  FilterList,
  Download,
  Email,
  Analytics,
  People,
  School,
  TrendingUp
} from '@mui/icons-material'

import StudentDashboard from '@components/teacher/StudentDashboard'
import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const ViewStudents = () => {
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    class: 'all',
    subject: 'all',
    performance: 'all',
    status: 'all'
  })
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    highPerformers: 0,
    needsAttention: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Mock stats for demonstration
      const mockStats = {
        total: 156,
        active: 142,
        inactive: 14,
        highPerformers: 28,
        needsAttention: 12
      }
      
      setStats(mockStats)
    } catch (err) {
      toast.error('Failed to load student statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    
    // Update filters based on tab
    const statusMap = ['all', 'active', 'inactive', 'high_performers', 'needs_attention']
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

  const handleExportData = async () => {
    try {
      setLoading(true)
      // Mock export functionality
      toast.success('Student data exported successfully!')
    } catch (err) {
      toast.error('Failed to export student data')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkEmail = () => {
    toast.info('Bulk email feature coming soon!')
  }

  if (loading && stats.total === 0) {
    return <LoadingSpinner text="Loading student data..." />
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            View Students
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor student performance and manage your class
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={handleBulkEmail}
          >
            Bulk Email
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportData}
            disabled={loading}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Students
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <School sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main">
              {stats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Students
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info.main">
              {stats.highPerformers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Performers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Analytics sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main">
              {stats.needsAttention}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Needs Attention
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {stats.inactive}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inactive Students
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search students..."
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
              <InputLabel>Class</InputLabel>
              <Select
                value={filters.class}
                onChange={(e) => handleFilterChange('class', e.target.value)}
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
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
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
                value={filters.performance}
                onChange={(e) => handleFilterChange('performance', e.target.value)}
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

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilters({
                    search: '',
                    class: 'all',
                    subject: 'all',
                    performance: 'all',
                    status: 'all'
                  })
                  setTabValue(0)
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Active Filters Alert */}
        {(filters.search || filters.class !== 'all' || filters.subject !== 'all' || filters.performance !== 'all') && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Filters applied: 
              {filters.search && ` Search: "${filters.search}"`}
              {filters.class !== 'all' && ` Class: ${filters.class}`}
              {filters.subject !== 'all' && ` Subject: ${filters.subject}`}
              {filters.performance !== 'all' && ` Performance: ${filters.performance}`}
            </Typography>
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
          <Tab label={`All Students (${stats.total})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Inactive (${stats.inactive})`} />
          <Tab label={`High Performers (${stats.highPerformers})`} />
          <Tab label={`Needs Attention (${stats.needsAttention})`} />
        </Tabs>
      </Paper>

      {/* Student Dashboard Component */}
      <StudentDashboard filters={filters} />

      {loading && (
        <LoadingSpinner overlay text="Processing..." />
      )}
    </Box>
  )
}

export default ViewStudents
