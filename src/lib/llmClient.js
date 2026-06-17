/**
 * llmClient.js
 * ============
 * 
 * The unified client for communicating with multiple LLM APIs.
 * 
 * 🎓 PM INSIGHT — Multi-Model Architecture:
 * As an AI PM, you don't want to be locked into a single provider. Models update
 * rapidly. Today OpenAI might be best, tomorrow Claude might be cheaper.
 * By abstracting the API calls into this single file, the rest of your app
 * doesn't care which model is running. It just asks `generateSummary()` and gets text.
 * 
 * We use standard 'fetch' requests instead of heavy SDKs so you can clearly
 * see the exact JSON payloads required by each provider.
 */

/**
 * Main entry point for making LLM requests.
 * 
 * @param {string} provider - 'openai', 'claude', 'gemini', 'meta', 'deepseek'
 * @param {string} apiKey - The user's API key
 * @param {string} systemPrompt - The system instructions
 * @param {string} userPrompt - The specific content to summarize
 * @returns {Promise<string>} The generated text
 */
export async function generateSummary(provider, apiKey, systemPrompt, userPrompt) {
  if (!apiKey) {
    throw new Error('API Key is missing.');
  }

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(apiKey, systemPrompt, userPrompt);
      case 'claude':
        return await callClaude(apiKey, systemPrompt, userPrompt);
      case 'gemini':
        return await callGemini(apiKey, systemPrompt, userPrompt);
      case 'meta':
        return await callMetaLlama(apiKey, systemPrompt, userPrompt);
      case 'deepseek':
        return await callDeepseek(apiKey, systemPrompt, userPrompt);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    throw new Error(`API Request failed: ${error.message}`);
  }
}

/* ============================================================
   PROVIDER IMPLEMENTATIONS
   ============================================================ */

async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o', // or gpt-3.5-turbo for cheaper testing
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API Error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(apiKey, systemPrompt, userPrompt) {
  // Note: Anthropic requires CORS proxy if called directly from browser,
  // but for local dev/testing, some users use extensions or proxies.
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true' // Explicitly allow for this demo
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Claude API Error');
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGemini(apiKey, systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gemini API Error');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callDeepseek(apiKey, systemPrompt, userPrompt) {
  // Deepseek's API is fully compatible with OpenAI's format
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'DeepSeek API Error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callMetaLlama(apiKey, systemPrompt, userPrompt) {
  // 🎓 PM INSIGHT: Meta doesn't host their own Llama API directly.
  // Developers use providers like Groq, Together AI, or Replicate to access Llama.
  // Here, we use Groq's extremely fast API which is OpenAI-compatible.
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}` // User must provide a Groq API Key
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Llama (Groq) API Error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
