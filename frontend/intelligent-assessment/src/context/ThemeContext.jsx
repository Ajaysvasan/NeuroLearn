import React, { createContext, useContext, useState, useEffect } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { THEME_CONFIG, STORAGE_KEYS } from '@utils/constants'
import { storage } from '@utils/helpers'

// Create Theme Context
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDarkMode: false,
  colors: {},
  changeColorScheme: () => {},
})

// Theme color schemes
const colorSchemes = {
  blue: {
    primary: '#1976d2',
    secondary: '#dc004e',
  },
  green: {
    primary: '#2e7d32',
    secondary: '#ed6c02',
  },
  purple: {
    primary: '#7b1fa2',
    secondary: '#0288d1',
  },
  orange: {
    primary: '#f57c00',
    secondary: '#5e35b1',
  },
  red: {
    primary: '#d32f2f',
    secondary: '#1976d2',
  },
}

// Create Material-UI theme
const createMuiTheme = (mode, colorScheme = 'blue') => {
  const colors = colorSchemes[colorScheme] || colorSchemes.blue
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: mode === 'dark' ? '#64b5f6' : '#42a5f5',
        dark: mode === 'dark' ? '#0d47a1' : '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        light: mode === 'dark' ? '#ff5983' : '#ff6090',
        dark: mode === 'dark' ? '#9a0036' : '#c51162',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#fafafa',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? '#b3b3b3' : '#666666',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.12)',
            },
          },
          contained: {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.12)',
            '&:hover': {
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  })
}

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(THEME_CONFIG.LIGHT)
  const [colorScheme, setColorScheme] = useState('blue')
  const [muiTheme, setMuiTheme] = useState(() => createMuiTheme(THEME_CONFIG.LIGHT, 'blue'))

  // Initialize theme from storage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      // Get saved theme from storage
      const savedTheme = storage.get(STORAGE_KEYS.THEME)
      const savedColorScheme = storage.get('color_scheme') || 'blue'
      
      let initialTheme = savedTheme
      
      // If no saved theme or auto mode, check system preference
      if (!savedTheme || savedTheme === THEME_CONFIG.AUTO) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          initialTheme = THEME_CONFIG.DARK
        } else {
          initialTheme = THEME_CONFIG.LIGHT
        }
      }
      
      setThemeMode(initialTheme)
      setColorScheme(savedColorScheme)
      setMuiTheme(createMuiTheme(initialTheme, savedColorScheme))
      
      // Apply to document
      document.documentElement.setAttribute('data-theme', initialTheme)
      document.documentElement.style.setProperty('--app-theme', initialTheme)
    }
    
    initializeTheme()
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const savedTheme = storage.get(STORAGE_KEYS.THEME)
    
    if (savedTheme === THEME_CONFIG.AUTO || !savedTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e) => {
        const newTheme = e.matches ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT
        setThemeMode(newTheme)
        setMuiTheme(createMuiTheme(newTheme, colorScheme))
        document.documentElement.setAttribute('data-theme', newTheme)
        document.documentElement.style.setProperty('--app-theme', newTheme)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [colorScheme])

  // Set theme function
  const setTheme = (newTheme) => {
    let actualTheme = newTheme
    
    // Handle auto theme
    if (newTheme === THEME_CONFIG.AUTO) {
      actualTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEME_CONFIG.DARK
        : THEME_CONFIG.LIGHT
    }
    
    setThemeMode(actualTheme)
    setMuiTheme(createMuiTheme(actualTheme, colorScheme))
    
    // Save to storage
    storage.set(STORAGE_KEYS.THEME, newTheme)
    
    // Apply to document
    document.documentElement.setAttribute('data-theme', actualTheme)
    document.documentElement.style.setProperty('--app-theme', actualTheme)
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: actualTheme, colorScheme } 
    }))
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = themeMode === THEME_CONFIG.LIGHT ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT
    setTheme(newTheme)
  }

  // Change color scheme
  const changeColorScheme = (scheme) => {
    if (colorSchemes[scheme]) {
      setColorScheme(scheme)
      setMuiTheme(createMuiTheme(themeMode, scheme))
      storage.set('color_scheme', scheme)
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('colorSchemeChange', { 
        detail: { theme: themeMode, colorScheme: scheme } 
      }))
    }
  }

  // Get current colors
  const getCurrentColors = () => {
    return colorSchemes[colorScheme] || colorSchemes.blue
  }

  // Check if dark mode
  const isDarkMode = themeMode === THEME_CONFIG.DARK

  // Context value
  const contextValue = {
    theme: themeMode,
    colorScheme,
    isDarkMode,
    colors: getCurrentColors(),
    muiTheme,
    availableColorSchemes: Object.keys(colorSchemes),
    setTheme,
    toggleTheme,
    changeColorScheme,
    getCurrentColors,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

// HOC for theme-aware components
export const withTheme = (WrappedComponent) => {
  return function ThemedComponent(props) {
    const themeContext = useTheme()
    
    return <WrappedComponent {...props} theme={themeContext} />
  }
}

// Custom hook for theme-aware styles
export const useThemeStyles = () => {
  const { theme, colors, isDarkMode, muiTheme } = useTheme()
  
  return {
    theme,
    colors,
    isDarkMode,
    muiTheme,
    // Common style helpers
    getContrastText: (backgroundColor) => {
      return muiTheme.palette.getContrastText(backgroundColor)
    },
    getElevation: (level) => {
      return muiTheme.shadows[level]
    },
    spacing: muiTheme.spacing,
    breakpoints: muiTheme.breakpoints,
  }
}

// Theme configuration for Chennai/India
export const indiaThemeConfig = {
  colors: {
    saffron: '#FF9933',
    white: '#FFFFFF',
    green: '#138808',
    ashokChakraBlue: '#000080',
  },
  fonts: {
    tamil: '"Noto Sans Tamil", sans-serif',
    hindi: '"Noto Sans Devanagari", sans-serif',
    english: '"Inter", "Roboto", sans-serif',
  },
  culturalColors: {
    festival: '#FFD700',
    temple: '#8B4513',
    spice: '#FF4500',
    ocean: '#006994',
  }
}

export default ThemeContext
