import rss from '@astrojs/rss';
import { getAllPosts } from '../lib/posts';
import { SITE } from '../lib/site';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = getAllPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site?.href ?? SITE.url,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.date,
      link: post.url,
      description: post.title,
    })),
    customData: `<language>zh-cn</language>`,
  });
};
