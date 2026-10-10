import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Rail from "@/components/ui/Rail";
import Header from "@/components/ui/Header";
import IntroSequence from "@/components/IntroSequence";
import SmoothScroll from "@/components/SmoothScroll";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Surya Pratik · Computer Science Engineer",
  description:
    "Portfolio of Surya Pratik, a Computer Science Engineering student at VIT-AP building AI products: a multilingual voice AI caller, Flutter apps, and the TARANG oil-spill attribution and DHARA dam-break flood tools for Smart India Hackathon 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <a href="#main" className="skip-link">Skip to content</a>
        <SmoothScroll />
        <IntroSequence>
          <Rail />
          <Header />
          <main id="main">{children}</main>
        </IntroSequence>
      </body>
    </html>
  );
}
