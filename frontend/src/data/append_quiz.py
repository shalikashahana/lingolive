import json
import re

json_path = r"C:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\data\new_questions.json"
js_path = r"C:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\data\teluguQuizData.js"

with open(json_path, 'r', encoding='utf-8') as f:
    new_questions = json.load(f)

for q in new_questions:
    q['id'] = q['id'] + 500
    if 'opts' in q:
        q['options'] = q.pop('opts')

with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Remove the trailing "\n]" or "]"
js_content = re.sub(r'\]\s*$', '', js_content)

# Append new questions
new_js = js_content
if not new_js.endswith(",\n"):
    new_js += ",\n"

for i, q in enumerate(new_questions):
    new_js += "  " + json.dumps(q, ensure_ascii=False)
    if i < len(new_questions) - 1:
        new_js += ",\n"
    else:
        new_js += "\n"

new_js += "]\n"

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(new_js)

print("Done appending to teluguQuizData.js")
