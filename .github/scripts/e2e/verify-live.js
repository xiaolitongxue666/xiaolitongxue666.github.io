#!/usr/bin/env node
/**
 * HTTP live verification for published GitHub Pages URLs.
 */

const { normalizeSitePath } = require('./assert-built-site');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, { retries = 5, delayMs = 30000, timeoutMs = 30000 } = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      const body = await response.text();
      return { response, body, attempt };
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        console.log(`HTTP attempt ${attempt} failed for ${url}: ${error.message}. Retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError || new Error(`Failed to fetch ${url}`);
}

async function verifyLiveUrl(options) {
  const {
    baseUrl = 'https://xiaolitongxue666.github.io',
    permalink,
    marker,
    retries = 5,
    delayMs = 30000
  } = options;

  const pathPart = normalizeSitePath(permalink);
  const url = `${baseUrl.replace(/\/$/, '')}${pathPart}`;
  const { response, body, attempt } = await fetchWithRetry(url, { retries, delayMs });

  const report = {
    pass: true,
    url,
    status: response.status,
    attempt,
    errors: []
  };

  if (response.status !== 200) {
    report.pass = false;
    report.errors.push(`Expected HTTP 200, got ${response.status}`);
  }
  if (marker && !body.includes(marker)) {
    report.pass = false;
    report.errors.push(`Marker not found in live page: ${marker}`);
  }

  return report;
}

async function main() {
  const permalink = process.env.E2E_PERMALINK;
  const marker = process.env.E2E_MARKER;
  const baseUrl = process.env.E2E_BASE_URL || 'https://xiaolitongxue666.github.io';

  if (!permalink || !marker) {
    console.error('E2E_PERMALINK and E2E_MARKER are required');
    process.exit(1);
  }

  const report = await verifyLiveUrl({ baseUrl, permalink, marker });
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) {
    for (const err of report.errors) {
      console.error(`E2E LIVE FAIL: ${err}`);
    }
    process.exit(1);
  }
  console.log('E2E verify-live: PASS');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`E2E LIVE FAIL: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { verifyLiveUrl, fetchWithRetry };
