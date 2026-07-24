const fs = require('fs');

// Read the raw sentences
const rawData = fs.readFileSync('new_questions2.json', 'utf8');
const sentences = JSON.parse(rawData);

// Generate options for each sentence
const quizQuestions = sentences.map((sentence, index) => {
  // Start with the correct option
  const options = [{
    te: sentence.te,
    tr: sentence.tr,
    ans: true
  }];
  
  // Pick 3 random wrong options from other sentences
  const availableIndices = Array.from({length: sentences.length}, (_, i) => i).filter(i => i !== index);
  // Shuffle available indices
  availableIndices.sort(() => 0.5 - Math.random());
  
  // Take first 3
  const wrongIndices = availableIndices.slice(0, 3);
  wrongIndices.forEach(idx => {
    options.push({
      te: sentences[idx].te,
      tr: sentences[idx].tr,
      ans: false
    });
  });
  
  // Shuffle the 4 options so the correct one isn't always first
  options.sort(() => 0.5 - Math.random());
  
  return {
    id: 500 + index + 1, // IDs 501 to 600
    en: sentence.en,
    ta: sentence.ta,
    options: options
  };
});

// Read existing teluguQuizData.js
const quizContent = fs.readFileSync('teluguQuizData.js', 'utf8');
const lines = quizContent.split('\n');

// Find the last bracket
let lastBracketIndex = lines.length - 1;
while(lastBracketIndex > 0 && !lines[lastBracketIndex].includes(']')) {
    lastBracketIndex--;
}

// Ensure the last item has a comma
const previousLine = lastBracketIndex - 1;
if (!lines[previousLine].endsWith(',')) {
    lines[previousLine] = lines[previousLine] + ',';
}

// Create lines to append
const newLines = quizQuestions.map((q, i) => {
    let str = JSON.stringify(q);
    if (i < quizQuestions.length - 1) str += ',';
    return "  " + str;
});

// Replace the last bracket with our new items and a new bracket
lines.splice(lastBracketIndex, 1, ...newLines, '];');

// Write back
fs.writeFileSync('teluguQuizData.js', lines.join('\n'));
console.log('Successfully appended ' + quizQuestions.length + ' generated quiz questions!');
