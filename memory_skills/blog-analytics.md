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

GoatCounter 启动参数：`-basepath /analytics`（与 vps_nginx `analytics.conf.tpl` 保留 URI 前缀一致）。

## 部署顺序

1. 推送博客 `master` → `deploy-vps.yml` 启动 `:3002` GoatCounter + `:3001` 静态站
2. 在 VPS 部署 vps_nginx（`PUBLIC_EXPOSE` 须含 `analytics`，公网 HTTPS 才能加载 `count.js`）
3. 首次初始化（SSH，一次性）：

```bash
cd /home/ubuntu/blog/current
docker compose exec goatcounter goatcounter db migrate
docker compose exec goatcounter goatcounter create -site.code blog -site.title "xiaolitongxue666 Blog"
docker compose exec goatcounter goatcounter create -user.name admin -user.email <邮箱> -user.password <密码>
```

4. 管理界面 `https://xiaolitongxue.com.cn/analytics/settings/main`：
   - 开启 **Allow viewing of the statistics page**
   - **Allowed domains**：`xiaolitongxue666.github.io`、`xiaolitongxue.com.cn`

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
