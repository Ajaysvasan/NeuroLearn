import React from 'react'
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton,
  Divider
} from '@mui/material'
import { 
  Email, 
  Phone, 
  LocationOn,
  GitHub,
  LinkedIn,
  Twitter,
  Facebook
} from '@mui/icons-material'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    quickLinks: [
      { label: 'About Us', href: '/about' },
      { label: 'Features', href: '/features' },
      { label: 'Help & Support', href: '/help' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' }
    ],
    forTeachers: [
      { label: 'Teacher Guide', href: '/teacher/guide' },
      { label: 'Best Practices', href: '/teacher/best-practices' },
      { label: 'Training Resources', href: '/teacher/training' },
      { label: 'AI Tools Guide', href: '/teacher/ai-guide' },
      { label: 'Support Forum', href: '/teacher/forum' }
    ],
    forStudents: [
      { label: 'Student Guide', href: '/student/guide' },
      { label: 'Study Tips', href: '/student/tips' },
      { label: 'FAQ', href: '/student/faq' },
      { label: 'Technical Help', href: '/student/tech-help' },
      { label: 'Feedback', href: '/student/feedback' }
    ]
  }

  const socialLinks = [
    { icon: <GitHub />, href: 'https://github.com/yourproject', label: 'GitHub' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/yourproject', label: 'LinkedIn' },
    { icon: <Twitter />, href: 'https://twitter.com/yourproject', label: 'Twitter' },
    { icon: <Facebook />, href: 'https://facebook.com/yourproject', label: 'Facebook' }
  ]

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        mt: 'auto',
        py: 6
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                🎓 Assessment System
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
                Intelligent assessment and feedback platform revolutionizing education 
                through AI-powered question generation and adaptive learning.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    Chennai, Tamil Nadu, India
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    support@assessmentsystem.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    +91-44-1234-5678
                  </Typography>
                </Box>
              </Box>

              {/* Social Links */}
              <Box>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { color: 'white' }
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Quick Links
            </Typography>
            <Box>
              {footerLinks.quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  color="inherit"
                  underline="hover"
                  sx={{ 
                    display: 'block',
                    mb: 1,
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* For Teachers */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              For Teachers
            </Typography>
            <Box>
              {footerLinks.forTeachers.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  color="inherit"
                  underline="hover"
                  sx={{ 
                    display: 'block',
                    mb: 1,
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* For Students */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              For Students
            </Typography>
            <Box>
              {footerLinks.forStudents.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  color="inherit"
                  underline="hover"
                  sx={{ 
                    display: 'block',
                    mb: 1,
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © {currentYear} Intelligent Assessment System. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link 
              href="/privacy" 
              color="inherit" 
              underline="hover"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { color: 'white' }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              color="inherit" 
              underline="hover"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { color: 'white' }
              }}
            >
              Terms of Service
            </Link>
            <Link 
              href="/cookies" 
              color="inherit" 
              underline="hover"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { color: 'white' }
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>

        {/* Made in India Badge */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            🇮🇳 Proudly made in Chennai, India
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
