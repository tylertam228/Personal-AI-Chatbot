"use client";
// ↑ "use client" tells Next.js this component runs in the BROWSER.
//   Any component using React hooks (useState, useEffect) or browser
//   APIs must be a Client Component.

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

// ── TypeScript Interface ───────────────────────────────────────
// `interface` defines the shape of a data object.
// Every Message MUST have these 3 properties with these exact types.
// `role: "user" | "ai"` is a *union type* — it can ONLY be one of
// those two literal strings; anything else triggers a compile error.
interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

// The avatar image path — update this if you swap the character GIF.
const AVATAR_SRC = "/Tiger_Animation_AI.gif";

const AI_RESPONSE = "Sorry, this feature is still developing.";

const WELCOME_TEXT =
  "Greetings, traveler! It seems you wish to know more about my human. Feel free to ask — I shall answer to the best of my ability.";

export default function DialogueBox() {
  // ── useState with Generics ────────────────────────────────────
  // useState<Message[]>([...]) tells TypeScript that `messages` is
  // always an *array of Message objects*.  If you accidentally push
  // a plain string into the array, TypeScript catches it at compile time.
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "ai", text: WELCOME_TEXT },
  ]);

  // useState<string>("") — simpler generic: state is always a string.
  const [inputValue, setInputValue] = useState<string>("");

  // Tracks whether the typewriter animation is still playing.
  const [isTyping, setIsTyping] = useState<boolean>(true);

  // The `id` of the AI message currently being animated.
  const [typingId, setTypingId] = useState<number>(0);

  // ── useRef ────────────────────────────────────────────────────
  // useRef<HTMLDivElement>(null) creates a *ref* — a mutable container
  // that persists across re-renders.  The generic <HTMLDivElement>
  // tells TypeScript what DOM element type the ref will point to.
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Log question to server ───────────────────────────────────────
  // This function sends the user's question to our API endpoint,
  // which appends it to a questions.txt file on the server.
  // We use `fetch` with POST method and JSON body.
  // The function is async but we don't await it in handleSend —
  // we "fire and forget" so the UI stays responsive.
  const logQuestion = (question: string) => {
    fetch("/api/log-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }).catch((err) => {
      // Silently ignore errors — logging shouldn't break the chat
      console.error("Failed to log question:", err);
    });
  };

  // ── Event Handler ─────────────────────────────────────────────
  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const question = inputValue.trim();

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: question,
    };

    // Log the question to the server (fire and forget)
    logQuestion(question);

    // Functional updater: `prev` is the *previous* state array.
    // We spread it and append the new message, producing a new array
    // (React requires immutable state updates).
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate a short "thinking" delay before AI responds.
    setTimeout(() => {
      const aiId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: aiId, role: "ai", text: AI_RESPONSE },
      ]);
      setTypingId(aiId);
    }, 500);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="pixel-border bg-rpg-dark/95 backdrop-blur-sm mx-auto max-w-4xl relative">
        {/* ── Character Name Tag ─────────────────────────────── */}
        <div className="absolute -top-4 left-4 md:left-6 px-3 py-1 bg-rpg-dark border-2 border-rpg-gold z-10">
          <span className="font-pixel text-rpg-gold text-[8px] md:text-[10px] tracking-wide">
            ✦ Tigris Umbra
          </span>
        </div>

        {/* ── Main Dialogue Area ─────────────────────────────── */}
        <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 pt-5 md:pt-6">
          {/* Animated avatar GIF — uses a plain <img> so the GIF stays animated */}
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
            className="flex-1 min-h-[60px] md:min-h-[80px] max-h-28 md:max-h-32 overflow-y-auto dialogue-scroll"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-1.5 font-pixel text-[8px] md:text-[10px] leading-[1.8] ${
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
                  // ── TypeAnimation (react-type-animation) ──────
                  // `sequence` is an array that alternates between
                  //  strings (text to type) and callbacks / delays.
                  // `key` forces React to *unmount and remount* the
                  //  component whenever the id changes, restarting
                  //  the animation from scratch.
                  // `speed` ranges 1-99; higher = faster.
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
          <span className="text-rpg-emerald font-pixel text-[10px] md:text-xs select-none">
            &gt;
          </span>

          {/* React.KeyboardEvent<HTMLInputElement> tells TS this event
              comes from an <input>.  We can safely read e.key, etc. */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Talk to the NPC..."
            disabled={isTyping}
            className="flex-1 bg-transparent border-b-2 border-rpg-gold/20
                       text-rpg-emerald font-pixel text-[8px] md:text-[10px] py-1.5
                       placeholder:text-rpg-gold/15
                       focus:outline-none focus:border-rpg-gold/50
                       disabled:opacity-40 transition-colors"
          />

          {/* motion.button from Framer Motion — wraps a regular <button>
              and adds physics-based hover / tap animations. */}
          <motion.button
            onClick={handleSend}
            disabled={isTyping || !inputValue.trim()}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 12px rgba(255,215,0,0.35)",
            }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-rpg-gold bg-rpg-panel text-rpg-gold
                       font-pixel text-[8px] md:text-[10px] px-3 md:px-4 py-1.5 md:py-2
                       hover:bg-rpg-gold/10 disabled:opacity-25 transition-colors"
          >
            SEND
          </motion.button>
        </div>
      </div>
    </div>
  );
}
