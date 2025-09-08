# xiaolitongxue666 Blog

基于 Jekyll 的个人技术博客，采用简洁的 jekyll-theme-solid 主题，专注于技术分享和学习记录。

## 特性

- 🚀 **轻量级设计** - 无 JavaScript 依赖，加载速度快
- 📱 **响应式布局** - 完美适配移动端和桌面端
- 🎨 **简洁美观** - 专注内容，减少干扰
- 🔍 **SEO 优化** - 集成 jekyll-seo-tag 插件
- 📝 **Markdown 支持** - 完整的 Markdown 语法支持
- 🖼️ **图片优化** - 响应式图片和本地资源管理

## 技术栈

- **静态站点生成器**: Jekyll
- **主题**: jekyll-theme-solid (定制版)
- **样式**: CSS3 + 响应式设计
- **SEO**: jekyll-seo-tag
- **部署**: GitHub Pages

## 项目结构

```
├── _config.yml          # Jekyll 配置文件
├── _includes/           # 页面组件
├── _layouts/            # 页面布局
├── _posts/              # 博客文章
├── assets/              # 静态资源
│   ├── css/            # 样式文件
│   ├── images/         # 图片资源
│   └── js/             # JavaScript 文件
├── Gemfile             # Ruby 依赖
└── README.md           # 项目说明
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

2. 安装依赖
```bash
bundle install
```

3. 启动本地服务器
```bash
bundle exec jekyll serve
```

4. 访问 `http://localhost:4000` 查看网站

## 写作指南

### 创建新文章

在 `_posts` 目录下创建新文件，文件名格式：`YYYY-MM-DD-title.md`

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

- 将图片放在 `assets/images/YYYY/` 目录下
- 在文章中使用相对路径引用：`![描述](/assets/images/2024/image.png)`
- 居中显示：`![描述](/assets/images/2024/image.png){: .center-image }`

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
