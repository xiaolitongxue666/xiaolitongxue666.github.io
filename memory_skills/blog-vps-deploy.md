# 博客 VPS 镜像部署

Agent 在改 `deploy-vps.yml`、`docker-compose.yml` 或子路径构建前读本文件。

## 双端部署（互不影响）

| 目标 | 构建 env | Workflow | 访问 URL |
|------|----------|----------|----------|
| GitHub Pages | 默认（无 `ASTRO_BASE`） | `astro-build.yml` | `https://xiaolitongxue666.github.io/` |
| VPS 镜像 | `ASTRO_SITE=https://xiaolitongxue.com.cn` `ASTRO_BASE=/blog/` | `deploy-vps.yml` | **公网** `https://xiaolitongxue.com.cn/blog/` · **Tailscale** `http://<TS IP>/blog/` |

Pages 与 VPS 是两次独立构建；默认 `astro.config.mjs` 行为不可破坏。

## VPS 路径

| 位置 | 路径 |
|------|------|
| VPS release | `/home/ubuntu/blog/releases/<run-id>/` |
| VPS current | `/home/ubuntu/blog/current` |
| 容器 | `blog-blog-1`，`127.0.0.1:3001:80` |

## 栈组成

- **产物**：`dist/` 根目录；HTML 内 URL 带 `/blog/`
- **容器**：nginx + `deploy/nginx/default.conf`（`rewrite ^/blog/` → 静态根）
- **宿主机**：`vps_nginx` hybrid → `proxy_pass http://127.0.0.1:3001`（无尾部 `/`）

## GitHub Secrets（仅存 GitHub）

| Secret | 必填 |
|--------|------|
| `VPS_SSH_KEY` | 是 |
| `VPS_HOST` / `VPS_USER` / `VPS_PORT` | 否（有默认） |

## 子路径约定

- `src/lib/base.ts`：`withBase()` 用于所有子路径链接与静态资源
- 构建校验：`dist/index.html` 含 `href="/blog/assets/css/default.css"`

## 验收

```bash
# VPS 容器
curl --noproxy '*' -sf http://127.0.0.1:3001/blog/

# 经 Nginx（公网 / Tailscale）
curl --noproxy '*' -sf https://xiaolitongxue.com.cn/blog/
curl --noproxy '*' -sf http://$(tailscale ip -4)/blog/
```

域名不可用但 IP 可用 → 腾讯云 **接入备案**（见 vps_nginx troubleshooting）。Tailscale 浏览器不通 → 本机代理 DIRECT `100.64.0.0/10`。

## 变更记录

- **2026-05-26**：公网 HTTPS 已上线；备案/代理说明。
- **2026-05-25**：初版 VPS 子路径 + deploy-vps workflow。
