console.log('Marquee script loading...');

// Global object to store marquee controls
window.marqueeControls = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing marquees...');
    
    const BASE_SPEED = 30; // pixels per second for auto-scroll
    const SCROLL_RESUME_DELAY = 1000; // ms to wait after last scroll before resuming animation
    const SMOOTHING_SPEED = 12; // how fast to catch up (higher = faster)
    const MAX_DELTA_TIME = 50; // cap frame time to prevent jumps (ms)
    
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
        let targetOffset = 0; // accumulated offset from user input (not normalized)
        let contentWidth = 0;
        let hasMetrics = false;
        
        // User interaction state
        let isUserScrolling = false;
        let scrollResumeTimeout = null;
        
        // Touch tracking
        let touchLastX = 0;
        
        // Mouse drag tracking
        let isDragging = false;
        let mouseLastX = 0;
        
        // Normalize a value to range [-contentWidth, 0) for display
        // Using while loops is more reliable than modulo for negative numbers
        function normalizeForDisplay(value) {
            if (!contentWidth) return value;
            // Wrap to valid range using simple loops
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
            targetOffset = 0;
            content.style.transform = `translateX(${currentPosition}px)`;
        }
        
        function applyPosition() {
            // Always normalize for display to keep within valid visual range
            const displayPosition = normalizeForDisplay(currentPosition);
            content.style.transform = `translateX(${displayPosition}px)`;
        }
        
        function animate(currentTime) {
            if (lastTime === null) {
                lastTime = currentTime;
                animationId = requestAnimationFrame(animate);
                return;
            }
            
            // Cap delta time to prevent jumps from tab switching or frame drops
            let deltaTime = currentTime - lastTime;
            if (deltaTime > MAX_DELTA_TIME) {
                deltaTime = MAX_DELTA_TIME;
            }
            const deltaSeconds = deltaTime / 1000;
            
            if (isUserScrolling) {
                // During user scroll: smoothly interpolate toward target
                // targetOffset is the accumulated user input (not normalized)
                const targetPosition = currentPosition + targetOffset;
                
                // Time-based exponential smoothing
                // This ensures consistent behavior regardless of frame rate
                const smoothFactor = 1 - Math.exp(-SMOOTHING_SPEED * deltaSeconds);
                
                // Move current position toward target
                const diff = targetPosition - currentPosition;
                currentPosition += diff * smoothFactor;
                
                // Reduce targetOffset as we catch up
                targetOffset -= diff * smoothFactor;
                
                // Clean up tiny offsets to prevent floating point drift
                if (Math.abs(targetOffset) < 0.01) {
                    targetOffset = 0;
                }
            } else {
                // Auto-scroll mode
                let movement = BASE_SPEED * deltaSeconds;
                if (direction === 'rtl') {
                    movement = -movement;
                }
                currentPosition += movement;
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
                // Apply any remaining offset smoothly (don't snap)
                currentPosition += targetOffset;
                targetOffset = 0;
                scrollResumeTimeout = null;
            }, SCROLL_RESUME_DELAY);
        }
        
        // Handle wheel events
        function handleWheel(e) {
            if (!contentWidth) return;
            
            onScrollStart();
            
            // Use deltaX for horizontal scroll, fall back to deltaY if no horizontal
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            
            // Add to target offset (will be smoothly applied in animate())
            targetOffset -= delta;
            
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
            
            // Add to target offset
            targetOffset -= deltaX;
            
            touchLastX = newTouchX;
            
            // Prevent default to stop native scrolling
            e.preventDefault();
        }
        
        // Handle touch end
        function handleTouchEnd() {
            onScrollEnd();
        }
        
        // Handle mouse down (start drag)
        function handleMouseDown(e) {
            if (!contentWidth) return;
            
            isDragging = true;
            onScrollStart();
            mouseLastX = e.clientX;
            
            // Prevent text selection while dragging
            e.preventDefault();
        }
        
        // Handle mouse move (dragging)
        function handleMouseMove(e) {
            if (!isDragging || !contentWidth) return;
            
            const newMouseX = e.clientX;
            const deltaX = mouseLastX - newMouseX;
            
            // Add to target offset
            targetOffset -= deltaX;
            
            mouseLastX = newMouseX;
        }
        
        // Handle mouse up (end drag)
        function handleMouseUp() {
            if (isDragging) {
                isDragging = false;
                onScrollEnd();
            }
        }
        
        // Handle mouse leave (end drag if dragging)
        function handleMouseLeave() {
            if (isDragging) {
                isDragging = false;
                onScrollEnd();
            }
        }
        
        // Attach event listeners
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
        wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
        wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
        wrapper.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        
        // Mouse drag events
        wrapper.addEventListener('mousedown', handleMouseDown);
        wrapper.addEventListener('mousemove', handleMouseMove);
        wrapper.addEventListener('mouseup', handleMouseUp);
        wrapper.addEventListener('mouseleave', handleMouseLeave);
        
        // Store control functions globally
        window.marqueeControls[wrapperId] = {
            start: startAnimation,
            stop: stopAnimation,
            isRunning: function() { return animationId !== null && !isUserScrolling; },
            updateMetrics: updateMetrics
        };
        
        // Calculate the exact width of one complete set of content
        function calculateContentWidth() {
            const children = Array.from(content.children);
            if (children.length === 0) return 0;
            
            // Content is duplicated 4 times, so take first quarter
            const quarterCount = Math.floor(children.length / 4);
            if (quarterCount === 0) return 0;
            
            // Sum the actual widths of the first quarter using getBoundingClientRect
            // This gives us precise subpixel measurements
            let totalWidth = 0;
            for (let i = 0; i < quarterCount; i++) {
                totalWidth += children[i].getBoundingClientRect().width;
            }
            
            return totalWidth;
        }
        
        function updateMetrics() {
            const newWidth = calculateContentWidth();
            if (!newWidth) {
                return;
            }
            
            if (!hasMetrics) {
                contentWidth = newWidth;
                hasMetrics = true;
                console.log('Single content width (measured):', contentWidth);
                setInitialPosition();
                startAnimation();
                return;
            }
            
            if (Math.abs(newWidth - contentWidth) > 0.5) {
                const scale = newWidth / contentWidth;
                currentPosition *= scale;
                targetOffset *= scale;
                contentWidth = newWidth;
            }
            
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
