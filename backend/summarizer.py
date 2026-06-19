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
        "You are an expert AI PM recruiter and interviewer. Your task is to analyze the provided text and extract the most important information a candidate would need to know for an MANGOS AI PM interview.\n"
        "Format your output using Markdown. Use clear headings, bullet points, and bold text for emphasis. Do not use filler words.\n"
        "Include: 1. 3-5 critical concepts. 2. 5 likely interview questions and answers. 3. A brief cheat sheet 4. Be very focussed on AI PM type questions and expected answers in MANGOS companies."
    ),
    "learning": (
        "You are a world-class professor known for explaining complex topics simply and concisely. Your goal is to help students learn material as fast as possible.\n"
        "Format your output using Markdown with emojis, bullet points, and clear sections.\n"
        "Include: 1. A 2-sentence TL;DR. 2. Key takeaways. 3. Actionable advice. 4. Make it as precise as possible 5. Explain everything in maximum 1000 words"
    ),
    "concept": (
        "You are an expert tutor focusing on first-principles thinking and deep concept mastery. You don't just summarize; you explain the 'why' and 'how' behind the text.\n"
        "Use Markdown to structure your explanation clearly.\n"
        "Include: 1. Central thesis. 2. Real-world analogy. 3.Any specific concept discussed in the topic 4. Share if any pattern is observed in the content. 5. Be concise but insightful."
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
        return ChatOpenAI(api_key=api_key, model="gpt-4o", temperature=0.7)
    elif provider == "claude":
        return ChatAnthropic(api_key=api_key, model="claude-3-sonnet-20240229", temperature=0.7)
    elif provider == "gemini":
        # Using Gemini 2.5 Flash as it has much higher free-tier quotas than Pro
        return ChatGoogleGenerativeAI(google_api_key=api_key, model="gemini-2.5-flash", temperature=0.7)
    elif provider == "meta":
        # Using Groq to host Llama3
        return ChatGroq(api_key=api_key, model="llama3-70b-8192", temperature=0.7)
    elif provider == "deepseek":
        # Deepseek is OpenAI compatible, so we can use the OpenAI wrapper with a custom base URL
        return ChatOpenAI(api_key=api_key, model="deepseek-chat", temperature=0.7, base_url="https://api.deepseek.com/v1")
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
    
    if len(docs) == 1:
        # Simple case: fits in one chunk
        response = await chain.ainvoke({"text": docs[0].page_content})
        return response.content
    else:
        # 🎓 PM INSIGHT: Map-Reduce Summarization
        # For huge documents, we summarize each chunk individually (Map), 
        # and then summarize the summaries (Reduce).
        # We will do a simplified manual version of Map-Reduce here:
        
        partial_summaries = []
        # In a real app, you would run these in parallel using asyncio.gather
        for doc in docs:
            res = await chain.ainvoke({"text": doc.page_content})
            partial_summaries.append(res.content)
            
        combined_text = "\n\n--- PART ---\n\n".join(partial_summaries)
        
        # Final aggregation pass
        agg_prompt = ChatPromptTemplate.from_messages([
            ("system", f"You are an expert editor. Synthesize these partial summaries into one cohesive master document using the following rules: {system_message}"),
            ("human", "Combine these summaries seamlessly:\n\n{text}")
        ])
        
        agg_chain = agg_prompt | llm
        final_response = await agg_chain.ainvoke({"text": combined_text})
        
        return final_response.content
