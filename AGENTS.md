# AGENTS.md — 博客仓库 AI 助手指南

Astro 静态博客：**GitHub Pages**（`astro-build.yml`）+ **VPS 镜像**（`deploy-vps.yml`，路径 `/blog/`）。内容可来自 Obsidian 同步或直接编辑 `_posts/`。

硬约束见 `.cursor/rules/blog-project.mdc`。长文只链不抄。

## Memory 索引

| 文件                                                                           | 何时读                              |
| ------------------------------------------------------------------------------ | ----------------------------------- |
| [memory_skills/README.md](memory_skills/README.md)                             | 总索引                              |
| [memory_skills/blog-vps-deploy.md](memory_skills/blog-vps-deploy.md)           | VPS 双构建、Docker、Secrets、验收   |
| [memory_skills/blog-analytics.md](memory_skills/blog-analytics.md)             | GoatCounter、`/stats/`、`local:vps` |
| [memory_skills/blog-troubleshooting.md](memory_skills/blog-troubleshooting.md) | 子路径、proxy、curl 502             |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)                                   | overrides、Dependabot、`npm audit`  |

Cursor Skill：`.cursor/skills/blog-knowledge/SKILL.md`

## 文档

| 文档                                               | 用途                 |
| -------------------------------------------------- | -------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)       | 双仓库架构、CI       |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 问题表               |
| [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md)   | 索引 + Shiki/Mermaid |
| [README.md](README.md)                             | 本地开发与写作       |

## 关键事实

- 部署分支 **`master`**；Pages Source = **GitHub Actions**
- **禁止**重命名已发布 `_posts/`；permalink `/:year/:month/:day/:title/`
- `POSTS_PER_PAGE = 10`：[`src/lib/pagination.ts`](src/lib/pagination.ts) 与 `assets/js/floating-buttons.js` 必须一致
- 根 `package.json` **勿**加 `"type": "module"`
- overrides **只钉** `gray-matter` 的 js-yaml 3.x；Dependabot 先对 override，见 [DEPENDENCIES.md](docs/DEPENDENCIES.md)
- Shiki / Mermaid：[docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md)
- 阅读统计：上报禁 `withBase()`；联调 `npm run local:vps`，见 [blog-analytics.md](memory_skills/blog-analytics.md)

## 构建与测试

```bash
npm install   # Node >= 22.22.3
npm run dev -- --port 4001
npm run local:vps
npm run verify:local                        # 提交前必跑（含 audit + VPS 子路径断言）
bash .github/scripts/e2e/run-ci-parity.sh   # CI 子集（build + E2E，不含 VPS 子路径）
bash .github/scripts/update-build-info.sh
```

## 提交前

1. `npm run verify:local` 通过
2. `npm run dev -- --port 4001`，明暗主题下看代码块与 Mermaid
3. 提交 `_data/build.yml`（`update-build-info.sh`）
4. push `master` 后看 `astro-build.yml` 与 `deploy-vps.yml`

## E2E

- staging 内 `npm ci` 后再构建；`E2E_OUT_DIR` 经 `execSync` 的 `env` 传入（Windows 勿用 shell 前缀）
- 产物 `dist-e2e/`，生产 `dist/`；看脚本 exit code

## 关联仓库

- **obsidian_repo**：同步源（`BLOG_REPO_TOKEN`）
- **vps_nginx**：`/blog/` → `:3001`；本机 `Code/VPS/xiaolitongxue666.github.io`，生产 `/home/ubuntu/blog/current`；Secrets 见 [blog-vps-deploy.md](memory_skills/blog-vps-deploy.md)

## 修改前

1. 是否影响已发布 URL？
2. 是否需同步 `docs/` / Obsidian 侧文档？
3. 改 `_posts/` 或 layout 后是否跑 `verify:local`？
