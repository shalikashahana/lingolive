import json
import os
import time
from groq import Groq

def main():
    client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

    malayalam_path = r"src\data\malayalamWordsData.json"
    hindi_path = r"src\data\hindiWordsData.json"

    with open(malayalam_path, "r", encoding="utf-8") as f:
        ml_data = json.load(f)
    with open(hindi_path, "r", encoding="utf-8") as f:
        hi_data = json.load(f)

    hi_words_by_eng = {w.get("english_meaning"): w for w in hi_data.get("words", [])}

    missing_words = []
    for w in ml_data.get("words", []):
        eng = w.get("english_meaning")
        if eng not in hi_words_by_eng:
            missing_words.append(w)

    print(f"Found {len(missing_words)} missing words.")

    batch_size = 20
    for i in range(0, len(missing_words), batch_size):
        batch = missing_words[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(len(missing_words)+batch_size-1)//batch_size}...")
        
        prompt = "Translate the following English meanings into Hindi. Provide the Hindi script, the English transliteration of the Hindi, and the Tamil transliteration of the Hindi. Respond ONLY with a valid JSON object containing an array named 'translations'.\n\n"
        prompt += "Example output format:\n{\n\"translations\": [\n"
        prompt += "  {\"hindi\": \"पानी\", \"english_transliteration\": \"Paani\", \"tamil_transliteration\": \"பானி\"}\n]\n}\n\n"
        prompt += "Input list:\n"
        for item in batch:
            prompt += f"- {item['english_meaning']}\n"
            
        success = False
        for attempt in range(3):
            try:
                completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a precise translator. Output only valid JSON with the key 'translations' mapping to an array of objects. Do not use markdown."},
                        {"role": "user", "content": prompt}
                    ],
                    model="llama3-8b-8192",
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                
                resp_str = completion.choices[0].message.content
                resp_json = json.loads(resp_str)
                translations = resp_json.get("translations", [])
                
                if len(translations) != len(batch):
                    raise ValueError(f"Expected {len(batch)} items, got {len(translations)}")
                
                for j, trans in enumerate(translations):
                    new_word = {
                        "hindi": trans["hindi"],
                        "english_transliteration": trans["english_transliteration"],
                        "tamil_transliteration": trans["tamil_transliteration"],
                        "tamil_meaning": batch[j]["tamil_meaning"],
                        "english_meaning": batch[j]["english_meaning"]
                    }
                    hi_data["words"].append(new_word)
                
                success = True
                break
            except Exception as e:
                print(f"Error on attempt {attempt+1}: {e}")
                time.sleep(2)
        
        if not success:
            print("Failed to process batch. Aborting.")
            break
            
        # Save progress after each batch
        hi_data["total_words"] = len(hi_data["words"])
        with open(hindi_path, "w", encoding="utf-8") as f:
            json.dump(hi_data, f, ensure_ascii=False, indent=2)
            
        time.sleep(1) # rate limit protection

    print(f"Done! Hindi words count: {len(hi_data['words'])}")

if __name__ == '__main__':
    main()
