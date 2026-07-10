# 项目 Memory（Agent 可读）

跨会话要点索引。**详细事实**见 [memory_skills/README.md](../memory_skills/README.md)；问题表见 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)；架构见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 发布路径

| 路径 | 触发 | 产物 |
|------|------|------|
| GitHub Pages | push `master` → `astro-build.yml` | `dist/` → `xiaolitongxue666.github.io` |
| Obsidian 同步 | obsidian_repo push → 博客 `astro-build.yml` | 同上 |
| VPS 镜像 | push `master` → `deploy-vps.yml`（独立构建 `ASTRO_BASE=/blog/`） | rsync → `/home/ubuntu/blog/current` |

## 禁止操作

- 重命名已有 `_posts/`、改 permalink / 部署分支
- 根 `package.json` 加 `"type": "module"`
- 提交 `dist/`、`node_modules/`、`.e2e-staging/`、Secrets/私钥

## Agent 入口

| 资源 | 用途 |
|------|------|
| [memory_skills/](memory_skills/README.md) | VPS 部署与子路径踩坑（优先） |
| [AGENTS.md](../AGENTS.md) | 助手指南 |
| `.cursor/rules/blog-project.mdc` | Cursor 始终生效规则 |

## 合并前验证

```bash
bash .github/scripts/update-build-info.sh   # 刷新 _data/build.yml（合并前提交）
npm run verify:local                        # Pages build + E2E + VPS 子路径 dist 断言
bash .github/scripts/e2e/run-ci-parity.sh   # CI 等价子集
```

本地 Windows 仅作开发；**VPS 子路径构建**（`ASTRO_BASE=/blog/`）以 Ubuntu CI `deploy-vps.yml` 为准。Windows Git Bash 本地测 VPS 构建须 `MSYS_NO_PATHCONV=1`（`dev-verify.sh` 已设置）。

## Shiki 深色主题（2026-07）

- `rehype-shiki` 输出浅色 inline + `--shiki-dark*` CSS 变量；切换依赖 `syntax.css` 中 `[data-theme="dark"] .shiki` 规则。
- `default.css`：`pre.shiki` 背景透明；`[data-theme="dark"] code:not(pre code)` 仅作用于行内代码，避免覆盖 Shiki token。

## Mermaid（2026-07）

- 文章内 ` ```mermaid ` 经 `rehype-mermaid`（`strategy: inline-svg`）在**构建期**输出内联 SVG；`rehypeStringify` 须 `allowDangerousHtml: true`。
- **DOM 结构**：`inline-svg` 输出为裸 `<svg class="flowchart">`，**无** `.mermaid` 包裹；深色样式须选 `svg.flowchart`，不能仅写 `.mermaid`。
- 构建期默认浅色主题，连线/箭头内嵌 `#333`；深色模式在 `default.css` 用 `[data-theme="dark"] svg.flowchart path.flowchart-link`（及 marker）覆盖为浅色描边。
- `rehype-mermaid` 须在 `rehype-shiki` **之前**注册。
- **CI 双端**须 `npx playwright install chromium`；容器样式见 `default.css` 中 `.mermaid` / `pre.mermaid`（若有包裹）。

## VPS 访问（易错）

- 博客列表入口：`https://<域名>/blog/`（非根域名 `/`）。
- 文章 permalink：`/blog/:year/:month/:day/:slug/`（对照 test-blog-post-with-images）。
- 验收：`curl --noproxy '*'`；无 `/blog/` 前缀的 URL 会 404。

## 阅读统计（2026-07-10）

- 自托管 GoatCounter：博客 `docker-compose` `:3002`；vps_nginx `/analytics/`；双端上报 URL 固定为 `https://xiaolitongxue.com.cn/analytics/...`（见 `src/lib/site.ts`，**禁止** `withBase()`）。
- 统计页：`/stats/`（Pages）、`/blog/stats/`（VPS）；含「返回博客主页」与右下角 🏠。
- 嵌入：静态 iframe `?hideui=1`；皮肤与主题同步见 [memory_skills/blog-analytics.md](../memory_skills/blog-analytics.md)（`analytics-blog-theme.css` + `stats-embed-theme.js` 跟随 `data-theme`）。
- GoatCounter 须配置 `allow_embed`（含生产域名与本地 `http://localhost:4001`、`4321/4322` 等）。
- 主题资源公网路径：`/css/analytics-blog-theme.css`、`/js/analytics-theme.js`（vps_nginx hybrid public exact location；勿放在 `/analytics/` proxy 下）。
- Windows 本地验收：`curl` 可能被代理干扰，用 `curl --noproxy '*'` 或 Node `fetch`；Astro dev 默认端口 `4001`。

## Astro 7（2026-07）

- **Rust 编译器**：每个 `.astro` 内 HTML 须闭合；禁止 `Header` 开文档 + `Footer` 关文档的拆分模式 → 用 `Header` + `<slot />` 完整壳。
- **build-info**：`src/lib/build-info.ts` 须 `import fs`；`_data/build.yml` 的 `commit` 须引号包裹（避免 `6988e30` 被 yaml 当浮点）。
- **Markdown**：文章仍走 `src/lib/markdown.ts` remark/rehype（含 Mermaid），与 Astro 7 默认 Sätteri 无关。
- **Dependabot**：`astro` 6→7 常捆绑 `esbuild` 安全升级；合并前跑 CI parity。

