import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@context/AuthContext'
import { useApp } from '@context/AppContext'
import ProtectedRoute from './ProtectedRoute'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ErrorBoundary from '@components/common/ErrorBoundary'
import Layout from '@components/layout/Layout'
import { USER_ROLES } from '@utils/constants'

// Lazy load pages for better performance
const Home = lazy(() => import('@pages/Home'))
const Login = lazy(() => import('@pages/auth/Login'))
const Register = lazy(() => import('@pages/auth/Register'))
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('@pages/auth/VerifyEmail'))

// Teacher Pages
const TeacherDashboard = lazy(() => import('@pages/teacher/TeacherDashboard'))
const ManageSyllabus = lazy(() => import('@pages/teacher/ManageSyllabus'))
const ManageQuestions = lazy(() => import('@pages/teacher/ManageQuestions'))
const ViewStudents = lazy(() => import('@pages/teacher/ViewStudents'))
const CreateQuiz = lazy(() => import('@pages/teacher/CreateQuiz'))
const QuizManagement = lazy(() => import('@pages/teacher/QuizManagement'))
const TeacherAnalytics = lazy(() => import('@pages/teacher/Analytics'))
const TeacherSettings = lazy(() => import('@pages/teacher/Settings'))

// Student Pages
const StudentDashboard = lazy(() => import('@pages/student/StudentDashboard'))
const TakeQuiz = lazy(() => import('@pages/student/TakeQuiz'))
const ViewResults = lazy(() => import('@pages/student/ViewResults'))
const StudentProgress = lazy(() => import('@pages/student/Progress'))
const StudentProfile = lazy(() => import('@pages/student/Profile'))
const QuizHistory = lazy(() => import('@pages/student/QuizHistory'))
const Achievements = lazy(() => import('@pages/student/Achievements'))

// Admin Pages (if needed)
const AdminDashboard = lazy(() => import('@pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('@pages/admin/UserManagement'))
const SystemSettings = lazy(() => import('@pages/admin/SystemSettings'))
const SystemAnalytics = lazy(() => import('@pages/admin/Analytics'))

// Common Pages
const Profile = lazy(() => import('@pages/common/Profile'))
const Settings = lazy(() => import('@pages/common/Settings'))
const Help = lazy(() => import('@pages/common/Help'))
const About = lazy(() => import('@pages/common/About'))
const Contact = lazy(() => import('@pages/common/Contact'))
const Privacy = lazy(() => import('@pages/common/Privacy'))
const Terms = lazy(() => import('@pages/common/Terms'))

// Error Pages
const NotFound = lazy(() => import('@pages/error/NotFound'))
const Unauthorized = lazy(() => import('@pages/error/Unauthorized'))
const ServerError = lazy(() => import('@pages/error/ServerError'))
const Maintenance = lazy(() => import('@pages/error/Maintenance'))

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
}

// Animated page wrapper
const AnimatedPage = ({ children }) => {
  const location = useLocation()
  
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )
}

// Suspense wrapper with loading
const SuspenseWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <LoadingSpinner text="Loading page..." overlay />}>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Suspense>
)

const AppRouter = () => {
  const { isAuthenticated, user, loading } = useAuth()
  const { settings, isFeatureEnabled } = useApp()
  const location = useLocation()

  // Show loading spinner during auth initialization
  if (loading) {
    return <LoadingSpinner text="Initializing..." overlay />
  }

  // Check if maintenance mode is enabled
  if (isFeatureEnabled('MAINTENANCE_MODE')) {
    return (
      <SuspenseWrapper>
        <Maintenance />
      </SuspenseWrapper>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                {isAuthenticated ? (
                  <Navigate 
                    to={user?.role === USER_ROLES.TEACHER ? '/teacher/dashboard' : '/student/dashboard'} 
                    replace 
                  />
                ) : (
                  <Home />
                )}
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        {/* Authentication Routes */}
        <Route 
          path="/login" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                {isAuthenticated ? (
                  <Navigate 
                    to={user?.role === USER_ROLES.TEACHER ? '/teacher/dashboard' : '/student/dashboard'} 
                    replace 
                  />
                ) : (
                  <Login />
                )}
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                {isAuthenticated ? (
                  <Navigate 
                    to={user?.role === USER_ROLES.TEACHER ? '/teacher/dashboard' : '/student/dashboard'} 
                    replace 
                  />
                ) : (
                  <Register />
                )}
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/forgot-password" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <ForgotPassword />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/reset-password/:token" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <ResetPassword />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/verify-email/:token" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <VerifyEmail />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <TeacherDashboard />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/dashboard" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <TeacherDashboard />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/syllabus" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <ManageSyllabus />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/questions" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <ManageQuestions />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/students" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <ViewStudents />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/quiz/create" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <CreateQuiz />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/quiz/manage" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <QuizManagement />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/analytics" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <TeacherAnalytics />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher/settings" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.TEACHER]}>
            <Layout userRole="teacher">
              <AnimatedPage>
                <SuspenseWrapper>
                  <TeacherSettings />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <Layout userRole="student">
              <AnimatedPage>
                <SuspenseWrapper>
                  <StudentDashboard />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <Layout userRole="student">
              <AnimatedPage>
                <SuspenseWrapper>
                  <StudentDashboard />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/student/quiz/:quizId" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <AnimatedPage>
              <SuspenseWrapper>
                <TakeQuiz />
              </SuspenseWrapper>
            </AnimatedPage>
          </ProtectedRoute>
        } />

        <Route path="/student/results/:quizId" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <Layout userRole="student">
              <AnimatedPage>
                <SuspenseWrapper>
                  <ViewResults />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/student/progress" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <Layout userRole="student">
              <AnimatedPage>
                <SuspenseWrapper>
                  <StudentProgress />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/student/history" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <Layout userRole="student">
              <AnimatedPage>
                <SuspenseWrapper>
                  <QuizHistory />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/student/achievements" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <Layout userRole="student">
              <AnimatedPage>
                <SuspenseWrapper>
                  <Achievements />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/student/profile" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.STUDENT]}>
            <Layout userRole="student">
              <AnimatedPage>
                <SuspenseWrapper>
                  <StudentProfile />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        {isFeatureEnabled('ADMIN_PANEL') && (
          <>
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                <Layout userRole="admin">
                  <AnimatedPage>
                    <SuspenseWrapper>
                      <AdminDashboard />
                    </SuspenseWrapper>
                  </AnimatedPage>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                <Layout userRole="admin">
                  <AnimatedPage>
                    <SuspenseWrapper>
                      <AdminDashboard />
                    </SuspenseWrapper>
                  </AnimatedPage>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                <Layout userRole="admin">
                  <AnimatedPage>
                    <SuspenseWrapper>
                      <UserManagement />
                    </SuspenseWrapper>
                  </AnimatedPage>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                <Layout userRole="admin">
                  <AnimatedPage>
                    <SuspenseWrapper>
                      <SystemSettings />
                    </SuspenseWrapper>
                  </AnimatedPage>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                <Layout userRole="admin">
                  <AnimatedPage>
                    <SuspenseWrapper>
                      <SystemAnalytics />
                    </SuspenseWrapper>
                  </AnimatedPage>
                </Layout>
              </ProtectedRoute>
            } />
          </>
        )}

        {/* Common Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <AnimatedPage>
                <SuspenseWrapper>
                  <Profile />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <AnimatedPage>
                <SuspenseWrapper>
                  <Settings />
                </SuspenseWrapper>
              </AnimatedPage>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Public Information Routes */}
        <Route 
          path="/help" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <Help />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/about" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <About />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/contact" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <Contact />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/privacy" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <Privacy />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/terms" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <Terms />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        {/* Error Routes */}
        <Route 
          path="/unauthorized" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <Unauthorized />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/server-error" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <ServerError />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        <Route 
          path="/maintenance" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <Maintenance />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />

        {/* Catch-all route for 404 */}
        <Route 
          path="*" 
          element={
            <SuspenseWrapper>
              <AnimatedPage>
                <NotFound />
              </AnimatedPage>
            </SuspenseWrapper>
          } 
        />
      </Routes>
    </AnimatePresence>
  )
}

export default AppRouter
