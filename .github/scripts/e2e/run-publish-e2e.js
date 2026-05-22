#!/usr/bin/env node
/**
 * E2E: Direct blog post fixture -> isolated Jekyll build -> assert _site.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { assertBuiltSite } = require('./assert-built-site');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const FIXTURES_DIR = path.join(REPO_ROOT, '.github/e2e/fixtures');
const STAGING_DIR = path.join(REPO_ROOT, '.e2e-staging');
const EXPECTED_PATH = path.join(FIXTURES_DIR, 'expected/e2e-direct-post.json');

function rimraf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyMinimalSite() {
  rimraf(STAGING_DIR);
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  const copyList = [
    '_config.yml',
    '_config.e2e.yml',
    'Gemfile',
    'index.html',
    '_includes',
    '_layouts',
    'pages',
    'assets'
  ];

  for (const item of copyList) {
    const src = path.join(REPO_ROOT, item);
    const dest = path.join(STAGING_DIR, item);
    if (!fs.existsSync(src)) continue;
    fs.cpSync(src, dest, { recursive: true });
  }

  fs.mkdirSync(path.join(STAGING_DIR, '_posts'), { recursive: true });
  fs.copyFileSync(
    path.join(FIXTURES_DIR, 'e2e-direct-post.md'),
    path.join(STAGING_DIR, '_posts', '2026-05-22-e2e-direct-post.md')
  );
}

function main() {
  const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf8'));
  copyMinimalSite();

  execSync('bundle exec jekyll build --trace --config _config.yml,_config.e2e.yml', {
    cwd: STAGING_DIR,
    stdio: 'inherit'
  });

  const report = assertBuiltSite({
    siteDir: path.join(STAGING_DIR, '_site-e2e'),
    sourceDir: STAGING_DIR,
    marker: expected.marker,
    permalinkPattern: expected.permalinkPattern
  });

  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) {
    for (const err of report.errors) {
      console.error(`E2E PUBLISH FAIL: ${err}`);
    }
    process.exit(1);
  }
  console.log('E2E run-publish-e2e: PASS');
}

main();
