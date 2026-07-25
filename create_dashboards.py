import os
import json

languages = [
    {"name": "Hindi", "code": "hi", "lower": "hindi"},
    {"name": "Korean", "code": "ko", "lower": "korean"},
    {"name": "Japanese", "code": "ja", "lower": "japanese"},
    {"name": "Thai", "code": "th", "lower": "thai"},
    {"name": "Chinese", "code": "zh", "lower": "chinese"},
    {"name": "Arabic", "code": "ar", "lower": "arabic"},
]

# Create data files
data_dir = "frontend/src/data"
os.makedirs(data_dir, exist_ok=True)

dummy_alphabet = {
    "total_letters": 0,
    "alphabet": {
        "swarangal": [],
        "vyanjanangal": [],
        "chillaksharangal": []
    }
}
dummy_words = {"words": []}
dummy_numbers = {"numbers": []}
dummy_sentences = {"total_sentences": 0, "modules": []}
dummy_quiz = {"total_questions": 0, "modules": []}

for lang in languages:
    with open(f"{data_dir}/{lang['lower']}AlphabetData.json", "w") as f:
        json.dump(dummy_alphabet, f)
    with open(f"{data_dir}/{lang['lower']}WordsData.json", "w") as f:
        json.dump(dummy_words, f)
    with open(f"{data_dir}/{lang['lower']}NumbersData.json", "w") as f:
        json.dump(dummy_numbers, f)
    with open(f"{data_dir}/{lang['lower']}SentencesData.json", "w") as f:
        json.dump(dummy_sentences, f)
    with open(f"{data_dir}/{lang['lower']}QuizData.json", "w") as f:
        json.dump(dummy_quiz, f)

# Read MalayalamDashboard.jsx
with open("frontend/src/pages/malayalam/MalayalamDashboard.jsx", "r", encoding="utf-8") as f:
    malayalam_code = f.read()

# Create pages
pages_dir = "frontend/src/pages"
for lang in languages:
    lang_dir = f"{pages_dir}/{lang['lower']}"
    os.makedirs(lang_dir, exist_ok=True)
    
    code = malayalam_code.replace("Malayalam", lang["name"])
    code = code.replace("malayalam", lang["lower"])
    code = code.replace("ml-IN", f"{lang['code']}-IN")
    
    with open(f"{lang_dir}/{lang['name']}Dashboard.jsx", "w", encoding="utf-8") as f:
        f.write(code)

print("Created dashboards and data files successfully.")
