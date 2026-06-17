/**
 * chunker.js
 * ==========
 * 
 * Intelligent text splitting for LLM context windows.
 * 
 * 🎓 PM INSIGHT — Token Limits & Context Windows:
 * Every LLM has a maximum amount of text it can process at once (e.g. 128K tokens
 * for GPT-4o). Even if a model has a huge context window, sending a 100-page document
 * all at once often results in the "Lost in the Middle" phenomenon (the AI forgets
 * details from the middle of the document).
 * 
 * To solve this, we "chunk" the document into smaller pieces, summarize each piece,
 * and then aggregate the summaries. 
 * 
 * OVERLAP: We include an "overlap" between chunks so that if a sentence is split,
 * the context isn't entirely lost.
 */

// A rough heuristic: 1 token is approximately 4 characters in English text.
const CHARS_PER_TOKEN = 4;

/**
 * Splits a large text string into an array of smaller string chunks.
 * 
 * @param {string} text - The raw text to split
 * @param {number} maxTokens - The target maximum tokens per chunk
 * @param {number} overlapTokens - How many tokens should overlap between chunks
 * @returns {string[]} An array of text chunks
 */
export function chunkText(text, maxTokens = 8000, overlapTokens = 200) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  // If the text is smaller than our max limit, just return it as a single chunk.
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // Calculate where this chunk should end
    let endIndex = startIndex + maxChars;

    // If we're not at the very end of the text, try to find a clean break point
    // (like a period or newline) so we don't cut a word or sentence in half.
    if (endIndex < text.length) {
      // Look backwards from the target end index to find a newline or period
      const lastNewline = text.lastIndexOf('\n', endIndex);
      const lastPeriod = text.lastIndexOf('. ', endIndex);
      
      // Prefer newlines, then periods, then just cut at the max length
      if (lastNewline > startIndex && lastNewline > endIndex - 1000) {
        endIndex = lastNewline + 1;
      } else if (lastPeriod > startIndex && lastPeriod > endIndex - 500) {
        endIndex = lastPeriod + 2;
      }
    }

    // Extract the chunk and add it to our array
    chunks.push(text.slice(startIndex, endIndex).trim());

    // Move the start index forward for the next chunk, but step back by the overlap amount
    startIndex = endIndex - overlapChars;
    
    // Failsafe to prevent infinite loops if overlap is bigger than the chunk advance
    if (startIndex <= chunks[chunks.length - 1].startIndex) {
       startIndex = endIndex; // Force it to move forward
    }
  }

  return chunks;
}
