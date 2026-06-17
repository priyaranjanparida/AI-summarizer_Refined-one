/**
 * storage.js
 * ==========
 * 
 * Handles saving and loading conversation history to the browser's localStorage.
 * 
 * 🎓 PM INSIGHT — Caching & Cost Optimization:
 * Saving past interactions locally prevents the user from accidentally losing
 * their work if they refresh the page. More importantly, it saves API costs.
 * If a user wants to look at a past summary, loading it from storage is FREE.
 * Re-running the LLM pipeline would cost money and take time.
 */

const STORAGE_KEY = 'ai_summarizer_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Generate a simple unique ID for each conversation
 */
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Get all past conversations from localStorage
 * @returns {Array} List of conversations, newest first
 */
export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading history from storage:', error);
    return [];
  }
}

/**
 * Save a new conversation to history, enforcing the 20-item limit.
 * 
 * @param {Object} data - The conversation data to save
 * @returns {Object} The saved conversation with its generated ID
 */
export function saveConversation(data) {
  try {
    const history = getHistory();
    
    // Create the new entry with an ID and timestamp
    const newEntry = {
      id: generateId(),
      timestamp: new Date().toLocaleString(),
      ...data
    };
    
    // Add to the beginning of the array (newest first)
    const updatedHistory = [newEntry, ...history];
    
    // Enforce the limit (evict oldest)
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
      updatedHistory.length = MAX_HISTORY_ITEMS;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return newEntry;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return null;
  }
}

/**
 * Delete a specific conversation by ID
 * 
 * @param {string} id - The ID of the conversation to delete
 */
export function deleteConversation(id) {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting from storage:', error);
  }
}

/**
 * Clear the entire history
 */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
