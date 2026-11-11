import type { World } from "../types";
import KnitFloor from "./KnitFloor";
import ShipCheck from "./ShipCheck";
import styles from "./knitwear.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "One order falls behind, and says why", Component: KnitFloor },
  exhibits: [{ title: "Will it ship on time?", Component: ShipCheck }],
};
