import argparse
import json
import time
import os
import logging
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import threading
from collections import defaultdict, Counter
import statistics
from pathlib import Path
import traceback

# Optional imports with fallbacks
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("Google Generative AI not available. Install with: pip install google-generativeai")

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    logging.warning("python-dotenv not available. Install with: pip install python-dotenv")

# Import your question generator with error handling
try:
    from question_generator import generate_questions
except ImportError as e:
    logging.error(f"Failed to import question_generator: {e}")
    print("Error: question_generator.py not found. Please ensure it's in the same directory.")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_interface.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class TestTimer:
    """Thread-safe timer for individual questions with improved reliability"""
    
    def __init__(self, duration_minutes: int = 1):
        self.duration = max(1, duration_minutes) * 60  # Ensure minimum 1 minute
        self.start_time = None
        self.is_active = False
        self.timer_thread = None
        self.time_up_callback = None
        self._lock = threading.Lock()
    
    def start(self, callback=None):
        """Start the timer with thread safety"""
        with self._lock:
            self.start_time = time.time()
            self.is_active = True
            self.time_up_callback = callback
            
            def timer_countdown():
                time.sleep(self.duration)
                with self._lock:
                    if self.is_active and self.time_up_callback:
                        try:
                            self.time_up_callback()
                        except Exception as e:
                            logger.error(f"Timer callback error: {e}")
                    self.is_active = False
            
            self.timer_thread = threading.Thread(target=timer_countdown, daemon=True)
            self.timer_thread.start()
    
    def stop(self) -> float:
        """Stop the timer and return elapsed time"""
        with self._lock:
            if self.start_time:
                elapsed = time.time() - self.start_time
                self.is_active = False
                return min(elapsed, self.duration)  # Cap at duration limit
            return 0.0
    
    def get_remaining_time(self) -> float:
        """Get remaining time in seconds"""
        with self._lock:
            if not self.start_time or not self.is_active:
                return 0.0
            elapsed = time.time() - self.start_time
            remaining = max(0.0, self.duration - elapsed)
            return remaining

class PerformanceAnalyzer:
    """Optimized performance analyzer with GATE-style negative marking"""
    
    # Class-level constants for better performance
    TOPIC_KEYWORDS = {
        'mathematics': {'formula', 'equation', 'calculate', 'derivative', 'integral', 'matrix', 'algebra', 'calculus', 'probability'},
        'circuits': {'circuit', 'voltage', 'current', 'resistance', 'capacitor', 'inductor', 'impedance', 'kcl', 'kvl', 'ohm'},
        'signals': {'signal', 'frequency', 'amplitude', 'fourier', 'filter', 'modulation', 'spectrum', 'convolution', 'sampling'},
        'control': {'control', 'feedback', 'stability', 'response', 'transfer function', 'pid', 'bode', 'nyquist', 'root locus'},
        'digital': {'digital', 'logic', 'binary', 'gate', 'flip-flop', 'counter', 'memory', 'boolean', 'multiplexer'},
        'power': {'power', 'energy', 'motor', 'generator', 'transformer', 'transmission', 'protection', 'synchronous'},
        'communication': {'communication', 'antenna', 'modulation', 'channel', 'noise', 'protocol', 'coding', 'multiplexing'},
        'electromagnetics': {'electromagnetic', 'wave', 'field', 'maxwell', 'transmission line', 'waveguide', 'antenna'},
        'materials': {'material', 'semiconductor', 'conductor', 'dielectric', 'crystal', 'doping', 'band gap'},
        'programming': {'algorithm', 'data structure', 'complexity', 'sorting', 'searching', 'graph', 'tree', 'dynamic'},
        'networks': {'network', 'protocol', 'tcp', 'ip', 'routing', 'switching', 'osi', 'ethernet'},
        'databases': {'database', 'sql', 'query', 'normalization', 'acid', 'transaction', 'index'}
    }
    
    MARKING_SCHEME = {
        'correct_marks': 1.0,
        'incorrect_penalty': -1/3,
        'skip_marks': 0.0,
        'time_bonus_threshold': 30,
        'time_penalty_threshold': 55
    }
    
    def __init__(self):
        self.topic_cache = {}  # Cache for topic categorization
    
    def categorize_question_topic(self, question_text: str, pdf_reference: str = "") -> str:
        """Optimized topic categorization with caching"""
        # Create cache key
        cache_key = hash(question_text + pdf_reference)
        if cache_key in self.topic_cache:
            return self.topic_cache[cache_key]
        
        text_to_analyze = (question_text + " " + pdf_reference).lower()
        text_words = set(text_to_analyze.split())
        
        topic_scores = {}
        for topic, keywords in self.TOPIC_KEYWORDS.items():
            # Use set intersection for faster matching
            score = len(keywords.intersection(text_words))
            if score > 0:
                topic_scores[topic] = score
        
        result = max(topic_scores, key=topic_scores.get) if topic_scores else 'general'
        
        # Cache the result
        self.topic_cache[cache_key] = result
        return result
    
    def calculate_marks_with_negative_grading(self, test_results: List[Dict]) -> Dict[str, Any]:
        """Optimized negative marking calculation"""
        if not test_results:
            return {'error': 'No test results provided'}
        
        total_marks = 0.0
        positive_marks = 0.0
        negative_marks = 0.0
        question_wise_marks = []
        
        # Vectorized calculation for better performance
        for i, result in enumerate(test_results):
            try:
                marks_earned = 0.0
                time_taken = float(result.get('time_taken', 0))
                
                if result.get('is_skipped', False):
                    marks_earned = self.MARKING_SCHEME['skip_marks']
                    marking_type = 'skipped'
                elif result.get('is_correct', False):
                    marks_earned = self.MARKING_SCHEME['correct_marks']
                    
                    # Time bonus for quick correct answers
                    if time_taken < self.MARKING_SCHEME['time_bonus_threshold']:
                        time_bonus = 0.1
                        marks_earned += time_bonus
                        positive_marks += self.MARKING_SCHEME['correct_marks'] + time_bonus
                    else:
                        positive_marks += self.MARKING_SCHEME['correct_marks']
                    
                    marking_type = 'correct'
                else:
                    marks_earned = self.MARKING_SCHEME['incorrect_penalty']
                    negative_marks += abs(marks_earned)
                    marking_type = 'incorrect'
                
                total_marks += marks_earned
                
                question_wise_marks.append({
                    'question_number': result.get('question_number', i + 1),
                    'marks_earned': round(marks_earned, 3),
                    'marking_type': marking_type,
                    'time_taken': time_taken
                })
                
            except (KeyError, TypeError, ValueError) as e:
                logger.warning(f"Error processing result {i}: {e}")
                continue
        
        # Calculate derived metrics
        max_possible_marks = len(test_results) * self.MARKING_SCHEME['correct_marks']
        percentage_score = (total_marks / max_possible_marks) * 100 if max_possible_marks > 0 else 0
        
        # Answer distribution
        correct_count = sum(1 for r in test_results if r.get('is_correct', False))
        incorrect_count = sum(1 for r in test_results if not r.get('is_correct', False) and not r.get('is_skipped', False))
        skipped_count = sum(1 for r in test_results if r.get('is_skipped', False))
        
        return {
            'marking_summary': {
                'total_marks_earned': round(total_marks, 3),
                'maximum_possible_marks': max_possible_marks,
                'percentage_score': round(max(0, percentage_score), 2),
                'positive_marks': round(positive_marks, 3),
                'negative_marks': round(negative_marks, 3),
                'net_score_impact': round(total_marks, 3)
            },
            'answer_distribution': {
                'correct_answers': correct_count,
                'incorrect_answers': incorrect_count,
                'skipped_answers': skipped_count,
                'total_questions': len(test_results)
            },
            'efficiency_metrics': {
                'accuracy_rate': round((correct_count / len(test_results)) * 100, 2),
                'attempt_rate': round(((len(test_results) - skipped_count) / len(test_results)) * 100, 2),
                'correct_attempt_ratio': round((correct_count / max(1, len(test_results) - skipped_count)) * 100, 2),
                'negative_impact': round((negative_marks / max_possible_marks) * 100, 2)
            },
            'question_wise_marks': question_wise_marks,
            'marking_scheme_used': self.MARKING_SCHEME
        }
    
    def analyze_strategy_effectiveness(self, test_results: List[Dict]) -> Dict[str, Any]:
        """Analyze effectiveness of negative marking strategy"""
        if not test_results:
            return {'error': 'No test results to analyze'}
        
        total_questions = len(test_results)
        correct = sum(1 for r in test_results if r.get('is_correct', False))
        incorrect = sum(1 for r in test_results if not r.get('is_correct', False) and not r.get('is_skipped', False))
        skipped = sum(1 for r in test_results if r.get('is_skipped', False))
        
        # Current strategy performance
        current_marks = (correct * 1) + (incorrect * (-1/3))
        
        # Alternative strategy calculations
        conservative_marks = correct * 1  # Skip all incorrect
        
        # Aggressive strategy (attempt all with 25% success rate)
        if skipped > 0:
            expected_correct_from_skipped = skipped * 0.25
            expected_incorrect_from_skipped = skipped * 0.75
            aggressive_marks = current_marks + (expected_correct_from_skipped * 1) + (expected_incorrect_from_skipped * (-1/3))
        else:
            aggressive_marks = current_marks
        
        # Determine optimal strategy
        strategy_recommendations = []
        
        if incorrect > total_questions * 0.2 and skipped < total_questions * 0.2:
            strategy_type = "more_conservative"
            strategy_recommendations.append("Consider skipping questions you're less confident about")
        elif skipped > total_questions * 0.4:
            strategy_type = "more_aggressive"
            strategy_recommendations.append("Try to attempt more questions with educated guessing")
        else:
            strategy_type = "balanced"
            strategy_recommendations.append("Good balance between attempting and skipping")
        
        # Calculate confidence threshold
        confidence_threshold = self._calculate_confidence_threshold(test_results)
        
        return {
            'current_performance': {
                'marks': round(current_marks, 3),
                'strategy_type': strategy_type
            },
            'alternative_strategies': {
                'conservative': {
                    'marks': round(conservative_marks, 3),
                    'difference': round(conservative_marks - current_marks, 3),
                    'description': 'Skip all uncertain questions'
                },
                'aggressive': {
                    'marks': round(aggressive_marks, 3),
                    'difference': round(aggressive_marks - current_marks, 3),
                    'description': 'Attempt all questions with educated guessing'
                }
            },
            'recommendations': strategy_recommendations,
            'confidence_threshold': confidence_threshold
        }
    
    def _calculate_confidence_threshold(self, test_results: List[Dict]) -> str:
        """Calculate recommended confidence threshold"""
        if not test_results:
            return 'medium_confidence'
        
        # Analyze time vs accuracy patterns
        quick_answers = [r for r in test_results if r.get('time_taken', 60) < 40]
        slow_answers = [r for r in test_results if r.get('time_taken', 0) > 50]
        
        quick_accuracy = sum(1 for r in quick_answers if r.get('is_correct', False)) / max(1, len(quick_answers))
        slow_accuracy = sum(1 for r in slow_answers if r.get('is_correct', False)) / max(1, len(slow_answers))
        
        if quick_accuracy > 0.8 and slow_accuracy < 0.4:
            return 'trust_quick_instincts'
        elif slow_accuracy > 0.7:
            return 'take_time_when_needed'
        else:
            return 'medium_confidence'
    
    def analyze_performance(self, test_results: List[Dict]) -> Dict[str, Any]:
        """Comprehensive performance analysis with error handling"""
        try:
            if not test_results:
                return {"error": "No test results to analyze"}
            
            # Get marking analysis
            marking_analysis = self.calculate_marks_with_negative_grading(test_results)
            if 'error' in marking_analysis:
                return marking_analysis
            
            # Get strategy analysis
            strategy_analysis = self.analyze_strategy_effectiveness(test_results)
            if 'error' in strategy_analysis:
                strategy_analysis = {'error': 'Strategy analysis failed'}
            
            # Basic metrics
            total_questions = len(test_results)
            correct_answers = marking_analysis['answer_distribution']['correct_answers']
            skipped_questions = marking_analysis['answer_distribution']['skipped_answers']
            performance_score = marking_analysis['marking_summary']['percentage_score']
            
            # Time analysis with error handling
            response_times = []
            for result in test_results:
                if not result.get('is_skipped', False):
                    try:
                        time_val = float(result.get('time_taken', 0))
                        if 0 <= time_val <= 300:  # Reasonable time bounds
                            response_times.append(time_val)
                    except (ValueError, TypeError):
                        continue
            
            avg_time = statistics.mean(response_times) if response_times else 0
            median_time = statistics.median(response_times) if response_times else 0
            
            # Topic-wise analysis
            topic_analysis = self._analyze_topics_with_negative_marking(test_results, avg_time)
            
            # Performance trends
            time_trend = self._analyze_time_trend(test_results)
            accuracy_trend = self._analyze_accuracy_trend(test_results)
            
            # Problem areas identification
            weak_topics = sorted(
                [(topic, data) for topic, data in topic_analysis.items() 
                 if data['questions_attempted'] > 0],
                key=lambda x: x[1]['score_percentage']
            )[:3]
            
            time_consuming_topics = sorted(
                [(topic, data) for topic, data in topic_analysis.items() 
                 if data['questions_attempted'] > 0],
                key=lambda x: x[1]['average_time_seconds'],
                reverse=True
            )[:3]
            
            return {
                'test_metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'total_duration_seconds': sum(response_times),
                    'test_date': datetime.now().strftime('%Y-%m-%d'),
                    'test_time': datetime.now().strftime('%H:%M:%S'),
                    'negative_marking_enabled': True,
                    'analysis_version': '3.0'
                },
                'negative_marking_analysis': marking_analysis,
                'strategy_analysis': strategy_analysis,
                'overall_performance': {
                    'total_questions': total_questions,
                    'questions_attempted': total_questions - skipped_questions,
                    'questions_skipped': skipped_questions,
                    'correct_answers': correct_answers,
                    'incorrect_answers': total_questions - correct_answers - skipped_questions,
                    'accuracy_percentage': round((correct_answers / total_questions) * 100, 2),
                    'score_percentage': performance_score,
                    'marks_earned': marking_analysis['marking_summary']['total_marks_earned'],
                    'maximum_possible_marks': marking_analysis['marking_summary']['maximum_possible_marks'],
                    'average_time_per_question_seconds': round(avg_time, 2),
                    'median_time_per_question_seconds': round(median_time, 2),
                    'total_time_spent_seconds': round(sum(response_times), 2)
                },
                'topic_wise_analysis': topic_analysis,
                'problem_areas': {
                    'weakest_topics': [
                        {
                            'topic': topic,
                            'accuracy_percentage': data['accuracy_percentage'],
                            'score_percentage': data['score_percentage'],
                            'marks_earned': data['marks_earned'],
                            'questions_attempted': data['questions_attempted'],
                            'average_time_seconds': data['average_time_seconds'],
                            'difficulty_level': data['difficulty_assessment']
                        } for topic, data in weak_topics
                    ],
                    'most_time_consuming_topics': [
                        {
                            'topic': topic,
                            'average_time_seconds': data['average_time_seconds'],
                            'score_percentage': data['score_percentage'],
                            'questions_attempted': data['questions_attempted']
                        } for topic, data in time_consuming_topics
                    ]
                },
                'performance_trends': {
                    'time_management_trend': time_trend,
                    'accuracy_trend': accuracy_trend,
                    'consistency_score': self._calculate_consistency_score(response_times)
                },
                'recommendations': self._generate_comprehensive_recommendations(
                    performance_score, topic_analysis, avg_time, test_results, strategy_analysis
                ),
                'grade_assessment': self._calculate_comprehensive_grade(
                    performance_score, avg_time, skipped_questions, total_questions, marking_analysis
                )
            }
            
        except Exception as e:
            logger.error(f"Performance analysis failed: {e}")
            logger.error(traceback.format_exc())
            return {"error": f"Analysis failed: {str(e)}"}
    
    def _analyze_topics_with_negative_marking(self, test_results: List[Dict], avg_time: float) -> Dict[str, Any]:
        """Analyze topic-wise performance with negative marking"""
        topic_performance = defaultdict(lambda: {
            'correct': 0, 'total': 0, 'times': [], 'skipped': 0, 'marks': 0.0
        })
        
        for result in test_results:
            try:
                topic = self.categorize_question_topic(
                    result.get('question', ''),
                    result.get('pdf_reference', '')
                )
                
                topic_performance[topic]['total'] += 1
                
                if result.get('is_skipped', False):
                    topic_performance[topic]['skipped'] += 1
                else:
                    time_taken = float(result.get('time_taken', 0))
                    topic_performance[topic]['times'].append(time_taken)
                    
                    if result.get('is_correct', False):
                        topic_performance[topic]['correct'] += 1
                        topic_performance[topic]['marks'] += 1.0
                    else:
                        topic_performance[topic]['marks'] -= 1/3
                        
            except Exception as e:
                logger.warning(f"Error processing topic analysis for result: {e}")
                continue
        
        # Calculate topic metrics
        topic_analysis = {}
        for topic, data in topic_performance.items():
            try:
                attempted = data['total'] - data['skipped']
                accuracy_rate = (data['correct'] / attempted * 100) if attempted > 0 else 0
                avg_time_topic = statistics.mean(data['times']) if data['times'] else 0
                topic_score = (data['marks'] / data['total']) * 100 if data['total'] > 0 else 0
                
                topic_analysis[topic] = {
                    'accuracy_percentage': round(accuracy_rate, 2),
                    'score_percentage': round(max(-100, topic_score), 2),
                    'marks_earned': round(data['marks'], 3),
                    'questions_total': data['total'],
                    'questions_attempted': attempted,
                    'questions_skipped': data['skipped'],
                    'correct_answers': data['correct'],
                    'average_time_seconds': round(avg_time_topic, 2),
                    'difficulty_assessment': self._assess_topic_difficulty(
                        avg_time_topic, avg_time, accuracy_rate, data['marks'], data['total']
                    )
                }
            except Exception as e:
                logger.warning(f"Error calculating metrics for topic {topic}: {e}")
                continue
        
        return topic_analysis
    
    def _assess_topic_difficulty(self, topic_time: float, overall_avg: float, 
                               accuracy: float, marks: float, total_questions: int) -> str:
        """Assess topic difficulty with negative marking consideration"""
        if total_questions == 0:
            return 'insufficient_data'
        
        score_percentage = (marks / total_questions) * 100
        
        if score_percentage < -10:
            return 'very_difficult_avoid'
        elif score_percentage < 10:
            return 'difficult_risky'
        elif accuracy < 50 and topic_time > overall_avg * 1.3:
            return 'time_consuming_risky'
        elif score_percentage > 70 and topic_time < overall_avg * 0.9:
            return 'comfortable_strength'
        else:
            return 'moderate'
    
    def _analyze_time_trend(self, results: List[Dict]) -> Dict[str, Any]:
        """Analyze time management trend with better error handling"""
        try:
            non_skipped = [r for r in results if not r.get('is_skipped', False)]
            if len(non_skipped) < 3:
                return {
                    "trend": "insufficient_data",
                    "description": "Not enough answered questions for trend analysis",
                    "confidence": "low"
                }
            
            # Split into thirds
            third = len(non_skipped) // 3
            first_third = non_skipped[:third]
            last_third = non_skipped[-third:]
            
            avg_first = statistics.mean([float(r.get('time_taken', 0)) for r in first_third])
            avg_last = statistics.mean([float(r.get('time_taken', 0)) for r in last_third])
            
            change_percentage = ((avg_last - avg_first) / avg_first) * 100 if avg_first > 0 else 0
            
            if change_percentage < -15:
                trend, description = "significantly_faster", "Getting much faster as test progresses"
            elif change_percentage < -5:
                trend, description = "getting_faster", "Gradually getting faster"
            elif change_percentage > 15:
                trend, description = "significantly_slower", "Getting much slower as test progresses"
            elif change_percentage > 5:
                trend, description = "getting_slower", "Gradually getting slower"
            else:
                trend, description = "consistent", "Maintaining consistent pace"
            
            return {
                "trend": trend,
                "description": description,
                "change_percentage": round(change_percentage, 2),
                "first_third_avg_time": round(avg_first, 2),
                "last_third_avg_time": round(avg_last, 2),
                "confidence": "high" if abs(change_percentage) > 10 else "medium"
            }
            
        except Exception as e:
            logger.warning(f"Time trend analysis failed: {e}")
            return {"trend": "analysis_failed", "description": "Could not analyze time trend"}
    
    def _analyze_accuracy_trend(self, results: List[Dict]) -> Dict[str, Any]:
        """Analyze accuracy trend with improved reliability"""
        try:
            non_skipped = [r for r in results if not r.get('is_skipped', False)]
            if len(non_skipped) < 3:
                return {
                    "trend": "insufficient_data",
                    "description": "Not enough answered questions for accuracy trend analysis"
                }
            
            third = len(non_skipped) // 3
            first_third = non_skipped[:third]
            last_third = non_skipped[-third:]
            
            acc_first = sum(1 for r in first_third if r.get('is_correct', False)) / len(first_third) * 100
            acc_last = sum(1 for r in last_third if r.get('is_correct', False)) / len(last_third) * 100
            
            change = acc_last - acc_first
            
            if change > 20:
                trend, description = "significantly_improving", "Accuracy significantly improving during test"
            elif change > 10:
                trend, description = "improving", "Accuracy improving during test"
            elif change < -20:
                trend, description = "significantly_declining", "Accuracy significantly declining during test"
            elif change < -10:
                trend, description = "declining", "Accuracy declining during test"
            else:
                trend, description = "stable", "Maintaining consistent accuracy"
            
            return {
                "trend": trend,
                "description": description,
                "change_percentage": round(change, 2),
                "first_third_accuracy": round(acc_first, 2),
                "last_third_accuracy": round(acc_last, 2)
            }
            
        except Exception as e:
            logger.warning(f"Accuracy trend analysis failed: {e}")
            return {"trend": "analysis_failed", "description": "Could not analyze accuracy trend"}
    
    def _calculate_consistency_score(self, response_times: List[float]) -> float:
        """Calculate consistency score with better handling"""
        try:
            if len(response_times) < 2:
                return 0.0
            
            mean_time = statistics.mean(response_times)
            if mean_time == 0:
                return 0.0
            
            std_dev = statistics.stdev(response_times)
            coefficient_of_variation = std_dev / mean_time
            
            # Convert to 0-100 scale (lower CV = higher consistency)
            consistency = max(0, 100 - (coefficient_of_variation * 100))
            return round(consistency, 2)
            
        except Exception as e:
            logger.warning(f"Consistency calculation failed: {e}")
            return 0.0
    
    def _generate_comprehensive_recommendations(self, performance_score: float,
                                             topic_analysis: Dict, avg_time: float,
                                             test_results: List[Dict],
                                             strategy_analysis: Dict) -> Dict[str, Any]:
        """Generate comprehensive recommendations"""
        try:
            recommendations = {
                'next_difficulty_level': 'medium',
                'negative_marking_strategy': strategy_analysis.get('recommendations', []),
                'priority_focus_areas': [],
                'time_management_advice': [],
                'study_strategy': [],
                'risk_management': [],
                'immediate_actions': [],
                'long_term_goals': []
            }
            
            # Difficulty level recommendation
            attempt_rate = len([r for r in test_results if not r.get('is_skipped', False)]) / len(test_results)
            
            if performance_score >= 75 and avg_time < 45 and attempt_rate > 0.8:
                recommendations['next_difficulty_level'] = 'advanced'
            elif performance_score >= 50 and attempt_rate > 0.6:
                recommendations['next_difficulty_level'] = 'medium'
            else:
                recommendations['next_difficulty_level'] = 'easy'
            
            # Priority focus areas
            weak_topics = sorted(
                [(topic, data) for topic, data in topic_analysis.items()
                 if data['questions_attempted'] > 0],
                key=lambda x: x[1]['score_percentage']
            )[:3]
            
            for topic, data in weak_topics:
                priority_level = 'high' if data['score_percentage'] < 20 else 'medium'
                study_hours = max(2, min(10, int(8 - data['score_percentage'] / 10)))
                
                recommendations['priority_focus_areas'].append({
                    'topic': topic,
                    'score_percentage': data['score_percentage'],
                    'priority_level': priority_level,
                    'recommended_study_hours': study_hours,
                    'focus_area': 'conceptual_understanding' if data['score_percentage'] < 0 else 'practice_and_speed'
                })
            
            # Time management advice
            if avg_time > 50:
                recommendations['time_management_advice'].extend([
                    "Practice time-bound problem solving daily",
                    "Learn elimination techniques for multiple choice questions",
                    "Set target time of 45 seconds per question for practice"
                ])
            
            # Risk management based on negative marking
            incorrect_rate = sum(1 for r in test_results if not r.get('is_correct', False) and not r.get('is_skipped', False)) / len(test_results)
            
            if incorrect_rate > 0.3:
                recommendations['risk_management'].extend([
                    "High negative marking impact - practice confidence assessment",
                    "Learn to quickly identify questions outside your comfort zone",
                    "Develop systematic elimination strategies"
                ])
            
            # Study strategy
            if performance_score < 50:
                recommendations['study_strategy'].extend([
                    "Focus on fundamental concept building",
                    "Solve topic-wise questions before attempting mixed tests",
                    "Create concept summary sheets for quick revision"
                ])
            else:
                recommendations['study_strategy'].extend([
                    "Focus on advanced problem-solving techniques",
                    "Practice full-length mock tests regularly",
                    "Analyze and learn from mistake patterns"
                ])
            
            # Immediate actions
            if weak_topics:
                strongest_weak = weak_topics[0][0]
                recommendations['immediate_actions'].append(
                    f"Start intensive practice in {strongest_weak} - highest impact area"
                )
            
            # Long-term goals
            target_score = min(90, performance_score + 20)
            target_time = max(35, avg_time - 10)
            
            recommendations['long_term_goals'] = [
                f"Achieve {target_score}% score in next assessment",
                f"Reduce average time to {target_time} seconds per question",
                "Master negative marking strategy for optimal risk-reward balance"
            ]
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return {"error": "Failed to generate recommendations"}
    
    def _calculate_comprehensive_grade(self, score_percentage: float, avg_time: float,
                                     skipped_questions: int, total_questions: int,
                                     marking_analysis: Dict) -> Dict[str, Any]:
        """Calculate comprehensive grade with GATE readiness assessment"""
        try:
            base_score = max(0, score_percentage)
            
            # Calculate adjustments
            efficiency_metrics = marking_analysis.get('efficiency_metrics', {})
            negative_impact = efficiency_metrics.get('negative_impact', 0)
            attempt_rate = efficiency_metrics.get('attempt_rate', 0)
            
            # Strategy effectiveness adjustment
            if negative_impact > 15:
                strategy_penalty = -10
            elif negative_impact > 10:
                strategy_penalty = -5
            else:
                strategy_penalty = 0
            
            # Attempt rate adjustment
            if attempt_rate > 85 and base_score > 60:
                attempt_bonus = 5
            elif attempt_rate < 60:
                attempt_bonus = -5
            else:
                attempt_bonus = 0
            
            # Time management adjustment
            if avg_time < 35:
                time_bonus = 3
            elif avg_time > 55:
                time_bonus = -3
            else:
                time_bonus = 0
            
            final_score = max(0, min(100, base_score + strategy_penalty + attempt_bonus + time_bonus))
            
            # Determine grade and level
            if final_score >= 85:
                grade, level = 'A+', 'Excellent - GATE Ready'
            elif final_score >= 75:
                grade, level = 'A', 'Very Good - Strong GATE Potential'
            elif final_score >= 65:
                grade, level = 'B+', 'Good - Focused Improvement Needed'
            elif final_score >= 50:
                grade, level = 'B', 'Average - Significant Preparation Required'
            elif final_score >= 35:
                grade, level = 'C', 'Below Average - Extensive Preparation Needed'
            else:
                grade, level = 'D', 'Poor - Fundamental Revision Required'
            
            # GATE readiness assessment
            gate_readiness = self._assess_gate_readiness(final_score, marking_analysis, avg_time)
            
            return {
                'letter_grade': grade,
                'performance_level': level,
                'overall_score': round(final_score, 2),
                'gate_readiness': gate_readiness,
                'score_components': {
                    'base_score': round(base_score, 2),
                    'strategy_adjustment': strategy_penalty,
                    'attempt_rate_adjustment': attempt_bonus,
                    'time_management_adjustment': time_bonus,
                    'negative_marking_impact': round(negative_impact, 2)
                },
                'grade_explanation': self._get_grade_explanation(grade, final_score)
            }
            
        except Exception as e:
            logger.error(f"Grade calculation failed: {e}")
            return {"error": "Failed to calculate grade"}
    
    def _assess_gate_readiness(self, final_score: float, marking_analysis: Dict, avg_time: float) -> Dict[str, Any]:
        """Assess GATE exam readiness"""
        try:
            efficiency_metrics = marking_analysis.get('efficiency_metrics', {})
            attempt_rate = efficiency_metrics.get('attempt_rate', 0)
            correct_attempt_ratio = efficiency_metrics.get('correct_attempt_ratio', 0)
            
            # Readiness criteria
            if final_score >= 75 and attempt_rate > 80 and correct_attempt_ratio > 70 and avg_time < 50:
                readiness_level = "ready"
                preparation_time = "1-2 months of focused practice and mock tests"
                confidence_score = min(95, final_score * 1.1)
            elif final_score >= 60 and attempt_rate > 70 and correct_attempt_ratio > 60:
                readiness_level = "almost_ready"
                preparation_time = "3-4 months of structured preparation"
                confidence_score = min(85, final_score * 1.0)
            elif final_score >= 45 and attempt_rate > 60:
                readiness_level = "needs_improvement"
                preparation_time = "6-8 months of comprehensive preparation"
                confidence_score = min(75, final_score * 0.9)
            else:
                readiness_level = "significant_preparation_needed"
                preparation_time = "12+ months of intensive preparation required"
                confidence_score = min(60, final_score * 0.8)
            
            return {
                'readiness_level': readiness_level,
                'estimated_preparation_time': preparation_time,
                'confidence_score': round(confidence_score, 2),
                'key_strengths': self._identify_strengths(marking_analysis),
                'critical_gaps': self._identify_gaps(marking_analysis)
            }
            
        except Exception as e:
            logger.error(f"GATE readiness assessment failed: {e}")
            return {"error": "Failed to assess GATE readiness"}
    
    def _identify_strengths(self, marking_analysis: Dict) -> List[str]:
        """Identify student strengths"""
        strengths = []
        efficiency = marking_analysis.get('efficiency_metrics', {})
        
        if efficiency.get('attempt_rate', 0) > 80:
            strengths.append("Good attempt rate - not overly cautious")
        if efficiency.get('correct_attempt_ratio', 0) > 70:
            strengths.append("High accuracy on attempted questions")
        if efficiency.get('negative_impact', 100) < 10:
            strengths.append("Effective negative marking management")
        
        return strengths
    
    def _identify_gaps(self, marking_analysis: Dict) -> List[str]:
        """Identify critical gaps"""
        gaps = []
        efficiency = marking_analysis.get('efficiency_metrics', {})
        
        if efficiency.get('negative_impact', 0) > 15:
            gaps.append("High negative marking impact")
        if efficiency.get('attempt_rate', 100) < 60:
            gaps.append("Low attempt rate - too cautious")
        if efficiency.get('correct_attempt_ratio', 100) < 50:
            gaps.append("Low accuracy on attempted questions")
        
        return gaps
    
    def _get_grade_explanation(self, grade: str, score: float) -> str:
        """Get explanation for the assigned grade"""
        explanations = {
            'A+': "Outstanding performance with excellent negative marking strategy",
            'A': "Very good performance with effective test-taking approach",
            'B+': "Good performance but room for improvement in strategy or content",
            'B': "Average performance requiring focused preparation",
            'C': "Below average performance requiring significant improvement",
            'D': "Poor performance requiring fundamental concept revision"
        }
        return explanations.get(grade, "Performance assessment completed")

class TestInterface:
    """Optimized main test interface with enhanced error handling"""
    
    def __init__(self):
        self.current_question = 0
        self.test_results = []
        self.analyzer = PerformanceAnalyzer()
        self.start_time = None
        self.gemini_model = None
        self.session_id = f"gate_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def setup_gemini(self) -> bool:
        """Setup Gemini AI with improved error handling"""
        if not GEMINI_AVAILABLE:
            logger.warning("Gemini AI not available - using basic feedback")
            return False
        
        try:
            # Load environment variables
            if DOTENV_AVAILABLE:
                load_dotenv()
            
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                logger.warning("GEMINI_API_KEY not found in environment variables")
                return False
            
            genai.configure(api_key=api_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.5-flash-lite')
            
            # Test the model with a simple query
            test_response = self.gemini_model.generate_content("Test connection")
            if test_response and test_response.text:
                logger.info("Gemini AI successfully initialized")
                return True
            else:
                logger.warning("Gemini AI test failed")
                return False
                
        except Exception as e:
            logger.warning(f"Failed to setup Gemini AI: {e}")
            return False
    
    def display_question(self, question_data: Dict, question_num: int, total_questions: int):
        """Display question with improved formatting and validation"""
        try:
            print("\n" + "="*80)
            print(f"Question {question_num}/{total_questions} | Session: {self.session_id}")
            print("="*80)
            
            question_text = question_data.get('question', 'Question text not available')
            print(f"\n📝 {question_text}")
            
            options = question_data.get('options', [])
            if options:
                print("\nOptions:")
                for option in options:
                    print(f"   {option}")
            else:
                print("\n⚠️ Options not available")
            
            pdf_ref = question_data.get('pdf_reference', '')
            if pdf_ref:
                print(f"\n📖 Reference: {pdf_ref}")
            
            print("\n" + "-"*80)
            
        except Exception as e:
            logger.error(f"Error displaying question: {e}")
            print(f"\n❌ Error displaying question {question_num}")
    
    def get_user_answer(self, timer: TestTimer) -> Optional[Tuple[str, float]]:
        """Get user answer with improved input validation and error handling"""
        print(f"⏰ Time limit: {timer.duration//60} minute(s)")
        print("Enter your answer (A/B/C/D) or 'skip' to skip: ", end='', flush=True)
        
        time_up_flag = [False]  # Use list for mutable reference
        
        def time_up():
            time_up_flag[0] = True
            print(f"\n\n⏰ Time's up! Moving to next question...")
        
        timer.start(time_up)
        
        try:
            # Get user input with timeout handling
            answer = input().strip().upper()
            elapsed_time = timer.stop()
            
            # Validate input
            valid_answers = {'A', 'B', 'C', 'D', 'SKIP'}
            if answer in valid_answers:
                return answer, elapsed_time
            else:
                print(f"⚠️ Invalid input '{answer}'. Marking as skipped.")
                return 'SKIP', elapsed_time
                
        except KeyboardInterrupt:
            timer.stop()
            print("\n\n⚠️ Test interrupted by user.")
            return None, 0
        except EOFError:
            timer.stop()
            print("\n\n⚠️ Input stream ended. Marking as skipped.")
            return 'SKIP', timer.duration
        except Exception as e:
            timer.stop()
            logger.error(f"Error getting user input: {e}")
            print(f"\n⚠️ Input error. Marking as skipped.")
            return 'SKIP', timer.duration
    
    def conduct_test(self, questions: List[Dict], time_per_question: int = 1) -> List[Dict]:
        """Conduct test with comprehensive error handling and progress tracking"""
        if not questions:
            print("❌ No questions available for the test")
            return []
        
        print(f"\n🎯 Starting GATE Practice Test with Negative Marking")
        print(f"📊 Total Questions: {len(questions)}")
        print(f"⏰ Time per question: {time_per_question} minute(s)")
        print(f"📝 Marking Scheme: +1 for correct, -1/3 for incorrect, 0 for skip")
        print(f"🔄 Session ID: {self.session_id}")
        print(f"\nPress Enter to start...")
        
        try:
            input()
        except (KeyboardInterrupt, EOFError):
            print("\n❌ Test cancelled by user")
            return []
        
        self.start_time = datetime.now()
        test_results = []
        
        for i, question in enumerate(questions, 1):
            try:
                # Progress indicator
                progress = (i-1) / len(questions) * 100
                print(f"\n📊 Progress: {progress:.1f}% ({i-1}/{len(questions)} completed)")
                
                self.display_question(question, i, len(questions))
                
                timer = TestTimer(time_per_question)
                user_input = self.get_user_answer(timer)
                
                if user_input is None:  # User interrupted
                    print("\n⚠️ Test interrupted. Saving current progress...")
                    break
                
                user_answer, time_taken = user_input
                
                # Validate question data
                correct_answer = question.get('correct_answer', 'A')
                if correct_answer not in ['A', 'B', 'C', 'D']:
                    logger.warning(f"Invalid correct answer for question {i}: {correct_answer}")
                    correct_answer = 'A'
                
                # Record result with comprehensive data
                result = {
                    'question_number': i,
                    'question': question.get('question', ''),
                    'correct_answer': correct_answer,
                    'user_answer': user_answer,
                    'is_correct': user_answer == correct_answer,
                    'is_skipped': user_answer == 'SKIP',
                    'time_taken': time_taken,
                    'explanation': question.get('explanation', ''),
                    'pdf_reference': question.get('pdf_reference', ''),
                    'timestamp': datetime.now().isoformat(),
                    'options': question.get('options', [])
                }
                
                test_results.append(result)
                
                # Immediate feedback
                self._show_immediate_feedback(result, question.get('explanation', ''))
                
                # Brief pause before next question (except for last question)
                if i < len(questions):
                    print(f"\nPress Enter for next question (or Ctrl+C to end test)...")
                    try:
                        input()
                    except (KeyboardInterrupt, EOFError):
                        print("\n⚠️ Test ended by user")
                        break
                        
            except Exception as e:
                logger.error(f"Error processing question {i}: {e}")
                print(f"⚠️ Error with question {i}. Skipping...")
                continue
        
        print(f"\n🏁 Test completed! Processed {len(test_results)} questions.")
        return test_results
    
    def _show_immediate_feedback(self, result: Dict, explanation: str):
        """Show immediate feedback after each question"""
        try:
            if result['is_skipped']:
                print(f"⏭️ Question skipped")
                print(f"✅ Correct answer: {result['correct_answer']}")
            elif result['is_correct']:
                print(f"✅ Correct! (+1 mark) | Time: {result['time_taken']:.1f}s")
            else:
                print(f"❌ Incorrect (-1/3 mark) | Correct: {result['correct_answer']} | Time: {result['time_taken']:.1f}s")
            
            if explanation and len(explanation.strip()) > 0:
                print(f"💡 Explanation: {explanation}")
                
        except Exception as e:
            logger.error(f"Error showing feedback: {e}")
    
    def generate_ai_feedback(self, analysis: Dict) -> str:
        """Generate AI feedback with fallback to basic feedback"""
        if not self.gemini_model:
            return self._generate_basic_feedback(analysis)
        
        try:
            overall_perf = analysis.get('overall_performance', {})
            grade_info = analysis.get('grade_assessment', {})
            problem_areas = analysis.get('problem_areas', {})
            
            prompt = f"""
You are an expert GATE exam coach. Provide encouraging, specific feedback based on this performance:

Performance Summary:
- Score: {overall_perf.get('score_percentage', 0)}% (with negative marking)
- Accuracy: {overall_perf.get('accuracy_percentage', 0)}%
- Grade: {grade_info.get('letter_grade', 'N/A')} ({grade_info.get('performance_level', 'N/A')})
- Time Management: {overall_perf.get('average_time_per_question_seconds', 0):.1f}s per question

Weak Areas: {[topic.get('topic', '') for topic in problem_areas.get('weakest_topics', [])[:2]]}

Provide personalized, encouraging feedback in 150-200 words focusing on:
1. Positive reinforcement for strengths
2. Specific improvement areas
3. Strategy advice for negative marking
4. Motivational closing
"""
            
            response = self.gemini_model.generate_content(prompt)
            if response and response.text and len(response.text.strip()) > 50:
                return response.text.strip()
            else:
                logger.warning("AI response too short or empty, using basic feedback")
                return self._generate_basic_feedback(analysis)
                
        except Exception as e:
            logger.warning(f"AI feedback generation failed: {e}")
            return self._generate_basic_feedback(analysis)
    
    def _generate_basic_feedback(self, analysis: Dict) -> str:
        """Generate basic feedback when AI is unavailable"""
        try:
            overall_perf = analysis.get('overall_performance', {})
            grade_info = analysis.get('grade_assessment', {})
            
            score = overall_perf.get('score_percentage', 0)
            grade = grade_info.get('letter_grade', 'N/A')
            
            feedback_parts = []
            
            # Performance assessment
            if score >= 75:
                feedback_parts.append("🎉 Excellent performance! You're demonstrating strong GATE readiness.")
            elif score >= 60:
                feedback_parts.append("👍 Good performance! You're on the right track with focused improvement needed.")
            elif score >= 40:
                feedback_parts.append("📚 Decent foundation, but significant preparation required for GATE success.")
            else:
                feedback_parts.append("🔄 Keep practicing! Focus on fundamental concept building and strategic preparation.")
            
            # Grade context
            feedback_parts.append(f"Your overall grade is {grade}.")
            
            # Strategy advice
            negative_impact = analysis.get('negative_marking_analysis', {}).get('efficiency_metrics', {}).get('negative_impact', 0)
            if negative_impact > 15:
                feedback_parts.append("Focus on improving negative marking strategy - consider being more selective.")
            
            # Topic advice
            weak_topics = analysis.get('problem_areas', {}).get('weakest_topics', [])
            if weak_topics:
                topic = weak_topics[0].get('topic', 'key concepts')
                feedback_parts.append(f"Prioritize strengthening your {topic} knowledge.")
            
            return " ".join(feedback_parts)
            
        except Exception as e:
            logger.error(f"Basic feedback generation failed: {e}")
            return "Test completed successfully. Continue practicing to improve your GATE preparation."
    
    def generate_json_report(self, analysis: Dict, test_duration: str) -> Dict[str, Any]:
        """Generate comprehensive JSON report with error handling"""
        try:
            # Generate AI feedback
            ai_feedback = self.generate_ai_feedback(analysis)
            
            # Compile complete report
            json_report = {
                **analysis,  # Include all analysis data
                'report_metadata': {
                    'report_generated_at': datetime.now().isoformat(),
                    'session_id': self.session_id,
                    'test_duration': test_duration,
                    'report_version': '3.0',
                    'report_type': 'gate_practice_test_with_negative_marking',
                    'analysis_engine': 'optimized_performance_analyzer'
                },
                'ai_feedback': {
                    'personalized_message': ai_feedback,
                    'generated_by': 'gemini_ai' if self.gemini_model else 'basic_algorithm',
                    'feedback_quality': 'high' if self.gemini_model else 'standard'
                }
            }
            
            return json_report
            
        except Exception as e:
            logger.error(f"JSON report generation failed: {e}")
            return {
                "error": f"Report generation failed: {str(e)}",
                "session_id": self.session_id,
                "timestamp": datetime.now().isoformat()
            }
    
    def display_summary_report(self, json_report: Dict):
        """Display comprehensive summary with enhanced formatting"""
        try:
            if 'error' in json_report:
                print(f"\n❌ Error in report: {json_report['error']}")
                return
            
            print(f"\n📊 GATE PRACTICE TEST - PERFORMANCE SUMMARY (Negative Marking)")
            print("="*80)
            
            # Session info
            metadata = json_report.get('report_metadata', {})
            print(f"🔍 Session: {metadata.get('session_id', 'N/A')}")
            print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"⏱️ Duration: {metadata.get('test_duration', 'N/A')}")
            
            # Main performance metrics
            overall = json_report.get('overall_performance', {})
            grade = json_report.get('grade_assessment', {})
            marking = json_report.get('negative_marking_analysis', {}).get('marking_summary', {})
            
            print(f"\n🎯 OVERALL PERFORMANCE")
            print(f"Grade: {grade.get('letter_grade', 'N/A')} ({grade.get('performance_level', 'N/A')})")
            print(f"Final Score: {overall.get('score_percentage', 0)}% (with negative marking)")
            print(f"Raw Accuracy: {overall.get('accuracy_percentage', 0)}%")
            print(f"Marks: {marking.get('total_marks_earned', 0):.2f}/{marking.get('maximum_possible_marks', 0)}")
            print(f"Average Time: {overall.get('average_time_per_question_seconds', 0):.1f}s per question")
            
            # Negative marking analysis
            print(f"\n💡 NEGATIVE MARKING IMPACT")
            print(f"Positive Marks: +{marking.get('positive_marks', 0):.2f}")
            print(f"Negative Marks: -{marking.get('negative_marks', 0):.2f}")
            print(f"Net Score Impact: {marking.get('net_score_impact', 0):.2f}")
            
            # Strategy analysis
            strategy = json_report.get('strategy_analysis', {})
            if strategy.get('current_performance'):
                current = strategy['current_performance']
                print(f"\n🎯 STRATEGY ANALYSIS")
                print(f"Current Strategy: {current.get('strategy_type', 'N/A').replace('_', ' ').title()}")
                
                alternatives = strategy.get('alternative_strategies', {})
                if 'conservative' in alternatives:
                    conservative = alternatives['conservative']
                    print(f"Conservative Alternative: {conservative.get('marks', 0):.2f} marks ({conservative.get('difference', 0):+.2f})")
            
            # GATE readiness
            gate_readiness = grade.get('gate_readiness', {})
            if gate_readiness:
                print(f"\n🚀 GATE READINESS ASSESSMENT")
                readiness_level = gate_readiness.get('readiness_level', 'unknown').replace('_', ' ').title()
                print(f"Readiness Level: {readiness_level}")
                print(f"Estimated Preparation Time: {gate_readiness.get('estimated_preparation_time', 'N/A')}")
                print(f"Confidence Score: {gate_readiness.get('confidence_score', 0):.1f}%")
            
            # Focus areas
            problem_areas = json_report.get('problem_areas', {})
            weak_topics = problem_areas.get('weakest_topics', [])
            if weak_topics:
                print(f"\n🎯 PRIORITY FOCUS AREAS")
                for i, topic in enumerate(weak_topics[:3], 1):
                    topic_name = topic.get('topic', 'Unknown').replace('_', ' ').title()
                    score = topic.get('score_percentage', 0)
                    accuracy = topic.get('accuracy_percentage', 0)
                    print(f"{i}. {topic_name}: {score:.1f}% score, {accuracy:.1f}% accuracy")
            
            # Recommendations
            recommendations = json_report.get('recommendations', {})
            next_level = recommendations.get('next_difficulty_level', 'medium')
            print(f"\n🔄 NEXT STEPS")
            print(f"Recommended Difficulty: {next_level.upper()}")
            
            # Risk management advice
            risk_advice = recommendations.get('risk_management', [])
            if risk_advice:
                print(f"\n⚠️ RISK MANAGEMENT TIPS")
                for tip in risk_advice[:2]:
                    print(f"• {tip}")
            
            # AI Feedback
            ai_feedback = json_report.get('ai_feedback', {})
            if ai_feedback.get('personalized_message'):
                print(f"\n🤖 PERSONALIZED FEEDBACK")
                print(f"{ai_feedback['personalized_message']}")
                print(f"(Generated by: {ai_feedback.get('generated_by', 'system')})")
            
        except Exception as e:
            logger.error(f"Error displaying summary: {e}")
            print(f"\n❌ Error displaying summary report")
    
    def save_json_results(self, test_results: List[Dict], json_report: Dict) -> str:
        """Save results with comprehensive error handling and backup"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Prepare complete data structure
            complete_results = {
                'session_info': {
                    'session_id': self.session_id,
                    'timestamp': timestamp,
                    'export_version': '3.0',
                    'test_type': 'gate_practice_with_negative_marking',
                    'total_questions': len(test_results),
                    'completion_status': 'completed' if test_results else 'incomplete'
                },
                'raw_test_data': test_results,
                'performance_analysis': json_report
            }
            
            # Create results directory if it doesn't exist
            results_dir = Path('test_results')
            results_dir.mkdir(exist_ok=True)
            
            # Save main results file
            results_file = results_dir / f"gate_test_results_{timestamp}.json"
            
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(complete_results, f, indent=2, ensure_ascii=False)
            
            # Create backup file
            backup_file = results_dir / f"backup_gate_test_{timestamp}.json"
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(complete_results, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Results saved: {results_file}")
            logger.info(f"Backup created: {backup_file}")
            
            return str(results_file)
            
        except Exception as e:
            logger.error(f"Failed to save results: {e}")
            logger.error(traceback.format_exc())
            
            # Emergency save to current directory
            try:
                emergency_file = f"emergency_results_{timestamp}.json"
                with open(emergency_file, 'w', encoding='utf-8') as f:
                    json.dump({'test_results': test_results, 'error': str(e)}, f, indent=2)
                logger.info(f"Emergency save completed: {emergency_file}")
                return emergency_file
            except Exception as emergency_error:
                logger.error(f"Emergency save also failed: {emergency_error}")
                return ""

def validate_pdf_files(pdf_files: List[str]) -> List[str]:
    """Validate and filter existing PDF files"""
    valid_files = []
    for pdf_file in pdf_files:
        pdf_path = Path(pdf_file)
        if pdf_path.exists() and pdf_path.suffix.lower() == '.pdf':
            valid_files.append(str(pdf_path))
        else:
            logger.warning(f"PDF file not found or invalid: {pdf_file}")
    
    return valid_files

def main():
    """Main function with comprehensive error handling"""
    parser = argparse.ArgumentParser(
        description="Optimized GATE Practice Test Interface with Negative Marking",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test_interface.py document1.pdf --difficulty medium --questions 10 --json-only
  python test_interface.py notes1.pdf notes2.pdf --difficulty advanced --questions 20 --time-per-question 1
  python test_interface.py chapter.pdf --difficulty easy --questions 5 --output-format both

Prerequisites:
  1. Ensure question_generator.py is in the same directory
  2. Create .env file with GEMINI_API_KEY for AI feedback (optional)
  3. Install required packages: pip install -r requirements.txt

Note: This version includes GATE-style negative marking (-1/3 for incorrect answers)
"""
    )
    
    parser.add_argument(
        "pdf_files",
        nargs="+",
        help="PDF file paths to generate questions from"
    )
    
    parser.add_argument(
        "--difficulty",
        choices=["easy", "medium", "advanced"],
        default="medium",
        help="Question difficulty level (default: medium)"
    )
    
    parser.add_argument(
        "--questions",
        type=int,
        default=10,
        help="Number of questions for the test (default: 10)"
    )
    
    parser.add_argument(
        "--time-per-question",
        type=int,
        default=1,
        help="Time limit per question in minutes (default: 1)"
    )
    
    parser.add_argument(
        "--output-format",
        choices=["console", "json", "both"],
        default="both",
        help="Output format (default: both)"
    )
    
    parser.add_argument(
        "--json-only",
        action="store_true",
        help="Return only JSON output without console summary"
    )
    
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Don't save results to files"
    )
    
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging"
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Validate PDF files
        valid_pdf_files = validate_pdf_files(args.pdf_files)
        if not valid_pdf_files:
            error_msg = "No valid PDF files found"
            if args.json_only:
                print(json.dumps({"error": error_msg}, indent=2))
            else:
                print(f"❌ {error_msg}")
            return 1
        
        # Initialize test interface
        test_interface = TestInterface()
        gemini_available = test_interface.setup_gemini()
        
        if not args.json_only:
            print("🚀 GATE Practice Test System with Negative Marking")
            print("="*60)
            print(f"📚 Generating questions from {len(valid_pdf_files)} PDF file(s)...")
            if gemini_available:
                print("🤖 AI feedback enabled")
            else:
                print("🔧 Using standard feedback (AI unavailable)")
        
        # Generate questions
        try:
            result = generate_questions(
                valid_pdf_files,
                args.difficulty,
                args.questions,
                save_files=False
            )
        except Exception as e:
            error_msg = f"Question generation failed: {str(e)}"
            logger.error(error_msg)
            if args.json_only:
                print(json.dumps({"error": error_msg}, indent=2))
            else:
                print(f"❌ {error_msg}")
            return 1
        
        if not result.get("success", False):
            error_msg = f"Failed to generate questions: {result.get('error', 'Unknown error')}"
            if args.json_only:
                print(json.dumps({"error": error_msg}, indent=2))
            else:
                print(f"❌ {error_msg}")
            return 1
        
        questions = result.get("questions", [])
        if not questions:
            error_msg = "No questions were generated"
            if args.json_only:
                print(json.dumps({"error": error_msg}, indent=2))
            else:
                print(f"❌ {error_msg}")
            return 1
        
        if not args.json_only:
            print(f"✅ Generated {len(questions)} questions")
        
        # Conduct the test
        test_start = datetime.now()
        test_results = test_interface.conduct_test(questions, args.time_per_question)
        test_end = datetime.now()
        
        if not test_results:
            error_msg = "Test was not completed or no results generated"
            if args.json_only:
                print(json.dumps({"error": error_msg}, indent=2))
            else:
                print(f"❌ {error_msg}")
            return 1
        
        test_duration = str(test_end - test_start).split('.')[0]
        
        if not args.json_only:
            print(f"\n🏁 Test Completed!")
            print(f"⏱️ Duration: {test_duration}")
            print(f"📝 Questions Completed: {len(test_results)}")
            print(f"\n🔍 Analyzing performance...")
        
        # Analyze performance
        analysis = test_interface.analyzer.analyze_performance(test_results)
        
        if 'error' in analysis:
            error_msg = f"Performance analysis failed: {analysis['error']}"
            if args.json_only:
                print(json.dumps({"error": error_msg}, indent=2))
            else:
                print(f"❌ {error_msg}")
            return 1
        
        # Generate JSON report
        json_report = test_interface.generate_json_report(analysis, test_duration)
        
        # Output results based on format preference
        if args.json_only or args.output_format == "json":
            print(json.dumps(json_report, indent=2, ensure_ascii=False))
        elif args.output_format == "console":
            test_interface.display_summary_report(json_report)
        else:  # both
            test_interface.display_summary_report(json_report)
            if not args.json_only:
                print(f"\n📄 Complete JSON Report:")
                print("-"*50)
            print(json.dumps(json_report, indent=2, ensure_ascii=False))
        
        # Save results
        if not args.no_save:
            if not args.json_only:
                print(f"\n💾 Saving results...")
            
            results_file = test_interface.save_json_results(test_results, json_report)
            if results_file:
                if not args.json_only:
                    print(f"✅ Results saved to: {results_file}")
            else:
                if not args.json_only:
                    print(f"⚠️ Failed to save results")
        
        # Final summary for console output
        if not args.json_only:
            overall_perf = json_report.get('overall_performance', {})
            grade_info = json_report.get('grade_assessment', {})
            
            print(f"\n📊 QUICK SUMMARY")
            print(f"🎯 Grade: {grade_info.get('letter_grade', 'N/A')}")
            print(f"📈 Score: {overall_perf.get('score_percentage', 0):.1f}% (with negative marking)")
            print(f"📊 Accuracy: {overall_perf.get('accuracy_percentage', 0):.1f}%")
            print(f"⏱️ Avg Time: {overall_perf.get('average_time_per_question_seconds', 0):.1f}s")
            
            next_level = json_report.get('recommendations', {}).get('next_difficulty_level', 'medium')
            print(f"🔄 Next Level: {next_level.upper()}")
            
            weak_topics = json_report.get('problem_areas', {}).get('weakest_topics', [])
            if weak_topics:
                topic_name = weak_topics[0].get('topic', 'key concepts').replace('_', ' ').title()
                print(f"📚 Focus on: {topic_name}")
        
        return 0
        
    except KeyboardInterrupt:
        if not args.json_only:
            print(f"\n⚠️ Test interrupted by user")
        else:
            print(json.dumps({"error": "Test interrupted by user"}, indent=2))
        return 1
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        
        if args.json_only:
            print(json.dumps({"error": error_msg}, indent=2))
        else:
            print(f"❌ {error_msg}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
