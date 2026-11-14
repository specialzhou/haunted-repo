import test from "node:test";
import assert from "node:assert/strict";
import { layout } from "../src/layout.ts";
import type { Issue } from "../src/types.ts";

const NOW = Date.parse("2026-11-14T00:00:00Z");
const mk = (n: number, daysAgo: number, labels: string[] = []): Issue => ({
  number: n, title: "t" + n, labels,
  createdAt: new Date(NOW - daysAgo * 86_400_000).toISOString(), url: "u",
});

test("oldest issues come first (top) and are flagged", () => {
  const issues = Array.from({ length: 12 }, (_, i) => mk(i, i * 40));
  const p = layout(issues, 600, NOW);
  assert.equal(p[0].monster.issue.number, 11);
  assert.equal(p.filter((x) => x.oldest).length, 5);
  assert.ok(p.slice(0, 5).every((x) => x.oldest));
});

test("friendly filter keeps only beginner-friendly monsters", () => {
  const issues = [mk(1, 10, ["good first issue"]), mk(2, 500, ["bug"]), mk(3, 20, ["Help Wanted"])];
  const p = layout(issues, 600, NOW, true);
  assert.deepEqual(p.map((x) => x.monster.issue.number).sort(), [1, 3]);
});

test("no monster leaves the width", () => {
  const issues = Array.from({ length: 80 }, (_, i) => mk(i, i * 15));
  for (const p of layout(issues, 500, NOW)) assert.ok(p.x - p.r >= 0 && p.x + p.r <= 500);
});
