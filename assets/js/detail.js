// Mouse movement tracking variables
let mouseMoveTimeout = null;
let isDetailViewActive = false;

// Function to handle mouse movement
function handleMouseMove() {
    // Remove the no-mouse-move class if it exists
    if (document.body.classList.contains('no-mouse-move')) {
        document.body.classList.remove('no-mouse-move');
    }
    
    // Clear existing timeout
    if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
    }
    
    // Only set timeout if detail view is active
    if (isDetailViewActive) {
        mouseMoveTimeout = setTimeout(() => {
            document.body.classList.add('no-mouse-move');
        }, 3000); // 3 seconds
    }
}

// Function to start mouse movement tracking
function startMouseTracking() {
    isDetailViewActive = true;
    document.addEventListener('mousemove', handleMouseMove);
    // Start the initial timeout
    handleMouseMove();
}

// Function to stop mouse movement tracking
function stopMouseTracking() {
    isDetailViewActive = false;
    document.removeEventListener('mousemove', handleMouseMove);
    
    // Clear timeout and remove class
    if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
        mouseMoveTimeout = null;
    }
    
    if (document.body.classList.contains('no-mouse-move')) {
        document.body.classList.remove('no-mouse-move');
    }
}

// Function to handle project opening
function openProject(projectElement) {

    document.body.classList.add('detail-view-active');
    
    // Start mouse movement tracking
    startMouseTracking();

    // Stop all marquee animations first
    if (window.stopAllMarquees) {
        window.stopAllMarquees();
    }
    
    // Find the clicked project's container
    const clickedProjectWrapper = projectElement.closest('.single-project-wrapper');
    
    if (!clickedProjectWrapper) return;
    
    // Find the projects-container and all project wrappers within it
    const projectsContainer = clickedProjectWrapper.closest('.projects-container');
    const allProjectWrappers = projectsContainer.querySelectorAll('.single-project-wrapper');
    
    // Find the index of the clicked wrapper
    let clickedIndex = -1;
    allProjectWrappers.forEach((wrapper, index) => {
        if (wrapper === clickedProjectWrapper) {
            clickedIndex = index;
        }
    });
    
    // Find the projects-container-top and projects-container-bottom elements
    const topElement = projectsContainer.querySelector('.projects-container-top');
    const bottomElement = projectsContainer.querySelector('.projects-container-bottom');
    
    // Calculate their heights
    const topHeight = topElement ? topElement.getBoundingClientRect().height : 0;
    const bottomHeight = bottomElement ? bottomElement.getBoundingClientRect().height : 0;
    
    // Calculate destination size and position
    const destinationWidth = window.innerWidth; // 100vw
    // Convert 1.6rem to pixels
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const remInPixels = 1.6 * rootFontSize;
    const destinationHeight = window.innerHeight - topHeight - bottomHeight; // 100vh - top - bottom
    const destinationLeft = (window.innerWidth - destinationWidth) / 2; // centered horizontally
    const destinationTop = topHeight + (destinationHeight - destinationHeight) / 2; // centered in available space
    
    // Clone and animate all project wrappers
    const clones = [];
    
    allProjectWrappers.forEach((wrapper, index) => {
        // Get current position and size
        const currentRect = wrapper.getBoundingClientRect();
        
        // Clone the wrapper including all innerHTML
        const clone = wrapper.cloneNode(true);

        // Add transition for smooth animation
        clone.style.transition = 'all 800ms cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        // Set initial position (current position) with fixed positioning
        clone.style.position = 'fixed';
        clone.style.left = currentRect.left + 'px';
        clone.style.top = currentRect.top + 'px';
        clone.style.width = currentRect.width + 'px';
        clone.style.height = currentRect.height + 'px';
        clone.style.zIndex = '9999';
        clone.style.padding = '0.45rem 0.225rem';
        clone.style.backgroundColor = 'var(--background-color)';
        
        // Add clone to the same projects-container
        projectsContainer.appendChild(clone);
        

        
        clones.push({
            clone: clone,
            index: index,
            isClicked: index === clickedIndex
        });
    });
    
    console.log('Clicked index:', clickedIndex);
    console.log('Total wrappers:', allProjectWrappers.length);
    
    // Animate all clones to their destination positions
    requestAnimationFrame(() => {
        clones.forEach((cloneData) => {
            const { clone, index, isClicked } = cloneData;
            
            // Calculate horizontal position relative to clicked element
            // Clicked element at center (0), others at -100vw, +100vw, -200vw, +200vw, etc.
            const relativePosition = index - clickedIndex;
            const finalLeft = destinationLeft + (relativePosition * destinationWidth);
            
            // Animate to final position and size
            clone.style.left = finalLeft + 'px';
            clone.style.top = destinationTop + 'px';
            clone.style.width = destinationWidth + 'px';
            clone.style.height = destinationHeight + 'px';
            clone.style.padding = '2rem 4rem 3rem 4rem';
            
            console.log(`Element ${index} (${isClicked ? 'CLICKED' : 'other'}):`, {
                relativePosition: relativePosition,
                finalLeft: finalLeft,
                finalTop: destinationTop
            });
        });
    });

    setTimeout(() => {
        allProjectWrappers.forEach((wrapper) => {
            wrapper.style.display = 'none';
        });
    }, 1000);

    const allProjectsContainers = document.querySelectorAll('.projects-container');
    allProjectsContainers.forEach(container => {
        if (container !== projectsContainer) {
            console.log('adding not-visible to', container);
            container.classList.add('not-visible');
        } else {
            container.classList.add('detail-view');
        }
    });
}

// Function to close detail view and clean up
function closeDetailView() {
    document.body.classList.remove('detail-view-active');
    stopMouseTracking();
    
    // Remove detail-view class from all containers
    const allProjectsContainers = document.querySelectorAll('.projects-container');
    allProjectsContainers.forEach(container => {
        container.classList.remove('detail-view', 'not-visible');
    });
    
    // Show all project wrappers again
    const allProjectWrappers = document.querySelectorAll('.single-project-wrapper');
    allProjectWrappers.forEach((wrapper) => {
        wrapper.style.display = '';
    });
    
    // Remove all clones
    const clones = document.querySelectorAll('.single-project-wrapper[style*="position: fixed"]');
    clones.forEach(clone => {
        clone.remove();
    });
}

// Function to update the CSS custom property based on actual element width
function updateProjectWidthVariable() {
    const projectWrapper = document.querySelector('.single-project-wrapper');
    
    if (projectWrapper) {
        // Get the computed width of the element
        const computedStyle = window.getComputedStyle(projectWrapper);
        const actualHeight = computedStyle.height;
        
        // Set the CSS custom property to match the actual width
        document.documentElement.style.setProperty('--single-project-width', actualHeight);
        
        console.log('Updated --single-project-height to:', actualHeight);
    } else {
        console.warn('No .single-project-wrapper element found to measure');
    }
}

// Add event listeners to all single-project-wrapper elements
document.addEventListener('DOMContentLoaded', function() {
    // Update the CSS custom property based on actual element width
    updateProjectWidthVariable();
    
    // Also update on window resize to handle responsive changes
    window.addEventListener('resize', function() {
        updateProjectWidthVariable();
    });
    
    // Get all elements with the class 'single-project-wrapper'
    const projectImages = document.querySelectorAll('.project-image');
    
    // Add click event listener to each wrapper
    projectImages.forEach(function(image) {
        image.addEventListener('click', function(event) {
            // Prevent any default behavior
            event.preventDefault();
            
            // Call the openProject function with the clicked element
            openProject(this);
        });
        
        // Optional: Add cursor pointer style to indicate clickability
        image.style.cursor = 'pointer';
    });
    
    // Add keyboard event listener for closing detail view
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && document.body.classList.contains('detail-view-active')) {
            closeDetailView();
        }
    });
    
    // Add click event listener to close detail view when clicking outside
    document.addEventListener('click', function(event) {
        if (document.body.classList.contains('detail-view-active')) {
            // Check if click is outside of any project content
            const isClickOnProject = event.target.closest('.single-project-wrapper') || 
                                   event.target.closest('.projects-container');
            
            if (!isClickOnProject) {
                closeDetailView();
            }
        }
    });
});
