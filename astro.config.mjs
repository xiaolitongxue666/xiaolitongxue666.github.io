import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const outDir = process.env.E2E_OUT_DIR || 'dist';

export default defineConfig({
  site: 'https://xiaolitongxue666.github.io',
  trailingSlash: 'always',
  outDir,
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});
