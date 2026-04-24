/**
 * Blur-up Image Loader with Responsive srcset Support
 * Loads tiny placeholders immediately, then swaps in responsive high-res images
 */
(function() {
    'use strict';

    // Track loading state
    let totalImages = 0;
    let loadedImages = 0;

    /**
     * Preload and swap in responsive high-res image
     */
    function loadHighResImage(imgElement) {
        const highResSrc = imgElement.dataset.src;
        const srcset = imgElement.dataset.srcset;
        
        if (!highResSrc) return;

        // Create a new Image to preload
        const highResImage = new Image();

        // Inherit fetch priority from the target element so visible marquee
        // cards can jump ahead of offscreen / detail-layer images.
        if (imgElement.fetchPriority) {
            highResImage.fetchPriority = imgElement.fetchPriority;
        }

        // Set srcset for preloading if available
        if (srcset) highResImage.srcset = srcset;
        
        highResImage.onload = function() {
            // Apply srcset first
            if (srcset) {
                imgElement.srcset = srcset;
                delete imgElement.dataset.srcset;
            }
            
            // Swap in the high-res src
            imgElement.src = highResSrc;
            delete imgElement.dataset.src;
            
            // Remove blur, add loaded class (triggers CSS transition)
            imgElement.classList.remove('blur-placeholder');
            imgElement.classList.add('loaded');
            
            // Track progress
            loadedImages++;
            
            // Dispatch event when all images loaded
            if (loadedImages === totalImages) {
                document.dispatchEvent(new CustomEvent('allImagesLoaded'));
            }
        };

        highResImage.onerror = function() {
            console.warn('Failed to load high-res image:', highResSrc);
            imgElement.classList.remove('blur-placeholder');
            imgElement.classList.add('load-error');
            loadedImages++;
        };

        // Start loading (browser picks best size from srcset)
        highResImage.src = highResSrc;
    }

    /**
     * Initialize the image loader
     *
     * Waits for every placeholder in the batch to finish loading before
     * starting any high-res fetches. Keeps the placeholder grid stable
     * before network bandwidth is spent on full-resolution images.
     */
    function init() {
        const placeholderImages = document.querySelectorAll('img.blur-placeholder');
        totalImages = placeholderImages.length;

        if (totalImages === 0) return;

        loadedImages = 0;

        const placeholderReady = Array.from(placeholderImages).map(function(img) {
            return new Promise(function(resolve) {
                if (img.complete) {
                    resolve();
                } else {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                }
            });
        });

        Promise.all(placeholderReady).then(function() {
            const imgs = Array.from(placeholderImages);
            const inView = imgs.filter(isMarqueeCardInView);
            const rest  = imgs.filter(function(img) { return inView.indexOf(img) === -1; });

            inView.forEach(function(img) {
                img.fetchPriority = 'high';
                loadHighResImage(img);
            });
            rest.forEach(function(img) {
                img.fetchPriority = 'low';
                loadHighResImage(img);
            });
        });
    }

    /**
     * True if the image belongs to a marquee card whose bounding box
     * currently intersects the viewport. Detail-duplicates are excluded
     * because they're layered above the marquee with visibility:hidden
     * and aren't what the user is looking at on first paint.
     */
    function isMarqueeCardInView(img) {
        const card = img.closest('.single-project-wrapper');
        if (!card) return false;

        const rect = card.getBoundingClientRect();
        return rect.bottom > 0 &&
               rect.right > 0 &&
               rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
               rect.left < (window.innerWidth  || document.documentElement.clientWidth);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * Bump a specific image's high-res fetch to high priority.
     * Called when the user clicks a marquee card so the detail-duplicate
     * image for that project loads before the rest.
     */
    function prioritize(imgElement) {
        if (!imgElement) return;
        const highResSrc = imgElement.dataset.src;
        const srcset = imgElement.dataset.srcset;

        // Already swapped to high-res — nothing to do
        if (!highResSrc && !srcset) return;

        imgElement.fetchPriority = 'high';

        // Fire a high-priority preload. Coalesces with the existing in-flight
        // low-priority request at the network layer and bumps its priority.
        const preloader = new Image();
        preloader.fetchPriority = 'high';
        if (srcset) preloader.srcset = srcset;
        preloader.src = highResSrc;
    }

    // Expose for dynamic content
    window.ImageLoader = {
        loadImage: loadHighResImage,
        reInit: init,
        prioritize: prioritize
    };
})();

