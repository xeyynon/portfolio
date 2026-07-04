export const projects = [
  {
    slug: "lifi-data-transmission",
    title: "LiFi Data Transmission System",
    category: "EMBEDDED / IOT",
    summary: "Wireless data transmission using laser light instead of radio waves.",
    flow: ["laser", "light pulses", "solar receiver", "decode"],
    contributions: [
      "Hardware integration (laser transmitter, solar panel + LM358 receiver) with Arduino Mega 2560",
      "Firmware development for transmission and reception",
      "Testing and resolving bit corruption via synchronization delays"
    ],
    techStack: ["Arduino Mega 2560", "LM358 Op-Amp", "Laser Module", "Solar Panel", "Embedded C"],
    github: "https://github.com/xeyynon/Lifi-Data-Transmission-System",
    pptEmbed: "../sources/LIFI",
    award: "Best Contemporary Project — ECS EXPO'24",
    images: ["/images/lifi-1.jpg", "/images/lifi-2.jpg"]
  }
];
