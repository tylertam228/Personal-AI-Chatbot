# RAG Module

import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")
COLLECTION_NAME = "knowledge_base"

RELEVANCE_THRESHOLD = 1.5

CONTACT_EMAIL = os.getenv("CONTACT_EMAIL", "the website owner")

RATE_LIMIT_MSG = (
    "Sorry, my human is poor so using some free ai model but having limited usage, "
    "if you also upset for this, you can support him: buymeacoffee.com/tiger228"
)

FALLBACK_MSG = (
    "My human didn't told me that... "
    "maybe just ask him by email {email}？"
)

_PROMPT = PromptTemplate.from_template(
    "You are a helpful assistant for a personal website. "
    "Answer the question based ONLY on the following context. "
    "If the context doesn't contain enough information to answer, "
    "respond with exactly: NO_RELEVANT_INFO\n"
    "Keep your answer concise and friendly.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}\n"
    "Answer:"
)


def _get_vectorstore() -> Chroma:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004") # This is the model used to embed the question
    return Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )


def _is_rate_limited(exc: Exception) -> bool:
    # Check if the exception is a Gemini 429 rate-limit error
    err_str = str(exc)
    err_type = type(exc).__name__
    return (
        "429" in err_str
        or "ResourceExhausted" in err_type
        or "RESOURCE_EXHAUSTED" in err_str
    )


def ask(question: str) -> str:
    # Return an AI-generated answer, a fallback, or a rate-limit message
    try:
        vectorstore = _get_vectorstore()
        results = vectorstore.similarity_search_with_score(question, k=3)

        relevant_docs = [
            (doc, score) for doc, score in results if score < RELEVANCE_THRESHOLD
        ]

        if not relevant_docs:
            return FALLBACK_MSG.format(email=CONTACT_EMAIL)

        context = "\n\n".join(doc.page_content for doc, _ in relevant_docs)

        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
        """
        You can also use other models in free tier like:
        gemini-2.0-flash-lite
        gemini-1.5-flash
        They all 1500/day usage limit.
        """
        chain = _PROMPT | llm
        result = chain.invoke({"context": context, "question": question})
        answer = result.content.strip()

        if "NO_RELEVANT_INFO" in answer:
            return FALLBACK_MSG.format(email=CONTACT_EMAIL)

        return answer

    except Exception as exc:
        if _is_rate_limited(exc):
            return RATE_LIMIT_MSG
        raise
