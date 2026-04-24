// Detail view state (exposed globally for mouse-idle.js)
var detailViewState = {
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
    
    // Find the index of the clicked wrapper in the marquee, then normalize into the
    // 2nd detail-duplicate set so prev/next always has a full set of projects on each
    // side before hitting the teleport boundary. Duplicates are rendered 4× identically,
    // so targeting the 2nd-set duplicate is visually indistinguishable from the clicked one.
    const clickedIndexRaw = allProjectWrappers.indexOf(clickedProjectWrapper);
    const clickedIndex = (clickedIndexRaw % uniqueProjectCount) + uniqueProjectCount;

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
                    // Clear any leftover inline styles from previous syncs
                    cloneImage.style.filter = '';
                    cloneImage.style.opacity = '';
                    cloneImage.style.transition = 'none';
                    // Set initial size - use exact pixel values from current rendered size
                    const imgRect = cloneImage.getBoundingClientRect();
                    cloneImage.style.width = imgRect.width + 'px';
                    cloneImage.style.height = imgRect.height + 'px';
                    cloneImage.style.maxWidth = 'none';
                    cloneImage.style.maxHeight = 'none';
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
            
            // Get the detail duplicate's image dimensions for exact matching
            const duplicateImage = clickedDuplicate.querySelector('.project-image');
            const duplicateImageRect = duplicateImage ? duplicateImage.getBoundingClientRect() : null;
            
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
                
                // Animate image to exact detail duplicate image size
                const cloneImage = clone.querySelector('.project-image');
                if (cloneImage && duplicateImageRect) {
                    cloneImage.style.transition = 'width 700ms cubic-bezier(0.4, 0.0, 0.2, 1), height 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                    cloneImage.style.width = duplicateImageRect.width + 'px';
                    cloneImage.style.height = duplicateImageRect.height + 'px';
                }
                
                // Fade out the project date during transition
                const cloneDate = clone.querySelector('.project-date');
                if (cloneDate) {
                    cloneDate.style.transition = 'opacity 300ms ease-out, filter 350ms ease-out';
                    cloneDate.style.opacity = '0';
                }
                
                console.log('Animating clone with visualOffset', visualOffset, 'to position:', targetLeft, clickedDuplicateRect.top);
            });
            
            // Hide navigation elements in duplicates before they're shown
            allDuplicates.forEach(dup => {
                const nav = dup.querySelector('.project-navigation');
                if (nav) {
                    nav.style.opacity = '0';
                    nav.style.transition = 'none';
                }
            });
            
            // After animation completes, show duplicates and remove clones
            setTimeout(() => {
                // Add duplicates-active class to show the duplicates
                projectsContainer.classList.add('duplicates-active');
                
                // Remove all clones from DOM
                detailViewState.visibleClones.forEach(clone => clone.remove());
                detailViewState.visibleClones = [];
                
                // Fade in navigation elements on duplicates
                allDuplicates.forEach(dup => {
                    const nav = dup.querySelector('.project-navigation');
                    if (nav) {
                        nav.style.transition = 'opacity 300ms ease-out';
                        nav.style.opacity = '1';
                    }
                });
                
                // Start mouse idle detection
                if (window.startMouseIdleDetection) {
                    window.startMouseIdleDetection();
                }
                
                console.log('Animation complete - showing duplicates, clones removed');
            }, 750); // Slightly longer than the 700ms transition
        });
    });
}

// After a ±1 navigation animation finishes, silently shift back into the middle
// sets [N, 3N) so there's always buffer on both sides. The shift is by ±2N, which
// lands on the same project visually, so it's imperceptible.
function scheduleSilentRecenter() {
    const state = detailViewState;
    const N = state.uniqueProjectCount;
    if (state.currentIndex >= N && state.currentIndex < N * 3) return;

    setTimeout(() => {
        // Recheck: user may have navigated again during the wait
        if (!state.isOpen) return;
        if (state.currentIndex >= N && state.currentIndex < N * 3) return;

        const target = state.currentIndex < N
            ? state.currentIndex + N * 2
            : state.currentIndex - N * 2;

        state.currentIndex = target;

        const container = state.detailDuplicatesContainer;
        if (!container) return;
        const prev = container.style.transition;
        container.style.transition = 'none';
        scrollDuplicatesToIndex(target);
        void container.offsetWidth; // force reflow
        container.style.transition = prev;
    }, 720); // slightly after the 700ms transform transition
}

// Navigate to next project
function navigateNext() {
    const state = detailViewState;
    if (!state.isOpen) return;

    // Close description on all duplicates (no delay)
    state.allDuplicates.forEach(dup => {
        dup.classList.remove('description-visible');
    });

    state.currentIndex += 1;
    scrollDuplicatesToIndex(state.currentIndex);
    scheduleSilentRecenter();
}

// Navigate to previous project
function navigatePrev() {
    const state = detailViewState;
    if (!state.isOpen) return;

    // Close description on all duplicates (no delay)
    state.allDuplicates.forEach(dup => {
        dup.classList.remove('description-visible');
    });

    state.currentIndex -= 1;
    scrollDuplicatesToIndex(state.currentIndex);
    scheduleSilentRecenter();
}

// Sync image index from detail duplicate to all corresponding marquee projects
function syncImageToMarquee(detailDuplicate, allMarqueeProjects, uniqueProjectCount) {
    const imageIndex = parseInt(detailDuplicate.dataset.imageIndex, 10) || 0;
    const images = JSON.parse(detailDuplicate.dataset.images || '[]');
    
    if (imageIndex === 0 || images.length === 0) return; // No sync needed if still on first image
    
    // Find which unique project this is (0 to uniqueProjectCount-1)
    const allDuplicates = Array.from(detailDuplicate.closest('.detail-view-duplicates').querySelectorAll('.detail-duplicate'));
    const duplicateIndex = allDuplicates.indexOf(detailDuplicate);
    const uniqueProjectIndex = duplicateIndex % uniqueProjectCount;
    
    console.log('Syncing image index', imageIndex, 'for unique project', uniqueProjectIndex);
    
    // Update all instances of this project in the marquee (there are 4 sets)
    allMarqueeProjects.forEach((marqueeProject, idx) => {
        if (idx % uniqueProjectCount === uniqueProjectIndex) {
            // Update the data attribute
            marqueeProject.dataset.imageIndex = imageIndex;
            
            // Update the image src
            const marqueeImages = JSON.parse(marqueeProject.dataset.images || '[]');
            const img = marqueeProject.querySelector('.project-image');
            if (img && marqueeImages[imageIndex]) {
                // Disable transitions temporarily to prevent aspect ratio jump
                img.style.transition = 'none';
                // Clear any inline styles that might interfere
                img.style.filter = '';
                img.style.opacity = '';
                img.style.maxWidth = '';
                img.style.maxHeight = '';
                
                img.src = marqueeImages[imageIndex];
                img.removeAttribute('srcset');
                
                // Force reflow to apply changes immediately
                img.offsetHeight;
                
                // Re-enable transitions after a frame
                requestAnimationFrame(() => {
                    img.style.transition = '';
                });
            }
        }
    });
    
    // Also sync all other detail duplicates of the same project
    allDuplicates.forEach((dup, idx) => {
        if (idx % uniqueProjectCount === uniqueProjectIndex && dup !== detailDuplicate) {
            dup.dataset.imageIndex = imageIndex;
            const dupImages = JSON.parse(dup.dataset.images || '[]');
            const img = dup.querySelector('.project-image');
            if (img && dupImages[imageIndex]) {
                // Disable transitions temporarily
                img.style.transition = 'none';
                img.style.filter = '';
                img.style.opacity = '';
                
                img.src = dupImages[imageIndex];
                img.removeAttribute('srcset');
                
                // Force reflow
                img.offsetHeight;
                
                // Re-enable transitions
                requestAnimationFrame(() => {
                    img.style.transition = '';
                });
            }
        }
    });
}

// Close detail view
function closeDetailView() {
    const state = detailViewState;
    if (!state.isOpen) return;
    
    console.log('Closing detail view');
    
    // Check if any duplicate has description-visible
    const hasDescriptionVisible = state.allDuplicates.some(dup => 
        dup.classList.contains('description-visible')
    );
    
    if (hasDescriptionVisible) {
        // Remove description-visible from ALL duplicates
        state.allDuplicates.forEach(dup => {
            dup.classList.remove('description-visible');
        });
        
        // Wait 600ms then continue with close
        setTimeout(() => {
            performCloseTransition();
        }, 600);
        return;
    }
    
    // No description visible, close immediately
    performCloseTransition();
}

// Perform the actual close transition
function performCloseTransition() {
    const state = detailViewState;
    if (!state.isOpen) return;
    
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
    
    // Sync current image from detail view to marquee
    const currentDuplicateForSync = state.allDuplicates[state.currentIndex];
    if (currentDuplicateForSync) {
        syncImageToMarquee(currentDuplicateForSync, state.allProjects, state.uniqueProjectCount);
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
        
        // Get the duplicate's image dimensions before cloning
        const duplicateImg = duplicate.querySelector('.project-image');
        const duplicateImgRect = duplicateImg ? duplicateImg.getBoundingClientRect() : null;
        
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
        
        // Set initial image size to exact pixel dimensions from duplicate
        const cloneImage = clone.querySelector('.project-image');
        if (cloneImage && duplicateImgRect) {
            cloneImage.style.transition = 'none';
            cloneImage.style.maxWidth = 'none';
            cloneImage.style.maxHeight = 'none';
            cloneImage.style.width = duplicateImgRect.width + 'px';
            cloneImage.style.height = duplicateImgRect.height + 'px';
        }
        
        document.body.appendChild(clone);
        state.visibleClones.push(clone);
        
        // Target position in marquee: current at center, others at visual offsets
        const targetLeft = viewportCenterX + (visualOffset * elementWidth);
        
        // Get the corresponding marquee project's image dimensions
        const marqueeProjectIndex = duplicateIndex;
        const marqueeProject = state.allProjects[marqueeProjectIndex];
        const marqueeImg = marqueeProject ? marqueeProject.querySelector('.project-image') : null;
        const marqueeImgRect = marqueeImg ? marqueeImg.getBoundingClientRect() : null;
        
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
            marqueeImgRect: marqueeImgRect,
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
            
            cloneData.forEach(({ clone, targetRect, marqueeImgRect, duplicateIndex, visualOffset }) => {
                clone.style.transition = 'all 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                clone.style.left = targetRect.left + 'px';
                clone.style.top = targetRect.top + 'px';
                clone.style.width = targetRect.width + 'px';
                clone.style.height = targetRect.height + 'px';
                clone.style.padding = marqueePadding;
                
                // Animate image to exact marquee image dimensions
                const cloneImage = clone.querySelector('.project-image');
                if (cloneImage && marqueeImgRect) {
                    cloneImage.style.transition = 'width 700ms cubic-bezier(0.4, 0.0, 0.2, 1), height 700ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                    cloneImage.style.width = marqueeImgRect.width + 'px';
                    cloneImage.style.height = marqueeImgRect.height + 'px';
                }
                
                // Fade out the navigation elements during transition
                const cloneNav = clone.querySelector('.project-navigation');
                if (cloneNav) {
                    cloneNav.style.transition = 'opacity 300ms ease-out';
                    cloneNav.style.opacity = '0';
                }
                
                console.log('Animating clone (duplicate:', duplicateIndex, 'visualOffset:', visualOffset, ') to:', targetRect.left, targetRect.top);
            });
            
            // Hide project-date elements in marquee before they're shown
            state.allProjects.forEach(proj => {
                const date = proj.querySelector('.project-date');
                if (date) {
                    date.style.opacity = '0';
                    date.style.transition = 'none';
                }
            });
            
            // After animation completes, remove clones and reset state
            setTimeout(() => {
                // Remove all clones
                state.visibleClones.forEach(clone => clone.remove());
                state.visibleClones = [];
                
                // Fade in project-date elements on marquee
                state.allProjects.forEach(proj => {
                    const date = proj.querySelector('.project-date');
                    if (date) {
                        date.style.transition = 'opacity 300ms ease-out';
                        date.style.opacity = '1';
                    }
                });
                
                // Stop mouse idle detection
                if (window.stopMouseIdleDetection) {
                    window.stopMouseIdleDetection();
                }
                
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

// Switch to a specific image index within a detail-duplicate (with blur transition)
function switchProjectImage(detailDuplicate, newIndex) {
    const images = JSON.parse(detailDuplicate.dataset.images || '[]');
    const imageCount = parseInt(detailDuplicate.dataset.imageCount, 10) || 1;
    
    if (images.length === 0) return;
    
    // Prevent rapid clicking during transition
    if (detailDuplicate.dataset.transitioning === 'true') return;
    
    // Wrap around index
    if (newIndex < 0) newIndex = imageCount - 1;
    if (newIndex >= imageCount) newIndex = 0;
    
    // Update data attribute
    detailDuplicate.dataset.imageIndex = newIndex;
    
    // Sync image to marquee immediately so they stay in sync
    if (detailViewState.isOpen) {
        syncImageToMarquee(detailDuplicate, detailViewState.allProjects, detailViewState.uniqueProjectCount);
    }
    
    // Update image src with blur transition
    const img = detailDuplicate.querySelector('.project-image');
    if (img && images[newIndex]) {
        // Mark as transitioning
        detailDuplicate.dataset.transitioning = 'true';
        
        // Set up transition for filter
        img.style.transition = 'all 150ms ease-out';
        
        // Apply blur
        img.style.filter = 'blur(0px)';
        img.style.opacity = '1';
        
        // After blur is applied, change the image
        setTimeout(() => {
            img.src = images[newIndex];
            // Also update srcset to prevent browser from loading old srcset
            img.removeAttribute('srcset');
            
            // Remove blur after image is changed
            setTimeout(() => {
                img.style.filter = 'blur(0px)';
                img.style.opacity = '1';
                
                // Clean up after transition completes
                setTimeout(() => {
                    img.style.transition = '';
                    img.style.filter = '';
                    detailDuplicate.dataset.transitioning = 'false';
                }, 0);
            }, 0); // Small delay to ensure new image starts loading
        }, 0); // Match the blur transition duration
    }
}

// Navigate to previous image within a project
function navigatePrevImage(detailDuplicate) {
    const currentIndex = parseInt(detailDuplicate.dataset.imageIndex, 10) || 0;
    switchProjectImage(detailDuplicate, currentIndex - 1);
}

// Navigate to next image within a project
function navigateNextImage(detailDuplicate) {
    const currentIndex = parseInt(detailDuplicate.dataset.imageIndex, 10) || 0;
    switchProjectImage(detailDuplicate, currentIndex + 1);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    updateProjectWidthVariable();
    
    window.addEventListener('resize', function() {
        updateProjectWidthVariable();

        // Keep the detail view aligned when the viewport changes.
        // translateX is a pixel value based on window.innerWidth, so it goes stale on resize.
        if (detailViewState.isOpen && detailViewState.detailDuplicatesContainer) {
            const container = detailViewState.detailDuplicatesContainer;
            const prevTransition = container.style.transition;
            container.style.transition = 'none';
            scrollDuplicatesToIndex(detailViewState.currentIndex);
            // Force reflow, then restore the transition so future navigations animate
            void container.offsetWidth;
            container.style.transition = prevTransition;
        }
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
    
    // Image navigation arrows (left/right within a project)
    const leftArrows = document.querySelectorAll('.detail-duplicate .arrow-left-button');
    const rightArrows = document.querySelectorAll('.detail-duplicate .arrow-right-button');
    
    leftArrows.forEach(function(arrow) {
        arrow.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            const detailDuplicate = arrow.closest('.detail-duplicate');
            if (detailDuplicate) {
                navigatePrevImage(detailDuplicate);
            }
        });
        const parent = arrow.closest('.detail-duplicate');
        if (parent && parseInt(parent.dataset.imageCount, 10) > 1) {
            arrow.style.cursor = 'pointer';
        }
    });

    rightArrows.forEach(function(arrow) {
        arrow.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            const detailDuplicate = arrow.closest('.detail-duplicate');
            if (detailDuplicate) {
                navigateNextImage(detailDuplicate);
            }
        });
        const parent = arrow.closest('.detail-duplicate');
        if (parent && parseInt(parent.dataset.imageCount, 10) > 1) {
            arrow.style.cursor = 'pointer';
        }
    });
    
    // Plus button (toggle description visibility)
    const plusButtons = document.querySelectorAll('.detail-duplicate .plus-button');
    
    function measureDescription(detailDuplicate) {
        const desc = detailDuplicate.querySelector('.detail-description');
        if (!desc) return;
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const maxPx = 19 * rootFontSize;
        // scrollHeight includes padding and reflects true content height
        const measured = Math.min(desc.scrollHeight, maxPx);
        detailDuplicate.style.setProperty('--desc-height', measured + 'px');
        // Mark scrollable for the CSS fade mask
        desc.classList.toggle('is-scrollable', desc.scrollHeight > maxPx + 1);
        // Mark single-line so CSS can center-align the text
        const content = desc.querySelector('.detail-description-content');
        if (content) {
            const range = document.createRange();
            range.selectNodeContents(content);
            desc.classList.toggle('is-single-line', range.getClientRects().length === 1);
        }
    }

    plusButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            const detailDuplicate = button.closest('.detail-duplicate');
            if (!detailDuplicate) return;

            if (!detailDuplicate.classList.contains('description-visible')) {
                measureDescription(detailDuplicate);
            }
            detailDuplicate.classList.toggle('description-visible');
        });
        button.style.cursor = 'pointer';
    });

    // Re-measure when fonts finish loading (initial measurement may be off)
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
            document.querySelectorAll('.detail-duplicate.description-visible').forEach(measureDescription);
        });
    }

    // Re-measure on window resize
    window.addEventListener('resize', function() {
        document.querySelectorAll('.detail-duplicate.description-visible').forEach(measureDescription);
    });
    
    // Keyboard navigation for images in detail view
    document.addEventListener('keydown', function(event) {
        // Only handle when detail view is open
        if (!detailViewState.isOpen) return;
        
        // Get the current detail duplicate
        const currentDuplicate = detailViewState.allDuplicates[detailViewState.currentIndex];
        if (!currentDuplicate) return;
        
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigatePrevImage(currentDuplicate);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateNextImage(currentDuplicate);
        }
    });
});
