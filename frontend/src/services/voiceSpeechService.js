// Voice Speech Service: Handles Speech Synthesis (TTS) & Speech Recognition (STT) for 9 Languages

const LANGUAGE_VOICE_CODES = {
  english: "en-US",
  hindi: "hi-IN",
  malayalam: "ml-IN",
  telugu: "te-IN",
  tamil: "ta-IN",
  japanese: "ja-JP",
  korean: "ko-KR",
  chinese: "zh-CN",
  thai: "th-TH",
  arabic: "ar-SA"
};

let activeRecognitionInstance = null;

/**
 * Stops active voice recognition
 */
export function stopVoiceRecognition() {
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.abort();
    } catch (e) {}
    activeRecognitionInstance = null;
  }
}

/**
 * Speaks text using Web SpeechSynthesis API with language selection
 * @param {string} text - Text to be spoken
 * @param {string} language - Target language key (e.g. 'japanese', 'english')
 * @param {function} onStart - Callback when speech starts
 * @param {function} onEnd - Callback when speech ends
 */
export function speakText(text, language = "english", onStart = null, onEnd = null) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis is not supported in this browser.");
    if (onEnd) onEnd();
    return;
  }

  // Stop STT before Cat starts speaking so microphone doesn't record TTS audio!
  stopVoiceRecognition();

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const langCode = LANGUAGE_VOICE_CODES[language.toLowerCase()] || "en-US";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.92;
  utterance.pitch = 1.25; // Cute cat voice pitch!

  // Find optimal voice for language if available
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = langCode.split("-")[0];
  
  // Try to find a Google voice first (usually much better quality), then fallback to any voice matching language
  const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes("Google")) 
                     || voices.find(v => v.lang.startsWith(langPrefix));
                     
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (onStart) {
    utterance.onstart = onStart;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (err) => {
    console.error("SpeechSynthesis error:", err);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any current voice playback
 */
export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  stopVoiceRecognition();
}

/**
 * Listens to user voice input using Web SpeechRecognition
 * @param {string} language - Target language key
 * @param {function} onResult - Callback with transcript string
 * @param {function} onError - Callback on error
 * @returns {object|null} Recognition object or null if unsupported
 */
export function startVoiceRecognition(language = "english", onResult, onError) {
  stopVoiceRecognition();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    if (onError) onError("Voice recognition is not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  const langCode = LANGUAGE_VOICE_CODES[language.toLowerCase()] || "en-US";

  recognition.lang = langCode;
  recognition.continuous = false;
  recognition.interimResults = false;

  let hasResult = false;

  recognition.onresult = (event) => {
    hasResult = true;
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (hasResult || event.error === 'aborted') return;
    console.error("Speech recognition error:", event.error);
    if (onError) onError(event.error);
  };

  activeRecognitionInstance = recognition;

  try {
    recognition.start();
  } catch (err) {
    console.error("Recognition start failed:", err);
  }

  return recognition;
}
