/**
 * InputPanel.jsx
 * ==============
 *
 * The main content-input area of the AI Content Summarizer.
 * It provides three input modes via a tab interface:
 *   1. Text   — a plain textarea for pasting articles, notes, etc.
 *   2. File   — a drag-and-drop zone for uploading PDF / DOCX / TXT files.
 *   3. YouTube — a URL field for pasting a YouTube video link.
 *
 * All user input is stored in the global AppContext so that the
 * SettingsPanel (and eventually the summarisation pipeline) can read it.
 *
 * CSS classes come from the design-system stylesheet:
 *   - glass-card / glass-card__title   → shared card chrome
 *   - tab-group / tab-group__tab       → tab switcher
 *   - input-panel__*                   → panel-specific styles
 *
 * No inline styles are used — every visual concern lives in CSS.
 */

import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function InputPanel() {
  /**
   * Pull shared state from AppContext.
   *
   * inputMode      – 'text' | 'file' | 'youtube'  (which tab is active)
   * setInputMode   – switch the active tab
   * inputContent   – the raw text or URL the user has entered
   * setInputContent– update that text / URL
   * selectedFile   – the File object the user dropped / picked (or null)
   * setSelectedFile– store (or clear) the file
   */
  const {
    inputMode,
    setInputMode,
    inputContent,
    setInputContent,
    selectedFile,
    setSelectedFile,
  } = useAppContext();

  /**
   * Local state: is the user currently dragging a file over the dropzone?
   * We track this so we can add a visual highlight class.
   */
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * A ref to the hidden <input type="file"> so we can programmatically
   * trigger the native file-picker dialog when the dropzone is clicked.
   */
  const fileInputRef = useRef(null);

  /* ---- Tab configuration ---- */
  /**
   * Each tab maps to an inputMode value.
   * Adding a new mode is as simple as adding an entry here
   * (plus a matching content section below).
   */
  const tabs = [
    { mode: 'text', label: 'Text' },
    { mode: 'file', label: 'Upload File' },
    { mode: 'youtube', label: 'YouTube URL' },
  ];

  /* ---- Drag-and-drop handlers ---- */

  /**
   * handleDragOver
   * Prevents the browser's default behaviour (which would open the file)
   * and enables the visual "drag-over" highlight on the dropzone.
   */
  const handleDragOver = (e) => {
    e.preventDefault(); // required so the browser allows the drop
    setIsDragOver(true);
  };

  /**
   * handleDragLeave
   * Removes the visual highlight when the cursor leaves the dropzone.
   */
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  /**
   * handleDrop
   * Captures the dropped file, stores it in context,
   * and removes the drag-over highlight.
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    // dataTransfer.files is a FileList — grab the first file
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  /**
   * handleFileChange
   * Fires when the user picks a file via the native dialog
   * (triggered by clicking the dropzone).
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  /**
   * handleDropzoneClick
   * Opens the native file-picker by clicking the hidden input.
   */
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * handleRemoveFile
   * Clears the selected file from context and resets the hidden input
   * so the same file can be re-selected if needed.
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Reset the file input value so onChange fires even for the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="glass-card">
      {/* ---- Card Title ---- */}
      <h2 className="glass-card__title">
        <span className="glass-card__title-icon">📝</span>
        Content Input
      </h2>

      {/* ============================================================
          Tab Group
          Three buttons that switch the visible input mode.
          The active tab gets the --active modifier class.
          ============================================================ */}
      <div className="tab-group">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            className={`tab-group__tab${
              inputMode === tab.mode ? ' tab-group__tab--active' : ''
            }`}
            onClick={() => setInputMode(tab.mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================
          Tab Content — only the active mode is rendered
          ============================================================ */}

      {/* ---------- TEXT TAB ---------- */}
      {inputMode === 'text' && (
        <div>
          {/* Multi-line textarea for pasting raw text */}
          <textarea
            className="input-panel__textarea"
            placeholder="Paste your text content here... articles, notes, research papers, or any text you want summarized."
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
          />

          {/* Live character count — helps the user gauge content length */}
          <div className="input-panel__char-count">
            {inputContent.length} characters
          </div>
        </div>
      )}

      {/* ---------- FILE TAB ---------- */}
      {inputMode === 'file' && (
        <div>
          {/* Dropzone: clickable area + drag-and-drop support.
              The --dragover modifier adds a border/glow highlight. */}
          <div
            className={`input-panel__dropzone${
              isDragOver ? ' input-panel__dropzone--dragover' : ''
            }`}
            onClick={handleDropzoneClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Large icon to make the purpose obvious */}
            <span className="input-panel__dropzone-icon">📁</span>

            {/* Primary instruction text */}
            <span className="input-panel__dropzone-text">
              Drag &amp; drop your file here
            </span>

            {/* Supported formats hint */}
            <span className="input-panel__dropzone-hint">
              Supports PDF, DOCX, and TXT files
            </span>

            {/* Hidden file input — triggered programmatically on click */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}  // only exception: hiding the native input
            />
          </div>

          {/* If a file has been selected, show its name + a remove button */}
          {selectedFile && (
            <div className="input-panel__file-selected">
              {/* File icon */}
              <span>📄</span>

              {/* File name */}
              <span className="input-panel__file-name">
                {selectedFile.name}
              </span>

              {/* Remove / clear button */}
              <button
                className="input-panel__file-remove"
                onClick={handleRemoveFile}
                aria-label="Remove selected file"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------- YOUTUBE TAB ---------- */}
      {inputMode === 'youtube' && (
        <div>
          {/* Single-line URL input for a YouTube video link */}
          <input
            className="input-panel__url-input"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export default InputPanel;
