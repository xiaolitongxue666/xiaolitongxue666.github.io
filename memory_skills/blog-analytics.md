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
| GoatCounter 容器 | 博客 `docker-compose.yml` | `127.0.0.1:3002` |
| 静态博客 nginx | 同 compose `blog` 服务 | `127.0.0.1:3001` |
| 宿主机反代 | [vps_nginx](https://github.com/xiaolitongxue666/vps_nginx) `/analytics/` | → `:3002` |

GoatCounter 镜像 `arp242/goatcounter:latest`；启动参数 `-base-path /analytics`、`-db sqlite+/home/goatcounter/db/goatcounter.sqlite3`（**必须**显式指定，否则数据会落在容器内 `goatcounter-data/` 而非命名卷）。

## `/stats/` 嵌入体验

| 项 | 实现 |
|----|------|
| 中文界面 | 站点 `user_defaults.language = zh-CN`；时区 `.Asia/Shanghai`（注意带点前缀，非 `Asia/Shanghai`） |
| 折线图 | GoatCounter 默认 widgets（`pages`、`totalpages` 的 `style: line`）即带图表 |
| 主题皮肤 | vps_nginx `html/css/analytics-blog-theme.css`（浅奶油 / 深 `#2d2d2d`）；`sub_filter` 注入 CSS+`analytics-theme.js` |
| 主题同步 | 博客 `stats-embed-theme.js`：`?theme=` + `postMessage`（`source=blog-stats-theme`）跟随 `data-theme`；直达仪表盘带当前 theme |
| 嵌入容器 | `.stats-embed` / iframe 底色随博客浅/深；本地预览：`vps_nginx/scripts/preview-analytics-theme.sh` → `:8765/?theme=light\|dark` |
| 本地嵌入 | `allow_embed` 须含 `http://localhost:4001` 与 `http://127.0.0.1:4001` |

## 部署顺序

1. 推送博客 `master` → `deploy-vps.yml` 启动 `:3002` GoatCounter + `:3001` 静态站
2. 在 VPS 部署 vps_nginx（`PUBLIC_EXPOSE` 须含 `analytics`，公网 HTTPS 才能加载 `count.js`）
3. 首次初始化（SSH，一次性）：

```bash
cd /home/ubuntu/blog/current
docker compose exec goatcounter goatcounter db migrate all -createdb
docker compose exec goatcounter goatcounter db create site -vhost=xiaolitongxue.com.cn -user.email <邮箱> -user.password <密码>
docker compose exec goatcounter goatcounter db query -format=exec "update sites set settings = json_set(json_set(json_set(settings, '$.public', 'public'), '$.allow_embed', 'xiaolitongxue.com.cn,xiaolitongxue666.github.io,127.0.0.1,http://127.0.0.1:4322,http://127.0.0.1:4321,http://localhost:4322,http://localhost:4321,http://127.0.0.1:4001,http://localhost:4001'), '$.allow_counter', json('true')) where site_id = 1;"
docker compose exec goatcounter goatcounter db query -format=exec "update sites set user_defaults = json_set(json_set(json_set(json_set(user_defaults, '$.language', 'zh-CN'), '$.theme', ''), '$.timezone', '.Asia/Shanghai'), '$.date_format', '2006-01-02') where site_id = 1;"
docker compose restart goatcounter
```

4. 管理界面 `https://xiaolitongxue.com.cn/analytics/settings/main`（亦可 SQL 一步完成上条）：
   - 开启 **Allow viewing of the statistics page**（`public`）
   - **Allowed domains**（`allow_counter`）：`xiaolitongxue666.github.io`、`xiaolitongxue.com.cn`
   - **Allow embedding**（`allow_embed`）：生产域名 + 本地 `http://localhost:4001` / `4321` / `4322`（见上方 SQL）；否则 `/stats/` iframe 会被 `frame-ancestors` 拦截

## 验收

```bash
# VPS 容器直连
curl --noproxy '*' -sf http://127.0.0.1:3002/analytics/

# 经宿主机 Nginx（公网）
curl --noproxy '*' -sf https://xiaolitongxue.com.cn/analytics/count.js

# 博客 HTML 含上报 URL
grep -q 'xiaolitongxue.com.cn/analytics/count' dist/index.html
```

## 变更记录

- **2026-07-10**：初版自托管 GoatCounter；vps_nginx `/analytics/` → `:3002`；双端共用绝对上报 URL。
- **2026-07-10**：`/stats/` 增加返回主页导航；嵌入改为静态 iframe、固定浅色，移除 `stats-embed.js` 主题同步。
- **2026-07-10**：`allow_embed` 追加 `localhost:4001`；浅/深皮肤 + `data-theme` 同步；去掉生产 `#fff` 注入（消 iframe 顶白条）。
