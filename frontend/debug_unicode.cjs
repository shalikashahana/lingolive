const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/arabicSentencesData.json', 'utf8'));

// Get all remaining sentences with placeholder transliterations
const remaining = new Set();
for (const module of data.modules) {
  if (!module.sentences) continue;
  for (const sentence of module.sentences) {
    if (/^Turn\s+\d+\s+(query|response)\s+statement\.?$/i.test(sentence.transliteration || '')) {
      remaining.add(sentence.arabic);
    }
  }
}

// Print their unicode escape sequences for debugging
for (const arabic of remaining) {
  let escaped = '';
  for (const ch of arabic) {
    const code = ch.codePointAt(0);
    if (code > 127) {
      escaped += `\\u${code.toString(16).padStart(4, '0')}`;
    } else {
      escaped += ch;
    }
  }
  console.log(`["${escaped}", "TRANSLITERATION_HERE"],`);
}
