// Fixed main.js with submission bug resolved

let questions = [];
let currentQ = 0;
let results = [];
let timerInterval = null;
let testStartTime = null;
const timeLimit = 60; // seconds per question

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeEventListeners();
});

function initializeEventListeners() {
    // Form submission handler
    const uploadForm = document.getElementById("pdf-upload-form");
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmission);
        console.log('Upload form listener added');
    }
    
    // Answer form submission - Fixed event listener
    const answerForm = document.getElementById("answer-form");
    if (answerForm) {
        answerForm.addEventListener('submit', function(e) {
            console.log('Answer form submitted');
            e.preventDefault();
            submitAnswer(false);
        });
        console.log('Answer form listener added');
    }
    
    // Skip button handler - Fixed event listener
    const skipBtn = document.getElementById("skip-btn");
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            console.log('Skip button clicked');
            submitAnswer(true);
        });
        console.log('Skip button listener added');
    }
    
    // Cleanup timer on page unload
    window.addEventListener('beforeunload', stopTimer);
}

async function handleFormSubmission(e) {
    e.preventDefault();
    console.log('Form submission started');
    
    const files = document.getElementById("pdf-input").files;
    const difficulty = document.getElementById("difficulty").value;
    const numQuestions = document.getElementById("num-questions").value;

    console.log('Form data:', { filesCount: files.length, difficulty, numQuestions });

    // Validation
    if (files.length === 0) {
        showError("Please select at least one PDF file.");
        return;
    }

    if (!numQuestions || numQuestions < 1 || numQuestions > 50) {
        showError("Please enter a valid number of questions (1-50).");
        return;
    }

    try {
        await generateQuestions(files, difficulty, numQuestions);
    } catch (error) {
        console.error('Generation failed:', error);
        showError("Failed to generate questions: " + error.message);
    }
}

async function generateQuestions(files, difficulty, numQuestions) {
    console.log('Starting question generation...');
    
    // Show loading state
    const generateBtn = document.getElementById("generate-btn");
    const loadingDiv = document.getElementById("loading");
    const errorDiv = document.getElementById("error-message");
    
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    loadingDiv.style.display = "block";
    errorDiv.style.display = "none";

    let formData = new FormData();
    for (let file of files) {
        formData.append("pdf_files", file);
        console.log('Added file:', file.name);
    }
    formData.append("difficulty", difficulty);
    formData.append("questions", numQuestions);

    try {
        console.log('Sending request to /api/generate_questions');
        const response = await fetch('/api/generate_questions', {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (data.success && data.questions && data.questions.length > 0) {
            questions = data.questions;
            console.log('Questions loaded:', questions.length);
            startTest();
        } else {
            throw new Error(data.error || "No questions were generated");
        }
    } catch (error) {
        console.error('Request failed:', error);
        throw new Error(error.message || "Network error occurred");
    } finally {
        // Reset UI state
        generateBtn.disabled = false;
        generateBtn.textContent = "🚀 Generate Questions";
        loadingDiv.style.display = "none";
    }
}

function startTest() {
    console.log('Starting test with', questions.length, 'questions');
    currentQ = 0;
    results = [];
    testStartTime = new Date();
    
    document.getElementById("input-section").style.display = "none";
    document.getElementById("questions-section").style.display = "block";
    showQuestion();
}

function showQuestion() {
    console.log('Showing question', currentQ + 1, 'of', questions.length);
    
    if (currentQ >= questions.length) {
        console.log('All questions completed, finishing test');
        finishTest();
        return;
    }

    const q = questions[currentQ];
    console.log('Current question:', q);
    
    // Update progress
    const progressElement = document.getElementById("progress");
    if (progressElement) {
        progressElement.textContent = `Question ${currentQ + 1} of ${questions.length}`;
    }
    
    // Display question
    const questionBox = document.getElementById("question-box");
    if (questionBox) {
        questionBox.textContent = q.question || "Question text not available";
    }
    
    // Display options with improved HTML structure
    const optionsBox = document.getElementById("options-box");
    if (optionsBox && q.options && Array.isArray(q.options)) {
        let optsHtml = '';
        q.options.forEach((opt, idx) => {
            const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
            optsHtml += `
                <label class="option-label">
                    <input type="radio" name="option" value="${optionLetter}" required> 
                    <span class="option-text">${optionLetter}. ${opt}</span>
                </label>
            `;
        });
        optionsBox.innerHTML = optsHtml;
        console.log('Options rendered:', q.options.length);
    }
    
    // Reset form and start timer
    const answerForm = document.getElementById("answer-form");
    if (answerForm) {
        answerForm.reset();
    }
    startTimer();
}

function submitAnswer(skipped = false) {
    console.log('submitAnswer called, skipped:', skipped);
    
    stopTimer();
    
    const userAnswer = skipped ? "SKIP" : getSelectedAnswer();
    const timeTaken = timeLimit - getTimerValue();
    const currentQuestion = questions[currentQ];
    
    console.log('Answer details:', {
        userAnswer,
        correctAnswer: currentQuestion.correct_answer,
        timeTaken,
        skipped
    });
    
    // Store result with complete data structure
    const result = {
        question_number: currentQ + 1,
        question: currentQuestion.question || "",
        options: currentQuestion.options || [],
        correct_answer: currentQuestion.correct_answer || "",
        user_answer: userAnswer,
        is_correct: !skipped && userAnswer === currentQuestion.correct_answer,
        time_taken: Math.max(0, timeTaken),
        difficulty: currentQuestion.difficulty || "medium",
        topic: currentQuestion.topic || "Unknown",
        skipped: skipped
    };
    
    results.push(result);
    console.log('Result stored:', result);

    currentQ++;
    
    if (currentQ < questions.length) {
        console.log('Moving to next question');
        showQuestion();
    } else {
        console.log('Test completed, showing results');
        finishTest();
    }
}

function getSelectedAnswer() {
    const selected = document.querySelector('input[name="option"]:checked');
    const answer = selected ? selected.value : "";
    console.log('Selected answer:', answer);
    return answer;
}

function getTimerValue() {
    const timerElement = document.getElementById("timer");
    if (!timerElement) return 0;
    
    const timerText = timerElement.textContent;
    const seconds = parseInt(timerText.replace('s', '')) || 0;
    console.log('Timer value:', seconds);
    return seconds;
}

async function finishTest() {
    console.log('Finishing test with', results.length, 'results');
    
    document.getElementById("questions-section").style.display = "none";
    document.getElementById("results-section").style.display = "block";
    
    try {
        const payload = {
            results: results,
            test_duration: Math.floor((new Date() - testStartTime) / 1000),
            total_questions: questions.length
        };
        
        console.log('Sending results payload:', payload);
        
        const response = await fetch('/api/submit_results', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        console.log('Results response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const analysisData = await response.json();
        console.log('Analysis data received:', analysisData);
        displayResults(analysisData);
    } catch (error) {
        console.error('Results submission failed:', error);
        displayErrorResults("Error analyzing results: " + error.message);
    }
}

function displayResults(data) {
    console.log('Displaying results:', data);
    
    const resultsContainer = document.getElementById("results-box");
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    // Parse and calculate statistics
    const stats = parseResultsData(data);
    console.log('Parsed stats:', stats);
    
    // Create enhanced results HTML
    const resultsHTML = `
        <div class="results-container">
            <div class="results-header">
                <h2>🎉 Test Completed!</h2>
                <div class="score-display">${stats.scorePercentage}%</div>
                <p>You scored ${stats.correctAnswers} out of ${stats.totalQuestions} questions</p>
            </div>
            
            <div class="results-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.correctAnswers}</div>
                    <div class="stat-label">Correct</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.incorrectAnswers}</div>
                    <div class="stat-label">Incorrect</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.skippedQuestions}</div>
                    <div class="stat-label">Skipped</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.averageTime}s</div>
                    <div class="stat-label">Avg Time</div>
                </div>
            </div>
            
            <div class="performance-summary">
                <h3>📊 Performance Summary</h3>
                <p><strong>Overall Performance:</strong> ${getPerformanceLevel(stats.scorePercentage)}</p>
                <p><strong>Total Time:</strong> ${formatTime(stats.totalTime)}</p>
                <p><strong>Accuracy Rate:</strong> ${stats.accuracyRate}% (excluding skipped questions)</p>
                ${stats.summary ? `<p><strong>Analysis:</strong> ${stats.summary}</p>` : ''}
            </div>
            
            ${stats.topicBreakdown ? createTopicBreakdown(stats.topicBreakdown) : ''}
            
            ${createDetailedBreakdown(results)}
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
}

function parseResultsData(data) {
    // Calculate basic statistics from results
    const correctAnswers = results.filter(r => r.is_correct).length;
    const incorrectAnswers = results.filter(r => !r.is_correct && !r.skipped).length;
    const skippedQuestions = results.filter(r => r.skipped).length;
    const totalQuestions = results.length;
    const totalTime = results.reduce((sum, r) => sum + r.time_taken, 0);
    const averageTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const attemptedQuestions = totalQuestions - skippedQuestions;
    const accuracyRate = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;
    
    // Use data from backend if available, otherwise use calculated values
    return {
        correctAnswers: data.correct_answers || correctAnswers,
        incorrectAnswers: data.incorrect_answers || incorrectAnswers,
        skippedQuestions: data.skipped_questions || skippedQuestions,
        totalQuestions: data.total_questions || totalQuestions,
        totalTime: data.total_time || totalTime,
        averageTime: data.average_time || averageTime,
        scorePercentage: data.score || scorePercentage,
        accuracyRate: data.accuracy_rate || accuracyRate,
        summary: data.summary || "",
        topicBreakdown: data.topic_breakdown || null,
        difficultyBreakdown: data.difficulty_breakdown || null
    };
}

function createTopicBreakdown(topicData) {
    if (!topicData || typeof topicData !== 'object') return '';
    
    let html = '<div class="topic-breakdown"><h3>📚 Topic-wise Performance</h3>';
    
    Object.entries(topicData).forEach(([topic, data]) => {
        const accuracy = data.accuracy || 0;
        html += `
            <div class="topic-item">
                <div>
                    <strong>${topic}</strong>
                    <br>
                    <small>${data.correct || 0}/${data.total || 0} questions</small>
                </div>
                <div>
                    <div class="accuracy-bar">
                        <div class="accuracy-fill" style="width: ${accuracy}%"></div>
                    </div>
                    <small>${Math.round(accuracy)}%</small>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function createDetailedBreakdown(results) {
    let html = '<div class="detailed-breakdown" style="margin: 20px 30px 30px;"><h3>📝 Detailed Question Review</h3>';
    
    results.forEach((result, index) => {
        const isCorrect = result.is_correct;
        const wasSkipped = result.skipped;
        const statusIcon = wasSkipped ? '⏭️' : (isCorrect ? '✅' : '❌');
        const statusClass = wasSkipped ? 'skipped' : (isCorrect ? 'correct' : 'incorrect');
        
        html += `
            <div class="question-review ${statusClass}" style="
                background: white;
                margin: 10px 0;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid ${wasSkipped ? '#ffc107' : (isCorrect ? '#28a745' : '#dc3545')};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>Question ${index + 1} ${statusIcon}</strong>
                    <span style="color: #6c757d; font-size: 0.9rem;">
                        Time: ${result.time_taken}s | Topic: ${result.topic}
                    </span>
                </div>
                <div style="margin-bottom: 10px; color: #495057;">
                    ${result.question.substring(0, 100)}${result.question.length > 100 ? '...' : ''}
                </div>
                <div style="font-size: 0.9rem;">
                    <span style="color: #28a745;"><strong>Correct:</strong> ${result.correct_answer}</span>
                    ${!wasSkipped ? `<span style="margin-left: 20px; color: ${isCorrect ? '#28a745' : '#dc3545'};"><strong>Your Answer:</strong> ${result.user_answer}</span>` : '<span style="margin-left: 20px; color: #ffc107;"><strong>Skipped</strong></span>'}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function getPerformanceLevel(score) {
    if (score >= 90) return "🏆 Excellent! You're well prepared for GATE.";
    if (score >= 75) return "👍 Good performance! Keep practicing to reach excellence.";
    if (score >= 60) return "📈 Fair performance. Focus on weak areas for improvement.";
    if (score >= 40) return "⚠️ Needs improvement. Consider reviewing fundamental concepts.";
    return "📚 Requires significant preparation. Start with basics and practice regularly.";
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function displayErrorResults(errorMessage) {
    const resultsContainer = document.getElementById("results-box");
    
    // Calculate basic stats from our results data
    const stats = parseResultsData({});
    
    resultsContainer.innerHTML = `
        <div class="error">
            <h3>❌ Error Processing Results</h3>
            <p>${errorMessage}</p>
            <p>Your test responses have been recorded. Here's a basic summary:</p>
            <div class="results-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.correctAnswers}</div>
                    <div class="stat-label">Correct</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.scorePercentage}%</div>
                    <div class="stat-label">Score</div>
                </div>
            </div>
        </div>
    `;
}

function startTimer() {
    console.log('Starting timer');
    // Clear any existing timer
    stopTimer();
    
    let timeLeft = timeLimit;
    updateTimerDisplay(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            console.log('Timer expired, auto-skipping');
            clearInterval(timerInterval);
            submitAnswer(true); // Auto-skip when time runs out
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        console.log('Stopping timer');
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay(seconds) {
    const timerElement = document.getElementById("timer");
    if (!timerElement) return;
    
    timerElement.textContent = `${seconds}s`;
    
    // Remove existing classes
    timerElement.classList.remove('warning', 'danger');
    
    // Add appropriate class based on time remaining
    if (seconds <= 10) {
        timerElement.classList.add('danger');
    } else if (seconds <= 30) {
        timerElement.classList.add('warning');
    }
}

function showError(message) {
    console.log('Showing error:', message);
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = "none";
        }, 5000);
    }
}

function restartTest() {
    console.log('Restarting test');
    // Reset all state
    questions = [];
    currentQ = 0;
    results = [];
    testStartTime = null;
    stopTimer();
    
    // Reset UI
    document.getElementById("input-section").style.display = "block";
    document.getElementById("questions-section").style.display = "none";
    document.getElementById("results-section").style.display = "none";
    document.getElementById("error-message").style.display = "none";
    document.getElementById("loading").style.display = "none";
    
    const uploadForm = document.getElementById("pdf-upload-form");
    if (uploadForm) {
        uploadForm.reset();
    }
}