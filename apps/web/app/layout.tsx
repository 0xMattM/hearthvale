import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import {
  GAME_TAGLINE,
  GAME_TITLE,
} from "@/lib/title-cover";
import "./globals.css";
import "./title-cover-art.css";
import "./title-cover.css";
import "./social-desk.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: GAME_TITLE,
  description: GAME_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cinzel.variable}>
      <body>{children}</body>
    </html>
  );
}
