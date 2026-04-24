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
     */
    function init() {
        const placeholderImages = document.querySelectorAll('img.blur-placeholder');
        totalImages = placeholderImages.length;

        if (totalImages === 0) return;

        placeholderImages.forEach(function(img) {
            if (img.complete) {
                loadHighResImage(img);
            } else {
                img.addEventListener('load', function() {
                    loadHighResImage(img);
                }, { once: true });
            }
        });
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

