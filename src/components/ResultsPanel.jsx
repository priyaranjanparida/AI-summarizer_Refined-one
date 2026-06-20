/**
 * ============================================================
 * ResultsPanel.jsx — Summary Results Display
 * ============================================================
 *
 * This panel appears after the AI has finished summarising the
 * user's content. It shows:
 *
 *   1. META TAGS  — Which AI provider was used, what type of
 *                   summary was generated, and when.
 *   2. CONTENT    — The actual summary text, rendered as HTML
 *                   paragraphs (to be upgraded to react-markdown).
 *   3. ACTIONS    — Copy, Download Text, Download PDF buttons.
 *
 * STATE:
 *   Reads `result`, `provider`, and `summaryType` from the global
 *   AppContext. The only local state is `copied` — a boolean that
 *   briefly flips to true after the user copies text, so we can
 *   show a "✅ Copied!" confirmation.
 *
 * CSS CLASSES (BEM):
 *   .glass-card               — Shared glassmorphism card base
 *   .results-panel             — Component-specific wrapper
 *   .results-panel__meta       — Meta tag row
 *   .results-panel__meta-tag   — Individual meta badge
 *   .results-panel__content    — Summary text area
 *   .results-panel__actions    — Action button row
 *   .results-panel__action-btn — Individual action button
 *   .results-panel__action-btn--copied — Modifier for copy-success state
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

/* ------------------------------------------------------------------
 * LOOKUP TABLES
 * ------------------------------------------------------------------
 * These map internal IDs (stored in context) to user-friendly labels
 * shown in the meta tags. When we add a new provider or summary type,
 * we just add an entry here — no UI code changes needed.
 * ------------------------------------------------------------------ */

/** Map provider IDs → display names with emoji */
const PROVIDER_DISPLAY_NAMES = {
  openai: '🤖 OpenAI',
  anthropic: '🧠 Anthropic',
  gemini: '✨ Gemini',
  cohere: '🔮 Cohere',
  local: '💻 Local Model',
};

/** Map summary type IDs → human-readable labels with emoji */
const SUMMARY_TYPE_LABELS = {
  'interview-prep': '🎯 Interview Prep',
  'executive': '📊 Executive Summary',
  'bullet-points': '📌 Bullet Points',
  'technical': '🔧 Technical Deep Dive',
  'eli5': '🧒 ELI5 (Explain Like I\'m 5)',
  'study-notes': '📚 Study Notes',
  'social-media': '📱 Social Media Post',
};

/**
 * ResultsPanel — displays the AI-generated summary and related actions.
 *
 * Reads from global context:
 *   - result       → the raw summary text returned by the AI
 *   - provider     → which AI provider generated it
 *   - summaryType  → what style of summary was requested
 */
const ResultsPanel = () => {
  /* ------------------------------------------------------------------
   * 1. PULL DATA FROM GLOBAL CONTEXT
   * ------------------------------------------------------------------
   * `useAppContext` gives us the shared state. We destructure just the
   * fields this component cares about.
   * ------------------------------------------------------------------ */
  const { result, provider, summaryType } = useAppContext();

  /* ------------------------------------------------------------------
   * 2. LOCAL STATE — Copy-to-clipboard feedback
   * ------------------------------------------------------------------
   * `copied` is true for 2 seconds after the user clicks "Copy".
   * We use it to swap the button text and add a visual modifier class.
   * ------------------------------------------------------------------ */
  const [copied, setCopied] = useState(false);

  /* ------------------------------------------------------------------
   * 3. CLEANUP — Reset the "copied" flag after 2 seconds
   * ------------------------------------------------------------------
   * When `copied` becomes true, we start a 2-second timer.
   * When it fires, we set `copied` back to false.
   * The cleanup function clears the timer if the component unmounts
   * before the 2 seconds are up (prevents memory leaks).
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!copied) return; // Only run when copied is true

    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);

    // Cleanup: cancel the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [copied]);

  /* ------------------------------------------------------------------
   * 4. DERIVED VALUES — Look up display names from the tables above
   * ------------------------------------------------------------------
   * If the provider or summaryType isn't in our lookup table, we
   * fall back to the raw ID so nothing breaks.
   * ------------------------------------------------------------------ */
  const providerLabel = PROVIDER_DISPLAY_NAMES[provider] || `🤖 ${provider}`;
  const summaryTypeLabel = SUMMARY_TYPE_LABELS[summaryType] || `📝 ${summaryType}`;

  /* ------------------------------------------------------------------
   * 5. ACTION HANDLERS
   * ------------------------------------------------------------------ */

  /**
   * handleCopy — Copies the summary text to the user's clipboard.
   *
   * Uses the modern Clipboard API (navigator.clipboard.writeText).
   * On success, sets `copied = true` which triggers the visual feedback.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  /**
   * handleDownloadText — Downloads the summary as a plain .txt file.
   *
   * How it works:
   *   1. Create a Blob (binary large object) from the result string
   *   2. Generate a temporary URL pointing to that Blob
   *   3. Create an invisible <a> tag, set its href + download filename
   *   4. Programmatically click it to trigger the browser download
   *   5. Clean up the temporary URL to free memory
   */
  const handleDownloadText = () => {
    // Step 1: Wrap the text in a Blob with a plain-text MIME type
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });

    // Step 2: Create a temporary object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Step 3: Create an invisible anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'summary.txt'; // The filename for the downloaded file

    // Step 4: Append to DOM, trigger click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Step 5: Release the object URL to free memory
    URL.revokeObjectURL(url);
  };

  /**
   * handleDownloadPDF — Placeholder for PDF export.
   *
   * TODO: Wire this up to the formatter.js utility once it's built.
   * The formatter will use a library like jsPDF or html2pdf to convert
   * the summary into a nicely styled PDF document.
   */
  const handleDownloadPDF = () => {
    // TODO: Replace with actual PDF generation from formatter.js
    // This will be implemented when we build the formatter utility,
    // which will handle converting the summary text into a styled
    // PDF document using jsPDF or a similar library.
    console.log('PDF download — will be implemented in formatter.js');
  };

  /* ------------------------------------------------------------------
   * 6. EARLY RETURN — Don't render if there's no result yet
   * ------------------------------------------------------------------
   * If the user hasn't run a summary yet, `result` will be null/empty.
   * We return null so the panel doesn't show an empty card.
   * ------------------------------------------------------------------ */
  if (!result) {
    return null;
  }

  /* ------------------------------------------------------------------
   * 7. RENDER
   * ------------------------------------------------------------------ */
  return (
    <div className="glass-card results-panel">

      {/* ============================================================
        * SECTION: Title
        * ============================================================
        * Uses the shared glass-card title class for consistent heading
        * styles across all card components in the app.
        * ============================================================ */}
      <h2 className="glass-card__title">📊 Summary Results</h2>

      {/* ============================================================
        * SECTION: Meta Tags
        * ============================================================
        * A row of small badges showing contextual info about the
        * summary: which AI made it, what type it is, and when.
        * ============================================================ */}
      <div className="results-panel__meta">
        {/* Provider badge — e.g. "🤖 OpenAI" */}
        <span className="results-panel__meta-tag">
          {providerLabel}
        </span>

        {/* Summary type badge — e.g. "🎯 Interview Prep" */}
        <span className="results-panel__meta-tag">
          {summaryTypeLabel}
        </span>

        {/* Timestamp badge — static for now, will be dynamic later */}
        <span className="results-panel__meta-tag">
          🕐 Just now
        </span>
      </div>

      {/* ============================================================
        * SECTION: Content — The Actual Summary
        * ============================================================
        * For now we use a simple approach: split the result string on
        * newline characters and wrap each non-empty line in a <p> tag.
        *
        * TODO: Replace with react-markdown for proper markdown rendering.
        * That will give us headings, lists, code blocks, bold/italic,
        * and other rich formatting that AI models commonly output.
        * ============================================================ */}
      <div className="results-panel__content" style={{ textAlign: 'left' }}>
        {(() => {
          try {
            // Try to parse the result as JSON (Our new structured output)
            const data = JSON.parse(result);
            
            // Helper function to render simple arrays
            const renderArray = (arr) => (
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }}>
                {arr.map((item, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>)}
              </ul>
            );
            
            // Helper function to render objects (like ai_pm_lens or interview_qa items)
            const renderObject = (obj) => (
              <div style={{ marginLeft: '1rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                {Object.entries(obj).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {k.replace(/_/g, ' ')}: 
                    </strong> 
                    <span style={{ marginLeft: '0.5rem' }}>{v}</span>
                  </div>
                ))}
              </div>
            );

            // Dynamically render every field returned by the LLM
            return Object.entries(data).map(([key, value]) => {
              // Convert "quick_summary" to "Quick Summary" for the heading
              const heading = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              
              return (
                <div key={key} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ 
                    color: 'var(--primary)', 
                    marginBottom: '0.75rem', 
                    borderBottom: '1px solid var(--border)', 
                    paddingBottom: '0.25rem',
                    fontSize: '1.1rem'
                  }}>
                    ✨ {heading}
                  </h3>
                  
                  {Array.isArray(value) ? (
                    // Handle arrays (either strings like concepts_covered or objects like interview_qa)
                    typeof value[0] === 'object' ? (
                      value.map((item, i) => <div key={i}>{renderObject(item)}</div>)
                    ) : (
                      renderArray(value)
                    )
                  ) : typeof value === 'object' && value !== null ? (
                    // Handle nested objects (like ai_pm_lens)
                    renderObject(value)
                  ) : (
                    // Handle standard strings
                    <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{value}</p>
                  )}
                </div>
              );
            });
            
          } catch (e) {
            // FALLBACK: If the LLM failed to return JSON, fall back to our standard text rendering
            return result.split('\n').map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{paragraph}</p>
              ) : (
                <br key={index} />
              )
            );
          }
        })()}
      </div>

      {/* ============================================================
        * SECTION: Action Buttons
        * ============================================================
        * Three actions the user can take with their summary:
        *   1. Copy to clipboard (with visual feedback)
        *   2. Download as a .txt file
        *   3. Download as a .pdf file (coming soon)
        * ============================================================ */}
      <div className="results-panel__actions">

        {/* ---- Copy to Clipboard Button ---- */}
        <button
          className={`results-panel__action-btn ${
            copied ? 'results-panel__action-btn--copied' : ''
          }`}
          onClick={handleCopy}
        >
          {/* Swap the label while the "copied" feedback is active */}
          {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
        </button>

        {/* ---- Download as Text Button ---- */}
        <button
          className="results-panel__action-btn"
          onClick={handleDownloadText}
        >
          📝 Download as Text
        </button>

        {/* ---- Download as PDF Button (placeholder) ---- */}
        {/*
         * This button currently just logs to console.
         * We'll wire it to formatter.js later, which will handle
         * the actual PDF generation using jsPDF or html2pdf.
         */}
        <button
          className="results-panel__action-btn"
          onClick={handleDownloadPDF}
        >
          📄 Download as PDF
        </button>

      </div>
    </div>
  );
};

export default ResultsPanel;
