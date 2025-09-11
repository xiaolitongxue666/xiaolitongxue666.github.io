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
- 修改的文件包含：
  - 带有 `` 标签的 `.md` 文件
  - 被这些博客文章引用的图片文件

**智能检测机制**：工作流会自动检测变更的文件是否与博客内容相关，只有相关变更才会执行同步操作，避免不必要的资源消耗。

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
- **Obsidian格式转换**：`![image.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_001.png)` → `![image](/assets/images/posts/YYYY/article-dir/article-title_001.png)`
- **路径规范化**：自动生成符合Jekyll规范的图片路径
- **自动复制图片**：将引用的图片文件复制到博客仓库的 `/assets/images/posts/YYYY/article-directory/` 目录
- **智能重命名**：图片文件按 `article-title_NNN.ext` 格式重命名（3位数字编号）
- **智能查找**：在整个Obsidian仓库中搜索引用的图片文件
- **格式支持**：支持常见图片格式（png, jpg, jpeg, gif, svg等）
- **目录结构**：按年份和文章目录组织图片文件

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

![example.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_002.png)

还可以使用Obsidian的wiki链接格式：
![screenshot.jpg](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_003.jpg)



## 内容

文章的具体内容...
```

### 转换后的Jekyll文件
```markdown
# 我的新博客文章

这是一篇关于技术的文章。

![example](/assets/images/posts/2024/2024-01-15-我的新博客文章/我的新博客文章_001.png)

还可以使用Obsidian的wiki链接格式：
![screenshot](/assets/images/posts/2024/2024-01-15-我的新博客文章/我的新博客文章_002.jpg)

## 内容

文章的具体内容...
```

### 图片文件处理
- 原始图片：`LeonLi/images/example.png`
- 复制到：`博客仓库/assets/images/posts/2024/2024-01-15-我的新博客文章/我的新博客文章_001.png`
- 原始图片：`LeonLi/attachments/screenshot.jpg`
- 复制到：`博客仓库/assets/images/posts/2024/2024-01-15-我的新博客文章/我的新博客文章_002.jpg`

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

- **优先使用**：Obsidian Wiki格式 `![图片名称](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_004)`
- **格式示例**：
  ```markdown
  ![Angular Tutorial-001.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_005.png)
  ![Angular Tutorial-002.jpg](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_006.jpg)
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

## GitHub Actions 技术详解

### 工作流触发机制

#### 触发条件详细说明

**Push 事件触发**：
- **目标分支**: `main` 或 `master` 分支
- **路径监控**: 监控以下类型文件的变化
  - 所有 Markdown 文件 (`**/*.md`)
  - 所有 images 目录下的文件 (`**/images/**`)
  - LeonLi/images 目录下的文件 (`LeonLi/images/**`)
- **智能过滤**: 工作流启动后会进一步检测变更文件是否与博客相关

**Pull Request 事件触发**：
- **目标分支**: 针对 `main` 或 `master` 分支的 PR
- **路径监控**: 与 Push 事件相同的文件类型监控
- **智能过滤**: 同样进行博客相关性检测

### 工作流执行流程

#### 第一阶段：环境准备
1. **代码检出**: 使用 `actions/checkout@v4` 检出 Obsidian 仓库
2. **Node.js 环境**: 设置 Node.js 18 运行环境
3. **依赖准备**: 为后续脚本执行做准备

#### 第二阶段：智能变更检测
**检测逻辑**：
- 获取变更文件列表（区分 Push 和 PR 事件）
- 扫描仓库中所有包含 `` 标签的 Markdown 文件
- 提取这些博客文章中引用的所有图片路径
- 精确判断变更文件是否与博客相关：
  - 变更的 Markdown 文件是否包含 `` 标签
  - 变更的图片文件是否被带有博客标签的文章引用
- 只有满足上述条件的变更才会触发后续处理流程

**优化机制**：
- 避免处理无关的 Markdown 文件和图片文件
- 支持复杂的图片引用关系检测和匹配
- 大幅减少不必要的资源消耗和执行时间

#### 第三阶段：内容处理与转换
**博客文章处理** (`process-blog-posts.js`)：

1. **文件发现**：
   - 递归扫描所有 Markdown 文件
   - 过滤包含 `` 标签的文件

2. **元数据提取**：
   - **标题提取**: 优先级 `# 标题` > YAML front matter > 文件名
   - **日期提取**: 优先级 YAML front matter > 文件名模式 > 当前日期

3. **内容转换**：
   - **文件名规范化**: 转换为 Jekyll 格式 `YYYY-MM-DD-title.md`
   - **图片路径转换**: 
     - Obsidian Wiki 链接 `![image.png](/assets/images/posts/2024/2024-01-15-obsidian-to-blog-sync/2024-01-15-obsidian-to-blog-sync_007.png)` → Jekyll 格式
     - 相对路径图片 → 绝对路径格式
     - 路径模式: `/assets/images/posts/YYYY/article-directory/article-title_NNNN.ext`
   - **标签清理**: 移除 `` 标签
   - **Front Matter 生成**: 添加 Jekyll 兼容的 YAML 头部

#### 第四阶段：文件同步
**博客仓库操作**：
1. **仓库检出**: 检出目标博客仓库 `xiaolitongxue666/xiaolitongxue666.github.io`
2. **文件复制**: 
   - Markdown 文件 → `_posts/` 目录
   - 图片文件 → `/assets/images/posts/YYYY/article-directory/` 目录
3. **图片处理**：
   - 智能查找原始图片文件
   - 按规范重命名图片文件
   - 维护正确的目录结构

#### 第五阶段：版本控制
**Git 操作流程**：
1. 配置 Git 用户信息
2. 添加变更文件到暂存区 (`git add`)
3. 检查暂存区变更 (`git diff --staged --quiet`)
4. 条件性提交和推送
5. 生成带时间戳的提交信息

### 核心技术特性

#### 智能检测机制
- **路径过滤**: 只监控相关文件类型变更
- **内容分析**: 深度检测博客标签和图片引用关系
- **变更关联**: 智能判断文件变更与博客内容的关联性

#### 内容转换引擎
- **格式转换**: Obsidian → Jekyll 无缝转换
- **路径重写**: 自动处理图片路径和文件引用
- **元数据处理**: 智能提取和生成文章元信息

#### 文件管理系统
- **目录规范**: 遵循 Jekyll 博客的标准目录结构
- **命名规范**: 自动生成符合规范的文件名
- **资源管理**: 统一管理图片和附件资源

#### 错误处理与监控
- **状态检查**: 每个步骤都有完整的状态验证
- **条件执行**: 基于前置条件的智能执行控制
- **日志输出**: 详细的执行日志和状态报告

### 性能优化

- **按需执行**: 只在相关文件变更时触发
- **增量处理**: 只处理变更的相关文件
- **资源复用**: 高效的文件操作和 Git 管理
- **并行处理**: 支持多文件并行处理

### 安全机制

- **Token 管理**: 使用 GitHub Secrets 安全存储访问令牌
- **权限控制**: 最小权限原则的仓库访问
- **路径验证**: 防止路径遍历和恶意文件操作

## 贡献

欢迎提交Issue和Pull Request来改进这个工作流！