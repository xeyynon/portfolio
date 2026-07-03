export const personalInfo = {
  name: "Surya Pratik",
  title: "Embedded Systems Engineer | IoT Developer | Flutter Developer",
  education: "B.Tech Computer Science and Engineering, VIT-AP University",
  summary: "Passionate engineer specializing in Embedded Systems, IoT, AI/ML, and Mobile Application Development. Experienced in developing end-to-end solutions involving hardware integration, wireless communication, cloud connectivity, and intelligent applications."
};

export const projects = [
  {
    slug: "lifi-data-transmission-system",
    num: "01",
    title: "LiFi Data Transmission System",
    pipeline: "laser → light pulse → solar receiver → decode",
    color: "var(--v400)",
    tag: "AWARDED",
    domain: "Embedded Systems, Visible Light Communication",
    description: "Wireless communication system that uses laser light to transmit digital data and a solar panel receiver with LM358 amplification for data recovery.",
    highlights: [
      "Hardware integration of Laser Module (Transmitter)",
      "Solar Panel with LM358 Operational Amplifier (Receiver)",
      "Firmware development for transmission and reception",
      "Communication testing and debugging",
      "Optimization of baud rates and synchronization delays"
    ],
    stack: ["Arduino", "Laser Module", "Solar Panel", "LM358", "Embedded C"],
    links: { github: "https://github.com/xeyynon/Lifi-Data-Transmission-System", demo: "https://drive.google.com/file/d/xxxxx/view" }
  },
  {
    slug: "telegram-drive",
    num: "02",
    title: "Telegram Drive – Telegram-Based Cloud Storage Platform",
    pipeline: "app → bot api → virtual storage",
    color: "var(--v450)",
    tag: "SHIPPED",
    domain: "Cloud Storage, Mobile Development",
    description: "Cloud storage application using Telegram Bots as the storage backend.",
    highlights: [
      "Flutter application development",
      "Telegram Bot API integration",
      "Resumable file uploads",
      "Biometric and PIN authentication",
      "Encrypted local metadata storage",
      "Virtual storage management",
      "Multi-profile support"
    ],
    stack: ["Flutter", "Telegram Bot API", "Biometrics", "Encrypted Storage", "Dart"],
    links: { github: "https://github.com/xeyynon/TelegramDriveStorage", demo: "https://drive.google.com/file/d/xxxxx/view" }
  },
  {
    slug: "ecox-industrial-safety",
    num: "03",
    title: "EcoX – Industrial Safety and Emission Monitoring System",
    pipeline: "gas sensor → raspberry pi → LTE/GPS → dashboard",
    color: "var(--v500)",
    tag: "TOP 30",
    domain: "IoT, Industrial Safety",
    description: "Portable industrial safety platform for real-time gas monitoring, GPS tracking, and cloud-connected alerts.",
    highlights: [
      "Integration of Winsen ZE03-CO Gas Sensor",
      "Integration of Quectel LTE and GPS Module",
      "Flutter mobile application development",
      "System testing and validation"
    ],
    stack: ["Raspberry Pi 4B", "Flutter", "Dart", "LTE", "GPS", "IoT"],
    links: { github: "https://github.com/xeyynon/ecoX", demo: "https://drive.google.com/file/d/xxxxx/view" }
  },
  {
    slug: "flowiq",
    num: "04",
    title: "FlowIQ – AI Powered Smart Traffic Management System",
    pipeline: "cameras → YOLOv8 → SORT tracking → route optimization",
    color: "var(--v560)",
    tag: "HIGH SCORE",
    domain: "Smart Cities, Computer Vision",
    description: "AI-powered traffic management platform with route optimization and violation management.",
    highlights: [
      "Flutter mobile application development",
      "Google API integration",
      "Authentication service integration",
      "Custom UI development",
      "Traffic monitoring and violation management interfaces"
    ],
    stack: ["Flutter", "Google Maps API", "Firebase Auth", "YOLOv8", "SORT"],
    links: { github: "https://github.com/xeyynon/TUA", demo: "https://drive.google.com/file/d/xxxxx/view" }
  },
  {
    slug: "human-presence-detection",
    num: "05",
    title: "Human Presence and Activity Detection Using CSI and Deep Learning",
    pipeline: "wifi signal → ESP32 → CSI features → EfficientNet-V2",
    color: "var(--v600)",
    tag: "FINALIST",
    domain: "Deep Learning, Wireless Sensing",
    description: "Camera-free human detection system using Wi-Fi CSI data and deep learning models.",
    highlights: [
      "Development of custom Biquad Antenna",
      "Antenna integration with ESP32 hardware",
      "Firmware development",
      "Flutter mobile application development",
      "Testing and system validation"
    ],
    stack: ["ESP32", "CSI", "EfficientNet-V2", "Flutter", "Raspberry Pi"],
    links: { github: "https://github.com/xeyynon/CSI-Sense", demo: "https://drive.google.com/file/d/xxxxx/view" }
  },
  {
    slug: "smart-water-quality",
    num: "06",
    title: "Smart Water Quality Monitoring System",
    pipeline: "sensors → ESP32 → LoRa → ML classification",
    color: "var(--v680)",
    tag: "RESEARCH",
    domain: "IoT, Machine Learning",
    description: "Real-time water quality monitoring and prediction system using LoRa mesh networking and machine learning.",
    highlights: [
      "Integration of pH, TDS, Turbidity and Temperature Sensors",
      "Development of LoRa Mesh Network (LoRaPAN)",
      "Implementation of Multi-LoRa Hopping",
      "Python pipeline connecting serial data, ML models and dashboards",
      "Testing and calibration"
    ],
    stack: ["ESP32", "LoRa", "Python", "Machine Learning", "Dashboard Development"],
    links: { github: "https://github.com/xeyynon/Water-Monitoring-Hardware", demo: "https://drive.google.com/file/d/xxxxx/view" }
  }
];

export const leadershipOrg = "Microsoft Student Chapter, VIT-AP";

export const leadership = [
  { date: "Jan 2024", role: "Hi-Tech Team Member", range: "Jan 2024 – Jun 2024", gain: 1 },
  { date: "Jun 2024", role: "Club Manager",        range: "Jun 2024 – Jun 2025", gain: 2 },
  { date: "Jul 2025", role: "President",           range: "Jul 2025 – Oct 2025", gain: 3 },
  { date: "Nov 2025", role: "Chief Advisor",       range: "Nov 2025 – Present",  gain: 4, current: true }
];

export const achievements = [
  {
    title: "Best Contemporary Project Award",
    event: "ECS EXPO 2024",
    project: "LiFi Data Transmission System",
    achievement: "Awarded among 1000+ teams"
  },
  {
    title: "Top 30 Team",
    event: "Smart India Hackathon 2025 Internal Hackathon",
    project: "EcoX",
    achievement: "Selected among 500+ teams and qualified for Semi-Final Round"
  },
  {
    title: "Highest Scoring Team",
    event: "RADIOTHON 2026",
    project: "FlowIQ",
    achievement: "Highest evaluation score in Semi-Final Round"
  },
  {
    title: "Finalist",
    event: "ECS EXPO 2026",
    project: "Human Presence and Activity Detection Using CSI and Deep Learning",
    achievement: "Qualified for Final Round"
  }
];

export const skills = [
  { label: "Embedded",    items: ["ESP32", "Arduino", "Raspberry Pi"], color: "var(--v400)", level: 4 },
  { label: "Mobile",      items: ["Flutter", "Dart"], color: "var(--v450)", level: 3 },
  { label: "Programming", items: ["Python", "C++", "Java"], color: "var(--v500)", level: 4 },
  { label: "IoT",         items: ["LoRa", "BLE", "LTE", "WiFi"], color: "var(--v560)", level: 4 },
  { label: "AI/ML",       items: ["YOLOv8", "EfficientNet-V2", "LSTM", "Edge Impulse"], color: "var(--v600)", level: 3 },
  { label: "Backend",     items: ["FastAPI", "MongoDB"], color: "var(--v680)", level: 2 },
  { label: "Tools",       items: ["Git", "VS Code", "Arduino IDE"], color: "var(--v400)", level: 4 },
  { label: "Cloud & DB",  items: ["Firebase", "Google Cloud", "PostgreSQL"], color: "var(--v450)", level: 3 }
];
