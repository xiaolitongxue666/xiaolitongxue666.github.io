---
name: blog-knowledge
description: >-
  xiaolitongxue666 Astro 博客：GitHub Pages + VPS 子路径镜像、withBase、deploy-vps。
  Use when working on blog VPS deploy, ASTRO_BASE, docker-compose, or subpath routing.
---

# 博客仓库知识入口

1. 读 [AGENTS.md](../../AGENTS.md) 与 [memory_skills/README.md](../../memory_skills/README.md)。
2. VPS 部署 / 双构建 / Secrets → [memory_skills/blog-vps-deploy.md](../../memory_skills/blog-vps-deploy.md)
3. 子路径 / proxy / curl 踩坑 → [memory_skills/blog-troubleshooting.md](../../memory_skills/blog-troubleshooting.md)
4. GoatCounter / `/stats/` / **本地 `npm run local:vps`** → [memory_skills/blog-analytics.md](../../memory_skills/blog-analytics.md)

## 硬约束

- 勿重命名已有 `_posts/`；permalink 由文件名 slug 决定。
- 根 `package.json` **勿**加 `"type": "module"`（E2E 为 CommonJS）。
- 子路径链接须走 `src/lib/base.ts` 的 `withBase()`。
- **勿提交** `dist/`、`node_modules/`、`.e2e-staging/`、任何 SSH 私钥。

## 相关

- 宿主机 `/blog/` → 外部仓 `vps_nginx` hybrid（:3001）；域名须腾讯云接入备案
- Obsidian 同步 → 外部仓 `obsidian_repo`
