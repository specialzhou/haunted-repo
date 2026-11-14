import type { Issue, Monster } from "./types.ts";
import { oldestNumbers, toMonster } from "./monsters.ts";

export interface Placed {
  monster: Monster;
  x: number;
  y: number;
  r: number; // radius in px
  oldest: boolean;
}

const RADIUS = { 1: 14, 2: 20, 3: 27, 4: 35, 5: 44 } as const;

// Oldest issues float to the top. Within a row, order is by age so layout is stable.
export function layout(issues: Issue[], width: number, now: number, filterFriendly = false): Placed[] {
  const oldest = oldestNumbers(issues, 5);
  let monsters = issues.map((i) => toMonster(i, now));
  if (filterFriendly) monsters = monsters.filter((m) => m.beginnerFriendly);
  monsters.sort((a, b) => Date.parse(a.issue.createdAt) - Date.parse(b.issue.createdAt));

  const placed: Placed[] = [];
  let x = 0, y = 0, rowH = 0;
  const pad = 14;
  for (const m of monsters) {
    const r = RADIUS[m.size];
    const d = r * 2 + pad;
    if (x + d > width) { x = 0; y += rowH + pad; rowH = 0; }
    placed.push({ monster: m, x: x + d / 2, y: y + d / 2, r, oldest: oldest.has(m.issue.number) });
    x += d;
    rowH = Math.max(rowH, d);
  }
  return placed;
}
