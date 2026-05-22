import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface WikiPage {
  filename: string;
  title: string;
  url: string;
  slug: string;
  content: string;
  categories: string[];
  description?: string;
  keywords?: string[];
}

const WIKI_DIR = path.join(process.cwd(), '_wiki');

export function getAllWikiPages(): WikiPage[] {
  if (!fs.existsSync(WIKI_DIR)) {
    return [];
  }

  return fs
    .readdirSync(WIKI_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(WIKI_DIR, filename), 'utf8');
      const { data, content } = matter(raw);

      return {
        filename,
        title: String(data.title ?? slug),
        url: `/wiki/${slug}/`,
        slug,
        content,
        categories: Array.isArray(data.categories)
          ? data.categories.map(String)
          : data.categories
            ? [String(data.categories)]
            : [],
        description: data.description ? String(data.description) : undefined,
        keywords: Array.isArray(data.keywords)
          ? data.keywords.map(String)
          : data.keywords
            ? String(data.keywords).split(',').map((item) => item.trim())
            : undefined,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getWikiPage(slug: string): WikiPage | undefined {
  return getAllWikiPages().find((page) => page.slug === slug);
}
