import type { World } from "../types";
import SurragBoard from "./SurragBoard";
import SurragTrail from "./SurragTrail";
import styles from "./surrag.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "From separate reports to one case graph, in five steps", Component: SurragBoard },
  exhibits: [{ title: "From a report to a lead", Component: SurragTrail }],
};
