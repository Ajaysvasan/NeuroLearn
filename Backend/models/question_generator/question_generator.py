# question_generator.py

import argparse
import os
import time
import google.generativeai as genai
from PyPDF2 import PdfReader
from nltk.tokenize import sent_tokenize
from tqdm import tqdm


def configure_gemini():
    """Configure Gemini API with API key from environment variable"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("Please set GEMINI_API_KEY environment variable")
    
    genai.configure(api_key=api_key)
    print("🔧 Gemini API configured successfully")
    return genai.GenerativeModel('gemini-1.5-flash')


def read_pdf(file_path):
    """Extract text from PDF file"""
    print(f"\n📄 Processing PDF: {file_path}")
    try:
        reader = PdfReader(file_path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return text
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
        return ""


def chunk_text(text, max_length=2000):
    """Split text into manageable chunks for processing"""
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = []
    current_len = 0

    for sentence in sentences:
        sentence_words = len(sentence.split())
        if current_len + sentence_words <= max_length:
            current_chunk.append(sentence)
            current_len += sentence_words
        else:
            if current_chunk:  # Only add non-empty chunks
                chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_len = sentence_words

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def generate_questions(chunk, model, difficulty, num_questions=3):
    """Generate questions using Gemini API based on text chunk and difficulty"""
    
    difficulty_prompts = {
        "easy": f"""
Generate {num_questions} simple, factual multiple-choice questions based on the following text. 
Focus on basic recall and understanding. Each question should have 4 options (A, B, C, D) with one correct answer.

Format your response as:
Q1: [Question]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]

Q2: [Question]
...and so on.

Text: {chunk}
""",
        
        "medium": f"""
Generate {num_questions} moderate difficulty multiple-choice questions based on the following text.
Mix factual recall with conceptual understanding and application. Each question should have 4 options (A, B, C, D) with one correct answer.

Format your response as:
Q1: [Question]
A) [Option A]
B) [Option B]
C) [Option C] 
D) [Option D]
Correct Answer: [A/B/C/D]

Q2: [Question]
...and so on.

Text: {chunk}
""",
        
        "advanced": f"""
Generate {num_questions} challenging multiple-choice questions based on the following text.
Focus on analysis, synthesis, evaluation, and deep understanding. Each question should have 4 options (A, B, C, D) with one correct answer.

Format your response as:
Q1: [Question]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]

Q2: [Question]
...and so on.

Text: {chunk}
"""
    }
    
    try:
        prompt = difficulty_prompts[difficulty]
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating questions: {e}")
        return ""


def parse_questions(output):
    """Parse the generated questions from Gemini response"""
    questions = []
    if not output:
        return questions
    
    # Split by question markers
    question_blocks = output.split('Q')[1:]  # Skip the first empty element
    
    for block in question_blocks:
        if not block.strip():
            continue
            
        lines = block.strip().split('\n')
        if len(lines) < 6:  # Need at least question + 4 options + answer
            continue
            
        try:
            # Extract question (first line after Q number)
            question_line = lines[0]
            if ':' in question_line:
                question = question_line.split(':', 1)[1].strip()
            else:
                question = question_line.strip()
            
            # Extract options
            options = []
            correct_answer = ""
            
            for line in lines[1:]:
                line = line.strip()
                if line.startswith(('A)', 'B)', 'C)', 'D)')):
                    options.append(line)
                elif 'Correct Answer:' in line or 'Answer:' in line:
                    correct_answer = line.split(':')[-1].strip()
            
            if len(options) == 4 and question and correct_answer:
                question_dict = {
                    'question': question,
                    'options': options,
                    'correct_answer': correct_answer
                }
                questions.append(question_dict)
                
        except Exception as e:
            print(f"Error parsing question block: {e}")
            continue
    
    return questions


def main(pdf_paths, difficulty, questions_per_chunk=2):
    """Main function to process PDFs and generate questions"""
    try:
        model = configure_gemini()
    except ValueError as e:
        print(f"❌ Error: {e}")
        return
    
    all_questions = []
    
    for pdf_path in pdf_paths:
        if not os.path.exists(pdf_path):
            print(f"❌ File not found: {pdf_path}")
            continue
            
        text = read_pdf(pdf_path)
        if not text.strip():
            print(f"❌ No text extracted from {pdf_path}")
            continue
            
        chunks = chunk_text(text)
        print(f"📝 Created {len(chunks)} text chunks from {pdf_path}")
        
        for i, chunk in enumerate(tqdm(chunks, desc="🧠 Generating questions")):
            if len(chunk.split()) < 50:  # Skip very short chunks
                continue
                
            output = generate_questions(chunk, model, difficulty, questions_per_chunk)
            questions = parse_questions(output)
            all_questions.extend(questions)
            
            # Rate limiting - pause between requests
            time.sleep(1)
    
    # Display results
    print(f"\n🧠 Generated {len(all_questions)} questions ({difficulty} difficulty):\n")
    print("=" * 60)
    
    for i, q in enumerate(all_questions, 1):
        print(f"\n{i}. {q['question']}")
        for option in q['options']:
            print(f"   {option}")
        print(f"   ✅ Correct Answer: {q['correct_answer']}")
        print("-" * 40)
    
    # Optionally save to file
    if all_questions:
        output_file = f"generated_questions_{difficulty}.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"Generated Questions ({difficulty.upper()} difficulty)\n")
            f.write("=" * 60 + "\n\n")
            
            for i, q in enumerate(all_questions, 1):
                f.write(f"{i}. {q['question']}\n")
                for option in q['options']:
                    f.write(f"   {option}\n")
                f.write(f"   Correct Answer: {q['correct_answer']}\n")
                f.write("-" * 40 + "\n\n")
        
        print(f"\n💾 Questions saved to: {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate questions from PDF files using Gemini API")
    parser.add_argument("pdf_files", nargs="+", help="PDF file paths to process")
    parser.add_argument("--difficulty", choices=["easy", "medium", "advanced"], 
                       default="medium", help="Difficulty level of questions")
    parser.add_argument("--questions-per-chunk", type=int, default=2,
                       help="Number of questions to generate per text chunk")
    
    args = parser.parse_args()
    
    main(args.pdf_files, args.difficulty, args.questions_per_chunk)