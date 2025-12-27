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
            <?php 
            // Render duplicates 4 times for infinite looping (matching marquee structure)
            for ($i = 0; $i < 4; $i++): 
                foreach ($projects as $project): ?>
                    <div class="detail-duplicate" data-subcategory="<?= $project->subCategory()->value() ?>">
                        <div class="detail-duplicate-inner">
                            <?php 
                            $projectImages = $project->projectimages()->toStructure();
                            if ($projectImages->isNotEmpty()): 
                                $firstImage = $projectImages->first()->projectimage()->toFile();
                                if ($firstImage): ?>
                                    <img src="<?= $firstImage->url() ?>" alt="<?= $project->title() ?>" class="project-image">
                                <?php endif;
                            endif; ?>
                            <div class="top-squares">
                                <div class="square-top-left"></div>
                                <div class="project-title"><?= $project->projectTitle() ?></div>
                                <div class="square-top-right"></div>
                            </div>
                            <div class="bottom-squares">
                                <div class="square-bottom-left"></div>
                                <div class="project-date"><?= $project->projectDate() ?></div>
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
