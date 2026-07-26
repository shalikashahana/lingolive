import json
import random

random.seed(42)

# 1. Load thaiquiz.json (Level-based questions)
with open('src/data/thaiquiz.json', 'r', encoding='utf-8') as f:
    tq1_levels = json.load(f)

tq1_questions = []
q_counter = 1

for level in tq1_levels:
    level_num = level.get("level", 1)
    for q in level.get("questions", []):
        opts = q.get("options", [])
        opt_keys = ["A", "B", "C", "D"]
        options_dict = {}
        correct_key = "A"
        
        for i, opt in enumerate(opts):
            key = opt_keys[i]
            val = f"{opt.get('thai', '')} ({opt.get('transliteration', '')})"
            options_dict[key] = val
            if opt.get('thai') == q.get('correct_answer'):
                correct_key = key
        
        tq1_questions.append({
            "q_no": q_counter,
            "thai": q.get("question", ""),
            "english_transliteration": f"Level {level_num}",
            "options": options_dict,
            "correct_option": correct_key
        })
        q_counter += 1

print(f"tq1_questions: {len(tq1_questions)}")

# 2. Load thaiquiz2.json (Vocabulary/Phrase questions)
with open('src/data/thaiquiz2.json', 'r', encoding='utf-8') as f:
    tq2_items = json.load(f)

tq2_questions = []
all_meanings = [item.get("tamil_meaning", item.get("english_meaning", "")) for item in tq2_items]

for item in tq2_items:
    correct_meaning = item.get("tamil_meaning", item.get("english_meaning", ""))
    distractors = [m for m in all_meanings if m != correct_meaning]
    chosen_distractors = random.sample(distractors, min(3, len(distractors)))
    
    opts_list = [correct_meaning] + chosen_distractors
    random.shuffle(opts_list)
    
    opt_keys = ["A", "B", "C", "D"]
    options_dict = {opt_keys[i]: opts_list[i] for i in range(4)}
    correct_key = next(k for k, v in options_dict.items() if v == correct_meaning)
    
    tq2_questions.append({
        "q_no": q_counter,
        "thai": item.get("thai", ""),
        "english_transliteration": item.get("english_transliteration", ""),
        "tamil_transliteration": item.get("tamil_transliteration", ""),
        "english_meaning": item.get("english_meaning", ""),
        "options": options_dict,
        "correct_option": correct_key
    })
    q_counter += 1

print(f"tq2_questions: {len(tq2_questions)}")

# 3. Load thaiquiz3.json (Sentence completion questions)
with open('src/data/thaiquiz3.json', 'r', encoding='utf-8') as f:
    tq3_items = json.load(f)

tq3_questions = []
for item in tq3_items:
    opts = item.get("options", [])
    opt_keys = ["A", "B", "C", "D"]
    options_dict = {}
    correct_key = "A"
    
    for i, opt in enumerate(opts):
        key = opt_keys[i]
        val = f"{opt.get('thai', '')} ({opt.get('transliteration', '')})"
        options_dict[key] = val
        if opt.get('thai') == item.get('correct_answer'):
            correct_key = key
            
    tq3_questions.append({
        "q_no": q_counter,
        "thai": item.get("sentence_thai", ""),
        "english_transliteration": item.get("english_transliteration", ""),
        "english_meaning": item.get("english_meaning", ""),
        "tamil_meaning": item.get("tamil_meaning", ""),
        "options": options_dict,
        "correct_option": correct_key
    })
    q_counter += 1

print(f"tq3_questions: {len(tq3_questions)}")

# Let's organize into Modules of 50 or 100 questions each
all_questions = tq1_questions + tq2_questions + tq3_questions
print(f"Total Combined Questions: {len(all_questions)}")

MODULE_SIZE = 50
modules_raw = [all_questions[i:i+MODULE_SIZE] for i in range(0, len(all_questions), MODULE_SIZE)]

module_titles = [
    "Module 1: Essential Thai Words & Phrases (Level 1-5)",
    "Module 2: Daily Greetings & Expressions (Level 6-10)",
    "Module 3: Food, Numbers & Time (Level 11-15)",
    "Module 4: Travel & Shopping Questions (Level 16-20)",
    "Module 5: Useful Conversation Phrases - Part 1",
    "Module 6: Useful Conversation Phrases - Part 2",
    "Module 7: Useful Conversation Phrases - Part 3",
    "Module 8: Useful Conversation Phrases - Part 4",
    "Module 9: Useful Conversation Phrases - Part 5",
    "Module 10: Useful Conversation Phrases - Part 6",
    "Module 11: Sentence Grammar & Fill-in-the-Blanks - Part 1",
    "Module 12: Sentence Grammar & Fill-in-the-Blanks - Part 2",
    "Module 13: Sentence Grammar & Fill-in-the-Blanks - Part 3",
    "Module 14: Sentence Grammar & Fill-in-the-Blanks - Part 4",
]

modules_list = []
for idx, mod_qs in enumerate(modules_raw):
    # re-index q_no within module or globally
    for local_idx, q in enumerate(mod_qs):
        q["q_no"] = local_idx + 1
    
    title = module_titles[idx] if idx < len(module_titles) else f"Module {idx+1}: Practice Quiz"
    modules_list.append({
        "module": idx + 1,
        "description": title,
        "total_questions": len(mod_qs),
        "quiz": mod_qs
    })

final_quiz_data = {
    "language": "Thai",
    "code": "th",
    "total_questions": len(all_questions),
    "modules": modules_list
}

with open('src/data/thaiQuizData.json', 'w', encoding='utf-8') as f:
    json.dump(final_quiz_data, f, ensure_ascii=False, indent=2)

print("Saved src/data/thaiQuizData.json successfully!")
