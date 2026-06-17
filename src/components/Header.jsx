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
  /* ---- Pull context values ----
     toggleHistory: opens/closes sidebar
     theme/setTheme: for toggling dark/light mode */
  const { toggleHistory, theme, setTheme } = useAppContext();

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
          <h1 className="header__title">AI content summarizer by Priyaranjan</h1>

          {/* Subtitle — small muted text below the title */}
          <p className="header__subtitle">Powered by Your LLM</p>
        </div>
      </div>

      {/* ---- Right Side: Theme Toggle ---- */}
      <div className="header__right">
        <button
          className="header__history-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;
