const fs = require('fs');

const dataFile = 'C:\\Users\\shalika shahana\\OneDrive\\Documents\\mozhify\\frontend\\src\\data\\teluguQuizData.js';
const promptFile = 'C:\\Users\\shalika shahana\\.gemini\\antigravity-ide\\brain\\d26e8b4c-a495-48a0-9e3d-e590ce742ce0\\latest_prompt.txt';

let promptContent = fs.readFileSync(promptFile, 'utf8');

// Find all lines that look like valid JSON objects for the array
const lines = promptContent.split('\n');
const validObjects = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('{"id":') && trimmed.endsWith('},')) {
    validObjects.push(trimmed.slice(0, -1)); // remove trailing comma
  } else if (trimmed.startsWith('{"id":') && trimmed.endsWith('}')) {
    validObjects.push(trimmed);
  }
}

if (validObjects.length > 0) {
  let existingContent = fs.readFileSync(dataFile, 'utf8');
  
  // Find the last closing bracket
  const lastBracketIndex = existingContent.lastIndexOf(']');
  
  if (lastBracketIndex !== -1) {
    const beforeBracket = existingContent.substring(0, lastBracketIndex).trim();
    // make sure there's a comma before appending
    const appendStr = ',\n  ' + validObjects.join(',\n  ') + '\n];\n';
    
    fs.writeFileSync(dataFile, beforeBracket + appendStr);
    console.log(`Appended ${validObjects.length} questions successfully!`);
  } else {
    console.log("Could not find closing bracket in teluguQuizData.js");
  }
} else {
  console.log("No valid objects found to append.");
}
