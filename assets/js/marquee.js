console.log('Marquee script loading...');

// Global object to store marquee controls
window.marqueeControls = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing marquees...');
    
    const SPEED = 30; // pixels per second
    
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
        
        function setInitialPosition() {
            if (!contentWidth) return;
            currentPosition = direction === 'ltr' ? -contentWidth : 0;
            content.style.transform = `translateX(${currentPosition}px)`;
        }
        
        function animate(currentTime) {
            if (lastTime === null) {
                lastTime = currentTime;
            }
            
            const deltaTime = currentTime - lastTime;
            const deltaPixels = (SPEED * deltaTime) / 1000;
            
            if (direction === 'rtl') {
                currentPosition -= deltaPixels;
                if (currentPosition <= -contentWidth) {
                    currentPosition += contentWidth;
                }
            } else {
                currentPosition += deltaPixels;
                if (currentPosition >= 0) {
                    currentPosition -= contentWidth;
                }
            }
            
            content.style.transform = `translateX(${currentPosition}px)`;
            
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
            
            if (currentPosition > 0) {
                currentPosition -= contentWidth;
            }
            if (currentPosition < -contentWidth) {
                currentPosition += contentWidth;
            }
            
            content.style.transform = `translateX(${currentPosition}px)`;
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
