# 博客 VPS 与子路径踩坑

人机共维护。架构与部署见 [blog-vps-deploy.md](blog-vps-deploy.md)；完整问题表见 [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)。

## 2026-05-25 Astro `base=/blog/` 产物不在 `dist/blog/`

| 现象 | 计划假设 `dist/blog/index.html`，CI `test -f` 失败 |
| 根因 | Astro 的 `base` 只影响 HTML 内 URL，**输出目录结构仍在 `dist/` 根** |
| 办法 | 构建校验用 `dist/index.html` + grep `href="/blog/assets/..."`；容器 nginx 用 `rewrite ^/blog/` 映射到静态根 |

## 2026-05-25 硬编码 `/assets/` 导致子路径 CSS 404

| 现象 | `/blog/` 页面 200，样式丢失 |
| 根因 | `Header.astro` 等写死 `href="/assets/..."`，浏览器请求站点根而非 `/blog/assets/` |
| 办法 | 统一 `withBase()`；categories/wiki 链接改用 `post.url` / `page.url`（已含 base） |

## 2026-05-25 `proxy_pass` 尾部 `/` 剥前缀

| 现象 | 宿主机 `/blog/` 与容器路径不一致 |
| 根因 | `proxy_pass http://127.0.0.1:3001/;` 会把 `/blog/foo` 变成 `/foo` |
| 办法 | `vps_nginx` 改为 `proxy_pass http://127.0.0.1:3001;`（无 URI 后缀） |

## 2026-05-25 VPS 上 curl 502，容器实际正常

| 现象 | `curl http://127.0.0.1:3001/blog/` → 502 |
| 根因 | VPS 上 **HTTP 代理**（如 mihomo `127.0.0.1:17890`）劫持 localhost 请求 |
| 办法 | `curl --noproxy '*'`；`deploy-vps.yml` 验收同样须加 |

## 2026-05-25 rsync `deploy/` 目录结构错误

| 现象 | 容器启动失败：`default.conf` mount 类型不对 |
| 根因 | `rsync deploy/` 到 release 根目录，缺少 `deploy/nginx/` 层级 |
| 办法 | 分两次 rsync：`docker-compose.yml` → release 根；`deploy/` → `release/deploy/` |

## 2026-05-25 `/blog/` 502（Blog 栈未部署）

| 现象 | `vps_nginx` 探针 `/blog/` → 502 |
| 根因 | `127.0.0.1:3001` 无监听 |
| 办法 | 部署博客容器或手动 rsync + `docker compose up`；路由本身正常 |

## E2E 范围说明

| 有 | 无 |
|----|-----|
| `deploy-vps.yml` 部署后 `curl` smoke（含公网 HTTPS warn） | 博客仓库 **无** VPS Playwright E2E |
| `astro-build.yml` / `run-publish-e2e.js` → GitHub Pages | `verify-live.js` 仅验证 `xiaolitongxue666.github.io` |
| `vps_nginx deploy.sh` hybrid 探针 | — |

## 2026-05-26 公网域名浏览器不可用、IP 可用

| 现象 | `https://xiaolitongxue.com.cn/blog/` 失败；`http://123.207.13.22/blog/` 正常 |
| 根因 | 腾讯云 **DNSPod 备案 webblock**（非 Blog/Nginx 配置问题） |
| 办法 | 腾讯云完成域名接入备案；临时用公网 IP |

## 2026-05-26 Tailscale 浏览器不通、curl 通

| 根因 | 本机 HTTP 代理误拦 `100.64.0.0/10` |
| 办法 | 关代理或 Clash DIRECT；见 vps_nginx troubleshooting |

## 2026-07-02 Astro 7 升级后 VPS/Pages 构建失败

| 现象 | `CompilerError: Unexpected token` @ `Header.astro:50` |
| 根因 | Astro 7 Rust 编译器不接受跨组件未闭合 HTML（原 `Header` 开壳 + `Footer` 关壳） |
| 办法 | `Header.astro` 内 `<body><slot /></body></html>`；布局内容作为子节点；删 `Footer.astro` |

## 变更记录

- **2026-07-02**：Astro 7 Header/Footer 壳合并。
- **2026-05-26**：备案 webblock、Tailscale 代理说明。
- **2026-05-25**：初版；汇总 VPS 镜像部署会话踩坑。
