import os
import re

def fix_streak():
    base_dir = r"c:\Users\shalika shahana\OneDrive\Documents\lingolive\frontend\src\pages"
    
    # 1. Create the streak utility
    utils_dir = r"c:\Users\shalika shahana\OneDrive\Documents\lingolive\frontend\src\utils"
    os.makedirs(utils_dir, exist_ok=True)
    with open(os.path.join(utils_dir, "streak.js"), "w", encoding="utf-8") as f:
        f.write('''export const calculateNewStreak = (stats) => {
  const today = new Date().toDateString();
  let updatedStreak = stats.streak || 0;
  
  if (stats.lastActiveDate !== today) {
    if (stats.lastActiveDate) {
      const lastDate = new Date(stats.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        updatedStreak += 1;
      } else if (diffDays > 1) {
        updatedStreak = 1;
      }
    } else {
      updatedStreak = 1;
    }
  }
  
  return { streak: updatedStreak, lastActiveDate: today };
};
''')

    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(".jsx"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                if "streak:" not in content or "== 0 ? 1 :" not in content.replace("===", "=="):
                    continue
                
                # Determine relative import path
                # pages/lang/LangDashboard.jsx -> ../../utils/streak
                # pages/shared/Dashboard.jsx -> ../../utils/streak
                # (since base_dir is frontend/src/pages)
                depth = len(os.path.relpath(filepath, base_dir).split(os.sep))
                import_prefix = "../" * depth
                import_stmt = f'import {{ calculateNewStreak }} from "{import_prefix}utils/streak";\n'
                
                # Add import after the first import
                if "calculateNewStreak" not in content:
                    content = re.sub(r'(import .*?;?\n)', r'\1' + import_stmt, content, count=1)
                
                def replacement_func(match):
                    var_name = match.group(1) # stats or savedStats
                    xp_part = match.group(2) # e.g. "xp: stats.xp + 10" or "xp: savedStats.xp + 50"
                    
                    return f'''const {{ streak: updatedStreak, lastActiveDate }} = calculateNewStreak({var_name});
      const newStats = {{ streak: updatedStreak, lastActiveDate, {xp_part}'''
                
                # We want to match: const newStats = { streak: stats.streak === 0 ? 1 : stats.streak, xp: stats.xp + 10
                # Regex to match: const newStats = {\s*streak:\s*(stats|savedStats)\.streak\s*===\s*0\s*\?\s*1\s*:\s*\1\.streak,\s*(xp:\s*\1\.xp\s*\+\s*\d+)
                new_content = re.sub(r'const\s+newStats\s*=\s*\{\s*streak:\s*(stats|savedStats)\.streak\s*===\s*0\s*\?\s*1\s*:\s*\1\.streak,\s*(xp:\s*\1\.xp\s*\+\s*\d+)', replacement_func, content)
                
                # We might also have trailing commas, but the regex above matches up to the xp part.
                # The trailing bracket `}` is untouched and will just close the object normally!
                
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == "__main__":
    fix_streak()
