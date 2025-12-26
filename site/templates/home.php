<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fabian Schwarze</title>
    <link rel="stylesheet" href="<?= url('assets/style/style.css') ?>">
</head>
    <body class="initialized">
        <div class="projects-container" id="commissioned-projects-container">
            <div class="projects-container-info projects-container-top" id="commissioned-projects-top">
                <div class="section-title">(A) Commissioned Works</div>
                <div class="section-categories">
                    <div class="category circle-button active" id="category-1">All</div>
                    <div class="category circle-button" id="category-2">Portrait</div>
                    <div class="category circle-button" id="category-3">Event</div>
                </div>
            </div>
            <div class="projects-container-main">
                <div class="marquee-wrapper" id="commissioned-marquee">
                    <div class="marquee-content">
                        <?php foreach ($site->find('works')->find('commissioned')->children() as $projectCommissioned): ?>
                            <div class="single-project-wrapper">
                                <div class="single-project-container">
                                    <?php 
                                    $projectImages = $projectCommissioned->projectimages()->toStructure();
                                    if ($projectImages->isNotEmpty()): 
                                        $firstImage = $projectImages->first()->projectimage()->toFile();
                                        if ($firstImage): ?>
                                            <img src="<?= $firstImage->url() ?>" alt="<?= $projectCommissioned->title() ?>" class="project-image">
                                        <?php endif;
                                    endif; ?>
                                    <div class="top-squares">
                                        <div class="square-top-left"></div>
                                        <div class="project-title"><?= $projectCommissioned->projectTitle() ?></div>
                                        <div class="square-top-right"></div>
                                    </div>
                                    <div class="bottom-squares">
                                        <div class="square-bottom-left"></div>
                                        <div class="project-date"><?= $projectCommissioned->projectDate() ?></div>
                                        <div class="square-bottom-right"></div>
                                    </div>
                                </div>
                            </div>                
                        <?php endforeach ?>
                        <?php foreach ($site->find('works')->find('commissioned')->children() as $projectCommissioned): ?>
                            <div class="single-project-wrapper">
                                <div class="single-project-container">
                                    <?php 
                                    $projectImages = $projectCommissioned->projectimages()->toStructure();
                                    if ($projectImages->isNotEmpty()): 
                                        $firstImage = $projectImages->first()->projectimage()->toFile();
                                        if ($firstImage): ?>
                                            <img src="<?= $firstImage->url() ?>" alt="<?= $projectCommissioned->title() ?>" class="project-image">
                                        <?php endif;
                                    endif; ?>
                                    <div class="top-squares">
                                        <div class="square-top-left"></div>
                                        <div class="project-title"><?= $projectCommissioned->projectTitle() ?></div>
                                        <div class="square-top-right"></div>
                                    </div>
                                    <div class="bottom-squares">
                                        <div class="square-bottom-left"></div>
                                        <div class="project-date"><?= $projectCommissioned->projectDate() ?></div>
                                        <div class="square-bottom-right"></div>
                                    </div>
                                </div>
                            </div>                
                        <?php endforeach ?>
                    </div>
                </div>
            </div>
            <div class="projects-container-about-outter projects-container-bottom" id="commissioned-projects-about-outter">
                <div class="projects-container-about-inner" id="commissioned-projects-about-inner">
                    <div id="website-title">Fabian Schwarze</div>
                </div>
            </div>
        </div>
        <div class="projects-container" id="personal-projects-container">
            <div class="projects-container-about-outter projects-container-top" id="personal-projects-about-outter">
                <div class="projects-container-about-inner" id="personal-projects-about-inner">
                    <div class="circle-button" id="about-button">About</div>
                </div>
            </div>
            <div class="projects-container-main">
                <div class="marquee-wrapper" id="personal-marquee">
                    <div class="marquee-content">
                        <?php foreach ($site->find('works')->find('personal')->children() as $projectPersonal): ?>
                            <div class="single-project-wrapper">
                                <div class="single-project-container">
                                    <?php 
                                    $projectImages = $projectPersonal->projectimages()->toStructure();
                                    if ($projectImages->isNotEmpty()): 
                                        $firstImage = $projectImages->first()->projectimage()->toFile();
                                        if ($firstImage): ?>
                                            <img src="<?= $firstImage->url() ?>" alt="<?= $projectPersonal->title() ?>" class="project-image">
                                        <?php endif;
                                    endif; ?>
                                    <div class="top-squares">
                                        <div class="square-top-left"></div>
                                        <div class="project-title"><?= $projectPersonal->projectTitle() ?></div>
                                        <div class="square-top-right"></div>
                                    </div>
                                    <div class="bottom-squares">
                                        <div class="square-bottom-left"></div>
                                        <div class="project-date"><?= $projectPersonal->projectDate() ?></div>
                                        <div class="square-bottom-right"></div>
                                    </div>
                                </div>
                            </div>                
                        <?php endforeach ?>
                        <?php foreach ($site->find('works')->find('personal')->children() as $projectPersonal): ?>
                            <div class="single-project-wrapper">
                                <div class="single-project-container">
                                    <?php 
                                    $projectImages = $projectPersonal->projectimages()->toStructure();
                                    if ($projectImages->isNotEmpty()): 
                                        $firstImage = $projectImages->first()->projectimage()->toFile();
                                        if ($firstImage): ?>
                                            <img src="<?= $firstImage->url() ?>" alt="<?= $projectPersonal->title() ?>" class="project-image">
                                        <?php endif;
                                    endif; ?>
                                    <div class="top-squares">
                                        <div class="square-top-left"></div>
                                        <div class="project-title"><?= $projectPersonal->projectTitle() ?></div>
                                        <div class="square-top-right"></div>
                                    </div>
                                    <div class="bottom-squares">
                                        <div class="square-bottom-left"></div>
                                        <div class="project-date"><?= $projectPersonal->projectDate() ?></div>
                                        <div class="square-bottom-right"></div>
                                    </div>
                                </div>
                            </div>                
                        <?php endforeach ?>
                    </div>
                </div>
            </div>
            <div class="detail-navigation-container">
            </div>
            <div class="projects-container-info projects-container-bottom" id="personal-projects-bottom">
                <div class="section-title">(B) Personal Works</div>
                <div class="section-categories">
                    <div class="category circle-button active" id="category-1">All</div>
                    <div class="category circle-button" id="category-2">Story</div>
                    <div class="category circle-button" id="category-3">Diary</div>
                </div>
            </div>
        </div>
        <div class="about-container display-none">
            <div id="about-contact">
                Fabian Schwarze<br>
                Glashüttenstraße 88<br>
                20357 Hamburg<br>
                <br>
                IG: fabianschwarze<br>
                E: fabianschwarze.com<br>
            </div>
            <div id="about-text">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.
            </div>

        </div>
        <div id="about-container-white"></div>
        <div id="about-container-black"></div>









    <script src="<?= url('assets/js/detail.js') ?>"></script>
    <script src="<?= url('assets/js/about.js') ?>"></script>
    <script src="<?= url('assets/js/marquee.js') ?>"></script>
    </body>

</html>