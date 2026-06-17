/* ============================================================
   HEADER COMPONENT
   ============================================================
   The sticky top bar that sits at the very top of the app.
   
   STRUCTURE:
   ┌──────────────────────────────────────────────────────────┐
   │  [☰]  AI Content Summarizer                             │
   │        Powered by Your LLM                              │
   └──────────────────────────────────────────────────────────┘
   
   LEFT SIDE:
   • History toggle button — opens the slide-in sidebar
   • Title + subtitle — branding text
   
   RIGHT SIDE:
   • Empty for now — could hold user avatar, settings, etc.
   
   CSS CLASSES (defined in styles/index.css):
   • .header            → sticky bar with glass background
   • .header__left      → flex container for left-side items
   • .header__history-btn → icon button to open history
   • .header__title     → gradient-text app name
   • .header__subtitle  → small muted tagline
   ============================================================ */

import { useAppContext } from '../context/AppContext';

function Header() {
  /* ---- Pull the history toggle function from global state ----
     toggleHistory flips `isHistoryOpen` between true/false,
     which in turn controls the HistorySidebar's slide animation. */
  const { toggleHistory } = useAppContext();

  return (
    <header className="header">
      {/* ---- Left Side: History button + Branding ---- */}
      <div className="header__left">
        {/* History toggle button
            • Uses the clock emoji as a lightweight icon
            • aria-label provides accessibility for screen readers
            • onClick calls toggleHistory from context */}
        <button
          className="header__history-btn"
          onClick={toggleHistory}
          aria-label="Toggle conversation history"
          title="Conversation History"
        >
          🕘
        </button>

        {/* App branding — title and subtitle stacked */}
        <div>
          {/* Main title — rendered with a gradient via CSS */}
          <h1 className="header__title">AI Content Summarizer</h1>

          {/* Subtitle — small muted text below the title */}
          <p className="header__subtitle">Powered by Your LLM</p>
        </div>
      </div>

      {/* ---- Right Side: Placeholder for future elements ----
          Examples of what could go here later:
          • Theme toggle (dark/light)
          • User avatar / sign-in button
          • Settings gear icon */}
      <div className="header__right">
        {/* Empty for now */}
      </div>
    </header>
  );
}

export default Header;
