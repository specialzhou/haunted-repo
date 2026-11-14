#!/usr/bin/env bash
# One command to publish everything: ./scripts/ship.sh "message"
set -eu
cd "$(dirname "$0")/.."
./scripts/check-kiro.sh
if git check-ignore -q .kiro; then echo "STOP: .kiro is ignored by git"; exit 1; fi
git add -A
git commit -m "${1:-Update}" || echo "nothing to commit"
git pull --no-rebase --no-edit origin main || true
git push -u origin main
