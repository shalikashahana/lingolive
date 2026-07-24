import { useEffect, useState } from "react";
import TeluguDashboard from "../telugu/TeluguDashboard";
import EnglishDashboard from "../english/EnglishDashboard";
import MalayalamDashboard from "../malayalam/MalayalamDashboard";

export default function Dashboard() {
  const [targetLanguage, setTargetLanguage] = useState("en");

  useEffect(() => {
    const lang = localStorage.getItem("lingolive_target_language") || "en";
    setTargetLanguage(lang);
  }, []);

  if (targetLanguage === "te") {
    return <TeluguDashboard />;
  }

  if (targetLanguage === "ml") {
    return <MalayalamDashboard />;
  }

  return <EnglishDashboard />;
}
