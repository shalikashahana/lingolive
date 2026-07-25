import { useEffect, useState } from "react";
import TeluguDashboard from "../telugu/TeluguDashboard";
import EnglishDashboard from "../english/EnglishDashboard";
import GenericLanding from "./GenericLanding";

export default function Dashboard() {
  const [targetLanguage, setTargetLanguage] = useState("en");

  useEffect(() => {
    const lang = localStorage.getItem("lingolive_target_language") || "en";
    setTargetLanguage(lang);
  }, []);

  if (targetLanguage === "te") return <TeluguDashboard />;
  if (targetLanguage === "ml") return <GenericLanding languageName="Malayalam" path="/malayalam-learning" />;
  if (targetLanguage === "hi") return <GenericLanding languageName="Hindi" path="/hindi-learning" />;
  if (targetLanguage === "ko") return <GenericLanding languageName="Korean" path="/korean-learning" />;
  if (targetLanguage === "ja") return <GenericLanding languageName="Japanese" path="/japanese-learning" />;
  if (targetLanguage === "th") return <GenericLanding languageName="Thai" path="/thai-learning" />;
  if (targetLanguage === "zh") return <GenericLanding languageName="Chinese" path="/chinese-learning" />;
  if (targetLanguage === "ar") return <GenericLanding languageName="Arabic" path="/arabic-learning" />;

  return <EnglishDashboard />;
}
