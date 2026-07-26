import json

with open("src/data/thaiQuizData.json", "r", encoding="utf-8") as f:
    d = json.load(f)

if isinstance(d, list):
    print("ERROR: File is still a flat array - not yet converted!")
else:
    print("total_questions:", d["total_questions"])
    print("modules:", len(d["modules"]))
    for m in d["modules"]:
        print(f"  Module {m['module']}: {m['total_questions']} questions - {m['description']}")
    q = d["modules"][0]["quiz"][0]
    print("\nSample quiz item (Module 1, Q1):")
    print(json.dumps(q, ensure_ascii=False, indent=2))
    print("\nModule 9 description:", d["modules"][-1]["description"])
