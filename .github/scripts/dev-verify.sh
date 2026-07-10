#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> 1. update-build-info"
bash .github/scripts/update-build-info.sh

echo "==> 2. Pages build"
rm -rf .e2e-staging
npm run build

echo "==> 3. assert-homepage-build-version"
E2E_SITE_DIR=dist node .github/scripts/e2e/assert-homepage-build-version.js
grep -q 'xiaolitongxue.com.cn/analytics/count' dist/index.html

echo "==> 4. publish E2E"
node .github/scripts/e2e/run-publish-e2e.js

echo "==> 5. VPS subpath build (ASTRO_BASE=/blog/)"
export MSYS_NO_PATHCONV=1
ASTRO_BASE=/blog/ ASTRO_SITE=https://xiaolitongxue.com.cn npm run build

echo "==> 5a. VPS dist checks"
grep -q 'href="/blog/assets/css/default.css"' dist/index.html
grep -q 'xiaolitongxue.com.cn/analytics/count' dist/index.html
test -f dist/2026/07/07/mihomo-aio/index.html
grep -q 'href="/blog/2026/07/07/mihomo-aio/"' dist/index.html
grep -q 'site-base" content="/blog/"' dist/2026/07/07/mihomo-aio/index.html

echo ""
echo "==> Manual checks (not automated):"
echo "  npm run dev -- --port 4001"
echo "  Toggle light/dark theme; verify code blocks + Mermaid on /2026/07/07/mihomo-aio/"
echo ""
echo "==> After push:"
echo "  curl --noproxy '*' -sf https://xiaolitongxue.com.cn/blog/ | grep mihomo-aio"
echo "  curl --noproxy '*' -sf -o /dev/null -w '%{http_code}\n' \\"
echo "    https://xiaolitongxue.com.cn/blog/2026/07/07/mihomo-aio/"
echo ""
echo "dev-verify: PASS"
