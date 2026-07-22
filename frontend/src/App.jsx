import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vocabulary from "./pages/Vocabulary";
import Reading from "./pages/Reading";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import Analytics from "./pages/Analytics";
import Story from "./pages/Story";
import Videos from "./pages/Videos";
import Sentences from "./pages/Sentences";
import Idioms from "./pages/Idioms";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] font-sans text-sm font-semibold text-[#14213D]">
        Loading LingoLive Platform…
      </div>
    );
  }
  // In demo/dev mode, allow accessing platform routes seamlessly
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/vocabulary" element={<Vocabulary />} />
                    <Route path="/reading" element={<Reading />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/story" element={<Story />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/sentences" element={<Sentences />} />
                    <Route path="/idioms" element={<Idioms />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
