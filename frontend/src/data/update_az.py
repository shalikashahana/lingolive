import re

file_path = "c:/Users/shalika shahana/OneDrive/Documents/lingolive/frontend/src/data/mockData.js"
txt_path = "c:/Users/shalika shahana/OneDrive/Documents/lingolive/frontend/src/data/az_words.txt"

with open(txt_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_words = []
start_id = 771 # since C2 ends at 770

for line in lines:
    line = line.strip()
    if not line or " - " not in line:
        continue
    
    parts = line.split(" - ", 1)
    word = parts[0].strip()
    definition = parts[1].strip()
    
    word_lower = word.lower()
    
    # We will use "A-Z" as the CEFR level
    obj_str = f'  {{ id: {start_id}, word: "{word_lower}", part_of_speech: "general", cefr_level: "A-Z", pronunciation_ipa: "", definition: "{definition}", example_sentence: "{word} is an important word.", audio_text: "{word_lower}", learned: false }}'
    
    new_words.append(obj_str)
    start_id += 1

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the end of VOCABULARY_LIST array
# It ends with:
#   { id: 770, ... }
# ];
insert_idx = content.find("];\n\nexport const READING_PASSAGES = [")
if insert_idx != -1:
    before = content[:insert_idx]
    after = content[insert_idx:]
    
    if before.endswith("\n"):
        before = before.rstrip()
    
    # join new words
    new_words_str = ",\n" + ",\n".join(new_words) + "\n"
    
    new_content = before + new_words_str + after
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Successfully added {len(new_words)} A-Z words to mockData.js!")
else:
    print("Could not find the insertion point.")
