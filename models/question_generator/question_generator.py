# question_generator.py

import argparse
import os
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
from PyPDF2 import PdfReader
from nltk.tokenize import sent_tokenize
from tqdm import tqdm


def load_model(model_name="allenai/unifiedqa-t5-base"):
    print("\U0001F527 Loading model...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device set to use {device}")
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model = T5ForConditionalGeneration.from_pretrained(model_name).to(device)
    return tokenizer, model, device


def read_pdf(file_path):
    print(f"\n\U0001F4C4 Processing PDF: {file_path}")
    reader = PdfReader(file_path)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    return text


def chunk_text(text, max_length=512):
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = []
    current_len = 0

    for sentence in sentences:
        if current_len + len(sentence.split()) <= max_length:
            current_chunk.append(sentence)
            current_len += len(sentence.split())
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_len = len(sentence.split())

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def generate_question(chunk, tokenizer, model, device, difficulty):
    bloom_prompt = {
        "easy": "Generate simple factual multiple-choice questions from this:",
        "medium": "Generate a mix of basic and conceptual multiple-choice questions from this:",
        "advanced": "Generate deep understanding and analytical multiple-choice questions from this:"
    }
    prompt = f"{bloom_prompt[difficulty]} {chunk}"

    inputs = tokenizer.encode(prompt, return_tensors="pt", truncation=True).to(device)
    outputs = model.generate(inputs, max_new_tokens=256)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result.strip()


def clean_question_output(output):
    lines = output.split("\n")
    questions = []
    for line in lines:
        line = line.strip("-• ")
        if not line:
            continue
        if any(kw in line.lower() for kw in ["meaning", "passage", "circumstance"]):
            continue  # remove noisy outputs
        if len(line.split()) < 3:
            continue  # skip too short lines
        questions.append(line)
    return questions


def main(pdf_paths, difficulty):
    tokenizer, model, device = load_model()

    all_questions = []
    for pdf_path in pdf_paths:
        text = read_pdf(pdf_path)
        chunks = chunk_text(text)

        for i, chunk in enumerate(tqdm(chunks, desc="\U0001F4DD Generating questions")):
            output = generate_question(chunk, tokenizer, model, device, difficulty)
            questions = clean_question_output(output)
            all_questions.extend(questions)

    print(f"\n\U0001F9E0 Generated {len(all_questions)} questions ({difficulty}):\n")
    for i, q in enumerate(all_questions, 1):
        print(f"{i}. {q}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf_files", nargs="+", help="PDF file paths")
    parser.add_argument("--difficulty", choices=["easy", "medium", "advanced"], default="medium")
    args = parser.parse_args()

    main(args.pdf_files, args.difficulty)
