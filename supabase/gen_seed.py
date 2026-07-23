LEVEL_TITLES = [
  'Daily Conversational Basics', 'Expressing Preferences', 'Ordering & Dining Out', 'Travel & Directions',
  'Hobbies & Leisure', 'Describing People & Places', 'Workplace Essentials', 'Making Plans & Invites',
  'Past Experiences', 'Future Intentions', 'Opinion & Arguments', 'Shopping & Bargaining',
  'Nuanced Emotions', 'Business Email Etiquette', 'Problem Solving & Advice', 'Cultural Etiquette',
  'Telephone & Video Calls', 'Health & Wellness', 'Technology & Innovation', 'Media & Entertainment',
  'Professional Networking', 'Expressing Agreement & Doubt', 'Job Interviews', 'Financial Terminology',
  'Environmental Discussions', 'Storytelling & Narratives', 'Hypothetical Scenarios', 'Idioms & Phrasal Verbs',
  'Debating Complex Topics', 'Project Management', 'Negotiations & Persuasion', 'Art & Literature Analysis',
  'Scientific Concepts', 'Abstract Thought', 'Formal Presentation Skills', 'Cross-Cultural Communication',
  'Conflict Resolution', 'Subtle Humor & Irony', 'Diplomatic Language', 'Academic Writing',
  'Current Affairs & Politics', 'Legal & Ethical Issues', 'Philosophical Inquiry', 'Leadership & Vision',
  'Mastering Metaphors', 'Advanced Rhetoric', 'Crisis Management', 'Public Speaking Mastery',
  'Advanced Argumentation', 'Native Conversational Nuance', 'Sophisticated Vocabulary', 'Colloquial Expressions',
  'Advanced Business Strategy', 'Diplomatic Protocol', 'Literary Analysis', 'Scientific Discourse',
  'Complex Problem Solving', 'Advanced Negotiation Skills', 'Cross-Cultural Mastery', 'Public Relations & Media',
  'Executive Communication', 'Philosophical Debate', 'Legal Advocacy', 'Strategic Vision',
  'Rhetorical Mastery', 'Creative Storytelling', 'Global Affairs Analysis', 'Ethical Leadership',
  'Advanced Metaphorical Use', 'Crisis Communication', 'High-Stakes Presentation', 'Advanced Conflict Resolution',
  'Sophisticated Humor & Satire', 'Academic Research Presentation', 'Diplomatic Negotiations', 'Executive Leadership',
  'Mastering Vernacular', 'Advanced Academic Writing', 'Global Economics', 'Philosophical Discourse',
  'Native-Level Precision', 'Mastering Nuance & Subtlety', 'High-Level Rhetorical Devices', 'Advanced Persuasive Speaking',
  'Executive Diplomacy', 'Mastering Idiomatic Expressions', 'Literary & Cultural Criticism', 'Strategic Negotiation',
  'Advanced Public Advocacy', 'Complex Ethical Debates', 'Executive Public Speaking', 'Global Diplomacy',
  'Native-Level Fluency & Elegance', 'Mastery of Abstract Concepts', 'Sophisticated Rhetorical Analysis', 'Executive Communication Excellence',
  'Mastery of Subtle Irony & Wit', 'Native-Level Spontaneous Discourse', 'Ultimate Linguistic Mastery', 'LingoLive Grandmaster'
]

lines = ['INSERT INTO levels (level_number, title, cefr_band, description, required_vocab_count, unlock_score_threshold) VALUES']
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

    title = LEVEL_TITLES[i] if i < len(LEVEL_TITLES) else f'Advanced English Level {level_number}'
    desc = f'Master key sentence structures, idioms, and fluent vocabulary tailored for {cefr} level proficiency.'
    req = 15 + (level_number % 10) * 2
    
    escaped_title = title.replace("'", "''")
    
    line = f"({level_number}, '{escaped_title}', '{cefr}', '{desc}', {req}, 80.0)"
    if i < 99:
        line += ','
    else:
        line += ' ON CONFLICT (level_number) DO NOTHING;'
    lines.append(line)

with open('seed.sql', 'w') as f:
    f.write('\n'.join(lines))
