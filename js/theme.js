// js/theme.js
const themeToggleFab = document.getElementById('theme-toggle-fab');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else if (!prefersDark) {
    htmlElement.setAttribute('data-theme', 'light');
}

if (themeToggleFab) {
    themeToggleFab.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Add a satisfying GSAP bounce animation on click
        if(typeof gsap !== 'undefined') {
            gsap.fromTo(themeToggleFab, 
                { scale: 0.8, rotation: -20 }, 
                { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }
            );
        }
    });
}