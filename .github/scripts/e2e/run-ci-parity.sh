#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
rm -rf .e2e-staging
bash .github/scripts/update-build-info.sh
npm run build
E2E_SITE_DIR=dist node .github/scripts/e2e/assert-homepage-build-version.js
node .github/scripts/e2e/run-publish-e2e.js
echo "CI parity: PASS"
