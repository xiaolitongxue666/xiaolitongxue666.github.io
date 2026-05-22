# 项目 Memory（Agent 可读）

跨会话持久化要点。详细问题表见 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)，架构见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 双仓库

| 仓库 | 分支 | 角色 |
|------|------|------|
| `xiaolitongxue666.github.io` | master | Astro 源码 + GitHub Pages（**Actions 部署**） |
| `obsidian_repo` | master | Obsidian 笔记 + 同步 CI |

## 发布路径

1. **Obsidian**：`#xiaolitongxue666_blog` → `sync-blog-posts.yml` → push `_posts/` + 图片 → 博客 `astro-build.yml`
2. **直写**：编辑 `_posts/` → push → `astro-build.yml` + deploy-pages

## 禁止操作

- 重命名已有 `_posts/`（破坏 permalink）
- 改 permalink 规则 / 部署分支
- Obsidian PR 事件 push 到博客
- 根 `package.json` 加 `"type": "module"`（会破坏 E2E CommonJS 脚本）
- 提交 `dist/`、`node_modules/`、E2E fixture 到 `_posts/`

## 命名与同步契约（Obsidian 未变）

- 文件：`YYYY-MM-DD-{sanitizeFilename(笔记名)}.md`
- front matter：`layout: default`（Astro 忽略，Obsidian 仍输出）
- 图片：`assets/images/posts/{Y}/{date}-{slug}/{date}-{slug}_NNN.ext`
- slug 取自**文件名**，历史文章禁止二次 sanitize

## Astro 关键路径

| 用途 | 路径 |
|------|------|
| 文章 | `_posts/` → `src/lib/posts.ts` |
| 静态资源 | `assets/` + `public/assets` → `../assets` |
| 分页 | `POSTS_PER_PAGE=10`，URL `/page2/`（非 `/page/2/`） |
| 构建产物 | `dist/`（生产）、`dist-e2e/`（E2E） |
| build-version | `src/components/BuildVersion.astro` + `_data/build.yml` |

## E2E 与 CI

- **合并前**：`bash .github/scripts/e2e/run-ci-parity.sh`
- publish E2E：`.e2e-staging` 内 `npm ci` + `E2E_OUT_DIR=dist-e2e npm run build`
- sync E2E：`BLOG_REPO_DIR` 指向真实博客路径；输出 `dist-e2e/`
- 首页断言：commit + `YYYY-MM-DD` date + inline fixed 定位

## 迁移后手动一步

GitHub 仓库 **Settings → Pages → Source: GitHub Actions**（一次性）。

## Agent 规则

- 博客：`.cursor/rules/blog-project.mdc`、`AGENTS.md`
- Obsidian：`.cursor/rules/blog-sync.mdc`

## 最后验证（2026-05-22）

- 博客 `run-ci-parity.sh` PASS
- Obsidian `run-sync-e2e.js` PASS
- 历史 URL 抽样（含大小写 slug）PASS
