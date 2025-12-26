document.addEventListener('DOMContentLoaded', function() {
    const containers = Array.from(document.querySelectorAll('.projects-container'));
    if (containers.length === 0) return;

    containers.forEach(function(container) {
        const buttons = Array.from(container.querySelectorAll('.section-categories .category'));
        const items = Array.from(container.querySelectorAll('.single-project-wrapper'));
        const itemTimers = new Map();

        if (buttons.length === 0 || items.length === 0) return;

        function setActiveCategory(category) {
            buttons.forEach(function(btn) {
                const isActive = btn.dataset.category === category;
                btn.classList.toggle('active', isActive);
            });
        }

        function clearTimers(item) {
            const timers = itemTimers.get(item);
            if (!timers) return;
            timers.forEach(function(timerId) {
                clearTimeout(timerId);
            });
            itemTimers.delete(item);
        }

        function clearFilterClasses(item) {
            item.classList.remove('filter-1', 'filter-2');
        }

        function applyFilter(category, skipAnimation) {
            items.forEach(function(item) {
                const itemCategory = (item.dataset.subcategory || '').toLowerCase();
                const shouldShow = category === 'all' || itemCategory === category;
                const isVisible = item.getAttribute('data-visible') !== 'false';
                clearTimers(item);
                if (skipAnimation) {
                    item.setAttribute('data-visible', shouldShow ? 'true' : 'false');
                    clearFilterClasses(item);
                    return;
                }

                item.setAttribute('data-visible', shouldShow ? 'true' : 'false');

                if (shouldShow && isVisible) {
                    clearFilterClasses(item);
                    return;
                }

                if (shouldShow && !isVisible) {
                    const timers = [];
                    item.classList.remove('filter-2');
                    timers.push(setTimeout(function() {
                        item.classList.add('filter-1');
                    }, 200));
                    itemTimers.set(item, timers);
                    return;
                }

                if (!shouldShow && isVisible) {
                    const timers = [];
                    item.classList.add('filter-1');
                    timers.push(setTimeout(function() {
                        item.classList.add('filter-2');
                    }, 200));
                    itemTimers.set(item, timers);
                }
            });
        }

        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                const category = (button.dataset.category || 'all').toLowerCase();
                setActiveCategory(category);
                applyFilter(category);
            });
        });

        setActiveCategory('all');
        applyFilter('all', true);
    });
});
