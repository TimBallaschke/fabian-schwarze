<?php $about = page('about'); ?>
<div class="about-container display-none">
    <div id="about-contact">
        <?php if ($about && $about->instagram()->isNotEmpty()): ?>
            IG: <?= $about->instagram() ?><br>
        <?php endif; ?>
        <?php if ($about && $about->e_mail()->isNotEmpty()): ?>
            E: <?= $about->e_mail() ?><br>
        <?php endif; ?>
    </div>
    <div id="about-text">
        <?php if ($about && $about->about_textarea()->isNotEmpty()): ?>
            <?= $about->about_textarea()->kt() ?>
        <?php endif; ?>
    </div>
</div>
<div id="about-container-white"></div>
<div id="about-container-black"></div>

