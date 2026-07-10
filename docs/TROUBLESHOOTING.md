# 问题与解决方案

本文档归纳博客双仓库项目在优化、E2E 与 **Jekyll → Astro 迁移（2026-05）** 中的问题及处理方式。架构见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## Astro 迁移（2026-05）

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| E2E 脚本报 `require is not defined` | `package.json` 设 `"type": "module"` 后，`.github/scripts/e2e/*.js` 为 CommonJS | **勿**在根 `package.json` 加 `"type": "module"`；Astro 配置用 `astro.config.mjs` 即可 |
| 首页 build-version 无 `YYYY-MM-DD` | `js-yaml` 将 `date: 2026-05-22` 解析为 `Date`，模板输出长字符串 | `src/lib/build-info.ts` 中 `formatDateValue()` 统一格式化为 `YYYY-MM-DD` |
| Astro build 路径 import 失败 | 嵌套页面相对路径层级错误 | 按目录深度引用：`src/pages/` 用 `../`；`wiki/[slug]/` 用 `../../../`；`[year]/.../[slug]/` 用 `../../../../../` |
| 分页 URL 与 Jekyll 不一致 | Astro 默认 `/page/2/` | 使用 `src/pages/[page].astro`，`getStaticPaths` 返回 `page2`、`page3` 等 param，生成 `/page2/` |
| 历史文章 URL 404 | 对 slug 二次 sanitize | **禁止**二次处理；从文件名 `YYYY-MM-DD-{slug}.md` 直接取 slug（保留大小写/下划线） |
| GitHub Pages 仍跑 Jekyll（`pages-build-deployment` 失败） | Pages `build_type` 仍为 `legacy`，push 触发内置 Jekyll 构建 | Settings → Pages → **GitHub Actions**；或 `gh api --method PUT repos/{owner}/{repo}/pages -f build_type=workflow` |
| Dependabot Astro 6 PR 构建失败 | Astro 6 要求 Node `>=22.12.0`，CI 用 Node 20 | workflow 改用 Node 22；`package.json` 声明 `engines.node` |
| Astro 7 构建 `CompilerError: Unexpected token`（Header.astro） | Rust 编译器要求标签闭合；`Header`/`Footer` 跨组件拆分未闭合 `<body>` | 文档壳合并为 `Header.astro` + `<slot />`，删除 `Footer.astro`；布局内容包进 `<Header>` |
| Astro 7 首页 `fs is not defined` | `build-info.ts` 使用 `fs` 未 import；Astro 7/Rolldown 打包更严格 | `import fs from 'node:fs'` |
| build-version 显示 `v6.988e+33` | `js-yaml` 将未加引号的 `6988e30` 解析为科学计数法 | `update-build-info.sh` 输出 `commit: "${SHORT}"`；`build-info.ts` 对非 string commit 回退 `sha.slice(0,7)` |
| Obsidian CI 仍 `jekyll build` | workflow 未随博客迁移更新 | `sync-blog-posts.yml` 改为 `npm ci && npm run build`；`run-sync-e2e.js` 输出 `dist-e2e/` |
| E2E 污染生产 `_posts/` | sync E2E 写入真实博客路径 | 测试后清理 fixture 文章与 `assets/images/posts/2026/`；勿提交 E2E 产物 |
| 静态资源路径变更 | Obsidian 硬编码 `assets/images/posts/` | 保留根目录 `assets/`；`public/assets` → `../assets` 符号链接 |

## 博客仓库（xiaolitongxue666.github.io）

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| favicon 404 | 根目录 `favicon.ico` 与 header 不一致 | 删除根目录 `favicon.ico`；仅用 `assets/images/avatar.jpg` |
| 浮动按钮「回到分页」跳转错误 | JS 硬编码估算页码 | `FloatingButtons.astro` 注入 `meta[name=pagination-page]`；`POSTS_PER_PAGE=10` 与 `floating-buttons.js` 一致 |
| OpenCV 文章图片不显示 | 目录名与正文引用不一致 | 修正 Markdown 内路径；**勿**重命名 `_posts` 文件 |
| 无构建校验 CI | 仅依赖 Pages 内置构建 | `astro-build.yml`：build + E2E + deploy-pages |
| 首页版本号无日期 | `_data/build.yml` 未提交或 date 格式错 | 合并前 `update-build-info.sh` 并提交 `_data/build.yml`；见 Astro 迁移表 |
| 首页版本号位置漂移 | 仅依赖 CSS `position:fixed` | `BuildVersion.astro` 保留 inline fixed style |

### VPS 镜像部署（2026-05）

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 子路径 CSS/JS 404 | 模板硬编码 `/assets/` | `withBase()` + [memory_skills/blog-troubleshooting.md](../memory_skills/blog-troubleshooting.md) |
| 构建校验找 `dist/blog/` | Astro `base` 不改变输出目录结构 | 校验 `dist/index.html` 内 `/blog/assets/` |
| VPS curl 502 | 本机 HTTP 代理 | `curl --noproxy '*'` |
| `/blog/` 502 | 容器未启动 | `docker compose up`；见 `deploy-vps.yml` |
| VPS 首页无最新文章 | 访问了根域名 `/` 而非 `/blog/`；或 `deploy-vps` 失败 | 博客列表在 `https://<域名>/blog/`；文章 URL 须 `/blog/YYYY/MM/DD/slug/`；push 后确认 `deploy-vps.yml` 绿 |
| 深色主题代码块看不清 | Shiki 双主题缺 `[data-theme="dark"] .shiki` CSS；`default.css` 的 `code` 覆盖 token | `syntax.css` 激活 `--shiki-dark*`；`pre.shiki` 背景透明；行内 code 用 `:not(pre code)` |
| `/stats/` iframe 主题不同步 / 先白后变 | 生产未部署 `stats-embed-theme.js`，或 HTML 预置无 `theme` 的 `src` 导致先加载默认浅色 | iframe 无预置 `src`，内联脚本按 `localStorage.theme` 设 `?theme=`；切换用 `postMessage`；见 [blog-analytics.md](../memory_skills/blog-analytics.md) |
| `/stats/` iframe 顶白条（深色） | 生产曾 `sub_filter` 注入 `background:#fff` | vps_nginx 注入 `analytics-blog-theme.css`（勿 `#fff`）；公网提供 `/css/` `/js/` 主题资源 |

详细踩坑见 [memory_skills/blog-troubleshooting.md](../memory_skills/blog-troubleshooting.md)。

### 历史（Jekyll 时代，已移除）

评论系统未接入、`_layouts/wiki.html` 冗余、Gemfile 依赖、`--source .e2e-staging` + Jekyll config 路径错误等——随 Jekyll 移除，仅作归档参考。

## Obsidian 仓库（obsidian_repo）

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| PR 误推送到博客 | workflow 在 PR 也 push | push 步骤加 `if: github.event_name == 'push'` |
| E2E 图片路径错误 | 硬编码 `./blog-repo` | 使用 `BLOG_REPO_DIR` / `E2E_BLOG_REPO_DIR` |
| E2E fixture 未处理 | Git diff 跳过临时目录 | `E2E_FORCE_FULL_SCAN=true` + `E2E_CONTENT_ROOT` |
| 博客构建验证失败（迁移后） | 仍 checkout 无 `package.json` 的旧逻辑 | `ensureBlogRepo()` 检查 `package.json`；构建用 `npm run build` |

## E2E 测试

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 本地 sync E2E 失败 | 未设真实博客路径 | `BLOG_REPO_DIR=/path/to/xiaolitongxue666.github.io` |
| publish E2E 污染生产 | fixture 写入仓库根 | 隔离目录 `.e2e-staging` + `E2E_OUT_DIR=dist-e2e` |
| 本地过、CI 挂 | staging 未 `npm ci` | staging 内完整 `npm ci && E2E_OUT_DIR=dist-e2e npm run build` |
| homepage 回归 | 改 layout 未断言 | `run-ci-parity.sh` 含 `assert-homepage-build-version.js` |
| live 验证失败 | 尚未 deploy | push 后 `gh workflow run e2e-publish.yml -f live_verify=true` |

## 不可违反的约束

- **禁止**批量重命名已有 `_posts/`（permalink 由文件名 slug 决定）
- **禁止**修改 permalink 规则、GitHub Pages 部署分支（`master`）
- Obsidian 同步 **仅** 在 `push` 事件写入博客仓库
- **禁止**提交 `node_modules/`、`dist/`、`.e2e-staging/`、E2E fixture 文章
- 合并前：`npm run verify:local`（或 `bash .github/scripts/e2e/run-ci-parity.sh`）

## 本地验证命令

```bash
# 博客（提交前推荐）
npm run verify:local

# CI 等价子集
bash .github/scripts/e2e/run-ci-parity.sh

# Obsidian 同步 E2E
cd obsidian_repo
BLOG_REPO_DIR=/path/to/xiaolitongxue666.github.io node .github/scripts/e2e/run-sync-e2e.js
```
