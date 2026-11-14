import type { Issue, Monster, MonsterKind } from "./types.ts";

const DAY_MS = 86_400_000;
export const BEGINNER_LABELS = ["good first issue", "help wanted", "beginner", "easy"];

export function sizeForAgeDays(days: number): 1 | 2 | 3 | 4 | 5 {
  if (days < 30) return 1;
  if (days < 90) return 2;
  if (days < 180) return 3;
  if (days < 365) return 4;
  return 5;
}

export function kindForLabels(labels: string[]): MonsterKind {
  const l = labels.map((x) => x.toLowerCase());
  if (l.some((x) => x.includes("bug"))) return "bug";
  if (l.some((x) => x.includes("enhancement") || x.includes("feature"))) return "enhancement";
  return "other";
}

export function isBeginnerFriendly(labels: string[]): boolean {
  const l = labels.map((x) => x.toLowerCase());
  return BEGINNER_LABELS.some((b) => l.includes(b));
}

export function toMonster(issue: Issue, now: number): Monster {
  const age = Math.max(0, (now - Date.parse(issue.createdAt)) / DAY_MS);
  return {
    issue,
    kind: kindForLabels(issue.labels),
    size: sizeForAgeDays(age),
    beginnerFriendly: isBeginnerFriendly(issue.labels),
  };
}

// The N oldest issues get the red glow ring (requirement 3a).
export function oldestNumbers(issues: Issue[], n = 5): Set<number> {
  return new Set(
    [...issues]
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(0, n)
      .map((i) => i.number)
  );
}
