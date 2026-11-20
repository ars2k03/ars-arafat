import os
import io
import time
import uuid
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from PIL import Image
from pypdf import PdfReader, PdfWriter

load_dotenv()

DATA_DIR = Path("my_data")
COLLECTION_NAME = "personal_rag"
EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIM = 3072
MAX_IMAGE_SIDE = 1280
JPEG_QUALITY = 85
MAX_EMBED_RETRIES = 5
EMBED_PAUSE_SEC = 8
# Gemini Embedding 2: max 6 pages / request; 1 page recommended for quality.
PDF_PAGES_PER_EMBED = 1
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

embeddings = GoogleGenerativeAIEmbeddings(
    model=f"models/{EMBEDDING_MODEL}",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)

genai_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)


def ensure_collection() -> None:
    if client.collection_exists(COLLECTION_NAME):
        info = client.get_collection(COLLECTION_NAME)
        vectors = info.config.params.vectors
        size = getattr(vectors, "size", None)
        if size is None and isinstance(vectors, dict):
            first = next(iter(vectors.values()), None)
            size = getattr(first, "size", None)

        if size == EMBEDDING_DIM:
            print(f"Using existing collection: {COLLECTION_NAME} ({size}d)")
            return

        print(
            f"Recreating collection: {COLLECTION_NAME} "
            f"(was {size}d, need {EMBEDDING_DIM}d)"
        )
        client.delete_collection(COLLECTION_NAME)

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
    )
    print(f"Created collection: {COLLECTION_NAME} ({EMBEDDING_DIM}d)")


def embed_bytes(data: bytes, mime_type: str, label: str) -> list[float]:
    last_error: Exception | None = None

    for attempt in range(1, MAX_EMBED_RETRIES + 1):
        try:
            result = genai_client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=[
                    types.Part.from_bytes(
                        data=data,
                        mime_type=mime_type,
                    ),
                ],
                config=types.EmbedContentConfig(
                    output_dimensionality=EMBEDDING_DIM,
                ),
            )
            values = result.embeddings[0].values
            if not values:
                raise RuntimeError(f"Empty embedding returned for {label}")
            return list(values)
        except Exception as e:
            last_error = e
            wait = EMBED_PAUSE_SEC * attempt
            print(f"  Embed retry {attempt}/{MAX_EMBED_RETRIES} ({label}) in {wait}s: {e}")
            time.sleep(wait)

    raise last_error or RuntimeError(f"Failed to embed {label}")


def pdf_page_bytes(reader: PdfReader, start: int, count: int) -> bytes:
    writer = PdfWriter()
    for i in range(start, min(start + count, len(reader.pages))):
        writer.add_page(reader.pages[i])
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def extract_page_text(reader: PdfReader, start: int, count: int) -> str:
    parts: list[str] = []
    for i in range(start, min(start + count, len(reader.pages))):
        text = (reader.pages[i].extract_text() or "").strip()
        if text:
            parts.append(text)
    return "\n\n".join(parts)


def ingest_pdfs_native() -> int:
    """Embed PDFs with Gemini Embedding 2 multimodal API (1 page per vector)."""
    points: list[PointStruct] = []

    for pdf_file in sorted(DATA_DIR.glob("*.pdf")):
        reader = PdfReader(str(pdf_file))
        total = len(reader.pages)
        if total == 0:
            print(f"Skipped empty PDF: {pdf_file.name}")
            continue

        for start in range(0, total, PDF_PAGES_PER_EMBED):
            end = min(start + PDF_PAGES_PER_EMBED, total)
            chunk_bytes = pdf_page_bytes(reader, start, PDF_PAGES_PER_EMBED)
            page_text = extract_page_text(reader, start, PDF_PAGES_PER_EMBED)
            page_label = (
                f"page {start + 1}"
                if end == start + 1
                else f"pages {start + 1}-{end}"
            )
            content = page_text or f"[PDF {page_label} of {pdf_file.name}]"
            label = f"{pdf_file.name} {page_label}"

            vector = embed_bytes(chunk_bytes, "application/pdf", label)
            points.append(
                PointStruct(
                    id=uuid.uuid4().hex,
                    vector=vector,
                    payload={
                        "page_content": content,
                        "metadata": {
                            "source": str(pdf_file),
                            "page": start,
                            "page_end": end - 1,
                            "type": "pdf",
                        },
                    },
                )
            )
            print(f"Native-embedded PDF: {label}/{total}")

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    return len(points)


def compress_image_jpeg(image_path: Path) -> bytes:
    with Image.open(image_path) as img:
        img = img.convert("RGB")
        img.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        return buffer.getvalue()


def ingest_images_native() -> int:
    """Embed images with Gemini Embedding 2 multimodal API (1 image per vector).

    page_content is a short label for the RAG LLM; metadata.source drives media URLs.
    """
    points: list[PointStruct] = []
    image_files = sorted(
        p
        for p in DATA_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    )

    for img_file in image_files:
        try:
            image_bytes = compress_image_jpeg(img_file)
            vector = embed_bytes(image_bytes, "image/jpeg", img_file.name)
            content = (
                f"Photo of Md Arafat Rahman Sohan (A R S). "
                f"Image file: {img_file.name}"
            )
            points.append(
                PointStruct(
                    id=uuid.uuid4().hex,
                    vector=vector,
                    payload={
                        "page_content": content,
                        "metadata": {
                            "source": str(img_file),
                            "type": "image",
                        },
                    },
                )
            )
            print(f"Native-embedded image: {img_file.name}")
        except Exception as e:
            print(f"Error with {img_file.name}: {e}")

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    return len(points)


ensure_collection()

documents = []

for txt_file in DATA_DIR.glob("*.txt"):
    loader = TextLoader(str(txt_file), encoding="utf-8")
    documents.extend(loader.load())
    print(f"Loaded: {txt_file.name}")

print(f"\nTotal text documents loaded: {len(documents)}")

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)
print(f"Total text chunks: {len(chunks)}")

vectorstore = QdrantVectorStore(
    client=client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
)

if chunks:
    vectorstore.add_documents(chunks)

pdf_points = ingest_pdfs_native()
print(f"Total native PDF page vectors: {pdf_points}")

image_points = ingest_images_native()
print(f"Total native image vectors: {image_points}")

print("\n✅ All data ingested into Qdrant successfully!")
