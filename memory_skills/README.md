# memory_skills 索引

人机共维护的 Agent 记忆。涉及 VPS 镜像部署、子路径构建或 CI 时优先读本索引。

**入口**：[AGENTS.md](../AGENTS.md) · Cursor Skill：`.cursor/skills/blog-knowledge/SKILL.md`

| 文件 | 主题 | 何时读 |
|------|------|--------|
| [blog-vps-deploy.md](blog-vps-deploy.md) | VPS 双构建、Docker、rsync、Secrets、访问方式 | 改 deploy-vps、docker-compose、astro base |
| [blog-troubleshooting.md](blog-troubleshooting.md) | 子路径 / proxy / curl 踩坑 | `/blog/` 404/502、资源路径、CI 构建校验 |

## 维护约定

- 单文件只写一类事实；详细表格见 [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)。
- 追加条目带日期（`YYYY-MM-DD`）与可验证结论。
- **勿写入** `VPS_SSH_KEY`、`BLOG_REPO_TOKEN` 或任何私钥内容。

## 相关仓库

- [vps_nginx](https://github.com/xiaolitongxue666/vps_nginx) — 宿主机 `/blog/` 反代 → `127.0.0.1:3001`
- [obsidian_repo](https://github.com/xiaolitongxue666/obsidian_repo) — 内容同步源
