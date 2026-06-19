import json
import os
import sys
import asyncio
from rouge_score import rouge_scorer
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# Append the parent directory to sys.path so we can import our summarizer
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from summarizer import generate_summary

# ---------------------------------------------------------
# 1. Deterministic Evals (Heuristics)
# ---------------------------------------------------------
def eval_word_count(generated_text, max_words):
    """Fails if the generated summary is longer than the allowed max_words."""
    word_count = len(generated_text.split())
    passed = word_count <= max_words
    return passed, word_count

# ---------------------------------------------------------
# 2. Traditional NLP Evals (ROUGE)
# ---------------------------------------------------------
def eval_rouge(expected_text, generated_text):
    """Calculates the ROUGE-L score (longest common subsequence overlap)."""
    scorer = rouge_scorer.RougeScorer(['rougeL'], use_stemmer=True)
    scores = scorer.score(expected_text, generated_text)
    # Return the F1 score of ROUGE-L
    return scores['rougeL'].fmeasure

# ---------------------------------------------------------
# 3. LLM-as-a-Judge Evals (Reference-based)
# ---------------------------------------------------------
async def eval_with_llm_judge(api_key, input_text, expected_summary, generated_summary):
    """
    Uses a Judge LLM to score Factuality and Comprehensiveness from 1 to 5.
    """
    # 🎓 PM INSIGHT: We use the ultra-fast gemini-2.5-flash as our judge to save money/time.
    judge_llm = ChatGoogleGenerativeAI(google_api_key=api_key, model="gemini-2.5-flash", temperature=0.0)

    judge_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an impartial, expert grader evaluating an AI-generated summary.
You will be provided with:
1. The Original Text
2. The Expected 'Golden' Summary
3. The AI-Generated Summary

Evaluate the AI-Generated Summary on two metrics on a scale of 1 to 5.
Metric 1: Factuality (1=hallucinates wildly, 5=perfectly factual based on the Original Text).
Metric 2: Comprehensiveness (1=misses all main points of the Expected Summary, 5=captures all key meaning from the Expected Summary, even if word choice differs).

Output EXACTLY and ONLY valid JSON in this format:
{{"factuality": <int>, "comprehensiveness": <int>}}"""),
        ("human", """
[ORIGINAL TEXT]: {input_text}

[EXPECTED SUMMARY]: {expected_summary}

[GENERATED SUMMARY]: {generated_summary}
""")
    ])

    chain = judge_prompt | judge_llm
    response = await chain.ainvoke({
        "input_text": input_text,
        "expected_summary": expected_summary,
        "generated_summary": generated_summary
    })
    
    # Parse the JSON response
    try:
        # Strip out any markdown formatting the LLM might have added (e.g. ```json )
        clean_json = response.content.replace("```json", "").replace("```", "").strip()
        scores = json.loads(clean_json)
        return scores.get("factuality", 0), scores.get("comprehensiveness", 0)
    except Exception as e:
        print(f"Error parsing Judge output: {response.content}")
        return 0, 0

# ---------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------
async def run_eval_pipeline(api_key):
    dataset_path = os.path.join(os.path.dirname(__file__), "golden_dataset.json")
    with open(dataset_path, "r") as f:
        dataset = json.load(f)

    print("\n🚀 STARTING EVALUATION PIPELINE...\n" + "="*50)
    
    total_rouge = 0
    total_factuality = 0
    total_comprehensiveness = 0

    for item in dataset:
        print(f"Running Eval: {item['id']} ({item['topic']} - Persona: {item['persona']})")
        
        # 1. Generate the Summary (Using our app's actual code)
        generated_summary = await generate_summary(
            mode="text", 
            content=item['text'], 
            provider="gemini", 
            api_key=api_key, 
            summary_type=item['persona']
        )
        
        # Format expected_summary to string if it's a nested dictionary (to prevent ROUGE/LLM crashes)
        expected_sum_raw = item['expected_summary']
        expected_sum_str = json.dumps(expected_sum_raw, indent=2) if isinstance(expected_sum_raw, dict) else expected_sum_raw
        
        # 2. Run Deterministic Eval
        wc_pass, word_count = eval_word_count(generated_summary, item['max_words'])
        wc_status = "✅ PASS" if wc_pass else "❌ FAIL"
        
        # 3. Run NLP Eval
        rouge_score = eval_rouge(expected_sum_str, generated_summary)
        total_rouge += rouge_score
        
        # 4. Run LLM Judge Eval
        fact_score, comp_score = await eval_with_llm_judge(
            api_key, 
            item['text'], 
            expected_sum_str, 
            generated_summary
        )
        total_factuality += fact_score
        total_comprehensiveness += comp_score
        
        # Print Results for this item
        print(f"  ➜ Word Count:        {word_count}/{item['max_words']} {wc_status}")
        print(f"  ➜ ROUGE-L Score:     {rouge_score:.2f} (0.0 to 1.0)")
        print(f"  ➜ Factuality:        {fact_score}/5")
        print(f"  ➜ Comprehensiveness: {comp_score}/5")
        print("-" * 50)
        
    # Print Aggregate Dashboard
    num_items = len(dataset)
    print("\n📊 FINAL EVALUATION DASHBOARD")
    print("=" * 50)
    print(f"Average ROUGE-L:       {(total_rouge / num_items):.2f}")
    print(f"Average Factuality:    {(total_factuality / num_items):.1f}/5.0")
    print(f"Average Comprehensiveness: {(total_comprehensiveness / num_items):.1f}/5.0")
    print("=" * 50 + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_evals.py YOUR_GEMINI_API_KEY")
        sys.exit(1)
        
    api_key = sys.argv[1]
    asyncio.run(run_eval_pipeline(api_key))
