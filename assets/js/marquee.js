console.log('Marquee script loading...');

// Global object to store marquee controls
window.marqueeControls = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing marquees...');
    
    const SPEED = 30; // pixels per second - increased for visibility
    
    // Function to center the initial category element
    function centerInitialCategory() {
        const initialElements = document.querySelectorAll('.category-element.initial');
        
        initialElements.forEach(function(initialElement) {
            const categoryWrapper = initialElement.closest('.category-wrapper');
            if (!categoryWrapper) return;
            
            const categoryContainer = categoryWrapper.querySelector('.category-container');
            if (!categoryContainer) return;
            
            // Get positions
            const elementRect = initialElement.getBoundingClientRect();
            const wrapperRect = categoryWrapper.getBoundingClientRect();
            const containerRect = categoryContainer.getBoundingClientRect();
            
            // Calculate the scroll position to center the element
            const elementCenter = initialElement.offsetLeft + (initialElement.offsetWidth / 2);
            const wrapperCenter = categoryWrapper.offsetWidth / 2;
            const scrollPosition = elementCenter - wrapperCenter;
            
            // Scroll to center the initial element
            categoryContainer.scrollLeft = Math.max(0, scrollPosition);
            
            console.log('Centered initial category element, scroll position:', scrollPosition);
        });
    }
    
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
        
        console.log('Elements found, content width:', content.scrollWidth);
        
        let isUserScrolling = false;
        let scrollTimer = null;
        let animationId = null;
        let lastTime = 0;
        let currentPosition = 0;
        
        // Get content width (half since duplicated)
        const contentWidth = content.scrollWidth / 2;
        
        console.log('Single content width:', contentWidth);
        
        // Set initial position for LTR
        if (direction === 'ltr') {
            currentPosition = -contentWidth;
            content.style.transform = `translateX(${currentPosition}px)`;
            console.log('Set initial LTR position to:', currentPosition);
        }
        
        function animate(currentTime) {
            if (isUserScrolling) {
                lastTime = currentTime;
                animationId = requestAnimationFrame(animate);
                return;
            }
            
            if (lastTime === 0) {
                lastTime = currentTime;
            }
            
            const deltaTime = currentTime - lastTime;
            const deltaPixels = (SPEED * deltaTime) / 1000;
            
            if (direction === 'rtl') {
                currentPosition -= deltaPixels;
                if (currentPosition <= -contentWidth) {
                    currentPosition = 0;
                }
            } else {
                currentPosition += deltaPixels;
                if (currentPosition >= 0) {
                    currentPosition = -contentWidth;
                }
            }
            
            content.style.transform = `translateX(${currentPosition}px)`;
            
            lastTime = currentTime;
            animationId = requestAnimationFrame(animate);
        }
        
        function startAnimation() {
            if (!animationId) {
                console.log('Starting animation for:', wrapperId);
                lastTime = 0;
                animationId = requestAnimationFrame(animate);
            }
        }
        
        function stopAnimation() {
            if (animationId) {
                console.log('Stopping animation for:', wrapperId);
                cancelAnimationFrame(animationId);
                animationId = null;
                lastTime = 0;
            }
        }
        
        // Store control functions globally
        window.marqueeControls[wrapperId] = {
            start: startAnimation,
            stop: stopAnimation,
            isRunning: function() { return animationId !== null; }
        };
        
        // Handle scroll events for manual scrolling
        wrapper.addEventListener('scroll', function() {
            if (!isUserScrolling) {
                console.log('User started scrolling:', wrapperId);
                isUserScrolling = true;
                // Temporarily disable transition for smoother manual scrolling
                content.style.transition = 'none';
            }
            
            // Handle infinite scroll during manual scrolling
            const scrollLeft = wrapper.scrollLeft;
            const maxScroll = content.scrollWidth - wrapper.clientWidth;
            
            if (scrollLeft >= contentWidth) {
                wrapper.scrollLeft = 0;
                if (direction === 'rtl') {
                    currentPosition = 0;
                } else {
                    currentPosition = -contentWidth;
                }
                content.style.transform = `translateX(${currentPosition}px)`;
            } else if (scrollLeft <= 0 && direction === 'ltr') {
                wrapper.scrollLeft = contentWidth;
                currentPosition = -contentWidth;
                content.style.transform = `translateX(${currentPosition}px)`;
            }
            
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                console.log('Resuming animation after scroll for:', wrapperId);
                // Re-enable transition smoothly
                content.style.transition = 'transform 0.1s ease-out';
                isUserScrolling = false;
            }, 100);
        });
        
        // Start the animation
        startAnimation();
        console.log('Marquee initialized successfully:', wrapperId);
    }
    
    // Initialize both marquees
    createMarquee('commissioned-marquee', 'rtl');
    createMarquee('personal-marquee', 'ltr');
    
    // Center initial category elements after a short delay to ensure layout is complete
    setTimeout(centerInitialCategory, 100);
    
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