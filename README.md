# E4C Readiness Review — Check My Tech

**Track 2: AI-assisted technology readiness assessment for E4C Solutions Library**

E4C AI Pilot Hackathon 2026

## What it does

Innovators upload their technology documentation and receive a **readiness snapshot** showing which of the 19 E4C Solutions Library criteria are complete, partial, or missing — with actionable feedback on how to improve.

> **Advisory only** — this tool does NOT determine acceptance or rejection.

## Project structure

```
.
├── backend/          FastAPI server (Python)
│   ├── main.py
│   ├── criteria.py         19 E4C criteria schema
│   ├── assessment.py       Evaluation engine (3 modes)
│   └── requirements.txt
├── frontend/         React + Vite + Tailwind
│   └── src/App.jsx
├── docs/             Deliverables & reference
│   ├── methods-and-disclosure.md
│   ├── project-description.md
│   └── App.demo-reference.jsx
├── .env.example
└── README.md
```

## Quick Start

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt

# Option A: With Anthropic API (recommended for demo)
export ANTHROPIC_API_KEY="your-key-here"

# Option B: With KnowledgeXpert (uses E4C KnowledgeBases)
export KNOWLEDGEXPERT_API_URL="https://knowledgexpert.bearcreek.com"
export KNOWLEDGEXPERT_API_KEY="your-key-here"

# Option C: Demo mode (no API key, uses keyword matching)
# Just run without setting any keys

python main.py
# API runs on http://localhost:8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:5173
```

The frontend proxies `/api` requests to the backend on port 8000.

## Architecture

```
Frontend (React + Vite + Tailwind)
  ├── Upload screen (drag & drop PDF or paste text)
  ├── Readiness dashboard (score ring + section cards)
  └── Feedback report (actionable next steps)
        │
        ▼
Backend (Python FastAPI)
  ├── Text extraction (pdfplumber for PDFs)
  ├── Assessment engine (19 criteria evaluation)
  └── Report builder (scores, evidence, feedback)
        │
        ▼
Data Layer (KnowledgeXpert + E4C)
  ├── Solutions Library (1000+ technologies)
  ├── Research & Reports (~100 documents)
  └── KnowledgeXpert API (chat + queries)
```

## 19 Assessment Criteria

| Section | Fields |
|---------|--------|
| **Snapshot** | Product description, SDGs, Price, Target users, Competitive landscape, Countries |
| **Manufacturing & Delivery** | Manufacturing method, IP type, User provision model, Distributions to date |
| **Performance & Use** | Design specs, Performance params, Technical support, Replacement parts, Lifecycle, Safety |
| **Research & Standards** | Academic references, Regulatory compliance, Evaluation methods |

## API Endpoints

- `GET /` — Health check
- `GET /criteria` — Full criteria schema
- `POST /assess/text` — Assess from plain text
- `POST /assess/file` — Assess from uploaded file (PDF/TXT)

## Responsible AI Disclosure

- **Model**: Claude Sonnet 4 (via Anthropic API) or KnowledgeXpert (via Bear Creek AI)
- **Data sources**: E4C Solutions Library, E4C Research & Reports
- **Limitations**: Assessment is based on text analysis only; does not verify technical claims
- **Assumptions**: Document text is representative of the full technology documentation
- **Guardrails**: Advisory only; no pass/fail; all scores reference specific criteria; disclaimer shown
