#!/usr/bin/env node
// Merges the permissions Bram needs into a Claude Code settings.json.
// Usage: node scripts/grant-permissions.mjs [path-to-settings.json]
// Default target: ~/.cumora/agents/bram-968e/.claude/settings.json
// It backs up the file first, only ADDS entries, never removes anything, and does not touch tokens.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const target = process.argv[2] ?? path.join(os.homedir(), ".cumora/agents/bram-968e/.claude/settings.json");
const domains = ["registry.npmjs.org", "api.github.com", "github.com"];
const readPaths = ["~/.gitconfig", "~/.config/git"];

let cfg = {};
if (fs.existsSync(target)) {
  const raw = fs.readFileSync(target, "utf8");
  cfg = raw.trim() ? JSON.parse(raw) : {};
  const bak = `${target}.bak-${Date.now()}`;
  fs.writeFileSync(bak, raw);
  console.log("backup:", bak);
} else {
  fs.mkdirSync(path.dirname(target), { recursive: true });
}

const add = (obj, key, values) => {
  obj[key] = Array.isArray(obj[key]) ? obj[key] : [];
  for (const v of values) if (!obj[key].includes(v)) obj[key].push(v);
};
cfg.sandbox ??= {};
cfg.sandbox.network ??= {};
add(cfg.sandbox.network, "allowedDomains", domains);
cfg.sandbox.filesystem ??= {};
add(cfg.sandbox.filesystem, "allowRead", readPaths);

fs.writeFileSync(target, JSON.stringify(cfg, null, 2) + "\n");
console.log("updated:", target);
console.log(JSON.stringify({ allowedDomains: cfg.sandbox.network.allowedDomains, allowRead: cfg.sandbox.filesystem.allowRead }, null, 2));
