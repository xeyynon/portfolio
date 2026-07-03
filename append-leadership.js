const fs = require('fs');

const css = `
/* ==========================================================================
   Leadership Timeline
   ========================================================================== */

.leadership-org {
  font-family: var(--font-mono); font-size: 11px; color: var(--muted-light);
  margin-top: 6px; margin-bottom: 8px;
}

.leadership-list { position: relative; padding-left: 28px; margin-top: 24px; }
.leadership-list::before {
  content: ""; position: absolute; left: 5px; top: 8px; bottom: 8px;
  width: 1px; background: var(--line-light);
}

.leadership-item {
  position: relative;
  display: grid; grid-template-columns: 90px 1fr auto;
  align-items: center; gap: 20px;
  padding: 16px 0;
}
.leadership-item::before {
  content: ""; position: absolute; left: -28px; top: 50%; transform: translateY(-50%);
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--bg-light); border: 2px solid var(--muted-light);
}
.leadership-item.current::before {
  background: var(--v500); border-color: var(--v500);
  box-shadow: 0 0 8px 1px var(--v500);
}

.li-date { font-family: var(--font-mono); font-size: 11px; color: var(--muted-light); }
.li-role { font-size: 14px; font-weight: 500; color: var(--ink-lo); display: flex; align-items: center; gap: 8px; }
.li-range { font-family: var(--font-mono); font-size: 10px; color: var(--muted-light); margin-top: 3px; }
.li-tag {
  font-family: var(--font-mono); font-size: 8.5px; letter-spacing: .06em;
  color: var(--v500); border: 1px solid var(--v500); padding: 2px 6px;
}

.li-gain { display: flex; gap: 3px; }
.li-gain .seg { width: 5px; height: 14px; background: var(--line-light); }
.li-gain .seg.filled { background: var(--v500); }
.leadership-item.current .li-gain .seg.filled { background: var(--v500); box-shadow: 0 0 4px var(--v500); }
`;

fs.appendFileSync('app/globals.css', css, 'utf8');
