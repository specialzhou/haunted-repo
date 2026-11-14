// Property-style tests with a seeded random generator, so they run with only Node.
// TODO: swap the generator for fast-check once npm registry access is available.
import test from "node:test";
import assert from "node:assert/strict";
import { sanitize } from "../src/sanitize.ts";
import { toMonster, isBeginnerFriendly, oldestNumbers, BEGINNER_LABELS } from "../src/monsters.ts";
import type { Issue, RawIssue } from "../src/types.ts";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}
const NOW = Date.parse("2026-11-14T00:00:00Z");
const LABELS = ["bug", "Bug", "enhancement", "feature", "docs", "good first issue", "Good First Issue", "help wanted", "question"];

function randIssue(r: () => number, n: number): Issue {
  const labels = LABELS.filter(() => r() < 0.25);
  return {
    number: n,
    title: "t" + n,
    labels,
    createdAt: new Date(NOW - Math.floor(r() * 2000) * 86_400_000).toISOString(),
    url: "https://github.com/o/r/issues/" + n,
  };
}
const RUNS = 500;

test("P1 older issue never gets a smaller size (same labels)", () => {
  const r = rng(1);
  for (let i = 0; i < RUNS; i++) {
    const a = randIssue(r, 1);
    const b = { ...a, createdAt: new Date(Date.parse(a.createdAt) - Math.floor(r() * 900) * 86_400_000).toISOString() };
    assert.ok(toMonster(b, NOW).size >= toMonster(a, NOW).size);
  }
});

test("P2 size is always 1..5", () => {
  const r = rng(2);
  for (let i = 0; i < RUNS; i++) {
    const s = toMonster(randIssue(r, i), NOW).size;
    assert.ok(s >= 1 && s <= 5);
  }
  // a date in the future must not break it
  assert.equal(toMonster({ ...randIssue(r, 1), createdAt: new Date(NOW + 1e9).toISOString() }, NOW).size, 1);
});

test("P3 sanitize keeps only allowed keys and is idempotent in content", () => {
  const r = rng(3);
  const allowed = ["number", "title", "labels", "createdAt", "url"].sort();
  for (let i = 0; i < RUNS; i++) {
    const raw: RawIssue = {
      number: i, title: "x", created_at: new Date(NOW).toISOString(), html_url: "u",
      labels: [{ name: "bug" }, "docs"], body: "secret", comments: 3,
      user: { login: "someone", avatar_url: "a" },
    };
    const [out] = sanitize([raw]);
    assert.deepEqual(Object.keys(out).sort(), allowed);
    assert.ok(!JSON.stringify(out).includes("secret"));
    assert.ok(!JSON.stringify(out).includes("someone"));
  }
});

test("P4 sanitize drops pull requests", () => {
  const raw: RawIssue[] = [
    { number: 1, title: "a", created_at: "2020-01-01T00:00:00Z", html_url: "u" },
    { number: 2, title: "pr", created_at: "2020-01-01T00:00:00Z", html_url: "u", pull_request: {} },
  ];
  assert.deepEqual(sanitize(raw).map((i) => i.number), [1]);
});

test("P5 beginnerFriendly iff a beginner label is present (case-insensitive)", () => {
  const r = rng(5);
  for (let i = 0; i < RUNS; i++) {
    const it = randIssue(r, i);
    const expected = it.labels.some((l) => BEGINNER_LABELS.includes(l.toLowerCase()));
    assert.equal(isBeginnerFriendly(it.labels), expected);
    assert.equal(toMonster(it, NOW).beginnerFriendly, expected);
  }
});

test("P6 toMonster is deterministic", () => {
  const r = rng(6);
  for (let i = 0; i < RUNS; i++) {
    const it = randIssue(r, i);
    assert.deepEqual(toMonster(it, NOW), toMonster(it, NOW));
  }
});

test("oldestNumbers returns the 5 oldest", () => {
  const r = rng(7);
  const issues = Array.from({ length: 30 }, (_, i) => randIssue(r, i));
  const top = oldestNumbers(issues, 5);
  assert.equal(top.size, 5);
  const cutoff = Math.max(...issues.filter((i) => top.has(i.number)).map((i) => Date.parse(i.createdAt)));
  for (const i of issues) if (!top.has(i.number)) assert.ok(Date.parse(i.createdAt) >= cutoff);
});
