/* ============================================================
   HISTORY SIDEBAR COMPONENT — Slide-in Drawer
   ============================================================
   A side panel that slides in from the left edge of the screen
   to display the user's past summarization conversations.

   SLIDE-IN DRAWER PATTERN:
   ─────────────────────────
   This is a common UI pattern used by apps like Gmail, Slack,
   and mobile navigation menus. It works in two parts:

   1. OVERLAY — A semi-transparent backdrop that covers the
      rest of the page. Clicking it dismisses the drawer.
      Controlled by toggling: .history-overlay--visible

   2. SIDEBAR — The actual panel. It starts off-screen
      (translateX(-100%)) and slides in (translateX(0))
      when the --open modifier class is added.
      Controlled by toggling: .history-sidebar--open

   Both transitions are handled purely in CSS using
   var(--transition-drawer) for a smooth cubic-bezier ease.

   STRUCTURE:
   ┌──────────────────────────────────────────┐
   │  Conversation History           [✕]      │  ← Header
   ├──────────────────────────────────────────┤
   │  📝 How to learn React...               │  ← Item
   │     OpenAI • Bullet Points • 2 min ago  │
   │                                          │
   │  📝 Summarize this PDF...               │  ← Item
   │     Gemini • Paragraph • 1 hr ago       │
   │                                          │
   │  ... (scrollable)                        │
   ├──────────────────────────────────────────┤
   │  [ Clear All History ]                   │  ← Footer
   └──────────────────────────────────────────┘

   CSS CLASSES (defined in styles/index.css):
   • .history-overlay / --visible    → backdrop fade in/out
   • .history-sidebar / --open       → panel slide in/out
   • .history-sidebar__header        → top bar with title + close
   • .history-sidebar__list          → scrollable item container
   • .history-sidebar__empty         → shown when no history
   • .history-sidebar__item          → individual conversation
   • .history-sidebar__footer        → bottom bar with clear btn
   ============================================================ */

import { useAppContext } from '../context/AppContext';

function HistorySidebar() {
  /* ---- Destructure everything we need from global state ----
     • isHistoryOpen   — boolean controlling visibility
     • history         — array of saved conversation objects
     • closeHistory    — function to close the sidebar
     • loadConversation — function to restore a past conversation
     • deleteConversation — function to remove a single item
     • clearHistory    — function to wipe all history */
  const {
    isHistoryOpen,
    history,
    closeHistory,
    loadConversation,
    deleteConversation,
    clearHistory,
  } = useAppContext();

  /* ---- Helper: truncate long titles to 50 characters ----
     If the title is longer than 50 chars, slice it and
     append "…" so it doesn't overflow the sidebar layout. */
  const truncate = (text, maxLength = 50) => {
    if (!text) return 'Untitled Conversation';
    return text.length > maxLength
      ? text.slice(0, maxLength) + '…'
      : text;
  };

  /* ---- Handler: load a conversation and close the drawer ----
     When the user clicks a history item, we want two things:
     1. Populate the main view with that conversation's data
     2. Close the sidebar so the user can see the result */
  const handleItemClick = (item) => {
    loadConversation(item);
    closeHistory();
  };

  /* ---- Handler: delete a conversation ----
     e.stopPropagation() prevents the click from also
     triggering handleItemClick on the parent <div>. */
  const handleDelete = (e, itemId) => {
    e.stopPropagation();
    deleteConversation(itemId);
  };

  return (
    <>
      {/* ============================================================
          OVERLAY — Semi-transparent backdrop behind the sidebar
          ============================================================
          • Always rendered in the DOM (for CSS transitions to work)
          • The --visible modifier controls opacity & visibility
          • Clicking anywhere on the overlay closes the sidebar */}
      <div
        className={`history-overlay ${isHistoryOpen ? 'history-overlay--visible' : ''}`}
        onClick={closeHistory}
        aria-hidden="true"
      />

      {/* ============================================================
          SIDEBAR — The actual slide-in panel
          ============================================================
          • The --open modifier triggers the CSS translateX(0)
          • role="complementary" tells assistive tech this is secondary
          • aria-label describes the panel for screen readers */}
      <aside
        className={`history-sidebar ${isHistoryOpen ? 'history-sidebar--open' : ''}`}
        role="complementary"
        aria-label="Conversation history"
      >
        {/* ---- Sidebar Header ---- */}
        <div className="history-sidebar__header">
          <h2 className="history-sidebar__title">Conversation History</h2>

          {/* Close button — the ✕ character acts as a lightweight icon */}
          <button
            className="history-sidebar__close-btn"
            onClick={closeHistory}
            aria-label="Close history sidebar"
          >
            ✕
          </button>
        </div>

        {/* ---- Scrollable List of History Items ---- */}
        <div className="history-sidebar__list">
          {history.length === 0 ? (
            /* ---- Empty State ----
               Shown when the user has no saved conversations yet.
               Provides visual feedback instead of a blank area. */
            <div className="history-sidebar__empty">
              <span className="history-sidebar__empty-icon">📭</span>
              <p>No conversations yet</p>
              <p>Your summarization history will appear here</p>
            </div>
          ) : (
            /* ---- History Items ----
               Maps over the history array and renders each item
               as a clickable card with title, meta badges, and
               a delete button that appears on hover. */
            history.map((item) => (
              <div
                key={item.id}
                className="history-sidebar__item"
                onClick={() => handleItemClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  // Allow keyboard activation with Enter or Space
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(item);
                  }
                }}
              >
                {/* Item title — truncated to keep the sidebar tidy */}
                <span className="history-sidebar__item-title">
                  {truncate(item.title)}
                </span>

                {/* Meta row — badges for provider, summary type, and time */}
                <div className="history-sidebar__item-meta">
                  {/* Provider badge (e.g., "OpenAI", "Gemini") */}
                  {item.provider && (
                    <span className="history-sidebar__item-badge">
                      {item.provider}
                    </span>
                  )}

                  {/* Summary type badge (e.g., "Bullet Points", "Paragraph") */}
                  {item.summaryType && (
                    <span className="history-sidebar__item-badge">
                      {item.summaryType}
                    </span>
                  )}

                  {/* Timestamp — displayed as-is (formatting can be added later) */}
                  {item.timestamp && (
                    <span>{item.timestamp}</span>
                  )}
                </div>

                {/* Delete button — absolutely positioned, visible on hover
                    stopPropagation prevents the parent onClick from firing */}
                <button
                  className="history-sidebar__item-delete"
                  onClick={(e) => handleDelete(e, item.id)}
                  aria-label={`Delete conversation: ${truncate(item.title)}`}
                  title="Delete this conversation"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* ---- Sidebar Footer ---- */}
        <div className="history-sidebar__footer">
          {/* Clear All button — removes every item from history
              Only meaningful when there are items to clear */}
          <button
            className="history-sidebar__clear-btn"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            Clear All History
          </button>
        </div>
      </aside>
    </>
  );
}

export default HistorySidebar;
