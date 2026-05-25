# AGENTS.md — 博客仓库 AI 助手指南

Astro 静态博客：**GitHub Pages**（`astro-build.yml`）+ **VPS 镜像**（`deploy-vps.yml`，路径 `/blog/`）。内容可来自 Obsidian 同步或直接编辑 `_posts/`。

## Memory 索引（优先）

| 文件 | 何时读 |
|------|--------|
| [memory_skills/README.md](memory_skills/README.md) | 总索引 |
| [memory_skills/blog-vps-deploy.md](memory_skills/blog-vps-deploy.md) | VPS 双构建、Docker、Secrets、验收 |
| [memory_skills/blog-troubleshooting.md](memory_skills/blog-troubleshooting.md) | 子路径、proxy、curl 502 |

Cursor Skill：`.cursor/skills/blog-knowledge/SKILL.md`

## 必读文档

| 文档 | 用途 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 双仓库架构、CI、VPS 链路 |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 已知问题与解决方案 |
| [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md) | 跨会话要点索引 |
| [README.md](README.md) | 本地开发与写作指南 |

## 关键事实（避免重复犯错）

- 文章 layout front matter：**`default`**（Obsidian 同步仍输出此字段；Astro 忽略）
- 部署分支：**`master`**（非 `main`）；Pages Source = **GitHub Actions**
- Permalink：`/:year/:month/:day/:title/` — **禁止**重命名已发布 `_posts` 文件
- 分页：`POSTS_PER_PAGE = 10`（`src/lib/pagination.ts`）；须与 `floating-buttons.js` 一致
- Favicon：使用 `assets/images/avatar.jpg`，无根目录 `favicon.ico`
- Wiki 页：使用 `PageLayout`（原 `layout: page`）
- 无评论系统
- 首页版本号：仅 `/` 显示；commit 来自 `GITHUB_SHA` 或 `_data/build.yml`；**date 来自 `_data/build.yml`**；根元素含 inline fixed 定位

## 构建与测试

```bash
npm install   # 需要 Node >= 22.12
npm run dev -- --port 4001
bash .github/scripts/e2e/run-ci-parity.sh   # 合并前推荐（含 build + E2E）
bash .github/scripts/update-build-info.sh   # 刷新 _data/build.yml
```

## E2E 陷阱

- `run-publish-e2e.js` 在 `.e2e-staging/` 内须 `npm ci` 后 `E2E_OUT_DIR=dist-e2e npm run build`
- E2E 输出目录为 `dist-e2e/`，生产为 `dist/`
- E2E 不依赖 `upload-artifact`；PASS/FAIL 看脚本 exit code

## 关联仓库

- **obsidian_repo**：内容源，`.github/workflows/sync-blog-posts.yml` 同步到本仓库
- **vps_nginx**：宿主机 `/blog/` → `127.0.0.1:3001`（见该仓 `memory_skills/`）
- Secret（仅存 GitHub Secrets，**勿提交**）：obsidian 侧 `BLOG_REPO_TOKEN`；VPS 部署 `VPS_SSH_KEY` 等见 [blog-vps-deploy.md](memory_skills/blog-vps-deploy.md)

## 修改前检查

1. 是否影响现有文章 URL？
2. 是否需同步更新 `docs/` 与 Obsidian 侧文档？
3. 变更 `_posts/` 或 layout 后是否运行 `run-ci-parity.sh`？

## Cursor 规则

- `.cursor/rules/blog-project.mdc`（`alwaysApply: true`）
- `.cursor/skills/blog-knowledge/SKILL.md`
