<?php $about = page('about'); ?>
<div id="about-container-white"></div>
<div id="about-container-black"></div>
<div class="about-container display-none">
    <div id="about-contact">
        <?php if ($about && $about->instagram()->isNotEmpty()): ?>
            IG: <?= $about->instagram() ?><br>
        <?php endif; ?>
        <?php if ($about && $about->e_mail()->isNotEmpty()): ?>
            E: <?= $about->e_mail() ?><br>
        <?php endif; ?>
    </div>
    <div class="about-legal-links">
        <div class="circle-button about-legal-link" data-target="imprint">Imprint</div>
        <div class="circle-button about-legal-link" data-target="privacy">Privacy</div>
        <div class="circle-button about-legal-link" data-target="terms">Terms</div>
    </div>
    <div id="about-text">
        <?php if ($about && $about->about_textarea()->isNotEmpty()): ?>
            <div class="about-pane about-pane-default active">
                <?= $about->about_textarea()->kt() ?>
            </div>
        <?php endif; ?>
        <?php if ($about && $about->imprint()->isNotEmpty()): ?>
            <div class="about-pane about-pane-imprint">
                <?= $about->imprint()->kt() ?>
            </div>
        <?php endif; ?>
        <?php if ($about && $about->privacy_policy()->isNotEmpty()): ?>
            <div class="about-pane about-pane-privacy">
                <?= $about->privacy_policy()->kt() ?>
            </div>
        <?php endif; ?>
        <?php if ($about && $about->terms_and_conditions()->isNotEmpty()): ?>
            <div class="about-pane about-pane-terms">
                <?= $about->terms_and_conditions()->kt() ?>
            </div>
        <?php endif; ?>
    </div>
</div>

