# xiaolitongxue666 Blog

基于 Jekyll 的个人技术博客，采用简洁的 jekyll-theme-solid 主题，专注于技术分享和学习记录。

## 特性

- 🚀 **轻量级设计** - 无 JavaScript 依赖，加载速度快
- 📱 **响应式布局** - 完美适配移动端和桌面端
- 🎨 **简洁美观** - 专注内容，减少干扰
- 🔍 **SEO 优化** - 集成 jekyll-seo-tag 插件
- 📝 **Markdown 支持** - 完整的 Markdown 语法支持
- 🖼️ **图片优化** - 响应式图片和本地资源管理
- 🤖 **自动同步** - 通过 GitHub Actions 从 Obsidian 仓库自动同步内容

## 技术栈

- **静态站点生成器**: Jekyll
- **主题**: jekyll-theme-solid (定制版)
- **样式**: CSS3 + 响应式设计
- **SEO**: jekyll-seo-tag
- **部署**: GitHub Pages
- **内容管理**: Obsidian + GitHub Actions 自动同步
- **图片处理**: 自动转换和重命名系统

## 项目结构

```
├── .gitignore           # Git 忽略文件配置
├── Gemfile              # Ruby 依赖管理
├── LICENSE              # 开源许可证
├── README.md            # 项目说明文档
├── _config.yml          # Jekyll 站点配置文件
├── _includes/           # 页面组件模板
│   ├── footer.html      # 页脚组件
│   ├── header.html      # 页头组件
│   └── pagination.html  # 分页组件
├── _layouts/            # 页面布局模板
│   ├── default.html     # 默认布局（博客文章）
│   ├── page.html        # 页面布局
│   └── wiki.html        # Wiki 页面布局
├── _posts/              # 博客文章 (Markdown 格式)
│   ├── 2020-*           # 2020年文章
│   ├── 2021-*           # 2021年文章
│   ├── 2022-*           # 2022年文章
│   ├── 2023-*           # 2023年文章
│   ├── 2024-*           # 2024年文章
│   └── 2025-*           # 2025年文章
├── _wiki/               # Wiki 知识库
│   ├── markdown.md      # Markdown 语法说明
│   └── template.md      # 文章模板
├── assets/              # 静态资源文件
│   ├── css/            # 样式表文件
│   │   ├── default.css  # 默认样式
│   │   ├── small.css    # 小屏幕样式
│   │   └── syntax.css   # 代码高亮样式
│   ├── images/         # 图片资源
│   │   ├── 2020/       # 2020年图片
│   │   ├── avatar.jpg   # 头像图片
│   │   ├── black_wood.jpg # 背景图片
│   │   ├── common/     # 通用图片
│   │   ├── posts/      # 文章配图
│   │   └── thumbnails/ # 缩略图
│   └── js/             # JavaScript 文件
│       └── theme-toggle.js # 主题切换功能
├── favicon.ico          # 网站图标
├── index.html           # 首页模板
└── pages/               # 静态页面
    ├── 404.md          # 404 错误页面
    ├── about.md        # 关于页面
    ├── categories.md   # 分类页面
    ├── links.md        # 友链页面
    └── wiki.md         # Wiki 首页
```

## 本地开发

### 环境要求

- Ruby >= 2.7
- Bundler
- Jekyll

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/xiaolitongxue666/xiaolitongxue666.github.io.git
cd xiaolitongxue666.github.io
```

2. 配置Ruby环境（Windows系统）
```bash
# 添加Ruby到环境变量（根据实际安装路径调整）
export PATH="$PATH:/c/Ruby33-x64/bin"

# 验证Ruby安装
ruby --version
bundle --version
```

3. 安装依赖
```bash
bundle install
```

4. 启动本地服务器
```bash
# 使用自定义端口避免冲突
bundle exec jekyll serve --port 4001
```

5. 访问 `http://localhost:4001` 查看网站

### 常见问题

**Ruby命令未找到**
- 确保Ruby已正确安装
- 检查Ruby安装路径（通常在 `/c/Ruby33-x64/bin`）
- 使用 `export PATH="$PATH:/c/Ruby33-x64/bin"` 添加到环境变量

**端口冲突**
- 使用 `--port 4001` 参数指定其他端口
- 检查端口是否被其他服务占用

**Vite客户端错误**
- 这是浏览器缓存问题，不影响网站功能
- 可通过清除浏览器缓存或使用无痕模式解决

## 自动同步机制

本博客采用自动化内容管理系统，通过 GitHub Actions 从 Obsidian 笔记仓库自动同步博客文章和图片资源。

### 工作原理

1. **内容来源**: 博客内容来自 [obsidian_repo](https://github.com/xiaolitongxue666/obsidian_repo) 仓库
2. **触发条件**: 当 Obsidian 仓库中包含 `#xiaolitongxue666_blog` 标签的文件发生变更时自动触发
3. **智能检测**: 只处理包含博客标签的 Markdown 文件及其引用的图片
4. **格式转换**: 自动将 Obsidian 格式转换为 Jekyll 兼容格式
5. **资源管理**: 自动处理图片复制、重命名和路径更新

### 同步流程

1. **检测变更**: GitHub Actions 监控 Obsidian 仓库的文件变更
2. **内容处理**: 提取带有 `#xiaolitongxue666_blog` 标签的 Markdown 文件
3. **格式转换**: 
   - 转换文件名为 Jekyll 格式 (`YYYY-MM-DD-title.md`)
   - 添加 YAML front matter
   - 转换图片引用格式
4. **图片处理**:
   - 在 Obsidian 仓库中查找引用的图片文件
   - 按规范重命名: `article-title_NNN.ext` (3位数字编号)
   - 复制到 `/assets/images/posts/YYYY/article-directory/` 目录
5. **自动提交**: 将处理后的文件提交到博客仓库
6. **自动部署**: GitHub Pages 自动构建和部署更新

### 图片引用转换

系统自动将 Obsidian 的图片引用格式转换为 Jekyll 兼容格式：

**转换前 (Obsidian 格式)**:
```markdown
![[example.png]]
```

**转换后 (Jekyll 格式)**:
```markdown
![example](/assets/images/posts/2024/2024-01-15-article-title/article-title_001.png)
```

### 自动化优势

- **无缝写作**: 在 Obsidian 中正常写作，添加标签即可自动发布
- **格式统一**: 自动处理格式转换，确保博客格式一致性
- **资源管理**: 自动处理图片复制和重命名，避免手动操作错误
- **版本控制**: 完整的变更记录和自动提交
- **零维护**: 博客仓库无需手动维护，专注于内容创作

## 写作指南

### 创建新文章

在 `_posts` 目录下创建新文件，文件名格式：`YYYY-MM-DD-title.md`

**文件命名规则：**
- 文件名应与obsidian源文件保持一致
- 格式：`YYYY-MM-DD-源文件名.md`
- 示例：obsidian中的 `test-blog-post.md` → 博客中的 `2025-09-08-test-blog-post.md`

```markdown
---
layout: post
author: xiaoli
title: 文章标题
date: YYYY-MM-DD
categories: [分类1, 分类2]
tags: [标签1, 标签2]
---

文章内容...
```

### 图片使用

#### 图片存储规则

博客图片采用统一的命名和存储规则，确保图片资源的有序管理：

**目录结构规则：**
- 图片存储路径：`assets/images/posts/YYYY/文章目录名/`
- 年份目录：根据文章发布年份创建对应的年份目录（如 `2020/`、`2021/` 等）
- 文章目录：每篇文章对应一个独立的图片目录

**目录命名规则：**
- 普通文章：使用完整的文章文件名作为目录名
  - 示例：`2020-02-01-how-to-build-opencv_over_win10.md` → `2020-02-01-how-to-build-opencv_over_win10/`
- 系列文章：使用完整的文章标题作为目录名
  - 示例：Rust学习笔记系列 → `2020-06-25-rust学习笔记一-基础概念介绍和环境搭建/`、`2020-06-25-rust学习笔记三-Ownership/`、`2020-06-25-rust学习笔记四-Struct/`

**图片命名规则：**
- 命名格式：`{文章完整标题}_{三位数字编号}.{扩展名}`
- 编号规则：从 `001` 开始，按图片在文章中出现的顺序递增
- 示例：
  - `2020-02-01-how-to-build-opencv_over_win10_001.png`
  - `2020-06-25-rust学习笔记三-Ownership_001.png`
  - `2020-06-25-rust学习笔记四-Struct_004.png`

#### 图片引用方式

**标准引用格式：**
```markdown
![图片描述](/assets/images/posts/YYYY/文章目录名/图片文件名)
```

**实际使用示例：**
```markdown
# 普通文章图片引用
![cmake UI](/assets/images/posts/2020/2020-02-01-how-to-build-opencv_over_win10/2020-02-01-how-to-build-opencv_over_win10_001.png)

# 系列文章图片引用
![rust_ownership](/assets/images/posts/2020/2020-06-25-rust学习笔记三-Ownership/2020-06-25-rust学习笔记三-Ownership_001.png)

# 居中显示
![图片描述](/assets/images/posts/2020/文章目录/图片文件名){: .center-image }
```

#### 图片管理最佳实践

1. **一致性**：严格遵循命名规则，确保所有图片文件名都包含完整的文章标题前缀
2. **有序性**：图片编号按在文章中出现的顺序递增，便于维护和查找
3. **可读性**：图片文件名直观反映所属文章，便于批量管理
4. **扩展性**：支持多种图片格式（png、jpg、gif等），根据实际需要选择合适格式

## 部署

项目通过 GitHub Pages 自动部署，推送到 `main` 分支即可自动更新网站。

## 截图

### 首页
![home page](assets/images/common/screenshots/home.png)

### 文章页面
![post page](assets/images/common/screenshots/posts.png)

## 许可证

MIT License

## 联系方式

- GitHub: [@xiaolitongxue666](https://github.com/xiaolitongxue666)
- Email: [your-email@example.com](mailto:your-email@example.com)

---

⭐ 如果这个项目对你有帮助，请给个 Star！
