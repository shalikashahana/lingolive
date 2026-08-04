import { useEffect, useState } from "react";
import TeluguSentences from "../telugu/TeluguSentences";
import MalayalamDashboard from "../malayalam/MalayalamDashboard";
import HindiDashboard from "../hindi/HindiDashboard";
import KoreanDashboard from "../korean/KoreanDashboard";
import JapaneseDashboard from "../japanese/JapaneseDashboard";
import ThaiDashboard from "../thai/ThaiDashboard";
import ChineseDashboard from "../chinese/ChineseDashboard";
import ArabicDashboard from "../arabic/ArabicDashboard";
import EnglishDashboard from "../english/EnglishDashboard";

export default function Dashboard() {
  const [targetLanguage, setTargetLanguage] = useState("en");

  useEffect(() => {
    const lang = localStorage.getItem("mozhify_target_language") || "en";
    setTargetLanguage(lang);
  }, []);

  if (targetLanguage === "te") return <TeluguSentences />;
  if (targetLanguage === "ml") return <MalayalamDashboard />;
  if (targetLanguage === "hi") return <HindiDashboard />;
  if (targetLanguage === "ko") return <KoreanDashboard />;
  if (targetLanguage === "ja") return <JapaneseDashboard />;
  if (targetLanguage === "th") return <ThaiDashboard />;
  if (targetLanguage === "zh") return <ChineseDashboard />;
  if (targetLanguage === "ar") return <ArabicDashboard />;

  return <EnglishDashboard />;
}
