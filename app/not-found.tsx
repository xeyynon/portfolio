import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found · Surya Pratik",
};

/** 404 in the site's language: a beam that never reaches the glass. */
export default function NotFound() {
  return (
    <section className="nf wrap">
      <svg className="nf-art" viewBox="0 0 520 160" aria-hidden="true">
        <line x1="0" y1="96" x2="230" y2="96" className="nf-beam" />
        <polygon points="330,20 410,148 250,148" className="nf-prism" />
      </svg>
      <p className="nf-code">404</p>
      <h1 className="nf-title">This wavelength doesn&apos;t exist.</h1>
      <p className="nf-text">The page you were looking for isn&apos;t here. The light went somewhere else.</p>
      <Link href="/" className="nf-home">
        Back to the prism →
      </Link>
    </section>
  );
}
