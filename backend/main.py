# backend/main.py
# ===============
# 
# The FastAPI server entry point.
# 
# 🎓 PM INSIGHT — Client-Server Architecture:
# By moving logic here, the browser (React) no longer processes the AI tasks.
# It simply says "Here is the text, please summarize it" and waits.
# This server receives the request, orchestrates LangChain, and returns the result.

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from backend.summarizer import generate_summary

app = FastAPI(title="AI Content Summarizer API")

# 🎓 PM INSIGHT — CORS (Cross-Origin Resource Sharing):
# Since our React app runs on port 5173 and this Python server runs on port 8000,
# browsers will block communication between them for security reasons.
# We must explicitly allow localhost:5173 to talk to this server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected JSON payload from the frontend
class SummarizeRequest(BaseModel):
    mode: str          # 'text', 'file', or 'youtube'
    content: str       # The raw text or URL
    provider: str      # 'openai', 'claude', etc.
    apiKey: str        # The user's API key passed from the UI
    summaryType: str   # 'interview', 'learning', or 'concept'

@app.post("/api/summarize")
async def summarize_endpoint(request: SummarizeRequest):
    try:
        # Pass the request data to our LangChain orchestrator
        result = await generate_summary(
            mode=request.mode,
            content=request.content,
            provider=request.provider,
            api_key=request.apiKey,
            summary_type=request.summaryType
        )
        return {"result": result}
    except Exception as e:
        print(f"Error during summarization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
