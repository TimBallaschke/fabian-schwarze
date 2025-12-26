<div class="projects-container" id="<?= $sectionId ?>-projects-container" data-section="<?= $sectionId ?>">
    <?php if ($position === 'top'): ?>
        <div class="projects-container-info projects-container-top" id="<?= $sectionId ?>-projects-top">
            <div class="section-title"><?= $sectionTitle ?></div>
            <div class="section-categories">
                <div class="category circle-button active" data-category="all">All</div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category1) ?>"><?= $category1 ?></div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category2) ?>"><?= $category2 ?></div>
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
    </div>
    
    <?php if ($position === 'bottom'): ?>
        <div class="projects-container-info projects-container-bottom" id="<?= $sectionId ?>-projects-bottom">
            <div class="section-title"><?= $sectionTitle ?></div>
            <div class="section-categories">
                <div class="category circle-button active" data-category="all">All</div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category1) ?>"><?= $category1 ?></div>
                <div class="category circle-button" data-category="<?= \Kirby\Toolkit\Str::slug($category2) ?>"><?= $category2 ?></div>
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
