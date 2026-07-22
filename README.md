# LingoLive — AI-Powered English Learning Platform

Duolingo-style gamification + Brilliant.org-level polish, for intermediate → advanced
English learners.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons
- **Auth:** Firebase Auth (Google OAuth + Email/Password)
- **Database:** Supabase (PostgreSQL)
- **Backend:** Python FastAPI (AI orchestration, prompt engineering)
- **AI Engine:** Gemma (via API) — conversational tutor + dynamic test generation

## Folder Structure

```
lingolive/
├── frontend/                          # React (Vite) + Tailwind + Framer Motion
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── lib/
│       │   ├── firebase.js            # Firebase Auth init
│       │   └── supabaseClient.js      # Supabase JS client
│       ├── context/
│       │   └── AuthContext.jsx        # Firebase auth state provider
│       ├── pages/
│       │   ├── Login.jsx              # ✅ Phase 1
│       │   ├── Dashboard.jsx          # Phase 2 — 100-level roadmap
│       │   ├── Vocabulary.jsx         # Phase 3
│       │   ├── Chat.jsx               # Phase 4 — Gemma conversation
│       │   ├── Reading.jsx            # Phase 5
│       │   ├── Quiz.jsx               # Phase 6
│       │   └── Analytics.jsx          # Phase 7
│       └── components/
│           └── auth/
│               ├── GoogleButton.jsx
│               └── SentenceAssembly.jsx   # animated hero illustration
│
├── backend/                           # Python FastAPI
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                    # FastAPI entrypoint
│       ├── core/
│       │   ├── config.py              # env/settings
│       │   ├── security.py            # Firebase token verification
│       │   └── supabase_client.py
│       ├── routers/                   # stubs — wired up phase by phase
│       │   ├── chat.py
│       │   ├── quiz.py
│       │   ├── progress.py
│       │   └── analytics.py
│       └── services/
│           ├── gemma_service.py
│           └── prompt_templates.py
│
└── supabase/
    └── schema.sql                     # ✅ Phase 1
```

## Auth flow
Firebase issues an ID token on the client → React sends it as a `Bearer` token to
FastAPI → FastAPI verifies it with the Firebase Admin SDK before touching Supabase
or Gemma. The frontend never calls Gemma directly, so API keys and prompts stay
server-side.

## Design direction (Login / Phase 1)
- **Palette:** ink navy `#14213D` (brand panel), warm bone `#F3EFE4` (form panel),
  mastery gold `#C9A227` (CTA/accent), moss green `#3F6656` (secondary/focus)
- **Type:** Fraunces (display serif, used only for the headline), Plus Jakarta Sans
  (UI/body), IBM Plex Mono (small level tags like `B2 → C1`)
- **Signature element:** on the navy panel, word tiles drift in and snap together
  into a grammatically correct sentence, hold, dissolve, and reassemble into a new
  one — a literal visualization of "words becoming fluent sentences."

## Setup

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in your Firebase + Supabase keys
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in Firebase Admin + Supabase + Gemma keys
uvicorn app.main:app --reload
```

### Database
Run `supabase/schema.sql` in the Supabase SQL editor (or via the CLI) against a
fresh project.

## Status
- [x] Architecture
- [x] Supabase schema
- [x] Phase 1 — Login page
- [ ] Phase 2 — 100-level Dashboard (waiting on your review of Phase 1)
- [ ] Phase 3 — Vocabulary module
- [ ] Phase 4 — Gemma conversational practice
- [ ] Phase 5 — Reading module
- [ ] Phase 6 — Testing & quiz module
- [ ] Phase 7 — Analytics dashboard
