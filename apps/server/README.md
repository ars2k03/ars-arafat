<p align="center">
  <img src="assets/logo.png" alt="A R S Assistant logo" width="80" height="80" />
</p>

<h1 align="center">A R S Assistant — Server</h1>

<p align="center">
  FastAPI RAG backend for the <strong>A R S</strong> personal knowledge assistant.<br />
  LangChain · Qdrant · Gemini embeddings · Groq LLM
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.165-009688?style=flat-square" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.12%2B-3776AB?style=flat-square" alt="Python" />
  <img src="https://img.shields.io/badge/LangChain-RAG-7a2020?style=flat-square" alt="LangChain" />
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/License-MIT-1a1a1a?style=flat-square" alt="MIT" /></a>
</p>

---

## Overview

The server exposes a chat API that retrieves context from a Qdrant collection and generates answers about **A R S**. Use `ingest.py` to load files from `my_data/` into the vector store.

---

## Setup

```bash
cd apps/server
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # add your API keys
```

### Environment variables

Copy [`.env.example`](.env.example):

| Variable | Purpose |
|----------|---------|
| `GOOGLE_API_KEY` | Gemini embeddings |
| `GROQ_API_KEY` | Chat LLM via Groq |
| `QDRANT_URL` | Qdrant cluster / local URL |
| `QDRANT_API_KEY` | Qdrant API key (if required) |

### Ingest knowledge

Place documents in `my_data/` (`.txt`, `.pdf`, images), then:

```bash
python ingest.py
```

### Run API

```bash
uvicorn main:app --reload --port 8000
```

- Health: `GET http://localhost:8000/`
- Ask (full JSON): `POST http://localhost:8000/ask`  
  Body: `{ "question": "Who is A R S?" }` → `{ "answer": "..." }`
- Ask (stream): `POST http://localhost:8000/ask/stream`  
  Same body → plain-text token stream (`text/plain`)

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API

### `POST /ask`

```json
{
  "question": "What projects has A R S built?"
}
```

```json
{
  "answer": "..."
}
```

Behavior (high level):

1. Greetings / small talk → natural short reply  
2. In-context facts about A R S → answer from retrieved context  
3. Out-of-scope topics → “I wasn't trained on this topic.”

---

## Structure

```text
server/
├── main.py           # FastAPI app + RAG chain
├── ingest.py         # Document / image ingestion
├── my_data/          # Your knowledge files (do not commit secrets/PII)
├── requirements.txt
├── .env.example
└── README.md
```

---

## Privacy note

`my_data/` may contain personal resumes, photos, or notes. Before publishing a fork or pushing to a **public** remote, remove private files and keep only sample placeholders. See [../../SECURITY.md](../../SECURITY.md).

---

## License

MIT © **A R S** — see [../../LICENSE](../../LICENSE).
