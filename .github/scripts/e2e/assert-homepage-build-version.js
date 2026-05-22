#!/usr/bin/env node
/**
 * Assert homepage build-version badge: commit id, date, and fixed bottom-right positioning.
 */

const fs = require('fs');
const path = require('path');

function assertHomepageBuildVersion(options = {}) {
  const repoRoot = options.repoRoot || path.resolve(__dirname, '../../..');
  const siteDir = options.siteDir || path.join(repoRoot, 'dist');
  const indexPath = path.join(siteDir, 'index.html');
  const cssPath = path.join(repoRoot, 'assets/css/default.css');

  const report = {
    pass: true,
    errors: []
  };

  if (!fs.existsSync(indexPath)) {
    report.pass = false;
    report.errors.push(`Homepage not found: ${indexPath}`);
    return report;
  }

  const html = fs.readFileSync(indexPath, 'utf8');

  if (!html.includes('class="build-version"')) {
    report.pass = false;
    report.errors.push('Missing .build-version element on homepage');
  }

  if (!/class="build-version-id">v[0-9a-f]{7,}/.test(html)) {
    report.pass = false;
    report.errors.push('Missing build-version-id (expected v + commit hash)');
  }

  if (!/class="build-version-date">\d{4}-\d{2}-\d{2}/.test(html)) {
    report.pass = false;
    report.errors.push('Missing build-version-date (expected YYYY-MM-DD)');
  }

  const hasInlineFixed = /class="build-version"[^>]*style="[^"]*position:\s*fixed/i.test(html)
    || /class="build-version"[^>]*style='[^']*position:\s*fixed/i.test(html);
  const cssHasBuildVersion = fs.existsSync(cssPath)
    && /\.build-version\s*\{/.test(fs.readFileSync(cssPath, 'utf8'));

  if (!hasInlineFixed && !cssHasBuildVersion) {
    report.pass = false;
    report.errors.push('No fixed positioning for .build-version (inline style or default.css)');
  }

  return report;
}

function printReport(report) {
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) {
    for (const err of report.errors) {
      console.error(`E2E ASSERT FAIL: ${err}`);
    }
    process.exit(1);
  }
  console.log('E2E assert-homepage-build-version: PASS');
}

if (require.main === module) {
  const repoRoot = process.env.E2E_REPO_ROOT || path.resolve(__dirname, '../../..');
  const siteDir = process.env.E2E_SITE_DIR || path.join(repoRoot, 'dist');
  printReport(assertHomepageBuildVersion({ repoRoot, siteDir }));
}

module.exports = { assertHomepageBuildVersion };
