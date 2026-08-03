import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CatTeacherProvider } from "./context/CatTeacherContext";
import AppLayout from "./components/AppLayout";
import Login from "./pages/shared/Login";
import AboutUs from "./pages/shared/AboutUs";
import Dashboard from "./pages/shared/Dashboard";
import Vocabulary from "./pages/english/Vocabulary";
import Reading from "./pages/english/Reading";
import Quiz from "./pages/english/Quiz";
import TeluguQuiz from "./pages/telugu/TeluguQuiz";
import Analytics from "./pages/shared/Analytics";
import Story from "./pages/english/Story";
import Videos from "./pages/shared/Videos";
import Sentences from "./pages/english/Sentences";
import TeluguSentences from "./pages/telugu/TeluguSentences";
import Idioms from "./pages/english/Idioms";
import Grammar from "./pages/english/Grammar";
import SelectLanguage from "./pages/shared/SelectLanguage";
import EnglishPath from "./pages/english/EnglishPath";
import MalayalamAlphabet from "./pages/malayalam/MalayalamAlphabet";
import HindiDashboard from "./pages/hindi/HindiDashboard";
import MalayalamDashboard from "./pages/malayalam/MalayalamDashboard";
import KoreanDashboard from "./pages/korean/KoreanDashboard";
import KoreanQuiz from "./pages/korean/KoreanQuiz";
import JapaneseDashboard from "./pages/japanese/JapaneseDashboard";
import TeluguDashboard from "./pages/telugu/TeluguDashboard";
import TeluguChat from "./pages/telugu/TeluguChat";
import ThaiDashboard from "./pages/thai/ThaiDashboard";
import ChineseDashboard from "./pages/chinese/ChineseDashboard";
import Chat from "./pages/english/Chat";
import ArabicDashboard from "./pages/arabic/ArabicDashboard";
import HindiChat from "./pages/hindi/HindiChat";


function PrivateRoute({ children, checkLanguage = true }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] font-sans text-sm font-semibold text-[#14213D]">
        Loading LingoLive Platform…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (checkLanguage) {
    const lang = localStorage.getItem("lingolive_target_language");
    if (!lang) {
      return <Navigate to="/select-language" replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CatTeacherProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route 
            path="/select-language" 
            element={
              <PrivateRoute checkLanguage={false}>
                <SelectLanguage />
              </PrivateRoute>
            } 
          />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/path" element={<EnglishPath />} />
                    <Route path="/vocabulary" element={<Vocabulary />} />
                    <Route path="/reading" element={<Reading />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/telugu-quiz" element={<TeluguQuiz />} />
                    <Route path="/korean-quiz" element={<KoreanQuiz />} />
                    <Route path="/telugu-sentences" element={<TeluguSentences />} />
                    <Route path="/malayalam-alphabet" element={<MalayalamAlphabet />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/story" element={<Story />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/sentences" element={<Sentences />} />
                    <Route path="/idioms" element={<Idioms />} />
                    <Route path="/grammar" element={<Grammar />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/hindi-learning" element={<HindiDashboard />} />
                    <Route path="/malayalam-learning" element={<MalayalamDashboard />} />
                    <Route path="/korean-learning" element={<KoreanDashboard />} />
                    <Route path="/japanese-learning" element={<JapaneseDashboard />} />
                    <Route path="/thai-learning" element={<ThaiDashboard />} />
                    <Route path="/chinese-learning" element={<ChineseDashboard />} />
                    <Route path="/arabic-learning" element={<ArabicDashboard />} />
                    <Route path="/telugu-learning" element={<TeluguDashboard />} />
                    <Route path="/telugu-chat" element={<TeluguChat />} />
                    <Route path="/hindi-chat" element={<HindiChat />} />


                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </CatTeacherProvider>
  </AuthProvider>
  );
}
