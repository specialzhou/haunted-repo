import { layout } from "../layout.ts";
import { sanitize } from "../sanitize.ts";
import { shapePath, FILL } from "./shapes.ts";
import type { RawIssue } from "../types.ts";

const NS = "http://www.w3.org/2000/svg";
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let issues = sanitize([]);
let friendly = false;

function render() {
  const house = document.getElementById("house") as unknown as SVGSVGElement;
  const width = house.clientWidth || 700;
  const placed = layout(issues, width, Date.now(), friendly);
  house.replaceChildren();
  const height = Math.max(420, Math.max(0, ...placed.map((p) => p.y + p.r)) + 20);
  house.setAttribute("height", String(height));
  for (const p of placed) {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "monster");
    g.setAttribute("transform", `translate(${p.x},${p.y})`);
    const m = p.monster;
    if (p.oldest) {
      const glow = document.createElementNS(NS, "circle");
      glow.setAttribute("r", String(p.r * 1.35));
      glow.setAttribute("fill", "#E5384F");
      glow.setAttribute("opacity", "0.35");
      glow.setAttribute("filter", "url(#blur)");
      g.appendChild(glow);
    }
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", shapePath(m.beginnerFriendly ? "friendly" : m.kind, p.r));
    path.setAttribute("fill", m.beginnerFriendly ? "#7CFFB2" : FILL[m.kind]);
    if (m.beginnerFriendly) path.setAttribute("opacity", "0.6");
    g.appendChild(path);
    if (m.beginnerFriendly) {
      const t = document.createElementNS(NS, "text");
      t.setAttribute("text-anchor", "middle"); t.setAttribute("dy", "0.35em");
      t.setAttribute("font-size", String(p.r * 0.9)); t.textContent = "☺";
      g.appendChild(t);
    }
    g.addEventListener("click", () => show(m.issue.number));
    house.appendChild(g);
  }
}

function show(n: number) {
  const i = issues.find((x) => x.number === n)!;
  const days = Math.floor((Date.now() - Date.parse(i.createdAt)) / 86_400_000);
  const panel = $("panel");
  panel.replaceChildren();
  const h = document.createElement("h2"); h.textContent = `#${i.number} ${i.title}`;
  const meta = document.createElement("p"); meta.textContent = `Open ${days} days. Labels: ${i.labels.join(", ") || "none"}`;
  const a = document.createElement("a"); a.href = i.url; a.target = "_blank"; a.rel = "noopener";
  a.textContent = "Exorcise on GitHub";
  panel.append(h, meta, a);
}

async function loadSnapshot() {
  const res = await fetch("./snapshot.json");
  const data = await res.json();
  issues = sanitize(data.issues as RawIssue[]);
  $("repo-name").textContent = data.repo;
  render();
}

async function loadLive(repo: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(repo.split("/")[0])}/${encodeURIComponent(repo.split("/")[1])}/issues?state=open&per_page=100`);
    if (!res.ok) throw new Error(String(res.status));
    issues = sanitize((await res.json()) as RawIssue[]);
    $("repo-name").textContent = repo;
    render();
  } catch {
    $("panel").textContent = "Could not load that repository (rate limit or network). Showing the snapshot instead.";
    await loadSnapshot();
  }
}

$("go").addEventListener("click", () => {
  const v = ($("repo") as HTMLInputElement).value.trim();
  if (/^[\w.-]+\/[\w.-]+$/.test(v)) loadLive(v);
});
$("friendly").addEventListener("click", () => { friendly = !friendly; render(); });
window.addEventListener("resize", render);
loadSnapshot();
