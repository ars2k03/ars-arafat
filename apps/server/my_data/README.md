# Knowledge base (`my_data`)

Place the documents you want the assistant to learn from in this folder, then run:

```bash
python ingest.py
```

## Supported (typical)

- `.txt` — bio, skills, experience, projects, etc.
- `.pdf` — native Gemini Embedding 2 multimodal (1 page / vector)
- Images — native Gemini Embedding 2 multimodal (1 image / vector)

## Privacy

This folder often contains **personal** material. It is ignored by the root [`.gitignore`](../../.gitignore) for public clones.

- Do **not** commit private photos, full resumes, or secrets to a public remote.
- Use redacted or sample files if you need demo content in a public fork.

Maintainer: **A R S** ([@ars2k03](https://github.com/ars2k03))
