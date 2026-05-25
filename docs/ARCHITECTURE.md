# 架构说明

本文档描述 xiaolitongxue666 博客的双仓库架构、构建层次与 CI 链路。

**相关问题排查**见 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)。Agent 入口见 [AGENTS.md](../AGENTS.md)。

## 双仓库数据流

```
obsidian_repo (内容源)
  LeonLi/**/*.md  +  #xiaolitongxue666_blog 标签
        │
        ▼
  .github/workflows/sync-blog-posts.yml
  .github/scripts/process-blog-posts.js
  .github/scripts/sync-images.js
        │
        │ push 事件：commit + push
        │ PR 事件：仅预览 + Astro build 验证
        ▼
xiaolitongxue666.github.io (Astro 站点)
  _posts/                    ← Markdown 文章
  assets/images/posts/       ← 文章配图
        │
        ▼
  GitHub Actions (astro-build.yml)
  npm run build → dist/
        │
        ▼
  deploy-pages → https://xiaolitongxue666.github.io/

  （并行，互不影响）

  deploy-vps.yml（ASTRO_BASE=/blog/）
  npm run build → dist/ → rsync → VPS docker nginx :3001
        │
        ▼
  vps_nginx /blog/ → http://<Tailscale IP>/blog/
  （公网 HTTPS 待 vps_nginx public 模式）
```

## 博客仓库构建层次

| 层级 | 路径 | 职责 |
|------|------|------|
| 配置 | `astro.config.mjs` | URL、`base`（VPS 用 env）、trailingSlash、outDir、sitemap |
| 依赖 | `package.json` | Astro、remark、RSS、sitemap |
| 布局 | `src/layouts/DefaultLayout.astro` | 首页、文章页（含分页 meta、浮动按钮） |
| 布局 | `src/layouts/PageLayout.astro` | 静态页、Wiki 页 |
| 组件 | `src/components/` | header、footer、pagination、build-version |
| 工具 | `src/lib/base.ts` | 子路径 `withBase()`（VPS `/blog/` 部署必需） |
| 内容 | `_posts/` | 博客文章（Obsidian 同步写入） |
| 内容 | `src/pages/` | 路由页面 |
| 内容 | `_wiki/` | Wiki 内容 |
| 资源 | `assets/`、`public/assets` | 样式、脚本、图片 |

**本地构建**：`npm run dev -- --port 4001`  
**GitHub Pages**：push `master` → `astro-build.yml` → deploy-pages  
**VPS 镜像**：push `master` → `deploy-vps.yml`（见 [memory_skills/blog-vps-deploy.md](../memory_skills/blog-vps-deploy.md)）

## CI 链路

### 博客仓库（xiaolitongxue666.github.io）

| Workflow | 触发 | 作用 |
|----------|------|------|
| `astro-build.yml` | push/PR/workflow_dispatch → master | 写 build info + Astro 构建 + E2E + deploy-pages |
| `deploy-vps.yml` | push/workflow_dispatch → master | VPS 专用构建（`ASTRO_BASE=/blog/`）+ rsync + docker compose |
| `e2e-publish.yml` | `_posts/` 等变更；workflow_dispatch | 直写发布 E2E；手动 HTTP 线上验证（GitHub Pages） |

### Obsidian 仓库（obsidian_repo）

| Workflow | 触发 | 作用 |
|----------|------|------|
| `sync-blog-posts.yml` | push/PR，md 或 attachments 变更 | 处理博客笔记、同步图片、push（仅 push 事件）、Astro 构建验证 |
| `e2e-sync.yml` | E2E 相关路径变更；workflow_dispatch | Obsidian 同步 E2E；手动 HTTP 线上验证 |

**所需 Secret**：

- obsidian_repo：`BLOG_REPO_TOKEN`
- 本仓库 VPS 部署：`VPS_SSH_KEY`（必填），可选 `VPS_HOST` / `VPS_USER` / `VPS_PORT`（见 [memory_skills/blog-vps-deploy.md](../memory_skills/blog-vps-deploy.md)）

## E2E 测试

### 两条发布路径

| 路径 | 日常 CI | 手动线上验证 |
|------|---------|-------------|
| Obsidian 合规笔记 → 同步 → 发布 | `obsidian_repo`: `e2e-sync.yml` → `run-sync-e2e.js` | `gh workflow run e2e-sync.yml -f live_verify=true` |
| Blog 直写 `_posts/` → 发布 | `astro-build.yml` + `run-publish-e2e.js` | `gh workflow run e2e-publish.yml -f live_verify=true` |

### 本地运行

```bash
# Obsidian 同步 E2E（需指定博客仓库路径）
cd obsidian_repo
BLOG_REPO_DIR=/path/to/xiaolitongxue666.github.io node .github/scripts/e2e/run-sync-e2e.js

# Blog 直写 E2E
cd xiaolitongxue666.github.io
bash .github/scripts/e2e/run-ci-parity.sh
```

### 测试用例

**Path 1（Obsidian 同步）**：合规 md 转换、Wiki 图片同步、无标签跳过、Astro build、dist marker 断言。

**Path 2（Blog 直写）**：合规 front matter、permalink 生成、Astro build、dist marker 断言。

## 首页版本号

| 环境 | commit | 日期 |
|------|--------|------|
| GitHub Actions | `GITHUB_SHA` | `_data/build.yml` → `date` |
| 本地 / 离线 | `_data/build.yml` → `commit` | `_data/build.yml` → `date` |

相关文件：

- `src/components/BuildVersion.astro` — 仅首页 `/` 时渲染
- `.github/scripts/update-build-info.sh` — 从 git 生成 `_data/build.yml`
- `.github/scripts/e2e/assert-homepage-build-version.js` — CI 断言

## 博客 MD 命名规范

（与 Jekyll 时代相同，Obsidian 同步契约未变）

### 文件名

```
YYYY-MM-DD-{sanitizedTitle}.md
```

### Front Matter（同步脚本输出）

```yaml
---
layout: default
title: "笔记文件名"
date: YYYY-MM-DD 12:00:00 +0800
categories:
---
```

### 图片路径

```
assets/images/posts/{YYYY}/{date}-{sanitizedTitle}/{date}-{sanitizedTitle}_{NNN}.{ext}
```

### 历史文章

现有文章存在早期命名混用（大小写、下划线、中文 slug）。**已发布文章不重命名**，Astro 从文件名解析 slug 生成 URL。

## 安全约束

- 不重命名/删除已有 `_posts/` 文件
- Obsidian 同步 push 仅在 `push` 事件执行
- 变更合并前通过 `npm run build` 验证
