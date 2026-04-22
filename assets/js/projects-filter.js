document.addEventListener('DOMContentLoaded', function() {
    const containers = Array.from(document.querySelectorAll('.projects-container'));
    if (containers.length === 0) return;

    containers.forEach(function(container) {
        const buttons = Array.from(container.querySelectorAll('.section-categories .category'));
        const items = Array.from(container.querySelectorAll('.single-project-wrapper'));
        const duplicates = Array.from(container.querySelectorAll('.detail-duplicate'));
        const itemTimers = new Map();
        const sectionId = container.dataset.section;
        const marqueeId = sectionId + '-marquee';
        let marqueeUpdateAnimationId = null;

        if (buttons.length === 0 || items.length === 0) return;

        // Continuously update marquee metrics during transitions
        function startMarqueeUpdates(duration) {
            if (marqueeUpdateAnimationId) {
                cancelAnimationFrame(marqueeUpdateAnimationId);
            }
            
            const startTime = performance.now();
            
            function update() {
                if (window.marqueeControls && window.marqueeControls[marqueeId]) {
                    window.marqueeControls[marqueeId].updateMetrics();
                }
                
                if (performance.now() - startTime < duration) {
                    marqueeUpdateAnimationId = requestAnimationFrame(update);
                } else {
                    marqueeUpdateAnimationId = null;
                }
            }
            
            marqueeUpdateAnimationId = requestAnimationFrame(update);
        }

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
            // Filter marquee items with animation
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

                if (category === 'all') {
                    const wasHidden = item.classList.contains('filter-2');
                    item.setAttribute('data-visible', 'true');
                    if (wasHidden) {
                        const timers = [];
                        item.classList.remove('filter-2');
                        timers.push(setTimeout(function() {
                            item.classList.remove('filter-1');
                        }, 800));
                        itemTimers.set(item, timers);
                    } else {
                        clearFilterClasses(item);
                    }
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
                        item.classList.remove('filter-1');
                    }, 700));
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
            
            // Filter detail duplicates in sync (no animation needed, they're hidden by default)
            duplicates.forEach(function(duplicate) {
                const dupCategory = (duplicate.dataset.subcategory || '').toLowerCase();
                const shouldShow = category === 'all' || dupCategory === category;
                duplicate.setAttribute('data-visible', shouldShow ? 'true' : 'false');
            });
        }

        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                const category = (button.dataset.category || 'all').toLowerCase();
                setActiveCategory(category);
                applyFilter(category);
                // Update marquee continuously during the transition (300ms delay + 800ms transition + buffer)
                startMarqueeUpdates(1200);
                // Close mobile filter panel after selection
                const info = button.closest('.projects-container-info');
                if (info) info.classList.remove('filter-open');
            });
        });

        setActiveCategory('all');
        applyFilter('all', true);
    });

    // Mobile filter toggle
    const toggles = document.querySelectorAll('.projects-container-info .filter-toggle');
    toggles.forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const info = toggle.closest('.projects-container-info');
            if (!info) return;
            // Close any other open panels
            document.querySelectorAll('.projects-container-info.filter-open').forEach(function(other) {
                if (other !== info) other.classList.remove('filter-open');
            });
            info.classList.toggle('filter-open');
        });
    });

    // Close filter panel when tapping outside
    document.addEventListener('click', function(e) {
        document.querySelectorAll('.projects-container-info.filter-open').forEach(function(info) {
            if (!info.contains(e.target)) {
                info.classList.remove('filter-open');
            }
        });
    });
});
