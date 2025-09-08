// 主题切换功能
(function() {
    'use strict';
    
    // 获取当前主题
    function getCurrentTheme() {
        return localStorage.getItem('theme') || 'light';
    }
    
    // 设置主题
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // 更新切换按钮文本
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
            toggleBtn.setAttribute('aria-label', theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题');
        }
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
    
    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        
        // 在导航栏中添加主题切换按钮
        const nav = document.querySelector('div.nav');
        if (nav) {
            const toggleBtn = createThemeToggleButton();
            const navRss = nav.querySelector('div.nav_rss');
            if (navRss) {
                navRss.appendChild(toggleBtn);
            } else {
                nav.appendChild(toggleBtn);
            }
        }
    });
    
    // 监听系统主题变化
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(function(e) {
            // 只有在用户没有手动设置主题时才跟随系统主题
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
})();