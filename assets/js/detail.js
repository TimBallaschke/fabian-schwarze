// Detail view state
let detailViewState = {
    isOpen: false,
    currentIndex: 0,
    uniqueProjectCount: 0,
    allProjects: [],
    allDuplicates: [],
    projectsContainer: null,
    detailDuplicatesContainer: null,
    visibleClones: []
};

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
    );
}

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
    
    // Remove any existing clones
    detailViewState.visibleClones.forEach(clone => clone.remove());
    detailViewState.visibleClones = [];
    
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
    
    // Update state
    detailViewState = {
        isOpen: true,
        currentIndex: clickedIndex,
        uniqueProjectCount: uniqueProjectCount,
        allProjects: allProjectWrappers,
        allDuplicates: allDuplicates,
        projectsContainer: projectsContainer,
        detailDuplicatesContainer: detailDuplicatesContainer,
        visibleClones: []
    };
    
    // Create clones for ALL visible projects in the marquee viewport
    const clonedProjects = [];
    
    allProjectWrappers.forEach((wrapper, index) => {
        // Only clone projects that are currently visible in the viewport
        if (!isInViewport(wrapper)) return;
        
        // Get the position and dimensions of this project
        const rect = wrapper.getBoundingClientRect();
        
        // Get computed styles to replicate exactly
        const styles = getComputedStyle(wrapper);
        const padding = styles.getPropertyValue('padding');
        
        // Get CSS variables from the projects container (needed for squares color)
        const containerStyles = getComputedStyle(projectsContainer);
        const textColor = containerStyles.getPropertyValue('--text-color').trim();
        const backgroundColor = containerStyles.getPropertyValue('--background-color').trim();
        
        console.log('CSS Variables:', { textColor, backgroundColor });
        
        // Create a clone
        const clone = wrapper.cloneNode(true);
        clone.classList.add('marquee-project-clone');
        clone.dataset.marqueeIndex = index; // Store the index for matching with duplicate
        
        // Mark the clicked project's clone
        if (wrapper === clickedProjectWrapper) {
            clone.classList.add('clicked-clone');
        }
        
        // Position it exactly where the original project is
        clone.style.position = 'fixed';
        clone.style.boxSizing = 'border-box';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.padding = padding;
        clone.style.zIndex = '10000';
        clone.style.pointerEvents = 'none';
        clone.style.transition = 'none'; // No transition initially
        clone.style.overflow = 'visible';
        
        // Set CSS variables explicitly - needed for squares and other elements
        if (textColor) {
            clone.style.setProperty('--text-color', textColor);
            clone.style.color = textColor; // Also set color directly
        }
        if (backgroundColor) {
            clone.style.setProperty('--background-color', backgroundColor);
            clone.style.backgroundColor = backgroundColor; // Also set background-color directly
        }
        

        
        // Append clone to body
        document.body.appendChild(clone);
        
        // Explicitly set background color on square elements to ensure visibility
        const squares = clone.querySelectorAll('.square-top-left, .square-top-right, .square-bottom-left, .square-bottom-right');
        console.log('Found', squares.length, 'squares in clone', index);
        squares.forEach(square => {
            if (textColor) {
                square.style.backgroundColor = textColor;
                console.log('Set square backgroundColor to:', textColor, square);
            }
        });
        
        // Also set color on title and date elements
        const titleElements = clone.querySelectorAll('.project-title, .project-date');
        titleElements.forEach(element => {
            if (textColor) {
                element.style.color = textColor;
            }
        });
        
        // Store in state
        detailViewState.visibleClones.push(clone);
        clonedProjects.push({ index, isClicked: wrapper === clickedProjectWrapper });
    });
    
    // Move duplicates to show the clicked project
    scrollDuplicatesToIndex(clickedIndex);
    
    console.log('Clicked index:', clickedIndex);
    console.log('Unique projects:', uniqueProjectCount, 'Total duplicates:', allDuplicates.length);
    console.log('Created', clonedProjects.length, 'clones for visible projects:', clonedProjects);
    
    // Animate clones to their corresponding duplicates
    // Use requestAnimationFrame to ensure duplicates are in position first
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            detailViewState.visibleClones.forEach(clone => {
                const marqueeIndex = parseInt(clone.dataset.marqueeIndex, 10);
                const correspondingDuplicate = allDuplicates[marqueeIndex];
                
                if (!correspondingDuplicate) return;
                
                // Get the duplicate's position and styles after it has been scrolled
                const duplicateRect = correspondingDuplicate.getBoundingClientRect();
                const duplicateStyles = getComputedStyle(correspondingDuplicate);
                const duplicatePadding = duplicateStyles.getPropertyValue('padding');
                
                // Add transition for smooth animation
                clone.style.transition = 'all 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                
                // Animate to duplicate's position and size
                clone.style.left = duplicateRect.left + 'px';
                clone.style.top = duplicateRect.top + 'px';
                clone.style.width = duplicateRect.width + 'px';
                clone.style.height = duplicateRect.height + 'px';
                clone.style.padding = duplicatePadding;
                
                console.log('Animating clone', marqueeIndex, 'to duplicate position:', duplicateRect.left, duplicateRect.top);
            });
        });
    });
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
