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
        │ PR 事件：仅预览 + jekyll build 验证
        ▼
xiaolitongxue666.github.io (Jekyll 站点)
  _posts/                    ← Markdown 文章
  assets/images/posts/       ← 文章配图
        │
        ▼
  GitHub Pages 内置 Jekyll 构建
        │
        ▼
  https://xiaolitongxue666.github.io/
```

## 博客仓库构建层次

| 层级 | 路径 | 职责 |
|------|------|------|
| 配置 | `_config.yml` | URL、分页、permalink、插件、Wiki 集合 |
| 依赖 | `Gemfile` | `github-pages` gem |
| 布局 | `_layouts/default.html` | 首页、文章页（含分页 meta、浮动按钮） |
| 布局 | `_layouts/page.html` | 静态页、Wiki 页 |
| 组件 | `_includes/` | header、footer、pagination、build-version（首页 commit 版本） |
| 内容 | `_posts/` | 博客文章 |
| 内容 | `pages/`、`index.html` | 静态页与首页 |
| 内容 | `_wiki/` | Wiki 集合 |
| 资源 | `assets/css/`、`assets/js/`、`assets/images/` | 样式、脚本、图片 |

**本地构建**：`bundle exec jekyll serve --port 4001`  
**线上部署**：推送 `master` → GitHub Pages 自动构建

## CI 链路

### 博客仓库（xiaolitongxue666.github.io）

| Workflow | 触发 | 作用 |
|----------|------|------|
| `jekyll-build.yml` | push/PR/workflow_dispatch → master | 写 build info + 生产构建 + 直写路径 E2E |
| `e2e-publish.yml` | `_posts/` 等变更；workflow_dispatch | 直写发布 E2E；手动 HTTP 线上验证 |
| GitHub Pages | push → master | 自动部署（内置，非 workflow 文件） |

### Obsidian 仓库（obsidian_repo）

| Workflow | 触发 | 作用 |
|----------|------|------|
| `sync-blog-posts.yml` | push/PR，md 或 attachments 变更 | 处理博客笔记、同步图片、push（仅 push 事件）、Jekyll 构建验证 |
| `e2e-sync.yml` | E2E 相关路径变更；workflow_dispatch | Obsidian 同步 E2E；手动 HTTP 线上验证 |

**所需 Secret**：`BLOG_REPO_TOKEN`（obsidian_repo 中配置，用于 checkout 和 push 博客仓库）

## E2E 测试

### 两条发布路径

| 路径 | 日常 CI | 手动线上验证 |
|------|---------|-------------|
| Obsidian 合规笔记 → 同步 → 发布 | `obsidian_repo`: `e2e-sync.yml` → `run-sync-e2e.js` | `gh workflow run e2e-sync.yml -f live_verify=true` |
| Blog 直写 `_posts/` → 发布 | `jekyll-build.yml` + `run-publish-e2e.js` | `gh workflow run e2e-publish.yml -f live_verify=true` |

### 测试夹具

- Obsidian：`.github/e2e/fixtures/e2e-compliant-note.md`（含 `#xiaolitongxue666_blog`、Wiki 图片）
- Blog：`.github/e2e/fixtures/e2e-direct-post.md`（标准 front matter）

Marker 文本：`e2e-sync-marker-v1`（同步路径）、`e2e-direct-marker-v1`（直写路径）

### 本地运行

```bash
# Obsidian 同步 E2E（需指定博客仓库路径）
cd obsidian_repo
BLOG_REPO_DIR=/path/to/xiaolitongxue666.github.io node .github/scripts/e2e/run-sync-e2e.js

# Blog 直写 E2E
cd xiaolitongxue666.github.io
bash .github/scripts/e2e/run-ci-parity.sh
```

### 手动 HTTP 验证

```bash
# Obsidian 同步发布后
gh workflow run e2e-sync.yml --repo xiaolitongxue666/obsidian_repo \
  -f live_verify=true \
  -f post_permalink=/2026/05/22/e2e-compliant-note/ \
  -f marker=e2e-sync-marker-v1

# Blog 直写发布后
gh workflow run e2e-publish.yml --repo xiaolitongxue666/xiaolitongxue666.github.io \
  -f live_verify=true \
  -f post_permalink=/2026/05/22/e2e-direct-post/ \
  -f marker=e2e-direct-marker-v1
```

### 测试用例

**Path 1（Obsidian 同步）**：合规 md 转换、Wiki 图片同步、无标签跳过、Jekyll build、_site marker 断言；live 模式追加 HTTP 200。

**Path 2（Blog 直写）**：合规 front matter、permalink 生成、Jekyll build、_site marker 断言；live 模式追加 HTTP 200。

## 首页版本号

首页右下角固定显示 commit 短哈希与更新日期，便于确认线上部署版本。

| 环境 | commit | 日期 |
|------|--------|------|
| GitHub Pages | `site.github.build_revision` | `_data/build.yml` → `date`（`pushed_at` 不可用，须提交 build.yml） |
| 本地 / 离线 | `_data/build.yml` → `commit` | `_data/build.yml` → `date` |

**常见陷阱（2026-05）**

1. **无日期**：勿在 `if build_revision` 分支内单独取 date；date 须独立回退链。
2. **位置漂移**：inline fixed 样式 + `default.css` 双保险；勿移除 inline style。
3. **合并前**：`update-build-info.sh` 刷新并提交 `_data/build.yml`；`run-ci-parity.sh` 含 homepage 断言。

相关文件：

- `_includes/build-version.html` — 仅 `page.url == '/'` 时由 `default.html` 引入
- `.github/scripts/update-build-info.sh` — 从 git 生成 `_data/build.yml`
- `.github/scripts/e2e/assert-homepage-build-version.js` — CI 断言 id + date + 定位
- `_config.yml` 的 `repository:` — 启用 jekyll-github-metadata

合并前运行 `bash .github/scripts/e2e/run-ci-parity.sh` 会顺带刷新 build info。

## 博客 MD 命名规范

### 文件名

```
YYYY-MM-DD-{sanitizedTitle}.md
```

| 字段 | 来源 | 说明 |
|------|------|------|
| 日期 | front matter `date` → 正文 `YYYY-MM-DD` → 当天 | 不从 Obsidian 文件名取 |
| slug | Obsidian 笔记文件名 | 经 `sanitizeFilename` 转小写 kebab-case |

**Obsidian 侧约定**：笔记文件名不含 `YYYY-MM-DD` 前缀。

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

`NNN` 为三位递增编号（001 起）。

### 历史文章

现有 35 篇文章存在早期命名混用（大小写、下划线、中文 slug）。**已发布文章不重命名**，以避免 permalink 404。

## 安全约束

- 不修改 `permalink`、`url`、插件列表
- 不重命名/删除已有 `_posts/` 文件
- Obsidian 同步 push 仅在 `push` 事件执行
- 变更合并前通过 `bundle exec jekyll build` 验证
