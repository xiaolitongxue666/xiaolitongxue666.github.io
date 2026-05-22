# 项目 Memory（Agent 可读）

跨会话持久化要点，详细说明见 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 与 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 双仓库

| 仓库 | 分支 | 角色 |
|------|------|------|
| `xiaolitongxue666.github.io` | master | Jekyll 站点 + GitHub Pages |
| `obsidian_repo` | master | Obsidian 笔记 + 同步 CI |

## 发布路径

1. **Obsidian**：`#xiaolitongxue666_blog` → `sync-blog-posts.yml` → push `_posts/` + 图片
2. **直写**：编辑博客 `_posts/` → push → `jekyll-build.yml` + Pages

## 禁止操作

- 重命名已有 `_posts/`（破坏 permalink）
- 改 `permalink` / `url` / 部署分支
- Obsidian PR 事件 push 到博客
- 恢复未接入模板的评论/OAuth 配置
- 在 E2E workflow 中恢复 routine `upload-artifact`（免费配额易满）

## 命名

- 新文章（同步）：`YYYY-MM-DD-{sanitizeFilename(笔记名)}.md`
- layout：`default`
- 图片：`assets/images/posts/{Y}/{date}-{slug}/{date}-{slug}_NNN.ext`

## E2E 与 CI 要点

- **合并前**：`bash .github/scripts/e2e/run-ci-parity.sh`（非仅 `node run-publish-e2e.js`）
- **publish E2E**：staging 内 build 必须设 `BUNDLE_GEMFILE` 指向仓库根 `Gemfile`
- **homepage 断言**：`assert-homepage-build-version.js` 检查版本 id、日期、fixed 定位
- **sync E2E**（obsidian 侧）：`BLOG_REPO_DIR` 指向真实博客路径；CI 已通过，artifact 已移除
- **本地 vs CI**：本地可能有全局 gems，CI 为干净 runner；以 `run-ci-parity.sh` 为准

## 首页版本号（build-version）

- 模板：`_includes/build-version.html`（仅首页 `/`）
- **commit**：Pages → `site.github.build_revision`；本地 → `_data/build.yml`
- **date**：`_data/build.yml`（**勿依赖 `site.github.pushed_at`**，该字段不可用）；最后兜底 `site.time`
- **定位**：inline `position:fixed;right:20px` + `default.css`；无 CSS 时会退化为页面底部左对齐
- 合并前：`update-build-info.sh` 刷新并**提交** `_data/build.yml`
- CI：`jekyll-build.yml` / `run-ci-parity.sh` 在 build 前调用 `update-build-info.sh`

## Agent 规则文件

- 博客：`.cursor/rules/blog-project.mdc`、`AGENTS.md`
- Obsidian：`.cursor/rules/blog-sync.mdc`、`docs/PROJECT_MEMORY.md`、`CLAUDE.md`

## 最后验证（2026-05-22）

- 本地：`run-ci-parity.sh` PASS（含 homepage build-version 断言）
- 修复：首页版本号 date 回退 + inline fixed 定位（见 TROUBLESHOOTING 表）
