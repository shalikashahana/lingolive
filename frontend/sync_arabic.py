import json
import time
import sys
import io
from deep_translator import GoogleTranslator
from unidecode import unidecode
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

translator = GoogleTranslator(source='auto', target='ar')

def translate_to_arabic(text_en):
    for attempt in range(3):
        try:
            ar_text = translator.translate(text_en)
            
            # Get Latin transliteration via unidecode
            lat = unidecode(ar_text).lower().capitalize()
            lat_clean = lat.replace('-', '')
            
            # Get Tamil transliteration via ITRANS -> TAMIL
            tam = transliterate(lat_clean, sanscript.ITRANS, sanscript.TAMIL)
            
            return ar_text, lat, tam
        except Exception as e:
            print(f"Translation error for '{text_en}': {e}. Retrying...")
            time.sleep(2)
    return "", "", ""

def sync_words():
    print("--- Syncing Arabic Words ---")
    ml_path = r"src\data\malayalamWordsData.json"
    ar_path = r"src\data\arabicWordsData.json"
    
    with open(ml_path, "r", encoding="utf-8") as f:
        ml_data = json.load(f)
        
    try:
        with open(ar_path, "r", encoding="utf-8") as f:
            ar_data = json.load(f)
    except Exception:
        ar_data = {"language": "Arabic", "code": "ar", "total_words": 0, "words": []}
        
    ar_words_by_eng = {w.get("english_meaning"): w for w in ar_data.get("words", [])}
    
    added_count = 0
    for w in ml_data.get("words", []):
        eng = w.get("english_meaning")
        if eng not in ar_words_by_eng:
            print(f"Translating word: {eng}")
            ar_text, lat, tam = translate_to_arabic(eng)
            if ar_text:
                new_word = {
                    "arabic": ar_text,
                    "english_transliteration": lat,
                    "tamil_transliteration": tam,
                    "tamil_meaning": w.get("tamil_meaning", ""),
                    "english_meaning": eng,
                    "malayalam": w.get("malayalam", "")
                }
                ar_data["words"].append(new_word)
                ar_words_by_eng[eng] = new_word
                added_count += 1
                time.sleep(0.5)
                
                # Save progress periodically
                if added_count % 10 == 0:
                    ar_data["total_words"] = len(ar_data["words"])
                    with open(ar_path, "w", encoding="utf-8") as fw:
                        json.dump(ar_data, fw, ensure_ascii=False, indent=2)

    ar_data["total_words"] = len(ar_data["words"])
    with open(ar_path, "w", encoding="utf-8") as fw:
        json.dump(ar_data, fw, ensure_ascii=False, indent=2)
    print(f"Added {added_count} words. Total words in Arabic: {len(ar_data['words'])}")

def sync_sentences():
    print("--- Syncing Arabic Sentences ---")
    ml_path = r"src\data\malayalamSentencesData.json"
    ar_path = r"src\data\arabicSentencesData.json"
    
    with open(ml_path, "r", encoding="utf-8") as f:
        ml_data = json.load(f)
        
    try:
        with open(ar_path, "r", encoding="utf-8") as f:
            ar_data = json.load(f)
    except Exception:
        ar_data = {"language": "Arabic", "code": "ar", "total_sentences": 0, "modules": []}
        
    ar_sents = {}
    for m in ar_data.get("modules", []):
        for s in m.get("sentences", []):
            ar_sents[s.get("english_meaning")] = s
            
    added_count = 0
    for ml_mod in ml_data.get("modules", []):
        mod_name = ml_mod.get("module")
        ar_mod = next((m for m in ar_data.get("modules", []) if m.get("module") == mod_name), None)
        if not ar_mod:
            ar_mod = {"module": mod_name, "total_sentences": 0, "sentences": []}
            ar_data["modules"].append(ar_mod)
            
        for s in ml_mod.get("sentences", []):
            eng = s.get("english_meaning")
            if eng not in ar_sents:
                print(f"Translating sentence: {eng}")
                ar_text, lat, tam = translate_to_arabic(eng)
                if ar_text:
                    new_s = {
                        "arabic": ar_text,
                        "english_transliteration": lat,
                        "tamil_transliteration": tam,
                        "tamil_meaning": s.get("tamil_meaning", ""),
                        "english_meaning": eng,
                        "malayalam": s.get("malayalam", "")
                    }
                    ar_mod["sentences"].append(new_s)
                    ar_sents[eng] = new_s
                    added_count += 1
                    time.sleep(0.5)
                    
                    if added_count % 10 == 0:
                        ar_mod["total_sentences"] = len(ar_mod["sentences"])
                        ar_data["total_sentences"] = sum(len(m["sentences"]) for m in ar_data["modules"])
                        with open(ar_path, "w", encoding="utf-8") as fw:
                            json.dump(ar_data, fw, ensure_ascii=False, indent=2)

        ar_mod["total_sentences"] = len(ar_mod["sentences"])

    ar_data["total_sentences"] = sum(len(m["sentences"]) for m in ar_data["modules"])
    with open(ar_path, "w", encoding="utf-8") as fw:
        json.dump(ar_data, fw, ensure_ascii=False, indent=2)
    print(f"Added {added_count} sentences. Total sentences in Arabic: {ar_data['total_sentences']}")

def sync_quiz():
    print("--- Syncing Arabic Quiz ---")
    ml_path = r"src\data\malayalamQuizData.json"
    ar_path = r"src\data\arabicQuizData.json"
    
    with open(ml_path, "r", encoding="utf-8") as f:
        ml_data = json.load(f)
        
    try:
        with open(ar_path, "r", encoding="utf-8") as f:
            ar_data = json.load(f)
    except Exception:
        ar_data = {"language": "Arabic", "code": "ar", "total_questions": 0, "modules": []}
        
    ar_q = {}
    for m in ar_data.get("modules", []):
        for q in m.get("quiz", []):
            ar_q[q.get("english_meaning")] = q
            
    added_count = 0
    for ml_mod in ml_data.get("modules", []):
        mod_name = ml_mod.get("module")
        ar_mod = next((m for m in ar_data.get("modules", []) if m.get("module") == mod_name), None)
        if not ar_mod:
            ar_mod = {"module": mod_name, "total_questions": 0, "quiz": []}
            ar_data["modules"].append(ar_mod)
            
        for q in ml_mod.get("quiz", []):
            eng = q.get("english_meaning")
            if eng not in ar_q:
                print(f"Translating quiz: {eng}")
                
                new_q = {
                    "q_no": q.get("q_no"),
                    "question_en": q.get("question_en"),
                    "question_ta": q.get("question_ta"),
                    "english_meaning": q.get("english_meaning"),
                    "options": []
                }
                
                # Translate options
                for opt in q.get("options", []):
                    opt_ml = opt.get("text")
                    try:
                        ar_opt_text = translator.translate(opt_ml)
                        
                        opt_lat = unidecode(ar_opt_text).lower().capitalize()
                        opt_lat_clean = opt_lat.replace('-', '')
                        opt_tam = transliterate(opt_lat_clean, sanscript.ITRANS, sanscript.TAMIL)
                        
                        new_q["options"].append({
                            "text": ar_opt_text,
                            "transliteration": opt_lat
                        })
                        
                        if opt_ml == q.get("correct_answer"):
                            new_q["correct_answer"] = ar_opt_text
                            
                        time.sleep(0.3)
                    except Exception as e:
                        print(f"Option translation error: {e}")
                        
                ar_mod["quiz"].append(new_q)
                ar_q[eng] = new_q
                added_count += 1
                
                if added_count % 5 == 0:
                    ar_mod["total_questions"] = len(ar_mod["quiz"])
                    ar_data["total_questions"] = sum(len(m["quiz"]) for m in ar_data["modules"])
                    with open(ar_path, "w", encoding="utf-8") as fw:
                        json.dump(ar_data, fw, ensure_ascii=False, indent=2)

        ar_mod["total_questions"] = len(ar_mod["quiz"])

    current_q_no = 1
    for m in ar_data.get("modules", []):
        for q in m.get("quiz", []):
            q["q_no"] = current_q_no
            current_q_no += 1
            
    ar_data["total_questions"] = sum(len(m["quiz"]) for m in ar_data["modules"])
    with open(ar_path, "w", encoding="utf-8") as fw:
        json.dump(ar_data, fw, ensure_ascii=False, indent=2)
    print(f"Added {added_count} quiz questions. Total: {ar_data['total_questions']}")

if __name__ == '__main__':
    sync_words()
    sync_sentences()
    sync_quiz()
