import argparse
import os
import time
import json
import re
import logging
import google.generativeai as genai
from PyPDF2 import PdfReader
import pdfplumber
from nltk.tokenize import sent_tokenize
from tqdm import tqdm
from dotenv import load_dotenv
import nltk
from typing import Dict, List, Optional, Any
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def download_nltk_data():
    """Download required NLTK data with error handling"""
    nltk_downloads = ['punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger']
    for item in nltk_downloads:
        try:
            nltk.data.find(f'tokenizers/{item}')
        except LookupError:
            try:
                logger.info(f"Downloading NLTK {item}...")
                nltk.download(item, quiet=True)
            except Exception as e:
                logger.warning(f"Failed to download NLTK {item}: {e}")

def configure_gemini_with_retry():
    """Configure Gemini API with retry logic and multiple model fallbacks"""
    load_dotenv()
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY not found. Please ensure you have:\n"
            "1. Created a .env file in the same directory as this script\n"
            "2. Added your API key: GEMINI_API_KEY=your_api_key_here\n"
            "3. Make sure the .env file is in the correct location"
        )
    
    # Configure Gemini with safety settings and generation config
    genai.configure(api_key=api_key)
    
    # List of Gemini models to try in order of preference
    models_to_try = [
        {
            'name': 'gemini-2.5-flash-lite',
            'description': 'Gemini 1.5 Pro - Best for complex reasoning',
            'rate_limit_delay': 1.0
        },
        {
            'name': 'gemini-1.5-flash', 
            'description': 'Gemini 1.5 Flash - Faster responses',
            'rate_limit_delay': 2.0
        },
        {
            'name': 'gemini-pro',
            'description': 'Gemini Pro - Reliable baseline',
            'rate_limit_delay': 1.5
        },
        {
            'name': 'gemini-1.0-pro',
            'description': 'Gemini 1.0 Pro - Legacy fallback',
            'rate_limit_delay': 2.0
        },
        {
            'name':'gemini-2.5',
            'description':"Gemini 2.5 pro",
            'rate_limit_delay':1
        }
    ]
    
    # Safety settings to avoid blocking
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH", 
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]
    
    # Generation configuration for better outputs
    generation_config = {
        "temperature": 0.4,
        "top_p": 0.8,
        "top_k": 40,
        "max_output_tokens": 2048,
        # "response_mime_type": "text/plain",
    }
    
    for model_info in models_to_try:
        try:
            logger.info(f"Trying model: {model_info['name']} - {model_info['description']}")
            
            model = genai.GenerativeModel(
                model_name=model_info['name'],
                safety_settings=safety_settings,
                generation_config=generation_config
            )
            
            # Test the model with a simple request
            test_response = model.generate_content(
                "Generate a simple test question: What is 2+2?",
                request_options={"timeout": 30}
            )
            
            if test_response and test_response.text:
                logger.info(f"Successfully initialized model: {model_info['name']}")
                return model, model_info
            else:
                logger.warning(f"Model {model_info['name']} returned empty response")
                continue
                
        except Exception as e:
            logger.warning(f"Model {model_info['name']} failed: {str(e)[:150]}...")
            continue
    
    raise ValueError("All Gemini models failed to initialize. Check your API key, quota, and internet connection.")

def advanced_pdf_extraction(file_path: str) -> str:
    """Enhanced PDF text extraction with multiple methods and error handling"""
    logger.info(f"Processing PDF: {file_path}")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    extracted_text = ""
    
    # Method 1: Try pdfplumber first (best for complex layouts)
    try:
        with pdfplumber.open(file_path) as pdf:
            logger.info(f"Using pdfplumber for {file_path}")
            for page_num, page in enumerate(pdf.pages):
                try:
                    # Extract text with layout preservation
                    page_text = page.extract_text(layout=True, x_tolerance=2, y_tolerance=2)
                    if page_text and page_text.strip():
                        extracted_text += f"\n=== Page {page_num + 1} ===\n{page_text}\n"
                    
                    # Extract tables separately if present
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if table and len(table) > 0:
                            table_text = f"\n[Table {table_idx + 1} - Page {page_num + 1}]\n"
                            for row in table:
                                if row and any(cell for cell in row):
                                    clean_row = [str(cell).strip() if cell else "" for cell in row]
                                    table_text += " | ".join(clean_row) + "\n"
                            extracted_text += table_text + "\n"
                            
                except Exception as page_error:
                    logger.warning(f"Error processing page {page_num + 1}: {page_error}")
                    continue
        
        if extracted_text.strip():
            logger.info(f"Successfully extracted {len(extracted_text)} characters with pdfplumber")
            return preprocess_text_content(extracted_text)
            
    except Exception as e:
        logger.warning(f"pdfplumber failed for {file_path}: {e}")
    
    # Method 2: Fallback to PyPDF2
    try:
        logger.info(f"Falling back to PyPDF2 for {file_path}")
        with open(file_path, 'rb') as file:
            reader = PdfReader(file)
            for page_num, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        extracted_text += f"\n=== Page {page_num + 1} ===\n{page_text}\n"
                except Exception as page_error:
                    logger.warning(f"Error extracting page {page_num + 1}: {page_error}")
                    continue
        
        if extracted_text.strip():
            logger.info(f"Extracted {len(extracted_text)} characters with PyPDF2")
            return preprocess_text_content(extracted_text)
            
    except Exception as e:
        logger.error(f"PyPDF2 also failed for {file_path}: {e}")
    
    raise ValueError(f"Failed to extract text from {file_path} using all available methods")

def preprocess_text_content(text: str) -> str:
    """Advanced text preprocessing with cleaning and organization"""
    if not text or not text.strip():
        return ""
    
    download_nltk_data()
    
    # Basic cleaning
    text = re.sub(r'\n+', '\n', text)  # Multiple newlines to single
    text = re.sub(r'\s+', ' ', text)   # Multiple spaces to single
    text = re.sub(r'[^\w\s\.\,\;\:\!\?\(\)\[\]\-\+\=\<\>\%\$\°\™\®]', ' ', text)  # Clean special chars
    
    # Remove common PDF artifacts
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        # Skip likely headers/footers and page numbers
        if (len(line) < 5 or 
            re.match(r'^(page|chapter|\d+|©|\s*\d+\s*)$', line.lower()) or
            re.match(r'^\d+$', line) or
            'copyright' in line.lower() or
            len(line.split()) < 2):
            continue
        cleaned_lines.append(line)
    
    # Rejoin and final cleaning
    cleaned_text = '\n'.join(cleaned_lines)
    cleaned_text = re.sub(r'\n\s*\n', '\n\n', cleaned_text)  # Clean double newlines
    
    return cleaned_text.strip()

def extract_concepts_with_retry(text: str, model: Any, model_info: Dict, max_retries: int = 3) -> str:
    """Extract concepts with retry logic and error handling"""
    
    # Truncate text if too long to avoid token limits
    max_chars = 8000  # Conservative limit for Gemini
    if len(text) > max_chars:
        text = text[:max_chars] + "...[Content truncated for processing]"
    
    concept_prompt = f"""
    Analyze this technical content from a PDF and extract ONLY the specific concepts, principles, formulas, and topics that are explicitly present.
    
    For each concept found, provide:
    1. The exact concept name as mentioned in the text
    2. Key technical details, formulas, or parameters mentioned
    3. Any specific examples, applications, or case studies from the text
    4. Mathematical relationships or equations present with exact values
    5. Specific numerical values, ranges, or specifications mentioned
    
    IMPORTANT: Use ONLY content explicitly present in the text. Do not add external knowledge.
    
    Format your response as:
    CONCEPT 1: [Name]
    - Details: [Specific technical details from text]
    - Formulas: [Any mathematical content with exact notation]
    - Applications: [Specific applications mentioned in text]
    - Values: [Numerical data, specifications, ranges]
    - Examples: [Specific examples from the text]
    
    CONCEPT 2: [Name]
    - Details: [Specific technical details from text]
    ...and so on
    
    Text to analyze:
    {text}
    """
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Extracting concepts (attempt {attempt + 1}/{max_retries})")
            
            response = model.generate_content(
                concept_prompt,
                request_options={"timeout": 60}
            )
            
            if response and response.text and len(response.text.strip()) > 50:
                logger.info(f"Successfully extracted concepts ({len(response.text)} characters)")
                return response.text.strip()
            else:
                logger.warning(f"Empty or short response on attempt {attempt + 1}")
                
        except Exception as e:
            logger.warning(f"Concept extraction attempt {attempt + 1} failed: {str(e)[:100]}...")
            if attempt < max_retries - 1:
                wait_time = model_info.get('rate_limit_delay', 2.0) * (attempt + 1)
                logger.info(f"Waiting {wait_time} seconds before retry...")
                time.sleep(wait_time)
    
    # Fallback: Create basic concepts from text analysis
    logger.info("Using fallback concept extraction")
    return create_fallback_concepts(text)

def create_fallback_concepts(text: str) -> str:
    """Create basic concepts when AI extraction fails"""
    try:
        download_nltk_data()
        from nltk.corpus import stopwords
        from collections import Counter
        
        # Extract potential technical terms
        words = re.findall(r'\b[A-Za-z]{4,}\b', text.lower())
        stop_words = set(stopwords.words('english'))
        technical_words = [word for word in words if word not in stop_words]
        
        # Get most common terms
        word_freq = Counter(technical_words)
        top_terms = word_freq.most_common(10)
        
        # Extract numerical data
        numbers = re.findall(r'\b\d+(?:\.\d+)?(?:\s*[%°]|\s*(?:mm|cm|m|km|kg|g|Hz|kHz|MHz|GHz|V|A|W|J|N|Pa))\b', text)
        
        # Create basic concept structure
        concepts = []
        for i, (term, freq) in enumerate(top_terms[:5], 1):
            concepts.append(f"""CONCEPT {i}: {term.title()}
- Details: Technical term appearing {freq} times in the document
- Formulas: [Extract from context analysis]
- Applications: [Based on document context]
- Values: {', '.join(numbers[:3]) if numbers else 'No specific values found'}
- Examples: [Contextual examples from document]""")
        
        return '\n\n'.join(concepts)
        
    except Exception as e:
        logger.error(f"Fallback concept creation failed: {e}")
        return "CONCEPT 1: General Technical Content\n- Details: Content extracted from PDF document\n- Applications: Technical/Engineering domain"

def generate_gate_questions_with_retry(concepts: str, text_context: str, previous_questions: List[Dict], 
                                     model: Any, model_info: Dict, difficulty: str, 
                                     num_questions: int = 3, max_retries: int = 3) -> str:
    """Generate GATE level questions with comprehensive retry logic"""
    
    difficulty_contexts = {
        "easy": "undergraduate level focusing on basic application of concepts from the provided text",
        "medium": "GATE level with moderate complexity using specific concepts, formulas, and data from the text", 
        "advanced": "advanced GATE level with complex scenarios using detailed technical content from the text"
    }
    
    previous_context = ""
    if previous_questions:
        previous_context = f"""
Previous questions in this set for interconnection:
{chr(10).join([f"Q{i+1}: {q['question'][:80]}..." for i, q in enumerate(previous_questions[-2:])])}

Make sure new questions build upon or relate to these concepts logically.
"""
    
    gate_prompt = f"""You are an expert GATE (Graduate Aptitude Test in Engineering) question creator.

{previous_context}

EXTRACTED CONCEPTS FROM PDF:
{concepts[:2000]}...

CONTEXT FROM PDF:
{text_context[:1000]}...

Create {num_questions} GATE-style multiple choice questions at {difficulty_contexts[difficulty]} that:

STRICT REQUIREMENTS:
1. Use ONLY concepts, formulas, values, and technical details from the PDF content above
2. Present practical engineering scenarios requiring problem-solving
3. Include numerical calculations using specific values from the PDF when possible
4. Test conceptual understanding through application scenarios
5. Create questions that build upon each other logically
6. Make questions require analysis and reasoning, not memorization

QUESTION FORMAT (VERY IMPORTANT):
Q1: [Engineering scenario using specific PDF concepts - be detailed and technical]
A) [Technically accurate option based on PDF content]
B) [Plausible alternative based on PDF content] 
C) [Another technically sound option]
D) [Common misconception or incorrect calculation]
Correct: [A/B/C/D]
Explanation: [Why correct based on PDF content and technical reasoning]
PDF_Source: [Which specific concept from PDF this tests]

Q2: [Build on Q1 or related concept from PDF]
A) [Option based on PDF]
B) [Alternative from PDF]
C) [Another option]
D) [Incorrect but plausible]
Correct: [A/B/C/D]
Explanation: [Technical justification]
PDF_Source: [PDF concept reference]

Continue this exact format for all {num_questions} questions.
Each question must be technically sound and based on the PDF content.
"""
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Generating questions (attempt {attempt + 1}/{max_retries})")
            
            response = model.generate_content(
                gate_prompt,
                request_options={"timeout": 90}
            )
            
            if response and response.text and len(response.text.strip()) > 200:
                # Quick validation - check if it contains questions
                if 'Q1:' in response.text and 'Correct:' in response.text:
                    logger.info(f"✅ Successfully generated questions ({len(response.text)} characters)")
                    return response.text.strip()
                else:
                    logger.warning(f"Generated text doesn't contain proper question format on attempt {attempt + 1}")
            else:
                logger.warning(f"Empty or short response on attempt {attempt + 1}")
                
        except Exception as e:
            logger.warning(f"Question generation attempt {attempt + 1} failed: {str(e)[:100]}...")
            
        if attempt < max_retries - 1:
            wait_time = model_info.get('rate_limit_delay', 2.0) * (attempt + 1)
            logger.info(f"Waiting {wait_time} seconds before retry...")
            time.sleep(wait_time)
    
    logger.warning("All question generation attempts failed, using fallback")
    return create_fallback_questions(concepts, difficulty, num_questions)

def create_fallback_questions(concepts: str, difficulty: str, num_questions: int) -> str:
    """Create basic questions when AI generation fails"""
    fallback_questions = []
    
    for i in range(min(num_questions, 3)):
        fallback_questions.append(f"""Q{i+1}: Based on the technical concepts in the document, which of the following represents a key principle or application mentioned in the content?
A) First technical approach based on document content
B) Second approach mentioned in the materials  
C) Third method described in the text
D) Alternative technique not covered in the document
Correct: A
Explanation: This represents the primary approach discussed in the PDF content
PDF_Source: General technical concepts from document""")
    
    return '\n\n'.join(fallback_questions)

def parse_questions_robust(output: str) -> List[Dict[str, Any]]:
    """Robust question parsing with multiple fallback methods"""
    questions = []
    if not output or not output.strip():
        logger.warning("Empty output for question parsing")
        return questions
    
    # Method 1: Standard parsing
    try:
        question_blocks = re.split(r'Q\d+:', output)[1:]
        
        for i, block in enumerate(question_blocks):
            if not block.strip():
                continue
                
            lines = [line.strip() for line in block.strip().split('\n') if line.strip()]
            if len(lines) < 6:  # Need question + 4 options + answer minimum
                continue
                
            try:
                question = lines[0].strip()
                options = []
                correct_answer = ""
                explanation = ""
                pdf_reference = ""
                
                for line in lines[1:]:
                    if re.match(r'^[A-D]\)', line):
                        options.append(line)
                    elif line.startswith('Correct:'):
                        correct_answer = line.split(':', 1)[1].strip()
                    elif line.startswith('Explanation:'):
                        explanation = line.split(':', 1)[1].strip()
                    elif line.startswith('PDF_Source:'):
                        pdf_reference = line.split(':', 1)[1].strip()
                
                if len(options) == 4 and question and correct_answer:
                    questions.append({
                        'question': question,
                        'options': options,
                        'correct_answer': correct_answer,
                        'explanation': explanation,
                        'pdf_reference': pdf_reference,
                        'question_number': len(questions) + 1
                    })
                    
            except Exception as e:
                logger.warning(f"Error parsing question block {i+1}: {e}")
                continue
                
    except Exception as e:
        logger.error(f"Standard question parsing failed: {e}")
    
    # Method 2: Alternative parsing if first method fails
    if not questions:
        logger.info("Trying alternative parsing method")
        try:
            # Look for any Q followed by number pattern
            question_matches = re.finditer(r'Q\d+:([^Q]+)(?=Q\d+:|$)', output, re.DOTALL)
            
            for match in question_matches:
                block = match.group(1).strip()
                lines = [line.strip() for line in block.split('\n') if line.strip()]
                
                if len(lines) >= 5:  # Minimum viable question
                    question = lines[0]
                    options = [line for line in lines if re.match(r'^[A-D]\)', line)]
                    
                    if len(options) >= 2:  # At least some options
                        # Fill missing options
                        while len(options) < 4:
                            options.append(f"{chr(65 + len(options))}) Additional option")
                            
                        questions.append({
                            'question': question,
                            'options': options[:4],
                            'correct_answer': 'A',  # Default
                            'explanation': 'Generated from PDF content',
                            'pdf_reference': 'Document analysis',
                            'question_number': len(questions) + 1
                        })
                        
        except Exception as e:
            logger.error(f"Alternative parsing also failed: {e}")
    
    logger.info(f"Successfully parsed {len(questions)} questions")
    return questions

def create_question_series_robust(concepts: str, all_text: str, model: Any, model_info: Dict, 
                                difficulty: str, total_questions: int = 10) -> List[Dict[str, Any]]:
    """Create question series with robust error handling"""
    all_questions = []
    max_attempts_per_batch = 3
    questions_per_batch = 3
    
    # Calculate batches needed
    batches_needed = (total_questions + questions_per_batch - 1) // questions_per_batch
    
    for batch_num in range(batches_needed):
        remaining_questions = min(questions_per_batch, total_questions - len(all_questions))
        if remaining_questions <= 0:
            break
            
        logger.info(f"Processing batch {batch_num + 1}/{batches_needed} - {remaining_questions} questions")
        
        batch_success = False
        for attempt in range(max_attempts_per_batch):
            try:
                output = generate_gate_questions_with_retry(
                    concepts,
                    all_text,
                    all_questions,  # Previous questions for context
                    model,
                    model_info,
                    difficulty,
                    remaining_questions
                )
                
                new_questions = parse_questions_robust(output)
                
                if new_questions:
                    all_questions.extend(new_questions)
                    batch_success = True
                    logger.info(f"✅ Batch {batch_num + 1} successful: {len(new_questions)} questions")
                    break
                else:
                    logger.warning(f"Batch {batch_num + 1} attempt {attempt + 1} produced no valid questions")
                    
            except Exception as e:
                logger.error(f"Batch {batch_num + 1} attempt {attempt + 1} failed: {e}")
                
            if attempt < max_attempts_per_batch - 1:
                wait_time = model_info.get('rate_limit_delay', 2.0) * (attempt + 1)
                time.sleep(wait_time)
        
        if not batch_success:
            logger.warning(f"Batch {batch_num + 1} failed completely, continuing with next batch")
        
        # Rate limiting between batches
        if batch_num < batches_needed - 1:
            time.sleep(model_info.get('rate_limit_delay', 2.0))
        
        # Stop early if we have enough questions
        if len(all_questions) >= total_questions:
            break
    
    return all_questions[:total_questions]

def generate_questions(pdf_paths: List[str], difficulty: str, total_questions: int = 15, save_files: bool = False) -> Dict[str, Any]:
    """Main function with comprehensive error handling and bug fixes"""
    
    # Input validation
    if not pdf_paths:
        return {
            "success": False,
            "error": "No PDF files provided",
            "questions": []
        }
    
    if difficulty not in ['easy', 'medium', 'advanced']:
        return {
            "success": False,
            "error": f"Invalid difficulty: {difficulty}. Must be 'easy', 'medium', or 'advanced'",
            "questions": []
        }
    
    if total_questions < 1 or total_questions > 50:
        return {
            "success": False,
            "error": "Total questions must be between 1 and 50",
            "questions": []
        }
    
    # Initialize model
    try:
        model, model_info = configure_gemini_with_retry()
        logger.info(f"Using model: {model_info['name']} - {model_info['description']}")
    except Exception as e:
        logger.error(f"Model initialization failed: {e}")
        return {
            "success": False,
            "error": f"Failed to initialize Gemini model: {str(e)}",
            "questions": []
        }
    
    # Process PDF files
    all_text = ""
    processed_files = []
    processing_errors = []
    
    for pdf_path in pdf_paths:
        try:
            extracted_text = advanced_pdf_extraction(pdf_path)
            if extracted_text and extracted_text.strip():
                all_text += f"\n\n=== Content from {pdf_path} ===\n\n{extracted_text}"
                processed_files.append(pdf_path)
                logger.info(f"✅ Successfully processed: {pdf_path}")
            else:
                error_msg = f"No text extracted from {pdf_path}"
                processing_errors.append(error_msg)
                logger.warning(error_msg)
        except Exception as e:
            error_msg = f"Failed to process {pdf_path}: {str(e)}"
            processing_errors.append(error_msg)
            logger.error(error_msg)
    
    if not all_text.strip():
        return {
            "success": False,
            "error": f"No text extracted from any PDF files. Errors: {'; '.join(processing_errors)}",
            "questions": []
        }
    
    # Extract concepts
    try:
        logger.info("Extracting concepts from PDF content...")
        concepts = extract_concepts_with_retry(all_text, model, model_info)
        
        if not concepts or len(concepts.strip()) < 50:
            logger.warning("Concept extraction produced minimal results")
            concepts = create_fallback_concepts(all_text)
        
        logger.info(f"✅ Concepts extracted: {len(concepts)} characters")
        
    except Exception as e:
        logger.error(f"Concept extraction failed: {e}")
        concepts = create_fallback_concepts(all_text)
    
    # Generate questions
    try:
        logger.info("Generating questions...")
        question_series = create_question_series_robust(
            concepts, all_text, model, model_info, difficulty, total_questions
        )
        
        if not question_series:
            logger.error("No questions were generated")
            return {
                "success": False,
                "error": "Failed to generate any questions from the PDF content",
                "questions": []
            }
        
        logger.info(f" Successfully generated {len(question_series)} questions")
        
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        return {
            "success": False,
            "error": f"Question generation failed: {str(e)}",
            "questions": []
        }
    
    # Create result object
    result = {
        "success": True,
        "metadata": {
            "total_questions": len(question_series),
            "difficulty": difficulty,
            "processed_files": processed_files,
            "processing_errors": processing_errors,
            "model_used": model_info['name'],
            "model_description": model_info['description'],
            "generation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "extracted_concepts_preview": concepts[:500] + "..." if len(concepts) > 500 else concepts,
            "total_text_length": len(all_text)
        },
        "questions": question_series
    }
    
    # Display results
    print(f"\nGenerated {len(question_series)} questions ({difficulty} difficulty):")
    print(f"Model: {model_info['name']} - {model_info['description']}")
    print(f"Files processed: {len(processed_files)}")
    if processing_errors:
        print(f"Processing errors: {len(processing_errors)}")
    print("=" * 80)
    
    for i, q in enumerate(question_series, 1):
        print(f"\n🔢 Question {i}:")
        print(f"📝 {q['question']}")
        print()
        for option in q['options']:
            print(f"   {option}")
        print(f"\n   ✅ Correct Answer: {q['correct_answer']}")
        if q.get('explanation'):
            print(f"   💡 Explanation: {q['explanation']}")
        if q.get('pdf_reference'):
            print(f"   📖 PDF Reference: {q['pdf_reference']}")
        print("─" * 60)
    
    # Save files if requested
    if save_files and question_series:
        try:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            model_name = model_info['name'].replace('/', '_')
            
            # Save text format
            output_file = f"questions_{difficulty}_{model_name}_{timestamp}.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"Questions ({difficulty.upper()} difficulty)\n")
                f.write(f"Generated using: {model_info['name']}\n")
                f.write(f"Generation time: {result['metadata']['generation_timestamp']}\n")
                f.write(f"Files processed: {', '.join(processed_files)}\n")
                f.write("=" * 80 + "\n\n")
                
                for i, q in enumerate(question_series, 1):
                    f.write(f"Question {i}:\n")
                    f.write(f"{q['question']}\n\n")
                    for option in q['options']:
                        f.write(f"{option}\n")
                    f.write(f"\nCorrect Answer: {q['correct_answer']}\n")
                    if q.get('explanation'):
                        f.write(f"Explanation: {q['explanation']}\n")
                    if q.get('pdf_reference'):
                        f.write(f"PDF Reference: {q['pdf_reference']}\n")
                    f.write("\n" + "─" * 60 + "\n\n")
            
            # Save JSON format
            json_file = f"questions_{difficulty}_{model_name}_{timestamp}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Files saved: {output_file}, {json_file}")
            print(f"\nQuestions saved to: {output_file}")
            print(f"JSON format saved to: {json_file}")
            
        except Exception as save_error:
            logger.error(f"Failed to save files: {save_error}")
            print(f"Warning: Failed to save files: {save_error}")
    
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate  questions from PDF files using Gemini AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python question_generator.py document.pdf --difficulty medium
  python question_generator.py file1.pdf file2.pdf --difficulty advanced --total-questions 20 --save-files
  
Prerequisites:
  1. Create .env file with: GEMINI_API_KEY=your_api_key_here
  2. Install requirements: pip install -r requirements.txt
        """
    )
    
    parser.add_argument(
        "pdf_files", 
        nargs="+", 
        help="PDF file paths to process"
    )
    parser.add_argument(
        "--difficulty", 
        choices=["easy", "medium", "advanced"], 
        default="medium", 
        help="Question difficulty level (default: medium)"
    )
    parser.add_argument(
        "--total-questions", 
        type=int, 
        default=15,
        help="Total number of questions to generate (1-50, default: 15)"
    )
    parser.add_argument(
        "--save-files", 
        action="store_true",
        help="Save questions to text and JSON files"
    )
    parser.add_argument(
        "--verbose", 
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.info("Verbose logging enabled")
    
    # Validate arguments
    if args.total_questions < 1 or args.total_questions > 50:
        print("Error: Total questions must be between 1 and 50")
        exit(1)
    
    # Check if PDF files exist
    missing_files = [f for f in args.pdf_files if not os.path.exists(f)]
    if missing_files:
        print(f"Error: The following PDF files were not found:")
        for f in missing_files:
            print(f"   - {f}")
        exit(1)
    
    # Run the main function
    try:
        print(f"🚀 Starting question generation...")
        print(f"   Files: {', '.join(args.pdf_files)}")
        print(f"   Difficulty: {args.difficulty}")
        print(f"   Questions: {args.total_questions}")
        print(f"   Save files: {args.save_files}")
        
        result = generate_questions(
            args.pdf_files, 
            args.difficulty, 
            args.total_questions, 
            args.save_files
        )
        
        # Print summary
        if result["success"]:
            print(f"\n Generation Summary:")
            print(f"    Success: {result['success']}")
            print(f"   Questions Generated: {result['metadata']['total_questions']}")
            print(f"    Difficulty: {result['metadata']['difficulty']}")
            print(f"    Model: {result['metadata']['model_used']}")
            print(f"   Files Processed: {len(result['metadata']['processed_files'])}")
            if result['metadata']['processing_errors']:
                print(f"Processing Errors: {len(result['metadata']['processing_errors'])}")
            print(f"Generated: {result['metadata']['generation_timestamp']}")
        else:
            print(f"\n Generation failed: {result['error']}")
            exit(1)
            
    except KeyboardInterrupt:
        print(f"\nProcess interrupted by user")
        exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"\nUnexpected error: {e}")
        exit(1)