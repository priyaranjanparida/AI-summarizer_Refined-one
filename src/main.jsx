/**
 * ============================================================
 * main.jsx — Application Entry Point
 * ============================================================
 *
 * This is the very first JavaScript file that runs when the app loads.
 * Its job is simple: mount the React app into the HTML page.
 *
 * HOW IT WORKS:
 * 1. The browser loads index.html, which has a <div id="root"></div>.
 * 2. Vite (our build tool) runs this file.
 * 3. ReactDOM finds the #root div and renders our <App /> into it.
 * 4. From here, React takes over and manages the entire UI.
 *
 * NOTE: We do NOT import index.css here. Instead, App.jsx imports
 * styles/index.css so that all styles are loaded in one place.
 * ============================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ---- Mount the app ----
// createRoot is the React 18+ way to start a React app.
// It enables concurrent features like automatic batching.
// StrictMode adds extra development checks (double-rendering, etc.)
// to help catch bugs early — it has no effect in production builds.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
