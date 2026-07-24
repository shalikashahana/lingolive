const fs = require('fs');

// 1. Fix the syntax error in the user's file and parse it
let rawData = fs.readFileSync('new_questions2.json', 'utf8');
// Fix ] followed by [ with optional whitespace
rawData = rawData.replace(/\]\s*\[/g, ',');
const newQuestions = JSON.parse(rawData);

// 2. Format the new questions (rename opts to options, set proper IDs)
const formattedQuestions = newQuestions.map((q, index) => {
    const formatted = { ...q };
    formatted.id = 501 + index;
    if (formatted.opts) {
        formatted.options = formatted.opts;
        delete formatted.opts;
    }
    return formatted;
});

// 3. Read teluguQuizData.js
const { teluguQuizData } = require('./teluguQuizData.js');

// 4. Truncate to the original 500 questions (removing the fake generated ones I added earlier)
const originalData = teluguQuizData.slice(0, 500);

// 5. Append the 200 new questions
const finalData = originalData.concat(formattedQuestions);

// 6. Write back to teluguQuizData.js
fs.writeFileSync(
    'teluguQuizData.js', 
    'export const teluguQuizData = ' + JSON.stringify(finalData, null, 2) + ';\n'
);

console.log(`Successfully added ${formattedQuestions.length} correct questions. Total is now ${finalData.length}.`);
