import asyncio
import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

DATA_DIR = Path(__file__).resolve().parent / "my_data"
ALLOWED_IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
BANGLA_RE = re.compile(r"[\u0980-\u09FF]")
GREETING_RE = re.compile(
    r"^\s*(hi|hello|hey|yo|thanks|thank you|good morning|good evening|"
    r"good night|assalamu alaikum|salam|হ্যালো|হাই|হেলো|ধন্যবাদ|শুভ সকাল|"
    r"শুভ সন্ধ্যা|আসসালামু আলাইকুম|স্লাম)\s*[!.?؟]*\s*$",
    re.IGNORECASE,
)

INTENTS: list[dict] = [
    {
        "name": "photo",
        "pattern": re.compile(
            r"(photo|picture|image|pic|chobi|ছবি|selfie|portrait|dekhao|দেখাও|দেখাতে|show\s+me)",
            re.I,
        ),
        "queries": [
            "photo of Md Arafat Rahman Sohan A R S",
            "portrait picture of A R S",
        ],
        "boost": ("image",),
        "prefer_sources": (),
    },
    {
        "name": "portfolio",
        "pattern": re.compile(
            r"(portfolio|পোর্টফোলিও|পোর্টফলিও|ars2k03\.tech|personal\s+site|"
            r"personal\s+website|নিজের\s+(সাইট|ওয়েবসাইট|ওয়েবসাইট))",
            re.I,
        ),
        "queries": [
            "A R S personal portfolio website https://ars2k03.tech",
            "Md Arafat Rahman Sohan portfolio GitHub ars2k03.tech",
        ],
        "boost": ("ars2k03.tech", "portfolio", "github.com/ars2k03"),
        "prefer_sources": ("projects.txt", "experience.txt"),
    },
    {
        "name": "contact",
        "pattern": re.compile(
            r"(contact|email|e-mail|phone|mobile|number|address|gmail|linkedin|"
            r"যোগাযোগ|ইমেইল|ইমেল|ফোন|মোবাইল|নম্বর|ঠিকানা|ঠিকানায়)",
            re.I,
        ),
        "queries": [
            "A R S contact email phone address arafatsohan2003@gmail.com",
            "Md Arafat Rahman Sohan LinkedIn GitHub contact information",
        ],
        "boost": ("gmail.com", "email", "phone", "+880", "linkedin", "address"),
        "prefer_sources": ("about_me.txt", "resume.pdf"),
    },
    {
        "name": "education",
        "pattern": re.compile(
            r"(education|university|college|ruet|cse|degree|ssc|hsc|study|studied|"
            r"school|certificate|শিক্ষা|পড়াশোনা|পড়াশোনা|বিশ্ববিদ্যালয়|বিশ্ববিদ্যালয়|"
            r"কলেজ|রুয়েট|রুয়েট|ডিগ্রি|সার্টিফিকেট)",
            re.I,
        ),
        "queries": [
            "A R S education RUET CSE Rajshahi University of Engineering",
            "Md Arafat Rahman Sohan SSC HSC academic background",
        ],
        "boost": ("ruet", "education", "cse", "gpa", "certificate"),
        "prefer_sources": ("education.txt", "resume.pdf"),
    },
    {
        "name": "skills",
        "pattern": re.compile(
            r"(skill|skills|tech\s*stack|technolog|language|framework|toolkit|"
            r"দক্ষতা|স্কিল|টেক\s*স্ট্যাক|প্রযুক্তি)",
            re.I,
        ),
        "queries": [
            "A R S skills TypeScript NestJS Next.js PostgreSQL Flutter",
            "Md Arafat Rahman Sohan technical skills tech stack",
        ],
        "boost": ("typescript", "nestjs", "next.js", "postgresql", "skills"),
        "prefer_sources": ("skills.txt", "about_me.txt"),
    },
    {
        "name": "experience",
        "pattern": re.compile(
            r"(experience|work\s+experience|job|career|company|engineer|"
            r"অভিজ্ঞতা|চাকরি|কোম্পানি|ইঞ্জিনিয়ার|ইঞ্জিনিয়ার)",
            re.I,
        ),
        "queries": [
            "A R S work experience JoldiMart Chakri AI Founding Full-Stack Engineer",
            "Md Arafat Rahman Sohan professional experience roles",
        ],
        "boost": ("experience", "joldimart", "chakri", "engineer", "position"),
        "prefer_sources": ("experience.txt", "resume.pdf"),
    },
    {
        "name": "projects",
        "pattern": re.compile(
            r"(project|projects|built|build|wa\s*gateway|chakri|joldimart|npm|"
            r"প্রজেক্ট|প্রকল্প|বানিয়েছে|বানিয়েছে)",
            re.I,
        ),
        "queries": [
            "A R S projects WA Gateway Chakri AI JoldiMart ars-facebook-auth",
            "Md Arafat Rahman Sohan notable projects live sites",
        ],
        "boost": ("projects", "wa gateway", "chakri", "joldimart", "npm", "live site"),
        "prefer_sources": ("projects.txt",),
    },
    {
        "name": "github",
        "pattern": re.compile(
            r"(github|git\s*hub|repo|repository|গিটহাব|রিপো)",
            re.I,
        ),
        "queries": [
            "A R S GitHub profile https://github.com/ars2k03",
            "Md Arafat Rahman Sohan open source github repositories",
        ],
        "boost": ("github.com/ars2k03", "github"),
        "prefer_sources": ("projects.txt", "about_me.txt"),
    },
    {
        "name": "hobbies",
        "pattern": re.compile(
            r"(hobb|interest|free\s*time|passion|অভ্যাস|শখ|আগ্রহ)",
            re.I,
        ),
        "queries": [
            "A R S hobbies interests personal life",
            "Md Arafat Rahman Sohan hobbies",
        ],
        "boost": ("hobb", "interest"),
        "prefer_sources": ("hobbies.txt",),
    },
    {
        "name": "goals",
        "pattern": re.compile(
            r"(goal|ambition|future|plan|focus|লক্ষ্য|ভবিষ্যৎ|পরিকল্পনা|টার্গেট)",
            re.I,
        ),
        "queries": [
            "A R S goals short-term long-term current focus areas",
            "Md Arafat Rahman Sohan career goals ambitions",
        ],
        "boost": ("goal", "focus", "short-term", "long-term"),
        "prefer_sources": ("goals.txt",),
    },
    {
        "name": "about",
        "pattern": re.compile(
            r"(who\s+is|about\s+(him|ars|a\s*r\s*s)|full\s*name|introduce|"
            r"identity|পূর্ণ\s*নাম|কে\s+এই|পরিচয়|পরিচয়|কে\s+আর\s*এস|"
            r"আরাফাত\s*(কে|কী|কি)|who\s+is\s+arafat)",
            re.I,
        ),
        "queries": [
            "Md Arafat Rahman Sohan A R S about me full name profile",
            "who is A R S student RUET full stack engineer",
        ],
        "boost": ("md arafat rahman sohan", "name:", "current status"),
        "prefer_sources": ("about_me.txt",),
    },
]

app = FastAPI(title="Personal RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.15,
)

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

vectorstore = QdrantVectorStore(
    client=client,
    collection_name="personal_rag",
    embedding=embeddings,
)

prompt = ChatPromptTemplate.from_template("""
You are A R S Assistant — a helpful personal assistant about Md Arafat Rahman Sohan (A R S).

Hard rules:
1. Greetings / small talk only (hi, thanks, etc.): reply briefly and warmly. Offer help about A R S. Never say you lack training for greetings.

2. For questions about A R S:
   - Use ONLY the Context. Never invent facts, dates, employers, links, or numbers.
   - If Context has a partial answer, share what you can; do not refuse just because some detail is missing.
   - Refuse with the not-trained line ONLY when Context has nothing useful for the question.
   - Always speak in third person about A R S. Never use "you/your" or "আপনার/তোমার" for his role, skills, or projects.
     Say "his role" / "A R S-এর ভূমিকা" — not "your role" / "আপনার ভূমিকা".
   - Prefer the user's language (Bangla or English).
   - Format: short paragraphs, blank lines, bullet lists (- item), **bold** for key names/links.

3. Photo / ছবি requests:
   - If Context has "[Image file: ...]", confirm briefly and describe lightly if useful.
   - Do NOT refuse. Do NOT invent image URLs — the app shows images automatically.

4. Links (portfolio, GitHub, project sites, email) that appear in Context: share them when asked or clearly relevant.

Refuse phrase (only when truly unsupported):
- English: "I wasn't trained on this topic."
- Bangla: "এই বিষয়ে আমাকে ট্রেইন করানো হয়নি।"

Context:
{context}

Question: {question}

Answer:
""")

rag_llm = prompt | llm | StrOutputParser()


class Query(BaseModel):
    question: str


def _safe_image_name(source: str | None) -> str | None:
    if not source:
        return None
    name = Path(source).name
    path = (DATA_DIR / name).resolve()
    try:
        path.relative_to(DATA_DIR.resolve())
    except ValueError:
        return None
    if path.suffix.lower() not in ALLOWED_IMAGE_EXT or not path.is_file():
        return None
    return name


def _is_image_doc(doc) -> bool:
    meta = doc.metadata or {}
    if meta.get("type") == "image":
        return True
    source = meta.get("source")
    return bool(
        source and Path(str(source)).suffix.lower() in ALLOWED_IMAGE_EXT
    )


def extract_images(docs) -> list[dict]:
    seen: set[str] = set()
    images: list[dict] = []
    for doc in docs:
        if not _is_image_doc(doc):
            continue
        name = _safe_image_name((doc.metadata or {}).get("source"))
        if not name or name in seen:
            continue
        seen.add(name)
        images.append(
            {
                "name": name,
                "url": f"/api/media/{name}",
                "alt": f"Photo of A R S ({name})",
            }
        )
        if len(images) >= 3:
            break
    return images


def format_docs(docs) -> str:
    parts: list[str] = []
    for doc in docs:
        meta = doc.metadata or {}
        source = Path(str(meta.get("source", "unknown"))).name
        if _is_image_doc(doc):
            name = _safe_image_name(meta.get("source")) or source
            parts.append(f"[Source: {source} | Image file: {name}]\n{doc.page_content}")
        else:
            parts.append(f"[Source: {source}]\n{doc.page_content}")
    return "\n\n".join(parts)


def is_photo_request(question: str) -> bool:
    return bool(INTENTS[0]["pattern"].search(question))


def is_greeting(question: str) -> bool:
    return bool(GREETING_RE.match(question.strip()))


def matched_intents(question: str) -> list[dict]:
    return [intent for intent in INTENTS if intent["pattern"].search(question)]


def _doc_key(doc) -> str:
    meta = doc.metadata or {}
    return f"{meta.get('source', '')}::{hash(doc.page_content)}"


def _merge_docs(*doc_lists):
    merged: dict[str, object] = {}
    for docs in doc_lists:
        for doc in docs:
            merged[_doc_key(doc)] = doc
    return list(merged.values())


def _boost_score(doc, intent: dict) -> int:
    text = doc.page_content.lower()
    source_path = str((doc.metadata or {}).get("source", "")).lower()
    source_name = Path(source_path).name.lower()
    blob = f"{text}\n{source_path}"
    score = sum(1 for term in (intent.get("boost") or ()) if term in blob)
    for preferred in intent.get("prefer_sources") or ():
        if source_name == preferred.lower():
            score += 4
    if intent["name"] == "photo" and _is_image_doc(doc):
        score += 5
    return score


def _rank_docs(docs, intents: list[dict]):
    if not intents:
        return docs

    def score(doc) -> int:
        return max((_boost_score(doc, intent) for intent in intents), default=0)

    return sorted(docs, key=score, reverse=True)


def _latin_keywords(question: str) -> str:
    words = re.findall(r"[A-Za-z0-9][A-Za-z0-9+.#-]{1,}", question)
    stop = {
        "the", "and", "for", "with", "about", "from", "this", "that", "have",
        "what", "when", "where", "which", "who", "how", "are", "is", "was",
        "were", "can", "could", "would", "should", "please", "tell", "give",
        "show", "me", "my", "his", "her", "our", "your", "any", "some",
    }
    keep = [w for w in words if w.lower() not in stop]
    return " ".join(keep[:12])


def retrieve_docs(question: str):
    if is_greeting(question):
        return []

    base = vectorstore.similarity_search(question, k=6)
    intents = matched_intents(question)
    extra_queries: list[str] = []

    for intent in intents:
        extra_queries.extend(intent["queries"])

    if BANGLA_RE.search(question):
        latin = _latin_keywords(question)
        extra_queries.append(
            f"Md Arafat Rahman Sohan A R S {latin}".strip()
        )
        if not intents:
            extra_queries.extend(
                [
                    "Md Arafat Rahman Sohan A R S profile about education experience projects skills",
                ]
            )

    expanded = []
    for q in dict.fromkeys(extra_queries):
        expanded.extend(vectorstore.similarity_search(q, k=6))

    docs = _merge_docs(base, expanded)
    docs = _rank_docs(docs, intents)[:8]
    return docs


def run_rag(question: str):
    docs = retrieve_docs(question)
    context = format_docs(docs) if docs else "(no relevant context)"
    images = extract_images(docs) if is_photo_request(question) else []
    answer = rag_llm.invoke({"context": context, "question": question})
    return answer, images


def _ndjson(payload: dict) -> bytes:
    return (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")


async def stream_rag(question: str):
    yield _ndjson({"type": "start"})

    docs = await asyncio.to_thread(retrieve_docs, question)
    context = format_docs(docs) if docs else "(no relevant context)"
    images = extract_images(docs) if is_photo_request(question) else []
    yield _ndjson({"type": "meta", "images": images})

    async for chunk in rag_llm.astream({"context": context, "question": question}):
        if chunk:
            yield _ndjson({"type": "token", "text": chunk})
            await asyncio.sleep(0)

    yield _ndjson({"type": "done"})


@app.get("/media/{filename}")
async def media(filename: str):
    name = Path(filename).name
    path = (DATA_DIR / name).resolve()
    try:
        path.relative_to(DATA_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    if path.suffix.lower() not in ALLOWED_IMAGE_EXT or not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)


@app.post("/ask")
async def ask(query: Query):
    answer, images = run_rag(query.question)
    return {"answer": answer, "images": images}


@app.post("/ask/stream")
async def ask_stream(query: Query):
    return StreamingResponse(
        stream_rag(query.question),
        media_type="application/x-ndjson; charset=utf-8",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.get("/")
async def root():
    return {"message": "Personal RAG API is running"}
