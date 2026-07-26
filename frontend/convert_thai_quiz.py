import json
import random

# Load the current flat array
with open("src/data/thaiQuizData.json", "r", encoding="utf-8") as f:
    words = json.load(f)

# We have 800 words. Split into 8 modules of 100 each.
MODULE_SIZE = 100
modules_raw = [words[i:i+MODULE_SIZE] for i in range(0, len(words), MODULE_SIZE)]

module_descriptions = [
    "Basic Greetings & Everyday Verbs",
    "Questions, Time & Places",
    "Food, Drinks & Adjectives",
    "Emotions, Colors & Numbers",
    "Body Parts & Health",
    "Nature, Animals & Transport",
    "Home, Family & Work",
    "Advanced Vocabulary & Mixed Review",
    "Comprehensive Final Review",
]

def pick_distractors(correct_item, all_words, n=3):
    """Pick n distractor meanings (tamil_meaning) different from the correct one."""
    pool = [w for w in all_words if w["tamil_meaning"] != correct_item["tamil_meaning"]]
    chosen = random.sample(pool, min(n, len(pool)))
    return [c["tamil_meaning"] for c in chosen]

random.seed(42)  # for reproducibility

output_modules = []

for mod_idx, module_words in enumerate(modules_raw):
    quiz_items = []
    for q_idx, word in enumerate(module_words):
        correct_answer = word["tamil_meaning"]
        distractors = pick_distractors(word, words, n=3)

        # Build options: shuffle correct + distractors
        options_list = [correct_answer] + distractors
        random.shuffle(options_list)

        option_keys = ["A", "B", "C", "D"]
        options_dict = {option_keys[i]: options_list[i] for i in range(4)}
        correct_key = next(k for k, v in options_dict.items() if v == correct_answer)

        quiz_item = {
            "q_no": q_idx + 1,
            "thai": word["thai"],
            "english_transliteration": word["english_transliteration"],
            "tamil_transliteration": word.get("tamil_transliteration", ""),
            "english_meaning": word["english_meaning"],
            "options": options_dict,
            "correct_option": correct_key
        }
        quiz_items.append(quiz_item)

    desc = module_descriptions[mod_idx] if mod_idx < len(module_descriptions) else f"Module {mod_idx + 1}"
    output_modules.append({
        "module": mod_idx + 1,
        "description": desc,
        "total_questions": len(quiz_items),
        "quiz": quiz_items
    })

output = {
    "language": "Thai",
    "code": "th",
    "total_questions": len(words),
    "modules": output_modules
}

with open("src/data/thaiQuizData.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=4)

print(f"Done! Converted {len(words)} words into {len(output_modules)} modules.")
for m in output_modules:
    print(f"  Module {m['module']}: {m['total_questions']} questions - {m['description']}")
