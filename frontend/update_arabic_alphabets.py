import json

def update_alphabets():
    alphabets = [
        {"letter": "ا", "transliteration": "Alif", "tamil_transliteration": "அலிஃப்", "arabic_name": "أَلِف", "type": "letter"},
        {"letter": "ب", "transliteration": "Baa", "tamil_transliteration": "பா", "arabic_name": "بَاء", "type": "letter"},
        {"letter": "ت", "transliteration": "Taa", "tamil_transliteration": "தா", "arabic_name": "تَاء", "type": "letter"},
        {"letter": "ث", "transliteration": "Thaa", "tamil_transliteration": "தா", "arabic_name": "ثَاء", "type": "letter"},
        {"letter": "ج", "transliteration": "Jeem", "tamil_transliteration": "ஜீம்", "arabic_name": "جِيم", "type": "letter"},
        {"letter": "ح", "transliteration": "Haa", "tamil_transliteration": "ஹா", "arabic_name": "حَاء", "type": "letter"},
        {"letter": "خ", "transliteration": "Khaa", "tamil_transliteration": "கா", "arabic_name": "خَاء", "type": "letter"},
        {"letter": "د", "transliteration": "Daal", "tamil_transliteration": "தால்", "arabic_name": "دَال", "type": "letter"},
        {"letter": "ذ", "transliteration": "Dhaal", "tamil_transliteration": "தால்", "arabic_name": "ذَال", "type": "letter"},
        {"letter": "ر", "transliteration": "Raa", "tamil_transliteration": "ரா", "arabic_name": "رَاء", "type": "letter"},
        {"letter": "ز", "transliteration": "Zaa", "tamil_transliteration": "ஸா", "arabic_name": "زَاي", "type": "letter"},
        {"letter": "س", "transliteration": "Seen", "tamil_transliteration": "ஸீன்", "arabic_name": "سِين", "type": "letter"},
        {"letter": "ش", "transliteration": "Sheen", "tamil_transliteration": "ஷீன்", "arabic_name": "شِين", "type": "letter"},
        {"letter": "ص", "transliteration": "Saad", "tamil_transliteration": "ஸாத்", "arabic_name": "صَاد", "type": "letter"},
        {"letter": "ض", "transliteration": "Daad", "tamil_transliteration": "தாத்", "arabic_name": "ضَاد", "type": "letter"},
        {"letter": "ط", "transliteration": "Taa", "tamil_transliteration": "டா", "arabic_name": "طَاء", "type": "letter"},
        {"letter": "ظ", "transliteration": "Zaa", "tamil_transliteration": "ழா", "arabic_name": "ظَاء", "type": "letter"},
        {"letter": "ع", "transliteration": "Ayn", "tamil_transliteration": "ஐன்", "arabic_name": "عَيْن", "type": "letter"},
        {"letter": "غ", "transliteration": "Ghayn", "tamil_transliteration": "கைன்", "arabic_name": "غَيْن", "type": "letter"},
        {"letter": "ف", "transliteration": "Faa", "tamil_transliteration": "ஃபா", "arabic_name": "فَاء", "type": "letter"},
        {"letter": "ق", "transliteration": "Qaaf", "tamil_transliteration": "காஃப்", "arabic_name": "قَاف", "type": "letter"},
        {"letter": "ك", "transliteration": "Kaaf", "tamil_transliteration": "காஃப்", "arabic_name": "كَاف", "type": "letter"},
        {"letter": "ل", "transliteration": "Laam", "tamil_transliteration": "லாம்", "arabic_name": "لاَم", "type": "letter"},
        {"letter": "م", "transliteration": "Meem", "tamil_transliteration": "மீம்", "arabic_name": "مِيم", "type": "letter"},
        {"letter": "ن", "transliteration": "Noon", "tamil_transliteration": "நூன்", "arabic_name": "نُون", "type": "letter"},
        {"letter": "ه", "transliteration": "Haa", "tamil_transliteration": "ஹா", "arabic_name": "هَاء", "type": "letter"},
        {"letter": "و", "transliteration": "Waaw", "tamil_transliteration": "வாவ்", "arabic_name": "وَاو", "type": "letter"},
        {"letter": "ي", "transliteration": "Yaa", "tamil_transliteration": "யா", "arabic_name": "يَاء", "type": "letter"}
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
    print("Done")

if __name__ == "__main__":
    update_alphabets()
