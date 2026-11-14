#!/usr/bin/env bash
# Fails if /.kiro is missing or ignored by git, or if LICENSE is missing.
set -eu
cd "$(dirname "$0")/.."
[ -d .kiro ] || { echo "FAIL: .kiro missing"; exit 1; }
[ -f LICENSE ] || { echo "FAIL: LICENSE missing"; exit 1; }
if git rev-parse --git-dir >/dev/null 2>&1 && git check-ignore -q .kiro/steering/product.md; then
  echo "FAIL: .kiro is gitignored"; exit 1
fi
if grep -Eq '^\s*/?\.kiro/?\s*$' .gitignore; then echo "FAIL: .gitignore lists .kiro"; exit 1; fi
echo "OK"
