import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const outDir = process.env.E2E_OUT_DIR || 'dist';
// GitHub Pages: defaults below. VPS mirror: ASTRO_SITE + ASTRO_BASE=/blog/ (see deploy-vps.yml).
const site = process.env.ASTRO_SITE || 'https://xiaolitongxue666.github.io';
const base = process.env.ASTRO_BASE || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  outDir,
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});
