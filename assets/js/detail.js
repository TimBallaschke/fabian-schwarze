// Detail view state
let detailViewState = {
    isOpen: false,
    currentIndex: 0,
    allProjects: [],
    activeClones: new Map(), // Map of index -> clone element
    projectsContainer: null,
    destinationWidth: 0,
    destinationHeight: 0,
    destinationLeft: 0,
    destinationTop: 0,
    backgroundColor: '',
    textColor: ''
};

// Check if element is in viewport (even partially)
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
    );
}

// Handle click on clone for navigation
function handleCloneClick(event) {
    event.stopPropagation(); // Prevent closing detail view
    
    const clone = event.currentTarget;
    const index = parseInt(clone.dataset.projectIndex, 10);
    
    // If clicking on current project, check which half was clicked
    if (index === detailViewState.currentIndex) {
        const rect = clone.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const halfWidth = rect.width / 2;
        
        if (clickX < halfWidth) {
            navigatePrev();
        } else {
            navigateNext();
        }
    } else {
        // Clicking on a different project navigates to it
        navigateToProject(index);
    }
}

// Create a clone for a specific project index
function createCloneForIndex(index, animateFromOriginal = true) {
    const state = detailViewState;
    if (index < 0 || index >= state.allProjects.length) return null;
    if (state.activeClones.has(index)) return state.activeClones.get(index);
    
    const wrapper = state.allProjects[index];
    const currentRect = wrapper.getBoundingClientRect();
    
    // Calculate final position for this clone
    const relativePosition = index - state.currentIndex;
    const finalLeft = state.destinationLeft + (relativePosition * state.destinationWidth);
    
    // Clone the wrapper
    const clone = wrapper.cloneNode(true);
    clone.classList.add('project-clone');
    clone.dataset.projectIndex = index;
    clone.style.cursor = 'pointer';
    clone.addEventListener('click', handleCloneClick);
    
    if (animateFromOriginal) {
        // Animate from original position
        clone.style.setProperty('--clone-initial-left', currentRect.left + 'px');
        clone.style.setProperty('--clone-initial-top', currentRect.top + 'px');
        clone.style.setProperty('--clone-initial-width', currentRect.width + 'px');
        clone.style.setProperty('--clone-initial-height', currentRect.height + 'px');
    } else {
        // Start at final position (for navigation - already in detail view)
        clone.style.setProperty('--clone-initial-left', finalLeft + 'px');
        clone.style.setProperty('--clone-initial-top', state.destinationTop + 'px');
        clone.style.setProperty('--clone-initial-width', state.destinationWidth + 'px');
        clone.style.setProperty('--clone-initial-height', state.destinationHeight + 'px');
        // Immediately add animate class since it's already in detail view
        clone.classList.add('animate-to-detail');
    }
    
    clone.style.setProperty('--clone-final-left', finalLeft + 'px');
    clone.style.setProperty('--clone-final-top', state.destinationTop + 'px');
    clone.style.setProperty('--clone-final-width', state.destinationWidth + 'px');
    clone.style.setProperty('--clone-final-height', state.destinationHeight + 'px');
    
    // Copy color variables
    clone.style.setProperty('--background-color', state.backgroundColor);
    clone.style.setProperty('--text-color', state.textColor);
    
    document.body.appendChild(clone);
    state.activeClones.set(index, clone);
    
    console.log('Created clone for index:', index, 'animateFromOriginal:', animateFromOriginal);
    
    return clone;
}

// Update clone positions based on current index
function updateClonePositions() {
    const state = detailViewState;
    
    state.activeClones.forEach((clone, index) => {
        const relativePosition = index - state.currentIndex;
        const finalLeft = state.destinationLeft + (relativePosition * state.destinationWidth);
        clone.style.setProperty('--clone-final-left', finalLeft + 'px');
    });
}

// Navigate to a specific project index
function navigateToProject(newIndex) {
    const state = detailViewState;
    if (newIndex < 0 || newIndex >= state.allProjects.length) return;
    if (newIndex === state.currentIndex) return;
    
    state.currentIndex = newIndex;
    
    // Ensure we have clones for current, prev, and next
    createCloneForIndex(newIndex - 1, false);
    createCloneForIndex(newIndex, false);
    createCloneForIndex(newIndex + 1, false);
    
    // Update all clone positions
    updateClonePositions();
    
    // Remove clones that are too far away (more than 2 positions from current)
    state.activeClones.forEach((clone, index) => {
        if (Math.abs(index - newIndex) > 2) {
            clone.remove();
            state.activeClones.delete(index);
        }
    });
    
    console.log('Navigated to index:', newIndex);
}

// Navigate to next project
function navigateNext() {
    navigateToProject(detailViewState.currentIndex + 1);
}

// Navigate to previous project
function navigatePrev() {
    navigateToProject(detailViewState.currentIndex - 1);
}

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
    const allProjectWrappers = Array.from(projectsContainer.querySelectorAll('.single-project-wrapper'));
    
    // Find the index of the clicked wrapper
    const clickedIndex = allProjectWrappers.indexOf(clickedProjectWrapper);
    
    // Find the projects-container-top and projects-container-bottom elements
    const topElement = projectsContainer.querySelector('.projects-container-top');
    const bottomElement = projectsContainer.querySelector('.projects-container-bottom');
    
    // Calculate their heights
    const topHeight = topElement ? topElement.getBoundingClientRect().height : 0;
    const bottomHeight = bottomElement ? bottomElement.getBoundingClientRect().height : 0;
    
    // Calculate destination size and position
    const destinationWidth = window.innerWidth;
    const destinationHeight = window.innerHeight - topHeight - bottomHeight;
    const destinationLeft = (window.innerWidth - destinationWidth) / 2;
    const destinationTop = topHeight;
    
    // Get the CSS variables from the container
    const containerStyles = getComputedStyle(projectsContainer);
    const backgroundColor = containerStyles.getPropertyValue('--background-color').trim();
    const textColor = containerStyles.getPropertyValue('--text-color').trim();
    
    // Initialize detail view state
    detailViewState = {
        isOpen: true,
        currentIndex: clickedIndex,
        allProjects: allProjectWrappers,
        activeClones: new Map(),
        projectsContainer: projectsContainer,
        destinationWidth: destinationWidth,
        destinationHeight: destinationHeight,
        destinationLeft: destinationLeft,
        destinationTop: destinationTop,
        backgroundColor: backgroundColor,
        textColor: textColor
    };
    
    // Only create clones for projects that are visible in the viewport
    const visibleClones = [];
    allProjectWrappers.forEach((wrapper, index) => {
        const inViewport = isInViewport(wrapper);
        console.log('Project', index, 'in viewport:', inViewport, wrapper.getBoundingClientRect());
        if (inViewport) {
            const clone = createCloneForIndex(index, true);
            if (clone) visibleClones.push(clone);
        }
    });
    
    console.log('Clicked index:', clickedIndex);
    console.log('Total projects:', allProjectWrappers.length);
    console.log('Visible clones created:', visibleClones.length);
    
    // Trigger animation by adding the animate class after a frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            console.log('Adding animate-to-detail to', visibleClones.length, 'clones');
            visibleClones.forEach(clone => {
                clone.classList.add('animate-to-detail');
                console.log('Clone now has classes:', clone.className);
            });
        });
    });

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
    
    // Remove all clones
    detailViewState.activeClones.forEach(clone => {
        clone.remove();
    });
    detailViewState.activeClones.clear();
    
    // Reset state
    detailViewState.isOpen = false;
    
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
            // Prevent any default behavior and stop propagation
            event.preventDefault();
            event.stopPropagation();
            
            // Call the openProject function with the clicked element
            openProject(this);
        });
        
        // Optional: Add cursor pointer style to indicate clickability
        image.style.cursor = 'pointer';
    });
    
    // Add keyboard event listener for closing and navigating detail view
    document.addEventListener('keydown', function(event) {
        if (!document.body.classList.contains('detail-view-active')) return;
        
        if (event.key === 'Escape') {
            closeDetailView();
        } else if (event.key === 'ArrowRight') {
            navigateNext();
        } else if (event.key === 'ArrowLeft') {
            navigatePrev();
        }
    });
    
    // Add click event listener to close detail view when clicking outside clones
    document.addEventListener('click', function(event) {
        if (document.body.classList.contains('detail-view-active')) {
            // Check if click is on a clone (handled by clone click handler)
            const isClickOnClone = event.target.closest('.project-clone');
            
            // Only close if clicking outside the clones entirely
            if (!isClickOnClone) {
                closeDetailView();
            }
        }
    });
});
