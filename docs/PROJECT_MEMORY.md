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
- **sync E2E**（obsidian 侧）：`BLOG_REPO_DIR` 指向真实博客路径；CI 已通过，artifact 已移除
- **本地 vs CI**：本地可能有全局 gems，CI 为干净 runner；以 `run-ci-parity.sh` 为准

## 首页版本号

- 模板：`_includes/build-version.html`（仅首页 `/`）
- 线上：`site.github.build_revision` + `site.github.pushed_at`（需 `_config.yml` 的 `repository:`）
- 本地 fallback：`_data/build.yml`，由 `.github/scripts/update-build-info.sh` 生成
- CI：`jekyll-build.yml` 在 build 前调用 `update-build-info.sh`

## Agent 规则文件

- 博客：`.cursor/rules/blog-project.mdc`、`AGENTS.md`
- Obsidian：`.cursor/rules/blog-sync.mdc`、`docs/PROJECT_MEMORY.md`、`CLAUDE.md`

## 最后验证（2026-05-22）

- 本地：run-ci-parity、run-sync-e2e、首页 build-version 预览（`:4001`）
- CI 全绿：Jekyll Build `26294600052`、E2E Publish `26294601409`、E2E Sync `26294599784`
- Pages 部署不受 E2E workflow 失败影响（内置 `pages build and deployment` 独立）
