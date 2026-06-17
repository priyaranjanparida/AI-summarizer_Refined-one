/**
 * parser.js
 * =========
 * 
 * Handles extracting raw text from various input sources.
 * 
 * 🎓 PM INSIGHT — The "Garbage In, Garbage Out" Problem:
 * LLMs can only process text. If a user uploads a PDF with complex tables and images,
 * the LLM won't see them unless we extract the text perfectly. Parsing is often the
 * hardest part of an AI application. For a production app, you might use an OCR service.
 * Here, we implement a basic browser-native parser.
 */

/**
 * Extracts plain text based on the input mode.
 * 
 * @param {string} mode - 'text', 'file', or 'youtube'
 * @param {string} content - The raw text or URL
 * @param {File} file - The uploaded File object (if mode === 'file')
 * @returns {Promise<string>} The extracted raw text
 */
export async function parseInput(mode, content, file) {
  switch (mode) {
    case 'text':
      // The user just pasted text directly into the textarea
      if (!content.trim()) throw new Error('Input text is empty.');
      return content;
      
    case 'youtube':
      // 🎓 PM INSIGHT: Getting YouTube transcripts purely in the browser is tricky due to CORS.
      // Usually, this requires a backend server or proxy. For this demo, we expect the user
      // to paste the transcript, or we simulate a backend call.
      if (!content.trim()) throw new Error('YouTube URL or transcript is empty.');
      
      // If it's a URL, we return a helpful error for now. If it's long text, assume it's the transcript.
      if (content.startsWith('http')) {
        throw new Error('For this demo, please paste the actual YouTube transcript text instead of the URL.');
      }
      return content;
      
    case 'file':
      if (!file) throw new Error('No file selected.');
      return await parseFile(file);
      
    default:
      throw new Error(`Unknown input mode: ${mode}`);
  }
}

/**
 * Reads a File object and extracts its text.
 * 
 * @param {File} file 
 * @returns {Promise<string>}
 */
async function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const content = e.target.result;
      
      const fileType = file.name.split('.').pop().toLowerCase();
      
      try {
        if (fileType === 'txt') {
          // It's a plain text file, we can just return the string
          resolve(content);
        } else if (fileType === 'pdf') {
          // 🎓 PM INSIGHT: Parsing PDF in browser requires a library like pdfjs-dist.
          // For simplicity in this UI practice app, we throw an error asking for .txt
          reject(new Error('PDF parsing requires pdf.js library integration. For this demo, please upload a .txt file.'));
        } else if (fileType === 'docx') {
          reject(new Error('DOCX parsing requires mammoth.js library. For this demo, please upload a .txt file.'));
        } else {
          reject(new Error('Unsupported file format. Please use .txt'));
        }
      } catch (err) {
        reject(new Error('Failed to parse file: ' + err.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file from disk.'));
    
    // Read the file as text. (If we were using pdf.js, we would read as ArrayBuffer)
    reader.readAsText(file);
  });
}
