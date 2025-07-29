import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  Description,
  CheckCircle,
  Error,
  Info,
  School,
  AutoAwesome
} from '@mui/icons-material'

import { teacherService } from '@services/teacher.service'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { useAuth } from '@context/AuthContext'
import { toast } from 'react-toastify'

const SyllabusUpload = ({ onUploadSuccess }) => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [parseProgress, setParseProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [syllabusData, setSyllabusData] = useState(null)

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError('')
    setSuccess('')
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => 
        `${file.file.name}: ${file.errors.map(e => e.message).join(', ')}`
      )
      setError(`Some files were rejected: ${errors.join('; ')}`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      acceptedFiles.forEach((file, index) => {
        formData.append(`syllabus`, file)
        formData.append(`metadata`, JSON.stringify({
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedBy: user.id
        }))
      })

      const response = await teacherService.uploadSyllabus(formData)
      
      if (response.success) {
        const newFiles = response.files.map(file => ({
          ...file,
          status: 'uploaded',
          progress: 100
        }))
        
        setUploadedFiles(prev => [...prev, ...newFiles])
        setSuccess(`${acceptedFiles.length} file(s) uploaded successfully!`)
        
        // Auto-parse after upload
        setParsing(true)
        setParseProgress(0)
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setParseProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 500)

        const parseResponse = await teacherService.parseSyllabus(response.files[0].id)
        
        clearInterval(progressInterval)
        setParseProgress(100)
        
        if (parseResponse.success) {
          setSyllabusData(parseResponse.data)
          setSuccess('Syllabus uploaded and parsed successfully! AI is ready to generate questions.')
          toast.success('Syllabus processing complete!')
          onUploadSuccess && onUploadSuccess(parseResponse.data)
          
          // Update file status
          setUploadedFiles(prev => 
            prev.map(file => ({
              ...file,
              status: 'parsed',
              parsedData: parseResponse.data
            }))
          )
        } else {
          throw new Error('Failed to parse syllabus content')
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.')
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      setParsing(false)
      setParseProgress(0)
    }
  }, [onUploadSuccess, user.id])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: true,
    maxFiles: 5
  })

  const removeFile = async (fileId, index) => {
    try {
      // If file has been uploaded to server, delete it
      if (uploadedFiles[index].id) {
        await teacherService.deleteSyllabus(uploadedFiles[index].id)
      }
      
      setUploadedFiles(prev => prev.filter((_, i) => i !== index))
      toast.success('File removed successfully')
    } catch (err) {
      toast.error('Failed to remove file')
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('doc')) return '📝'
    if (fileType?.includes('text')) return '📋'
    return '📁'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <School color="primary" />
        Upload Syllabus
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload your course syllabus files and let our AI generate intelligent questions automatically.
      </Typography>

      {/* Upload Zone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : isDragReject ? 'error.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : isDragReject ? 'error.50' : 'grey.50',
          cursor: uploading || parsing ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: uploading || parsing ? 'grey.300' : 'primary.main',
            backgroundColor: uploading || parsing ? 'grey.50' : 'primary.50',
          }
        }}
      >
        <input {...getInputProps()} disabled={uploading || parsing} />
        
        <Box sx={{ textAlign: 'center' }}>
          {uploading ? (
            <LoadingSpinner text="Uploading files..." />
          ) : parsing ? (
            <Box>
              <AutoAwesome sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                AI is parsing your syllabus...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseProgress} 
                sx={{ mt: 2, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {parseProgress}% complete
              </Typography>
            </Box>
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive 
                  ? "Drop the files here..." 
                  : "Drag & drop syllabus files here, or click to select"
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Supported formats: PDF, DOC, DOCX, TXT, RTF
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum 5 files, 25MB each
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          <Typography variant="body2">{success}</Typography>
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description />
              Uploaded Files ({uploadedFiles.length})
            </Typography>
          </Box>
          
          <List>
            {uploadedFiles.map((file, index) => (
              <ListItem key={index} divider={index < uploadedFiles.length - 1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    {getFileIcon(file.type)}
                  </Typography>
                  
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={file.name || file.originalName}
                      secondary={`${formatFileSize(file.size)} • Uploaded ${new Date(file.uploadedAt).toLocaleString()}`}
                    />
                  </Box>

                  <Chip
                    label={file.status === 'parsed' ? 'Processed' : 'Uploaded'}
                    color={file.status === 'parsed' ? 'success' : 'primary'}
                    size="small"
                    icon={file.status === 'parsed' ? <CheckCircle /> : <Info />}
                  />
                </Box>

                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeFile(file.id, index)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Parsed Content Preview */}
      {syllabusData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="primary" />
              AI Analysis Results
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.main">
                    {syllabusData.chapters?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chapters Detected
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.main">
                    {syllabusData.topics?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Topics Identified
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="warning.main">
                    {syllabusData.suggestedQuestions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questions Ready
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {syllabusData.chapters && syllabusData.chapters.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Detected Chapters:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {syllabusData.chapters.slice(0, 10).map((chapter, index) => (
                    <Chip
                      key={index}
                      label={chapter}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                  {syllabusData.chapters.length > 10 && (
                    <Chip
                      label={`+${syllabusData.chapters.length - 10} more`}
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips and Guidelines */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            Tips for Better Question Generation
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                📝 Content Structure:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Include clear chapter and topic headings</li>
                <li>Provide learning objectives for each section</li>
                <li>Add key concepts and definitions</li>
                <li>Include examples and case studies</li>
              </ul>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                🎯 Quality Guidelines:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Use consistent formatting throughout</li>
                <li>Mention difficulty levels where applicable</li>
                <li>Include prerequisite knowledge</li>
                <li>Add assessment criteria if available</li>
              </ul>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              <strong>Pro Tip:</strong> The more structured and detailed your syllabus, 
              the better our AI can generate relevant and targeted questions for your students.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SyllabusUpload
