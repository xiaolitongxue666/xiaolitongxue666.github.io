# 博客阅读统计（自托管 GoatCounter）

Agent 在改 analytics 配置、`docker-compose.yml` 或 `/stats/` 页前读本文件。

## 双端统一上报

| 部署 | 博客 URL | 统计页入口 | 上报/脚本（固定绝对 URL） |
|------|----------|------------|---------------------------|
| GitHub Pages | `https://xiaolitongxue666.github.io/` | `/stats/` | `https://xiaolitongxue.com.cn/analytics/...` |
| VPS 镜像 | `https://xiaolitongxue.com.cn/blog/` | `/blog/stats/` | 同上 |

配置单一事实来源：[`src/lib/site.ts`](../src/lib/site.ts) 的 `SITE.analytics`。**禁止**对上报 URL 使用 `withBase()`。

## 栈组成

| 组件 | 位置 | 端口 |
|------|------|------|
| GoatCounter 容器 | 博客 `docker-compose.yml`（`COMPOSE_PROJECT_NAME=blog`） | `127.0.0.1:3002` |
| 静态博客 nginx | 同 compose `blog` 服务 | `127.0.0.1:3001` |
| 宿主机反代 | [vps_nginx](https://github.com/xiaolitongxue666/vps_nginx) `/analytics/` | → `:3002` |
| 主题静态资源 | vps_nginx `html/css|js/` → 公网 `/css/` `/js/` | hybrid public exact location |

GoatCounter 镜像 `arp242/goatcounter:latest`；须 `-base-path /analytics` 与显式 `-db sqlite+/home/goatcounter/db/goatcounter.sqlite3`。

## `/stats/` 主题与嵌入

| 项 | 实现 |
|----|------|
| 皮肤 | vps_nginx `html/css/analytics-blog-theme.css`（浅 `#FDF6E3` / 深 `#2d2d2d`） |
| 注入 | `sub_filter`：先 boot `?theme=`→`data-theme`，再 CSS + `analytics-theme.js`（**禁止**再注入 `#fff`） |
| 博客同步 | iframe **无预置 src**；内联脚本读 `localStorage.theme` 设 `?theme=`；`stats-embed-theme.js` 用 `postMessage`（`source=blog-stats-theme`）跟随切换 |
| 容器底色 | `.stats-embed` / iframe 随博客 `data-theme`（防闪白） |
| `allow_embed` | 须含生产域名与 `http://localhost:4001`、`127.0.0.1:4001`（及旧 `4321/4322`） |
| 本地预览皮肤 | `vps_nginx/scripts/preview-analytics-theme.sh` → `http://127.0.0.1:8765/?theme=light\|dark`（不改 VPS） |

## 首次初始化（SSH，一次性）

```bash
cd /home/ubuntu/blog/current
export COMPOSE_PROJECT_NAME=blog
docker compose exec goatcounter goatcounter db migrate all -createdb
docker compose exec goatcounter goatcounter db create site -vhost=xiaolitongxue.com.cn -user.email <邮箱> -user.password <密码>
docker compose exec goatcounter goatcounter db query -format=exec "update sites set settings = json_set(json_set(json_set(settings, '$.public', 'public'), '$.allow_embed', 'xiaolitongxue.com.cn,xiaolitongxue666.github.io,127.0.0.1,http://127.0.0.1:4322,http://127.0.0.1:4321,http://localhost:4322,http://localhost:4321,http://127.0.0.1:4001,http://localhost:4001'), '$.allow_counter', json('true')) where site_id = 1;"
docker compose exec goatcounter goatcounter db query -format=exec "update sites set user_defaults = json_set(json_set(json_set(json_set(user_defaults, '$.language', 'zh-CN'), '$.theme', ''), '$.timezone', '.Asia/Shanghai'), '$.date_format', '2006-01-02') where site_id = 1;"
docker compose restart goatcounter
```

## 验收

```bash
curl --noproxy '*' -sf https://xiaolitongxue.com.cn/analytics/count.js >/dev/null
curl --noproxy '*' -sf https://xiaolitongxue.com.cn/css/analytics-blog-theme.css >/dev/null
curl --noproxy '*' -sf https://xiaolitongxue.com.cn/blog/assets/js/stats-embed-theme.js >/dev/null
curl --noproxy '*' -sL https://xiaolitongxue.com.cn/blog/stats/ | grep -q stats-embed-frame
curl --noproxy '*' -sL 'https://xiaolitongxue.com.cn/analytics/?hideui=1&theme=dark' | grep -q blog-stats-theme-boot
```

## 变更记录

- **2026-07-10**：自托管 GoatCounter；双端共用上报 URL；浅/深皮肤 + `data-theme` 同步；iframe 延后设 `src` 消白闪；`allow_embed` 含 `:4001`。
