import { remark } from 'remark';
import remarkGemoji from 'remark-gemoji';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeShiki from '@shikijs/rehype';
import rehypeMermaid from 'rehype-mermaid';
import rehypeStringify from 'rehype-stringify';

export async function renderMarkdown(source: string): Promise<string> {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkGemoji)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeMermaid, { strategy: 'inline-svg' })
    .use(rehypeShiki, {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);

  return String(file);
}
