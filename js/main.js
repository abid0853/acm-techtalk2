// js/main.js
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    });
}

document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-toggle')) {
            mobileToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        }
    }
});

document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
    });
});

const eventDate = new Date("Oct 24, 2026 09:00:00").getTime();
const countdownTimer = document.getElementById("countdown");

if (countdownTimer) {
    const countdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {
            clearInterval(countdown);
            countdownTimer.innerHTML = "Event Started";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    }, 1000);
}

const accordionItems = document.querySelectorAll('.accordion-item');
accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
        const currentlyActive = document.querySelector('.accordion-item.active');
        
        if (currentlyActive && currentlyActive !== item) {
            currentlyActive.classList.remove('active');
            currentlyActive.querySelector('.accordion-content').style.maxHeight = null;
            currentlyActive.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }

        item.classList.toggle('active');
        const content = item.querySelector('.accordion-content');
        
        if (item.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + "px";
            header.setAttribute('aria-expanded', 'true');
        } else {
            content.style.maxHeight = null;
            header.setAttribute('aria-expanded', 'false');
        }
    });
});

const backToTop = document.getElementById('back-to-top');
if(backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}