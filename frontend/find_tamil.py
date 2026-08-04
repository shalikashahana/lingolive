import json
import re

def contains_tamil(text):
    return bool(re.search(r'[\u0B80-\u0BFF]', text))

def main():
    file_path = r"c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\data\malayalamQuizData.json"
    out_path = r"c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\tamil_results.txt"
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open(out_path, 'w', encoding='utf-8') as out:
        tamil_found = False
        for module in data.get("modules", []):
            for q in module.get("quiz", []):
                has_tamil = False
                for opt in q.get("options", []):
                    text = opt.get("text", "")
                    if contains_tamil(text):
                        has_tamil = True
                
                if has_tamil:
                    tamil_found = True
                    out.write(f"Q No: {q.get('q_no')}\n")
                    out.write(f"Question: {q.get('question_en')}\n")
                    out.write("Options:\n")
                    for opt in q.get("options", []):
                        out.write(f"  {opt.get('text')} - {opt.get('transliteration')}\n")
                    out.write("-" * 40 + "\n")

        if not tamil_found:
            out.write("No Tamil characters found in options.\n")

if __name__ == "__main__":
    main()
