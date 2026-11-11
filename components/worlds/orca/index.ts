import type { World } from "../types";
import OrcaSky from "./OrcaSky";
import OrcaTree from "./OrcaTree";
import styles from "./orca.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "From a catalog to a close approach, in four steps", Component: OrcaSky },
  exhibits: [{ title: "Narrowing the search", Component: OrcaTree }],
};
