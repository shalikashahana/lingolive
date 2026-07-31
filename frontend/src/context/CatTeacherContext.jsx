import React, { createContext, useContext, useState } from "react";
import CatTeacherModal from "../components/catTeacher/CatTeacherModal";
import GeminiKeysConfigModal from "../components/catTeacher/GeminiKeysConfigModal";
import FloatingCatTeacherButton from "../components/catTeacher/FloatingCatTeacherButton";

const CatTeacherContext = createContext();

export function CatTeacherProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    language: "english",
    category: "Quiz",
    level: 1,
    items: []
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const triggerCatTeacherModal = ({ language = "english", category = "Quiz", level = 1, items = [], onUnlockNextLevel = null }) => {
    setModalState({
      isOpen: true,
      language,
      category,
      level,
      items,
      onUnlockNextLevel
    });
  };

  const closeCatTeacherModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const openSettingsModal = () => {
    setIsSettingsOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsOpen(false);
  };

  return (
    <CatTeacherContext.Provider
      value={{
        triggerCatTeacherModal,
        closeCatTeacherModal,
        openSettingsModal,
        closeSettingsModal
      }}
    >
      {children}

      {/* Main Cat AI Teacher Modal */}
      <CatTeacherModal
        isOpen={modalState.isOpen}
        onClose={closeCatTeacherModal}
        language={modalState.language}
        category={modalState.category}
        level={modalState.level}
        items={modalState.items}
        onOpenSettings={openSettingsModal}
        onUnlockNextLevel={modalState.onUnlockNextLevel}
      />

      {/* Gemini API Keys Configuration Modal */}
      <GeminiKeysConfigModal
        isOpen={isSettingsOpen}
        onClose={closeSettingsModal}
      />
    </CatTeacherContext.Provider>
  );
}

export function useCatTeacher() {
  const context = useContext(CatTeacherContext);
  if (!context) {
    throw new Error("useCatTeacher must be used within a CatTeacherProvider");
  }
  return context;
}
