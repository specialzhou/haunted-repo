#!/usr/bin/env node
// Usage: node scripts/check-demo-repos.mjs [owner/repo ...]
// Reads only public data. Unauthenticated GitHub search allows ~10 requests/min,
// so the script waits between calls. Optional: GITHUB_TOKEN env var raises limits.
const repos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["axios/axios", "expressjs/express", "vuejs/core", "facebook/react", "denoland/deno"];

const headers = { Accept: "application/vnd.github+json", "User-Agent": "haunted-repo-check" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}
const search = async (q, extra = "") => {
  await sleep(process.env.GITHUB_TOKEN ? 500 : 7000);
  return get(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}${extra}`);
};

for (const repo of repos) {
  try {
    const info = await get(`https://api.github.com/repos/${repo}`);
    const base = `repo:${repo} is:issue is:open`;
    const open = await search(base, "&per_page=1");
    const oldest = await search(base, "&sort=created&order=asc&per_page=1");
    const gfi = await search(`${base} label:"good first issue"`, "&per_page=1");
    const created = oldest.items?.[0]?.created_at;
    const years = created ? ((Date.now() - Date.parse(created)) / 3.1557e10).toFixed(1) : "n/a";
    console.log(
      `${repo}\n  license: ${info.license?.spdx_id ?? "none"}\n  open issues (no PRs): ${open.total_count}` +
        `\n  oldest open issue: ${created ?? "n/a"} (${years} years)\n  good first issue: ${gfi.total_count}\n`
    );
  } catch (e) {
    console.log(`${repo}\n  ERROR: ${e.message}\n`);
  }
}
