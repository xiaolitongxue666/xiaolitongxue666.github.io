#!/usr/bin/env node
/**
 * Assert Jekyll _site output: marker text, optional permalink path, image src paths.
 */

const fs = require('fs');
const path = require('path');

function walkHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkHtmlFiles(fullPath, files);
    } else if (entry.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeSitePath(urlPath) {
  if (!urlPath) return null;
  let p = urlPath.split('?')[0].split('#')[0];
  if (p.startsWith('http')) {
    try {
      p = new URL(p).pathname;
    } catch (_) {
      return null;
    }
  }
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return p;
}

function resolveAssetPath(siteDir, sourceDir, src) {
  if (!src || src.startsWith('http')) {
    return { exists: true, skipped: true };
  }
  const clean = src.replace(/^\//, '');
  const siteCandidate = path.join(siteDir, clean);
  if (fs.existsSync(siteCandidate)) {
    return { exists: true, resolved: siteCandidate };
  }
  if (sourceDir) {
    const sourceCandidate = path.join(sourceDir, clean);
    if (fs.existsSync(sourceCandidate)) {
      return { exists: true, resolved: sourceCandidate };
    }
  }
  return { exists: false, resolved: siteCandidate };
}

function findHtmlByPermalink(htmlFiles, siteDir, permalinkPattern) {
  const normalized = normalizeSitePath(permalinkPattern);
  if (!normalized) return null;
  const rel = normalized.replace(/^\//, '').replace(/\/$/, '');
  const direct = path.join(siteDir, rel, 'index.html');
  if (fs.existsSync(direct)) {
    return direct;
  }
  return htmlFiles.find((file) => {
    const relPath = path.relative(siteDir, file).split(path.sep).join('/');
    return relPath === `${rel}/index.html` || relPath === `${rel}.html`;
  }) || null;
}

function assertBuiltSite(options) {
  const {
    siteDir,
    sourceDir = null,
    marker,
    permalinkPattern = null,
    imagePathPattern = null
  } = options;

  const report = {
    pass: true,
    errors: [],
    markerFound: false,
    permalinkMatched: null,
    imageChecked: null
  };

  if (!fs.existsSync(siteDir)) {
    report.pass = false;
    report.errors.push(`Site directory not found: ${siteDir}`);
    return report;
  }

  const htmlFiles = walkHtmlFiles(siteDir);
  if (htmlFiles.length === 0) {
    report.pass = false;
    report.errors.push(`No HTML files under ${siteDir}`);
    return report;
  }

  let markerFile = null;
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(marker)) {
      markerFile = file;
      report.markerFound = true;
      break;
    }
  }

  if (!report.markerFound) {
    report.pass = false;
    report.errors.push(`Marker not found in _site: ${marker}`);
  }

  if (permalinkPattern) {
    const matched = findHtmlByPermalink(htmlFiles, siteDir, permalinkPattern);
    report.permalinkMatched = matched;
    if (!matched) {
      report.pass = false;
      report.errors.push(`Permalink not found in _site: ${permalinkPattern}`);
    } else {
      const content = fs.readFileSync(matched, 'utf8');
      if (!content.includes(marker)) {
        report.pass = false;
        report.errors.push(`Permalink page missing marker: ${permalinkPattern}`);
      }
    }
  }

  if (imagePathPattern && markerFile) {
    const html = fs.readFileSync(markerFile, 'utf8');
    const imgMatch = html.match(new RegExp(`src=["'](${imagePathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})["']`));
    if (!imgMatch) {
      const generic = html.match(/src="(\/assets\/images\/posts\/[^"]+)"/);
      if (!generic) {
        report.pass = false;
        report.errors.push(`Expected image path not found: ${imagePathPattern}`);
      } else {
        report.imageChecked = generic[1];
      }
    } else {
      report.imageChecked = imgMatch[1];
    }

    if (report.imageChecked) {
      const asset = resolveAssetPath(siteDir, sourceDir, report.imageChecked);
      if (!asset.exists && !asset.skipped) {
        report.pass = false;
        report.errors.push(`Image asset missing: ${report.imageChecked}`);
      }
    }
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
  console.log('E2E assert-built-site: PASS');
}

if (require.main === module) {
  const siteDir = process.env.E2E_SITE_DIR || '_site-e2e';
  const sourceDir = process.env.E2E_SOURCE_DIR || '.';
  const marker = process.env.E2E_MARKER;
  const permalinkPattern = process.env.E2E_PERMALINK || null;
  const imagePathPattern = process.env.E2E_IMAGE_PATH || null;

  if (!marker) {
    console.error('E2E_MARKER is required');
    process.exit(1);
  }

  printReport(assertBuiltSite({
    siteDir,
    sourceDir,
    marker,
    permalinkPattern,
    imagePathPattern
  }));
}

module.exports = {
  assertBuiltSite,
  normalizeSitePath,
  walkHtmlFiles
};
