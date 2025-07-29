import { USER_ROLES, PERMISSIONS } from '@utils/constants'

// Route configuration object
export const routes = {
  // Public routes
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password/:token',
    verifyEmail: '/verify-email/:token',
    about: '/about',
    contact: '/contact',
    help: '/help',
    privacy: '/privacy',
    terms: '/terms',
  },

  // Teacher routes
  teacher: {
    base: '/teacher',
    dashboard: '/teacher/dashboard',
    syllabus: '/teacher/syllabus',
    questions: '/teacher/questions',
    students: '/teacher/students',
    quizzes: {
      base: '/teacher/quiz',
      create: '/teacher/quiz/create',
      manage: '/teacher/quiz/manage',
      edit: '/teacher/quiz/edit/:quizId',
      view: '/teacher/quiz/view/:quizId',
      results: '/teacher/quiz/results/:quizId',
    },
    analytics: '/teacher/analytics',
    settings: '/teacher/settings',
    profile: '/teacher/profile',
    reports: '/teacher/reports',
  },

  // Student routes
  student: {
    base: '/student',
    dashboard: '/student/dashboard',
    quiz: {
      take: '/student/quiz/:quizId',
      results: '/student/results/:quizId',
      history: '/student/history',
    },
    progress: '/student/progress',
    achievements: '/student/achievements',
    profile: '/student/profile',
    settings: '/student/settings',
    bookmarks: '/student/bookmarks',
    goals: '/student/goals',
  },

  // Admin routes
  admin: {
    base: '/admin',
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    teachers: '/admin/teachers',
    students: '/admin/students',
    system: '/admin/system',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
    logs: '/admin/logs',
    reports: '/admin/reports',
  },

  // Common authenticated routes
  common: {
    profile: '/profile',
    settings: '/settings',
    notifications: '/notifications',
    support: '/support',
  },

  // Error routes
  error: {
    notFound: '/404',
    unauthorized: '/unauthorized',
    serverError: '/server-error',
    maintenance: '/maintenance',
  },

  // API routes (for reference)
  api: {
    base: '/api',
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      verifyEmail: '/api/auth/verify-email',
    },
    teacher: {
      dashboard: '/api/teacher/dashboard',
      syllabus: '/api/teacher/syllabus',
      questions: '/api/teacher/questions',
      quizzes: '/api/teacher/quizzes',
      students: '/api/teacher/students',
      analytics: '/api/teacher/analytics',
    },
    student: {
      dashboard: '/api/student/dashboard',
      quizzes: '/api/student/quizzes',
      results: '/api/student/results',
      progress: '/api/student/progress',
      achievements: '/api/student/achievements',
    },
    admin: {
      users: '/api/admin/users',
      system: '/api/admin/system',
      analytics: '/api/admin/analytics',
    },
  },
}

// Route metadata with permissions and settings
export const routeConfig = {
  // Teacher routes configuration
  '/teacher': {
    roles: [USER_ROLES.TEACHER],
    permissions: [],
    title: 'Teacher Dashboard',
    breadcrumb: 'Dashboard',
    icon: 'dashboard',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  '/teacher/dashboard': {
    roles: [USER_ROLES.TEACHER],
    permissions: [],
    title: 'Teacher Dashboard',
    breadcrumb: 'Dashboard',
    icon: 'dashboard',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  '/teacher/syllabus': {
    roles: [USER_ROLES.TEACHER],
    permissions: [PERMISSIONS.MANAGE_SYLLABUS],
    title: 'Manage Syllabus',
    breadcrumb: 'Syllabus',
    icon: 'school',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  '/teacher/questions': {
    roles: [USER_ROLES.TEACHER],
    permissions: [PERMISSIONS.GENERATE_QUESTIONS, PERMISSIONS.REVIEW_QUESTIONS],
    title: 'Manage Questions',
    breadcrumb: 'Questions',
    icon: 'quiz',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  '/teacher/students': {
    roles: [USER_ROLES.TEACHER],
    permissions: [PERMISSIONS.VIEW_STUDENTS],
    title: 'View Students',
    breadcrumb: 'Students',
    icon: 'people',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  '/teacher/quiz/create': {
    roles: [USER_ROLES.TEACHER],
    permissions: [PERMISSIONS.CREATE_QUIZ],
    title: 'Create Quiz',
    breadcrumb: 'Create Quiz',
    icon: 'add',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  '/teacher/quiz/manage': {
    roles: [USER_ROLES.TEACHER],
    permissions: [PERMISSIONS.MANAGE_QUIZ],
    title: 'Manage Quizzes',
    breadcrumb: 'Manage Quizzes',
    icon: 'assignment',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  '/teacher/analytics': {
    roles: [USER_ROLES.TEACHER],
    permissions: [PERMISSIONS.VIEW_ANALYTICS],
    title: 'Analytics',
    breadcrumb: 'Analytics',
    icon: 'analytics',
    layout: 'teacher',
    requireEmailVerification: true,
  },

  // Student routes configuration
  '/student': {
    roles: [USER_ROLES.STUDENT],
    permissions: [],
    title: 'Student Dashboard',
    breadcrumb: 'Dashboard',
    icon: 'dashboard',
    layout: 'student',
    requireEmailVerification: false,
  },

  '/student/dashboard': {
    roles: [USER_ROLES.STUDENT],
    permissions: [],
    title: 'Student Dashboard',
    breadcrumb: 'Dashboard',
    icon: 'dashboard',
    layout: 'student',
    requireEmailVerification: false,
  },

  '/student/quiz/:quizId': {
    roles: [USER_ROLES.STUDENT],
    permissions: [PERMISSIONS.TAKE_QUIZ],
    title: 'Take Quiz',
    breadcrumb: 'Quiz',
    icon: 'quiz',
    layout: 'minimal', // Minimal layout for quiz taking
    requireEmailVerification: false,
    allowedDevices: ['desktop', 'tablet'], // Restrict mobile for better experience
    timeRestrictions: null, // Can be set per quiz
  },

  '/student/results/:quizId': {
    roles: [USER_ROLES.STUDENT],
    permissions: [PERMISSIONS.VIEW_RESULTS],
    title: 'Quiz Results',
    breadcrumb: 'Results',
    icon: 'assessment',
    layout: 'student',
    requireEmailVerification: false,
  },

  '/student/progress': {
    roles: [USER_ROLES.STUDENT],
    permissions: [PERMISSIONS.VIEW_PROGRESS],
    title: 'Progress Tracking',
    breadcrumb: 'Progress',
    icon: 'trending_up',
    layout: 'student',
    requireEmailVerification: false,
  },

  '/student/achievements': {
    roles: [USER_ROLES.STUDENT],
    permissions: [],
    title: 'Achievements',
    breadcrumb: 'Achievements',
    icon: 'emoji_events',
    layout: 'student',
    requireEmailVerification: false,
  },

  // Admin routes configuration
  '/admin': {
    roles: [USER_ROLES.ADMIN],
    permissions: [],
    title: 'Admin Dashboard',
    breadcrumb: 'Dashboard',
    icon: 'admin_panel_settings',
    layout: 'admin',
    requireEmailVerification: true,
  },

  '/admin/users': {
    roles: [USER_ROLES.ADMIN],
    permissions: [PERMISSIONS.MANAGE_USERS],
    title: 'User Management',
    breadcrumb: 'Users',
    icon: 'people',
    layout: 'admin',
    requireEmailVerification: true,
  },

  '/admin/system': {
    roles: [USER_ROLES.ADMIN],
    permissions: [PERMISSIONS.MANAGE_SYSTEM],
    title: 'System Settings',
    breadcrumb: 'System',
    icon: 'settings',
    layout: 'admin',
    requireEmailVerification: true,
  },

  // Common routes
  '/profile': {
    roles: [USER_ROLES.TEACHER, USER_ROLES.STUDENT, USER_ROLES.ADMIN],
    permissions: [],
    title: 'Profile',
    breadcrumb: 'Profile',
    icon: 'person',
    layout: 'common',
    requireEmailVerification: false,
  },

  '/settings': {
    roles: [USER_ROLES.TEACHER, USER_ROLES.STUDENT, USER_ROLES.ADMIN],
    permissions: [],
    title: 'Settings',
    breadcrumb: 'Settings',
    icon: 'settings',
    layout: 'common',
    requireEmailVerification: false,
  },
}

// Navigation menu structure
export const navigationMenus = {
  teacher: [
    {
      label: 'Dashboard',
      path: routes.teacher.dashboard,
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'Syllabus',
      path: routes.teacher.syllabus,
      icon: 'school',
      permissions: [PERMISSIONS.MANAGE_SYLLABUS],
    },
    {
      label: 'Questions',
      path: routes.teacher.questions,
      icon: 'quiz',
      permissions: [PERMISSIONS.GENERATE_QUESTIONS],
    },
    {
      label: 'Quizzes',
      icon: 'assignment',
      children: [
        {
          label: 'Create Quiz',
          path: routes.teacher.quizzes.create,
          permissions: [PERMISSIONS.CREATE_QUIZ],
        },
        {
          label: 'Manage Quizzes',
          path: routes.teacher.quizzes.manage,
          permissions: [PERMISSIONS.MANAGE_QUIZ],
        },
      ],
    },
    {
      label: 'Students',
      path: routes.teacher.students,
      icon: 'people',
      permissions: [PERMISSIONS.VIEW_STUDENTS],
    },
    {
      label: 'Analytics',
      path: routes.teacher.analytics,
      icon: 'analytics',
      permissions: [PERMISSIONS.VIEW_ANALYTICS],
    },
    {
      label: 'Settings',
      path: routes.teacher.settings,
      icon: 'settings',
    },
  ],

  student: [
    {
      label: 'Dashboard',
      path: routes.student.dashboard,
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'Quiz History',
      path: routes.student.quiz.history,
      icon: 'history',
    },
    {
      label: 'Progress',
      path: routes.student.progress,
      icon: 'trending_up',
    },
    {
      label: 'Achievements',
      path: routes.student.achievements,
      icon: 'emoji_events',
    },
    {
      label: 'Profile',
      path: routes.student.profile,
      icon: 'person',
    },
    {
      label: 'Settings',
      path: routes.student.settings,
      icon: 'settings',
    },
  ],

  admin: [
    {
      label: 'Dashboard',
      path: routes.admin.dashboard,
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'User Management',
      icon: 'people',
      children: [
        {
          label: 'All Users',
          path: routes.admin.users,
        },
        {
          label: 'Teachers',
          path: routes.admin.teachers,
        },
        {
          label: 'Students',
          path: routes.admin.students,
        },
      ],
    },
    {
      label: 'System',
      path: routes.admin.system,
      icon: 'settings',
      permissions: [PERMISSIONS.MANAGE_SYSTEM],
    },
    {
      label: 'Analytics',
      path: routes.admin.analytics,
      icon: 'analytics',
      permissions: [PERMISSIONS.VIEW_ALL_DATA],
    },
    {
      label: 'Reports',
      path: routes.admin.reports,
      icon: 'assessment',
    },
  ],
}

// Breadcrumb configuration
export const breadcrumbConfig = {
  // Dynamic breadcrumb generators
  '/teacher/quiz/edit/:quizId': (params) => [
    { label: 'Dashboard', path: routes.teacher.dashboard },
    { label: 'Quizzes', path: routes.teacher.quizzes.manage },
    { label: `Edit Quiz ${params.quizId}`, path: null },
  ],

  '/student/quiz/:quizId': (params) => [
    { label: 'Dashboard', path: routes.student.dashboard },
    { label: `Quiz ${params.quizId}`, path: null },
  ],

  '/student/results/:quizId': (params) => [
    { label: 'Dashboard', path: routes.student.dashboard },
    { label: 'History', path: routes.student.quiz.history },
    { label: `Results ${params.quizId}`, path: null },
  ],
}

// Route utilities
export const routeUtils = {
  // Get route config for current path
  getRouteConfig: (pathname) => {
    return routeConfig[pathname] || null
  },

  // Check if route requires specific role
  requiresRole: (pathname, role) => {
    const config = routeConfig[pathname]
    return config?.roles?.includes(role) || false
  },

  // Check if route requires specific permission
  requiresPermission: (pathname, permission) => {
    const config = routeConfig[pathname]
    return config?.permissions?.includes(permission) || false
  },

  // Get navigation menu for role
  getNavigationForRole: (role) => {
    return navigationMenus[role.toLowerCase()] || []
  },

  // Generate breadcrumbs for path
  generateBreadcrumbs: (pathname, params = {}) => {
    if (breadcrumbConfig[pathname]) {
      return breadcrumbConfig[pathname](params)
    }

    // Default breadcrumb generation
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: index === segments.length - 1 ? null : '/' + segments.slice(0, index + 1).join('/'),
    }))
  },

  // Build route path with parameters
  buildPath: (template, params) => {
    let path = template
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value)
    })
    return path
  },

  // Check if current path matches route
  matchesRoute: (currentPath, routePath, exact = false) => {
    if (exact) {
      return currentPath === routePath
    }
    return currentPath.startsWith(routePath)
  },
}

export default routes
