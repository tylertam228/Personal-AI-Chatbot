# FastAPI AI Chat Backend

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import ask, RATE_LIMIT_MSG

load_dotenv()

app = FastAPI(title="AI Chatbot Backend")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3002", # Here is the frontend port, change it to your own frontend port
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        answer = ask(req.question)
    except Exception:
        answer = RATE_LIMIT_MSG
    return ChatResponse(answer=answer)
