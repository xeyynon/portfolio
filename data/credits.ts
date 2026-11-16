/**
 * What this site borrows from, for the credits sheet in the footer. Every
 * entry names a part of the site that really uses it, and every owner was
 * checked against a published source on 2026-11-16 (MD/plan_soft_skills_and_credits.md).
 * Nothing here is affiliated with the site; the names belong to their owners.
 */

export type Credit = { what: string; from: string; where: string };

export const inspirations: Credit[] = [
  { what: "The Golden Snitch", from: "Harry Potter, J.K. Rowling and Warner Bros.", where: "The opening, and the small Snitch that lands at Contact" },
  { what: "The Infinity Gauntlet and its six stones", from: "Marvel Comics and Marvel Studios", where: "The project web, the snap, and the stones of the six areas" },
  { what: "Branching and pruned timelines", from: "Loki, Marvel Studios", where: "The six branches, and the page you see when an address is wrong" },
  { what: "Time running backwards", from: "Tenet, Christopher Nolan (Syncopy, Warner Bros.)", where: "The opening rewinds slowly when you scroll back up" },
  { what: "A black hole bending starlight", from: "Interstellar, Christopher Nolan (Syncopy, Paramount, Warner Bros.)", where: "The starfield around the Snitch" },
  { what: "A web, a lightning strike, a workshop blueprint", from: "Spider-Man, Thor and Iron Man, Marvel", where: "The project web, the strike on each award, the drawings in What I am doing" },
  { what: "A prism splitting white light", from: "The Dark Side of the Moon, Pink Floyd; cover by Hipgnosis (Storm Thorgerson), drawn by George Hardie", where: "The previous version of this site" },
];

export const styles: Credit[] = [
  { what: "Bento grid, dark mode, Swiss typography", from: "uistyleguide.com", where: "The tiles, the grid and the type scale" },
  { what: "Glass without blur", from: "Liquid glass interfaces", where: "The cards, kept clear of the animated scene behind them" },
];

export const type: Credit[] = [
  { what: "Space Grotesk", from: "Florian Karsten, SIL Open Font License", where: "Headings and names" },
  { what: "Inter", from: "Rasmus Andersson, SIL Open Font License", where: "Body text" },
  { what: "IBM Plex Mono", from: "IBM, SIL Open Font License", where: "Small labels and figures" },
];

export const builtWith = ["Next.js", "React", "three.js", "Lenis"];

export const thanks = "Abhinav and Saif, for the photo in the Vectr card.";

export const notice =
  "A personal project, made out of admiration. The names above belong to their owners, and nothing here is affiliated with or endorsed by them.";
