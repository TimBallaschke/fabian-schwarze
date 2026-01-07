(function() {
    'use strict';
    
    // Configuration
    const FAVICON_COUNT = 7; // Total number of favicon files (favicon-01 to favicon-07)
    const ANIMATION_INTERVAL = 750; // 1.5 seconds
    
    // Favicon manager class
    class FaviconManager {
        constructor() {
            this.faviconUrls = this.initializeFavicons();
            this.currentIndex = 0;
            this.intervalId = null;
            
            if (this.faviconUrls.length > 0) {
                this.start();
            }
        }
        
        // Fisher-Yates shuffle algorithm
        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
        
        initializeFavicons() {
            const primaryLink = document.querySelector('link[rel="icon"]');
            if (!primaryLink || !primaryLink.href) {
                console.warn('Primary favicon not found');
                return [];
            }
            
            // Get the base path from the first favicon
            const basePath = primaryLink.href.replace(/favicon-\d+\.svg$/, '');
            
            // Create array of all favicon URLs
            const faviconUrls = Array.from({ length: FAVICON_COUNT }, (_, i) => {
                return `${basePath}favicon-0${i + 1}.svg`;
            });
            
            // Return shuffled array
            return this.shuffleArray(faviconUrls);
        }
        
        createFaviconLink(href, rel) {
            const link = document.createElement('link');
            link.rel = rel;
            link.type = 'image/svg+xml';
            link.href = href;
            return link;
        }
        
        setFavicon(href) {
            const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]'];
            const existingLinks = document.querySelectorAll(selectors.join(', '));
            
            if (existingLinks.length === 0) {
                // Create new favicon links if none exist
                const iconLink = this.createFaviconLink(href, 'icon');
                const shortcutLink = this.createFaviconLink(href, 'shortcut icon');
                
                document.head.appendChild(iconLink);
                document.head.appendChild(shortcutLink);
            } else {
                // Update existing links
                existingLinks.forEach(link => {
                    link.href = href;
                });
            }
        }
        
        nextFavicon() {
            this.currentIndex = (this.currentIndex + 1) % this.faviconUrls.length;
            
            // Re-shuffle when we complete a full cycle
            if (this.currentIndex === 0) {
                this.faviconUrls = this.shuffleArray(this.faviconUrls);
            }
            
            this.setFavicon(this.faviconUrls[this.currentIndex]);
        }
        
        start() {
            // Set initial favicon
            this.setFavicon(this.faviconUrls[0]);
            
            // Start animation
            this.intervalId = setInterval(() => {
                this.nextFavicon();
            }, ANIMATION_INTERVAL);
        }
        
        stop() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    }
    
    // Initialize favicon manager when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new FaviconManager());
    } else {
        new FaviconManager();
    }
})();