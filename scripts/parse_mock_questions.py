import re
import uuid
import json

SOURCE_FILE = '/Users/mahesh/Works/CBT aoo/NMC CBT Dev/Jeeva-learning-app-ecosystem/Jeeva-admin-app/jeeva-admin-portal/docs/mock_exam_mcq/mcq_1_mock/NMC_CBT_Full_Mock_Exam_FULL.md'
OUTPUT_FILE = '/Users/mahesh/Works/CBT aoo/NMC CBT Dev/Jeeva-learning-app-ecosystem/Jeeva-admin-app/jeeva-admin-portal/database/migrations/import_mock_exam_questions.sql'

def parse_markdown():
    with open(SOURCE_FILE, 'r') as f:
        lines = f.readlines()

    questions = []
    current_part = None
    current_q = None
    
    # Regex patterns
    part_a_pattern = re.compile(r'## PART A: NUMERACY')
    part_b_pattern = re.compile(r'## PART B: CLINICAL KNOWLEDGE')
    q_pattern = re.compile(r'### Question (\d+)')
    option_pattern = re.compile(r'^([a-d])\.\s+(.+)')
    correct_pattern = re.compile(r'\*\*Correct answer:\*\*\s+([a-d])')
    explanation_pattern = re.compile(r'\*\*Explanation:\*\*\s+(.+)')

    for line in lines:
        line = line.strip()
        
        if part_a_pattern.search(line):
            current_part = 'part_a'
            continue
        elif part_b_pattern.search(line):
            current_part = 'part_b'
            continue
            
        if q_pattern.search(line):
            if current_q:
                questions.append(current_q)
            current_q = {
                'part': current_part,
                'text': [],
                'options': [],
                'correct': None,
                'explanation': '',
                'difficulty': 'medium', # Default
                'points': 1
            }
            continue
            
        if not current_q:
            continue
            
        # Parse content inside a question
        option_match = option_pattern.match(line)
        correct_match = correct_pattern.match(line)
        explain_match = explanation_pattern.match(line)
        
        if option_match:
            current_q['options'].append({
                'key': option_match.group(1),
                'text': option_match.group(2)
            })
        elif correct_match:
            current_q['correct'] = correct_match.group(1)
        elif explain_match:
            current_q['explanation'] = explain_match.group(1)
        elif line == '---' or line.startswith('#'):
            pass # Skip separators
        else:
            if line:
                # Assuming text before options is question text
                if not current_q['options'] and not current_q['correct']:
                    current_q['text'].append(line)
                elif current_q['correct'] and not current_q['explanation']:
                    # sometimes explanation is on next line? No, pattern handles it.
                    pass

    if current_q:
        questions.append(current_q)
        
    return questions

def escape_sql(text):
    if not text:
        return ''
    return text.replace("'", "''")

def generate_sql(questions):
    sql = []
    sql.append("-- Migration to import Mock Exam Questions")
    sql.append("-- Auto-generated from markdown")
    sql.append("")
    
    # 1. Add exam_part column if passed (handled safely)
    sql.append("-- Add exam_part column if it doesn't exist")
    sql.append("DO $$")
    sql.append("BEGIN")
    sql.append("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mock_exam_questions' AND column_name = 'exam_part') THEN")
    sql.append("        ALTER TABLE mock_exam_questions ADD COLUMN exam_part VARCHAR(20) DEFAULT 'part_b';") # Default to part_b safely? Or allow null.
    sql.append("    END IF;")
    sql.append("END $$;")
    sql.append("")
    
    # 2. Clear existing items? No, let's append.
    # Actually, maybe we should clean up old ones if this is a "full reload" request?
    # User said "add this mcq", implying append. I'll just append.
    
    for q in questions:
        q_id = str(uuid.uuid4())
        q_text = escape_sql(" ".join(q['text']))
        explanation = escape_sql(q['explanation'])
        exam_part = q['part']
        
        # Insert Question
        sql.append(f"""
INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('{q_id}', '{exam_part}', '{q_text}', 'multiple_choice', '{q['difficulty']}', {q['points']}, '{explanation}', true);""")

        # Insert Options
        for opt in q['options']:
            opt_id = str(uuid.uuid4())
            opt_text = escape_sql(opt['text'])
            is_correct = (opt['key'] == q['correct'])
            
            sql.append(f"""
INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('{opt_id}', '{q_id}', '{opt_text}', {str(is_correct).lower()}, 0);""")
            
    return "\n".join(sql)

if __name__ == '__main__':
    qs = parse_markdown()
    sql_content = generate_sql(qs)
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write(sql_content)
    
    print(f"Generated SQL for {len(qs)} questions at {OUTPUT_FILE}")
