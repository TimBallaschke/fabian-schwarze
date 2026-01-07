<?php 
$projectImages = $project->projectimages()->toStructure();
$imageCount = $projectImages->count();

// Build array of all image URLs for this project (for marquee size)
$allImageUrls = [];
foreach ($projectImages as $imgItem) {
    $imgFile = $imgItem->projectimage()->toFile();
    if ($imgFile) {
        $allImageUrls[] = $imgFile->thumb(['width' => 600, 'format' => 'webp'])->url();
    }
}
?>
<div class="single-project-wrapper" data-subcategory="<?= $project->subCategory()->value() ?>" data-image-index="0" data-image-count="<?= $imageCount ?>" data-images='<?= json_encode($allImageUrls) ?>'>
    <div class="single-project-container">
        <?php 
        if ($projectImages->isNotEmpty()): 
            $firstImage = $projectImages->first()->projectimage()->toFile();
            if ($firstImage): 
                // Placeholder: same size as high-res, low quality (blur hides artifacts)
                $placeholder = $firstImage->thumb([
                    'width' => 600,
                    'quality' => 5,
                    'format' => 'webp'
                ]);
                
                // Responsive srcset sizes for marquee cards
                $sizes = [
                    '400w' => $firstImage->thumb(['width' => 400, 'format' => 'webp']),
                    '600w' => $firstImage->thumb(['width' => 600, 'format' => 'webp']),
                    '800w' => $firstImage->thumb(['width' => 800, 'format' => 'webp']),
                ];
                
                // Build srcset string
                $srcset = implode(', ', array_map(
                    fn($size, $thumb) => $thumb->url() . ' ' . $size,
                    array_keys($sizes),
                    array_values($sizes)
                ));
                
                // Default src for high-res (medium size fallback)
                $defaultSrc = $sizes['600w']->url();
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
            <div class="project-date"><?= $project->projectMonth() ?> <?= $project->projectYear() ?></div>
            <div class="square-bottom-right"></div>
        </div>
    </div>
</div>
