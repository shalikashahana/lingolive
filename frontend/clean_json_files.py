import json
import re

def clean_and_load(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Replace concatenated array bounds like ][ with ,
    cleaned = re.sub(r'\]\s*\[', ',\n', content)
    # Ensure it's valid JSON
    data = json.loads(cleaned)
    # Overwrite clean version back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return data

data1 = clean_and_load('src/data/thaiquiz.json')
print(f"thaiquiz.json cleaned: {len(data1)} items/levels")

data2 = clean_and_load('src/data/thaiquiz2.json')
print(f"thaiquiz2.json cleaned: {len(data2)} items")

data3 = clean_and_load('src/data/thaiquiz3.json')
print(f"thaiquiz3.json cleaned: {len(data3)} items")
