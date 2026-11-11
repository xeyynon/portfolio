/**
 * The alarm chain, from the sensor to the phone, and who built which part.
 * Pure data and timing, no React.
 *
 * The order is the project's own pipeline line; the wording and the roles are
 * from its highlights. The device was a team build: the owner built the
 * Flutter dashboard and supported the hardware integration and testing.
 */

export type Role = "mine" | "supported";

/** Said in words beside every link, so the marking never rests on colour. */
export const ROLE_LABEL: Record<Role, string> = {
  mine: "I built this",
  supported: "Team build · I helped integrate and test it",
};

export const CHAIN: { key: string; name: string; text: string; role: Role }[] = [
  {
    key: "sense",
    name: "CO sensing and fire detection",
    text: "The device senses carbon monoxide, and YOLOv8n watches for fire.",
    role: "supported",
  },
  {
    key: "pi",
    name: "Raspberry Pi 4B",
    text: "The Raspberry Pi 4B runs the device: the CO sensing, the fire detection and the alerts.",
    role: "supported",
  },
  {
    key: "speaker",
    name: "Speaker alarm",
    text: "The speaker alarm sounds on the spot.",
    role: "supported",
  },
  {
    key: "network",
    name: "4G and GPS",
    text: "An alert goes out over 4G, with the device's GPS position.",
    role: "supported",
  },
  {
    key: "dashboard",
    name: "Flutter dashboard",
    text: "The alert reaches the Flutter monitoring dashboard.",
    role: "mine",
  },
];

export const STEP_MS = 900; // one link to the next when the alarm is walked through
