/**
 * Blur-up Image Loader
 * Loads low-res placeholders immediately, then swaps in high-res images
 */
(function() {
    'use strict';

    // Track loading state
    let totalImages = 0;
    let loadedImages = 0;

    /**
     * Preload a single high-res image and swap when ready
     */
    function loadHighResImage(imgElement) {
        const highResSrc = imgElement.dataset.src;
        
        if (!highResSrc) return;

        // Create a new Image to preload
        const highResImage = new Image();
        
        highResImage.onload = function() {
            // Swap in the high-res image
            imgElement.src = highResSrc;
            
            // Remove the blur class (triggers CSS transition)
            imgElement.classList.remove('blur-placeholder');
            imgElement.classList.add('loaded');
            
            // Clean up data attribute
            delete imgElement.dataset.src;
            
            // Track progress
            loadedImages++;
            
            // Optional: dispatch event when all images loaded
            if (loadedImages === totalImages) {
                document.dispatchEvent(new CustomEvent('allImagesLoaded'));
            }
        };

        highResImage.onerror = function() {
            // On error, still remove blur to show placeholder
            console.warn('Failed to load high-res image:', highResSrc);
            imgElement.classList.remove('blur-placeholder');
            imgElement.classList.add('load-error');
            loadedImages++;
        };

        // Start loading the high-res image
        highResImage.src = highResSrc;
    }

    /**
     * Initialize the image loader
     */
    function init() {
        // Find all placeholder images
        const placeholderImages = document.querySelectorAll('img.blur-placeholder');
        totalImages = placeholderImages.length;

        if (totalImages === 0) return;

        // Start loading all high-res images
        placeholderImages.forEach(function(img) {
            // Wait for placeholder to be rendered, then load high-res
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

    // Expose for dynamic content
    window.ImageLoader = {
        loadImage: loadHighResImage,
        reInit: init
    };
})();

