import { withBase } from './base';

const DEFAULT_ANALYTICS_ORIGIN = 'https://xiaolitongxue.com.cn/analytics';

function resolveAnalyticsOrigin(): string {
  const raw = import.meta.env.PUBLIC_ANALYTICS_ORIGIN || DEFAULT_ANALYTICS_ORIGIN;
  return String(raw).replace(/\/+$/, '');
}

function isLoopbackAnalyticsOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === '127.0.0.1' || host === 'localhost';
  } catch {
    return false;
  }
}

const analyticsOrigin = resolveAnalyticsOrigin();
const analyticsAllowLocal = isLoopbackAnalyticsOrigin(analyticsOrigin);

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
  analytics: {
    origin: analyticsOrigin,
    countEndpoint: `${analyticsOrigin}/count`,
    countScript: `${analyticsOrigin}/count.js`,
    publicStatsUrl: `${analyticsOrigin}/?hideui=1`,
    /** GoatCounter count.js skips 127.0.0.1/localhost unless allow_local. */
    allowLocal: analyticsAllowLocal,
  },
} as const;
