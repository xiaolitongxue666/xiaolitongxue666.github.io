# 博客 VPS 镜像部署

Agent 在改 `deploy-vps.yml`、`docker-compose.yml` 或子路径构建前读本文件。

## 双端部署（互不影响）

| 目标 | 构建 env | Workflow | 访问 URL |
|------|----------|----------|----------|
| GitHub Pages | 默认（无 `ASTRO_BASE`） | `astro-build.yml` → deploy-pages | `https://xiaolitongxue666.github.io/` |
| VPS 镜像 | `ASTRO_SITE=https://xiaolitongxue.com.cn` `ASTRO_BASE=/blog/` | `deploy-vps.yml` | Tailscale：`http://<Tailscale IP>/blog/` |

**关键**：Pages 与 VPS 是**两次独立构建**；改 `astro.config.mjs` 须保证默认行为不变。

## VPS 路径

| 位置 | 路径 |
|------|------|
| GitHub | `git@github.com:xiaolitongxue666/xiaolitongxue666.github.io.git` |
| VPS release | `/home/ubuntu/blog/releases/<run-id>/` |
| VPS current | `/home/ubuntu/blog/current` → 当前 release |
| 容器 | `blog-blog-1`，`127.0.0.1:3001:80` |

## 栈组成

- **构建产物**：`dist/`（文件在根目录；HTML 内 URL 带 `/blog/` 前缀）
- **容器**：`nginx:1.27-alpine` + `deploy/nginx/default.conf`（`rewrite ^/blog/` → 静态根）
- **宿主机**：`vps_nginx` `location /blog/` → `proxy_pass http://127.0.0.1:3001`（**无**尾部 `/`，保留 URI）

## GitHub Secrets（仅存 GitHub，勿提交仓库）

| Secret | 必填 | 默认 |
|--------|------|------|
| `VPS_SSH_KEY` | 是 | — |
| `VPS_HOST` | 否 | `xiaolitongxue.com.cn` |
| `VPS_USER` | 否 | `ubuntu` |
| `VPS_PORT` | 否 | `22` |

设置示例：`gh secret set VPS_SSH_KEY < ~/.ssh/id_ed25519`（在博客仓库目录或 `-R owner/repo`）。

## 子路径源码约定

- `astro.config.mjs`：`ASTRO_SITE` / `ASTRO_BASE` 环境变量
- `src/lib/base.ts`：`withBase()` — Header、分页、permalink、浮动按钮 JS 均须经过
- `Header.astro` 注入 `<meta name="site-base" content={import.meta.env.BASE_URL} />` 供 `floating-buttons.js` 读取

## 部署后验收（VPS）

```bash
curl --noproxy '*' -sf http://127.0.0.1:3001/blog/
curl --noproxy '*' -sf -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/blog/assets/css/default.css
curl --noproxy '*' -sf http://$(tailscale ip -4)/blog/
```

公网 `https://xiaolitongxue.com.cn/blog/` 需 `vps_nginx` 开启 **public** 模式（当前 tailscale-only 阶段不可用）。

## 变更记录

- **2026-05-25**：初版；VPS 子路径镜像 + Docker nginx + deploy-vps workflow。
