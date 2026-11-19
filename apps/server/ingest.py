import os
import io
import time
import base64
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from groq import Groq, RateLimitError, APIStatusError
from PIL import Image

load_dotenv()

DATA_DIR = Path("my_data")
COLLECTION_NAME = "personal_rag"
VISION_MODEL = "qwen/qwen3.8-27b"
EMBEDDING_DIM = 3072
MAX_IMAGE_SIDE = 1280
JPEG_QUALITY = 85
MAX_VISION_RETRIES = 5
VISION_PAUSE_SEC = 12

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)

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


ensure_collection()

documents = []

for txt_file in DATA_DIR.glob("*.txt"):
    loader = TextLoader(str(txt_file), encoding="utf-8")
    documents.extend(loader.load())
    print(f"Loaded: {txt_file.name}")

for pdf_file in DATA_DIR.glob("*.pdf"):
    loader = PyPDFLoader(str(pdf_file))
    documents.extend(loader.load())
    print(f"Loaded: {pdf_file.name}")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def compress_image_to_base64(image_path: Path) -> str:
    with Image.open(image_path) as img:
        img = img.convert("RGB")
        img.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return encoded


def describe_image(image_path: Path) -> str:
    base64_image = compress_image_to_base64(image_path)
    last_error: Exception | None = None

    for attempt in range(1, MAX_VISION_RETRIES + 1):
        try:
            completion = groq_client.chat.completions.create(
                model=VISION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "Describe this image in detail. Extract any text if present. "
                                    "This is for a personal knowledge base."
                                ),
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                },
                            },
                        ],
                    }
                ],
            )
            return completion.choices[0].message.content
        except RateLimitError as e:
            last_error = e
            wait = VISION_PAUSE_SEC * attempt
            print(f"  Rate limited on {image_path.name}, retry {attempt}/{MAX_VISION_RETRIES} in {wait}s...")
            time.sleep(wait)
        except APIStatusError as e:
            if e.status_code == 413:
                raise
            last_error = e
            wait = VISION_PAUSE_SEC * attempt
            print(f"  API error on {image_path.name} ({e.status_code}), retry {attempt}/{MAX_VISION_RETRIES} in {wait}s...")
            time.sleep(wait)

    raise last_error or RuntimeError(f"Failed to describe {image_path.name}")


image_files = (
    list(DATA_DIR.glob("*.png"))
    + list(DATA_DIR.glob("*.jpg"))
    + list(DATA_DIR.glob("*.jpeg"))
)

for i, img_file in enumerate(image_files):
    try:
        description = describe_image(img_file)
        documents.append(
            Document(
                page_content=description,
                metadata={"source": str(img_file), "type": "image"},
            )
        )
        print(f"Processed image: {img_file.name}")
        if i < len(image_files) - 1:
            time.sleep(VISION_PAUSE_SEC)
    except Exception as e:
        print(f"Error with {img_file.name}: {e}")

print(f"\nTotal documents loaded: {len(documents)}")

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)
print(f"Total chunks: {len(chunks)}")

vectorstore = QdrantVectorStore(
    client=client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
)

vectorstore.add_documents(chunks)
print("\n✅ All data ingested into Qdrant successfully!")
