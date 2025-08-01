from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
import tempfile
import os
import logging
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from datetime import datetime
import secrets

# Import your modules - make sure these exist and work
try:
    from question_generator import generate_questions
    from assessment import PerformanceAnalyzer
except ImportError as e:
    print(f"Warning: Could not import modules: {e}")

app = Flask(__name__)

# Configure app
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['SECRET_KEY'] = secrets.token_hex(16)  # Generate a secure secret key

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
def init_db():
    """Initialize the database with user and test_history tables"""
    conn = sqlite3.connect('gate_app.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Test history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS test_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            test_name TEXT,
            total_questions INTEGER,
            correct_answers INTEGER,
            score_percentage REAL,
            time_taken INTEGER,
            difficulty TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database on startup
init_db()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('gate_app.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required(f):
    """Decorator to require login for certain routes"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Authentication Routes
@app.route('/')
def index():
    """Home page - redirect based on login status"""
    if 'user_id' in session:
        return render_template('dashboard.html')
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        if not username or not password:
            flash('Please enter both username and password.', 'error')
            return render_template('login.html')
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            (username, username)
        ).fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            
            # Update last login
            conn = get_db_connection()
            conn.execute(
                'UPDATE users SET last_login = ? WHERE id = ?',
                (datetime.now(), user['id'])
            )
            conn.commit()
            conn.close()
            
            flash(f'Welcome back, {user["full_name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registration page"""
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        errors = []
        
        if not full_name or len(full_name) < 2:
            errors.append('Full name must be at least 2 characters long.')
        
        if not username or len(username) < 3:
            errors.append('Username must be at least 3 characters long.')
        
        if not email or '@' not in email:
            errors.append('Please enter a valid email address.')
        
        if not password or len(password) < 6:
            errors.append('Password must be at least 6 characters long.')
        
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('register.html')
        
        # Check if user already exists
        conn = get_db_connection()
        existing_user = conn.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            (username, email)
        ).fetchone()
        
        if existing_user:
            flash('Username or email already exists.', 'error')
            conn.close()
            return render_template('register.html')
        
        # Create new user
        password_hash = generate_password_hash(password)
        try:
            conn.execute(
                'INSERT INTO users (full_name, username, email, password_hash) VALUES (?, ?, ?, ?)',
                (full_name, username, email, password_hash)
            )
            conn.commit()
            conn.close()
            
            flash('Registration successful! You can now log in.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Username or email already exists.', 'error')
            conn.close()
            return render_template('register.html')
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    """Logout and clear session"""
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard after login"""
    # Get user's test history
    conn = get_db_connection()
    test_history = conn.execute(
        '''SELECT * FROM test_history 
           WHERE user_id = ? 
           ORDER BY created_at DESC 
           LIMIT 10''',
        (session['user_id'],)
    ).fetchall()
    
    # Get user stats
    stats = conn.execute(
        '''SELECT 
           COUNT(*) as total_tests,
           AVG(score_percentage) as avg_score,
           MAX(score_percentage) as best_score,
           SUM(time_taken) as total_time
           FROM test_history 
           WHERE user_id = ?''',
        (session['user_id'],)
    ).fetchone()
    
    conn.close()
    
    return render_template('dashboard.html', test_history=test_history, stats=stats)

@app.route('/test')
@login_required
def test_page():
    """Test taking page"""
    user = {
        "fullname" :"Ajaysvasan"
    }
    return render_template('test.html' , user=user)

@app.route('/profile')
@login_required
def profile():
    """User profile page"""
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE id = ?',
        (session['user_id'],)
    ).fetchone()
    conn.close()
    
    return render_template('profile.html', user=user)

# API Routes (existing functionality)
@app.route('/api/generate_questions', methods=['POST'])
@login_required
def api_generate_questions():
    """Generate questions from uploaded PDFs"""
    try:
        # Validate request
        if 'pdf_files' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No PDF files provided'
            }), 400

        files = request.files.getlist('pdf_files')
        
        if not files or all(f.filename == '' for f in files):
            return jsonify({
                'success': False,
                'error': 'No files selected'
            }), 400

        # Get parameters with validation
        difficulty = request.form.get('difficulty', 'medium')
        if difficulty not in ['easy', 'medium', 'advanced']:
            difficulty = 'medium'

        try:
            questions_count = int(request.form.get('questions', 10))
            if questions_count < 1 or questions_count > 50:
                questions_count = 10
        except (ValueError, TypeError):
            questions_count = 10

        # Validate file types
        pdf_files = []
        for f in files:
            if f and f.filename.lower().endswith('.pdf'):
                pdf_files.append(f)
        
        if not pdf_files:
            return jsonify({
                'success': False,
                'error': 'Please upload valid PDF files'
            }), 400

        # Save PDFs temporarily
        pdf_paths = []
        temp_files = []
        
        try:
            for f in pdf_files:
                temp_fd, temp_path = tempfile.mkstemp(suffix='.pdf')
                os.close(temp_fd)
                
                f.save(temp_path)
                pdf_paths.append(temp_path)
                temp_files.append(temp_path)
                
                logger.info(f"Saved PDF: {f.filename} to {temp_path}")

            # Generate questions
            logger.info(f"Generating {questions_count} {difficulty} questions from {len(pdf_paths)} PDFs")
            
            result = generate_questions(
                pdf_paths, 
                difficulty, 
                questions_count, 
                save_files=False
            )
            
            # Validate the result structure
            if not isinstance(result, dict) or 'questions' not in result:
                return jsonify({
                    'success': False,
                    'error': 'Invalid response from question generator'
                }), 500
            
            # Process questions
            questions = result.get('questions', [])
            validated_questions = []
            
            for i, q in enumerate(questions):
                if not isinstance(q, dict):
                    continue
                    
                validated_q = {
                    'question': q.get('question', f'Question {i+1}'),
                    'options': q.get('options', []),
                    'correct_answer': q.get('correct_answer', 'A'),
                    'difficulty': q.get('difficulty', difficulty),
                    'topic': q.get('topic', 'General'),
                    'explanation': q.get('explanation', '')
                }
                
                if not isinstance(validated_q['options'], list) or len(validated_q['options']) == 0:
                    validated_q['options'] = ['Option A', 'Option B', 'Option C', 'Option D']
                
                validated_questions.append(validated_q)
            
            if not validated_questions:
                return jsonify({
                    'success': False,
                    'error': 'No valid questions could be generated from the provided PDFs'
                }), 500
            
            logger.info(f"Successfully generated {len(validated_questions)} questions")
            
            return jsonify({
                'success': True,
                'questions': validated_questions,
                'message': f'Generated {len(validated_questions)} questions successfully'
            })

        except Exception as e:
            logger.error(f"Error generating questions: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Failed to generate questions: {str(e)}'
            }), 500
            
        finally:
            # Cleanup temporary files
            for temp_path in temp_files:
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                        logger.info(f"Cleaned up temp file: {temp_path}")
                except Exception as e:
                    logger.warning(f"Failed to cleanup temp file {temp_path}: {e}")

    except RequestEntityTooLarge:
        return jsonify({
            'success': False,
            'error': 'File too large. Maximum size is 16MB per file.'
        }), 413
    except Exception as e:
        logger.error(f"Unexpected error in generate_questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred. Please try again.'
        }), 500

@app.route('/api/submit_results', methods=['POST'])
@login_required
def api_submit_results():
    """Analyze and return performance results"""
    try:
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400

        results = data.get('results', [])
        
        if not isinstance(results, list) or len(results) == 0:
            return jsonify({
                'success': False,
                'error': 'No results provided'
            }), 400

        # Process results
        validated_results = []
        for i, result in enumerate(results):
            if not isinstance(result, dict):
                continue
                
            validated_result = {
                'question_number': result.get('question_number', i + 1),
                'question': result.get('question', ''),
                'user_answer': result.get('user_answer', 'SKIP'),
                'correct_answer': result.get('correct_answer', 'A'),
                'is_correct': result.get('is_correct', False),
                'time_taken': result.get('time_taken', 0),
                'difficulty': result.get('difficulty', 'medium'),
                'topic': result.get('topic', 'General'),
                'skipped': result.get('skipped', False)
            }
            validated_results.append(validated_result)

        if not validated_results:
            return jsonify({
                'success': False,
                'error': 'No valid results to analyze'
            }), 400

        # Calculate basic stats
        correct_count = sum(1 for r in validated_results if r['is_correct'])
        total_questions = len(validated_results)
        score_percentage = round((correct_count / total_questions) * 100, 2)
        total_time = sum(r['time_taken'] for r in validated_results)
        difficulty = validated_results[0]['difficulty'] if validated_results else 'medium'

        # Save to database
        try:
            conn = get_db_connection()
            conn.execute(
                '''INSERT INTO test_history 
                   (user_id, test_name, total_questions, correct_answers, score_percentage, time_taken, difficulty)
                   VALUES (?, ?, ?, ?, ?, ?, ?)''',
                (session['user_id'], f'Test {datetime.now().strftime("%Y-%m-%d %H:%M")}', 
                 total_questions, correct_count, score_percentage, total_time, difficulty)
            )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to save test history: {e}")

        # Analyze performance
        try:
            analyzer = PerformanceAnalyzer()
            analysis = analyzer.analyze_performance(validated_results)
            
            if not isinstance(analysis, dict):
                analysis = {}
            
        except Exception as e:
            logger.error(f"Error in performance analysis: {str(e)}")
            analysis = {}

        # Prepare response
        response_data = {
            'success': True,
            'score': score_percentage,
            'total_questions': total_questions,
            'correct_answers': correct_count,
            'incorrect_answers': total_questions - correct_count,
            'total_time': total_time,
            'average_time': round(total_time / total_questions, 2) if total_questions > 0 else 0,
            'summary': f'You scored {correct_count}/{total_questions} ({score_percentage}%)',
            **analysis
        }
        
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Unexpected error in submit_results: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while analyzing results.'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    if not os.path.exists(templates_dir):
        os.makedirs(templates_dir)
        logger.info(f"Created templates directory: {templates_dir}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)