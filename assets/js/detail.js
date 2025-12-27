// Detail view state
let detailViewState = {
    isOpen: false,
    currentIndex: 0,
    uniqueProjectCount: 0,
    allProjects: [],
    allDuplicates: [],
    projectsContainer: null,
    detailDuplicatesContainer: null,
    clickedClone: null
};

// Move duplicates container to show the current index
function scrollDuplicatesToIndex(index) {
    const state = detailViewState;
    if (!state.detailDuplicatesContainer) return;
    
    // Each duplicate is 100vw wide, so translate by -index * 100vw
    const translateX = -(index * window.innerWidth);
    state.detailDuplicatesContainer.style.transform = `translateX(${translateX}px)`;
    
    console.log('Scrolled duplicates to index:', index, 'translateX:', translateX);
}

// Function to handle project opening
function openProject(projectElement) {
    console.log('Opening project');
    
    // Remove any existing clone
    if (detailViewState.clickedClone) {
        detailViewState.clickedClone.remove();
        detailViewState.clickedClone = null;
    }
    
    // Find the clicked project's container
    const clickedProjectWrapper = projectElement.closest('.single-project-wrapper');
    if (!clickedProjectWrapper) return;
    
    // Find the projects-container
    const projectsContainer = clickedProjectWrapper.closest('.projects-container');
    const allProjectWrappers = Array.from(projectsContainer.querySelectorAll('.marquee-content .single-project-wrapper'));
    
    // Find the detail duplicates container
    const detailDuplicatesContainer = projectsContainer.querySelector('.detail-view-duplicates');
    const allDuplicates = Array.from(detailDuplicatesContainer.querySelectorAll('.detail-duplicate'));
    
    // Calculate unique project count (total duplicates / 4 sets)
    const uniqueProjectCount = allDuplicates.length / 4;
    
    // Find the index of the clicked wrapper in the marquee
    const clickedIndex = allProjectWrappers.indexOf(clickedProjectWrapper);
    
    // Get the position and dimensions of the clicked project
    const clickedRect = clickedProjectWrapper.getBoundingClientRect();
    
    // Get computed styles of the clicked project to replicate exactly
    const clickedStyles = getComputedStyle(clickedProjectWrapper);
    const backgroundColor = clickedStyles.getPropertyValue('background-color');
    const color = clickedStyles.getPropertyValue('color');
    
    // Create a clone of the clicked project
    const clone = clickedProjectWrapper.cloneNode(true);
    clone.classList.add('clicked-project-clone');
    
    // Position it exactly where the clicked project is
    clone.style.position = 'fixed';
    clone.style.left = clickedRect.left + 'px';
    clone.style.top = clickedRect.top + 'px';
    clone.style.width = clickedRect.width + 'px';
    clone.style.height = clickedRect.height + 'px';
    clone.style.backgroundColor = backgroundColor;
    clone.style.color = color;
    clone.style.zIndex = '10000';
    clone.style.pointerEvents = 'none';
    
    // Append clone to body
    document.body.appendChild(clone);
    
    // Update state
    detailViewState = {
        isOpen: true,
        currentIndex: clickedIndex,
        uniqueProjectCount: uniqueProjectCount,
        allProjects: allProjectWrappers,
        allDuplicates: allDuplicates,
        projectsContainer: projectsContainer,
        detailDuplicatesContainer: detailDuplicatesContainer,
        clickedClone: clone
    };
    
    // Move duplicates to show the clicked project
    scrollDuplicatesToIndex(clickedIndex);
    
    console.log('Clicked index:', clickedIndex);
    console.log('Unique projects:', uniqueProjectCount, 'Total duplicates:', allDuplicates.length);
    console.log('Created clone at position:', clickedRect.left, clickedRect.top);
}

// Navigate to next project
function navigateNext() {
    const state = detailViewState;
    if (!state.isOpen) return;
    
    let newIndex = state.currentIndex + 1;
    
    // Handle infinite looping - jump to middle sets when hitting edges
    if (newIndex >= state.uniqueProjectCount * 3) {
        newIndex -= state.uniqueProjectCount * 2;
    }
    
    state.currentIndex = newIndex;
    scrollDuplicatesToIndex(newIndex);
}

// Navigate to previous project
function navigatePrev() {
    const state = detailViewState;
    if (!state.isOpen) return;
    
    let newIndex = state.currentIndex - 1;
    
    // Handle infinite looping - jump to middle sets when hitting edges
    if (newIndex < state.uniqueProjectCount) {
        newIndex += state.uniqueProjectCount * 2;
    }
    
    state.currentIndex = newIndex;
    scrollDuplicatesToIndex(newIndex);
}

// Function to update the CSS custom property based on actual element width
function updateProjectWidthVariable() {
    const projectWrapper = document.querySelector('.single-project-wrapper');
    
    if (projectWrapper) {
        const computedStyle = window.getComputedStyle(projectWrapper);
        const actualHeight = computedStyle.height;
        document.documentElement.style.setProperty('--single-project-width', actualHeight);
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

    // Navigation buttons
    const navigationButtons = document.querySelectorAll('.section-navigation .circle-button');
    navigationButtons.forEach(function(button) {
        const label = button.textContent.trim().toLowerCase();
        if (label !== 'previous' && label !== 'next') return;

        button.addEventListener('click', function(event) {
            if (!detailViewState.isOpen) return;
            const container = button.closest('.projects-container');
            if (container !== detailViewState.projectsContainer) return;
            event.preventDefault();
            event.stopPropagation();

            if (label === 'previous') {
                navigatePrev();
            } else if (label === 'next') {
                navigateNext();
            }
        });
    });
});
