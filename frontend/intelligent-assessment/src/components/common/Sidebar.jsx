import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Typography,
  Divider,
  Chip,
  Collapse,
  Badge
} from '@mui/material'
import {
  Dashboard,
  MenuBook,
  Quiz,
  People,
  Analytics,
  Settings,
  Home,
  Assignment,
  TrendingUp,
  Feedback,
  Person,
  ExpandLess,
  ExpandMore,
  School,
  EmojiEvents,
  History
} from '@mui/icons-material'

import { useAuth } from '@context/AuthContext'
import { useApp } from '@context/AppContext'

const DRAWER_WIDTH = 280

const Sidebar = () => {
  const { user } = useAuth()
  const { sidebarOpen } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = React.useState({})

  const handleNavigation = (path) => {
    navigate(path)
  }

  const handleExpandClick = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }))
  }

  const isActive = (path) => location.pathname === path
  const isParentActive = (paths) => paths.some(path => location.pathname.startsWith(path))

  const teacherMenuItems = [
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      path: '/teacher/dashboard',
      badge: null
    },
    {
      title: 'Syllabus Management',
      icon: <MenuBook />,
      path: '/teacher/syllabus',
      subItems: [
        { title: 'Upload Syllabus', path: '/teacher/syllabus/upload' },
        { title: 'Manage Syllabus', path: '/teacher/syllabus/manage' },
        { title: 'AI Generation', path: '/teacher/syllabus/generate' }
      ]
    },
    {
      title: 'Question Management',
      icon: <Quiz />,
      path: '/teacher/questions',
      subItems: [
        { title: 'Review Questions', path: '/teacher/questions/review' },
        { title: 'Create Custom', path: '/teacher/questions/create' },
        { title: 'Question Bank', path: '/teacher/questions/bank' }
      ]
    },
    {
      title: 'Students',
      icon: <People />,
      path: '/teacher/students',
      subItems: [
        { title: 'All Students', path: '/teacher/students/all' },
        { title: 'Performance', path: '/teacher/students/performance' },
        { title: 'Progress Tracking', path: '/teacher/students/progress' }
      ]
    },
    {
      title: 'Analytics',
      icon: <Analytics />,
      path: '/teacher/analytics',
      subItems: [
        { title: 'Overview', path: '/teacher/analytics/overview' },
        { title: 'Class Performance', path: '/teacher/analytics/class' },
        { title: 'Subject Analysis', path: '/teacher/analytics/subject' }
      ]
    },
    {
      title: 'Settings',
      icon: <Settings />,
      path: '/teacher/settings'
    }
  ]

  const studentMenuItems = [
    {
      title: 'Dashboard',
      icon: <Home />,
      path: '/student/dashboard'
    },
    {
      title: 'Take Quiz',
      icon: <Assignment />,
      path: '/student/quiz',
      badge: { count: 3, color: 'primary' }
    },
    {
      title: 'My Results',
      icon: <EmojiEvents />,
      path: '/student/results',
      subItems: [
        { title: 'Recent Results', path: '/student/results/recent' },
        { title: 'All Results', path: '/student/results/all' },
        { title: 'Certificates', path: '/student/results/certificates' }
      ]
    },
    {
      title: 'Progress',
      icon: <TrendingUp />,
      path: '/student/progress',
      subItems: [
        { title: 'Overall Progress', path: '/student/progress/overall' },
        { title: 'Subject-wise', path: '/student/progress/subjects' },
        { title: 'Weak Areas', path: '/student/progress/weak-areas' }
      ]
    },
    {
      title: 'Feedback',
      icon: <Feedback />,
      path: '/student/feedback'
    },
    {
      title: 'History',
      icon: <History />,
      path: '/student/history'
    },
    {
      title: 'Profile',
      icon: <Person />,
      path: '/student/profile'
    }
  ]

  const menuItems = user?.role === 'teacher' ? teacherMenuItems : studentMenuItems

  if (!user) return null

  const renderMenuItem = (item, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isItemActive = isActive(item.path)
    const isItemParentActive = hasSubItems && isParentActive([item.path])
    const isExpanded = expandedItems[item.title]

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasSubItems) {
                handleExpandClick(item.title)
              } else {
                handleNavigation(item.path)
              }
            }}
            selected={isItemActive || isItemParentActive}
            sx={{
              pl: isSubItem ? 4 : 2,
              pr: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                backgroundColor: isItemActive ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isItemActive || isItemParentActive ? 'inherit' : 'text.secondary'
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: isSubItem ? '0.875rem' : '0.95rem',
                fontWeight: isItemActive ? 600 : 500
              }}
            />

            {item.badge && (
              <Badge
                badgeContent={item.badge.count}
                color={item.badge.color}
                sx={{ mr: hasSubItems ? 1 : 0 }}
              />
            )}

            {hasSubItems && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {hasSubItems && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => (
                <ListItem key={subItem.title} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(subItem.path)}
                    selected={isActive(subItem.path)}
                    sx={{
                      pl: 6,
                      pr: 2,
                      py: 1,
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={subItem.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive(subItem.path) ? 600 : 400
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Toolbar Spacer */}
      <Box sx={{ height: 64 }} />

      {/* User Profile Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '1.5rem'
          }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
        
        <Typography variant="h6" gutterBottom>
          {user.name}
        </Typography>
        
        <Chip
          label={user.role?.toUpperCase()}
          size="small"
          color={user.role === 'teacher' ? 'primary' : 'secondary'}
          sx={{ mb: 1 }}
        />
        
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>

        {/* Quick Stats */}
        {user.role === 'student' && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {user.stats?.quizzesTaken || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Quizzes
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {user.stats?.averageScore || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average
              </Typography>
            </Box>
          </Box>
        )}

        {user.role === 'teacher' && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {user.stats?.totalStudents || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Students
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {user.stats?.quizzesCreated || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Quizzes
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Assessment System v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Made with ❤️ in Chennai
        </Typography>
      </Box>
    </Drawer>
  )
}

export default Sidebar
