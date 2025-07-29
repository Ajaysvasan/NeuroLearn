// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
}

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
}

// User Permissions
export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_SYSTEM: 'manage_system',
  VIEW_ALL_DATA: 'view_all_data',
  
  // Teacher permissions
  CREATE_SYLLABUS: 'create_syllabus',
  MANAGE_SYLLABUS: 'manage_syllabus',
  CREATE_QUIZ: 'create_quiz',
  MANAGE_QUIZ: 'manage_quiz',
  VIEW_STUDENTS: 'view_students',
  MANAGE_STUDENTS: 'manage_students',
  GENERATE_QUESTIONS: 'generate_questions',
  REVIEW_QUESTIONS: 'review_questions',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // Student permissions
  TAKE_QUIZ: 'take_quiz',
  VIEW_RESULTS: 'view_results',
  VIEW_PROGRESS: 'view_progress',
  SUBMIT_FEEDBACK: 'submit_feedback',
}

// Quiz Configuration
export const QUIZ_CONFIG = {
  MIN_DURATION: 5, // minutes
  MAX_DURATION: 180, // minutes
  DEFAULT_DURATION: 30, // minutes
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 100,
  DEFAULT_QUESTIONS: 10,
  MIN_PASSING_SCORE: 0,
  MAX_PASSING_SCORE: 100,
  DEFAULT_PASSING_SCORE: 70,
  MAX_ATTEMPTS: 5,
  DEFAULT_MAX_ATTEMPTS: 2,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  WARNING_TIME: 300000, // 5 minutes before timeout
}

// Question Types
export const QUESTION_TYPES = {
  MCQ: 'mcq',
  MULTIPLE_SELECT: 'multiple_select',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  FILL_BLANK: 'fill_blank',
  MATCHING: 'matching',
  ORDERING: 'ordering',
}

// Question Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

// Question Status
export const QUESTION_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
}

// Quiz Status
export const QUIZ_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
}

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    SYLLABUS: ['.pdf', '.doc', '.docx', '.txt'],
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENT: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    SPREADSHEET: ['.xls', '.xlsx', '.csv'],
    ARCHIVE: ['.zip', '.rar', '.tar.gz'],
  },
  MIME_TYPES: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    TXT: 'text/plain',
    JPG: 'image/jpeg',
    PNG: 'image/png',
    GIF: 'image/gif',
    WEBP: 'image/webp',
  }
}

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  QUIZ_ASSIGNED: 'quiz_assigned',
  QUIZ_REMINDER: 'quiz_reminder',
  QUIZ_COMPLETED: 'quiz_completed',
  RESULT_AVAILABLE: 'result_available',
  ACHIEVEMENT_EARNED: 'achievement_earned',
  SYSTEM_UPDATE: 'system_update',
}

// Achievement Types
export const ACHIEVEMENT_TYPES = {
  FIRST_QUIZ: 'first_quiz',
  PERFECT_SCORE: 'perfect_score',
  WEEK_STREAK: 'week_streak',
  MONTH_STREAK: 'month_streak',
  HIGH_PERFORMER: 'high_performer',
  QUICK_LEARNER: 'quick_learner',
  CONSISTENT_PERFORMER: 'consistent_performer',
  SUBJECT_MASTER: 'subject_master',
}

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  AVERAGE: 50,
  NEEDS_IMPROVEMENT: 30,
}

// Grade Mapping (Indian Education System)
export const GRADE_MAPPING = {
  'A+': { min: 95, max: 100 },
  'A': { min: 90, max: 94 },
  'B+': { min: 85, max: 89 },
  'B': { min: 70, max: 84 },
  'C+': { min: 60, max: 69 },
  'C': { min: 50, max: 59 },
  'D': { min: 35, max: 49 },
  'F': { min: 0, max: 34 },
}

// Subjects (Chennai/Tamil Nadu Curriculum)
export const SUBJECTS = {
  MATHEMATICS: 'mathematics',
  PHYSICS: 'physics',
  CHEMISTRY: 'chemistry',
  BIOLOGY: 'biology',
  ENGLISH: 'english',
  TAMIL: 'tamil',
  HINDI: 'hindi',
  COMPUTER_SCIENCE: 'computer_science',
  ECONOMICS: 'economics',
  HISTORY: 'history',
  GEOGRAPHY: 'geography',
  POLITICAL_SCIENCE: 'political_science',
  COMMERCE: 'commerce',
  ACCOUNTANCY: 'accountancy',
  BUSINESS_STUDIES: 'business_studies',
}

// Class/Grade Levels (Indian System)
export const CLASS_LEVELS = {
  CLASS_6: '6',
  CLASS_7: '7',
  CLASS_8: '8',
  CLASS_9: '9',
  CLASS_10: '10',
  CLASS_11: '11',
  CLASS_12: '12',
}

// Time Zones and Locales
export const LOCALE_CONFIG = {
  DEFAULT_LOCALE: 'en-IN',
  TIMEZONE: 'Asia/Kolkata',
  CURRENCY: 'INR',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

// Search Configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300, // milliseconds
  MAX_RESULTS: 50,
}

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  CHART_COLORS: [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E'
  ],
  DEFAULT_TIMEFRAMES: {
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    SEMESTER: 'semester',
    YEAR: 'year',
  },
  REFRESH_INTERVAL: 60000, // 1 minute
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
  QUIZ_EXPIRED: 'This quiz has expired and is no longer available.',
  QUIZ_NOT_STARTED: 'This quiz has not started yet.',
  MAX_ATTEMPTS_REACHED: 'You have reached the maximum number of attempts.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome! You have successfully logged in.',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  REGISTRATION_SUCCESS: 'Account created successfully! Welcome aboard.',
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  PASSWORD_CHANGED: 'Your password has been changed successfully.',
  QUIZ_SUBMITTED: 'Quiz submitted successfully! Results will be available shortly.',
  FILE_UPLOADED: 'File uploaded successfully.',
  DATA_SAVED: 'Data saved successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  FEEDBACK_SUBMITTED: 'Thank you for your feedback!',
}

// Loading Messages
export const LOADING_MESSAGES = {
  DEFAULT: 'Loading...',
  AUTHENTICATING: 'Authenticating...',
  PROCESSING: 'Processing...',
  UPLOADING: 'Uploading file...',
  GENERATING: 'Generating content...',
  ANALYZING: 'Analyzing data...',
  SAVING: 'Saving changes...',
  LOADING_QUIZ: 'Loading quiz...',
  SUBMITTING: 'Submitting...',
}

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SETTINGS: 'user_settings',
  QUIZ_DRAFT: 'quiz_draft_',
  LAST_ACTIVITY: 'last_activity',
  OFFLINE_DATA: 'offline_data',
}

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
  PRIMARY_COLORS: {
    BLUE: '#1976d2',
    GREEN: '#2e7d32',
    PURPLE: '#7b1fa2',
    ORANGE: '#f57c00',
    RED: '#d32f2f',
  }
}

// Export formats
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'xlsx',
  JSON: 'json',
  XML: 'xml',
}

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  GITHUB: 'github',
}

// Device Types
export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
}

// Feature Flags
export const FEATURE_FLAGS = {
  AI_GENERATION: 'ai_generation',
  DARK_MODE: 'dark_mode',
  OFFLINE_MODE: 'offline_mode',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  SOCIAL_LOGIN: 'social_login',
  GAMIFICATION: 'gamification',
  MULTILINGUAL: 'multilingual',
}

// Chennai/Tamil Nadu Specific
export const REGIONAL_CONFIG = {
  STATE: 'Tamil Nadu',
  CITY: 'Chennai',
  BOARD_TYPES: {
    CBSE: 'cbse',
    STATE_BOARD: 'tn_state',
    ICSE: 'icse',
    IGCSE: 'igcse',
  },
  LANGUAGES: {
    ENGLISH: 'en',
    TAMIL: 'ta',
    HINDI: 'hi',
  },
  ACADEMIC_YEAR: {
    START_MONTH: 6, // June
    END_MONTH: 5, // May (next year)
  }
}

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_IN: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  INDIAN_MOBILE: /^[6-9]\d{9}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  AADHAR: /^\d{4}\s\d{4}\s\d{4}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    SYLLABUS: '/teacher/syllabus',
    QUESTIONS: '/teacher/questions',
    QUIZZES: '/teacher/quizzes',
    STUDENTS: '/teacher/students',
    ANALYTICS: '/teacher/analytics',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    QUIZZES: '/student/quizzes',
    RESULTS: '/student/results',
    PROGRESS: '/student/progress',
    ACHIEVEMENTS: '/student/achievements',
  },
}

// Default exports for commonly used constants
export default {
  API_CONFIG,
  AUTH_CONFIG,
  USER_ROLES,
  QUIZ_CONFIG,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  LOCALE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGIONAL_CONFIG,
}
