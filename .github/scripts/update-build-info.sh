#!/usr/bin/env bash
# 从当前 git HEAD 生成 _data/build.yml，供本地 Jekyll 与 build-version fallback 使用。
# GitHub Pages 线上优先使用 site.github.build_revision / pushed_at。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
mkdir -p _data
SHA="$(git rev-parse HEAD)"
SHORT="$(git rev-parse --short HEAD)"
DATE="$(git log -1 --format=%ci | cut -d' ' -f1)"
cat > _data/build.yml <<EOF
commit: ${SHORT}
sha: ${SHA}
date: ${DATE}
EOF
