// ═══════════════════════════════════════════════════════════════
// Register Page JavaScript — World-Class Edition
// ═══════════════════════════════════════════════════════════════

// ════════════ THEME TOGGLE ════════════ //
const themeToggle = document.getElementById('theme-toggle');
const htmlTag = document.documentElement;

// Initialize Theme
const savedTheme = localStorage.getItem('techtalk-theme') || 'light';
htmlTag.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlTag.setAttribute('data-theme', newTheme);
    localStorage.setItem('techtalk-theme', newTheme);
});

// ════════════ NAVBAR SCROLL EFFECT ════════════ //
const nav = document.getElementById('main-nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ════════════ MOBILE HAMBURGER MENU ════════════ //
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinksEl = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinksEl) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinksEl.classList.toggle('mobile-open');
    });

    navLinksEl.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navLinksEl.classList.remove('mobile-open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            navLinksEl.classList.remove('mobile-open');
        }
    });
}

// ════════════ CUSTOM CURSOR ════════════ //
(function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (!dot || !ring) return;

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        dot.style.display = 'none';
        ring.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX - 4 + 'px';
        dot.style.top = mouseY - 4 + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX - 18 + 'px';
        ring.style.top = ringY - 18 + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactiveElements = document.querySelectorAll('a, button, .perk-card, input, textarea, select');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.style.transform = 'scale(2.5)';
            ring.style.transform = 'scale(1.5)';
            ring.style.opacity = '0.3';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.transform = 'scale(1)';
            ring.style.transform = 'scale(1)';
            ring.style.opacity = '0.5';
        });
    });
})();

// ════════════ FORM VALIDATION & SUBMISSION ════════════ //
const form = document.getElementById('registration-form');
const successOverlay = document.getElementById('success-overlay');

function validateField(input) {
    const group = input.closest('.input-group');
    let existingMsg = group.querySelector('.error-msg');

    // Clear previous error
    input.classList.remove('error');
    group.classList.remove('has-error');
    if (existingMsg) existingMsg.remove();

    let isValid = true;
    let message = '';

    if (input.tagName === 'SELECT') {
        if (!input.value) {
            isValid = false;
            message = 'Please select an option';
        }
    } else if (input.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) {
            isValid = false;
            message = 'Email is required';
        } else if (!emailPattern.test(input.value.trim())) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    } else if (input.type === 'tel') {
        const phonePattern = /^[\+]?[\d\s\-]{7,15}$/;
        if (!input.value.trim()) {
            isValid = false;
            message = 'Phone number is required';
        } else if (!phonePattern.test(input.value.trim())) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
    } else {
        if (!input.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }
    }

    if (!isValid) {
        input.classList.add('error');
        group.classList.add('has-error');
        const errEl = document.createElement('div');
        errEl.className = 'error-msg';
        errEl.textContent = message;
        group.appendChild(errEl);
    }

    return isValid;
}

// Real-time validation on blur
const allInputs = form.querySelectorAll('input, select');
allInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));

    // Clear error on input focus
    input.addEventListener('focus', () => {
        const group = input.closest('.input-group');
        input.classList.remove('error');
        group.classList.remove('has-error');
        const existingMsg = group.querySelector('.error-msg');
        if (existingMsg) existingMsg.remove();
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    allInputs.forEach(input => {
        if (!validateField(input)) {
            allValid = false;
        }
    });

    if (!allValid) return;

    // Simulate Network Request / Submission
    const btnText = form.querySelector('.btn-text');
    const btnLoader = form.querySelector('.btn-loader');

    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    setTimeout(() => {
        successOverlay.classList.add('active');

        // Reset button state underneath the overlay
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        form.reset();
    }, 1200);
});