<?php
$projectImages = $project->projectimages()->toStructure();

// Collect only structure entries that resolve to a real file
$validImages = [];
$allImageUrls = [];
foreach ($projectImages as $imgItem) {
    $imgFile = $imgItem->projectimage()->toFile();
    if ($imgFile) {
        $validImages[] = $imgFile;
        $allImageUrls[] = $imgFile->thumb(['width' => 600, 'quality' => 75, 'format' => 'webp'])->url();
    }
}

if (empty($validImages) || $project->projectTitle()->isEmpty()) {
    return;
}

$imageCount = count($validImages);
$firstImage = $validImages[0];

// Placeholder: same size as high-res, low quality (blur hides artifacts)
$placeholder = $firstImage->thumb([
    'width' => 600,
    'quality' => 5,
    'format' => 'webp'
]);

// Responsive srcset sizes for marquee cards
$sizes = [
    '400w' => $firstImage->thumb(['width' => 400, 'quality' => 75, 'format' => 'webp']),
    '600w' => $firstImage->thumb(['width' => 600, 'quality' => 75, 'format' => 'webp']),
    '800w' => $firstImage->thumb(['width' => 800, 'quality' => 75, 'format' => 'webp']),
];

$srcset = implode(', ', array_map(
    fn($size, $thumb) => $thumb->url() . ' ' . $size,
    array_keys($sizes),
    array_values($sizes)
));

$defaultSrc = $sizes['600w']->url();
?>
<div class="single-project-wrapper" data-subcategory="<?= $project->subCategory()->value() ?>" data-image-index="0" data-image-count="<?= $imageCount ?>" data-images='<?= json_encode($allImageUrls) ?>'>
    <div class="single-project-container">
        <img
            src="<?= $placeholder->url() ?>"
            data-src="<?= $defaultSrc ?>"
            data-srcset="<?= $srcset ?>"
            alt="<?= $project->title() ?>"
            class="project-image blur-placeholder"
        >
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
