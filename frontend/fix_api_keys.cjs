const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/pages/**/*Chat.jsx');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const \w+_API_KEY = ".*";/, 'const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";');
  content = content.replace(/\$\{.*?_API_KEY\}/, '${API_KEY}');
  fs.writeFileSync(file, content);
}
console.log('Fixed API keys');
