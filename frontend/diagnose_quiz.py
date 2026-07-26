import json, re

# --- Fix thaiquiz2.json (has two concatenated JSON arrays) ---
with open('src/data/thaiquiz2.json', encoding='utf-8') as f:
    raw2 = f.read()

# Find the join point: ][
fixed2 = re.sub(r'\]\s*\[', ',\n', raw2)  # merge two arrays into one
data2 = json.loads(fixed2)
print(f"thaiquiz2.json: {len(data2)} items")
print("  sample keys:", list(data2[0].keys()))

# --- Load thaiquiz.json (level-based quiz) ---
with open('src/data/thaiquiz.json', encoding='utf-8') as f:
    raw1 = f.read()
fixed1 = re.sub(r'\]\s*\[', ',\n', raw1)
data1 = json.loads(fixed1)
print(f"\nthaiquiz.json: {len(data1)} levels")
total1 = sum(len(l['questions']) for l in data1)
print(f"  total questions: {total1}")
print("  q[0] keys:", list(data1[0]['questions'][0].keys()))

# --- Load thaiquiz3.json ---
with open('src/data/thaiquiz3.json', encoding='utf-8') as f:
    raw3 = f.read()
fixed3 = re.sub(r'\]\s*\[', ',\n', raw3)
data3 = json.loads(fixed3)
print(f"\nthaiquiz3.json: {len(data3)} items")
print("  sample keys:", list(data3[0].keys()))
