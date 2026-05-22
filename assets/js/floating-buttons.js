// 浮动按钮：回到顶部、回到文章所在分页、回到首页
// pagination-page 由 _layouts/default.html 在构建时注入（基于 site.posts 与 paginate: 10）
(function() {
    'use strict';

    function getPaginationPage() {
        const paginationMeta = document.querySelector('meta[name="pagination-page"]');
        if (paginationMeta) {
            const page = parseInt(paginationMeta.content, 10);
            if (!isNaN(page) && page >= 1) {
                return page;
            }
        }
        return 1;
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function goToPagination() {
        const pageNumber = getPaginationPage();
        const paginationUrl = pageNumber === 1 ? '/' : `/page${pageNumber}/`;
        window.location.href = paginationUrl;
    }

    function toggleBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;

        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }

    function initFloatingButtons() {
        const backToTopBtn = document.getElementById('back-to-top');
        const backToPaginationBtn = document.getElementById('back-to-pagination');

        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', scrollToTop);
            backToTopBtn.style.display = 'none';
        }

        if (backToPaginationBtn) {
            backToPaginationBtn.addEventListener('click', function(e) {
                e.preventDefault();
                goToPagination();
            });
        }

        window.addEventListener('scroll', toggleBackToTopButton);
    }

    document.addEventListener('DOMContentLoaded', initFloatingButtons);
})();
