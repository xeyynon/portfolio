"use client";
import { skills, skillId, spectrum } from "@/data/portfolioData";

/**
 * The hero's six wavelength chips. Each is the colour of one capability, so
 * each links to that skills group; clicking also tells the prism to brighten
 * that part of the rainbow for a moment ("prism:focus", see PrismCanvas).
 */
export default function WavelengthChips() {
  return (
    <div className="chipbar">
      {spectrum.map((s) => {
        const group = skills.find((g) => g.color === `var(${s.token})`);
        if (!group) return null;
        return (
          <a
            key={s.token}
            href={`#${skillId(group.label)}`}
            className="chip"
            style={{ background: `var(${s.token})` }}
            aria-label={`${s.nm} nanometres: ${group.label} skills`}
            title={group.label}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("prism:focus", { detail: s.nm }));
              // SmoothScroll updates the URL with pushState, which does not
              // trigger CSS :target, so ring the tile directly.
              const tile = document.getElementById(skillId(group.label));
              if (tile) {
                tile.classList.remove("is-flash");
                void tile.offsetWidth;
                tile.classList.add("is-flash");
                window.setTimeout(() => tile.classList.remove("is-flash"), 2600);
              }
            }}
          >
            {s.nm}nm
          </a>
        );
      })}
      <span className="quote">&quot;Learn something new every day.&quot;</span>
    </div>
  );
}
