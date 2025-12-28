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
    
    // Stop all marquee animations
    if (window.stopAllMarquees) {
        window.stopAllMarquees();
    }
    
    // Remove any existing clones and duplicates-active class from previous project
    detailViewState.visibleClones.forEach(clone => clone.remove());
    detailViewState.visibleClones = [];
    
    if (detailViewState.projectsContainer) {
        detailViewState.projectsContainer.classList.remove('duplicates-active');
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
    
    // Get the clicked project's rect for calculating visual offsets
    const clickedRect = clickedProjectWrapper.getBoundingClientRect();
    const clickedCenterX = clickedRect.left + clickedRect.width / 2;
    
    // Get CSS variables from the projects container (needed for squares color)
    const containerStyles = getComputedStyle(projectsContainer);
    const textColor = containerStyles.getPropertyValue('--text-color').trim();
    const backgroundColor = containerStyles.getPropertyValue('--background-color').trim();
    
    allProjectWrappers.forEach((wrapper, index) => {
        // Skip filtered-out projects (collapsed to width: 0)
        if (wrapper.getAttribute('data-visible') === 'false' || wrapper.classList.contains('filter-2')) return;
        
        // Only clone projects that are currently visible in the viewport
        if (!isInViewport(wrapper)) return;
        
        // Get the position and dimensions of this project
        const rect = wrapper.getBoundingClientRect();
        
        // Calculate visual offset from clicked project (in terms of project widths)
        const wrapperCenterX = rect.left + rect.width / 2;
        const visualOffset = Math.round((wrapperCenterX - clickedCenterX) / rect.width);
        
        // Get computed styles to replicate exactly
        const styles = getComputedStyle(wrapper);
        const padding = styles.getPropertyValue('padding');
        
        console.log('CSS Variables:', { textColor, backgroundColor });
        
        // Create a clone
        const clone = wrapper.cloneNode(true);
        clone.classList.add('marquee-project-clone');
        clone.dataset.marqueeIndex = index; // Store the index for matching with duplicate
        clone.dataset.visualOffset = visualOffset; // Store visual offset for animation
        
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
                
                // Set initial image size (80% for marquee state)
                const cloneImage = clone.querySelector('.project-image');
                if (cloneImage) {
                    cloneImage.style.maxWidth = '80%';
                    cloneImage.style.maxHeight = '80%';
                    cloneImage.style.transition = 'max-width 700ms cubic-bezier(0.4, 0.0, 0.2, 1), max-height 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                }
                
                // Store in state
                detailViewState.visibleClones.push(clone);
        clonedProjects.push({ index, visualOffset, isClicked: wrapper === clickedProjectWrapper });
    });
    
    // Move duplicates to show the clicked project
    scrollDuplicatesToIndex(clickedIndex);
    
    console.log('Clicked index:', clickedIndex);
    console.log('Unique projects:', uniqueProjectCount, 'Total duplicates:', allDuplicates.length);
    console.log('Created', clonedProjects.length, 'clones for visible projects:', clonedProjects);
    
    // Animate clones to their corresponding duplicates
    // Use requestAnimationFrame to ensure everything starts together
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Apply classes to projects containers (synced with clone animation)
            const allProjectsContainers = document.querySelectorAll('.projects-container');
            allProjectsContainers.forEach(container => {
                if (container === projectsContainer) {
                    // Add detail-view to the clicked container
                    container.classList.add('detail-view');
                } else {
                    // Add not-visible to other containers
                    container.classList.add('not-visible');
                }
            });
            
            // Get the clicked duplicate's position as reference
            const clickedDuplicate = allDuplicates[clickedIndex];
            const clickedDuplicateRect = clickedDuplicate.getBoundingClientRect();
            const clickedDuplicateStyles = getComputedStyle(clickedDuplicate);
            const duplicatePadding = clickedDuplicateStyles.getPropertyValue('padding');
            
            detailViewState.visibleClones.forEach(clone => {
                const visualOffset = parseInt(clone.dataset.visualOffset, 10);
                
                // Calculate target position based on visual offset from clicked duplicate
                // Clicked duplicate is at center (position 0), others are offset by visualOffset * 100vw
                const targetLeft = clickedDuplicateRect.left + (visualOffset * window.innerWidth);
                
                // Add transition for smooth animation
                clone.style.transition = 'all 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                
                // Animate to calculated position (same size as clicked duplicate)
                clone.style.left = targetLeft + 'px';
                clone.style.top = clickedDuplicateRect.top + 'px';
                clone.style.width = clickedDuplicateRect.width + 'px';
                clone.style.height = clickedDuplicateRect.height + 'px';
                clone.style.padding = duplicatePadding;
                
                // Animate image to detail size (90%)
                const cloneImage = clone.querySelector('.project-image');
                if (cloneImage) {
                    cloneImage.style.maxWidth = '90%';
                    cloneImage.style.maxHeight = '90%';
                }
                
                console.log('Animating clone with visualOffset', visualOffset, 'to position:', targetLeft, clickedDuplicateRect.top);
            });
            
            // After animation completes, show duplicates and remove clones
            setTimeout(() => {
                // Add duplicates-active class to show the duplicates
                projectsContainer.classList.add('duplicates-active');
                
                // Remove all clones from DOM
                detailViewState.visibleClones.forEach(clone => clone.remove());
                detailViewState.visibleClones = [];
                
                console.log('Animation complete - showing duplicates, clones removed');
            }, 750); // Slightly longer than the 700ms transition
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

// Close detail view
function closeDetailView() {
    const state = detailViewState;
    if (!state.isOpen) return;
    
    console.log('Closing detail view');
    
    // Find the marquee wrapper in the current projects container
    const marqueeWrapper = state.projectsContainer.querySelector('.marquee-wrapper');
    if (!marqueeWrapper || !window.marqueeControls) {
        console.log('No marquee wrapper or controls found');
        return;
    }
    
    // Get the marquee control for this wrapper
    const marqueeControl = window.marqueeControls[marqueeWrapper.id];
    if (!marqueeControl || typeof marqueeControl.centerOnElement !== 'function') {
        console.log('No centerOnElement function available');
        return;
    }
    
    // Find the marquee element at the current index
    const currentMarqueeProject = state.allProjects[state.currentIndex];
    if (!currentMarqueeProject) {
        console.log('No marquee project found at index:', state.currentIndex);
        return;
    }
    
    console.log('=== CLOSE DEBUG ===');
    console.log('Current index:', state.currentIndex);
    console.log('Unique project count:', state.uniqueProjectCount);
    
    // Get current marquee element position and dimensions
    const currentMarqueeRect = currentMarqueeProject.getBoundingClientRect();
    const elementWidth = currentMarqueeRect.width;
    const elementHeight = currentMarqueeRect.height;
    const elementTop = currentMarqueeRect.top;
    
    // Calculate where the centered element SHOULD be
    const viewportCenterX = (window.innerWidth - elementWidth) / 2;
    
    // Calculate the delta (how much everything shifts to center the current element)
    const deltaX = viewportCenterX - currentMarqueeRect.left;
    console.log('Delta X to center:', deltaX);
    
    // Get styles from the container
    const containerStyles = getComputedStyle(state.projectsContainer);
    const textColor = containerStyles.getPropertyValue('--text-color').trim();
    const backgroundColor = containerStyles.getPropertyValue('--background-color').trim();
    
    // Get marquee project's padding for the animation target
    const marqueeStyles = getComputedStyle(currentMarqueeProject);
    const marqueePadding = marqueeStyles.getPropertyValue('padding');
    
    // Get the current duplicate's rect as reference
    const currentDuplicate = state.allDuplicates[state.currentIndex];
    const currentDuplicateRect = currentDuplicate.getBoundingClientRect();
    
    // Find all VISIBLE duplicates (not filtered out) and their visual offsets from current
    // We need to count only visible duplicates to calculate visual offsets
    const cloneData = [];
    
    // Build a list of visible duplicate indices, sorted by position
    const visibleDuplicateIndices = [];
    state.allDuplicates.forEach((dup, idx) => {
        if (dup.getAttribute('data-visible') !== 'false') {
            visibleDuplicateIndices.push(idx);
        }
    });
    
    // Find the position of the current index in the visible list
    const currentVisiblePosition = visibleDuplicateIndices.indexOf(state.currentIndex);
    
    console.log('Visible duplicates count:', visibleDuplicateIndices.length);
    console.log('Current visible position:', currentVisiblePosition);
    
    // Determine how many visible projects fit on each side
    const projectsOnEachSide = Math.ceil(window.innerWidth / 2 / elementWidth) + 1;
    
    // Create clones for visible duplicates within range
    for (let visualOffset = -projectsOnEachSide; visualOffset <= projectsOnEachSide; visualOffset++) {
        // Calculate the position in the visible list
        let visiblePosition = currentVisiblePosition + visualOffset;
        
        // Handle wraparound for infinite scroll (visible duplicates loop)
        const visibleCount = visibleDuplicateIndices.length;
        while (visiblePosition < 0) visiblePosition += visibleCount;
        while (visiblePosition >= visibleCount) visiblePosition -= visibleCount;
        
        const duplicateIndex = visibleDuplicateIndices[visiblePosition];
        const duplicate = state.allDuplicates[duplicateIndex];
        if (!duplicate) continue;
        
        const duplicateStyles = getComputedStyle(duplicate);
        
        // Create clone of the duplicate
        const clone = duplicate.cloneNode(true);
        clone.classList.add('duplicate-to-marquee-clone');
        clone.dataset.duplicateIndex = duplicateIndex;
        clone.dataset.visualOffset = visualOffset;
        
        // Position based on visual offset from current duplicate
        // Current duplicate is at center (0), others at visualOffset * 100vw
        const cloneStartLeft = visualOffset * window.innerWidth;
        
        clone.style.position = 'fixed';
        clone.style.boxSizing = 'border-box';
        clone.style.left = cloneStartLeft + 'px';
        clone.style.top = currentDuplicateRect.top + 'px';
        clone.style.width = currentDuplicateRect.width + 'px';
        clone.style.height = currentDuplicateRect.height + 'px';
        clone.style.padding = duplicateStyles.getPropertyValue('padding');
        clone.style.zIndex = '10000';
        clone.style.pointerEvents = 'none';
        clone.style.transition = 'none';
        clone.style.backgroundColor = backgroundColor;
        clone.style.setProperty('--text-color', textColor);
        clone.style.setProperty('--background-color', backgroundColor);
        
        // Set initial image size (90% for detail state)
        const cloneImage = clone.querySelector('.project-image');
        if (cloneImage) {
            cloneImage.style.maxWidth = '90%';
            cloneImage.style.maxHeight = '90%';
            cloneImage.style.transition = 'max-width 700ms cubic-bezier(0.4, 0.0, 0.2, 1), max-height 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
        }
        
        document.body.appendChild(clone);
        state.visibleClones.push(clone);
        
        // Target position in marquee: current at center, others at visual offsets
        const targetLeft = viewportCenterX + (visualOffset * elementWidth);
        
        console.log('Clone for visualOffset', visualOffset, 'starts at x:', cloneStartLeft, 'target:', targetLeft);
        
        // Store target position for animation
        cloneData.push({
            clone: clone,
            targetRect: {
                left: targetLeft,
                top: elementTop,
                width: elementWidth,
                height: elementHeight
            },
            duplicateIndex: duplicateIndex,
            visualOffset: visualOffset
        });
    }
    
    console.log('Total clones created:', cloneData.length);
    
    // Call centerOnElement to update the marquee (for when animation completes)
    marqueeControl.centerOnElement(currentMarqueeProject);
    
    // Animate all clones to their target positions
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Remove classes from all project containers
            const allProjectsContainers = document.querySelectorAll('.projects-container');
            allProjectsContainers.forEach(container => {
                container.classList.remove('detail-view');
                container.classList.remove('not-visible');
            });
            
            // Remove duplicates-active class
            state.projectsContainer.classList.remove('duplicates-active');
            
            cloneData.forEach(({ clone, targetRect, duplicateIndex, visualOffset }) => {
                clone.style.transition = 'all 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                clone.style.left = targetRect.left + 'px';
                clone.style.top = targetRect.top + 'px';
                clone.style.width = targetRect.width + 'px';
                clone.style.height = targetRect.height + 'px';
                clone.style.padding = marqueePadding;
                
                // Animate image to marquee size (80%)
                const cloneImage = clone.querySelector('.project-image');
                if (cloneImage) {
                    cloneImage.style.maxWidth = '80%';
                    cloneImage.style.maxHeight = '80%';
                }
                
                console.log('Animating clone (duplicate:', duplicateIndex, 'visualOffset:', visualOffset, ') to:', targetRect.left, targetRect.top);
            });
            
            // After animation completes, remove clones and reset state
            setTimeout(() => {
                // Remove all clones
                state.visibleClones.forEach(clone => clone.remove());
                state.visibleClones = [];
                
                // Reset detail view state
                state.isOpen = false;
                
                // Restart all marquees
                if (window.startAllMarquees) {
                    window.startAllMarquees();
                }
                
                console.log('Close animation complete - clones removed, state reset, marquees restarted');
            }, 750); // Slightly longer than the 700ms transition
            
            console.log('=== END CLOSE DEBUG ===');
        });
    });
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

    // Navigation buttons (previous, next, close)
    const navigationButtons = document.querySelectorAll('.section-navigation .circle-button');
    navigationButtons.forEach(function(button) {
        const label = button.textContent.trim().toLowerCase();
        if (label !== 'previous' && label !== 'next' && label !== 'close') return;

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
            } else if (label === 'close') {
                closeDetailView();
            }
        });
    });
});
