import type { World } from "../types";
import EcoxChain from "./EcoxChain";
import EcoxFloor from "./EcoxFloor";
import styles from "./ecox.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "Gas rising, an alarm sounding", Component: EcoxFloor },
  exhibits: [{ title: "The alarm, from sensor to dashboard", Component: EcoxChain }],
};
