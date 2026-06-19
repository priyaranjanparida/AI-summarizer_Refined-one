import google.generativeai as genai
import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python check_gemini.py YOUR_API_KEY")
        sys.exit(1)
        
    api_key = sys.argv[1]
    genai.configure(api_key=api_key)
    
    print("Available Gemini Models for your API Key:")
    try:
        models = genai.list_models()
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Error connecting to Google API: {e}")

if __name__ == "__main__":
    main()
