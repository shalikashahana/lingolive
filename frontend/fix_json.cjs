const fs = require('fs');

const dataRaw = fs.readFileSync('src/data/arabicSentencesData.json', 'utf8');
let fixedRaw = dataRaw;

// Find the last "]" and "}" before Module 5.
const boundaryRegex = /      \]\n    }\n  \]\n}\n\{\n  "module": "5",/;
if (boundaryRegex.test(fixedRaw)) {
  fixedRaw = fixedRaw.replace(boundaryRegex, '      ]\n    },\n    {\n      "module": "5",');
} else {
  // Try more generic replacement
  fixedRaw = fixedRaw.replace(/\]\s*\}\s*\{\s*"module": "5"/, '],\n    {\n      "module": "5"');
}

// Fix the end of the file.
// The user's pasted data ends at '  ]', it misses '}' for the object, ']' for the modules array, '}' for root.
fixedRaw = fixedRaw.trim();
if (fixedRaw.endsWith(']')) {
  fixedRaw += '\n}\n  ]\n}';
}

fs.writeFileSync('src/data/arabicSentencesData_temp.json', fixedRaw);

try {
  const data = JSON.parse(fixedRaw);
  
  // Find Module 5
  const mod5 = data.modules.find(m => m.module === "5");
  if (mod5 && mod5.dialogues) {
    const newSentences = [];
    let idCounter = 1;
    for (const dialogue of mod5.dialogues) {
      newSentences.push({
        id: idCounter++,
        arabic: dialogue.person_1.arabic,
        transliteration: dialogue.person_1.transliteration,
        meaning_english: dialogue.person_1.meaning_english,
        meaning_tamil: dialogue.person_1.meaning_tamil
      });
      newSentences.push({
        id: idCounter++,
        arabic: dialogue.person_2.arabic,
        transliteration: dialogue.person_2.transliteration,
        meaning_english: dialogue.person_2.meaning_english,
        meaning_tamil: dialogue.person_2.meaning_tamil
      });
    }
    
    mod5.sentences = newSentences;
    mod5.total_sentences = newSentences.length;
    delete mod5.dialogues;
    delete mod5.total_dialogues;
  }
  
  // Update root total sentences
  data.total_sentences = data.modules.reduce((acc, m) => acc + (m.total_sentences || 0), 0);
  
  fs.writeFileSync('src/data/arabicSentencesData.json', JSON.stringify(data, null, 2));
  console.log("Success");
} catch (e) {
  console.error("Failed to parse JSON", e);
}
