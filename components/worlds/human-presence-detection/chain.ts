/**
 * The chain from the signal to the app, and who built which part. Pure data.
 *
 * The order is the project's own pipeline line; the wording and the roles are
 * from its description and highlights. CSI-Sense was a team project: only the
 * app is marked as the owner's, and the antenna as something he helped build.
 */

export type Role = "mine" | "helped" | "team";

/** Said in words beside every link, so the marking never rests on colour. */
export const ROLE_LABEL: Record<Role, string> = {
  mine: "I built this",
  helped: "I helped build the antenna",
  team: "Built by the team",
};

export const CHAIN: { key: string; name: string; text: string; role: Role }[] = [
  {
    key: "signal",
    name: "Wi-Fi signal",
    text: "It starts with a Wi-Fi signal crossing the room. No camera is involved.",
    role: "team",
  },
  {
    key: "receivers",
    name: "ESP32-S3 and biquad antenna",
    text: "4 ESP32-S3 receivers and a custom biquad antenna pick the signal up.",
    role: "helped",
  },
  {
    key: "spectrograms",
    name: "CSI spectrograms",
    text: "The channel state information (CSI) goes through Hampel filtering and is turned into spectrograms.",
    role: "team",
  },
  {
    key: "classifier",
    name: "EfficientNetV2-S",
    text: "An EfficientNetV2-S classifier reads the spectrograms for presence and activity.",
    role: "team",
  },
  {
    key: "app",
    name: "Flutter app",
    text: "The app shows presence and activity, live.",
    role: "mine",
  },
];
