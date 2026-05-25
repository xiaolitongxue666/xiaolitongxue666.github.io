import { withBase } from './base';

export const SITE = {
  url: import.meta.env.SITE,
  title: 'xiaolitongxue666 Blog',
  description: '技术分享与学习笔记 - 专注于编程、系统架构和开发工具',
  author: {
    name: 'xiaolitongxue666',
    github: 'xiaolitongxue666',
    avatar: withBase('/assets/images/avatar.jpg'),
  },
  seo: {
    type: 'Person',
    name: 'xiaolitongxue666',
    links: ['https://github.com/xiaolitongxue666'],
  },
  repository: 'xiaolitongxue666/xiaolitongxue666.github.io',
} as const;
