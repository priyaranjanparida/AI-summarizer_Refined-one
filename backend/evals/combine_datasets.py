import json

files = [
    '/Users/prpindia/Desktop/AI_Learning_Dataset_50_Topics.json',
    '/Users/prpindia/Desktop/AI_PM_Interview_Prep_Dataset.json',
    '/Users/prpindia/Desktop/Concept_Summarization_Dataset_10_Topics.json'
]

combined_data = []

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Keep original formatting exactly as the user provided
            for item in data:
                # Still ensure max_words exists for the deterministic eval if missing
                if 'max_words' not in item:
                    item['max_words'] = 250
                    
                combined_data.append(item)
    except Exception as e:
        print(f"Error processing {file}: {e}")

output_path = '/Users/prpindia/Documents/AI Projects /ai-content-summarizer/backend/evals/golden_dataset.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(combined_data, f, indent=2)

print(f"Successfully combined {len(combined_data)} items keeping original formatting.")
