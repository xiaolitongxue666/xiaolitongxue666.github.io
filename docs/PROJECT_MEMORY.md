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

## 命名

- 新文章（同步）：`YYYY-MM-DD-{sanitizeFilename(笔记名)}.md`
- layout：`default`
- 图片：`assets/images/posts/{Y}/{date}-{slug}/{date}-{slug}_NNN.ext`

## E2E 命令

```bash
node .github/scripts/e2e/run-publish-e2e.js
BLOG_REPO_DIR=/path/to/blog node .github/scripts/e2e/run-sync-e2e.js  # obsidian 侧
```

## Agent 规则文件

- 博客：`.cursor/rules/blog-project.mdc`、`AGENTS.md`
- Obsidian：`.cursor/rules/blog-sync.mdc`、`CLAUDE.md`

## 最后验证（2026-05-22）

本地通过：jekyll build、run-publish-e2e、run-sync-e2e、verify-live(/about/)。
