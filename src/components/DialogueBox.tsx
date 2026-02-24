"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

const AVATAR_SRC = "/Tiger_Animation_AI.gif";

const WELCOME_TEXT =
  "Greetings, traveler! It seems you wish to know more about my human. Feel free to ask — I shall answer to the best of my ability.";

export default function DialogueBox() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "ai", text: WELCOME_TEXT },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [typingId, setTypingId] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const askQuestion = async (question: string): Promise<string> => {
    try {
      const res = await fetch("/api/log-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      return data.answer || "Sorry, I couldn't get a response right now.";
    } catch (err) {
      console.error("Failed to get AI response:", err);
      return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const question = inputValue.trim();
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    const answer = await askQuestion(question);
    const aiId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: aiId, role: "ai", text: answer }]);
    setTypingId(aiId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="pixel-border bg-rpg-dark/95 backdrop-blur-sm mx-auto max-w-4xl relative">
        {/* ── Character Name Tag ─────────────────────────────── */}
        <div className="absolute -top-4 left-4 md:left-6 px-3 py-1 bg-rpg-dark border-2 border-rpg-gold z-10">
          <span className="font-pixel text-rpg-gold text-[16px] md:text-[18px] tracking-wide">
            ✦ Tigris Umbra
          </span>
        </div>

        {/* ── Main Dialogue Area ─────────────────────────────── */}
        <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 pt-5 md:pt-6">
          <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 border-rpg-gold overflow-hidden float-animation bg-rpg-panel">
            <img
              src={AVATAR_SRC}
              alt="AI Tiger"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Messages container */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-[100px] md:min-h-[120px] max-h-44 md:max-h-52 overflow-y-auto dialogue-scroll"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-1.5 font-pixel text-[16px] md:text-[18px] leading-[1.8] ${
                  msg.role === "user"
                    ? "text-rpg-emerald"
                    : "text-rpg-gold/90"
                }`}
              >
                {msg.role === "user" ? (
                  <>
                    <span className="text-white/40">&gt; </span>
                    {msg.text}
                  </>
                ) : msg.id === typingId ? (
                  <TypeAnimation
                    key={msg.id}
                    sequence={[msg.text, () => setIsTyping(false)]}
                    speed={40}
                    cursor={true}
                  />
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Input Bar ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 md:px-4 pb-3 md:pb-4">
          <span className="text-rpg-emerald font-pixel text-[16px] md:text-[18px] select-none">
            &gt;
          </span>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            disabled={isTyping}
            className="flex-1 bg-transparent border-b-2 border-rpg-gold/20
                       text-rpg-emerald font-pixel text-[16px] md:text-[18px] py-1.5
                       placeholder:text-rpg-gold/15
                       focus:outline-none focus:border-rpg-gold/50
                       disabled:opacity-40 transition-colors"
          />

          <motion.button
            onClick={handleSend}
            disabled={isTyping || !inputValue.trim()}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 12px rgba(255,215,0,0.35)",
            }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-rpg-gold bg-rpg-panel text-rpg-gold
                       font-pixel text-[16px] md:text-[18px] px-3 md:px-4 py-1.5 md:py-2
                       hover:bg-rpg-gold/10 disabled:opacity-25 transition-colors"
          >
            SEND
          </motion.button>
        </div>
      </div>
    </div>
  );
}
