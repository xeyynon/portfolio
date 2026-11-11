import type { World } from "../types";
import Mosaic from "./Mosaic";
import StyleSampler from "./StyleSampler";
import styles from "./kindofui.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "134 examples, all alive, on one page", Component: Mosaic },
  exhibits: [{ title: "One panel, four styles", Component: StyleSampler }],
};
