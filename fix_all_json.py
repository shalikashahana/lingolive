import os
import re
import json

data_dir = r"c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\data"

json_files = [f for f in os.listdir(data_dir) if f.endswith('.json')]

print(f"Found {len(json_files)} JSON files to check...\n")

fixed = []
already_valid = []
failed = []

for fname in sorted(json_files):
    fpath = os.path.join(data_dir, fname)
    
    # First try to load as-is
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        json.loads(content)
        already_valid.append(fname)
        continue
    except json.JSONDecodeError as e:
        pass  # Need to fix

    # Try fixing: merge multiple arrays joined by ][ or ] [
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix: ]\n[ or ] [ patterns (multiple arrays concatenated)
        fixed_content = re.sub(r'\]\s*\[', ',', content)
        
        # Validate after fix
        json.loads(fixed_content)
        
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        fixed.append(fname)
        print(f"  [FIXED] {fname}")
    except json.JSONDecodeError as e:
        failed.append((fname, str(e)))
        print(f"  [ERROR] {fname}: {e}")

print(f"\n=== Summary ===")
print(f"Already valid: {len(already_valid)}")
print(f"Fixed: {len(fixed)}")
print(f"Still failing: {len(failed)}")

if failed:
    print("\nFiles that still need manual fixing:")
    for fname, err in failed:
        print(f"  - {fname}: {err}")
