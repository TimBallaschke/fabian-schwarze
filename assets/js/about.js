const aboutContainer = document.querySelector('.about-container');
const aboutButton = document.getElementById('about-button');

let isAboutAnimating = false;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.body.classList.remove('initialized');
    }, 500);

    setTimeout(() => {
        aboutContainer.classList.remove('display-none');
    }, 1000);

    aboutButton.addEventListener('click', openAbout);

}); 

function openAbout() {

    if (isAboutAnimating) {
        return;
    }

    if (!document.body.classList.contains('about-open-2')) {

        isAboutAnimating = true;

        document.body.classList.add('about-open-1');
        aboutButton.classList.add('active');

    
        setTimeout(function() {
            document.body.classList.remove('about-open-1');
            document.body.classList.add('about-open-2');
        }, 200);

        setTimeout(() => {
            isAboutAnimating = false;
        }, 1000);
    } else {

        isAboutAnimating = true;
        
        document.body.classList.remove('about-open-2');
        document.body.classList.add('about-open-1');

        aboutButton.classList.remove('active');
    
        setTimeout(function() {
            document.body.classList.remove('about-open-1');
        }, 200);

        setTimeout(() => {
            isAboutAnimating = false;
        }, 1000);
    }
}