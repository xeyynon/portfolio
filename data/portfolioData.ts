// Content mirrors the resume; every number here must be backed by the
// resume's own sources — add facts there first, then here. No client names,
// internal URLs or private-repo links.

export const personalInfo = {
  name: "Surya Pratik",
  title: "Learning. Building. Improving",
  /** About section, one fact per tile. Taken from the former one-paragraph
   *  summary; "intern at Alfaleus" lives in Experience, so it is not here. */
  headline: "AI that answers phone calls and sorts waste offline. I build it.",
  focus: "Voice agents, LLM-backed tools, Flutter apps and, when a product needs it, the hardware they run on.",
  belief: "Growth comes from challenging yourself, embracing failures, and learning something new every day.",
  education: {
    degree: "B.Tech CSE",
    school: "VIT-AP University",
    years: "2023 → 2027",
    cgpa: "8.34",
  },
  hometown: { city: "Bhilai", region: "Chhattisgarh, India" },
  availability: {
    headline: "Open to work",
    detail: "AI/ML, software and Flutter internships.",
  },
  /** His father's sentence; credited to him on the page (owner, 2026-11-11). */
  motto: { text: "Learn something new every day.", by: "my father" },
  /** The owner's own idea, in the concise wording of his write-up
   *  "The Sine-to-Tangent Philosophy". The note is his too: it is a metaphor. */
  quote: {
    text: "We spend our lives oscillating between \u22121 and +1, until one perfect angle changes our trajectory from oscillation to infinity.",
    formula: "tan \u03B8 = sin \u03B8 / cos \u03B8",
    reason: "As \u03B8 approaches 90\u00B0, sin \u03B8 approaches 1 and cos \u03B8 approaches 0, so their ratio grows without bound.",
    note: "At exactly 90\u00B0 the tangent is undefined: infinity is approached, never reached. The mathematics is exact. The comparison with a life is a metaphor.",
  },
  contact: {
    email: "pratiksurya1207@gmail.com",
    /** Removed (owner, 2026-11-12): the resume link is not to appear anywhere, history included. */
    resume: "",
    /** Off for the time being (owner, 2026-11-12): no page links the resume while false. */
    showResume: false,
    github: { handle: "xeyynon", url: "https://github.com/xeyynon" },
    linkedin: { handle: "suryapratik", url: "https://www.linkedin.com/in/suryapratik/" },
  },
};

export type ExperienceHighlight = {
  /** The product name, shown as the card heading. */
  lead: string;
  /** One-line result shown on the card; drawn from `text`, never new facts. */
  summary: string;
  /** The full description, one click away behind "Details". */
  text: string;
  /** Which line drawing stands beside it (components/molecules/Blueprint). */
  sketch?: "caller" | "hr-app" | "sorter" | "drops";
};

export type Experience = {
  company: string;
  companyUrl?: string;
  role: string;
  period: string;
  status: "current" | "past";
  pipeline: string;
  highlights: ExperienceHighlight[];
};

export const experience: Experience = {
  company: "Alfaleus Technologies",
  companyUrl: "https://alfaleus.com",
  role: "Embedded Engineer Intern",
  period: "Since Jul 2026 · Hyderabad",
  status: "current",
  pipeline: "voice AI → mobile apps → on-device ML → hardware builds",
  highlights: [
    {
      lead: "Multilingual voice AI caller (Raspberry Pi)",
      sketch: "caller",
      summary: "Answers phone calls in Telugu, Hindi and English, replying in 1.2 to 2.5 s with no cloud telephony.",
      text: "Built a phone agent that answers calls over Bluetooth HFP with no cloud telephony, tested in Telugu, Hindi and English. Replies in 1.2 to 2.5 s on real calls through a streaming Sarvam Saaras STT → Gemini 2.5 Flash → Google TTS pipeline, chosen after evaluating 6 STT, 4 LLM and 4 TTS options."
    },
    {
      lead: "HR mobile app (Flutter, Android)",
      sketch: "hr-app",
      summary: "Put a desktop-only HR portal on employees' phones: 4 releases in 4 days, 401 automated tests.",
      text: "Put a desktop-only HR portal with no API on employees' phones: attendance, leave, payslips and claims. Piloted with 8 to 10 employees; shipped 4 releases in 4 days with 401 automated tests and CI. PAN, Aadhaar and bank data stay masked until a biometric check."
    },
    {
      lead: "GARBAE AI waste-sorting bin (v3.0)",
      sketch: "sorter",
      summary: "Sorts waste fully offline on a Raspberry Pi; classification cut from ~14.6 s to ~2 s per item.",
      text: "Moved inference and servo control from ESP32-S3 + cloud onto a Raspberry Pi 4B that sorts fully offline, deployed in a corporate cafeteria. Cut classification from ~14.6 s to ~2 s per item and raised balanced accuracy from 45.8% to 71.5% by benchmarking models on real captures."
    },
    {
      lead: "Droptor (eye-drop adherence device)",
      sketch: "drops",
      summary: "50 working units built and validated in one week with the team; 1st and 2nd place at GLAUCOPAT 2026.",
      text: "With the team, built and validated 50 working units in one week for the Glaucoma Society of India conference (GLAUCOPAT 2026), where the team won both 1st and 2nd place in the product exhibition."
    }
  ],
};

/** Stable short label used wherever a project is referenced compactly. */
export type ProjectCategory = "software" | "embedded";

export type Project = {
  slug: string;
  num: string;
  /** Which homepage group it sits in: software, or embedded / hardware. */
  category: ProjectCategory;
  /** The project's name, e.g. "TARANG". */
  title: string;
  /** What it is, shown as a quieter second part beside or under the name. */
  subtitle?: string;
  /** Short name for cross-references (skill tooltips, achievement rows). */
  short: string;
  pipeline: string;
  /** Derived, never written by hand: the spectrum colour of `skills[0]`. */
  color: string;
  tag: string;
  domain: string;
  description: string;
  highlights: string[];
  stack: string[];
  /** Skill labels this project demonstrates. Drives the skills-to-work join. */
  skills: string[];
  /** Key numbers for the case study's Results tiles, each already stated in
   *  the project's own text (no new facts). */
  metrics?: { value: string; label: string }[];
  /** What it does not do, stated plainly. Only where the project's own
   *  notes say so; shown on the designed project page. */
  limits?: string[];
  /** "What I'd do differently", only where the owner's notes give one. */
  nextTime?: string;
  links?: {
    github?: string;
    /** Slide deck PDF, rendered by DeckViewer. */
    demo?: string;
    /** Hosted live app. */
    live?: string;
  };
};

const projectEntries: Omit<Project, "color">[] = [
  {
    slug: "tarang",
    category: "software",
    num: "01",
    title: "TARANG",
    subtitle: "Oil-Spill Detection and Vessel Attribution",
    short: "TARANG",
    pipeline: "",
    tag: "SIH 2026",
    domain: "Remote Sensing, Maritime Forensics",
    description: "",
    highlights: [],
    stack: [],
    skills: ["AI / ML", "Web & Backend", "Cloud & DevOps", "Languages"],
    metrics: [],
    limits: [],
    nextTime: "",
    // live link removed (owner, 2026-11-12): not to appear anywhere, history included
    links: {}
  },
  {
    slug: "dhara",
    category: "software",
    num: "02",
    title: "DHARA",
    subtitle: "Dam Hazard Assessment and Routing",
    short: "DHARA",
    pipeline: "",
    tag: "SIH 2026",
    domain: "Disaster Management, Hydrodynamic Modelling",
    description: "",
    highlights: [],
    stack: [],
    skills: ["Web & Backend", "Cloud & DevOps", "Languages"],
    metrics: [],
    // live link removed (owner, 2026-11-12): not to appear anywhere, history included
    links: {}
  },
  {
    slug: "lifi-data-transmission-system",
    category: "embedded",
    num: "03",
    title: "Li-Fi Data Transmission System",
    short: "Li-Fi",
    pipeline: "laser → light pulse → solar receiver → decode",
    tag: "AWARDED",
    domain: "Embedded Systems, Visible Light Communication",
    description: "Won Best Contemporary Project among 1,000+ teams at Engineering Clinics I (Fall 2024/25). A wireless link that sends data as laser light pulses and recovers it with a solar-panel receiver.",
    highlights: [
      "Laser transmitter on an Arduino Mega using on-off keying",
      "Solar-panel receiver with an LM358 amplifier",
      "Sends text and an 8×8 grayscale image over a 50 m link",
      "Firmware for transmission and reception, plus link testing and debugging"
    ],
    stack: ["Arduino Mega", "Laser Module", "Solar Panel", "LM358", "Embedded C"],
    skills: ["Hardware", "Languages"],
    metrics: [
      { value: "50 m", label: "Link range" },
      { value: "1,000+", label: "Teams in the contest it won" },
    ],
    links: { github: "https://github.com/xeyynon/Lifi-Data-Transmission-System", demo: "/sources/PPTs/LIFI.pdf" }
  },
  {
    slug: "orca",
    category: "software",
    num: "04",
    title: "ORCA",
    subtitle: "Satellite Collision-Risk Screening",
    short: "ORCA",
    pipeline: "orbit catalog → KD-tree search → refinement → risk tiers",
    tag: "LIVE",
    domain: "Space Situational Awareness",
    description: "Commercial satellite conjunction tools are expensive and closed. ORCA is an open pipeline from raw orbit data (TLEs) to the close approaches that matter this week.",
    highlights: [
      "Screens a 15,968-object satellite catalog for one day of close approaches in 19 s",
      "KD-tree candidate search within 100 km, then parallel refinement of each approach",
      "Ranks close approaches by collision probability into 5 risk tiers",
      "FastAPI + React/three.js, Docker on Oracle Cloud with CI deploys"
    ],
    stack: ["Python", "FastAPI", "React", "three.js", "Docker", "Oracle Cloud"],
    skills: ["Web & Backend", "Cloud & DevOps", "Languages"],
    metrics: [
      { value: "15,968", label: "Objects screened" },
      { value: "19 s", label: "For one day of close approaches" },
      { value: "5", label: "Risk tiers" },
    ],
    links: { live: "https://orca-vitap.vercel.app" }
  },
  {
    slug: "surrag",
    category: "software",
    num: "05",
    title: "SURRAG",
    subtitle: "Criminal Network Analysis",
    short: "SURRAG",
    pipeline: "police FIR → entity extraction → person resolution → case graph → leads",
    tag: "LIVE",
    domain: "LLM Applications, Graph Analytics",
    description: "Links police first information reports (FIRs) into a searchable case graph, so investigators can see connections across cases with a citation behind every lead.",
    highlights: [
      "LLM entity extraction with spaCy and regex fallbacks",
      "Fuzzy person resolution across reports",
      "Neo4j case graph plus Qdrant semantic search",
      "FastAPI backend with about 20 endpoints and NCRB hotspot data covering 783 districts",
      "Demo runs on synthetic FIRs"
    ],
    stack: ["Python", "FastAPI", "LLM", "spaCy", "Neo4j", "Qdrant"],
    skills: ["AI / ML", "Web & Backend", "Cloud & DevOps", "Languages"],
    metrics: [
      { value: "783", label: "Districts of hotspot data" },
      { value: "~20", label: "API endpoints" },
    ],
    links: { live: "https://crimelink-frontend.vercel.app" }
  },
  {
    slug: "human-presence-detection",
    category: "embedded",
    num: "06",
    title: "CSI-Sense",
    subtitle: "Camera-Free Activity Detection over Wi-Fi",
    short: "CSI-Sense",
    pipeline: "Wi-Fi signal → ESP32-S3 + biquad antenna → CSI spectrograms → EfficientNetV2 → app",
    tag: "TEAM",
    domain: "Wireless Sensing, Mobile Development",
    description: "Detects human presence and activity from Wi-Fi channel state information (CSI), with no camera. Team project for Engineering Clinics II (Winter 2025/26).",
    highlights: [
      "Built the Flutter app that shows live presence and activity",
      "Helped the team build the custom biquad antenna",
      "Team pipeline: 4× ESP32-S3 receivers, Hampel filtering, CSI spectrograms and an EfficientNetV2-S classifier"
    ],
    stack: ["Flutter", "Dart", "ESP32-S3", "EfficientNetV2-S"],
    skills: ["Mobile", "Hardware"],
    metrics: [
      { value: "4", label: "ESP32-S3 receivers" },
    ],
    links: { github: "https://github.com/xeyynon/CSI-Sense", demo: "/sources/PPTs/CSI.pdf" }
  },
  {
    slug: "ecox-industrial-safety",
    category: "embedded",
    num: "07",
    title: "EcoX",
    subtitle: "Industrial Emission and Worker-Safety Device",
    short: "EcoX",
    pipeline: "CO sensor → Raspberry Pi 4B → 4G/GPS → Flutter dashboard",
    tag: "SEMI FINALIST",
    domain: "IoT, Industrial Safety",
    description: "A portable, low-cost emission and worker-safety device for small and medium industries. Smart India Hackathon 2025 Semi Finalist.",
    highlights: [
      "Built the Flutter monitoring dashboard",
      "Device: Raspberry Pi 4B with CO sensing, YOLOv8n fire detection, 4G + GPS alerts and a speaker alarm",
      "Supported the team on hardware integration and testing"
    ],
    stack: ["Flutter", "Dart", "Raspberry Pi 4B", "LTE", "GPS"],
    skills: ["Mobile", "Hardware"],
    links: { github: "https://github.com/xeyynon/ecoX", demo: "/sources/PPTs/ECOX.pdf" }
  },
  {
    slug: "flowiq",
    category: "software",
    num: "08",
    title: "FlowIQ",
    subtitle: "Smart Traffic App",
    short: "FlowIQ",
    pipeline: "citizen app → maps & directions → challans → payment",
    tag: "98/100 R1",
    domain: "Smart Cities, Mobile Development",
    description: "Team Veda-Bytes' smart traffic management platform for RADIOTHON 2026, which scored 98/100 in Round 1. I built the citizen-facing mobile app.",
    highlights: [
      "Built the Flutter user app",
      "Google Maps and Directions integration for routing",
      "Supabase authentication and data",
      "Challan (traffic fine) view and payment screens"
    ],
    stack: ["Flutter", "Dart", "Supabase", "Google Maps API", "Directions API"],
    skills: ["Mobile", "Cloud & DevOps"],
    metrics: [
      { value: "98/100", label: "Round 1, RADIOTHON 2026" },
    ],
    links: { github: "https://github.com/xeyynon/TUA", demo: "/sources/PPTs/FLOWIQ.pdf" }
  },
  {
    slug: "telegram-drive",
    category: "software",
    num: "09",
    title: "Telegram Drive",
    subtitle: "Encrypted Cloud Storage",
    short: "Telegram Drive",
    pipeline: "file → AES-256 chunks → Telegram → streamed back",
    tag: "PERSONAL",
    domain: "Mobile Development, Encryption",
    description: "A Flutter app that turns Telegram into encrypted cloud storage.",
    highlights: [
      "AES-256-CTR encryption on the device, with its own IV for every 48 MB chunk",
      "Encrypted file index stored in a pinned Telegram message",
      "Streaming playback that decrypts on the fly",
      "PIN-based unlock"
    ],
    stack: ["Flutter", "Dart", "Telegram Bot API", "AES-256-CTR"],
    skills: ["Mobile", "Languages"],
    metrics: [
      { value: "AES-256", label: "On-device encryption" },
      { value: "48 MB", label: "Chunks, each with its own IV" },
    ],
    links: { github: "https://github.com/xeyynon/TelegramDriveStorage" }
  },
  {
    slug: "smart-water-quality",
    category: "embedded",
    num: "10",
    title: "Water Quality Monitoring Node",
    short: "Water Node",
    pipeline: "pH · TDS · temperature → ESP32 → 433 MHz LoRa",
    tag: "PROTOTYPE",
    domain: "IoT, Environmental Sensing",
    description: "An ESP32 sensor node that reports water quality over long-range LoRa radio.",
    highlights: [
      "Reads pH, TDS and temperature sensors with 10-sample averaging",
      "Sends readings over 433 MHz LoRa every 3 s",
      "Sensor testing and calibration"
    ],
    stack: ["ESP32", "LoRa (433 MHz)", "pH / TDS / temperature sensors", "Arduino C++"],
    skills: ["Hardware", "Languages"],
    metrics: [
      { value: "3 s", label: "Reporting interval" },
      { value: "433 MHz", label: "LoRa radio" },
      { value: "10", label: "Samples averaged per reading" },
    ],
    links: { github: "https://github.com/xeyynon/Water-Monitoring-Hardware", demo: "/sources/PPTs/Water.pdf" }
  },
  // The three projects below were added on 2026-11-11 at the owner's request.
  // Their facts come from each project's own README; they are not in the
  // resume sources yet and should be added there.
  {
    slug: "isocode-knitwear",
    category: "software",
    num: "11",
    title: "IsoCode Knitwear",
    subtitle: "Order Tracking That Warns Before a Shipment Is Late",
    short: "Knitwear",
    pipeline: "floor count on a phone → run-rate projection → status with its sum → buyer link",
    tag: "LIVE",
    domain: "Operations, Offline-First Web Apps",
    description: "Order tracking for a knitwear exporter that says, before it is too late, which orders will miss their ship date, and why. Supervisors send a daily count from a phone, in Tamil, even without a signal. A server works out for every order and stage whether it will ship on time and shows the reasoning. Built on demo data.",
    highlights: [
      "Every status colour comes with the sum behind it, for example: need 467 a day, making 350 a day",
      "Supervisor screens are Tamil first and work offline: updates are saved on the phone and sent when it can, never counted twice",
      "An order with no updates is grey, never green, and a rate based on little data is labelled an estimate",
      "Buyers get a read-only page of only their own orders, and only what a merchandiser has confirmed",
      "A supervisor's Tamil note gets an English meaning and a suggested reason with its confidence; the merchandiser decides",
      "Row-level security is forced on every table"
    ],
    stack: ["TypeScript", "React 19", "PostgreSQL 16", "Row-level security", "GitHub Actions"],
    skills: ["Web & Backend", "Cloud & DevOps", "AI / ML", "Languages"],
    links: { live: "https://isocode-knitwear.vercel.app/", github: "https://github.com/xeyynon/IsoCode_Knitwear" }
  },
  {
    slug: "dukaan-dost",
    category: "software",
    num: "12",
    title: "Dukaan Dost",
    subtitle: "A Voice Agent That Takes Phone Orders for a Kirana Store",
    short: "Dukaan Dost",
    pipeline: "caller → speech to text → order note → code does the money → speech",
    tag: "VOICE AI",
    domain: "Voice AI, Small Business",
    description: "A voice agent for a neighbourhood kirana store. A customer calls and orders in Telugu, Hindi, English or Hinglish; the agent matches each item to the shop's stock list, confirms quantities and prices, reads back the total, keeps the shop's credit book and writes an order summary the shopkeeper sees on a dashboard. Built for Gnani.ai's Great Indian AI Internship Challenge on Gnani's speech models. All voices, shops and orders are synthetic.",
    highlights: [
      "The model never does the money: it only says which items and how many; code checks stock, rounds, totals and writes every sentence that states an amount",
      "Callers can interrupt, and the agent remembers only what was actually heard",
      "Scripted credit and loan calls: 8 of 8 exactly right, first audio 2.2 s at the median",
      "Many shops, one agent, each with a PIN-protected dashboard",
      "Took two real phone calls on a trial number; it is a demonstration line, not a production one"
    ],
    stack: ["Python", "Gnani Prisma (speech to text)", "Gnani Timbre (text to speech)", "WebSockets", "WebRTC VAD", "Docker"],
    skills: ["AI / ML", "Web & Backend", "Languages"],
    metrics: [
      { value: "8 of 8", label: "Scripted credit and loan calls exactly right" },
      { value: "2.2 s", label: "Median time to first audio" },
      { value: "4", label: "Ways to speak: Telugu, Hindi, English, Hinglish" },
    ],
  },
  {
    slug: "kindofui",
    category: "software",
    num: "13",
    title: "kindofui",
    subtitle: "An Interface Reference Library You Can Touch",
    short: "kindofui",
    pipeline: "one page → 134 live examples → view code → paste",
    tag: "LIVE",
    domain: "UI and UX, Design Reference",
    description: "134 live, clickable, copyable examples of how interfaces are designed, on one page. Every entry is alive: hover it, click it, drag it, type into it. Where a lesson is a comparison, both sides are on screen and both work.",
    highlights: [
      "38 visual styles, 18 layouts, 18 navigation patterns, 25 components and UX patterns, 5 AI patterns and 10 UX laws",
      "Every entry has the same shape, so ten styles can be compared in the time one article takes",
      "Each demo has a View code button with plain HTML, CSS and the little JavaScript it needs"
    ],
    stack: ["HTML", "CSS", "JavaScript"],
    skills: ["Web & Backend", "Languages"],
    metrics: [
      { value: "134", label: "Live examples on one page" },
      { value: "38", label: "Visual styles" },
      { value: "10", label: "UX laws you can try" },
    ],
    links: { live: "https://kindofui.vercel.app/" }
  }
];

/**
 * The three of them, in one photo (owner, 2026-11-11: "a common photo where
 * we all are three"). The photo is blurred until a person in it is pointed
 * at; then a clear circle opens round them and their name and link appear.
 *
 * `at` is where each person is in the photo, as a percentage across and down.
 * The photo has not been supplied yet, so `photo` is absent, three plain
 * figures stand in for it, and the positions and the left-to-right order
 * below are placeholders to be set from the real picture.
 */
export type TogetherPerson = { name: string; linkedin?: string; at: [number, number] };

export type Together = {
  /** Path under /public. Absent until the owner supplies it. */
  photo?: string;
  caption: string;
  people: TogetherPerson[];
};

export const together: Together = {
  caption: "Point at someone to bring them into focus.",
  people: [
    { name: "Abhinav", linkedin: "https://www.linkedin.com/in/abhinav-pentani/", at: [25, 40] },
    { name: "Surya", linkedin: personalInfo.contact.linkedin.url, at: [50, 40] },
    { name: "Saif", linkedin: "https://www.linkedin.com/in/shaik-saifuddin-482947272/", at: [75, 40] },
  ],
};


/**
 * The journey, as a wave. `level` (-1 to +1) only shapes the curve: the owner
 * asked that the lows set the shape and are never written out (2026-11-11),
 * so a point with no `label` is drawn as curve only. Labelled points are
 * facts already stated elsewhere in this file.
 */
export type JourneyPoint = {
  level: number;
  when?: string;
  label?: string;
  kind?: "start" | "role" | "award" | "build";
  /** A stop that opens into its own card (components/sections/JourneySection lists what each holds). */
  story?: "vectr" | "vit-ap";
};

export const journey: JourneyPoint[] = [
  { level: 0.55, when: "Bhilai", label: "Where it starts", kind: "start" },
  { level: -0.75 },
  { level: 0.15, when: "2022", label: "First program: a hospital management system, in Class 12", kind: "build" },
  { level: -0.6 },
  { level: 0.1, when: "Sep 2023", label: "VIT-AP University, B.Tech in Computer Science", kind: "start", story: "vit-ap" },
  { level: 0.3, when: "Sep 2023", label: "Co-founded Vectr, a student-ecosystem startup", kind: "role", story: "vectr" },
  { level: 0.35, when: "Dec 2023", label: "Joined the Microsoft Student Chapter", kind: "role" },
  { level: 0.5, when: "2024", label: "Semi Finalist, Smart India Hackathon 2024, with Vectr", kind: "award" },
  { level: 0.85, when: "2024", label: "Li-Fi: Best Contemporary Project among 1,000+ teams", kind: "award" },
  { level: 0.6, when: "Jul 2024", label: "Club Manager, Microsoft Student Chapter", kind: "role" },
  // Owner, 2026-11-12: placed 17th; "17th" is not in the resume sources yet and should be added there.
  { level: 0.65, when: "Mar 2025", label: "NEC '24: Top 20 (17th), Basic Track, E-Cell IIT Bombay", kind: "award" },
  { level: 0.7, when: "Jul 2025", label: "President, Microsoft Student Chapter", kind: "role" },
  { level: 0.9, when: "Fall 2025", label: "Best Student Chapter, as President", kind: "award" },
  { level: 0.2, when: "2025", label: "EcoX: Semi Finalist, Smart India Hackathon 2025", kind: "award" },
  { level: 0.4, when: "2026", label: "FlowIQ: 98/100 in Round 1, RADIOTHON 2026", kind: "award" },
  { level: 0.75, when: "Jul 2026", label: "Internship at Alfaleus Technologies, Hyderabad", kind: "role" },
  { level: 0.8, when: "2026", label: "TARANG and DHARA, for Smart India Hackathon 2026", kind: "build" },
  { level: 0.95, when: "Oct 2026", label: "Droptor: 1st and 2nd Place, Product Exhibition, GLAUCOPAT 2026", kind: "award" },
  // Owner, 2026-11-12: both 1st and 2nd place; the resume says 1st only and should be updated.
  { level: 0.85, when: "Nov 2026", label: "IsoCode Knitwear, Dukaan Dost and kindofui", kind: "build" },
];

export const leadershipOrg = "Microsoft Student Chapter, VIT-AP";

/** The chapter's result and scale, split out of the former one-sentence
 *  summary so each number gets its own tile. */
export const leadershipHighlight = {
  result: "Best Student Chapter",
  when: "Fall 2025, as President",
  stats: [
    { value: "8+", label: "Events run" },
    { value: "5+", label: "Webinars" },
    { value: "300+", label: "Members" },
  ],
};

/** Chapter events coordinated as Student Coordinator (LinkedIn, volunteer
 *  section), oldest first. Part of the "8+ events" figure. */
export const leadershipEvents = [
  { name: "DSA Quest", when: "Sep 2024" },
  { name: "Hack Arcade", when: "Jan 2025" },
  { name: "Morse Mystique", when: "Feb 2025" },
  { name: "CS Quest", when: "Apr 2025" },
  { name: "DSA Quest: F&F Edition", when: "Aug 2025" },
  { name: "The Matrix Hackathon '25", when: "Sep 2025" },
  { name: "The Cipher Saga", when: "Sep 2025" },
];

/** Roles outside the Microsoft chapter (LinkedIn experience section). */
export const otherRoles = [
  {
    org: "Vectr",
    role: "Co-Founder, head of the Technical Department",
    range: "Sep 2023 → Feb 2024",
    note: "A student-ecosystem startup.",
  },
  {
    org: "Entrepreneurship Club, VIT-AP",
    role: "Founding Partner, then Technical Team Lead",
    range: "May 2024 → Dec 2024",
    note: "Helped found the club; led its technical team.",
  },
];

/** Volunteer roles outside the chapter (LinkedIn volunteering), oldest first. */
export const volunteering = [
  { role: "Organising team", event: "Women in Entrepreneurship", org: "IIC VIT-AP", when: "Apr 2024" },
  { role: "Discipline team", event: "World Environment Day", org: "VIT-AP", when: "Jun 2024" },
  { role: "Technical team", event: "VITAURA'24", org: "VIT-AP", when: "Oct 2024" },
  { role: "Feedback team", event: "IHEF 2024", org: "VIT-AP", when: "Nov 2024" },
];

export type LeadershipStage = {
  date: string;
  role: string;
  range: string;
  /** What the role involved, condensed from the LinkedIn role description.
   *  Omitted when there is no source (Chief Advisor has none). */
  did?: string;
  /** The latest role; its timeline node is drawn filled. */
  current?: boolean;
};

export const leadership: LeadershipStage[] = [
  { date: "Dec 2023", role: "Hi-Tech Team Member", range: "Dec 2023 → Jun 2024", did: "Made the chapter's reels, posts and promotional content." },
  { date: "Jul 2024", role: "Club Manager",        range: "Jul 2024 → Jul 2025", did: "Ran club operations and events; mentored the Hi-Tech team." },
  { date: "Jul 2025", role: "President",           range: "Jul 2025 → Dec 2025", did: "Set the chapter's direction; led operations and outreach." },
  { date: "Dec 2025", role: "Chief Advisor",       range: "Dec 2025 → Jul 2026", current: true }
];

export type Achievement = {
  title: string;
  event: string;
  year: string;
  /** Project slug this award belongs to, when it has a project page. */
  slug?: string;
  /** Subtitle when there is no project page. */
  sub?: string;
  /** Extra fact, only when it adds something the title doesn't say. */
  achievement?: string;
  /** A large tile on the homepage: the biggest wins. */
  featured?: boolean;
};

// Ordered for the homepage bento: the two featured wins first, then newest
// first. "Best Student Chapter" is not here: it leads the Leadership section
// (one home per fact). Detail lines that only restated the title
// ("Qualified for the Semi-Final Round" under "Semi Finalist") were dropped.
export const achievements: Achievement[] = [
  {
    title: "1st and 2nd Place, Product Exhibition",
    event: "GLAUCOPAT 2026",
    year: "2026",
    sub: "Droptor eye-drop adherence device · Glaucoma Society of India",
    achievement: "50 working units built and validated in one week, with the team",
    featured: true
  },
  {
    title: "Best Contemporary Project",
    event: "Engineering Clinics I (Fall 2024/25)",
    year: "2024",
    slug: "lifi-data-transmission-system",
    achievement: "Awarded among 1,000+ teams",
    featured: true
  },
  {
    title: "98/100 in Round 1",
    event: "RADIOTHON 2026",
    year: "2026",
    slug: "flowiq",
    achievement: "Qualified for Round 2"
  },
  {
    title: "Semi Finalist",
    event: "Smart India Hackathon 2025",
    year: "2025",
    slug: "ecox-industrial-safety"
  },
  {
    title: "Top 20, Basic Track (17th)",
    event: "NEC '24, E-Cell IIT Bombay",
    year: "2025",
    sub: "National Entrepreneurship Challenge"
  },
  {
    title: "Semi Finalist",
    event: "Smart India Hackathon 2024",
    year: "2024",
    sub: "Vectr"
  }
];

/** Ordered for the target roles (AI/ML and software first); rendered in this order.
 *  No proficiency level: a 1-4 self-rating was an invented scale (build 1043). */
export const skills = [
  { label: "AI / ML",        items: ["LLM integration (Gemini)", "Speech-to-text & text-to-speech streaming", "Computer vision (SigLIP2)", "INT8 quantization", "Voice activity detection", "scikit-learn"], color: "var(--v400)" },
  { label: "Mobile",         items: ["Flutter", "Dart", "Android", "Biometric auth", "On-device OCR"], color: "var(--v450)" },
  { label: "Web & Backend",  items: ["FastAPI", "React", "Node.js", "REST APIs"], color: "var(--v500)" },
  { label: "Cloud & DevOps", items: ["Firebase", "Supabase", "PostgreSQL", "Neo4j", "Docker", "Git", "CI/CD (GitHub Actions)"], color: "var(--v560)" },
  { label: "Languages",      items: ["Python", "Java", "Dart", "JavaScript", "TypeScript", "C/C++", "SQL"], color: "var(--v600)" },
  { label: "Hardware",       items: ["Raspberry Pi (Embedded Linux, systemd)", "ESP32-S3", "Arduino", "I2C", "Bluetooth / BLE", "LoRa"], color: "var(--v680)" }
];

/**
 * A project's colour is the spectrum colour of its primary capability (the
 * first entry of its `skills`), so one colour means one capability on the
 * project rows, the rail, the project page and the skills grid. Assigning
 * colours by list position repeated them from project 7 with no meaning.
 * Throws at build time if a project names a capability that does not exist.
 */
export function capabilityColor(label: string): string {
  const group = skills.find((s) => s.label === label);
  if (!group) throw new Error(`Unknown capability "${label}": add it to skills or fix the project's skills list.`);
  return group.color;
}

/**
 * Projects listed everywhere as usual, whose own page is not open yet (owner,
 * 2026-11-12: the SIH 2026 pair). Their tiles and links stay; following one
 * lands on "not found". Bringing a page back is deleting its slug here.
 */
export const PAGELESS_PROJECTS: readonly string[] = ["tarang", "dhara"];
export const hasPage = (slug: string) => !PAGELESS_PROJECTS.includes(slug);

export const projects: Project[] = projectEntries.map((p) => ({
  ...p,
  color: capabilityColor(p.skills[0]),
}));

/**
 * Name and subtitle as one plain string, for places that only take text
 * (rail tooltips, prev/next links, achievement subtitles). A colon joins
 * them: the site uses no em or en dashes (MD/rules.md).
 */
export function projectLabel(p: Pick<Project, "title" | "subtitle">): string {
  return p.subtitle ? `${p.title}: ${p.subtitle}` : p.title;
}

/** Homepage project groups, in page order. The rail reads this too, so its
 *  ticks follow the page exactly. */
export const projectGroups = [
  { key: "software", label: "SOFTWARE" },
  { key: "embedded", label: "EMBEDDED" },
] as const satisfies readonly { key: ProjectCategory; label: string }[];

/** Projects in the order they appear on the homepage (grouped). */
export const projectsInPageOrder: Project[] = projectGroups.flatMap((g) =>
  projects.filter((p) => p.category === g.key)
);

/** Anchor id for a skill group's tile, e.g. "skill-ai-ml". */
export function skillId(label: string): string {
  return "skill-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** The six spectrum colours, in wavelength order. Each is a capability (the
 *  skills group with the same colour). */
export const spectrum = [
  { token: "--v400", nm: 400 },
  { token: "--v450", nm: 450 },
  { token: "--v500", nm: 500 },
  { token: "--v560", nm: 560 },
  { token: "--v600", nm: 600 },
  { token: "--v680", nm: 680 },
] as const;
