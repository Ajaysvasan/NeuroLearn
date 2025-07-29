// Dashboard functionality
class TeacherDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.students = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@email.com',
                subjects: ['Mathematics', 'Physics'],
                assessments: 12,
                averageScore: 85,
                lastActivity: '2 hours ago'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@email.com',
                subjects: ['Chemistry', 'Biology'],
                assessments: 8,
                averageScore: 92,
                lastActivity: '1 day ago'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@email.com',
                subjects: ['Mathematics', 'Chemistry'],
                assessments: 15,
                averageScore: 78,
                lastActivity: '3 hours ago'
            },
            {
                id: 4,
                name: 'Sarah Wilson',
                email: 'sarah.wilson@email.com',
                subjects: ['Physics', 'Biology'],
                assessments: 10,
                averageScore: 88,
                lastActivity: '5 hours ago'
            }
        ];
        
        this.questions = [
            {
                id: 1,
                subject: 'mathematics',
                difficulty: 'medium',
                question: 'What is the derivative of x²?',
                type: 'multiple-choice',
                options: ['2x', 'x²', 'x', '2'],
                correctAnswer: '2x'
            },
            {
                id: 2,
                subject: 'physics',
                difficulty: 'hard',
                question: 'Calculate the force required to accelerate a 10kg object at 5m/s²',
                type: 'numerical',
                correctAnswer: '50N'
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderStudentsTable();
        this.renderQuestions();
        this.setupModals();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Search and filters
        document.getElementById('searchStudent')?.addEventListener('input', (e) => {
            this.filterStudents();
        });

        document.getElementById('subjectFilter')?.addEventListener('change', (e) => {
            this.filterStudents();
        });

        document.getElementById('performanceFilter')?.addEventListener('change', (e) => {
            this.filterStudents();
        });

        // Question filters
        document.getElementById('questionSubject')?.addEventListener('change', (e) => {
            this.filterQuestions();
        });

        document.getElementById('questionDifficulty')?.addEventListener('change', (e) => {
            this.filterQuestions();
        });

        // Buttons
        document.getElementById('uploadSyllabusBtn')?.addEventListener('click', () => {
            this.openUploadModal();
        });

        document.getElementById('addQuestionBtn')?.addEventListener('click', () => {
            this.addQuestion();
        });

        document.getElementById('generateQuestionsBtn')?.addEventListener('click', () => {
            this.generateQuestionsAI();
        });

        document.getElementById('createAssessmentBtn')?.addEventListener('click', () => {
            this.createAssessment();
        });

        // Logout
        document.querySelector('.logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        // Update page title
        const titles = {
            overview: 'Dashboard Overview',
            students: 'Student Management',
            syllabus: 'Syllabus Management',
            questions: 'Question Management',
            assessments: 'Assessment Management',
            analytics: 'Performance Analytics'
        };
        document.getElementById('page-title').textContent = titles[section];

        this.currentSection = section;
    }

    renderStudentsTable() {
        const tbody = document.getElementById('studentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.students.map(student => `
            <tr data-student-id="${student.id}">
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.subjects.join(', ')}</td>
                <td>${student.assessments}</td>
                <td>${student.averageScore}%</td>
                <td>${student.lastActivity}</td>
                <td>
                    <button class="btn-secondary" onclick="dashboard.viewStudent(${student.id})">View</button>
                    <button class="btn-primary" onclick="dashboard.editStudent(${student.id})">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    filterStudents() {
        const searchTerm = document.getElementById('searchStudent')?.value.toLowerCase() || '';
        const subjectFilter = document.getElementById('subjectFilter')?.value || '';
        const performanceFilter = document.getElementById('performanceFilter')?.value || '';

        const filteredStudents = this.students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                                student.email.toLowerCase().includes(searchTerm);
            
            const matchesSubject = !subjectFilter || 
                                 student.subjects.some(subject => 
                                     subject.toLowerCase().includes(subjectFilter.toLowerCase()));
            
            const matchesPerformance = !performanceFilter || this.checkPerformance(student.averageScore, performanceFilter);

            return matchesSearch && matchesSubject && matchesPerformance;
        });

        this.renderFilteredStudents(filteredStudents);
    }

    checkPerformance(score, filter) {
        switch(filter) {
            case 'excellent': return score >= 90;
            case 'good': return score >= 75 && score < 90;
            case 'average': return score >= 60 && score < 75;
            case 'poor': return score < 60;
            default: return true;
        }
    }

    renderFilteredStudents(students) {
        const tbody = document.getElementById('studentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = students.map(student => `
            <tr data-student-id="${student.id}">
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.subjects.join(', ')}</td>
                <td>${student.assessments}</td>
                <td>${student.averageScore}%</td>
                <td>${student.lastActivity}</td>
                <td>
                    <button class="btn-secondary" onclick="dashboard.viewStudent(${student.id})">View</button>
                    <button class="btn-primary" onclick="dashboard.editStudent(${student.id})">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    renderQuestions() {
        const container = document.getElementById('questionsList');
        if (!container) return;

        container.innerHTML = this.questions.map(question => `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <span class="subject-tag">${question.subject}</span>
                    <span class="difficulty-tag ${question.difficulty}">${question.difficulty}</span>
                </div>
                <div class="question-content">
                    <p><strong>Q:</strong> ${question.question}</p>
                    ${question.options ? `
                        <div class="options">
                            ${question.options.map(option => `<span class="option">${option}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="question-actions">
                    <button class="btn-secondary" onclick="dashboard.editQuestion(${question.id})">Edit</button>
                    <button class="btn-danger" onclick="dashboard.deleteQuestion(${question.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    filterQuestions() {
        const subjectFilter = document.getElementById('questionSubject')?.value || '';
        const difficultyFilter = document.getElementById('questionDifficulty')?.value || '';

        const filteredQuestions = this.questions.filter(question => {
            const matchesSubject = !subjectFilter || question.subject === subjectFilter;
            const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;
            
            return matchesSubject && matchesDifficulty;
        });

        this.renderFilteredQuestions(filteredQuestions);
    }

    renderFilteredQuestions(questions) {
        const container = document.getElementById('questionsList');
        if (!container) return;

        container.innerHTML = questions.map(question => `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <span class="subject-tag">${question.subject}</span>
                    <span class="difficulty-tag ${question.difficulty}">${question.difficulty}</span>
                </div>
                <div class="question-content">
                    <p><strong>Q:</strong> ${question.question}</p>
                    ${question.options ? `
                        <div class="options">
                            ${question.options.map(option => `<span class="option">${option}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="question-actions">
                    <button class="btn-secondary" onclick="dashboard.editQuestion(${question.id})">Edit</button>
                    <button class="btn-danger" onclick="dashboard.deleteQuestion(${question.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    setupModals() {
        // Upload modal
        const uploadModal = document.getElementById('uploadModal');
        const closeBtn = uploadModal?.querySelector('.close');
        const cancelBtn = document.getElementById('cancelUpload');

        closeBtn?.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });

        cancelBtn?.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                uploadModal.style.display = 'none';
            }
        });

        // Form submission
        document.getElementById('syllabusForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadSyllabus();
        });
    }

    openUploadModal() {
        document.getElementById('uploadModal').style.display = 'block';
    }

    uploadSyllabus() {
        const formData = new FormData();
        const subject = document.getElementById('subject').value;
        const file = document.getElementById('syllabusFile').files[0];
        const description = document.getElementById('description').value;

        formData.append('subject', subject);
        formData.append('file', file);
        formData.append('description', description);

        // Simulate upload
        this.showNotification('Syllabus uploaded successfully!', 'success');
        document.getElementById('uploadModal').style.display = 'none';
        document.getElementById('syllabusForm').reset();
    }

    addQuestion() {
        // Open add question modal (implement similar to upload modal)
        this.showNotification('Add Question feature coming soon!', 'info');
    }

    generateQuestionsAI() {
        this.showNotification('Generating questions with AI...', 'info');
        
        // Simulate AI generation
        setTimeout(() => {
            this.showNotification('AI has generated 10 new questions!', 'success');
        }, 2000);
    }

    createAssessment() {
        this.showNotification('Create Assessment feature coming soon!', 'info');
    }

    viewStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        this.showNotification(`Viewing details for ${student.name}`, 'info');
    }

    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        this.showNotification(`Editing ${student.name}`, 'info');
    }

    editQuestion(questionId) {
        this.showNotification('Edit Question feature coming soon!', 'info');
    }

    deleteQuestion(questionId) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.renderQuestions();
            this.showNotification('Question deleted successfully!', 'success');
        }
    }


    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Redirect to login page
            window.location.href = '/login.html';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Manual close
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new TeacherDashboard();
});

// Additional CSS for notifications
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 3000;
    min-width: 300px;
    border-left: 4px solid;
    animation: slideIn 0.3s ease;
}

.notification.success {
    border-left-color: #22c55e;
    color: #15803d;
}

.notification.error {
    border-left-color: #ef4444;
    color: #dc2626;
}

.notification.info {
    border-left-color: #3b82f6;
    color: #1d4ed8;
}

.close-notification {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    margin-left: auto;
    color: #6b7280;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.subject-tag, .difficulty-tag {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.subject-tag {
    background: #e0e7ff;
    color: #3730a3;
}

.difficulty-tag.easy {
    background: #dcfce7;
    color: #166534;
}

.difficulty-tag.medium {
    background: #fef3c7;
    color: #92400e;
}

.difficulty-tag.hard {
    background: #fee2e2;
    color: #991b1b;
}

.question-header {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.options {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.option {
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.question-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}

.btn-danger {
    background: #ef4444;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.btn-danger:hover {
    background: #dc2626;
}
`;

// Add notification styles to head
const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);
