import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  Slide,
  Zoom,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon
} from '@mui/icons-material'

const Transition = React.forwardRef(function Transition(props, ref) {
  const { transitionType = 'fade', ...other } = props
  
  switch (transitionType) {
    case 'slide':
      return <Slide direction="up" ref={ref} {...other} />
    case 'zoom':
      return <Zoom ref={ref} {...other} />
    default:
      return <Fade ref={ref} {...other} />
  }
})

const Modal = ({
  open,
  onClose,
  onConfirm,
  title,
  children,
  type = 'default', // 'default', 'confirm', 'alert', 'success', 'error', 'warning', 'info'
  size = 'medium', // 'small', 'medium', 'large', 'fullWidth'
  showCloseButton = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  transitionType = 'fade',
  disableBackdropClick = false,
  loading = false,
  customActions,
  icon,
  subtitle,
  maxWidth = 'sm',
  fullScreen = false,
  dividers = false,
  ...props
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case 'success':
        return <SuccessIcon sx={{ color: 'success.main', fontSize: 48 }} />
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 48 }} />
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 48 }} />
      case 'info':
        return <InfoIcon sx={{ color: 'info.main', fontSize: 48 }} />
      default:
        return null
    }
  }

  const getMaxWidth = () => {
    switch (size) {
      case 'small': return 'xs'
      case 'large': return 'lg'
      case 'fullWidth': return 'xl'
      default: return maxWidth
    }
  }

  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return
    }
    onClose?.(event, reason)
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  const renderActions = () => {
    if (customActions) {
      return customActions
    }

    if (type === 'alert' || type === 'success' || type === 'error' || type === 'info') {
      return (
        <Button 
          onClick={onClose} 
          color={confirmColor}
          variant="contained"
          disabled={loading}
        >
          OK
        </Button>
      )
    }

    if (type === 'confirm') {
      return (
        <>
          <Button 
            onClick={onClose} 
            color="inherit"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm} 
            color={confirmColor}
            variant="contained"
            disabled={loading}
            autoFocus
          >
            {confirmText}
          </Button>
        </>
      )
    }

    return null
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={(props) => (
        <Transition {...props} transitionType={transitionType} />
      )}
      maxWidth={getMaxWidth()}
      fullWidth
      fullScreen={fullScreen || isMobile}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      {...props}
    >
      {/* Header */}
      <DialogTitle
        id="modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: dividers ? 2 : 1,
          ...(type !== 'default' && {
            textAlign: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          })
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          {getIcon() && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getIcon()}
            </Box>
          )}
          
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  ...(type !== 'default' && { textAlign: 'center' })
                }}
              >
                {title}
              </Typography>
            )}
            
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      {/* Content */}
      {children && (
        <DialogContent 
          dividers={dividers}
          id="modal-description"
          sx={{
            ...(type !== 'default' && { textAlign: 'center' })
          }}
        >
          {children}
        </DialogContent>
      )}

      {/* Actions */}
      {renderActions() && (
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1,
            ...(type !== 'default' && { justifyContent: 'center' })
          }}
        >
          {renderActions()}
        </DialogActions>
      )}
    </Dialog>
  )
}

// Specialized Modal Components
export const ConfirmModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  danger = false,
  ...props 
}) => (
  <Modal
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title={title}
    type="confirm"
    confirmText={confirmText}
    cancelText={cancelText}
    confirmColor={danger ? 'error' : confirmColor}
    icon={danger ? <WarningIcon sx={{ color: 'error.main', fontSize: 48 }} /> : undefined}
    {...props}
  >
    {message && (
      <Typography variant="body1">
        {message}
      </Typography>
    )}
  </Modal>
)

export const AlertModal = ({ 
  open, 
  onClose, 
  title,
  message,
  type = 'info',
  ...props 
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    type={type}
    {...props}
  >
    {message && (
      <Typography variant="body1">
        {message}
      </Typography>
    )}
  </Modal>
)

export const LoadingModal = ({ 
  open, 
  message = 'Processing...',
  title = 'Please Wait',
  ...props 
}) => (
  <Modal
    open={open}
    title={title}
    showCloseButton={false}
    disableBackdropClick
    size="small"
    {...props}
  >
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      py: 2 
    }}>
      <Box sx={{ mb: 2 }}>
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </Box>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  </Modal>
)

export default Modal
