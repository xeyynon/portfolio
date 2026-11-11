import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import styles from "./molecules.module.css";

type Props = {
  children: ReactNode;
  /** A link tile. Internal paths use the router; anything else opens in a new tab. */
  href?: string;
  className?: string;
  style?: CSSProperties;
};

/** Molecule: the solid tile every section is built from. */
export default function Tile({ children, href, className, style }: Props) {
  const cls = className ? `${styles.tile} ${className}` : styles.tile;
  if (!href) {
    return (
      <div className={cls} style={style}>
        {children}
      </div>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }
  const external = !href.startsWith("mailto:");
  return (
    <a href={href} className={cls} style={style} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}
