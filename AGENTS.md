# AGENTS.md — 博客仓库 AI 助手指南

Jekyll 静态博客，部署于 GitHub Pages（`master` 分支）。内容可来自 Obsidian 自动同步或直接编辑 `_posts/`。

## 必读文档

| 文档 | 用途 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 双仓库架构、CI、命名规范、E2E |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 已知问题与解决方案 |
| [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md) | 跨会话 Agent 要点 |
| [README.md](README.md) | 本地开发与写作指南 |

## 关键事实（避免重复犯错）

- 文章 layout：**`default`**（不存在 `_layouts/post.html`）
- 部署分支：**`master`**（非 `main`）
- Permalink：`/:year/:month/:day/:title/` — **禁止**重命名已发布 `_posts` 文件
- 分页：`paginate: 10`；`default.html` 与 `floating-buttons.js` 须保持一致
- Favicon：使用 `assets/images/avatar.jpg`，无根目录 `favicon.ico`
- Wiki 页：使用 `layout: page`（已合并原 `wiki.html`）
- 无评论系统：勿在 `_config.yml` 恢复 disqus/gitalk 等未接入配置
- 首页版本号：仅 `/` 显示；依赖 `repository:` + `jekyll-github-metadata`；勿删除 `_includes/build-version.html`

## 构建与测试

```bash
bundle install
bundle exec jekyll serve --port 4001
bash .github/scripts/e2e/run-ci-parity.sh   # 合并前推荐（含 build + E2E）
bash .github/scripts/update-build-info.sh   # 刷新 _data/build.yml
```

## E2E 陷阱

- `run-publish-e2e.js` 在 `.e2e-staging/` 内 build 时须设置 `BUNDLE_GEMFILE` 指向仓库根
- 勿用 `--source .e2e-staging` + 绝对路径 `--config`（layout 路径会错）
- E2E 不依赖 `upload-artifact`；PASS/FAIL 看脚本 exit code

## 关联仓库

- **obsidian_repo**：内容源，`.github/workflows/sync-blog-posts.yml` 同步到本仓库
- Secret（obsidian 侧，仅存 GitHub Secrets）：`BLOG_REPO_TOKEN` — **勿提交 token 到仓库**

## 修改前检查

1. 是否影响现有文章 URL？
2. 是否需同步更新 `docs/` 与 Obsidian 侧文档？
3. 变更 `_posts/` 或 layout 后是否运行 `run-ci-parity.sh`？

## Cursor 规则

- `.cursor/rules/blog-project.mdc`（`alwaysApply: true`）
