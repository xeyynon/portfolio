import type { World } from "../types";
import LifiBench from "./LifiBench";
import LifiSend from "./LifiSend";
import styles from "./lifi.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "Data, sent as light", Component: LifiBench },
  exhibits: [{ title: "Send a word across", Component: LifiSend }],
};
