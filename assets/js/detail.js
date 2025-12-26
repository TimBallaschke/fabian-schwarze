// Function to handle project opening
function openProject(projectElement) {

    document.body.classList.add('detail-view-active');

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
    
    // Get the CSS variables from the container (needed since clones go to body)
    const containerStyles = getComputedStyle(projectsContainer);
    const backgroundColor = containerStyles.getPropertyValue('--background-color').trim();
    const textColor = containerStyles.getPropertyValue('--text-color').trim();
    
    // Clone and animate all project wrappers using CSS classes
    const clones = [];
    
    allProjectWrappers.forEach((wrapper, index) => {
        // Get current position and size
        const currentRect = wrapper.getBoundingClientRect();
        
        // Calculate final position for this clone
        const relativePosition = index - clickedIndex;
        const finalLeft = destinationLeft + (relativePosition * destinationWidth);
        
        // Clone the wrapper including all innerHTML
        const clone = wrapper.cloneNode(true);
        
        // Add the clone class and set CSS custom properties for positions
        clone.classList.add('project-clone');
        clone.style.setProperty('--clone-initial-left', currentRect.left + 'px');
        clone.style.setProperty('--clone-initial-top', currentRect.top + 'px');
        clone.style.setProperty('--clone-initial-width', currentRect.width + 'px');
        clone.style.setProperty('--clone-initial-height', currentRect.height + 'px');
        clone.style.setProperty('--clone-final-left', finalLeft + 'px');
        clone.style.setProperty('--clone-final-top', destinationTop + 'px');
        clone.style.setProperty('--clone-final-width', destinationWidth + 'px');
        clone.style.setProperty('--clone-final-height', destinationHeight + 'px');
        
        // Copy the container's color variables to the clone
        clone.style.setProperty('--background-color', backgroundColor);
        clone.style.setProperty('--text-color', textColor);
        
        // Append to body to isolate from marquee
        document.body.appendChild(clone);
        
        clones.push({
            clone: clone,
            index: index,
            isClicked: index === clickedIndex
        });
    });
    
    console.log('Clicked index:', clickedIndex);
    console.log('Total wrappers:', allProjectWrappers.length);
    
    // Trigger animation by adding the animate class after a frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            clones.forEach(({ clone }) => {
                clone.classList.add('animate-to-detail');
            });
        });
    });

    setTimeout(() => {
        allProjectWrappers.forEach((wrapper) => {
            wrapper.style.display = 'none';
        });
    }, 700);

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
    const clones = document.querySelectorAll('.project-clone');
    clones.forEach(clone => {
        clone.remove();
    });
    
    // Restart marquee animations
    if (window.startAllMarquees) {
        window.startAllMarquees();
    }
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
