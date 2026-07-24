const fs = require('fs');
const readline = require('readline');

const filePath = 'C:\\Users\\shalika shahana\\.gemini\\antigravity-ide\\brain\\d26e8b4c-a495-48a0-9e3d-e590ce742ce0\\.system_generated\\logs\\transcript_full.jsonl';
const outPath = 'C:\\Users\\shalika shahana\\.gemini\\antigravity-ide\\brain\\d26e8b4c-a495-48a0-9e3d-e590ce742ce0\\latest_prompt.txt';

async function processLineByLine() {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastUserInput = null;
  for await (const line of rl) {
    if (line.includes('"type":"USER_INPUT"')) {
      lastUserInput = line;
    }
  }

  if (lastUserInput) {
    const data = JSON.parse(lastUserInput);
    fs.writeFileSync(outPath, data.content);
    console.log("Saved to latest_prompt.txt");
  } else {
    console.log("No USER_INPUT found.");
  }
}

processLineByLine();
