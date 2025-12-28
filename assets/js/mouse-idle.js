// Mouse idle detection for detail view
// Adds 'no-mouse-move' and 'no-mouse-move-{section}' classes to body when mouse is idle

let mouseIdleState = {
    timeoutId: null,
    isIdle: false,
    idleDelay: 3000, // 3 seconds
    currentSection: null
};

// Handle mouse movement - reset idle timer
function handleMouseMove() {
    // Check if detail view is open (uses global detailViewState from detail.js)
    if (typeof detailViewState === 'undefined' || !detailViewState.isOpen) return;
    
    // Clear existing timeout
    if (mouseIdleState.timeoutId) {
        clearTimeout(mouseIdleState.timeoutId);
    }
    
    // If currently idle, remove the classes
    if (mouseIdleState.isIdle) {
        mouseIdleState.isIdle = false;
        document.body.classList.remove('no-mouse-move');
        if (mouseIdleState.currentSection) {
            document.body.classList.remove('no-mouse-move-' + mouseIdleState.currentSection);
        }
    }
    
    // Set new timeout
    mouseIdleState.timeoutId = setTimeout(() => {
        if (detailViewState.isOpen && detailViewState.projectsContainer) {
            mouseIdleState.isIdle = true;
            
            // Get the section type from the container
            const sectionType = detailViewState.projectsContainer.dataset.section;
            mouseIdleState.currentSection = sectionType;
            
            // Add classes to body: both generic and section-specific
            document.body.classList.add('no-mouse-move');
            if (sectionType) {
                document.body.classList.add('no-mouse-move-' + sectionType);
            }
            
            console.log('Mouse idle - added no-mouse-move class. Section:', sectionType);
        }
    }, mouseIdleState.idleDelay);
}

// Start mouse idle detection
function startMouseIdleDetection() {
    document.addEventListener('mousemove', handleMouseMove);
    
    // Start the initial timer
    handleMouseMove();
}

// Stop mouse idle detection and clean up
function stopMouseIdleDetection() {
    document.removeEventListener('mousemove', handleMouseMove);
    
    // Clear timeout
    if (mouseIdleState.timeoutId) {
        clearTimeout(mouseIdleState.timeoutId);
        mouseIdleState.timeoutId = null;
    }
    
    // Remove idle classes if present
    if (mouseIdleState.isIdle) {
        mouseIdleState.isIdle = false;
        document.body.classList.remove('no-mouse-move');
        if (mouseIdleState.currentSection) {
            document.body.classList.remove('no-mouse-move-' + mouseIdleState.currentSection);
            mouseIdleState.currentSection = null;
        }
    }
}

// Expose functions globally for use by detail.js
window.startMouseIdleDetection = startMouseIdleDetection;
window.stopMouseIdleDetection = stopMouseIdleDetection;

