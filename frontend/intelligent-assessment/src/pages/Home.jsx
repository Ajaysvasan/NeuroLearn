import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  Divider
} from '@mui/material'
import {
  School,
  Psychology,
  Analytics,
  EmojiEvents,
  Speed,
  Security,
  CloudUpload,
  Quiz,
  TrendingUp,
  People,
  Star,
  PlayArrow,
  ArrowForward,
  CheckCircle,
  AutoAwesome,
  Smartphone,
  Computer,
  AccessTime,
  Language,
  Menu,
  Close
} from '@mui/icons-material'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

import { useAuth } from '@context/AuthContext'
import { toast } from 'react-toastify'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    // Auto-scroll testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Question Generation',
      description: 'Advanced AI creates personalized questions based on your syllabus and learning patterns.',
      color: 'primary.main'
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Real-time Analytics',
      description: 'Comprehensive performance tracking with detailed insights and progress monitoring.',
      color: 'success.main'
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Instant Feedback',
      description: 'Get immediate results with AI-powered explanations and personalized recommendations.',
      color: 'warning.main'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime for uninterrupted learning experience.',
      color: 'info.main'
    },
    {
      icon: <CloudUpload sx={{ fontSize: 40 }} />,
      title: 'Easy Syllabus Upload',
      description: 'Simply upload your syllabus and let AI generate comprehensive question banks.',
      color: 'secondary.main'
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      title: 'Gamified Learning',
      description: 'Achievements, leaderboards, and rewards to make learning engaging and fun.',
      color: 'error.main'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Active Students', icon: <People /> },
    { number: '500+', label: 'Teachers', icon: <School /> },
    { number: '50,000+', label: 'Questions Generated', icon: <Quiz /> },
    { number: '95%', label: 'Student Satisfaction', icon: <Star /> }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Grade 12 Student',
      location: 'Chennai, Tamil Nadu',
      image: '/images/testimonials/student1.jpg',
      quote: 'This platform transformed my exam preparation. The AI-generated questions helped me identify my weak areas and improve significantly.',
      rating: 5
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Mathematics Teacher',
      location: 'Anna Nagar, Chennai',
      image: '/images/testimonials/teacher1.jpg',
      quote: 'Creating personalized assessments has never been easier. The AI understands my syllabus perfectly and generates relevant questions.',
      rating: 5
    },
    {
      name: 'Ananya Reddy',
      role: 'Grade 11 Student',
      location: 'T. Nagar, Chennai',
      image: '/images/testimonials/student2.jpg',
      quote: 'The instant feedback and detailed analytics helped me improve my scores by 30%. Highly recommend this platform!',
      rating: 5
    },
    {
      name: 'Prof. Meera Iyer',
      role: 'Physics Teacher',
      location: 'Adyar, Chennai',
      image: '/images/testimonials/teacher2.jpg',
      quote: 'The platform saves me hours of question preparation. The quality of AI-generated questions is exceptional.',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Student Basic',
      price: '₹99',
      period: '/month',
      features: [
        'Access to AI-generated quizzes',
        'Basic performance analytics',
        'Mobile app access',
        'Email support'
      ],
      popular: false,
      color: 'info'
    },
    {
      name: 'Student Premium',
      price: '₹199',
      period: '/month',
      features: [
        'Everything in Basic',
        'Unlimited quiz attempts',
        'Advanced analytics',
        'Personalized study plans',
        'Priority support'
      ],
      popular: true,
      color: 'primary'
    },
    {
      name: 'Teacher Pro',
      price: '₹499',
      period: '/month',
      features: [
        'Unlimited question generation',
        'Class management tools',
        'Detailed student analytics',
        'Custom syllabus upload',
        '24/7 phone support'
      ],
      popular: false,
      color: 'secondary'
    }
  ]

  const handleGetStarted = () => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (user.role === 'student') {
        navigate('/student/dashboard')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/register')
    }
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              IntelliAssess
            </Typography>
          </Box>

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Button 
                color="inherit" 
                onClick={() => scrollToSection('features')}
                sx={{ color: 'text.primary' }}
              >
                Features
              </Button>
              <Button 
                color="inherit" 
                onClick={() => scrollToSection('pricing')}
                sx={{ color: 'text.primary' }}
              >
                Pricing
              </Button>
              <Button 
                color="inherit" 
                onClick={() => scrollToSection('testimonials')}
                sx={{ color: 'text.primary' }}
              >
                Reviews
              </Button>
              {!user ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleLogin}
                    size="small"
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleGetStarted}
                    size="small"
                  >
                    Get Started
                  </Button>
                </Box>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleGetStarted}
                  size="small"
                >
                  Dashboard
                </Button>
              )}
            </Box>
          ) : (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ color: 'text.primary' }}
            >
              {mobileMenuOpen ? <Close /> : <Menu />}
            </IconButton>
          )}
        </Toolbar>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <Box sx={{ bgcolor: 'white', p: 2, boxShadow: 3 }}>
            <Button 
              fullWidth 
              onClick={() => scrollToSection('features')}
              sx={{ mb: 1, color: 'text.primary', justifyContent: 'flex-start' }}
            >
              Features
            </Button>
            <Button 
              fullWidth 
              onClick={() => scrollToSection('pricing')}
              sx={{ mb: 1, color: 'text.primary', justifyContent: 'flex-start' }}
            >
              Pricing
            </Button>
            <Button 
              fullWidth 
              onClick={() => scrollToSection('testimonials')}
              sx={{ mb: 2, color: 'text.primary', justifyContent: 'flex-start' }}
            >
              Reviews
            </Button>
            {!user ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" onClick={handleLogin} fullWidth>
                  Login
                </Button>
                <Button variant="contained" onClick={handleGetStarted} fullWidth>
                  Get Started
                </Button>
              </Box>
            ) : (
              <Button variant="contained" onClick={handleGetStarted} fullWidth>
                Dashboard
              </Button>
            )}
          </Box>
        )}
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: 12,
          pb: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                    Intelligent Assessment
                    <br />
                    <span style={{ color: '#FFD700' }}>Made Simple</span>
                  </Typography>
                  <Typography variant="h5" gutterBottom sx={{ opacity: 0.9, mb: 3 }}>
                    AI-powered question generation and personalized learning for students and teachers in Chennai
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8, mb: 4, maxWidth: 500 }}>
                    Transform your education experience with our cutting-edge platform that creates personalized assessments, 
                    provides instant feedback, and tracks progress in real-time.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGetStarted}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'grey.100' },
                        px: 4,
                        py: 1.5
                      }}
                      startIcon={<PlayArrow />}
                    >
                      {user ? 'Go to Dashboard' : 'Start Free Trial'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => scrollToSection('features')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        px: 4,
                        py: 1.5
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>

                  {/* Quick Stats */}
                  <Box sx={{ mt: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">10K+</Typography>
                      <Typography variant="caption">Active Users</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">50K+</Typography>
                      <Typography variant="caption">Questions Generated</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">95%</Typography>
                      <Typography variant="caption">Satisfaction Rate</Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              <Slide direction="left" in timeout={1200}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    component="img"
                    src="/images/hero-illustration.svg"
                    alt="AI Learning Platform"
                    sx={{
                      width: '100%',
                      maxWidth: 500,
                      height: 'auto',
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))'
                    }}
                  />
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Powerful Features for Modern Education
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to create, manage, and analyze assessments with the power of artificial intelligence
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Zoom in timeout={500 + index * 100}>
                  <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: feature.color,
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box sx={{ py: 6, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index} sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="body1">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get started in just 3 simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                1
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Upload Your Syllabus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simply upload your course syllabus or curriculum. Our AI will analyze and understand the content structure.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                2
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                AI Generates Questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our advanced AI creates personalized questions based on your syllabus, difficulty preferences, and learning objectives.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'success.main',
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                3
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Track & Improve
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get instant feedback, detailed analytics, and personalized recommendations to improve learning outcomes.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box id="testimonials" sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Trusted by thousands of students and teachers across Chennai
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body1" gutterBottom sx={{ fontStyle: 'italic' }}>
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                      <Avatar 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.location}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Choose the plan that works best for you
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? 3 : 1,
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.3s'
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {plan.name}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h3" component="span" fontWeight="bold" color={`${plan.color}.main`}>
                        {plan.price}
                      </Typography>
                      <Typography variant="h6" component="span" color="text.secondary">
                        {plan.period}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'left', mb: 3 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      color={plan.color}
                      fullWidth
                      size="large"
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Ready to Transform Your Learning?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Join thousands of students and teachers already using our AI-powered platform
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                px: 4,
                py: 1.5
              }}
              startIcon={<ArrowForward />}
            >
              Start Your Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                px: 4,
                py: 1.5
              }}
            >
              Contact Sales
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  IntelliAssess
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Revolutionizing education with AI-powered assessments. 
                Proudly serving students and teachers across Chennai and Tamil Nadu.
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                🇮🇳 Made with ❤️ in Chennai, India
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Features
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Pricing
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Security
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Updates
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Help Center
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Contact Us
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Documentation
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Status
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  About Us
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Careers
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Blog
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Press
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Privacy Policy
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Terms of Service
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  Cookie Policy
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
                  GDPR
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, bgcolor: 'grey.600' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2024 IntelliAssess. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Version 2.0.1
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                🌐 Available in English & Tamil
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
