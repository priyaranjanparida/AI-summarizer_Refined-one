/* ============================================================
   APP CONTEXT — Central State Management
   ============================================================
   This file creates a React Context that acts as the single
   source of truth for the entire app. Components call the
   `useAppContext()` hook to read state and dispatch actions.

   WHY CONTEXT?
   Instead of "prop-drilling" (passing data through many layers),
   any component anywhere in the tree can access shared state.
   This is especially useful when many components need the same
   data — like the current input, settings, and results.

   PM INSIGHT:
   State management is one of the biggest architectural decisions
   in any frontend app. For small apps, React Context is sufficient.
   For larger apps (100+ components), libraries like Redux or
   Zustand provide better performance through selective updates.
   ============================================================ */

import { createContext, useContext, useState, useCallback } from 'react';

// 1. Create the context object — think of it as a "global variable container"
const AppContext = createContext(null);

/* ------------------------------------------------------------
   AppProvider — wraps the app and provides state to all children
   ------------------------------------------------------------ */
export function AppProvider({ children }) {

  /* ============================================================
     INPUT STATE
     ============================================================
     Tracks what content the user has provided and in which mode.
     - inputMode: which tab is active ('text', 'file', 'youtube')
     - inputContent: the raw text string or YouTube URL
     - selectedFile: the File object from file upload (or null)
     ============================================================ */
  const [inputMode, setInputMode] = useState('text');
  const [inputContent, setInputContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  /* ============================================================
     SETTINGS STATE
     ============================================================
     Configuration for the summarization request.
     - provider: which LLM to use ('openai', 'claude', etc.)
     - apiKey: the user's API key for the selected provider
     - summaryType: what kind of summary ('interview', 'learning', 'concept')
     ============================================================ */
  const [settings, setSettings] = useState({
    provider: 'openai',
    apiKey: '',
    summaryType: 'interview',
  });

  /* ============================================================
     RESULT STATE
     ============================================================
     - result: the generated summary (markdown string) or null
     - isLoading: whether a request is in progress
     - error: error message string or null
     ============================================================ */
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ============================================================
     HISTORY STATE
     ============================================================
     - history: array of past conversation objects
     - isHistoryOpen: controls the slide-in sidebar drawer
     ============================================================ */
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  /* ============================================================
     ACTIONS (Functions that modify state)
     ============================================================
     useCallback ensures these functions keep a stable reference,
     which prevents unnecessary re-renders in child components.
     ============================================================ */

  // Merge partial settings into the existing settings object
  // Example: updateSettings({ provider: 'claude' }) only changes provider
  const updateSettings = useCallback((partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  // Toggle the history sidebar open/closed
  const toggleHistory = useCallback(() => {
    setIsHistoryOpen((prev) => !prev);
  }, []);

  // Close the history sidebar explicitly
  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
  }, []);

  // Load a past conversation — restores the saved result without re-calling LLM
  const loadConversation = useCallback((conversation) => {
    setResult(conversation.result);
    setInputContent(conversation.inputContent || '');
    setInputMode(conversation.inputMode || 'text');
    setSettings((prev) => ({
      ...prev,
      provider: conversation.provider || prev.provider,
      summaryType: conversation.summaryType || prev.summaryType,
    }));
    setError(null);
  }, []);

  // Delete a single conversation from history
  const deleteConversation = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear the entire history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Clear current result and error
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  // Add a conversation to history (called after successful generation)
  const addToHistory = useCallback((conversation) => {
    setHistory((prev) => {
      const updated = [conversation, ...prev];
      // Enforce the 20-conversation limit by removing the oldest
      if (updated.length > 20) {
        return updated.slice(0, 20);
      }
      return updated;
    });
  }, []);

  /* ============================================================
     CONTEXT VALUE
     ============================================================
     Bundle everything into a single value object that all
     child components can access via useAppContext().
     ============================================================ */
  const value = {
    // Input state
    inputMode,
    setInputMode,
    inputContent,
    setInputContent,
    selectedFile,
    setSelectedFile,

    // Settings
    settings,
    updateSettings,

    // Result
    result,
    setResult,
    isLoading,
    setIsLoading,
    error,
    setError,

    // History
    history,
    setHistory,
    isHistoryOpen,
    toggleHistory,
    closeHistory,
    loadConversation,
    deleteConversation,
    clearHistory,
    addToHistory,

    // Utility
    clearResult,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/* ------------------------------------------------------------
   useAppContext — custom hook for consuming the context
   
   Any component that needs access to app state should call:
     const { result, settings, setIsLoading } = useAppContext();
   ------------------------------------------------------------ */
export function useAppContext() {
  const context = useContext(AppContext);

  // Safety check: if someone forgets to wrap the app in <AppProvider>
  if (!context) {
    throw new Error(
      'useAppContext must be used within an <AppProvider>. ' +
      'Wrap your app in <AppProvider> in App.jsx.'
    );
  }

  return context;
}
