import React from 'react'
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Backdrop,
  Paper,
  Skeleton
} from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'

// Custom animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`

const StyledSpinner = styled(Box)(({ theme, variant }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  ...(variant === 'pulse' && {
    animation: `${pulse} 2s ease-in-out infinite`,
  }),
}))

const BouncingDots = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  '& > div': {
    width: 12,
    height: 12,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    animation: `${bounce} 1.4s ease-in-out infinite both`,
    '&:nth-of-type(1)': { animationDelay: '-0.32s' },
    '&:nth-of-type(2)': { animationDelay: '-0.16s' },
    '&:nth-of-type(3)': { animationDelay: '0s' },
  },
}))

const CustomSpinner = styled(Box)(({ theme, size }) => ({
  width: size === 'small' ? 24 : size === 'large' ? 64 : 40,
  height: size === 'small' ? 24 : size === 'large' ? 64 : 40,
  border: `3px solid ${theme.palette.action.hover}`,
  borderTop: `3px solid ${theme.palette.primary.main}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}))

const LoadingSpinner = ({
  size = 'medium', // 'small', 'medium', 'large'
  text = 'Loading...',
  subText = '',
  overlay = false,
  variant = 'circular', // 'circular', 'custom', 'dots', 'pulse', 'skeleton'
  color = 'primary',
  fullScreen = false,
  backgroundColor = 'rgba(255, 255, 255, 0.8)'
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 24
      case 'large': return 64
      default: return 40
    }
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'custom':
        return <CustomSpinner size={size} />
      
      case 'dots':
        return (
          <BouncingDots>
            <div />
            <div />
            <div />
          </BouncingDots>
        )
      
      case 'skeleton':
        return (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        )
      
      case 'pulse':
        return (
          <StyledSpinner variant="pulse">
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}
            >
              🎓
            </Box>
          </StyledSpinner>
        )
      
      default:
        return (
          <CircularProgress
            size={getSizeValue()}
            color={color}
            thickness={4}
          />
        )
    }
  }

  const LoadingContent = () => (
    <StyledSpinner
      sx={{
        minHeight: variant === 'skeleton' ? 'auto' : 120,
        textAlign: 'center',
        p: 3
      }}
    >
      {variant !== 'skeleton' && renderSpinner()}
      
      {text && variant !== 'skeleton' && (
        <Typography
          variant={size === 'small' ? 'body2' : 'body1'}
          color="text.secondary"
          sx={{ mt: 2, fontWeight: 500 }}
        >
          {text}
        </Typography>
      )}
      
      {subText && variant !== 'skeleton' && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 0.5 }}
        >
          {subText}
        </Typography>
      )}
      
      {variant === 'skeleton' && (
        <Box sx={{ mt: 2 }}>
          {renderSpinner()}
        </Box>
      )}
    </StyledSpinner>
  )

  if (fullScreen) {
    return (
      <Backdrop
        open={true}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.modal + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            minWidth: 280
          }}
        >
          <LoadingContent />
        </Paper>
      </Backdrop>
    )
  }

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: backgroundColor,
          zIndex: (theme) => theme.zIndex.modal,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={4}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            minWidth: 240
          }}
        >
          <LoadingContent />
        </Paper>
      </Box>
    )
  }

  return <LoadingContent />
}

// Specialized loading components
export const PageLoader = ({ text = 'Loading page...' }) => (
  <LoadingSpinner
    size="large"
    text={text}
    variant="pulse"
    overlay
    fullScreen
  />
)

export const ButtonLoader = ({ size = 'small' }) => (
  <CircularProgress
    size={size === 'small' ? 16 : 20}
    color="inherit"
    thickness={4}
  />
)

export const CardLoader = () => (
  <LoadingSpinner
    variant="skeleton"
    text=""
  />
)

export const InlineLoader = ({ text = 'Loading...' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
    <CircularProgress size={16} thickness={4} />
    <Typography variant="caption" color="text.secondary">
      {text}
    </Typography>
  </Box>
)

export default LoadingSpinner
