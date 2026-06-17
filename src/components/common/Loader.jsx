/* ============================================================
   LOADER COMPONENT — Loading Spinner with Text
   ============================================================
   A reusable loading indicator displayed while the app is
   waiting for an API response (e.g., generating a summary).

   STRUCTURE:
   ┌───────────────────────────────┐
   │         ⟳  (spinner)         │
   │  Generating your summary...  │
   └───────────────────────────────┘

   PROPS:
   • text (string, optional)
     Custom loading message. Defaults to 'Generating your summary...'
     Example: <Loader text="Uploading your file..." />

   CSS CLASSES (defined in styles/index.css):
   • .loader          → flex container, centers content vertically
   • .loader__spinner → 40px circle with a spinning top border
   • .loader__text    → small muted text with a pulse animation

   ANIMATIONS (from the design system):
   • @keyframes spin  → rotates the spinner 360° continuously
   • @keyframes pulse → fades the text in and out gently
   ============================================================ */

/**
 * Loader — displays a spinner and an optional status message.
 *
 * @param {Object} props
 * @param {string} [props.text='Generating your summary...'] — Loading message
 * @returns {JSX.Element}
 */
function Loader({ text = 'Generating your summary...' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      {/* Animated spinner ring
          The CSS creates a circle with a colored top border
          that rotates indefinitely via the `spin` keyframe. */}
      <div className="loader__spinner" aria-hidden="true" />

      {/* Loading text — uses the `pulse` keyframe to gently
          fade in and out, indicating that something is happening.
          The `text` prop allows customization per use case:
          • "Generating your summary..."  (default)
          • "Uploading your file..."
          • "Connecting to API..."         */}
      <span className="loader__text">{text}</span>
    </div>
  );
}

export default Loader;
