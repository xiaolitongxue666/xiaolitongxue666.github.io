#!/usr/bin/env bash
# 从当前 git HEAD 生成 _data/build.yml，供 build-version 日期 fallback 与本地 commit 显示。
# Pages：commit 来自 site.github.build_revision；date 来自本文件（合并前须提交）。
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
