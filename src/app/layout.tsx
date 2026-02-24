import type { Metadata } from "next";
import "./globals.css";

// ── Font ────────────────────────────────────────────────────────
// Ark Pixel (方舟像素字體) by TakWolf — OFL-licensed.
// A pixel art font with multi-language support (Latin, 繁中, 簡中, 日, 韓).
// All subsets share the same em-square metrics, so every language renders
// at a consistent visual size.
// All subsets are loaded via @font-face + unicode-range in globals.css;
// the browser only downloads what the page actually needs.

// ── Page Metadata ──────────────────────────────────────────────
// `Metadata` is a TypeScript type exported by Next.js.
// It describes the shape of the metadata object (title, description, etc.).
// `icons.icon` overrides the default favicon.ico with our custom PNG.
export const metadata: Metadata = {
  title: "Tigris Umbra AI",
  description: "AI Chatbot by Tiger228",
  icons: {
    icon: "/favicon.png",
  },
};

// ── Root Layout ────────────────────────────────────────────────
// `Readonly<{ children: React.ReactNode }>` means:
//   - children: anything React can render (JSX, string, number, null …)
//   - Readonly: the props object is immutable — you can't reassign its keys.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
