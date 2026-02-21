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

      {/* Dialogue Box (fixed to viewport bottom) */}
      <DialogueBox />
    </div>
  );
}
