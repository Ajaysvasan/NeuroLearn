import React, { useContext, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  Box,
  Badge,
  Tooltip
} from '@mui/material'
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Dashboard
} from '@mui/icons-material'

import { useAuth } from '@context/AuthContext'
import { useApp } from '@context/AppContext'

const Header = () => {
  const { user, logout } = useAuth()
  const { toggleSidebar, notifications } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleProfileMenuClose()
  }

  const handleNavigation = (path) => {
    navigate(path)
    handleProfileMenuClose()
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/teacher/dashboard')) return 'Teacher Dashboard'
    if (path.includes('/student/dashboard')) return 'Student Dashboard'
    if (path.includes('/teacher/syllabus')) return 'Manage Syllabus'
    if (path.includes('/teacher/questions')) return 'Manage Questions'
    if (path.includes('/teacher/students')) return 'View Students'
    if (path.includes('/student/quiz')) return 'Take Quiz'
    if (path.includes('/student/results')) return 'Quiz Results'
    return 'Assessment System'
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Menu Button for Sidebar Toggle */}
        {user && (
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={toggleSidebar}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and App Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                fontSize: '1.5rem'
              }}
            >
              🎓
            </Box>
            <Typography variant="h6" component="div">
              Assessment System
            </Typography>
          </Link>
          
          {/* Page Title */}
          {user && (
            <Typography 
              variant="body1" 
              sx={{ 
                ml: 4, 
                color: 'rgba(255, 255, 255, 0.7)',
                display: { xs: 'none', md: 'block' }
              }}
            >
              {getPageTitle()}
            </Typography>
          )}
        </Box>

        {/* User Actions */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleNotificationOpen}
              >
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: 1, 
                  display: { xs: 'none', sm: 'block' },
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                {user.name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  mr: 2, 
                  display: { xs: 'none', sm: 'block' },
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'capitalize'
                }}
              >
                ({user.role})
              </Typography>
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              color="inherit"
              onClick={() => navigate('/register')}
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Register
            </Button>
          </Box>
        )}

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleNavigation(`/${user?.role}/dashboard`)}>
            <Dashboard sx={{ mr: 1 }} />
            Dashboard
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/profile')}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <Settings sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="h6">Notifications</Typography>
          </Box>
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <MenuItem key={notification.id} sx={{ whiteSpace: 'normal' }}>
                <Box>
                  <Typography variant="body2" fontWeight={notification.read ? 'normal' : 'bold'}>
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {notification.timestamp}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header
