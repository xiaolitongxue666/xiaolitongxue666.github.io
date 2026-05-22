import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface Post {
  filename: string;
  title: string;
  date: Date;
  url: string;
  year: string;
  month: string;
  day: string;
  slug: string;
  categories: string[];
  tags: string[];
  content: string;
  layout?: string;
}

const POSTS_DIR = path.join(process.cwd(), '_posts');

export function filenameToPermalink(filename: string): string {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (!match) {
    throw new Error(`Invalid post filename: ${filename}`);
  }
  const [, year, month, day, slug] = match;
  return `/${year}/${month}/${day}/${slug}/`;
}

function parseCategories(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return [raw.trim()];
  }
  return [];
}

function parseTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean);
  }
  return [];
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
      const { data, content } = matter(raw);
      const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
      if (!match) {
        throw new Error(`Invalid post filename: ${filename}`);
      }
      const [, year, month, day, slug] = match;

      return {
        filename,
        title: String(data.title ?? slug),
        date: new Date(data.date ?? `${year}-${month}-${day}`),
        url: filenameToPermalink(filename),
        year,
        month,
        day,
        slug,
        categories: parseCategories(data.categories),
        tags: parseTags(data.tags),
        content,
        layout: data.layout ? String(data.layout) : undefined,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getPostBySlugParts(
  year: string,
  month: string,
  day: string,
  slug: string,
): Post | undefined {
  const url = `/${year}/${month}/${day}/${slug}/`;
  return getAllPosts().find((post) => post.url === url);
}

export function getPostIndex(post: Post, posts: Post[] = getAllPosts()): number {
  return posts.findIndex((item) => item.url === post.url);
}

export function getCategories(): Map<string, Post[]> {
  const categories = new Map<string, Post[]>();
  for (const post of getAllPosts()) {
    for (const category of post.categories) {
      const list = categories.get(category) ?? [];
      list.push(post);
      categories.set(category, list);
    }
  }
  return categories;
}
