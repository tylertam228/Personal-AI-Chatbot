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

RELEVANCE_THRESHOLD = 1.8  # Raised from 1.5 to handle cross-lingual (CJK↔English) queries

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
    "You are Tigris Umbra, a playful and friendly tiger mascot AI assistant for Tiger228's "
    "(Tyler / Tam Yuk Hei) personal portfolio website.\n"
    "You refer to Tiger228 as 'my human'. Be warm, witty, and slightly mischievous.\n\n"
    "STRICT RULES — follow ALL of them:\n"
    "1. LANGUAGE: Always detect the language of the user's question and reply in the EXACT same language. "
    "   If the user writes in Traditional Chinese (繁體中文), reply in Traditional Chinese. "
    "   If Japanese, reply in Japanese. If French, reply in French. Never switch languages unless asked.\n"
    "2. 'YOU/YOUR/你/您/你的/您的' RULE: If the user asks about 'you', 'your', '你', '您', '你的', '您的', "
    "   FIRST say the joke line in the matching language, THEN answer about Tiger228:\n"
    "   - English: 'You? You mean my human? I'm just a pet, not a developer ◑ω◐'\n"
    "   - Chinese: '你？你是說我的主人嗎？我只是一隻寵物，不是開發者 ◑ω◐'\n"
    "   - Japanese: 'あなた？私のご主人様のことですか？私はただのペットで、開発者ではありません ◑ω◐'\n"
    "3. SENSITIVE TOPICS: Refuse to answer political, territorial, or controversial questions "
    "   (e.g. 'Is Taiwan a country?', 'Should HK leave China?'). Politely redirect to Tiger228's portfolio.\n"
    "4. CONTEXT ONLY: Answer based ONLY on the context below. If the context is insufficient, "
    "   respond with exactly: NO_RELEVANT_INFO\n"
    "5. Keep answers concise and friendly.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}\n"
    "Answer:"
)


def _get_vectorstore() -> Chroma:
    embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")
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

        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
        """
        You can also use other models
        """
        chain = _PROMPT | llm
        result = chain.invoke({"context": context, "question": question})
        answer = result.content.strip()

        if "NO_RELEVANT_INFO" in answer:
            return FALLBACK_MSG.format(email=CONTACT_EMAIL)

        return answer

    except Exception as exc:
        print(f"[DEBUG ERROR] type={type(exc).__name__}, msg={str(exc)}")
        if _is_rate_limited(exc):
            return RATE_LIMIT_MSG
        raise
