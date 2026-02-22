import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

// ── Google Font Setup ──────────────────────────────────────────
// Press_Start_2P is a pixel-art font that gives the classic JRPG feel.
// `variable` injects a CSS custom property (--font-press-start) onto <body>,
// which our Tailwind @theme then picks up via --font-pixel.
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

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
      <body className={`${pressStart2P.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
