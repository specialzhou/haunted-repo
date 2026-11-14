import type { Issue, RawIssue } from "./types.ts";

// Keeps only the public fields we are allowed to use and drops pull requests.
export function sanitize(raw: RawIssue[]): Issue[] {
  const out: Issue[] = [];
  for (const r of raw) {
    if (r.pull_request) continue;
    out.push({
      number: r.number,
      title: r.title,
      labels: (r.labels ?? [])
        .map((l) => (typeof l === "string" ? l : l?.name ?? ""))
        .filter((n) => n !== ""),
      createdAt: r.created_at,
      url: r.html_url,
    });
  }
  return out;
}
