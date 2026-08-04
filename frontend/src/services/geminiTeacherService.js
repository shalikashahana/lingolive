// Gemini AI Teacher Service: Handles per-language Gemini API keys and multi-turn review session generation

const LANGUAGE_KEY_MAPPING = {
  english: "VITE_GEMINI_API_KEY_ENGLISH",
  hindi: "VITE_GEMINI_API_KEY_HINDI",
  malayalam: "VITE_GEMINI_API_KEY_MALAYALAM",
  telugu: "VITE_GEMINI_API_KEY_TELUGU",
  japanese: "VITE_GEMINI_API_KEY_JAPANESE",
  korean: "VITE_GEMINI_API_KEY_KOREAN",
  chinese: "VITE_GEMINI_API_KEY_CHINESE",
  thai: "VITE_GEMINI_API_KEY_THAI",
  arabic: "VITE_GEMINI_API_KEY_ARABIC"
};

/**
 * Gets the configured Gemini API key for a specific language
 */
export function getGeminiApiKeyForLanguage(language) {
  const langLower = (language || "english").toLowerCase();
  
  const customKey = localStorage.getItem(`mozhify_gemini_key_${langLower}`);
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }

  const envVarName = LANGUAGE_KEY_MAPPING[langLower];
  if (envVarName && import.meta.env[envVarName]) {
    return import.meta.env[envVarName].trim();
  }

  return import.meta.env.VITE_GEMINI_API_KEY || "";
}

/**
 * Saves custom Gemini API key for a language in localStorage
 */
export function setGeminiApiKeyForLanguage(language, key) {
  const langLower = (language || "english").toLowerCase();
  if (!key) {
    localStorage.removeItem(`mozhify_gemini_key_${langLower}`);
  } else {
    localStorage.setItem(`mozhify_gemini_key_${langLower}`, key.trim());
  }
}

/**
 * Normalizes item objects across all 9 languages & data schemas into real practice info
 */
export function extractItemPracticeInfo(item, language = "english") {
  if (!item) return null;

  // Format 1: Telugu Quiz { en: "I", ta: "நான்", options: [{ te: "నేను", tr: "nenu", ans: true }] }
  if (item.en && Array.isArray(item.options)) {
    const correctOpt = item.options.find(o => o.ans || o.isCorrect || o.correct) || item.options[0];
    const targetWord = correctOpt?.te || correctOpt?.tr || item.en;
    const transliteration = correctOpt?.tr || "";
    const englishMeaning = item.en;
    const tamilMeaning = item.ta || "";

    const wrongOpts = item.options.filter(o => !o.ans && o !== correctOpt).map(o => o.te || o.tr || o.text);

    return {
      targetWord: transliteration ? `${targetWord} (${transliteration})` : targetWord,
      rawTargetWord: targetWord,
      transliteration: transliteration,
      englishMeaning: englishMeaning,
      tamilMeaning: tamilMeaning,
      wrongOptions: wrongOpts
    };
  }

  // Format 2: Japanese / Chinese / Hindi / Arabic / Thai data { japanese, english_transliteration, english_meaning }
  if (item.japanese || item.chinese || item.arabic || item.hindi || item.word) {
    const targetWord = item.japanese || item.chinese || item.arabic || item.hindi || item.word;
    const transliteration = item.english_transliteration || item.pinyin || item.transliteration || "";
    const englishMeaning = item.english_meaning || item.meaning || item.english || "Meaning";

    return {
      targetWord: transliteration ? `${targetWord} (${transliteration})` : targetWord,
      rawTargetWord: targetWord,
      transliteration: transliteration,
      englishMeaning: englishMeaning,
      wrongOptions: ["Greetings", "Thank you", "Goodbye", "Friendship"]
    };
  }

  // Format 3: Generic question format { question, options, correct_answer }
  if (item.question || item.text) {
    const questionText = item.question || item.text;
    const meaning = item.correct_answer || item.meaning || item.english || "Correct Answer";
    const wrongOpts = Array.isArray(item.options) ? item.options.filter(o => o !== meaning) : ["Option A", "Option B"];

    return {
      targetWord: questionText,
      rawTargetWord: questionText,
      transliteration: "",
      englishMeaning: meaning,
      wrongOptions: wrongOpts
    };
  }

  return null;
}

// Utility array shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a 5-question multi-turn review session from the Cat AI Teacher
 * based on the actual items completed in Level N (with non-repeating items on retry)
 */
export async function generateCatReviewSession({ language, category, level, items = [], retrySeed = Math.random() }) {
  const apiKey = getGeminiApiKeyForLanguage(language);

  // Extract and shuffle practice items for variety on retry
  const normalizedItems = shuffle(
    (items || []).map(i => extractItemPracticeInfo(i, language)).filter(Boolean)
  );

  if (!apiKey) {
    return generateFallbackReviewSession({ language, category, level, items, normalizedItems, retrySeed });
  }

  const sampleItemsPrompt = normalizedItems.slice(0, 10).map(i => ({
    targetWord: i.targetWord,
    rawTargetWord: i.rawTargetWord,
    transliteration: i.transliteration,
    englishMeaning: i.englishMeaning
  }));

  const prompt = `You are a cute, friendly, highly encouraging Cat AI Teacher for language learners studying ${language}.
The user is practicing Level ${level}. (Attempt seed: ${retrySeed})
Here are the REAL vocabulary words/sentences for Level ${level}:
${JSON.stringify(sampleItemsPrompt)}

Generate a 5-question review quiz testing ONLY these REAL vocabulary items from Level ${level}.
Do NOT use generic placeholder words or fake options.
Respond ONLY with a valid JSON array of 5 objects in the exact following structure without markdown formatting or code blocks:
[
  {
    "questionText": "Question 1 asking how to say a specific word/phrase from Level ${level} in ${language} or English",
    "options": ["Correct Option", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3"],
    "correctIndex": 0,
    "acceptableAnswers": ["Correct Option", "raw target word", "transliteration", "english meaning"],
    "encouragement": "Cute encouraging cat comment for question 1!"
  },
  {
    "questionText": "Question 2 asking about another REAL word/phrase from Level ${level}",
    "options": ["Wrong Option 1", "Correct Option", "Wrong Option 2", "Wrong Option 3"],
    "correctIndex": 1,
    "acceptableAnswers": ["Correct Option", "raw target word", "transliteration", "english meaning"],
    "encouragement": "Super cute cat comment for question 2!"
  },
  {
    "questionText": "Question 3 asking about a 3rd REAL word/phrase from Level ${level}",
    "options": ["Wrong Option 1", "Wrong Option 2", "Correct Option", "Wrong Option 3"],
    "correctIndex": 2,
    "acceptableAnswers": ["Correct Option", "raw target word", "transliteration", "english meaning"],
    "encouragement": "Cat comment for question 3!"
  },
  {
    "questionText": "Question 4 asking about a 4th REAL word/phrase from Level ${level}",
    "options": ["Wrong Option 1", "Wrong Option 2", "Wrong Option 3", "Correct Option"],
    "correctIndex": 3,
    "acceptableAnswers": ["Correct Option", "raw target word", "transliteration", "english meaning"],
    "encouragement": "Cat comment for question 4!"
  },
  {
    "questionText": "Question 5 asking about a 5th REAL word/phrase from Level ${level}",
    "options": ["Correct Option", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3"],
    "correctIndex": 0,
    "acceptableAnswers": ["Correct Option", "raw target word", "transliteration", "english meaning"],
    "encouragement": "Final cheerful cat celebration comment!"
  }
]`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText) {
      const parsed = JSON.parse(responseText.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed) && parsed.length >= 5) {
        return parsed.slice(0, 5);
      }
    }
    throw new Error("Invalid format from Gemini");
  } catch (err) {
    console.warn("Gemini question generation error, using fallback session:", err);
    return generateFallbackReviewSession({ language, category, level, items, normalizedItems, retrySeed });
  }
}

export const generateCatFollowUpQuestion = generateCatReviewSession;

/**
 * Smart Fallback multi-turn review session generator producing 5 non-repeating questions
 */
function generateFallbackReviewSession({ language, category, level, items = [], normalizedItems = [], retrySeed = Math.random() }) {
  const activeItems = normalizedItems.length > 0 ? normalizedItems : shuffle((items || []).map(i => extractItemPracticeInfo(i, language)).filter(Boolean));

  if (activeItems.length > 0) {
    // Generate 5 questions by rotating and shuffling active items
    const shuffledPool = shuffle(activeItems);

    return [0, 1, 2, 3, 4].map((stepIdx) => {
      const targetItem = shuffledPool[stepIdx % shuffledPool.length];
      const targetWord = targetItem.targetWord;
      const rawTargetWord = targetItem.rawTargetWord;
      const transliteration = targetItem.transliteration;
      const englishMeaning = targetItem.englishMeaning;

      // Vary question phrasing per turn
      const isTargetToEnglish = stepIdx % 2 === 1;

      let questionText = "";
      let correctAnswer = "";
      let wrongPool = [];
      let acceptableAnswers = [targetWord, rawTargetWord, transliteration, englishMeaning].filter(Boolean);

      if (isTargetToEnglish) {
        questionText = `Meow! 🐾 Question ${stepIdx + 1}/5: In Level ${level}, what does "${targetWord}" mean in English?`;
        correctAnswer = englishMeaning;
        wrongPool = ["Thank you", "Good morning", "Goodbye", "Please", "Water", "Friendship", "See you later", "Welcome", "Happy day"]
          .filter(w => w.toLowerCase() !== englishMeaning.toLowerCase());
      } else {
        questionText = `Meow! 🐾 Question ${stepIdx + 1}/5: How do you say "${englishMeaning}" in ${language}?`;
        correctAnswer = targetWord;
        wrongPool = activeItems
          .filter(i => i.targetWord !== targetWord)
          .map(i => i.targetWord);

        if (wrongPool.length < 3) {
          wrongPool.push("నమస్కారం (namaskaram)", "ధన్యవాదాలు (dhanyavadalu)", "సుస్వాగతం (suswagatam)");
        }
      }

      const wrong3 = shuffle(wrongPool).slice(0, 3);
      const options = shuffle([correctAnswer, ...wrong3]);
      const correctIndex = options.indexOf(correctAnswer);

      return {
        questionText,
        options,
        correctIndex,
        acceptableAnswers,
        encouragement: stepIdx === 4 ? "🎉 Outstanding! You completed all 5 Level review questions!" : "Great job! On to the next question! 💖"
      };
    });
  }

  // Generic fallback if no items passed
  return [
    {
      questionText: `Meow! 🐾 Question 1/5: How do you say 'Hello / Greetings' in ${language}?`,
      options: ["Greetings / Hello", "Goodbye", "Thank you", "Good night"],
      correctIndex: 0,
      acceptableAnswers: ["Greetings / Hello", "greetings", "hello", "namaskaram", "vanakkam", "konnichiwa", "ni hao"],
      encouragement: "Awesome start! 🚀"
    },
    {
      questionText: `Question 2/5: What is the word for 'Thank you' in ${language}?`,
      options: ["Thank you / Thanks", "No thanks", "Sorry", "Please"],
      correctIndex: 0,
      acceptableAnswers: ["Thank you / Thanks", "thank you", "thanks", "dhanyavadalu", "nandri", "arigatou", "xie xie"],
      encouragement: "Fantastic progress! 💖"
    },
    {
      questionText: `Question 3/5: How do you express 'Welcome' in ${language}?`,
      options: ["Welcome / Greetings", "See you later", "Stop", "Run"],
      correctIndex: 0,
      acceptableAnswers: ["Welcome / Greetings", "welcome", "greetings", "suswagatam", "irasshaimase"],
      encouragement: "Superb! Halfway there! 🌟"
    },
    {
      questionText: `Question 4/5: How do you say 'Good morning' in ${language}?`,
      options: ["Good morning / Morning", "Good night", "Bad day", "Slow down"],
      correctIndex: 0,
      acceptableAnswers: ["Good morning / Morning", "good morning", "morning", "subhodayam", "ohayou"],
      encouragement: "Almost done! 🚀"
    },
    {
      questionText: `Question 5/5: How do you say 'Goodbye' in ${language}?`,
      options: ["Goodbye / Farewell", "Hello", "Thank you", "Come here"],
      correctIndex: 0,
      acceptableAnswers: ["Goodbye / Farewell", "goodbye", "farewell", "velli vasthanu", "sayonara"],
      encouragement: "🎉 Level review session complete!"
    }
  ];
}
