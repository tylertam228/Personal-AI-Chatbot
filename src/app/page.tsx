import DialogueBox from "@/components/DialogueBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-rpg-dark relative overflow-hidden">
      {/* Full-screen Background GIF */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/background.gif"
          alt=""
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="absolute inset-0 bg-rpg-dark/70" />
      </div>

      {/* Privacy Notice Banner — fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-rpg-dark/90 border-b border-amber-500/30 px-4 py-2">
        <p className="font-pixel text-[16px] md:text-[18px] text-amber-400/80 text-center leading-relaxed max-w-3xl mx-auto">
          ⚠ Notice: Conversations are recorded for improvement purposes. 
          Please do not share private or sensitive information. 
          I am not responsible for any data you submit.
        </p>
      </div>

      {/* Back to Portfolio Button — fixed top-right corner (below banner) */}
      <a
        href="https://tiger228.tyhstudio.com"
        className="fixed top-12 right-4 z-50 flex items-center gap-2 px-3 py-2
                   bg-sky-500/20 border-2 border-sky-400 text-sky-300
                   font-pixel text-[16px] md:text-[18px]
                   hover:bg-sky-400/30 hover:text-sky-100 hover:border-sky-300
                   hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]
                   transition-all duration-300"
      >
        {/* CSS Arrow Icon */}
        <span className="inline-block rotate-180">➜</span>
        Portfolio
      </a>

      {/* Dialogue Box (fixed to viewport bottom) */}
      <DialogueBox />
    </div>
  );
}
