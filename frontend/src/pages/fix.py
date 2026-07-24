import re

file_path = r'c:\Users\shalika shahana\OneDrive\Documents\lingolive\frontend\src\pages\TeluguSentences.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix navigation button
content = re.sub(
    r'className=\{w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 \}',
    r'className={w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 }',
    content
)

content = re.sub(
    r'className=\{\x0clex items-center justify-center w-7 h-7 rounded-lg \}',
    r'className={lex items-center justify-center w-7 h-7 rounded-lg }',
    content
)

# Fix streak
content = re.sub(
    r'className=\{w-4 h-4 \}',
    r'className={w-4 h-4 }',
    content,
    count=1
)
content = re.sub(
    r'className=\{\x0cont-mono font-bold \}',
    r'className={ont-mono font-bold }',
    content,
    count=1
)

# Fix points
content = re.sub(
    r'className=\{w-4 h-4 \}',
    r'className={w-4 h-4 }',
    content,
    count=1
)
content = re.sub(
    r'className=\{\x0cont-mono font-bold \}',
    r'className={ont-mono font-bold }',
    content,
    count=1
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax issues.")
