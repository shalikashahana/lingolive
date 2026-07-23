import sys
import os
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load .env explicitly
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.core.supabase_client import supabase

LEVEL_TITLES = [
  "Daily Conversational Basics", "Expressing Preferences", "Ordering & Dining Out", "Travel & Directions",
  "Hobbies & Leisure", "Describing People & Places", "Workplace Essentials", "Making Plans & Invites",
  "Past Experiences", "Future Intentions", "Opinion & Arguments", "Shopping & Bargaining",
  "Nuanced Emotions", "Business Email Etiquette", "Problem Solving & Advice", "Cultural Etiquette",
  "Telephone & Video Calls", "Health & Wellness", "Technology & Innovation", "Media & Entertainment",
  "Professional Networking", "Expressing Agreement & Doubt", "Job Interviews", "Financial Terminology",
  "Environmental Discussions", "Storytelling & Narratives", "Hypothetical Scenarios", "Idioms & Phrasal Verbs",
  "Debating Complex Topics", "Project Management", "Negotiations & Persuasion", "Art & Literature Analysis",
  "Scientific Concepts", "Abstract Thought", "Formal Presentation Skills", "Cross-Cultural Communication",
  "Conflict Resolution", "Subtle Humor & Irony", "Diplomatic Language", "Academic Writing",
  "Current Affairs & Politics", "Legal & Ethical Issues", "Philosophical Inquiry", "Leadership & Vision",
  "Mastering Metaphors", "Advanced Rhetoric", "Crisis Management", "Public Speaking Mastery",
  "Advanced Argumentation", "Native Conversational Nuance", "Sophisticated Vocabulary", "Colloquial Expressions",
  "Advanced Business Strategy", "Diplomatic Protocol", "Literary Analysis", "Scientific Discourse",
  "Complex Problem Solving", "Advanced Negotiation Skills", "Cross-Cultural Mastery", "Public Relations & Media",
  "Executive Communication", "Philosophical Debate", "Legal Advocacy", "Strategic Vision",
  "Rhetorical Mastery", "Creative Storytelling", "Global Affairs Analysis", "Ethical Leadership",
  "Advanced Metaphorical Use", "Crisis Communication", "High-Stakes Presentation", "Advanced Conflict Resolution",
  "Sophisticated Humor & Satire", "Academic Research Presentation", "Diplomatic Negotiations", "Executive Leadership",
  "Mastering Vernacular", "Advanced Academic Writing", "Global Economics", "Philosophical Discourse",
  "Native-Level Precision", "Mastering Nuance & Subtlety", "High-Level Rhetorical Devices", "Advanced Persuasive Speaking",
  "Executive Diplomacy", "Mastering Idiomatic Expressions", "Literary & Cultural Criticism", "Strategic Negotiation",
  "Advanced Public Advocacy", "Complex Ethical Debates", "Executive Public Speaking", "Global Diplomacy",
  "Native-Level Fluency & Elegance", "Mastery of Abstract Concepts", "Sophisticated Rhetorical Analysis", "Executive Communication Excellence",
  "Mastery of Subtle Irony & Wit", "Native-Level Spontaneous Discourse", "Ultimate Linguistic Mastery", "LingoLive Grandmaster"
]

def generate_100_levels():
    levels = []
    for i in range(100):
        level_number = i + 1
        cefr = 'A1'
        if level_number > 80:
            cefr = 'C2'
        elif level_number > 60:
            cefr = 'C1'
        elif level_number > 45:
            cefr = 'B2'
        elif level_number > 30:
            cefr = 'B1'
        elif level_number > 15:
            cefr = 'A2'

        title = LEVEL_TITLES[i] if i < len(LEVEL_TITLES) else f"Advanced English Level {level_number}"
        
        levels.append({
            "level_number": level_number,
            "title": title,
            "cefr_band": cefr,
            "description": f"Master key sentence structures, idioms, and fluent vocabulary tailored for {cefr} level proficiency.",
            "required_vocab_count": 15 + (level_number % 10) * 2,
            "unlock_score_threshold": 80.0
        })
    return levels

def seed():
    print("Generating 100 levels...")
    levels_data = generate_100_levels()
    
    if not supabase:
        print("Supabase client is not initialized. Check your environment variables.")
        return

    print("Checking if levels already exist...")
    existing = supabase.table("levels").select("id").limit(1).execute()
    
    if len(existing.data) > 0:
        print("Levels already exist. Skipping seeding.")
        return
        
    print("Inserting 100 levels into the database...")
    res = supabase.table("levels").insert(levels_data).execute()
    print(f"Successfully inserted {len(res.data)} levels!")

if __name__ == "__main__":
    seed()
