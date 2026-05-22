# 问题与解决方案

本文档归纳博客双仓库项目在优化与 E2E 测试过程中遇到的问题及处理方式。架构与 CI 见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 博客仓库（xiaolitongxue666.github.io）

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| README 与代码不一致 | 文档沿用旧主题说明 | 修正：`layout: default`（非 `post`）、部署分支 `master`、JS 文件存在、图片路径为 `assets/images/posts/` |
| 评论系统无效且凭证暴露 | `_config.yml` 配置了 disqus/gitment/gitalk，但 layout/include 未引用 | 删除整块评论配置；勿重新加入未接入模板的 OAuth 凭证 |
| `_layouts/wiki.html` 冗余 | 与 `page.html` 完全相同 | 删除 `wiki.html`，`_wiki/*.md` 改用 `layout: page` |
| favicon 404 | `header.html` 引用不存在的 `favicon.ico` | 改用 `assets/images/avatar.jpg` 作为站点图标 |
| 浮动按钮「回到分页」跳转错误 | JS 用硬编码年份/heuristic 估算页码 | 在 `default.html` 构建时注入 `meta[name=pagination-page]`；`posts_per_page` 须与 `_config.yml` 的 `paginate` 一致（10） |
| OpenCV 文章图片不显示 | 目录名 `opencv_over-win10` 与正文引用 `opencv_over_win10` 不一致 | 修正 Markdown 内图片路径以匹配实际目录；**勿**重命名 `_posts` 文件（会破坏 permalink） |
| about 页内容错误 | 仍为 jekyll-theme-solid 原作者信息 | 更新 `pages/about.md` 为 xiaolitongxue666 个人信息 |
| Gemfile 冗余依赖 | 单独声明 `jekyll-seo-tag`，`github-pages` 已包含 | 仅保留 `gem 'github-pages'` |
| 无构建校验 CI | 仅依赖 GitHub Pages 内置构建 | 新增 `.github/workflows/jekyll-build.yml` + E2E 脚本 |
| 首页无部署版本信息 | 无法从页面确认当前构建 commit | 首页右下角 `build-version`：GitHub Pages 用 `site.github.build_revision` + `pushed_at`；本地 fallback `_data/build.yml`（`update-build-info.sh` 生成） |

## Obsidian 仓库（obsidian_repo）

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| PR 误推送到博客仓库 | `sync-blog-posts.yml` 在 `pull_request` 事件也执行 push | push/commit 步骤增加 `if: github.event_name == 'push'`；PR 仅预览 + Jekyll build |
| 变更检测重复 | workflow shell 层与 `process-blog-posts.js` 内 Git diff 逻辑重叠 | 移除 workflow shell 层检测，统一由脚本负责 |
| E2E 同步图片路径错误 | `sync-images.js` 硬编码 `TARGET_REPO_DIR=./blog-repo` | 支持 `E2E_BLOG_REPO_DIR` / `BLOG_REPO_DIR` 环境变量 |
| E2E fixture 未被处理 | Git diff 过滤跳过临时目录中的笔记 | `process-blog-posts.js` 支持 `E2E_FORCE_FULL_SCAN=true` 与 `E2E_CONTENT_ROOT` |
| obsidian-to-blog-sync 文章标签显示为空 | Markdown 中 `` 占位符损坏 | 替换为 `#xiaolitongxue666_blog`；批量替换时注意勿破坏 ` ``` ` 代码块 |

## E2E 测试

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 本地 sync E2E 图片断言失败 | 图片复制到 obsidian 下的 `./blog-repo` 而非真实博客路径 | 运行前设置 `BLOG_REPO_DIR=/path/to/xiaolitongxue666.github.io` |
| 生产 `_posts` 被 E2E 污染 | 测试产物写入博客仓库 | E2E 使用 `_config.e2e.yml` 输出到 `_site-e2e`；fixture 在 `.e2e-staging` 隔离构建 |
| 本地 publish E2E 过、CI 挂 | staging 目录无 bundle，本地有缓存/全局 gems | staging 内 build 时设置 `BUNDLE_GEMFILE` 指向仓库根 `Gemfile`；合并前跑 `run-ci-parity.sh` |
| CI 红但 E2E 逻辑已通过 | artifact 配额满导致 upload 失败 | 已移除 routine artifact；E2E 以脚本 exit code 为准 |
| `--source .e2e-staging` 从根目录 build 失败 | Jekyll 将绝对路径 config 与 source 错误拼接，layout 404 | 保持 staging 内 `cwd` build + `BUNDLE_GEMFILE` 指向根目录（勿用绝对路径 `--config`） |
| 线上 live 验证失败 | 对应文章尚未 push/部署 | 先完成 sync/push，再用 `workflow_dispatch` + `live_verify=true`；HTTP 验证带重试 |

## 不可违反的约束

- **禁止**批量重命名已有 `_posts/`（permalink 由文件名 slug 决定）
- **禁止**修改 `permalink`、`url`、GitHub Pages 部署分支（`master`）
- Obsidian 同步 **仅** 在 `push` 事件写入博客仓库
- 合并前本地执行：`bash .github/scripts/e2e/run-ci-parity.sh`（含 `update-build-info.sh` + jekyll build + publish E2E）

## 本地验证命令

```bash
# 博客生产构建 + CI 等价 E2E（合并前推荐）
bash .github/scripts/e2e/run-ci-parity.sh

# 刷新首页版本 fallback 数据（_data/build.yml）
bash .github/scripts/update-build-info.sh

# 或分步执行
bundle exec jekyll build --trace
node .github/scripts/e2e/run-publish-e2e.js

# Obsidian 同步 E2E
cd obsidian_repo
BLOG_REPO_DIR=/path/to/xiaolitongxue666.github.io node .github/scripts/e2e/run-sync-e2e.js
```
