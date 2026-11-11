import type { World } from "../types";
import DukaanCall from "./DukaanCall";
import MoneySplit from "./MoneySplit";
import styles from "./dukaan.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "One phone call, from a voice to a total", Component: DukaanCall },
  exhibits: [{ title: "The model never does the money", Component: MoneySplit }],
};
