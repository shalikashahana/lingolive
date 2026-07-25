import json
import time
from num2words import num2words
from deep_translator import GoogleTranslator
from unidecode import unidecode
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

translator = GoogleTranslator(source='en', target='ar')

def to_arabic_digit(n):
    arabic_digits = "٠١٢٣٤٥٦٧٨٩"
    return "".join(arabic_digits[int(d)] for d in str(n))

def generate_numbers():
    print("Generating Arabic numbers 0-50...")
    numbers = []
    
    try:
        with open("src/data/hindiNumbersData.json", "r", encoding="utf-8") as f:
            hi_data = json.load(f)
            hi_nums = {int(n["digit"]): n for n in hi_data.get("numbers", [])}
    except Exception:
        hi_nums = {}
    
    for i in range(51):
        eng_word = num2words(i).capitalize()
        if i == 0:
            eng_word = "Zero"
        
        try:
            ar_word = translator.translate(eng_word)
            lat = unidecode(ar_word).lower().capitalize()
            lat_clean = lat.replace('-', '')
            tam = transliterate(lat_clean, sanscript.ITRANS, sanscript.TAMIL)
            
            hi_n = hi_nums.get(i, {})
            
            numbers.append({
                "digit": str(i),
                "arabic_digit": to_arabic_digit(i),
                "arabic": ar_word,
                "english_transliteration": lat,
                "tamil_transliteration": tam,
                "english_meaning": eng_word,
                "malayalam": hi_n.get("malayalam", ""),
                "tamil_meaning": hi_n.get("tamil_meaning", "")
            })
            print(f"{i} -> {ar_word} -> {lat} -> {tam}")
            time.sleep(0.5)
        except Exception as e:
            print(f"Error on {i}: {e}")
            
    data = {
        "language": "Arabic",
        "code": "ar",
        "total_numbers": len(numbers),
        "numbers": numbers
    }
    
    with open("src/data/arabicNumbersData.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    generate_numbers()
