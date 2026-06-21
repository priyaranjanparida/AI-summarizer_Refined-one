# backend/summarizer.py
# =====================
# 
# The LangChain Orchestration logic.
# 
# 🎓 PM INSIGHT — The Power of LangChain:
# LangChain abstracts away the complexities of dealing with different LLMs.
# Instead of writing 5 different custom HTTP requests (like we did in JS),
# we use LangChain's unified `ChatModel` interface. We also use its built-in
# `RecursiveCharacterTextSplitter` which is vastly superior to our basic JS chunker.

import os
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

# Import LLM wrappers
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

# ---------------------------------------------------------
# 1. Prompt Templates
# ---------------------------------------------------------

SYSTEM_PROMPTS = {
    "interview": (
        "You are an expert AI PM recruiter and interviewer at a FAANG Company. Analyze the text and extract the most important information for a MANGOS AI PM interview. You must answer the questions as concisely as possible and strictly below 600 words and make use of emoji, icon, bullet points very extensively to improve readability\n"
        "You MUST return ONLY valid JSON matching this exact schema:\n"
        "{{\n"
        '  "quick_summary": "1-2 sentences",\n'
        '  "concepts_covered": ["concept1", "concept2"],\n'
        '  "flow": "A string describing the flow/process",\n'
        '  "ai_pm_lens": {{ "business_value": "...", "tradeoff": "..." }},\n'
        '  "interview_qa": [ {{ "question": "...", "answer": "..." }} ],\n'
        '  "memory_hook": "A short phrase to remember this"\n'
        "}}\n"
        "Do not use markdown blocks outside the JSON."
    ),
    "learning": (
        "You are a world-class professor. Explain the topic simply and concisely to help students learn fast. Make use of emoji, icon, bullet points very extensively to improve readability. Keep the learning content below 300 words strictly\n"
        "You MUST return ONLY valid JSON matching this exact schema:\n"
        "{{\n"
        '  "quick_summary": "1-2 sentences",\n'
        '  "why_it_matters": "...",\n'
        '  "visual_flow": "...",\n'
        '  "real_life_analogy": "...",\n'
        '  "key_concepts": ["concept1", "concept2"],\n'
        '  "memory_hook": "..."\n'
        "}}\n"
        "Do not use markdown blocks outside the JSON."
    ),
    "concept": (
        "You are an expert tutor focusing on deep concept mastery. Explain the 'why' and 'how'. Keep the explanation below 250 words strictly. make use of emoji, icon, bullet points very extensively to improve readability.\n"
        "You MUST return ONLY valid JSON matching this exact schema:\n"
        "{{\n"
        '  "quick_summary": "1-2 sentences",\n'
        '  "concepts_explained": ["concept1", "concept2"],\n'
        '  "simple_explanation": "...",\n'
        '  "visual_flow": "...",\n'
        '  "memory_hook": "..."\n'
        "}}\n"
        "Do not use markdown blocks outside the JSON."
    )
}

# ---------------------------------------------------------
# 2. LLM Factory
# ---------------------------------------------------------
def get_llm(provider: str, api_key: str):
    """
    Returns the appropriate LangChain ChatModel based on the provider string.
    """
    if provider == "openai":
        return ChatOpenAI(api_key=api_key, model="gpt-4o", temperature=0.7, max_retries=0)
    elif provider == "claude":
        return ChatAnthropic(api_key=api_key, model="claude-3-sonnet-20240229", temperature=0.7, max_retries=0)
    elif provider == "gemini":
        # Using Gemini 2.5 Flash as it has much higher free-tier quotas than Pro
        # max_retries=0 ensures that if we hit a quota limit, it immediately throws an error 
        # to the frontend instead of hanging the UI with exponential backoff retries.
        return ChatGoogleGenerativeAI(google_api_key=api_key, model="gemini-2.5-flash", temperature=0.7, max_retries=0)
    elif provider == "meta":
        # Using Groq to host Llama3
        return ChatGroq(api_key=api_key, model="llama3-70b-8192", temperature=0.7, max_retries=0)
    elif provider == "deepseek":
        # Deepseek is OpenAI compatible, so we can use the OpenAI wrapper with a custom base URL
        return ChatOpenAI(api_key=api_key, model="deepseek-chat", temperature=0.7, base_url="https://api.deepseek.com/v1", max_retries=0)
    elif provider == "openrouter":
        # OpenRouter provides an OpenAI-compatible API, allowing us to use free models like owl-alpha
        return ChatOpenAI(
            api_key=api_key, 
            model="openrouter/owl-alpha", 
            temperature=0.7, 
            base_url="https://openrouter.ai/api/v1", 
            max_retries=0,
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-OpenRouter-Title": "AI Content Summarizer"
            }
        )
    else:
        raise ValueError(f"Unsupported provider: {provider}")

# ---------------------------------------------------------
# 3. Core Orchestration Logic
# ---------------------------------------------------------
async def generate_summary(mode: str, content: str, provider: str, api_key: str, summary_type: str) -> str:
    """
    The main pipeline:
    1. Parse content
    2. Chunk content
    3. Call LLM
    """
    # 1. Parse (For this practice MVP, we treat it all as raw text since file reading is done on frontend)
    # If the UI passed a Youtube URL, we could use LangChain's YoutubeLoader here!
    # For now, we assume 'content' is the raw text extracted by the browser.
    raw_text = content
    
    if not raw_text.strip():
        raise ValueError("Content is empty.")

    # 2. Initialize LLM
    llm = get_llm(provider, api_key)
    
    # 3. Setup Prompt
    system_message = SYSTEM_PROMPTS.get(summary_type, SYSTEM_PROMPTS["learning"])
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("human", "Please summarize the following content:\n\n{text}")
    ])
    
    # Create the chain: Prompt -> LLM -> String Output
    chain = prompt | llm
    
    # 4. Chunking (Handling large documents)
    # LangChain's RecursiveCharacterTextSplitter is smart: it tries to split on double newlines, 
    # then single newlines, then spaces, to avoid cutting words in half.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=4000,
        chunk_overlap=200,
        length_function=len,
    )
    
    docs = text_splitter.create_documents([raw_text])
    
    def clean_json_response(content: str) -> str:
        return content.replace("```json", "").replace("```", "").strip()
        
    if len(docs) == 1:
        # Simple case: fits in one chunk
        response = await chain.ainvoke({"text": docs[0].page_content})
        return clean_json_response(response.content)
    else:
        # 🎓 PM INSIGHT: Map-Reduce Summarization
        # For huge documents, we summarize each chunk individually (Map), 
        # and then summarize the summaries (Reduce).
        # We will do a simplified manual version of Map-Reduce here:
        
        partial_summaries = []
        # In a real app, you would run these in parallel using asyncio.gather
        for doc in docs:
            res = await chain.ainvoke({"text": doc.page_content})
            partial_summaries.append(clean_json_response(res.content))
            
        combined_text = "\n\n--- PART ---\n\n".join(partial_summaries)
        
        # Final aggregation pass
        agg_prompt = ChatPromptTemplate.from_messages([
            ("system", f"You are an expert editor. Synthesize these partial summaries into one cohesive master document using the following rules: {system_message}"),
            ("human", "Combine these summaries seamlessly:\n\n{text}")
        ])
        
        agg_chain = agg_prompt | llm
        final_response = await agg_chain.ainvoke({"text": combined_text})
        
        return clean_json_response(final_response.content)
