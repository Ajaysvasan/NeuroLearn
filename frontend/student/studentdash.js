// Student Dashboard functionality
class StudentDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.quizAnswers = {};
        this.quizTimer = null;
        
        this.availableQuizzes = [
            {
                id: 'calc-001',
                title: 'Calculus Practice',
                subject: 'mathematics',
                difficulty: 'medium',
                questions: 15,
                timeLimit: 20,
                description: 'Derivatives and Integration'
            },
            {
                id: 'phys-001',
                title: 'Mechanics Fundamentals',
                subject: 'physics',
                difficulty: 'medium',
                questions: 12,
                timeLimit: 15,
                description: 'Force and Motion'
            },
            {
                id: 'chem-001',
                title: 'Organic Chemistry Basics',
                subject: 'chemistry',
                difficulty: 'easy',
                questions: 10,
                timeLimit: 12,
                description: 'Hydrocarbons and Functional Groups'
            },
            {
                id: 'bio-001',
                title: 'Cell Biology',
                subject: 'biology',
                difficulty: 'hard',
                questions: 20,
                timeLimit: 25,
                description: 'Cell Structure and Function'
            }
        ];

        this.sampleQuestions = [
            {
                question: "What is the derivative of x²?",
                options: ["2x", "x²", "x", "2"],
                correct: 0
            },
            {
                question: "What is the integral of 2x?",
                options: ["x²", "x² + C", "2x²", "2x + C"],
                correct: 1
            }
        ];

        this.performanceData = [
            {
                quiz: 'Mathematics Quiz 1',
                subject: 'Mathematics',
                date: '2025-07-25',
                score: 92,
                timeTaken: '18 mins',
                difficulty: 'Medium'
            },
            {
                quiz: 'Physics Quiz 2',
                subject: 'Physics',
                date: '2025-07-24',
                score: 87,
                timeTaken: '14 mins',
                difficulty: 'Medium'
            },
            {
                quiz: 'Chemistry Quiz 1',
                subject: 'Chemistry',
                date: '2025-07-23',
                score: 79,
                timeTaken: '16 mins',
                difficulty: 'Easy'
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderQuizzes();
        this.renderPerformanceTable();
        this.updateDashboardStats();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Quiz filters
        document.getElementById('subjectFilterQuiz')?.addEventListener('change', () => {
            this.filterQuizzes();
        });

        document.getElementById('difficultyFilterQuiz')?.addEventListener('change', () => {
            this.filterQuizzes();
        });

        // Start quiz buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-quiz-btn')) {
                const quizId = e.target.dataset.quizId;
                this.startQuiz(quizId);
            }
        });

        // Quiz modal controls
        document.getElementById('nextQuestion')?.addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('prevQuestion')?.addEventListener('click', () => {
            this.prevQuestion();
        });

        document.getElementById('submitQuiz')?.addEventListener('click', () => {
            this.submitQuiz();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('quizModal');
            if (e.target === modal) {
                this.closeQuizModal();
            }
        });

        // Logout
        document.querySelector('.logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // Settings toggles
        document.querySelectorAll('.switch input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.updateSetting(e.target.closest('.setting-item').querySelector('label').textContent, e.target.checked);
            });
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
            dashboard: 'My Dashboard',
            quizzes: 'Available Quizzes',
            performance: 'My Performance',
            feedback: 'AI Feedback & Recommendations',
            achievements: 'My Achievements',
            profile: 'My Profile'
        };
        document.getElementById('page-title').textContent = titles[section];

        this.currentSection = section;
    }

    renderQuizzes() {
        const container = document.getElementById('quizzesGrid');
        if (!container) return;

        container.innerHTML = this.availableQuizzes.map(quiz => `
            <div class="quiz-card" data-subject="${quiz.subject}" data-difficulty="${quiz.difficulty}">
                <div class="quiz-header">
                    <div class="subject-icon ${quiz.subject}">
                        <i class="fas fa-${this.getSubjectIcon(quiz.subject)}"></i>
                    </div>
                    <div class="quiz-info">
                        <h4>${quiz.title}</h4>
                        <p>${quiz.description}</p>
                    </div>
                </div>
                <div class="quiz-meta">
                    <span class="difficulty ${quiz.difficulty}">${quiz.difficulty}</span>
                    <span class="questions">${quiz.questions} Questions</span>
                    <span class="time">${quiz.timeLimit} mins</span>
                </div>
                <button class="start-quiz-btn" data-quiz-id="${quiz.id}">Start Quiz</button>
            </div>
        `).join('');
    }

    getSubjectIcon(subject) {
        const icons = {
            mathematics: 'calculator',
            physics: 'atom',
            chemistry: 'flask',
            biology: 'dna'
        };
        return icons[subject] || 'book';
    }

    filterQuizzes() {
        const subjectFilter = document.getElementById('subjectFilterQuiz')?.value || '';
        const difficultyFilter = document.getElementById('difficultyFilterQuiz')?.value || '';

        document.querySelectorAll('.quiz-card').forEach(card => {
            const subject = card.dataset.subject;
            const difficulty = card.dataset.difficulty;

            const matchesSubject = !subjectFilter || subject === subjectFilter;
            const matchesDifficulty = !difficultyFilter || difficulty === difficultyFilter;

            card.style.display = matchesSubject && matchesDifficulty ? 'block' : 'none';
        });
    }

    startQuiz(quizId) {
        const quiz = this.availableQuizzes.find(q => q.id === quizId);
        if (!quiz) return;

        this.currentQuiz = quiz;
        this.currentQuestionIndex = 0;
        this.quizAnswers = {};

        this.openQuizModal();
        this.displayQuestion();
        this.startTimer(quiz.timeLimit * 60); // Convert minutes to seconds
    }

    openQuizModal() {
        const modal = document.getElementById('quizModal');
        modal.style.display = 'block';
        document.getElementById('quizTitle').textContent = this.currentQuiz.title;
    }

    closeQuizModal() {
        const modal = document.getElementById('quizModal');
        modal.style.display = 'none';
        
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }
        
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.quizAnswers = {};
    }

    displayQuestion() {
        if (!this.currentQuiz) return;

        const question = this.sampleQuestions[this.currentQuestionIndex % this.sampleQuestions.length];
        
        document.getElementById('questionCounter').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions}`;
        
        document.getElementById('currentQuestion').textContent = question.question;

        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <button class="option-btn" data-option="${index}" onclick="dashboard.selectOption(${index})">
                ${String.fromCharCode(65 + index)}. ${option}
            </button>
        `).join('');

        // Update navigation buttons
        document.getElementById('prevQuestion').style.display = 
            this.currentQuestionIndex === 0 ? 'none' : 'inline-block';
        
        document.getElementById('nextQuestion').style.display = 
            this.currentQuestionIndex === this.currentQuiz.questions - 1 ? 'none' : 'inline-block';
        
        document.getElementById('submitQuiz').style.display = 
            this.currentQuestionIndex === this.currentQuiz.questions - 1 ? 'inline-block' : 'none';

        // Restore previous answer if exists
        const previousAnswer = this.quizAnswers[this.currentQuestionIndex];
        if (previousAnswer !== undefined) {
            this.selectOption(previousAnswer, false);
        }
    }

    selectOption(optionIndex, save = true) {
        // Remove previous selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked option
        document.querySelector(`[data-option="${optionIndex}"]`).classList.add('selected');

        // Save answer
        if (save) {
            this.quizAnswers[this.currentQuestionIndex] = optionIndex;
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    startTimer(seconds) {
        this.quizTimer = setInterval(() => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

            if (seconds <= 0) {
                this.submitQuiz();
                return;
            }

            seconds--;
        }, 1000);
    }

    submitQuiz() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }

        // Calculate score (simplified)
        const correctAnswers = Object.keys(this.quizAnswers).filter(questionIndex => {
            const question = this.sampleQuestions[questionIndex % this.sampleQuestions.length];
            return this.quizAnswers[questionIndex] === question.correct;
        }).length;

        const score = Math.round((correctAnswers / this.currentQuiz.questions) * 100);

        this.showQuizResult(score);
        this.closeQuizModal();
        
        // Update performance data
        this.addPerformanceRecord(score);
    }

    showQuizResult(score) {
        let message = `Quiz completed! Your score: ${score}%\n\n`;
        
        if (score >= 90) {
            message += "Excellent work! 🎉\nThe AI will maintain your current difficulty level.";
        } else if (score >= 75) {
            message += "Good job! 👍\nKeep practicing to improve further.";
        } else if (score >= 60) {
            message += "Not bad! 📚\nThe AI suggests reviewing the topics and trying again.";
        } else {
            message += "Keep trying! 💪\nThe AI will provide easier questions to help you improve.";
        }

        this.showNotification(message, 'info');
    }

    addPerformanceRecord(score) {
        const newRecord = {
            quiz: this.currentQuiz.title,
            subject: this.currentQuiz.subject,
            date: new Date().toISOString().split('T')[0],
            score: score,
            timeTaken: 'Just completed',
            difficulty: this.currentQuiz.difficulty
        };

        this.performanceData.unshift(newRecord);
        this.renderPerformanceTable();
        this.updateDashboardStats();
    }

    renderPerformanceTable() {
        const tbody = document.getElementById('performanceTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.performanceData.map(record => `
            <tr>
                <td>${record.quiz}</td>
                <td>${record.subject}</td>
                <td>${record.date}</td>
                <td><span class="score-badge ${this.getScoreClass(record.score)}">${record.score}%</span></td>
                <td>${record.timeTaken}</td>
                <td><span class="difficulty-badge ${record.difficulty.toLowerCase()}">${record.difficulty}</span></td>
                <td>
                    <button class="btn-secondary" onclick="dashboard.viewQuizDetails('${record.quiz}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
    }

    updateDashboardStats() {
        // Update stats based on performance data
        const totalQuizzes = this.performanceData.length;
        const averageScore = totalQuizzes > 0 ? 
            Math.round(this.performanceData.reduce((sum, record) => sum + record.score, 0) / totalQuizzes) : 0;

        // Update DOM elements (simplified)
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = totalQuizzes;
            statNumbers[1].textContent = `${averageScore}%`;
        }
    }

    viewQuizDetails(quizName) {
        this.showNotification(`Viewing details for: ${quizName}`, 'info');
    }

    updateSetting(settingName, value) {
        this.showNotification(`${settingName} ${value ? 'enabled' : 'disabled'}`, 'success');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/login.html';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message.replace(/\n/g, '<br>')}</span>
            <button class="close-notification">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Manual close
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new StudentDashboard();
});

// Additional CSS for notifications and score badges
const additionalStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: flex-start;
    gap: 10px;
    z-index: 3000;
    min-width: 300px;
    max-width: 400px;
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
    flex-shrink: 0;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.score-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.score-badge.excellent {
    background: #dcfce7;
    color: #166534;
}

.score-badge.good {
    background: #dbeafe;
    color: #1e40af;
}

.score-badge.average {
    background: #fef3c7;
    color: #92400e;
}

.score-badge.poor {
    background: #fee2e2;
    color: #991b1b;
}

.difficulty-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.difficulty-badge.easy {
    background: #dcfce7;
    color: #166534;
}

.difficulty-badge.medium {
    background: #fef3c7;
    color: #92400e;
}

.difficulty-badge.hard {
    background: #fee2e2;
    color: #991b1b;
}
`;

// Add additional styles to head
const style = document.createElement('style');
style.textContent = additionalStyles;
document.head.appendChild(style);
