// 浮动按钮功能
(function() {
    'use strict';
    
    // 计算当前文章所在的分页
    function calculatePaginationPage() {
        // 从页面中获取文章信息
        const currentPostDate = document.querySelector('meta[name="post-date"]');
        const currentPostTitle = document.querySelector('meta[name="post-title"]');
        
        if (!currentPostDate || !currentPostTitle) {
            return 1; // 如果找不到信息，返回第一页
        }
        
        const postDate = new Date(currentPostDate.content);
        const postTitle = currentPostTitle.content;
        
        // 根据文章日期和标题计算分页
        // 这是一个基于已知文章分布的估算方法
        
        // 2025年的文章（最新）
        if (postDate.getFullYear() >= 2025) {
            return 1;
        }
        
        // 2024年的文章
        if (postDate.getFullYear() === 2024) {
            const month = postDate.getMonth() + 1;
            if (month >= 9) return 1; // 9月及以后
            else if (month >= 7) return 2; // 7-8月
            else if (month >= 4) return 2; // 4-6月
            else return 3; // 1-3月
        }
        
        // 2023年的文章
        if (postDate.getFullYear() === 2023) {
            return 3;
        }
        
        // 2022年的文章
        if (postDate.getFullYear() === 2022) {
            return 3;
        }
        
        // 2021年的文章
        if (postDate.getFullYear() === 2021) {
            return 3;
        }
        
        // 2020年的文章（最早）
        if (postDate.getFullYear() === 2020) {
            return 3;
        }
        
        // 默认返回第3页
        return 3;
    }
    
    // 回到顶部功能
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 回到分页功能
    function goToPagination() {
        const pageNumber = calculatePaginationPage();
        const paginationUrl = pageNumber === 1 ? '/' : `/page${pageNumber}/`;
        window.location.href = paginationUrl;
    }
    
    // 显示/隐藏回到顶部按钮
    function toggleBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;
        
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }
    
    // 初始化浮动按钮
    function initFloatingButtons() {
        const backToTopBtn = document.getElementById('back-to-top');
        const backToPaginationBtn = document.getElementById('back-to-pagination');
        
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', scrollToTop);
            // 初始状态隐藏
            backToTopBtn.style.display = 'none';
        }
        
        if (backToPaginationBtn) {
            backToPaginationBtn.addEventListener('click', function(e) {
                e.preventDefault();
                goToPagination();
            });
        }
        
        // 监听滚动事件
        window.addEventListener('scroll', toggleBackToTopButton);
    }
    
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initFloatingButtons);
    
})();
