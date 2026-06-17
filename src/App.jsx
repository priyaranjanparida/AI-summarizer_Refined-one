/* ============================================================
   APP.JSX — Root Component
   ============================================================
   This is the entry point of the React component tree.
   It wraps everything in AppProvider (for global state) and
   lays out the main sections of the application:
   
   1. Header (sticky top bar with history toggle)
   2. Main Content Area:
      - InputPanel (text / file / YouTube input)
      - SettingsPanel (LLM provider, API key, summary type)
      - ResultsPanel (generated summary + download actions)
   3. HistorySidebar (slide-in drawer for past conversations)
   ============================================================ */

import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import SettingsPanel from './components/SettingsPanel';
import ResultsPanel from './components/ResultsPanel';
import HistorySidebar from './components/HistorySidebar';
import Loader from './components/common/Loader';
import './styles/index.css';

/* ------------------------------------------------------------
   AppContent — the actual layout (needs to be INSIDE AppProvider
   so it can use useAppContext)
   ------------------------------------------------------------ */
function AppContent() {
  const { result, isLoading, error } = useAppContext();

  return (
    <>
      {/* Sticky header with app title and history toggle */}
      <Header />

      {/* Main content area — stacked vertically, centered */}
      <main className="main-content">
        {/* Step 1: User provides content */}
        <InputPanel />

        {/* Step 2: User configures settings and triggers generation */}
        <SettingsPanel />

        {/* Loading indicator while LLM processes the request */}
        {isLoading && <Loader />}

        {/* Error message if something went wrong */}
        {error && (
          <div className="error-message" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Step 3: Display the generated summary */}
        {result && !isLoading && <ResultsPanel />}
      </main>

      {/* History sidebar — slide-in drawer, rendered as overlay */}
      <HistorySidebar />
    </>
  );
}

/* ------------------------------------------------------------
   App — wraps AppContent in the AppProvider context
   
   NOTE: AppContent is a separate component because it needs
   to call useAppContext(), which only works INSIDE AppProvider.
   If we tried to use useAppContext() directly in App, it would
   fail because App itself IS the provider wrapper.
   ------------------------------------------------------------ */
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
