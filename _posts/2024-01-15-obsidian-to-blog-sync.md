---
layout: default
title: "Obsidian to Blog Sync"
date: 2024-01-15 12:00:00 +0800
categories:
---

# Obsidian to Blog Sync

这个仓库包含一个自动化的GitHub Action工作流，可以将Obsidian中带有特定标签的Markdown文件自动同步到Jekyll博客。

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
- **Obsidian格式转换**：`![image.png](/assets/images/posts/image.png)` → `![image.png](/assets/images/posts/image.png)`
- **相对路径转换**：`![alt](/assets/images/posts/image.png)` → `![alt](/assets/images/posts/image.png)`
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

![示例图片](/assets/images/posts/example.png)

还可以使用Obsidian的wiki链接格式：
![screenshot.jpg](/assets/images/posts/screenshot.jpg)



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

![示例图片](/assets/images/posts/example.png)

还可以使用Obsidian的wiki链接格式：
![screenshot.jpg](/assets/images/posts/screenshot.jpg)

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

### 查看日志

在GitHub仓库的Actions标签页中可以查看详细的执行日志。

## 贡献

欢迎提交Issue和Pull Request来改进这个工作流！