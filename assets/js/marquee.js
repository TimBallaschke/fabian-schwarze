console.log('Marquee script loading...');

// Global object to store marquee controls
window.marqueeControls = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing marquees...');
    
    const BASE_SPEED = 30; // pixels per second for auto-scroll
    const FRICTION = 0.92; // velocity decay per frame (lower = more friction)
    const SCROLL_SENSITIVITY = 0.3; // how much wheel affects velocity
    const TOUCH_SENSITIVITY = 0.5; // how much touch affects velocity
    const MIN_VELOCITY = 0.1; // threshold to stop applying velocity
    
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
        let contentWidth = 0;
        let hasMetrics = false;
        
        // Velocity-based scrolling
        let userVelocity = 0; // additional velocity from user input
        
        // Touch tracking
        let touchStartX = 0;
        let touchLastX = 0;
        let touchLastTime = 0;
        let isDragging = false;
        
        function normalizePosition() {
            // Keep position in valid range [-contentWidth, 0)
            while (currentPosition >= 0) {
                currentPosition -= contentWidth;
            }
            while (currentPosition < -contentWidth) {
                currentPosition += contentWidth;
            }
        }
        
        function setInitialPosition() {
            if (!contentWidth) return;
            currentPosition = direction === 'ltr' ? -contentWidth : 0;
            content.style.transform = `translateX(${currentPosition}px)`;
        }
        
        function applyPosition() {
            content.style.transform = `translateX(${currentPosition}px)`;
        }
        
        function animate(currentTime) {
            if (lastTime === null) {
                lastTime = currentTime;
            }
            
            const deltaTime = currentTime - lastTime;
            const deltaSeconds = deltaTime / 1000;
            
            // Calculate base auto-scroll movement
            let baseMovement = BASE_SPEED * deltaSeconds;
            if (direction === 'rtl') {
                baseMovement = -baseMovement;
            }
            
            // Apply user velocity with friction
            userVelocity *= FRICTION;
            if (Math.abs(userVelocity) < MIN_VELOCITY) {
                userVelocity = 0;
            }
            
            // Combine base movement with user velocity
            const totalMovement = baseMovement + userVelocity;
            currentPosition += totalMovement;
            
            normalizePosition();
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
        
        // Handle wheel events - add to velocity for smooth momentum
        function handleWheel(e) {
            if (!contentWidth) return;
            
            // Use deltaX for horizontal scroll, fall back to deltaY if no horizontal
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            
            // Add to velocity instead of directly changing position
            userVelocity -= delta * SCROLL_SENSITIVITY;
            
            // Prevent default to stop native scrolling
            e.preventDefault();
        }
        
        // Handle touch start
        function handleTouchStart(e) {
            if (!contentWidth) return;
            
            isDragging = true;
            touchStartX = e.touches[0].clientX;
            touchLastX = touchStartX;
            touchLastTime = performance.now();
            
            // Reset velocity on new touch
            userVelocity = 0;
        }
        
        // Handle touch move
        function handleTouchMove(e) {
            if (!isDragging || !contentWidth) return;
            
            const now = performance.now();
            const newTouchX = e.touches[0].clientX;
            const deltaX = touchLastX - newTouchX;
            const deltaTime = now - touchLastTime;
            
            // Calculate velocity from movement
            if (deltaTime > 0) {
                // Smooth velocity calculation
                const instantVelocity = -deltaX * TOUCH_SENSITIVITY;
                userVelocity = userVelocity * 0.5 + instantVelocity * 0.5;
            }
            
            // Also apply direct position change for responsive feel
            currentPosition -= deltaX;
            normalizePosition();
            
            touchLastX = newTouchX;
            touchLastTime = now;
            
            // Prevent default to stop native scrolling
            e.preventDefault();
        }
        
        // Handle touch end - keep momentum going
        function handleTouchEnd() {
            isDragging = false;
            // Velocity will naturally decay via friction in animate()
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
            isRunning: function() { return animationId !== null; }
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
                contentWidth = newWidth;
            }
            
            normalizePosition();
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
