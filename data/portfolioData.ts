// Content mirrors the resume; every number here must be backed by the
// resume's own sources — add facts there first, then here. No client names,
// internal URLs or private-repo links.

export const personalInfo = {
  name: "Surya Pratik",
  title: "Learning. Building. Improving",
  /** About section, one fact per tile. Taken from the former one-paragraph
   *  summary; "intern at Alfaleus" lives in Experience, so it is not here. */
  headline: "I build AI products that ship.",
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
    detail: "AI/ML, software and Flutter internships. Can join immediately.",
  },
};

export type ExperienceHighlight = {
  /** The product name, shown as the card heading. */
  lead: string;
  /** One-line result shown on the card; drawn from `text`, never new facts. */
  summary: string;
  /** The full description, one click away behind "Details". */
  text: string;
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
      summary: "Answers phone calls in Telugu, Hindi and English, replying in 1.2 to 2.5 s with no cloud telephony.",
      text: "Built a phone agent that answers calls over Bluetooth HFP with no cloud telephony, tested in Telugu, Hindi and English. Replies in 1.2 to 2.5 s on real calls through a streaming Sarvam Saaras STT → Gemini 2.5 Flash → Google TTS pipeline, chosen after evaluating 6 STT, 4 LLM and 4 TTS options."
    },
    {
      lead: "HR mobile app (Flutter, Android)",
      summary: "Put a desktop-only HR portal on employees' phones: 4 releases in 4 days, 401 automated tests.",
      text: "Put a desktop-only HR portal with no API on employees' phones: attendance, leave, payslips and claims. Piloted with 8 to 10 employees; shipped 4 releases in 4 days with 401 automated tests and CI. PAN, Aadhaar and bank data stay masked until a biometric check."
    },
    {
      lead: "GARBAE AI waste-sorting bin (v3.0)",
      summary: "Sorts waste fully offline on a Raspberry Pi; classification cut from ~14.6 s to ~2 s per item.",
      text: "Moved inference and servo control from ESP32-S3 + cloud onto a Raspberry Pi 4B that sorts fully offline, deployed in a corporate cafeteria. Cut classification from ~14.6 s to ~2 s per item and raised balanced accuracy from 45.8% to 71.5% by benchmarking models on real captures."
    },
    {
      lead: "Droptor (eye-drop adherence device)",
      summary: "50 working units built and validated in one week with the team; 1st place at GLAUCOPAT 2026.",
      text: "With the team, built and validated 50 working units in one week for the Glaucoma Society of India conference (GLAUCOPAT 2026), where it won 1st place in the product exhibition."
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
    pipeline: "Sentinel-1 radar → slick → drift hindcast → AIS tracks → ranked ships",
    tag: "SIH 2026",
    domain: "Remote Sensing, Maritime Forensics",
    description: "Oil spills at sea are rarely traced to the ship responsible. TARANG closes the loop in one workstation: it detects a slick in Sentinel-1 satellite radar, hindcasts its drift back to the release point with OpenDrift, and ranks nearby AIS vessels with a reason for every score. Built for Smart India Hackathon 2026 on an NTRO problem statement.",
    highlights: [
      "Turns a slick into a ranked list of candidate ships in ~3 min per investigation",
      "Ranked 331 vessels on a real Arabian Sea spill, after filtering out 293 implausible ones",
      "Scores each ship on 40% proximity, 40% drift trajectory and 20% behaviour anomaly (Isolation Forest), and explains the score",
      "Pulls from 5 real external data sources, including Sentinel-1 radar, NOAA GFS wind, Copernicus Marine currents and Global Fishing Watch AIS",
      "Built the Python pipeline and React/Node UI; shipped 146 builds with 208 tests (the slick-detection model was trained by a teammate)"
    ],
    stack: ["Python", "OpenDrift", "Google Earth Engine", "scikit-learn", "React", "three.js", "Node.js", "Docker"],
    skills: ["AI / ML", "Web & Backend", "Cloud & DevOps", "Languages"],
    links: { live: "https://tarang-mu.vercel.app" }
  },
  {
    slug: "dhara",
    category: "software",
    num: "02",
    title: "DHARA",
    subtitle: "Dam Hazard Assessment and Routing",
    short: "DHARA",
    pipeline: "breach scenario → 2D flood solvers → depth & arrival time → people at risk",
    tag: "SIH 2026",
    domain: "Disaster Management, Hydrodynamic Modelling",
    description: "India has seen 36 large dam failures, and the Dam Safety Act 2021 requires flood maps that most dam owners cannot produce. DHARA simulates dam-break, water-release and river-blockage scenarios and tells an officer when the water arrives, how deep it gets and who is affected. Built for Smart India Hackathon 2026 on an NTRO problem statement.",
    highlights: [
      "Benchmarked 4 flood solvers against the analytic dam-break solution: ANUGA RMSE 0.037 m, Delft3D-FM 0.047 m",
      "Modelled 5 real Indian dam and flood cases: Hidkal, Machhu-II (1979), South Lhonak (2023), Chamoli (2021) and Kosi (2008)",
      "One Hidkal screening run maps 434 km² and 240k people in the flood zone (model output, not a validated prediction)",
      "FastAPI job service with 132 tests and a React/MapLibre 2D/3D dashboard with .shp/.kml export",
      "Sentinel-1 flood watch on Google Earth Engine and a one-page brief for officers"
    ],
    stack: ["Python", "FastAPI", "ANUGA", "SFINCS", "Delft3D-FM", "DualSPHysics", "React", "MapLibre", "Google Earth Engine"],
    skills: ["Web & Backend", "Cloud & DevOps", "Languages"],
    links: { live: "https://dhara-frontend-indol.vercel.app" }
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
    links: { github: "https://github.com/xeyynon/Water-Monitoring-Hardware", demo: "/sources/PPTs/Water.pdf" }
  }
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
    title: "1st Place, Product Exhibition",
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
    title: "Top 20, Basic Track",
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
