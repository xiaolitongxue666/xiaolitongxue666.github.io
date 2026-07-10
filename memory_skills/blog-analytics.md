# 博客阅读统计（自托管 GoatCounter）

Agent 在改 analytics 配置、`docker-compose.yml` 或 `/stats/` 页前读本文件。

## 双端统一上报（生产）

| 部署 | 博客 URL | 统计页入口 | 上报/脚本 |
|------|----------|------------|-----------|
| GitHub Pages | `https://xiaolitongxue666.github.io/` | `/stats/` | `https://xiaolitongxue.com.cn/analytics/...` |
| VPS 镜像 | `https://xiaolitongxue.com.cn/blog/` | `/blog/stats/` | 同上 |

配置单一事实来源：[`src/lib/site.ts`](../src/lib/site.ts) 的 `SITE.analytics`。默认 origin 为生产 URL；可用 **`PUBLIC_ANALYTICS_ORIGIN`** 覆盖（本地等价栈）。**禁止**对上报 URL 使用 `withBase()`。

## 本地 VPS 等价栈（推荐联调）

与生产同构：`ASTRO_BASE=/blog/` + `blog` + `goatcounter` + **edge :8080**（反代 `/blog/` `/analytics/` + 主题 `sub_filter`）。

```bash
npm run local:vps          # 同步 vps_nginx 主题 → 构建 → compose → 初始化本地 GC → 探针
# 入口：http://127.0.0.1:8080/blog/  ·  http://127.0.0.1:8080/blog/stats/
npm run local:vps:down     # 停栈（保留本地 goatcounter-db volume）
```

| 项 | 说明 |
|----|------|
| 数据 | **仅**本地 Docker volume `goatcounter-db`，与生产隔离 |
| 构建 env | `ASTRO_SITE=http://127.0.0.1:8080` `PUBLIC_ANALYTICS_ORIGIN=http://127.0.0.1:8080/analytics` |
| 本地上报 | loopback analytics 时自动写入 `data-goatcounter-settings={"allow_local":true}`（否则 count.js 丢弃 127.0.0.1） |
| 主题静态 | 从兄弟仓 `vps_nginx/html/` 复制到 `deploy/local-edge/static/`（gitignore；缺路径则 fail） |
| `COMPOSE_PROJECT_NAME` | 须为 **`blog`** |
| 宿主机 blog 端口 | 默认 `3001`；若被占用（如本机 Gitea）脚本回退 `3011`（edge 仍走 compose DNS） |
| GC volume 权限 | Docker Desktop 上 named volume 常为 root；`local-vps-up.sh` 会 `chown 1000:1000` |
| Headless 上报 | Playwright/HeadlessChrome 命中进 GC **`bots`** 表；真人 UA + `b=0` 才进 `paths`/`hit_counts` |
| 勿用生产 analytics | 主题/嵌入联调请用本地栈，勿打 `xiaolitongxue.com.cn/analytics` |

内容快改仍可用 `npm run dev -- --port 4001`（无 `/blog/` 前缀）；若需本地上报，另设 `PUBLIC_ANALYTICS_ORIGIN` 并保证 GC `allow_embed` 含 `:4001`。

## 栈组成

| 组件 | 位置 | 端口 |
|------|------|------|
| GoatCounter 容器 | 博客 `docker-compose.yml`（`COMPOSE_PROJECT_NAME=blog`） | `127.0.0.1:3002` |
| 静态博客 nginx | 同 compose `blog` 服务 | `127.0.0.1:3001`（本地可 `3011`） |
| 本地 edge | compose `edge` → `deploy/local-edge/` | `127.0.0.1:8080` |
| 宿主机反代（生产） | [vps_nginx](https://github.com/xiaolitongxue666/vps_nginx) `/analytics/` | → `:3002` |
| 主题静态资源 | vps_nginx `html/css|js/` → 公网 `/css/` `/js/` | hybrid public exact location |

GoatCounter 镜像 `arp242/goatcounter:latest`；须 `-base-path /analytics` 与显式 `-db sqlite+/home/goatcounter/db/goatcounter.sqlite3`。

## `/stats/` 主题与嵌入

| 项 | 实现 |
|----|------|
| 皮肤 | vps_nginx `html/css/analytics-blog-theme.css`（浅 `#FDF6E3` / 深 `#2d2d2d`） |
| 注入 | `sub_filter`：先 boot `?theme=`→`data-theme`，再 CSS + `analytics-theme.js`（**禁止**再注入 `#fff`） |
| 博客同步 | iframe **无预置 src**；内联脚本读 `localStorage.theme` 设 `?theme=`；`stats-embed-theme.js` 用 `postMessage`（`source=blog-stats-theme`，**targetOrigin = analytics URL 的 origin**）跟随切换 |
| 容器底色 | `.stats-embed` / iframe 随博客 `data-theme`（防闪白） |
| `allow_embed` | 生产：域名 + `:4001`；本地栈：另含 `http://127.0.0.1:8080`、`http://localhost:8080` |
| 本地预览皮肤（仅 CSS） | `vps_nginx/scripts/preview-analytics-theme.sh` → `:8765`（仍可能拉生产 HTML；完整联调用 `local:vps`） |

## 首次初始化（SSH 生产，一次性）

```bash
cd /home/ubuntu/blog/current
export COMPOSE_PROJECT_NAME=blog
docker compose exec goatcounter goatcounter db migrate all -createdb
docker compose exec goatcounter goatcounter db create site -vhost=xiaolitongxue.com.cn -user.email <邮箱> -user.password <密码>
docker compose exec goatcounter goatcounter db query -format=exec "update sites set settings = json_set(json_set(json_set(settings, '$.public', 'public'), '$.allow_embed', 'xiaolitongxue.com.cn,xiaolitongxue666.github.io,127.0.0.1,http://127.0.0.1:4322,http://127.0.0.1:4321,http://localhost:4322,http://localhost:4321,http://127.0.0.1:4001,http://localhost:4001'), '$.allow_counter', json('true')) where site_id = 1;"
docker compose exec goatcounter goatcounter db query -format=exec "update sites set user_defaults = json_set(json_set(json_set(json_set(user_defaults, '$.language', 'zh-CN'), '$.theme', ''), '$.timezone', '.Asia/Shanghai'), '$.date_format', '2006-01-02') where site_id = 1;"
docker compose restart goatcounter
```

本地初始化由 `scripts/local-vps-up.sh` 自动完成（`vhost=127.0.0.1`）。

## 验收

```bash
# 生产
curl --noproxy '*' -sf https://xiaolitongxue.com.cn/analytics/count.js >/dev/null
curl --noproxy '*' -sf https://xiaolitongxue.com.cn/css/analytics-blog-theme.css >/dev/null
curl --noproxy '*' -sL 'https://xiaolitongxue.com.cn/analytics/?hideui=1&theme=dark' | grep -q blog-stats-theme-boot

# 本地等价栈
curl --noproxy '*' -sf http://127.0.0.1:8080/blog/ >/dev/null
curl --noproxy '*' -sf http://127.0.0.1:8080/analytics/count.js >/dev/null
curl --noproxy '*' -sf http://127.0.0.1:8080/css/analytics-blog-theme.css >/dev/null
curl --noproxy '*' -sL http://127.0.0.1:8080/blog/stats/ | grep -q '127.0.0.1:8080/analytics'
```

## 变更记录

- **2026-07-10**：`PUBLIC_ANALYTICS_ORIGIN` + 本地 edge `:8080`（`npm run local:vps`）；loopback 自动 `allow_local`；数据走本地 volume。
- **2026-07-10**：自托管 GoatCounter；双端共用上报 URL；浅/深皮肤 + `data-theme` 同步；iframe 延后设 `src` 消白闪；`allow_embed` 含 `:4001`。
