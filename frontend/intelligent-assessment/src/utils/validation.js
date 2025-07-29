import { REGEX_PATTERNS, FILE_CONFIG, QUIZ_CONFIG } from './constants'

/**
 * Email validation
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  return REGEX_PATTERNS.EMAIL.test(email.trim())
}

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with strength and errors
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 'weak',
    errors: [],
    score: 0,
  }

  if (!password) {
    result.errors.push('Password is required')
    return result
  }

  // Length check
  if (password.length < 8) {
    result.errors.push('Password must be at least 8 characters long')
  } else {
    result.score += 1
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    result.errors.push('Password must contain at least one lowercase letter')
  } else {
    result.score += 1
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    result.errors.push('Password must contain at least one uppercase letter')
  } else {
    result.score += 1
  }

  // Number check
  if (!/\d/.test(password)) {
    result.errors.push('Password must contain at least one number')
  } else {
    result.score += 1
  }

  // Special character check
  if (!/[@$!%*?&]/.test(password)) {
    result.errors.push('Password must contain at least one special character (@$!%*?&)')
  } else {
    result.score += 1
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    result.errors.push('Please choose a less common password')
    result.score -= 2
  }

  // Calculate strength
  result.isValid = result.errors.length === 0
  
  if (result.score >= 4) {
    result.strength = 'strong'
  } else if (result.score >= 3) {
    result.strength = 'medium'
  } else {
    result.strength = 'weak'
  }

  return result
}

/**
 * Indian phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
export const isValidIndianPhone = (phone) => {
  if (!phone) return false
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '')
  
  // Check for 10 digit mobile number starting with 6-9
  if (cleanPhone.length === 10) {
    return REGEX_PATTERNS.INDIAN_MOBILE.test(cleanPhone)
  }
  
  // Check for numbers with country code (+91)
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    return REGEX_PATTERNS.INDIAN_MOBILE.test(cleanPhone.substring(2))
  }
  
  return false
}

/**
 * Name validation
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum length (default: 2)
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {object} - Validation result
 */
export const validateName = (name, minLength = 2, maxLength = 50) => {
  const result = {
    isValid: false,
    errors: []
  }

  if (!name || typeof name !== 'string') {
    result.errors.push('Name is required')
    return result
  }

  const trimmedName = name.trim()

  if (trimmedName.length < minLength) {
    result.errors.push(`Name must be at least ${minLength} characters long`)
  }

  if (trimmedName.length > maxLength) {
    result.errors.push(`Name must not exceed ${maxLength} characters`)
  }

  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
    result.errors.push('Name can only contain letters, spaces, hyphens, and apostrophes')
  }

  // Check for consecutive spaces
  if (/\s{2,}/.test(trimmedName)) {
    result.errors.push('Name cannot contain consecutive spaces')
  }

  result.isValid = result.errors.length === 0
  return result
}

/**
 * File validation
 * @param {File} file - File to validate
 * @param {string} type - File type category (e.g., 'SYLLABUS', 'IMAGE')
 * @returns {object} - Validation result
 */
export const validateFile = (file, type = 'DOCUMENT') => {
  const result = {
    isValid: false,
    errors: []
  }

  if (!file) {
    result.errors.push('File is required')
    return result
  }

  // Size validation
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    const maxSizeMB = FILE_CONFIG.MAX_SIZE / (1024 * 1024)
    result.errors.push(`File size must not exceed ${maxSizeMB}MB`)
  }

  // Type validation
  const allowedTypes = FILE_CONFIG.ALLOWED_TYPES[type] || FILE_CONFIG.ALLOWED_TYPES.DOCUMENT
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  
  if (!allowedTypes.includes(fileExtension)) {
    result.errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
  }

  // MIME type validation
  const allowedMimeTypes = Object.values(FILE_CONFIG.MIME_TYPES)
  if (!allowedMimeTypes.includes(file.type)) {
    result.errors.push('Invalid file format')
  }

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Quiz configuration validation
 * @param {object} quizData - Quiz data to validate
 * @returns {object} - Validation result
 */
export const validateQuizConfig = (quizData) => {
  const result = {
    isValid: false,
    errors: {}
  }

  // Title validation
  if (!quizData.title || quizData.title.trim().length < 3) {
    result.errors.title = ['Quiz title must be at least 3 characters long']
  } else if (quizData.title.trim().length > 100) {
    result.errors.title = ['Quiz title must not exceed 100 characters']
  }

  // Duration validation
  if (!quizData.duration || quizData.duration < QUIZ_CONFIG.MIN_DURATION) {
    result.errors.duration = [`Duration must be at least ${QUIZ_CONFIG.MIN_DURATION} minutes`]
  } else if (quizData.duration > QUIZ_CONFIG.MAX_DURATION) {
    result.errors.duration = [`Duration must not exceed ${QUIZ_CONFIG.MAX_DURATION} minutes`]
  }

  // Questions validation
  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    result.errors.questions = ['Questions array is required']
  } else if (quizData.questions.length < QUIZ_CONFIG.MIN_QUESTIONS) {
    result.errors.questions = [`Quiz must have at least ${QUIZ_CONFIG.MIN_QUESTIONS} question(s)`]
  } else if (quizData.questions.length > QUIZ_CONFIG.MAX_QUESTIONS) {
    result.errors.questions = [`Quiz cannot have more than ${QUIZ_CONFIG.MAX_QUESTIONS} questions`]
  }

  // Passing score validation
  if (quizData.passingScore < QUIZ_CONFIG.MIN_PASSING_SCORE || 
      quizData.passingScore > QUIZ_CONFIG.MAX_PASSING_SCORE) {
    result.errors.passingScore = [
      `Passing score must be between ${QUIZ_CONFIG.MIN_PASSING_SCORE}% and ${QUIZ_CONFIG.MAX_PASSING_SCORE}%`
    ]
  }

  // Max attempts validation
  if (quizData.maxAttempts && (quizData.maxAttempts < 1 || quizData.maxAttempts > QUIZ_CONFIG.MAX_ATTEMPTS)) {
    result.errors.maxAttempts = [`Max attempts must be between 1 and ${QUIZ_CONFIG.MAX_ATTEMPTS}`]
  }

  // Date validation
  if (quizData.startDate && quizData.endDate) {
    const startDate = new Date(quizData.startDate)
    const endDate = new Date(quizData.endDate)
    
    if (startDate >= endDate) {
      result.errors.endDate = ['End date must be after start date']
    }
    
    if (startDate < new Date()) {
      result.errors.startDate = ['Start date cannot be in the past']
    }
  }

  result.isValid = Object.keys(result.errors).length === 0
  return result
}

/**
 * Question validation
 * @param {object} questionData - Question data to validate
 * @returns {object} - Validation result
 */
export const validateQuestion = (questionData) => {
  const result = {
    isValid: false,
    errors: {}
  }

  // Question text validation
  if (!questionData.text || questionData.text.trim().length < 10) {
    result.errors.text = ['Question text must be at least 10 characters long']
  } else if (questionData.text.trim().length > 1000) {
    result.errors.text = ['Question text must not exceed 1000 characters']
  }

  // Type validation
  const validTypes = Object.values(QUESTION_TYPES)
  if (!questionData.type || !validTypes.includes(questionData.type)) {
    result.errors.type = ['Invalid question type']
  }

  // Options validation for MCQ type
  if (questionData.type === 'mcq') {
    if (!questionData.options || !Array.isArray(questionData.options)) {
      result.errors.options = ['Options array is required for MCQ questions']
    } else if (questionData.options.length < 2) {
      result.errors.options = ['MCQ questions must have at least 2 options']
    } else if (questionData.options.length > 6) {
      result.errors.options = ['MCQ questions cannot have more than 6 options']
    } else {
      // Check for correct answer
      const correctOptions = questionData.options.filter(opt => opt.isCorrect)
      if (correctOptions.length !== 1) {
        result.errors.options = ['MCQ questions must have exactly one correct answer']
      }
      
      // Check option text
      const emptyOptions = questionData.options.filter(opt => !opt.text || opt.text.trim().length === 0)
      if (emptyOptions.length > 0) {
        result.errors.options = ['All options must have text']
      }
    }
  }

  // Points validation
  if (!questionData.points || questionData.points < 1 || questionData.points > 100) {
    result.errors.points = ['Question points must be between 1 and 100']
  }

  result.isValid = Object.keys(result.errors).length === 0
  return result
}

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Age validation
 * @param {string|number} age - Age to validate
 * @param {number} minAge - Minimum age (default: 5)
 * @param {number} maxAge - Maximum age (default: 100)
 * @returns {object} - Validation result
 */
export const validateAge = (age, minAge = 5, maxAge = 100) => {
  const result = {
    isValid: false,
    errors: []
  }

  const ageNum = parseInt(age)
  
  if (isNaN(ageNum)) {
    result.errors.push('Age must be a valid number')
    return result
  }

  if (ageNum < minAge) {
    result.errors.push(`Age must be at least ${minAge} years`)
  }

  if (ageNum > maxAge) {
    result.errors.push(`Age must not exceed ${maxAge} years`)
  }

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Grade/Class validation
 * @param {string} grade - Grade to validate
 * @returns {boolean} - True if valid grade
 */
export const isValidGrade = (grade) => {
  const validGrades = Object.values(CLASS_LEVELS)
  return validGrades.includes(grade)
}

/**
 * Indian PIN code validation
 * @param {string} pincode - PIN code to validate
 * @returns {boolean} - True if valid PIN code
 */
export const isValidPincode = (pincode) => {
  if (!pincode) return false
  return REGEX_PATTERNS.PINCODE.test(pincode.toString())
}

/**
 * Credit card validation (for payment integration)
 * @param {string} cardNumber - Card number to validate
 * @returns {object} - Validation result with card type
 */
export const validateCreditCard = (cardNumber) => {
  const result = {
    isValid: false,
    type: null,
    errors: []
  }

  if (!cardNumber) {
    result.errors.push('Card number is required')
    return result
  }

  // Remove spaces and hyphens
  const cleanNumber = cardNumber.replace(/[\s\-]/g, '')

  // Check if only numbers
  if (!/^\d+$/.test(cleanNumber)) {
    result.errors.push('Card number must contain only digits')
    return result
  }

  // Check length
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    result.errors.push('Card number must be between 13 and 19 digits')
    return result
  }

  // Luhn algorithm validation
  let sum = 0
  let isEven = false
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }

  if (sum % 10 !== 0) {
    result.errors.push('Invalid card number')
    return result
  }

  // Determine card type
  if (/^4/.test(cleanNumber)) {
    result.type = 'Visa'
  } else if (/^5[1-5]/.test(cleanNumber)) {
    result.type = 'MasterCard'
  } else if (/^3[47]/.test(cleanNumber)) {
    result.type = 'American Express'
  } else if (/^6/.test(cleanNumber)) {
    result.type = 'Discover'
  } else {
    result.type = 'Unknown'
  }

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Batch validation utility
 * @param {object} data - Data object to validate
 * @param {object} rules - Validation rules
 * @returns {object} - Validation result
 */
export const validateBatch = (data, rules) => {
  const result = {
    isValid: true,
    errors: {}
  }

  Object.keys(rules).forEach(field => {
    const value = data[field]
    const fieldRules = rules[field]
    const fieldErrors = []

    // Required validation
    if (fieldRules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      fieldErrors.push(`${field} is required`)
    }

    // Type validation
    if (value && fieldRules.type) {
      const expectedType = fieldRules.type
      const actualType = typeof value

      if (expectedType === 'array' && !Array.isArray(value)) {
        fieldErrors.push(`${field} must be an array`)
      } else if (expectedType !== 'array' && actualType !== expectedType) {
        fieldErrors.push(`${field} must be of type ${expectedType}`)
      }
    }

    // Length validation
    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters long`)
    }

    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      fieldErrors.push(`${field} must not exceed ${fieldRules.maxLength} characters`)
    }

    // Range validation
    if (value && fieldRules.min && value < fieldRules.min) {
      fieldErrors.push(`${field} must be at least ${fieldRules.min}`)
    }

    if (value && fieldRules.max && value > fieldRules.max) {
      fieldErrors.push(`${field} must not exceed ${fieldRules.max}`)
    }

    // Pattern validation
    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      fieldErrors.push(fieldRules.message || `${field} format is invalid`)
    }

    // Custom validation
    if (value && fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customResult = fieldRules.custom(value, data)
      if (customResult !== true && typeof customResult === 'string') {
        fieldErrors.push(customResult)
      }
    }

    if (fieldErrors.length > 0) {
      result.errors[field] = fieldErrors
      result.isValid = false
    }
  })

  return result
}

// Export commonly used validation functions
export default {
  isValidEmail,
  validatePassword,
  isValidIndianPhone,
  validateName,
  validateFile,
  validateQuizConfig,
  validateQuestion,
  isValidURL,
  validateAge,
  isValidGrade,
  isValidPincode,
  validateCreditCard,
  validateBatch,
}
