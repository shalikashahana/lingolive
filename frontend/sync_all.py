import json
import time
import sys
import io
from deep_translator import GoogleTranslator
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

translator = GoogleTranslator(source='auto', target='hi')

def translate_to_hindi(text_en):
    for attempt in range(3):
        try:
            hindi_text = translator.translate(text_en)
            
            # Get Latin transliteration via ITRANS
            latin = transliterate(hindi_text, sanscript.DEVANAGARI, sanscript.ITRANS).lower().capitalize()
            
            # Get Tamil transliteration
            tamil = transliterate(hindi_text, sanscript.DEVANAGARI, sanscript.TAMIL)
            
            return hindi_text, latin, tamil
        except Exception as e:
            print(f"Translation error for '{text_en}': {e}. Retrying...")
            time.sleep(2)
    return "", "", ""


def sync_words():
    print("--- Syncing Words ---")
    ml_path = r"src\data\malayalamWordsData.json"
    hi_path = r"src\data\hindiWordsData.json"
    
    with open(ml_path, "r", encoding="utf-8") as f:
        ml_data = json.load(f)
    with open(hi_path, "r", encoding="utf-8") as f:
        hi_data = json.load(f)
        
    hi_words_by_eng = {w.get("english_meaning"): w for w in hi_data.get("words", [])}
    
    added_count = 0
    for w in ml_data.get("words", []):
        eng = w.get("english_meaning")
        if eng not in hi_words_by_eng:
            print(f"Translating word: {eng}")
            hi_text, lat, tam = translate_to_hindi(eng)
            if hi_text:
                new_word = {
                    "hindi": hi_text,
                    "english_transliteration": lat,
                    "tamil_transliteration": tam,
                    "tamil_meaning": w.get("tamil_meaning", ""),
                    "english_meaning": eng,
                    "malayalam": w.get("malayalam", "")
                }
                hi_data["words"].append(new_word)
                hi_words_by_eng[eng] = new_word
                added_count += 1
                time.sleep(0.5)
                
                # Save progress periodically
                if added_count % 10 == 0:
                    hi_data["total_words"] = len(hi_data["words"])
                    with open(hi_path, "w", encoding="utf-8") as fw:
                        json.dump(hi_data, fw, ensure_ascii=False, indent=2)

    hi_data["total_words"] = len(hi_data["words"])
    with open(hi_path, "w", encoding="utf-8") as fw:
        json.dump(hi_data, fw, ensure_ascii=False, indent=2)
    print(f"Added {added_count} words. Total words in Hindi: {len(hi_data['words'])}")

def sync_sentences():
    print("--- Syncing Sentences ---")
    ml_path = r"src\data\malayalamSentencesData.json"
    hi_path = r"src\data\hindiSentencesData.json"
    
    with open(ml_path, "r", encoding="utf-8") as f:
        ml_data = json.load(f)
    with open(hi_path, "r", encoding="utf-8") as f:
        hi_data = json.load(f)
        
    # Map by module name and english meaning
    hi_sents = {}
    for m in hi_data.get("modules", []):
        for s in m.get("sentences", []):
            hi_sents[s.get("english_meaning")] = s
            
    added_count = 0
    for ml_mod in ml_data.get("modules", []):
        mod_name = ml_mod.get("module")
        # Find or create module in Hindi
        hi_mod = next((m for m in hi_data.get("modules", []) if m.get("module") == mod_name), None)
        if not hi_mod:
            hi_mod = {"module": mod_name, "total_sentences": 0, "sentences": []}
            hi_data["modules"].append(hi_mod)
            
        for s in ml_mod.get("sentences", []):
            eng = s.get("english_meaning")
            if eng not in hi_sents:
                print(f"Translating sentence: {eng}")
                hi_text, lat, tam = translate_to_hindi(eng)
                if hi_text:
                    new_s = {
                        "hindi": hi_text,
                        "english_transliteration": lat,
                        "tamil_transliteration": tam,
                        "tamil_meaning": s.get("tamil_meaning", ""),
                        "english_meaning": eng,
                        "malayalam": s.get("malayalam", "")
                    }
                    hi_mod["sentences"].append(new_s)
                    hi_sents[eng] = new_s
                    added_count += 1
                    time.sleep(0.5)
                    
                    if added_count % 10 == 0:
                        hi_mod["total_sentences"] = len(hi_mod["sentences"])
                        hi_data["total_sentences"] = sum(len(m["sentences"]) for m in hi_data["modules"])
                        with open(hi_path, "w", encoding="utf-8") as fw:
                            json.dump(hi_data, fw, ensure_ascii=False, indent=2)

        hi_mod["total_sentences"] = len(hi_mod["sentences"])

    hi_data["total_sentences"] = sum(len(m["sentences"]) for m in hi_data["modules"])
    with open(hi_path, "w", encoding="utf-8") as fw:
        json.dump(hi_data, fw, ensure_ascii=False, indent=2)
    print(f"Added {added_count} sentences. Total sentences in Hindi: {hi_data['total_sentences']}")

def sync_quiz():
    print("--- Syncing Quiz ---")
    ml_path = r"src\data\malayalamQuizData.json"
    hi_path = r"src\data\hindiQuizData.json"
    
    with open(ml_path, "r", encoding="utf-8") as f:
        ml_data = json.load(f)
    with open(hi_path, "r", encoding="utf-8") as f:
        hi_data = json.load(f)
        
    hi_q = {}
    for m in hi_data.get("modules", []):
        for q in m.get("quiz", []):
            hi_q[q.get("english_meaning")] = q
            
    added_count = 0
    for ml_mod in ml_data.get("modules", []):
        mod_name = ml_mod.get("module")
        hi_mod = next((m for m in hi_data.get("modules", []) if m.get("module") == mod_name), None)
        if not hi_mod:
            hi_mod = {"module": mod_name, "total_questions": 0, "quiz": []}
            hi_data["modules"].append(hi_mod)
            
        for q in ml_mod.get("quiz", []):
            eng = q.get("english_meaning")
            if eng not in hi_q:
                print(f"Translating quiz: {eng}")
                # We need to translate question_en (same as eng mostly), correct_answer, and options
                hi_text, lat, tam = translate_to_hindi(eng) # Not strictly needed, we translate options
                
                new_q = {
                    "q_no": q.get("q_no"),
                    "question_en": q.get("question_en"),
                    "question_ta": q.get("question_ta"),
                    "english_meaning": q.get("english_meaning"),
                    "options": []
                }
                
                # Translate options
                for opt in q.get("options", []):
                    # To accurately translate the option, we should ideally translate the English meaning of the option.
                    # But the option is in Malayalam! So we translate the Malayalam text to Hindi?
                    # Wait! Googletrans can auto-detect Malayalam and translate to Hindi!
                    opt_ml = opt.get("text")
                    # Let's translate ml -> hi
                    try:
                        hi_opt_text = GoogleTranslator(source='auto', target='hi').translate(opt_ml)
                        
                        opt_lat = transliterate(hi_opt_text, sanscript.DEVANAGARI, sanscript.ITRANS).lower().capitalize()
                        opt_tam = transliterate(hi_opt_text, sanscript.DEVANAGARI, sanscript.TAMIL)
                        
                        new_q["options"].append({
                            "text": hi_opt_text,
                            "transliteration": opt_lat
                        })
                        
                        if opt_ml == q.get("correct_answer"):
                            new_q["correct_answer"] = hi_opt_text
                            
                        time.sleep(0.3)
                    except Exception as e:
                        print(f"Option translation error: {e}")
                        
                hi_mod["quiz"].append(new_q)
                hi_q[eng] = new_q
                added_count += 1
                
                if added_count % 5 == 0:
                    hi_mod["total_questions"] = len(hi_mod["quiz"])
                    hi_data["total_questions"] = sum(len(m["quiz"]) for m in hi_data["modules"])
                    with open(hi_path, "w", encoding="utf-8") as fw:
                        json.dump(hi_data, fw, ensure_ascii=False, indent=2)

        hi_mod["total_questions"] = len(hi_mod["quiz"])

    # Renumber
    current_q_no = 1
    for m in hi_data.get("modules", []):
        for q in m.get("quiz", []):
            q["q_no"] = current_q_no
            current_q_no += 1
            
    hi_data["total_questions"] = sum(len(m["quiz"]) for m in hi_data["modules"])
    with open(hi_path, "w", encoding="utf-8") as fw:
        json.dump(hi_data, fw, ensure_ascii=False, indent=2)
    print(f"Added {added_count} quiz questions. Total: {hi_data['total_questions']}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == 'words':
            sync_words()
        elif sys.argv[1] == 'sentences':
            sync_sentences()
        elif sys.argv[1] == 'quiz':
            sync_quiz()
    else:
        sync_words()
        sync_sentences()
        sync_quiz()
