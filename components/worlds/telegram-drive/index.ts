import type { World } from "../types";
import ChunkCounter from "./ChunkCounter";
import VaultFlow from "./VaultFlow";
import styles from "./telegramDrive.module.css";

export const world: World = {
  className: styles.world,
  hero: { title: "A file, cut into chunks, locked and sent", Component: VaultFlow },
  exhibits: [{ title: "How many chunks a file becomes", Component: ChunkCounter }],
};
