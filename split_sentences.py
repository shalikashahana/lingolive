import json

with open('frontend/src/data/koreanSentencesData.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

all_sentences = d['modules'][0]['sentences'] if 'modules' in d and len(d['modules']) > 0 else d.get('sentences', [])

module_titles = [
    ('Module 1', 'Basic Greetings & Expressions'),
    ('Module 2', 'Daily Life & Family Conversations'),
    ('Module 3', 'Travel, Dining & Shopping'),
    ('Module 4', 'Advanced Dialogues & Work')
]

num_modules = 4
per_module = len(all_sentences) // num_modules  # 200 each

modules = []
for i in range(num_modules):
    start = i * per_module
    end = (i + 1) * per_module if i < num_modules - 1 else len(all_sentences)
    m_sentences = all_sentences[start:end]
    
    modules.append({
        'module': i + 1,
        'title': module_titles[i][0],
        'description': module_titles[i][1],
        'total_sentences': len(m_sentences),
        'sentences': m_sentences
    })

korean_sentences_4m = {
    'language': 'Korean',
    'code': 'ko',
    'total_sentences': len(all_sentences),
    'modules': modules
}

with open('frontend/src/data/koreanSentencesData.json', 'w', encoding='utf-8') as f:
    json.dump(korean_sentences_4m, f, ensure_ascii=False, indent=2)

print('Successfully divided 800 sentences into 4 modules!')
for m in modules:
    print(f"Module {m['module']}: {m['description']} ({m['total_sentences']} sentences)")
