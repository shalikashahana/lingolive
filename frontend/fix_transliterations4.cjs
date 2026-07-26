const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/arabicSentencesData.json', 'utf8'));

// Build a map from arabic -> transliteration using the already-fixed sentences
// The pattern in Module 5 is that sentences repeat (30 dialogue pairs * 7 repetitions approx)
// So we can use sentences that ALREADY have correct transliterations to fill in the others

const arabicToTranslit = {};

// First pass: collect all arabic->transliteration pairs where transliteration is NOT a placeholder
for (const module of data.modules) {
  if (!module.sentences) continue;
  for (const sentence of module.sentences) {
    const t = sentence.transliteration || '';
    const isPlaceholder = /^Turn\s+\d+\s+(query|response)\s+statement\.?$/i.test(t);
    if (!isPlaceholder && t.trim()) {
      arabicToTranslit[sentence.arabic] = t;
    }
  }
}

console.log(`Collected ${Object.keys(arabicToTranslit).length} known transliterations`);

// Second pass: use collected map to fill in the gaps
let fixedCount = 0;
for (const module of data.modules) {
  if (!module.sentences) continue;
  for (const sentence of module.sentences) {
    const t = sentence.transliteration || '';
    const isPlaceholder = /^Turn\s+\d+\s+(query|response)\s+statement\.?$/i.test(t);
    const isEmpty = !t.trim();
    
    if (isPlaceholder || isEmpty) {
      const found = arabicToTranslit[sentence.arabic];
      if (found) {
        sentence.transliteration = found;
        fixedCount++;
      }
    }
  }
}

fs.writeFileSync('src/data/arabicSentencesData.json', JSON.stringify(data, null, 2));
console.log(`Fixed ${fixedCount} transliterations using cross-reference from other sentences.`);

// Final count
let remaining = 0;
for (const m of data.modules) {
  if (!m.sentences) continue;
  for (const s of m.sentences) {
    if (/^Turn\s+\d+\s+(query|response)\s+statement/i.test(s.transliteration || '')) remaining++;
  }
}
console.log(`Still remaining: ${remaining}`);
