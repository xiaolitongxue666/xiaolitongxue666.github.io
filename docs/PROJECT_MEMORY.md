# 项目 Memory

跨会话索引。VPS / analytics 细节见 [memory_skills/README.md](../memory_skills/README.md)；排错见 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)；架构见 [ARCHITECTURE.md](ARCHITECTURE.md)；依赖见 [DEPENDENCIES.md](DEPENDENCIES.md)。

## 发布路径

| 路径          | 触发                                                    | 产物                                   |
| ------------- | ------------------------------------------------------- | -------------------------------------- |
| GitHub Pages  | push `master` → `astro-build.yml`                       | `dist/` → `xiaolitongxue666.github.io` |
| Obsidian 同步 | obsidian_repo push → 博客 `astro-build.yml`             | 同上                                   |
| VPS 镜像      | push `master` → `deploy-vps.yml`（`ASTRO_BASE=/blog/`） | rsync → `/home/ubuntu/blog/current`    |

## 禁止操作

- 重命名已有 `_posts/`、改 permalink / 部署分支
- 根 `package.json` 加 `"type": "module"`
- 提交 `dist/`、`node_modules/`、`.e2e-staging/`、Secrets/私钥
- 用精确 override 钉 sharp / svgo / smol-toml / dompurify（见 [DEPENDENCIES.md](DEPENDENCIES.md)）

## 文档表

| 资源                                         | 用途                             |
| -------------------------------------------- | -------------------------------- |
| [AGENTS.md](../AGENTS.md)                    | Agent 入口                       |
| [memory_skills/](../memory_skills/README.md) | VPS / analytics / 子路径 runbook |
| `.cursor/rules/blog-project.mdc`             | 始终生效硬约束                   |
| [README.md](../README.md)                    | 人类入门                         |

## 合并前验证

```bash
npm run verify:local
```

`run-ci-parity.sh` 是 CI 子集（Pages build + E2E），**不是** `verify:local` 的等价替代。Windows Git Bash 测 VPS 构建须 `MSYS_NO_PATHCONV=1`（`dev-verify.sh` 已设）。

VPS URL 与验收：`https://<域名>/blog/`，`curl --noproxy '*'`。统计联调见 [blog-analytics.md](../memory_skills/blog-analytics.md)。

## Shiki 深色主题（2026-07）

- `rehype-shiki` 输出浅色 inline + `--shiki-dark*`；切换依赖 `syntax.css` 中 `[data-theme="dark"] .shiki`。
- `default.css`：`pre.shiki` 背景透明；`[data-theme="dark"] code:not(pre code)` 只作用于行内代码。

## Mermaid（2026-07）

- ` ```mermaid ` 经 `rehype-mermaid`（`strategy: inline-svg`）构建期输出内联 SVG；`rehypeStringify` 须 `allowDangerousHtml: true`。
- `inline-svg` 为裸 `<svg class="flowchart">`，无 `.mermaid` 包裹；深色须选 `svg.flowchart`。
- 构建期浅色连线内嵌 `#333`；深色用 `[data-theme="dark"] svg.flowchart path.flowchart-link`（及 marker）覆盖。
- `rehype-mermaid` 须在 `rehype-shiki` **之前**注册。
- CI 双端：`npx playwright install chromium`。

## Astro 7

- `.astro` HTML 须闭合；`Header` + `<slot />` 完整壳。
- `build-info`：`import fs`；`_data/build.yml` 的 `commit` 须引号。
- Markdown 走 `src/lib/markdown.ts`。

## 依赖与验证（2026-09-15）

- overrides **只钉** `gray-matter` → `js-yaml@3.15.2`；勿钉 sharp / svgo / smol-toml / dompurify。见 [DEPENDENCIES.md](DEPENDENCIES.md)。
- Dependabot npm 安全更新分组：`.github/dependabot.yml`。多 PR 勿串行 Merge。
- `verify:local` 含 `npm audit --audit-level=high`、`format:check`、`lint`，再 Pages / E2E / VPS 子路径。
- `_data/build.yml` 由 `update-build-info.sh` 生成（双引号）；已列入 `.prettierignore`，避免 format:check 与脚本输出打架。
