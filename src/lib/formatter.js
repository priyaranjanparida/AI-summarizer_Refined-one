/**
 * formatter.js
 * ============
 * 
 * Handles formatting the final summary and exporting it (e.g., to Text or PDF).
 * 
 * 🎓 PM INSIGHT — The "Last Mile" Experience:
 * Users don't just want text on a screen; they want to *use* the summary.
 * Giving them 1-click export to PDF or Text makes the app feel like a real
 * professional tool.
 */

/**
 * Trigger a download of the text as a simple .txt file
 * 
 * @param {string} text - The markdown/text to download
 * @param {string} filename - The name of the downloaded file
 */
export function downloadAsText(text, filename = 'summary.txt') {
  // Create a blob with the text
  const blob = new Blob([text], { type: 'text/plain' });
  
  // Create a temporary hidden URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create an invisible anchor tag to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Append, click, and cleanup
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger a download of the result as a PDF
 * 
 * 🎓 PM INSIGHT: Browser-side PDF generation is usually done via libraries
 * like `html2pdf.js` or `jspdf`. This converts the rendered HTML view into
 * an actual PDF document.
 * 
 * @param {HTMLElement} element - The DOM element containing the rendered summary
 */
export function downloadAsPDF(element) {
  // For this practice project, we'll log a message.
  // To implement for real, you would do:
  // import html2pdf from 'html2pdf.js';
  // html2pdf().from(element).save('summary.pdf');
  
  console.log('PDF download triggered for element:', element);
  alert('PDF Export requires adding the html2pdf.js library to the project. For now, try the Text export!');
}
