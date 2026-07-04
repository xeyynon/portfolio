# Surya Pratik — Portfolio

A premium, highly-interactive personal portfolio built with modern web technologies. Designed with a deep focus on user experience, smooth micro-animations, and a distinct spectral aesthetic.

##  Features

- **Dynamic Theme Engine:** Seamless transition between light and dark modes with carefully curated color palettes.
- **Custom SVG Animations:** A signature "prism" hero animation powered by custom CSS keyframes.
- **Staggered Sequences:** An immersive intro sequence and staggered glowing text that greets users.
- **Responsive Grid System:** A fully fluid layout that looks stunning on 4k displays, desktops, tablets, and phones.
- **Interactive Data Display:** "Hover-to-expand" project timelines, dynamic skill confidence meters, and custom tooltip overlays.
- **Strictly Typed:** 100% typed using TypeScript for robust component architecture.

##  Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) alongside modular CSS architecture.
- **Icons / Fonts:** Next/Font using Geist Mono and Geist Sans.

##  Running Locally

To get a local copy up and running, follow these simple steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xeyynon/portfolio.git
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the site:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Project Structure

- `/app` — Core Next.js routing, pages, and global stylesheet.
- `/components` — Reusable React UI components (Hero, Intro, Rail, Projects, etc).
- `/data` — The central `portfolioData.ts` file containing all site content. Update this file to modify the text, projects, and skills displayed on the site.
- `/public` — Static assets, images, and project documentation (PDFs).

##  License

Distributed under the MIT License. See `LICENSE` for more information.
