<?php snippet('head'); ?>

<?php 
// Commissioned Works Section
snippet('projects-section', [
    'sectionId' => 'commissioned',
    'sectionTitle' => '(A) Commissioned Works',
    'position' => 'top',
    'category1' => 'Portrait',
    'category2' => 'Event',
    'projects' => $site->find('works')->find('commissioned')->children()
]);
?>

<?php 
// Personal Works Section
snippet('projects-section', [
    'sectionId' => 'personal',
    'sectionTitle' => '(B) Personal Works',
    'position' => 'bottom',
    'category1' => 'Story',
    'category2' => 'Diary',
    'projects' => $site->find('works')->find('personal')->children()
]);
?>

<div class="detail-navigation-container">
</div>

<?php snippet('about-section'); ?>

<?php snippet('footer-scripts'); ?>