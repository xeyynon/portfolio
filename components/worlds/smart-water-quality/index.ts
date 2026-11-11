import type { World } from "../types";
import ReadingPath from "./ReadingPath";
import WaterPond from "./WaterPond";
import styles from "./water.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "One report every 3 s", Component: WaterPond },
  exhibits: [{ title: "One reading, from sensor to radio", Component: ReadingPath }],
};
