<div class="projects-container" id="<?= $sectionId ?>-projects-container" data-section="<?= $sectionId ?>">
    <?php if ($position === 'top'): ?>
        <div class="projects-container-info projects-container-top" id="<?= $sectionId ?>-projects-top">
            <div class="section-title"><?= $sectionTitle ?></div>
            <div class="section-categories">
                <div class="category circle-button active" data-category="all">All</div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category1) ?>"><?= $category1 ?></div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category2) ?>"><?= $category2 ?></div>
            </div>
            <div class="section-navigation">
                <div class="circle-button" data-category="all">Previous</div>
                <div class="circle-button" data-category="all">Next</div>
                <div class="circle-button" data-category="all">Close</div>
            </div>
        </div>
    <?php else: ?>
        <div class="projects-container-about-outter projects-container-top" id="<?= $sectionId ?>-projects-about-outter">
            <div class="projects-container-about-inner" id="<?= $sectionId ?>-projects-about-inner">
                <div class="circle-button" id="about-button">About</div>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="projects-container-main">
        <div class="marquee-wrapper" id="<?= $sectionId ?>-marquee">
            <div class="marquee-content">
                <?php 
                // Render projects 4 times for marquee effect (handles filtering to few items)
                for ($i = 0; $i < 4; $i++): 
                    foreach ($projects as $project):
                        snippet('project-card', ['project' => $project]);
                    endforeach;
                endfor;
                ?>
            </div>
        </div>
        
        <!-- Detail view duplicates (hidden, shown after clone animation) -->
        <!-- Rendered 4 times like marquee for infinite looping -->
        <div class="detail-view-duplicates" id="<?= $sectionId ?>-detail-duplicates">
            <div class="detail-view-background"></div>
            <?php 
            // Render duplicates 4 times for infinite looping (matching marquee structure)
            for ($i = 0; $i < 4; $i++): 
                foreach ($projects as $project): 
                    $projectImages = $project->projectimages()->toStructure();
                    $imageCount = $projectImages->count();
                    
                    // Build array of all image URLs for this project
                    $allImageUrls = [];
                    foreach ($projectImages as $imgItem) {
                        $imgFile = $imgItem->projectimage()->toFile();
                        if ($imgFile) {
                            $allImageUrls[] = $imgFile->thumb(['width' => 1200, 'format' => 'webp'])->url();
                        }
                    }
                    ?>
                    <div class="detail-duplicate" data-subcategory="<?= $project->subCategory()->value() ?>" data-image-index="0" data-image-count="<?= $imageCount ?>" data-images='<?= json_encode($allImageUrls) ?>'>
                        <div class="detail-duplicate-inner">
                            <?php 
                            if ($projectImages->isNotEmpty()): 
                                $firstImage = $projectImages->first()->projectimage()->toFile();
                                if ($firstImage): 
                                    // Placeholder: tiny low-quality WebP (blur hides artifacts)
                                    $placeholder = $firstImage->thumb([
                                        'width' => 100,
                                        'quality' => 20,
                                        'format' => 'webp'
                                    ]);
                                    
                                    // Responsive srcset sizes for detail view (full screen)
                                    $sizes = [
                                        '600w' => $firstImage->thumb(['width' => 600, 'format' => 'webp']),
                                        '800w' => $firstImage->thumb(['width' => 800, 'format' => 'webp']),
                                        '1200w' => $firstImage->thumb(['width' => 1200, 'format' => 'webp']),
                                        '1600w' => $firstImage->thumb(['width' => 1600, 'format' => 'webp']),
                                    ];
                                    
                                    // Build srcset string
                                    $srcset = implode(', ', array_map(
                                        fn($size, $thumb) => $thumb->url() . ' ' . $size,
                                        array_keys($sizes),
                                        array_values($sizes)
                                    ));
                                    
                                    // Default src for high-res (large size fallback)
                                    $defaultSrc = $sizes['1200w']->url();
                                    ?>
                                    <img 
                                        src="<?= $placeholder->url() ?>" 
                                        data-src="<?= $defaultSrc ?>"
                                        data-srcset="<?= $srcset ?>"
                                        alt="<?= $project->title() ?>" 
                                        class="project-image blur-placeholder"
                                    >
                                <?php endif;
                            endif; ?>
                            <div class="top-squares">
                                <div class="square-top-left"></div>
                                <div class="project-title"><?= $project->projectTitle() ?></div>
                                <div class="square-top-right"></div>
                            </div>
                            <div class="bottom-squares">
                                <div class="square-bottom-left"></div>
                                <div class="project-navigation">
                                    <div class="arrow-left-button">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <line x1="19" y1="12" x2="5" y2="12"></line>
                                            <polyline points="12 19 5 12 12 5"></polyline>
                                        </svg>
                                    </div>
                                    <div class="arrow-right-button">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </div>
                                    <!-- <div class="plus-button">+</div> -->
                                </div>
                                <div class="square-bottom-right"></div>
                            </div>
                        </div>
                    </div>
                <?php 
                endforeach;
            endfor; ?>
        </div>
    </div>
    
    <?php if ($position === 'bottom'): ?>
        <div class="projects-container-info projects-container-bottom" id="<?= $sectionId ?>-projects-bottom">
            <div class="section-title"><?= $sectionTitle ?></div>
            <div class="section-categories">
                <div class="category circle-button active" data-category="all">All</div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category1) ?>"><?= $category1 ?></div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category2) ?>"><?= $category2 ?></div>
            </div>
            <div class="section-navigation">
                <div class="circle-button" data-category="all">Previous</div>
                <div class="circle-button" data-category="all">Next</div>
                <div class="circle-button" data-category="all">Close</div>
            </div>
        </div>
    <?php else: ?>
        <div class="projects-container-about-outter projects-container-bottom" id="<?= $sectionId ?>-projects-about-outter">
            <div class="projects-container-about-inner" id="<?= $sectionId ?>-projects-about-inner">
                <div id="website-title">Fabian Schwarze</div>
            </div>
        </div>
    <?php endif; ?>
</div>
