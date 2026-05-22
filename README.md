# xiaolitongxue666 Blog

基于 Astro 的个人技术博客，保留 jekyll-theme-solid 定制版视觉，专注于技术分享和学习记录。

## 特性

- Astro 静态站点，构建快速
- 响应式布局，适配移动端和桌面端
- 明暗主题切换（`theme-toggle.js`）
- 文章页浮动导航按钮（`floating-buttons.js`）
- 首页右下角 commit 版本号与更新日期（`BuildVersion.astro`）
- SEO meta 标签
- Obsidian 笔记自动同步（GitHub Actions，见 [obsidian_repo](https://github.com/xiaolitongxue666/obsidian_repo)）

## 技术栈

- **静态站点生成器**: Astro 5
- **样式**: 原 jekyll-theme-solid 定制 CSS（`assets/css/`）
- **部署**: GitHub Pages（GitHub Actions deploy-pages，`master` 分支存源码）
- **内容管理**: Obsidian + GitHub Actions 自动同步

## 项目结构

```
├── .github/workflows/   # astro-build.yml, e2e-publish.yml
├── .github/e2e/         # E2E 测试夹具
├── .github/scripts/e2e/ # E2E 断言；run-ci-parity.sh
├── _data/build.yml      # build 版本 fallback（脚本生成，可提交）
├── _posts/              # 博客文章（Obsidian 同步目标）
├── _wiki/               # Wiki 内容
├── assets/              # CSS / JS / 图片（Obsidian 图片同步目标）
├── public/assets        # → ../assets 符号链接
├── src/
│   ├── components/      # Header / Pagination / BuildVersion 等
│   ├── layouts/         # DefaultLayout / PageLayout
│   ├── lib/             # posts / wiki / pagination / markdown
│   └── pages/           # 路由页面
├── astro.config.mjs
├── package.json
└── docs/ARCHITECTURE.md
```

详细架构说明见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。问题排查见 [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)。Agent 指南见 [AGENTS.md](AGENTS.md)。

## 本地开发

### 环境要求

- Node.js >= 20

### 安装与启动

```bash
git clone https://github.com/xiaolitongxue666/xiaolitongxue666.github.io.git
cd xiaolitongxue666.github.io
npm install
npm run dev
```

访问 `http://localhost:4001`。

### 构建验证

```bash
# CI 等价验证（生产 build + publish E2E，合并前推荐）
bash .github/scripts/e2e/run-ci-parity.sh
```

## 自动同步机制

博客内容主要来自 [obsidian_repo](https://github.com/xiaolitongxue666/obsidian_repo)：

1. Obsidian 笔记中添加 `#xiaolitongxue666_blog` 标签
2. 推送到 obsidian_repo 的 `master` 分支
3. GitHub Actions 转换格式并同步到本仓库 `_posts/` 和 `assets/images/posts/`
4. GitHub Actions 构建 Astro 并 deploy-pages

**PR 行为**：Pull Request 仅做预览与 Astro 构建验证，不会 push 到博客仓库。

## 写作指南

### 文件名规则

```
YYYY-MM-DD-{sanitizedTitle}.md
```

- **日期**：front matter `date` > 正文中的 `YYYY-MM-DD` > 当天（Obsidian 同步脚本规则）
- **slug**：Obsidian 笔记文件名经 sanitize 后转小写 kebab-case
- **permalink**：`/:year/:month/:day/:title/`（由文件名 slug 决定，**勿重命名已发布文章**）

### Front Matter 模板

```yaml
---
layout: default
title: "文章标题"
date: YYYY-MM-DD 12:00:00 +0800
categories: [分类1]
tags: [标签1, 标签2]
---
```

### 图片规则

```
assets/images/posts/{YYYY}/{articleDate}-{sanitizedTitle}/{articleDate}-{sanitizedTitle}_{NNN}.{ext}
```

## 部署

推送到 `master` 分支后，`.github/workflows/astro-build.yml` 构建并通过 GitHub Actions 部署到 Pages。

**首次迁移后**：仓库 Settings → Pages → Source 须设为 **GitHub Actions**。

## E2E 测试

- **合并前本地验证**：`bash .github/scripts/e2e/run-ci-parity.sh`
- **手动线上验证**：`gh workflow run e2e-publish.yml -f live_verify=true`
- 详细说明见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#e2e-测试)

## 许可证

MIT License

## 联系方式

- GitHub: [@xiaolitongxue666](https://github.com/xiaolitongxue666)
