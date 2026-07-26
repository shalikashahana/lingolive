import json
import glob
import re

json_files = glob.glob('src/data/*.json')

for filepath in json_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if '][' in content or ']\n[' in content or ']\r\n[' in content:
            print(f"Fixing concatenated arrays in {filepath}")
            cleaned = re.sub(r'\]\s*\[', ',\n', content)
            data = json.loads(cleaned)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  Fixed & formatted {filepath}")
        else:
            # Just verify valid JSON
            json.loads(content)
    except Exception as e:
        print(f"Error in {filepath}: {e}")
