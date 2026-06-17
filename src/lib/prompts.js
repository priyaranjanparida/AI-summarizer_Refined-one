/**
 * prompts.js
 * ==========
 * 
 * Prompt Template Engine.
 * 
 * 🎓 PM INSIGHT — Prompt Engineering:
 * The quality of an AI feature depends 80% on the prompt and 20% on the model.
 * A good system prompt defines the "persona" and rules, while the user prompt
 * provides the specific task and data.
 * 
 * In this application, we use different templates based on what the user wants to
 * achieve (Interview Prep vs. Quick Learning). By centralizing these templates,
 * we make it easy to tweak the AI's behavior without touching the core UI or logic.
 */

// Define the system personas and formatting rules for each summary type
const TEMPLATES = {
  interview: {
    system: `You are an expert technical recruiter and interviewer. Your task is to analyze the provided text and extract the most important information a candidate would need to know for an interview.
Format your output using Markdown. Use clear headings, bullet points, and bold text for emphasis. Do not use filler words.`,
    user: `Please summarize the following content for interview preparation. 
Include:
1. The 3-5 absolute most critical concepts.
2. 3 likely interview questions based on this text, along with concise answers.
3. A brief "cheat sheet" of terms or definitions.

Content:
"""
{{content}}
"""`
  },
  
  learning: {
    system: `You are a world-class professor known for explaining complex topics simply and concisely. Your goal is to help students learn material as fast as possible.
Format your output using Markdown with emojis, bullet points, and clear sections.`,
    user: `I need a rapid-learning summary of the following text.
Please provide:
1. A 2-sentence TL;DR.
2. The key takeaways in bullet points.
3. Any important actionable advice or conclusions.

Content:
"""
{{content}}
"""`
  },
  
  concept: {
    system: `You are an expert tutor focusing on first-principles thinking and deep concept mastery. You don't just summarize; you explain the "why" and "how" behind the text.
Use Markdown to structure your explanation clearly.`,
    user: `Break down the core concepts in the following text for deep mastery.
Please provide:
1. A clear explanation of the central thesis or main idea.
2. An analogy or real-world example to make the concept stick.
3. A breakdown of the supporting arguments or mechanics.

Content:
"""
{{content}}
"""`
  }
};

/**
 * Builds the system and user prompts for a single chunk of text.
 * 
 * @param {string} summaryType - The id of the summary type (e.g., 'interview')
 * @param {string} content - The text chunk to summarize
 * @returns {Object} An object containing { systemPrompt, userPrompt }
 */
export function buildPrompt(summaryType, content) {
  const template = TEMPLATES[summaryType] || TEMPLATES.learning;
  
  const systemPrompt = template.system;
  // Replace the placeholder with the actual content
  const userPrompt = template.user.replace('{{content}}', content);
  
  return { systemPrompt, userPrompt };
}

/**
 * Builds the prompt used to aggregate multiple chunk summaries into one final document.
 * 
 * 🎓 PM INSIGHT: When a document is huge, we chunk it. But then we have 5 separate summaries.
 * We must use the LLM one final time to stitch those 5 summaries into a single, cohesive
 * final document so it doesn't just read like a disconnected list of parts.
 * 
 * @param {string} summaryType - The id of the summary type
 * @param {string[]} partialSummaries - Array of summaries from individual chunks
 * @returns {Object} An object containing { systemPrompt, userPrompt }
 */
export function getAggregationPrompt(summaryType, partialSummaries) {
  const template = TEMPLATES[summaryType] || TEMPLATES.learning;
  
  const systemPrompt = `You are an expert editor. You are given several summaries of different parts of a large document. Your job is to seamlessly combine them into a single, cohesive, master summary. Follow the formatting rules of your specific persona: \n\n${template.system}`;
  
  const combinedText = partialSummaries.map((s, i) => `--- PART ${i + 1} ---\n${s}`).join('\n\n');
  
  const userPrompt = `Synthesize the following partial summaries into one final master document. Remove redundant introductions, merge similar points, and ensure a logical flow from beginning to end.

Partial Summaries:
"""
${combinedText}
"""`;

  return { systemPrompt, userPrompt };
}
