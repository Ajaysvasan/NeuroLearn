from flask import Flask, request, jsonify, render_template
import tempfile
import os
import logging
from werkzeug.exceptions import RequestEntityTooLarge

# Import your modules - make sure these exist and work
try:
    from question_generator import generate_questions
    from assessment import PerformanceAnalyzer
except ImportError as e:
    print(f"Warning: Could not import modules: {e}")
    # You might want to handle this more gracefully in production

app = Flask(__name__)

# Configure upload limits
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/generate_questions', methods=['POST'])
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
        temp_files = []  # Keep track for cleanup
        
        try:
            for f in pdf_files:
                # Create temporary file with proper suffix
                temp_fd, temp_path = tempfile.mkstemp(suffix='.pdf')
                os.close(temp_fd)  # Close the file descriptor
                
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
            
            # Ensure questions have required fields
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
                
                # Validate options
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
def api_submit_results():
    """Analyze and return performance results"""
    try:
        # Validate request
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

        # Validate results structure
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

        # Analyze performance
        try:
            analyzer = PerformanceAnalyzer()
            analysis = analyzer.analyze_performance(validated_results)
            
            # Ensure analysis has required fields
            if not isinstance(analysis, dict):
                analysis = {'error': 'Invalid analysis result'}
            
            # Add basic stats if not provided by analyzer
            if 'score' not in analysis:
                correct_count = sum(1 for r in validated_results if r['is_correct'])
                analysis['score'] = round((correct_count / len(validated_results)) * 100, 2)
            
            if 'total_questions' not in analysis:
                analysis['total_questions'] = len(validated_results)
            
            if 'correct_answers' not in analysis:
                analysis['correct_answers'] = sum(1 for r in validated_results if r['is_correct'])
            
            logger.info(f"Performance analysis completed for {len(validated_results)} questions")
            
            return jsonify({
                'success': True,
                **analysis
            })
            
        except Exception as e:
            logger.error(f"Error in performance analysis: {str(e)}")
            
            # Fallback: basic analysis
            correct_count = sum(1 for r in validated_results if r['is_correct'])
            total_time = sum(r['time_taken'] for r in validated_results)
            skipped_count = sum(1 for r in validated_results if r['skipped'])
            
            return jsonify({
                'success': True,
                'score': round((correct_count / len(validated_results)) * 100, 2),
                'total_questions': len(validated_results),
                'correct_answers': correct_count,
                'incorrect_answers': len(validated_results) - correct_count,
                'skipped_questions': skipped_count,
                'total_time': total_time,
                'average_time': round(total_time / len(validated_results), 2) if validated_results else 0,
                'summary': f'You scored {correct_count}/{len(validated_results)} ({round((correct_count / len(validated_results)) * 100, 2)}%)',
                'error_note': f'Using basic analysis due to error: {str(e)}'
            })

    except Exception as e:
        logger.error(f"Unexpected error in submit_results: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while analyzing results.'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    if not os.path.exists(templates_dir):
        os.makedirs(templates_dir)
        logger.info(f"Created templates directory: {templates_dir}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)