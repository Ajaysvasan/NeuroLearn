import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useApp } from '@context/AppContext'
import { USER_ROLES, PERMISSIONS } from '@utils/constants'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { toast } from 'react-toastify'

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [], 
  fallbackPath = '/login',
  showUnauthorizedMessage = true,
  requireEmailVerification = false,
  allowedDevices = [],
  timeRestrictions = null,
  adminOverride = false 
}) => {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    hasRole, 
    hasAnyRole, 
    hasPermission 
  } = useAuth()
  
  const { addNotification } = useApp()
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuthorization = async () => {
      setChecking(true)

      // Wait for auth initialization
      if (loading) {
        return
      }

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        setAuthorized(false)
        setChecking(false)
        if (showUnauthorizedMessage) {
          toast.error('Please log in to access this page.')
        }
        return
      }

      // Check email verification if required
      if (requireEmailVerification && !user.emailVerified) {
        setAuthorized(false)
        setChecking(false)
        if (showUnauthorizedMessage) {
          addNotification({
            type: 'warning',
            title: 'Email Verification Required',
            message: 'Please verify your email address to access this feature.',
            autoRemove: false,
          })
        }
        return
      }

      // Admin override check
      if (adminOverride && hasRole(USER_ROLES.ADMIN)) {
        setAuthorized(true)
        setChecking(false)
        return
      }

      // Check required roles
      if (requiredRoles.length > 0) {
        const hasRequiredRole = hasAnyRole(requiredRoles)
        if (!hasRequiredRole) {
          setAuthorized(false)
          setChecking(false)
          if (showUnauthorizedMessage) {
            toast.error('You do not have permission to access this page.')
          }
          return
        }
      }

      // Check required permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission => 
          hasPermission(permission)
        )
        if (!hasAllPermissions) {
          setAuthorized(false)
          setChecking(false)
          if (showUnauthorizedMessage) {
            toast.error('Insufficient permissions to access this resource.')
          }
          return
        }
      }

      // Check device restrictions
      if (allowedDevices.length > 0) {
        const currentDevice = detectDevice()
        if (!allowedDevices.includes(currentDevice)) {
          setAuthorized(false)
          setChecking(false)
          if (showUnauthorizedMessage) {
            toast.error(`Access restricted to: ${allowedDevices.join(', ')} devices only.`)
          }
          return
        }
      }

      // Check time restrictions
      if (timeRestrictions) {
        const currentTime = new Date()
        const currentHour = currentTime.getHours()
        const currentDay = currentTime.getDay() // 0 = Sunday, 1 = Monday, etc.

        if (timeRestrictions.hours) {
          const { start, end } = timeRestrictions.hours
          if (currentHour < start || currentHour > end) {
            setAuthorized(false)
            setChecking(false)
            if (showUnauthorizedMessage) {
              toast.error(`Access is only allowed between ${start}:00 and ${end}:00.`)
            }
            return
          }
        }

        if (timeRestrictions.days && !timeRestrictions.days.includes(currentDay)) {
          setAuthorized(false)
          setChecking(false)
          if (showUnauthorizedMessage) {
            const allowedDays = timeRestrictions.days.map(day => 
              ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
            ).join(', ')
            toast.error(`Access is only allowed on: ${allowedDays}.`)
          }
          return
        }
      }

      // All checks passed
      setAuthorized(true)
      setChecking(false)
    }

    checkAuthorization()
  }, [
    isAuthenticated,
    user,
    loading,
    requiredRoles,
    requiredPermissions,
    requireEmailVerification,
    allowedDevices,
    timeRestrictions,
    adminOverride,
    hasRole,
    hasAnyRole,
    hasPermission,
    showUnauthorizedMessage,
    addNotification
  ])

  // Device detection helper
  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  // Show loading while checking
  if (loading || checking) {
    return <LoadingSpinner text="Checking permissions..." overlay />
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Email verification required
  if (requireEmailVerification && !user?.emailVerified) {
    return (
      <Navigate 
        to="/verify-email" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Not authorized - redirect based on user role
  if (!authorized) {
    const redirectPath = getUnauthorizedRedirectPath(user?.role)
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          from: location,
          reason: 'unauthorized',
          requiredRoles,
          requiredPermissions 
        }} 
        replace 
      />
    )
  }

  // Authorized - render children
  return <>{children}</>
}

// Helper function to determine redirect path for unauthorized users
const getUnauthorizedRedirectPath = (userRole) => {
  switch (userRole) {
    case USER_ROLES.TEACHER:
      return '/teacher/dashboard'
    case USER_ROLES.STUDENT:
      return '/student/dashboard'
    case USER_ROLES.ADMIN:
      return '/admin/dashboard'
    default:
      return '/unauthorized'
  }
}

// Higher-order component for protected routes
export const withProtection = (Component, protectionConfig = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...protectionConfig}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Specific protection configurations
export const TeacherRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requiredRoles={[USER_ROLES.TEACHER]} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

export const StudentRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requiredRoles={[USER_ROLES.STUDENT]} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requiredRoles={[USER_ROLES.ADMIN]} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

// Multi-role route
export const MultiRoleRoute = ({ children, roles = [], ...props }) => (
  <ProtectedRoute 
    requiredRoles={roles} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

// Permission-based route
export const PermissionRoute = ({ children, permissions = [], ...props }) => (
  <ProtectedRoute 
    requiredPermissions={permissions} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

// Verified user route
export const VerifiedRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requireEmailVerification={true} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

// Time-restricted route (for exam periods, etc.)
export const TimeRestrictedRoute = ({ 
  children, 
  hours = null, 
  days = null, 
  timezone = 'Asia/Kolkata',
  ...props 
}) => (
  <ProtectedRoute 
    timeRestrictions={{ hours, days, timezone }} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

// Device-restricted route
export const DeviceRestrictedRoute = ({ 
  children, 
  allowedDevices = ['desktop', 'tablet', 'mobile'], 
  ...props 
}) => (
  <ProtectedRoute 
    allowedDevices={allowedDevices} 
    {...props}
  >
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute
