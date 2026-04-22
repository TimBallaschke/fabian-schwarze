(function () {
    const TITLE_SELECTOR = '.project-title';
    const SUFFIX = '...';

    function truncate(el) {
        if (!el.dataset.fullTitle) el.dataset.fullTitle = el.textContent;
        const full = el.dataset.fullTitle;
        el.textContent = full;

        if (el.scrollWidth <= el.clientWidth + 1) return;

        let lo = 0;
        let hi = full.length;
        while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            el.textContent = full.slice(0, mid).trimEnd() + SUFFIX;
            if (el.scrollWidth <= el.clientWidth + 1) {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        el.textContent = full.slice(0, lo).trimEnd() + SUFFIX;
    }

    function updateAll() {
        document.querySelectorAll(TITLE_SELECTOR).forEach(truncate);
    }

    function init() {
        updateAll();

        if ('fonts' in document) {
            document.fonts.ready.then(updateAll);
        }

        let raf = null;
        window.addEventListener('resize', () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(updateAll);
        });

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(entries => {
                entries.forEach(e => truncate(e.target));
            });
            document.querySelectorAll(TITLE_SELECTOR).forEach(el => ro.observe(el));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
