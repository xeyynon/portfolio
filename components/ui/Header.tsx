import Link from "next/link";

// Light mode removed — the site is dark-theme only now (requested
// directly). This used to also be the theme toggle; it's a plain logo
// link back to the top of the page.
export default function Header() {
  return (
    <header className="nav">
      <div className="wrap flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <Link href="/" className="logo">
          SP
        </Link>
        <nav className="nav-links flex gap-6 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 whitespace-nowrap">
          <Link href="/#about">ABOUT</Link>
          <Link href="/#experience">EXPERIENCE</Link>
          <Link href="/#projects">PROJECTS</Link>
          <Link href="/#leadership">LEADERSHIP</Link>
          <Link href="/#achievements">ACHIEVEMENTS</Link>
          <Link href="/#skills">SKILLS</Link>
          <Link href="/#contact">CONTACT</Link>
        </nav>
      </div>
    </header>
  );
}
