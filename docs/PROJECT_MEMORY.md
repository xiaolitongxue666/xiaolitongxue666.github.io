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
bash .github/scripts/e2e/run-ci-parity.sh   # 需 Node >= 22.12
```

## Astro 7（2026-07）

- **Rust 编译器**：每个 `.astro` 内 HTML 须闭合；禁止 `Header` 开文档 + `Footer` 关文档的拆分模式 → 用 `Header` + `<slot />` 完整壳。
- **build-info**：`src/lib/build-info.ts` 须 `import fs`；`_data/build.yml` 的 `commit` 须引号包裹（避免 `6988e30` 被 yaml 当浮点）。
- **Markdown**：文章仍走 `src/lib/markdown.ts` remark/rehype，与 Astro 7 默认 Sätteri 无关。
- **Dependabot**：`astro` 6→7 常捆绑 `esbuild` 安全升级；合并前跑 CI parity。

