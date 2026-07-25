import json

def generate_alphabets():
    alphabets = [
        {"letter": "ا", "transliteration": "a", "tamil_transliteration": "அ", "type": "letter"},
        {"letter": "ب", "transliteration": "b", "tamil_transliteration": "ப்", "type": "letter"},
        {"letter": "ت", "transliteration": "t", "tamil_transliteration": "த்", "type": "letter"},
        {"letter": "ث", "transliteration": "th", "tamil_transliteration": "த்", "type": "letter"},
        {"letter": "ج", "transliteration": "j", "tamil_transliteration": "ஜ்", "type": "letter"},
        {"letter": "ح", "transliteration": "h", "tamil_transliteration": "ஹ்", "type": "letter"},
        {"letter": "خ", "transliteration": "kh", "tamil_transliteration": "க்", "type": "letter"},
        {"letter": "د", "transliteration": "d", "tamil_transliteration": "த்", "type": "letter"},
        {"letter": "ذ", "transliteration": "dh", "tamil_transliteration": "த்", "type": "letter"},
        {"letter": "ر", "transliteration": "r", "tamil_transliteration": "ர்", "type": "letter"},
        {"letter": "ز", "transliteration": "z", "tamil_transliteration": "ஸ்", "type": "letter"},
        {"letter": "س", "transliteration": "s", "tamil_transliteration": "ஸ்", "type": "letter"},
        {"letter": "ش", "transliteration": "sh", "tamil_transliteration": "ஷ்", "type": "letter"},
        {"letter": "ص", "transliteration": "s", "tamil_transliteration": "ஸ்", "type": "letter"},
        {"letter": "ض", "transliteration": "d", "tamil_transliteration": "த்", "type": "letter"},
        {"letter": "ط", "transliteration": "t", "tamil_transliteration": "ட்", "type": "letter"},
        {"letter": "ظ", "transliteration": "z", "tamil_transliteration": "ஜ்", "type": "letter"},
        {"letter": "ع", "transliteration": "a", "tamil_transliteration": "அ", "type": "letter"},
        {"letter": "غ", "transliteration": "gh", "tamil_transliteration": "க்", "type": "letter"},
        {"letter": "ف", "transliteration": "f", "tamil_transliteration": "ப்", "type": "letter"},
        {"letter": "ق", "transliteration": "q", "tamil_transliteration": "க்", "type": "letter"},
        {"letter": "ك", "transliteration": "k", "tamil_transliteration": "க்", "type": "letter"},
        {"letter": "ل", "transliteration": "l", "tamil_transliteration": "ல்", "type": "letter"},
        {"letter": "م", "transliteration": "m", "tamil_transliteration": "ம்", "type": "letter"},
        {"letter": "ن", "transliteration": "n", "tamil_transliteration": "ன்", "type": "letter"},
        {"letter": "ه", "transliteration": "h", "tamil_transliteration": "ஹ்", "type": "letter"},
        {"letter": "و", "transliteration": "w", "tamil_transliteration": "வ்", "type": "letter"},
        {"letter": "ي", "transliteration": "y", "tamil_transliteration": "ய்", "type": "letter"}
    ]
    
    data = {
        "language": "Arabic",
        "code": "ar",
        "total_letters": len(alphabets),
        "alphabet": {
            "letters": alphabets
        }
    }
    
    with open("src/data/arabicAlphabetData.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    generate_alphabets()
