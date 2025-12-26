<div class="single-project-wrapper" data-subcategory="<?= $project->subCategory()->value() ?>">
    <div class="single-project-container">
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
