// Cat Curriculum Service: Dynamically extracts 50 levels x 5 tasks for all 9 languages

import japaneseWords from "../data/japaneseWordsData.json";
import japaneseSentences from "../data/japaneseSentencesData.json";
import japaneseQuiz from "../data/japaneseQuizData.json";

import chineseWords from "../data/chineseWordsData.json";
import chineseSentences from "../data/chineseSentencesData.json";
import chineseQuiz from "../data/chineseQuizData.json";

import hindiWords from "../data/hindiWordsData.json";
import hindiSentences from "../data/hindiSentencesData.json";
import hindiQuiz from "../data/hindiQuizData.json";

import koreanWords from "../data/koreanWordsData.json";
import koreanSentences from "../data/koreanSentencesData.json";
import koreanQuiz from "../data/koreanQuizData.json";

import malayalamWords from "../data/malayalamWordsData.json";
import malayalamSentences from "../data/malayalamSentencesData.json";
import malayalamQuiz from "../data/malayalamQuizData.json";

import arabicWords from "../data/arabicWordsData.json";
import arabicSentences from "../data/arabicSentencesData.json";
import arabicQuiz from "../data/arabicQuizData.json";

import thaiWords from "../data/thaiWordsData.json";
import thaiSentences from "../data/thaiSentencesData.json";
import thaiQuiz from "../data/thaiQuizData.json";

import { teluguWords } from "../data/teluguWordsData";
import { teluguSentences } from "../data/teluguSentencesData";
import { teluguQuizData } from "../data/teluguQuizData";

import { SAMPLE_QUIZZES } from "../data/mockData";
import { sentencesData } from "../data/sentencesData";
import { idiomsData } from "../data/idiomsData";

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.words) return data.words;
  if (data.sentences) return data.sentences;
  if (data.questions) return data.questions;
  if (data.modules) return data.modules.flatMap(m => m.quiz || m.sentences || []);
  return [];
};

/**
 * Returns raw pool of words, sentences, and quizzes for any target language
 */
export function getLanguageDataPools(language = "english") {
  const langLower = (language || "english").toLowerCase();

  switch (langLower) {
    case "japanese":
      return {
        words: extractArray(japaneseWords),
        sentences: extractArray(japaneseSentences),
        quizzes: extractArray(japaneseQuiz)
      };
    case "chinese":
      return {
        words: extractArray(chineseWords),
        sentences: extractArray(chineseSentences),
        quizzes: extractArray(chineseQuiz)
      };
    case "hindi":
      return {
        words: extractArray(hindiWords),
        sentences: extractArray(hindiSentences),
        quizzes: extractArray(hindiQuiz)
      };
    case "korean":
      return {
        words: extractArray(koreanWords),
        sentences: extractArray(koreanSentences),
        quizzes: extractArray(koreanQuiz)
      };
    case "malayalam":
      return {
        words: extractArray(malayalamWords),
        sentences: extractArray(malayalamSentences),
        quizzes: extractArray(malayalamQuiz)
      };
    case "arabic":
      return {
        words: extractArray(arabicWords),
        sentences: extractArray(arabicSentences),
        quizzes: extractArray(arabicQuiz)
      };
    case "thai":
      return {
        words: extractArray(thaiWords),
        sentences: extractArray(thaiSentences),
        quizzes: extractArray(thaiQuiz)
      };
    case "telugu":
      return {
        words: extractArray(teluguWords),
        sentences: extractArray(teluguSentences),
        quizzes: extractArray(teluguQuizData)
      };
    case "english":
    default:
      return {
        words: extractArray(idiomsData),
        sentences: extractArray(sentencesData),
        quizzes: extractArray(SAMPLE_QUIZZES)
      };
  }
}

/**
 * Returns a 50-Level curriculum array for a given language
 * - Levels 1–10  : Essential Words (5 items per level)
 * - Levels 11–30 : Daily Sentences (5 items per level)
 * - Levels 31–50 : Advanced Sentences & Quizzes (5 items per level)
 */
export function get50LevelCurriculumForLanguage(language = "english") {
  const pools = getLanguageDataPools(language);
  const levels = [];

  for (let levelNum = 1; levelNum <= 50; levelNum++) {
    let milestone = "Essential Words & Vocabulary";
    let milestoneType = "words";
    let poolSource = pools.words;

    if (levelNum >= 11 && levelNum <= 30) {
      milestone = "Daily Expressions & Short Sentences";
      milestoneType = "sentences";
      poolSource = pools.sentences.length > 0 ? pools.sentences : pools.words;
    } else if (levelNum >= 31) {
      milestone = "Advanced Conversations & Quizzes";
      milestoneType = "quizzes";
      poolSource = pools.quizzes.length > 0 ? pools.quizzes : pools.sentences;
    }

    const offset = ((levelNum - 1) % 10) * 5;
    let levelItems = [];

    if (poolSource && poolSource.length >= offset + 5) {
      levelItems = poolSource.slice(offset, offset + 5);
    } else if (poolSource && poolSource.length > 0) {
      levelItems = Array.from({ length: 5 }, (_, i) => poolSource[(offset + i) % poolSource.length]);
    } else {
      levelItems = Array.from({ length: 5 }, (_, i) => ({
        word: `Practice Item ${offset + i + 1}`,
        english: `English Meaning ${offset + i + 1}`
      }));
    }

    levels.push({
      level: levelNum,
      milestone,
      milestoneType,
      title: `Level ${levelNum}: ${milestone}`,
      tasks: levelItems
    });
  }

  return levels;
}
