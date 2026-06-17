/**
 * SettingsPanel.jsx
 * =================
 *
 * Configuration card that sits below the InputPanel.
 * The user selects:
 *   1. LLM Provider  — which AI model to use for summarisation
 *   2. API Key        — authentication token for the chosen provider
 *   3. Summary Type   — the flavour / depth of summary they want
 *
 * Then they hit "Generate Summary" to kick off the pipeline.
 *
 * ─── Extensibility Note ───
 * The `SUMMARY_TYPES` array is defined as a module-level constant
 * (outside the component). To add a new summary flavour, just append
 * an object with { id, label, description } — no other code changes
 * are needed.
 *
 * CSS classes come from the design-system stylesheet:
 *   - glass-card / glass-card__title    → shared card chrome
 *   - settings-panel__*                 → panel-specific controls
 *
 * No inline styles — all visuals are in the CSS file.
 */

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

/* ================================================================== */
/*  SUMMARY_TYPES — module-level config array                          */
/* ================================================================== */
/**
 * Each object describes one "flavour" of summary the app can produce.
 *
 *   id          – unique key stored in settings.summaryType
 *   label       – short text shown on the pill button (with emoji)
 *   description – tooltip / subtext explaining what this mode does
 *
 * 🔧 TO ADD A NEW TYPE:
 *    Just push another object here — the component maps over this array
 *    so the UI updates automatically.
 */
const SUMMARY_TYPES = [
  {
    id: 'interview',
    label: '🎯 Interview Prep',
    description: 'Key concepts, likely questions, and concise answers',
  },
  {
    id: 'learning',
    label: '📚 Quick Learning',
    description: 'Bullet-point summary and key takeaways',
  },
  {
    id: 'concept',
    label: '🧠 Concept Mastery',
    description: 'Deep explanations with examples',
  },
];

/* ================================================================== */
/*  LLM_PROVIDERS — dropdown options                                   */
/* ================================================================== */
/**
 * Available LLM providers. Same pattern as SUMMARY_TYPES:
 * add an entry here and the <select> picks it up automatically.
 */
const LLM_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT-4o)' },
  { value: 'claude', label: 'Claude (Sonnet)' },
  { value: 'gemini', label: 'Gemini (Pro)' },
  { value: 'meta', label: 'Meta (Llama)' },
  { value: 'deepseek', label: 'DeepSeek (Chat)' },
];

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */
function SettingsPanel() {
  /**
   * Pull shared state from AppContext.
   *
   * settings       – { provider, apiKey, summaryType }
   * updateSettings – merges a partial object into the current settings
   * inputContent   – raw text the user typed (used to check "is there content?")
   * selectedFile   – File object from the upload tab (used for the same check)
   * isLoading      – whether the summarisation pipeline is running
   */
  const {
    settings,
    updateSettings,
    inputContent,
    selectedFile,
    isLoading,
  } = useAppContext();

  /**
   * Local state: controls whether the API key field shows
   * the actual characters ('text') or bullets ('password').
   */
  const [showApiKey, setShowApiKey] = useState(false);

  /* ---- Derived values ---- */

  /**
   * The Generate button should be disabled when:
   *   • There is no content (no text AND no file uploaded), OR
   *   • The user hasn't entered an API key, OR
   *   • A summarisation is already in progress.
   */
  const hasContent = inputContent.trim().length > 0 || selectedFile !== null;
  const hasApiKey = settings.apiKey.trim().length > 0;
  const isGenerateDisabled = !hasContent || !hasApiKey || isLoading;

  /**
   * handleGenerate
   * Placeholder handler — we'll wire the real summarisation
   * pipeline here in a later step.
   */
  const handleGenerate = () => {
    console.log('Generate clicked');
    // TODO: Trigger the summarisation pipeline
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="glass-card">
      {/* ---- Card Title ---- */}
      <h2 className="glass-card__title">
        <span className="glass-card__title-icon">⚙️</span>
        Settings
      </h2>

      {/* ============================================================
          Two-column grid: Provider + API Key
          ============================================================ */}
      <div className="settings-panel__grid">
        {/* ---------- LLM Provider ---------- */}
        <div className="settings-panel__field">
          <label className="settings-panel__label">LLM Provider</label>

          {/*
            Native <select> styled via the design system.
            We map over LLM_PROVIDERS so adding a new provider
            is a one-line change in the config array above.
          */}
          <select
            className="settings-panel__select"
            value={settings.provider}
            onChange={(e) => updateSettings({ provider: e.target.value })}
          >
            {LLM_PROVIDERS.map((provider) => (
              <option key={provider.value} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
        </div>

        {/* ---------- API Key ---------- */}
        <div className="settings-panel__field">
          <label className="settings-panel__label">API Key</label>

          {/*
            Wrapper positions the toggle button absolutely
            over the right side of the input field.
          */}
          <div className="settings-panel__api-key-wrapper">
            <input
              className="settings-panel__api-key-input"
              type={showApiKey ? 'text' : 'password'}
              placeholder="Enter your API key"
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
            />

            {/*
              Toggle button: switches between password / text
              so the user can verify what they pasted.
              Shows an eye emoji when hidden, a lock when visible.
            */}
            <button
              className="settings-panel__api-key-toggle"
              onClick={() => setShowApiKey((prev) => !prev)}
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? '🔒' : '👁'}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          Summary Type — pill buttons
          ============================================================ */}
      <div className="settings-panel__summary-types">
        <div className="settings-panel__summary-type-label">Summary Type</div>

        {/*
          We map over the SUMMARY_TYPES config array.
          The active type gets the --active modifier class which
          applies the gradient background and glow from the CSS.
        */}
        <div className="settings-panel__summary-type-group">
          {SUMMARY_TYPES.map((type) => (
            <button
              key={type.id}
              className={`settings-panel__summary-type-btn${
                settings.summaryType === type.id
                  ? ' settings-panel__summary-type-btn--active'
                  : ''
              }`}
              onClick={() => updateSettings({ summaryType: type.id })}
              title={type.description}  // native tooltip on hover
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          Generate Button
          ============================================================ */}
      <button
        className="settings-panel__generate-btn"
        disabled={isGenerateDisabled}
        onClick={handleGenerate}
      >
        {isLoading ? 'Generating...' : '✨ Generate Summary'}
      </button>
    </div>
  );
}

export default SettingsPanel;
