import json
import os

data_dir = "frontend/src/data"

# 1. ALPHABET
with open(f"{data_dir}/koreanAlphabetData.json", "r", encoding="utf-8") as f:
    raw_alpha = json.load(f)

swarangal = []
vyanjanangal = []

if isinstance(raw_alpha, list):
    for cat in raw_alpha:
        cname = cat.get("category", "").lower()
        items = cat.get("items", [])
        formatted_items = []
        for item in items:
            formatted_items.append({
                "id": item.get("id"),
                "letter": item.get("korean", item.get("letter", "")),
                "transliteration": item.get("english_transliteration", item.get("transliteration", "")),
                "tamil_transliteration": item.get("tamil_transliteration", ""),
                "english_meaning": item.get("english_meaning", ""),
                "tamil_meaning": item.get("tamil_meaning", "")
            })
        if "vowel" in cname:
            swarangal.extend(formatted_items)
        else:
            vyanjanangal.extend(formatted_items)

korean_alpha = {
    "language": "Korean",
    "code": "ko",
    "total_letters": len(swarangal) + len(vyanjanangal),
    "alphabet": {
        "swarangal": swarangal,
        "vyanjanangal": vyanjanangal,
        "chillaksharangal": []
    }
}
with open(f"{data_dir}/koreanAlphabetData.json", "w", encoding="utf-8") as f:
    json.dump(korean_alpha, f, ensure_ascii=False, indent=2)
print("Converted Alphabet:", korean_alpha["total_letters"], "letters")

# 2. WORDS
with open(f"{data_dir}/koreanWordsData.json", "r", encoding="utf-8") as f:
    raw_words = json.load(f)

words_list = raw_words.get("words", raw_words) if isinstance(raw_words, dict) else raw_words
korean_words = {
    "language": "Korean",
    "code": "ko",
    "total_words": len(words_list),
    "words": words_list
}
with open(f"{data_dir}/koreanWordsData.json", "w", encoding="utf-8") as f:
    json.dump(korean_words, f, ensure_ascii=False, indent=2)
print("Converted Words:", korean_words["total_words"], "words")

# 3. NUMBERS
with open(f"{data_dir}/koreanNumbersData.json", "r", encoding="utf-8") as f:
    raw_num = json.load(f)

numbers_list = []
if isinstance(raw_num, list):
    for cat in raw_num:
        items = cat.get("items", [])
        for item in items:
            item["korean"] = item.get("korean", item.get("number", ""))
            numbers_list.append(item)
else:
    numbers_list = raw_num.get("numbers", [])

korean_numbers = {
    "language": "Korean",
    "code": "ko",
    "total_numbers": len(numbers_list),
    "numbers": numbers_list
}
with open(f"{data_dir}/koreanNumbersData.json", "w", encoding="utf-8") as f:
    json.dump(korean_numbers, f, ensure_ascii=False, indent=2)
print("Converted Numbers:", korean_numbers["total_numbers"], "numbers")

# 4. SENTENCES
with open(f"{data_dir}/koreanSentencesData.json", "r", encoding="utf-8") as f:
    raw_sent = json.load(f)

sent_list = raw_sent.get("modules", raw_sent) if isinstance(raw_sent, dict) else raw_sent
if isinstance(sent_list, list) and len(sent_list) > 0 and "speaker_a" in sent_list[0]:
    formatted_sentences = []
    for idx, item in enumerate(sent_list):
        sa = item.get("speaker_a", {})
        sb = item.get("speaker_b", {})
        formatted_sentences.append({
            "id": idx + 1,
            "korean": f"{sa.get('korean', '')} / {sb.get('korean', '')}" if sb.get('korean') else sa.get("korean", ""),
            "english_transliteration": f"{sa.get('english_transliteration', '')} / {sb.get('english_transliteration', '')}" if sb.get('english_transliteration') else sa.get("english_transliteration", ""),
            "tamil_transliteration": f"{sa.get('tamil_transliteration', '')} / {sb.get('tamil_transliteration', '')}" if sb.get('tamil_transliteration') else sa.get("tamil_transliteration", ""),
            "english_meaning": f"{sa.get('english_meaning', '')} / {sb.get('english_meaning', '')}" if sb.get('english_meaning') else sa.get("english_meaning", ""),
            "tamil_meaning": f"{sa.get('tamil_meaning', '')} / {sb.get('tamil_meaning', '')}" if sb.get('tamil_meaning') else sa.get("tamil_meaning", "")
        })
else:
    formatted_sentences = sent_list

korean_sentences = {
    "language": "Korean",
    "code": "ko",
    "total_sentences": len(formatted_sentences),
    "modules": [
        {
            "module": 1,
            "description": "Korean Essential Dialogues & Sentences",
            "total_sentences": len(formatted_sentences),
            "sentences": formatted_sentences
        }
    ]
}
with open(f"{data_dir}/koreanSentencesData.json", "w", encoding="utf-8") as f:
    json.dump(korean_sentences, f, ensure_ascii=False, indent=2)
print("Converted Sentences:", korean_sentences["total_sentences"], "sentences")

# 5. QUIZ
with open(f"{data_dir}/koreanQuizData.json", "r", encoding="utf-8") as f:
    raw_quiz = json.load(f)

quiz_items = raw_quiz.get("modules", raw_quiz) if isinstance(raw_quiz, dict) else raw_quiz
if isinstance(quiz_items, list) and len(quiz_items) > 0 and "english_word" in quiz_items[0]:
    opt_keys = ["A", "B", "C", "D"]
    formatted_quiz = []
    for idx, item in enumerate(quiz_items):
        options_dict = {}
        correct_opt = "A"
        raw_opts = item.get("options", [])
        correct_ans = item.get("correct_answer", "")
        for o_idx, opt in enumerate(raw_opts):
            k = opt_keys[o_idx] if o_idx < len(opt_keys) else "A"
            kor_txt = opt.get("korean", "")
            trans_txt = opt.get("transliteration", "")
            options_dict[k] = f"{kor_txt} ({trans_txt})" if trans_txt else kor_txt
            if kor_txt == correct_ans:
                correct_opt = k
        formatted_quiz.append({
            "q_no": idx + 1,
            "korean": f"{item.get('english_word', '')} - {item.get('tamil_word', '')}",
            "english_transliteration": "Select the correct Korean translation",
            "options": options_dict,
            "correct_option": correct_opt
        })
else:
    formatted_quiz = quiz_items

korean_quiz = {
    "language": "Korean",
    "code": "ko",
    "total_questions": len(formatted_quiz),
    "modules": [
        {
            "module": 1,
            "description": "Korean Vocabulary & Practice Quiz",
            "total_questions": len(formatted_quiz),
            "quiz": formatted_quiz
        }
    ]
}
with open(f"{data_dir}/koreanQuizData.json", "w", encoding="utf-8") as f:
    json.dump(korean_quiz, f, ensure_ascii=False, indent=2)
print("Converted Quiz:", korean_quiz["total_questions"], "questions")
