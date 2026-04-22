const aboutContainer = document.querySelector('.about-container');
const aboutButton = document.getElementById('about-button');
const aboutText = document.getElementById('about-text');
const legalButtons = document.querySelectorAll('.about-legal-link');
const aboutPanes = document.querySelectorAll('.about-pane');

let isAboutAnimating = false;

function updateAboutScrollMask() {
    if (!aboutText) return;
    aboutText.classList.toggle('is-scrollable', aboutText.scrollHeight > aboutText.clientHeight + 1);
}

function resetAboutPane() {
    legalButtons.forEach(b => b.classList.remove('active'));
    aboutPanes.forEach(p => p.classList.remove('active'));
    const defaultPane = document.querySelector('.about-pane-default');
    if (defaultPane) defaultPane.classList.add('active');
    updateAboutScrollMask();
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.body.classList.remove('initialized');
    }, 500);

    setTimeout(() => {
        aboutContainer.classList.remove('display-none');
    }, 1000);

    aboutButton.addEventListener('click', openAbout);

    legalButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            const target = this.dataset.target;
            const wasActive = this.classList.contains('active');

            legalButtons.forEach(b => b.classList.remove('active'));
            aboutPanes.forEach(p => p.classList.remove('active'));

            if (wasActive) {
                const defaultPane = document.querySelector('.about-pane-default');
                if (defaultPane) defaultPane.classList.add('active');
            } else {
                this.classList.add('active');
                const pane = document.querySelector('.about-pane-' + target);
                if (pane) pane.classList.add('active');
            }
            updateAboutScrollMask();
        });
    });

    updateAboutScrollMask();

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateAboutScrollMask);
    }

    window.addEventListener('resize', updateAboutScrollMask);
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
        resetAboutPane();
    
        setTimeout(function() {
            document.body.classList.remove('about-open-1');
        }, 200);

        setTimeout(() => {
            isAboutAnimating = false;
        }, 1000);
    }
}