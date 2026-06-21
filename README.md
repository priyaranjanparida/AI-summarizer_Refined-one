**1. Product Vision & Value Proposition**
The Problem: Users are overwhelmed by unstructured data (articles, youtube videos, long PDFs) and need a way to extract highly specific, structured insights based on their immediate learning goals. The Solution: A full-stack, model-agnostic LLM application that digests raw content and uses Prompt Engineering to output highly structured, persona-driven JSON summaries (e.g., Interview Prep, Executive Summary, ELI5).

**2. Technical Architecture (The Stack)**
Frontend (Client-Side)
Framework: React + Vite
Styling: Vanilla CSS with a custom Glassmorphism design system.
Why this choice? Vite provides lightning-fast hot module replacement for rapid iteration. We avoided heavy component libraries (like Material UI) to maintain total control over the aesthetic and keep the bundle size small.
Backend (Server-Side)
Framework: Python + FastAPI
Why this choice? FastAPI is the industry standard for modern AI applications. It natively supports asynchronous execution (crucial for long-running LLM API calls) and integrates perfectly with Python's massive AI ecosystem.
AI Orchestration Layer
Framework: LangChain (langchain-core, langchain-google-genai, langchain-openai)
Why this choice? LangChain abstracts away the complexities of different LLM APIs. This allowed us to build a Model-Agnostic architecture. The user can seamlessly swap between OpenAI, Claude, Gemini, or OpenRouter via a dropdown menu without breaking the app.
Handling Large Documents: LangChain's RecursiveCharacterTextSplitter allows us to chunk massive documents that exceed context windows, enabling a Map-Reduce summarization strategy.
**3. The Product Flow (User Journey)**
Input Stage: The user lands on the React UI and provides content via Text Paste, File Upload, or YouTube URL.
Configuration Stage: The user selects their preferred LLM Provider, enters their API key, and selects a "Persona" (e.g., Interview Prep).
Transmission: The React frontend makes an asynchronous HTTP POST request to the FastAPI backend (/api/summarize).
Orchestration
The FastAPI server receives the payload.
It routes the request to summarizer.py.
The appropriate LangChain model wrapper is instantiated.
The system prompt is dynamically injected based on the selected Persona.
Generation: The LLM processes the text and returns a strict, structured JSON payload.
Rendering: The React UI (ResultsPanel.jsx) intercepts the JSON, maps over the keys, and dynamically renders beautiful UI elements (headings, bullet points, data cards) based on the data types.
**4. The Evaluation Pipeline (The PM Superpower)**
In AI PM interviews, knowing how to build a prompt is good. Knowing how to quantitatively evaluate a prompt is exceptional.

We built an automated Evaluation Pipeline (backend/evals/run_evals.py) to systematically measure LLM performance against a "Golden Dataset" of 70 hand-crafted examples.

Evaluation Metrics Used:
Deterministic Metrics (Word Count):
What it does: Simple Python logic checks if the LLM followed length constraints.
PM Insight: LLMs notoriously struggle with negative constraints ("Do not exceed X words"). This metric tracks prompt adherence.
Traditional NLP Metrics (ROUGE-L Score):
Library Used: rouge-score
What it does: Mathematically calculates the Longest Common Subsequence between the generated text and the Golden Summary.
PM Insight: Highly effective for checking keyword recall, but flawed because it penalizes the LLM for using synonyms (low precision).
LLM-as-a-Judge (Subjective Grading):
What it does: We use an LLM (openrouter/owl-alpha or gemini-2.5-flash) acting as an impartial grader. We pass it the Original Text, the Golden Summary, and the Generated Summary.
Metrics Scored: Factuality (1-5 scale measuring hallucination against the source text) and Comprehensiveness (1-5 scale measuring meaning captured against the Golden Summary).
PM Insight: This solves the flaw of ROUGE. An LLM Judge can recognize that "rapid growth" and "fast expansion" mean the same thing, grading on semantic intent rather than pure vocabulary match.
