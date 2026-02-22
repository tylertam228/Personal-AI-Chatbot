"""
Usage:
    cd src/ai_backend
    source venv/bin/activate
    python ingest.py

Supported file formats: .txt, .md, .pdf
"""

import os
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")
COLLECTION_NAME = "knowledge_base"

FILE_LOADERS = [
    ("**/*.txt", TextLoader, {"encoding": "utf-8"}),
    ("**/*.md",  TextLoader, {"encoding": "utf-8"}),
    ("**/*.pdf", PyPDFLoader, {}),
]


def _load_all_documents():
    documents = []
    for glob_pattern, loader_cls, kwargs in FILE_LOADERS:
        loader = DirectoryLoader(
            DOCS_DIR,
            glob=glob_pattern,
            loader_cls=loader_cls,
            loader_kwargs=kwargs,
            silent_errors=True,
        )
        docs = loader.load()
        if docs:
            print(f"  {glob_pattern}: {len(docs)} document(s)")
        documents.extend(docs)
    return documents


def ingest():
    if not os.path.isdir(DOCS_DIR):
        print(f"[ERROR] docs/ directory not found at: {DOCS_DIR}")
        return

    print("Loading documents from docs/ ...")
    documents = _load_all_documents()

    if not documents:
        print("[ERROR] No documents found in docs/ directory.")
        print("  Supported formats: .txt, .md, .pdf")
        return

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Total: {len(documents)} document(s), split into {len(chunks)} chunk(s).")

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-exp-03-07")

    if os.path.isdir(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
        print("Cleared previous vector store.")

    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
        collection_name=COLLECTION_NAME,
    )

    print(f"Successfully ingested {len(chunks)} chunk(s) into ChromaDB.")


if __name__ == "__main__":
    ingest()
