#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
rm -rf .e2e-staging
bash .github/scripts/update-build-info.sh
bundle exec jekyll build --trace
node .github/scripts/e2e/run-publish-e2e.js
echo "CI parity: PASS"
