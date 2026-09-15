// 主题切换功能
(function () {
  'use strict';

  // 全局错误处理
  window.addEventListener('error', function (e) {
    // 忽略来自扩展的错误
    if (e.filename && e.filename.includes('content.bundle.js')) {
      return;
    }
    // 其他错误可以在这里处理
  });

  // 获取当前主题
  function getCurrentTheme() {
    return localStorage.getItem('theme') || 'dark';
  }

  // 设置主题
  function setTheme(theme) {
    // 添加过渡类，防止闪烁
    document.body.style.transition = 'none';

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // 更新切换按钮文本
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
      toggleBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题',
      );
    }

    // 重新启用过渡效果
    setTimeout(() => {
      document.body.style.transition = '';
    }, 10);
  }

  // 切换主题
  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  // 初始化主题
  function initTheme() {
    const savedTheme = getCurrentTheme();
    setTheme(savedTheme);
  }

  // 创建主题切换按钮
  function createThemeToggleButton() {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle-btn';
    button.setAttribute('aria-label', '切换主题');
    button.addEventListener('click', toggleTheme);
    return button;
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', function () {
    // 初始化主题
    initTheme();

    // 查找现有的主题切换按钮
    const existingBtn = document.getElementById('theme-toggle');
    if (existingBtn) {
      // 使用现有按钮
      existingBtn.addEventListener('click', toggleTheme);
      // 立即设置初始图标和状态
      setTheme(getCurrentTheme());
    } else {
      // 如果没有现有按钮，创建新的
      const nav = document.querySelector('div.nav');
      if (nav) {
        const toggleBtn = createThemeToggleButton();
        nav.appendChild(toggleBtn);
      } else {
        const body = document.body;
        if (body) {
          const toggleBtn = createThemeToggleButton();
          toggleBtn.style.position = 'fixed';
          toggleBtn.style.top = '10px';
          toggleBtn.style.right = '10px';
          toggleBtn.style.zIndex = '1000';
          body.appendChild(toggleBtn);
        }
      }
    }
  });

  // 监听系统主题变化
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(function (e) {
      // 只有在用户没有手动设置主题时才跟随系统主题
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();
