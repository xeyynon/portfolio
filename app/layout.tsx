import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Rail from "@/components/ui/Rail";
import Header from "@/components/ui/Header";
import IntroSequence from "@/components/IntroSequence";

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
  title: "Surya Pratik — Embedded Systems & IoT Engineer",
  description:
    "Portfolio of Surya Pratik: embedded systems, IoT, and applied machine learning. LiFi transmission, Wi-Fi CSI sensing, LoRa mesh networks.",
};

// Applies the stored theme before first paint so the page never flashes the
// wrong palette. Inline and synchronous by necessity.
const themeScript = `try{if(localStorage.theme==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <a href="#main" className="skip-link">Skip to content</a>
        <IntroSequence>
          <Rail />
          <Header />
          <main id="main">{children}</main>
        </IntroSequence>
      </body>
    </html>
  );
}
