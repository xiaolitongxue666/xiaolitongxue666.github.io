/**
 * Sync /stats/ iframe + dashboard link with blog data-theme.
 * Initial src is set by inline script (with ?theme=); this handles toggles via postMessage.
 */
(function () {
  'use strict';

  var MESSAGE_SOURCE = 'blog-stats-theme';
  var IFRAME_ID = 'stats-embed-frame';
  var FALLBACK_SELECTOR = '.stats-fallback-link';
  var baseAnalyticsUrl = null;

  function getBlogTheme() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') {
      return attr;
    }
    try {
      var stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch (e) {
      /* ignore */
    }
    return 'dark';
  }

  function stripThemeParam(url) {
    try {
      var parsed = new URL(url, window.location.href);
      parsed.searchParams.delete('theme');
      return parsed.toString();
    } catch (e) {
      return url;
    }
  }

  function withThemeParam(url, theme) {
    try {
      var parsed = new URL(url, window.location.href);
      parsed.searchParams.set('theme', theme);
      return parsed.toString();
    } catch (e) {
      return url;
    }
  }

  function ensureBaseUrl(iframe, fallback) {
    if (baseAnalyticsUrl) {
      return baseAnalyticsUrl;
    }
    var raw =
      (iframe && iframe.getAttribute('data-analytics-src')) ||
      (iframe && (iframe.getAttribute('src') || iframe.src)) ||
      (fallback && (fallback.getAttribute('href') || fallback.href)) ||
      '';
    baseAnalyticsUrl = stripThemeParam(raw);
    return baseAnalyticsUrl;
  }

  function postTheme(iframe, theme) {
    if (!iframe || !iframe.contentWindow) {
      return;
    }
    try {
      iframe.contentWindow.postMessage(
        { source: MESSAGE_SOURCE, theme: theme },
        'https://xiaolitongxue.com.cn'
      );
    } catch (e) {
      /* ignore */
    }
  }

  function syncEmbed(theme, reloadIframe) {
    var iframe = document.getElementById(IFRAME_ID);
    var fallback = document.querySelector(FALLBACK_SELECTOR);
    if (!iframe && !fallback) {
      return;
    }
    var base = ensureBaseUrl(iframe, fallback);
    if (!base) {
      return;
    }
    var nextSrc = withThemeParam(base, theme);
    if (fallback) {
      fallback.href = nextSrc;
    }
    if (!iframe) {
      return;
    }
    if (reloadIframe) {
      if (iframe.src !== nextSrc) {
        iframe.src = nextSrc;
      }
    } else {
      postTheme(iframe, theme);
    }
  }

  function init() {
    var iframe = document.getElementById(IFRAME_ID);
    if (!iframe) {
      return;
    }

    // Inline script usually set src already; only assign if still empty.
    if (!iframe.getAttribute('src')) {
      syncEmbed(getBlogTheme(), true);
    } else {
      var fallback = document.querySelector(FALLBACK_SELECTOR);
      var base = ensureBaseUrl(iframe, fallback);
      if (fallback && base) {
        fallback.href = withThemeParam(base, getBlogTheme());
      }
    }

    iframe.addEventListener('load', function () {
      postTheme(iframe, getBlogTheme());
    });

    var observer = new MutationObserver(function () {
      syncEmbed(getBlogTheme(), false);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
