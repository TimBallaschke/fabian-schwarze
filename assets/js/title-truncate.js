(function () {
    const TITLE_SELECTOR = '.project-title';
    const SUFFIX = '...';

    function truncate(el) {
        if (!el.dataset.fullTitle) el.dataset.fullTitle = el.textContent;
        const full = el.dataset.fullTitle;
        el.textContent = full;

        // Bail if the element hasn't been laid out yet. Mobile Safari and
        // Firefox can report clientWidth as 0 (or absurdly small) for a flex
        // child with min-width:0 before fonts/layout settle, and the binary
        // search below would otherwise collapse the title to "..." or a few
        // characters. ResizeObserver / fonts.ready will retry once layout is
        // valid.
        if (el.clientWidth < 1) return;

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
        // Defer initial pass to the next frame so first layout has run.
        requestAnimationFrame(updateAll);

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
