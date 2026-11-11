import type { DesignedSlug } from "./designed";
import type { World } from "./types";
import { world as orca } from "./orca";
import { world as surrag } from "./surrag";
import { world as lifiDataTransmissionSystem } from "./lifi-data-transmission-system";
import { world as humanPresenceDetection } from "./human-presence-detection";
import { world as ecoxIndustrialSafety } from "./ecox-industrial-safety";
import { world as flowiq } from "./flowiq";
import { world as telegramDrive } from "./telegram-drive";
import { world as smartWaterQuality } from "./smart-water-quality";
import { world as isocodeKnitwear } from "./isocode-knitwear";
import { world as dukaanDost } from "./dukaan-dost";
import { world as kindofui } from "./kindofui";

/** Every designed project page's world, by slug. The list of slugs is in designed.ts. */
export const WORLDS: Record<DesignedSlug, World> = {
  orca,
  surrag,
  "lifi-data-transmission-system": lifiDataTransmissionSystem,
  "human-presence-detection": humanPresenceDetection,
  "ecox-industrial-safety": ecoxIndustrialSafety,
  flowiq,
  "telegram-drive": telegramDrive,
  "smart-water-quality": smartWaterQuality,
  "isocode-knitwear": isocodeKnitwear,
  "dukaan-dost": dukaanDost,
  kindofui,
};
