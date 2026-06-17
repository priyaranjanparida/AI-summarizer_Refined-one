/**
 * api.js
 * ======
 * 
 * HTTP Client to communicate with our Python FastAPI backend.
 * 
 * 🎓 PM INSIGHT — Microservices / API Architecture:
 * By moving the complex logic to a Python backend, the React frontend becomes "dumb"
 * in a good way. It only handles displaying the UI, collecting user input, and making 
 * a single HTTP POST request to the backend. The backend does all the heavy lifting.
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Sends a summarization request to the Python backend.
 * 
 * @param {Object} params
 * @param {string} params.mode - 'text', 'file', or 'youtube'
 * @param {string} params.content - Raw text or URL
 * @param {string} params.provider - LLM provider ('openai', etc.)
 * @param {string} params.apiKey - The user's API key
 * @param {string} params.summaryType - Type of summary ('interview', etc.)
 * @returns {Promise<string>} The generated markdown summary
 */
export async function generateSummaryWithBackend({ mode, content, provider, apiKey, summaryType }) {
  if (!apiKey) {
    throw new Error('API Key is missing.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        content,
        provider,
        apiKey,
        summaryType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Backend Server Error');
    }

    const data = await response.json();
    return data.result;

  } catch (error) {
    console.error('API Error:', error);
    // Add a helpful hint if the server isn't running
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Failed to connect to backend. Is the Python FastAPI server running on port 8000?');
    }
    throw error;
  }
}
