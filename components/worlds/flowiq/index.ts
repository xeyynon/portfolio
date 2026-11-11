import type { World } from "../types";
import FlowMap from "./FlowMap";
import FlowScreens from "./FlowScreens";
import styles from "./flowiq.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "Routing, drawn on a city at night", Component: FlowMap },
  exhibits: [{ title: "What the app does for a road user", Component: FlowScreens }],
};
