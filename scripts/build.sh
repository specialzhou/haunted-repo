#!/usr/bin/env bash
# Builds the static site into dist/ using Bun (no npm download needed).
set -eu
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
~/.bun/bin/bun build src/ui/main.ts --outdir dist --target browser --entry-naming main.js
cp public/index.html dist/index.html
cp src/ui/theme.css dist/theme.css
cp data/snapshot.json dist/snapshot.json
echo "built dist/"
