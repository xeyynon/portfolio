import type { World } from "../types";
import CsiChain from "./CsiChain";
import CsiRoom from "./CsiRoom";
import styles from "./csi.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "A room, seen by Wi-Fi", Component: CsiRoom },
  exhibits: [{ title: "From the signal to the app", Component: CsiChain }],
};
