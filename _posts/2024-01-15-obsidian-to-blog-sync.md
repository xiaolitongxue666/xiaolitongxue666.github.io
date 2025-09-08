---
layout: default
title: "Obsidian to Blog Sync"
date: 2024-01-15 12:00:00 +0800
categories:
---

# Obsidian to Blog Sync

这个仓库包含一个自动化的GitHub Action工作流，可以将Obsidian中带有特定标签的Markdown文件自动同步到Jekyll博客。

## 项目状态

✅ **功能完整** - 所有核心功能已实现并测试通过
✅ **Git逻辑修复** - 已修复文件同步中的Git变化检测问题
✅ **图片处理** - 支持Obsidian wiki链接和标准Markdown图片格式转换
✅ **自动化测试** - 通过实际博客文章同步验证功能正常

## 功能特性

- 🔍 自动检测带有 `` 标签的Markdown文件
- 📝 智能提取文章标题和日期信息
- 🔄 自动转换为Jekyll兼容的格式
- 🖼️ 自动处理图片引用，转换Obsidian格式到Jekyll格式
- 📁 自动复制引用的图片文件到博客仓库
- 📁 保持Obsidian原有文件结构不变
- 🚀 自动推送到博客仓库

## 设置说明

### 1. 配置GitHub Secrets

#### 创建Personal Access Token

1. 访问 GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. 点击 `Generate new token (classic)`
3. 设置token名称，如：`Blog Repo Access`
4. 选择过期时间（建议选择较长时间或无过期时间）
5. 勾选以下权限：
   - `repo` (完整仓库访问权限)
   - `workflow` (工作流权限)
6. 点击 `Generate token` 并复制生成的token

#### 配置Repository Secret

1. 进入你的Obsidian仓库的 `Settings` > `Secrets and variables` > `Actions`
2. 点击 `New repository secret`
3. 添加以下secret：
   - **Name**: `BLOG_REPO_TOKEN`
   - **Secret**: 粘贴上一步生成的Personal Access Token
4. 点击 `Add secret`

### 2. 工作流触发条件

工作流会在以下情况下自动触发：
- 推送到 `main` 或 `master` 分支
- 创建Pull Request到 `main` 或 `master` 分支
- 修改的文件包含 `.md` 文件

### 3. 使用方法

1. 在Obsidian中的任意Markdown文件中添加 `` 标签
2. 提交并推送到GitHub
3. GitHub Action会自动：
   - 检测带有标签的文件
   - 提取标题和日期信息
   - 转换为Jekyll格式
   - 复制到博客仓库的 `_posts` 目录
   - 自动提交和推送

## 文件处理规则

### 标题提取
- 优先使用文件中的第一个 `# 标题`
- 如果没有找到，使用YAML front matter中的title
- 最后使用文件名作为标题

### 日期处理
- 优先使用YAML front matter中的date字段
- 尝试从文件名中提取日期（格式：YYYY-MM-DD）
- 默认使用当前日期

### 文件名生成
- 格式：`YYYY-MM-DD-标题.md`
- 自动清理特殊字符，转换空格为连字符
- 支持中文标题

### 图片处理
- **Obsidian格式转换**：`![image.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0001.png)` → `![image.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0002.png)`
- **相对路径转换**：`![image.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0003.png)` → `![image.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0004.png)`
- **自动复制图片**：将引用的图片文件复制到博客仓库的 `/assets/images/posts/` 目录
- **智能查找**：在整个Obsidian仓库中搜索引用的图片文件
- **格式支持**：支持常见图片格式（png, jpg, jpeg, gif, svg等）

## 目录结构

```
.
├── .github/
│   ├── workflows/
│   │   └── sync-blog-posts.yml    # 主工作流文件
│   └── scripts/
│       └── process-blog-posts.js  # 文件处理脚本
├── LeonLi/                         # Obsidian笔记目录
└── README.md                       # 本文件
```

## 示例

### Obsidian中的文件
```markdown
# 我的新博客文章

这是一篇关于技术的文章。

![example.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0005.png)

还可以使用Obsidian的wiki链接格式：
![screenshot.jpg](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0006.jpg)



## 内容

文章的具体内容...
```

### 转换后的Jekyll文件
```markdown
---
layout: default
title: "我的新博客文章"
date: 2024-01-15 12:00:00 +0800
categories:
---

# 我的新博客文章

这是一篇关于技术的文章。

![example.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0007.png)

还可以使用Obsidian的wiki链接格式：
![screenshot.jpg](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0008.jpg)

## 内容

文章的具体内容...
```

### 图片文件处理
- 原始图片：`LeonLi/images/example.png`
- 复制到：`博客仓库/assets/images/posts/example.png`

## 注意事项

1. **标签位置**：`` 标签可以放在文件的任意位置
2. **文件保留**：原始文件会保留在Obsidian中，不会被移动或删除
3. **重复处理**：相同的文件会被重复处理，建议在博客发布后移除标签
4. **权限要求**：确保Personal Access Token有足够的权限访问博客仓库

## 故障排除

### 常见问题

1. **工作流失败**：检查GitHub Secrets是否正确配置
2. **文件未同步**：确认文件中包含正确的标签
3. **权限错误**：验证Personal Access Token的权限设置
4. **Git变化检测问题**：如果文件复制成功但未提交，可能是Git变化检测逻辑问题

### 已知问题及解决方案

#### Git变化检测逻辑修复

**问题描述**：GitHub Action成功复制文件到博客仓库，但Git报告"No changes to commit"，导致文件未被提交。

**原因分析**：原始工作流使用`git diff --quiet`检查工作目录变化，但新复制的文件需要先执行`git add`才能被检测到。

**解决方案**：已修复工作流逻辑，将`git add`操作提前到`git diff --staged --quiet`检查之前：

```yaml
# 修复后的逻辑
- name: Commit and push changes
  run: |
    cd blog-repo
    git add _posts/ assets/images/posts/
    if ! git diff --staged --quiet; then
      git commit -m "Sync blog posts from Obsidian"
      git push
    else
      echo "No changes to commit"
    fi
```

### 查看日志

在GitHub仓库的Actions标签页中可以查看详细的执行日志。如果遇到问题，可以：

1. 检查"Sync Blog Posts"工作流的运行日志
2. 查看"Process blog posts"步骤的输出
3. 检查"Commit and push changes"步骤是否正确执行
4. 使用`gh run view <run-id>`命令查看详细日志

## Obsidian仓库图片管理规则

为了保持Obsidian仓库中图片文件的统一管理和良好的组织结构，请遵循以下规则：

### 图片存放位置

- **规则**：每个主题目录下建立独立的 `attachments` 文件夹
- **结构**：`笔记文件名/attachments/`
- **示例**：
  ```
  LeonLi/Knowledge/Programming/Programming language/Angular/
  ├── Angular Tutorial.md
  └── Angular Tutorial/
      └── attachments/
          ├── Angular Tutorial-001.png
          ├── Angular Tutorial-002.png
          └── Angular Tutorial-003.png
  ```

### 图片命名规则

- **格式**：`笔记名称-00x.图片格式`
- **编号**：从001开始，按顺序递增（001, 002, 003...）
- **示例**：
  - `Angular Tutorial-001.png`
  - `Angular Tutorial-002.jpg`
  - `代码随想录学习笔记-001.gif`

### 图片引用方式

- **优先使用**：Obsidian Wiki格式 `![图片名称](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0009)`
- **格式示例**：
  ```markdown
  ![Angular Tutorial-001.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0010.png)
  ![Angular Tutorial-002.jpg](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_0011.jpg)
  ```
- **优势**：保持与Obsidian的最佳兼容性，支持图片预览和链接跳转

### 规则说明

1. **一致性**：所有笔记的图片都应遵循相同的命名和存放规则
2. **可维护性**：清晰的命名规则便于图片管理和查找
3. **兼容性**：Wiki格式确保在Obsidian中的最佳使用体验
4. **扩展性**：支持未来的自动化处理和批量操作

### 迁移指南

如需将现有图片调整为新规则：
1. 为每个包含图片的笔记创建对应的 `attachments` 文件夹
2. 按照命名规则重命名图片文件
3. 更新笔记中的图片引用为Wiki格式
4. 验证所有图片链接正常工作

## 贡献

欢迎提交Issue和Pull Request来改进这个工作流！