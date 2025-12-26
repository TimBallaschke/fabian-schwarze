console.log('Marquee script loading...');

// Global object to store marquee controls
window.marqueeControls = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing marquees...');
    
    const BASE_SPEED = 30; // pixels per second for auto-scroll
    const SCROLL_RESUME_DELAY = 800; // ms to wait after last scroll before resuming animation
    const LERP_FACTOR = 0.1; // smoothing factor (0-1, lower = smoother but slower)
    
    function createMarquee(wrapperId, direction) {
        console.log('Initializing marquee:', wrapperId, direction);
        
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) {
            console.error('Wrapper not found:', wrapperId);
            return;
        }
        
        const content = wrapper.querySelector('.marquee-content');
        if (!content) {
            console.error('Content not found in wrapper:', wrapperId);
            return;
        }
        
        content.style.transition = 'none';
        
        console.log('Elements found, content width:', content.scrollWidth);
        
        let animationId = null;
        let lastTime = null;
        let currentPosition = 0;
        let targetPosition = 0; // where we want to be (for smooth scrolling)
        let contentWidth = 0;
        let hasMetrics = false;
        
        // User interaction state
        let isUserScrolling = false;
        let scrollResumeTimeout = null;
        
        // Touch tracking
        let touchLastX = 0;
        
        function normalizeValue(value) {
            if (!contentWidth) return value;
            // Normalize to range [-contentWidth, 0)
            while (value >= 0) {
                value -= contentWidth;
            }
            while (value < -contentWidth) {
                value += contentWidth;
            }
            return value;
        }
        
        function setInitialPosition() {
            if (!contentWidth) return;
            currentPosition = direction === 'ltr' ? -contentWidth : 0;
            targetPosition = currentPosition;
            content.style.transform = `translateX(${currentPosition}px)`;
        }
        
        function applyPosition() {
            content.style.transform = `translateX(${currentPosition}px)`;
        }
        
        // Linear interpolation
        function lerp(current, target, factor) {
            return current + (target - current) * factor;
        }
        
        function animate(currentTime) {
            if (lastTime === null) {
                lastTime = currentTime;
            }
            
            const deltaTime = currentTime - lastTime;
            const deltaSeconds = deltaTime / 1000;
            
            if (isUserScrolling) {
                // During user scroll: smoothly interpolate toward target
                // Handle wrapping - find shortest path to target
                let diff = targetPosition - currentPosition;
                
                // If difference is more than half the content width, wrap around
                if (contentWidth && Math.abs(diff) > contentWidth / 2) {
                    if (diff > 0) {
                        diff -= contentWidth;
                    } else {
                        diff += contentWidth;
                    }
                }
                
                // Apply lerp
                currentPosition += diff * LERP_FACTOR;
                currentPosition = normalizeValue(currentPosition);
            } else {
                // Auto-scroll mode
                let movement = BASE_SPEED * deltaSeconds;
                if (direction === 'rtl') {
                    movement = -movement;
                }
                
                currentPosition += movement;
                currentPosition = normalizeValue(currentPosition);
                targetPosition = currentPosition; // Keep target synced
            }
            
            applyPosition();
            
            lastTime = currentTime;
            animationId = requestAnimationFrame(animate);
        }
        
        function startAnimation() {
            if (!animationId) {
                console.log('Starting animation for:', wrapperId);
                lastTime = null;
                if (contentWidth > 0) {
                    animationId = requestAnimationFrame(animate);
                }
            }
        }
        
        function stopAnimation() {
            if (animationId) {
                console.log('Stopping animation for:', wrapperId);
                cancelAnimationFrame(animationId);
                animationId = null;
                lastTime = null;
            }
        }
        
        // Called when user starts scrolling
        function onScrollStart() {
            if (!isUserScrolling) {
                // Sync target with current position when starting to scroll
                targetPosition = currentPosition;
            }
            isUserScrolling = true;
            // Clear any pending resume timeout
            if (scrollResumeTimeout) {
                clearTimeout(scrollResumeTimeout);
                scrollResumeTimeout = null;
            }
        }
        
        // Called after scrolling stops (debounced)
        function onScrollEnd() {
            // Clear any pending timeout
            if (scrollResumeTimeout) {
                clearTimeout(scrollResumeTimeout);
            }
            // Wait a bit before resuming animation
            scrollResumeTimeout = setTimeout(function() {
                isUserScrolling = false;
                // Sync current to target before resuming auto-scroll
                currentPosition = normalizeValue(targetPosition);
                targetPosition = currentPosition;
                scrollResumeTimeout = null;
            }, SCROLL_RESUME_DELAY);
        }
        
        // Handle wheel events
        function handleWheel(e) {
            if (!contentWidth) return;
            
            onScrollStart();
            
            // Use deltaX for horizontal scroll, fall back to deltaY if no horizontal
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            
            // Adjust target position (will be smoothly interpolated in animate())
            targetPosition -= delta;
            targetPosition = normalizeValue(targetPosition);
            
            // Schedule resume
            onScrollEnd();
            
            // Prevent default to stop native scrolling
            e.preventDefault();
        }
        
        // Handle touch start
        function handleTouchStart(e) {
            if (!contentWidth) return;
            
            onScrollStart();
            touchLastX = e.touches[0].clientX;
        }
        
        // Handle touch move
        function handleTouchMove(e) {
            if (!contentWidth) return;
            
            const newTouchX = e.touches[0].clientX;
            const deltaX = touchLastX - newTouchX;
            
            // Adjust target position
            targetPosition -= deltaX;
            targetPosition = normalizeValue(targetPosition);
            
            touchLastX = newTouchX;
            
            // Prevent default to stop native scrolling
            e.preventDefault();
        }
        
        // Handle touch end
        function handleTouchEnd() {
            onScrollEnd();
        }
        
        // Attach event listeners
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
        wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
        wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
        wrapper.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        
        // Store control functions globally
        window.marqueeControls[wrapperId] = {
            start: startAnimation,
            stop: stopAnimation,
            isRunning: function() { return animationId !== null && !isUserScrolling; }
        };
        
        function updateMetrics() {
            const newWidth = content.scrollWidth / 2;
            if (!newWidth) {
                return;
            }
            
            if (!hasMetrics) {
                contentWidth = newWidth;
                hasMetrics = true;
                console.log('Single content width:', contentWidth);
                setInitialPosition();
                startAnimation();
                return;
            }
            
            if (newWidth !== contentWidth) {
                const scale = newWidth / contentWidth;
                currentPosition *= scale;
                targetPosition *= scale;
                contentWidth = newWidth;
            }
            
            currentPosition = normalizeValue(currentPosition);
            targetPosition = normalizeValue(targetPosition);
            applyPosition();
        }
        
        function waitForImages() {
            const images = Array.from(content.querySelectorAll('img'));
            if (images.length === 0) {
                updateMetrics();
                return;
            }
            
            let remaining = images.length;
            function onImageReady() {
                remaining -= 1;
                if (remaining === 0) {
                    updateMetrics();
                }
            }
            
            images.forEach(function(img) {
                if (img.complete) {
                    onImageReady();
                } else {
                    img.addEventListener('load', onImageReady, { once: true });
                    img.addEventListener('error', onImageReady, { once: true });
                }
            });
        }
        
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(function() {
                updateMetrics();
            });
            resizeObserver.observe(content);
        }
        
        waitForImages();
        console.log('Marquee initialized successfully:', wrapperId);
    }
    
    // Initialize both marquees
    createMarquee('commissioned-marquee', 'rtl');
    createMarquee('personal-marquee', 'ltr');
    
    console.log('All marquees initialized');
    
    // Global function to stop all marquees
    window.stopAllMarquees = function() {
        Object.values(window.marqueeControls).forEach(control => {
            if (control.stop) {
                control.stop();
            }
        });
        console.log('All marquees stopped');
    };
    
    // Global function to start all marquees
    window.startAllMarquees = function() {
        Object.values(window.marqueeControls).forEach(control => {
            if (control.start) {
                control.start();
            }
        });
        console.log('All marquees started');
    };
});
