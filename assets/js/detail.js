// Detail view state
let detailViewState = {
    isOpen: false,
    currentIndex: 0,
    totalProjects: 0,
    allProjects: [],
    activeClones: new Map(),
    projectsContainer: null,
    detailDuplicatesContainer: null,
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

// Handle click on duplicate for navigation
function handleDuplicateClick(event) {
    event.stopPropagation();
    
    const duplicate = event.currentTarget;
    const index = parseInt(duplicate.dataset.projectIndex, 10);
    
    // If clicking on current project, check which half was clicked
    if (index === detailViewState.currentIndex) {
        const rect = duplicate.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const halfWidth = rect.width / 2;
        
        if (clickX < halfWidth) {
            navigatePrev();
        } else {
            navigateNext();
        }
    } else {
        navigateToProject(index);
    }
}

// Create a clone for a specific project index (for initial animation only)
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
    
    if (animateFromOriginal) {
        // Animate from original position
        clone.style.setProperty('--clone-initial-left', currentRect.left + 'px');
        clone.style.setProperty('--clone-initial-top', currentRect.top + 'px');
        clone.style.setProperty('--clone-initial-width', currentRect.width + 'px');
        clone.style.setProperty('--clone-initial-height', currentRect.height + 'px');
    } else {
        // Start at final position
        clone.style.setProperty('--clone-initial-left', finalLeft + 'px');
        clone.style.setProperty('--clone-initial-top', state.destinationTop + 'px');
        clone.style.setProperty('--clone-initial-width', state.destinationWidth + 'px');
        clone.style.setProperty('--clone-initial-height', state.destinationHeight + 'px');
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
    
    return clone;
}

// Update duplicate positions based on current index
function updateDuplicatePositions() {
    const state = detailViewState;
    if (!state.detailDuplicatesContainer) return;
    
    const duplicates = state.detailDuplicatesContainer.querySelectorAll('.detail-duplicate');
    duplicates.forEach((duplicate, index) => {
        const relativePosition = index - state.currentIndex;
        const left = state.destinationLeft + (relativePosition * state.destinationWidth);
        duplicate.style.setProperty('--duplicate-left', left + 'px');
    });
}

// Navigate to a specific project index (using duplicates)
function navigateToProject(newIndex) {
    const state = detailViewState;
    if (newIndex < 0 || newIndex >= state.totalProjects) return;
    if (newIndex === state.currentIndex) return;
    
    state.currentIndex = newIndex;
    updateDuplicatePositions();
    
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

// Show duplicates and hide clones (called after clone animation completes)
function transitionToduplicates() {
    const state = detailViewState;
    
    // Add class to show duplicates
    state.projectsContainer.classList.add('duplicates-active');
    
    // Hide all clones
    state.activeClones.forEach(clone => {
        clone.style.display = 'none';
    });
    
    console.log('Transitioned to duplicates');
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
    
    // Find the projects-container
    const projectsContainer = clickedProjectWrapper.closest('.projects-container');
    const allProjectWrappers = Array.from(projectsContainer.querySelectorAll('.marquee-content .single-project-wrapper'));
    
    // Find the detail duplicates container
    const detailDuplicatesContainer = projectsContainer.querySelector('.detail-view-duplicates');
    const totalProjects = detailDuplicatesContainer.querySelectorAll('.detail-duplicate').length;
    
    // Find the index of the clicked wrapper (mod by unique projects since marquee repeats 4x)
    const clickedWrapperIndex = allProjectWrappers.indexOf(clickedProjectWrapper);
    const clickedIndex = clickedWrapperIndex % totalProjects;
    
    // Find the projects-container-top and projects-container-bottom elements
    const topElement = projectsContainer.querySelector('.projects-container-top');
    const bottomElement = projectsContainer.querySelector('.projects-container-bottom');
    
    // Calculate their heights
    const topHeight = topElement ? topElement.getBoundingClientRect().height : 0;
    const bottomHeight = bottomElement ? bottomElement.getBoundingClientRect().height : 0;
    
    // Calculate destination size and position
    const destinationWidth = window.innerWidth;
    const destinationHeight = window.innerHeight - topHeight - bottomHeight;
    const destinationLeft = 0;
    const destinationTop = topHeight;
    
    // Get the CSS variables from the container
    const containerStyles = getComputedStyle(projectsContainer);
    const backgroundColor = containerStyles.getPropertyValue('--background-color').trim();
    const textColor = containerStyles.getPropertyValue('--text-color').trim();
    
    // Initialize detail view state
    detailViewState = {
        isOpen: true,
        currentIndex: clickedIndex,
        totalProjects: totalProjects,
        allProjects: allProjectWrappers,
        activeClones: new Map(),
        projectsContainer: projectsContainer,
        detailDuplicatesContainer: detailDuplicatesContainer,
        destinationWidth: destinationWidth,
        destinationHeight: destinationHeight,
        destinationLeft: destinationLeft,
        destinationTop: destinationTop,
        backgroundColor: backgroundColor,
        textColor: textColor
    };
    
    // Set up duplicates with correct positioning
    const duplicates = detailDuplicatesContainer.querySelectorAll('.detail-duplicate');
    duplicates.forEach((duplicate, index) => {
        // Set the fixed position CSS variables
        duplicate.style.setProperty('--duplicate-top', destinationTop + 'px');
        duplicate.style.setProperty('--duplicate-width', destinationWidth + 'px');
        duplicate.style.setProperty('--duplicate-height', destinationHeight + 'px');
        duplicate.style.setProperty('--background-color', backgroundColor);
        duplicate.style.setProperty('--text-color', textColor);
        
        // Calculate initial left position based on clicked index
        const relativePosition = index - clickedIndex;
        const left = destinationLeft + (relativePosition * destinationWidth);
        duplicate.style.setProperty('--duplicate-left', left + 'px');
        
        // Add click handler
        duplicate.addEventListener('click', handleDuplicateClick);
    });
    
    // Create clones for visible projects (for animation)
    const visibleClones = [];
    const createdUniqueIndices = new Set();
    
    allProjectWrappers.forEach((wrapper, marqueeIndex) => {
        if (isInViewport(wrapper)) {
            // Calculate the unique project index (handles 4x repetition in marquee)
            const uniqueIndex = marqueeIndex % totalProjects;
            
            // Only create one clone per unique project
            if (!createdUniqueIndices.has(uniqueIndex)) {
                createdUniqueIndices.add(uniqueIndex);
                
                const currentRect = wrapper.getBoundingClientRect();
                
                // Calculate final position based on unique index relative to clicked project
                const relativePosition = uniqueIndex - clickedIndex;
                const finalLeft = destinationLeft + (relativePosition * destinationWidth);
                
                // Clone the wrapper
                const clone = wrapper.cloneNode(true);
                clone.classList.add('project-clone');
                clone.dataset.projectIndex = uniqueIndex;
                
                // Set initial position (from original location)
                clone.style.setProperty('--clone-initial-left', currentRect.left + 'px');
                clone.style.setProperty('--clone-initial-top', currentRect.top + 'px');
                clone.style.setProperty('--clone-initial-width', currentRect.width + 'px');
                clone.style.setProperty('--clone-initial-height', currentRect.height + 'px');
                
                // Set final position
                clone.style.setProperty('--clone-final-left', finalLeft + 'px');
                clone.style.setProperty('--clone-final-top', destinationTop + 'px');
                clone.style.setProperty('--clone-final-width', destinationWidth + 'px');
                clone.style.setProperty('--clone-final-height', destinationHeight + 'px');
                
                // Copy color variables
                clone.style.setProperty('--background-color', backgroundColor);
                clone.style.setProperty('--text-color', textColor);
                
                document.body.appendChild(clone);
                detailViewState.activeClones.set(uniqueIndex, clone);
                visibleClones.push(clone);
                
                console.log('Created clone for unique index:', uniqueIndex, 'from marquee index:', marqueeIndex);
            }
        }
    });
    
    console.log('Clicked index:', clickedIndex);
    console.log('Total projects:', totalProjects);
    console.log('Visible clones created:', visibleClones.length);
    
    // Trigger clone animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            visibleClones.forEach(clone => {
                clone.classList.add('animate-to-detail');
            });
            
            // After animation completes, transition to duplicates
            setTimeout(() => {
                transitionToduplicates();
            }, 750); // Slightly longer than the 700ms transition
        });
    });

    // Add classes to containers
    const allProjectsContainers = document.querySelectorAll('.projects-container');
    allProjectsContainers.forEach(container => {
        if (container !== projectsContainer) {
            container.classList.add('not-visible');
        } else {
            container.classList.add('detail-view');
        }
    });
}

// Function to update the CSS custom property based on actual element width
function updateProjectWidthVariable() {
    const projectWrapper = document.querySelector('.single-project-wrapper');
    
    if (projectWrapper) {
        const computedStyle = window.getComputedStyle(projectWrapper);
        const actualHeight = computedStyle.height;
        document.documentElement.style.setProperty('--single-project-width', actualHeight);
        console.log('Updated --single-project-height to:', actualHeight);
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    updateProjectWidthVariable();
    
    window.addEventListener('resize', function() {
        updateProjectWidthVariable();
    });
    
    // Get all project images in marquee
    const projectImages = document.querySelectorAll('.marquee-content .project-image');
    
    projectImages.forEach(function(image) {
        image.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            openProject(this);
        });
        image.style.cursor = 'pointer';
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (!document.body.classList.contains('detail-view-active')) return;
        
        if (event.key === 'ArrowRight') {
            navigateNext();
        } else if (event.key === 'ArrowLeft') {
            navigatePrev();
        }
    });
});
