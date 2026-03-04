import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "@/styles/globals.css";
import { MetaPixel } from "@/components/ui/MetaPixel";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviewReady PH — AI Mock Interview Practice",
  description:
    "Ace your next VA, BPO, or CSR interview with AI-powered mock practice, scoring, and coaching in English or Taglish.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "InterviewReady PH",
    description: "AI-powered interview practice built for Filipino job seekers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="font-sans min-h-screen">
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
