gsap.registerPlugin(ScrollTrigger);

// ════════════ CUSTOM CURSOR ════════════ //
const cursor = document.querySelector('.custom-cursor');
let hoverElements = document.querySelectorAll('[data-hover], a, button');

function attachHoverEvents() {
    hoverElements = document.querySelectorAll('[data-hover], a, button');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

if (window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.15,
            ease: "power2.out"
        });
    });
    attachHoverEvents();
}

// ════════════ INTERACTIVE SQUARE GRID ════════════ //
const checkboxContainer = document.createElement('div');
checkboxContainer.id = 'checkbox-grid';
document.body.appendChild(checkboxContainer);

Object.assign(checkboxContainer.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '9998',
    pointerEvents: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    opacity: '0.1'
});

const boxSize = 80;
let boxes = [];

function buildCheckboxes() {
    checkboxContainer.innerHTML = '';
    const cols = Math.ceil(window.innerWidth / boxSize) + 1;
    const rows = Math.ceil(window.innerHeight / boxSize) + 1;
    const totalBoxes = cols * rows;
    boxes = [];

    const frag = document.createDocumentFragment();
    for (let i = 0; i < totalBoxes; i++) {
        const cb = document.createElement('div');
        cb.style.width = boxSize + 'px';
        cb.style.height = boxSize + 'px';
        cb.style.boxSizing = 'border-box';
        cb.style.borderTop = '1px solid var(--panel-border)';
        cb.style.borderLeft = '1px solid var(--panel-border)';
        cb.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        cb.style.transformOrigin = 'center center';
        cb.style.pointerEvents = 'none';
        frag.appendChild(cb);
        boxes.push({ el: cb, x: (i % cols) * boxSize, y: Math.floor(i / cols) * boxSize, active: true });
    }
    checkboxContainer.appendChild(frag);
}

window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(buildCheckboxes, 200);
});
buildCheckboxes();

window.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const mx = e.clientX;
    const my = e.clientY;

    boxes.forEach(box => {
        const dx = box.x + (boxSize / 2) - mx;
        const dy = box.y + (boxSize / 2) - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
            if (box.active) {
                box.active = false;
                box.el.style.transform = 'scale(0)';
                box.el.style.opacity = '0';

                setTimeout(() => {
                    box.active = true;
                    box.el.style.transform = 'scale(1)';
                    box.el.style.opacity = '1';
                }, 800);
            }
        }
    });
});

// ════════════ THEME TOGGLE ════════════ //
const themeToggle = document.getElementById('theme-toggle');
const htmlTag = document.documentElement;

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlTag.setAttribute('data-theme', newTheme);
});

// ════════════ MOBILE MENU ════════════ //
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileCloseBtn = document.getElementById('mobile-close-btn');
const mobileOverlay = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

mobileMenuBtn.addEventListener('click', () => {
    mobileOverlay.classList.add('open');
});
mobileCloseBtn.addEventListener('click', () => {
    mobileOverlay.classList.remove('open');
});
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileOverlay.classList.remove('open');
    });
});

// ════════════ TEXT SPLITTING ════════════ //
function splitTextIntoChars(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = text.split('').map(char =>
            char === ' ' ? '&nbsp;' : `<span class="char">${char}</span>`
        ).join('');
    });
}
splitTextIntoChars('.reg-hero-title .line span');

// ════════════ LOADER ANIMATION ════════════ //
let progress = 0;
const loaderCounter = document.querySelector('.loader-counter');
const loaderOverlay = document.querySelector('.loader-overlay');
const loaderWipe = document.querySelector('.loader-wipe');

const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        loaderCounter.innerText = progress + '%';
        setTimeout(initAnimations, 200);
    } else {
        loaderCounter.innerText = progress + '%';
    }
}, 40);

function initAnimations() {
    const tl = gsap.timeline();

    tl.to(loaderWipe, { scaleY: 1, duration: 0.4, ease: "power4.in" })
        .to(loaderCounter, { opacity: 0, duration: 0.1 }, "-=0.2")
        .to(loaderOverlay, { y: '-100%', duration: 0.7, ease: "expo.inOut" })
        .fromTo('.reg-hero-title .char',
            { y: 200, scale: 0.5, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: 0.9, stagger: 0.03, ease: "back.out(1.5)" },
            "-=0.3"
        )
        .fromTo('.hero-sub span',
            { y: '100%' },
            { y: '0%', duration: 0.6, ease: "power3.out" },
            "-=0.4"
        );

    initScrollAnimations();
}

// ════════════ SCROLL ANIMATIONS ════════════ //
function initScrollAnimations() {
    // 1. Layer-by-Layer Stacking (ALL screen sizes)
    const panels = gsap.utils.toArray('.panel');
    panels.forEach((panel, i) => {
        if (i === panels.length - 1) return; // Don't pin the final section

        const isTall = panel.offsetHeight > window.innerHeight;

        ScrollTrigger.create({
            trigger: panel,
            start: isTall ? "bottom bottom" : "top top",
            end: () => "+=" + window.innerHeight,
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
            id: `reg-panel-${i}`
        });
    });

    // 2. Brutal Titles Reveal
    const titles = gsap.utils.toArray('.brutal-title');
    titles.forEach(title => {
        gsap.fromTo(title,
            { x: -100, opacity: 0 },
            {
                x: 0, opacity: 1,
                duration: 0.8,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Perk Items stagger reveal
    const perkItems = gsap.utils.toArray('.perk-item');
    perkItems.forEach((item, i) => {
        gsap.fromTo(item,
            { x: -60, opacity: 0 },
            {
                x: 0, opacity: 1,
                duration: 0.6,
                delay: i * 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Form card entrance
    const formCard = document.querySelector('.form-card');
    if (formCard) {
        gsap.fromTo(formCard,
            { y: 80, opacity: 0 },
            {
                y: 0, opacity: 1,
                duration: 0.8,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: formCard,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    // Form fields stagger
    const formGroups = gsap.utils.toArray('.form-group');
    formGroups.forEach((group, i) => {
        gsap.fromTo(group,
            { y: 40, opacity: 0 },
            {
                y: 0, opacity: 1,
                duration: 0.5,
                delay: 0.3 + i * 0.08,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: formCard,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Meta boxes stagger
    const metaBoxes = gsap.utils.toArray('.meta-box');
    metaBoxes.forEach((box, i) => {
        gsap.fromTo(box,
            { y: 30, opacity: 0 },
            {
                y: 0, opacity: 1,
                duration: 0.5,
                delay: i * 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: box,
                    start: "top 95%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);
}

// ════════════ FORM VALIDATION & SUBMISSION ════════════ //
const form = document.getElementById('registration-form');
const successOverlay = document.getElementById('success-overlay');

function validateField(input) {
    const group = input.closest('.form-group');
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
            message = 'SELECTION REQUIRED';
        }
    } else if (input.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) {
            isValid = false;
            message = 'EMAIL REQUIRED';
        } else if (!emailPattern.test(input.value.trim())) {
            isValid = false;
            message = 'INVALID EMAIL FORMAT';
        }
    } else if (input.type === 'tel') {
        const phonePattern = /^[\+]?[\d\s\-]{7,15}$/;
        if (!input.value.trim()) {
            isValid = false;
            message = 'PHONE REQUIRED';
        } else if (!phonePattern.test(input.value.trim())) {
            isValid = false;
            message = 'INVALID PHONE FORMAT';
        }
    } else {
        if (!input.value.trim()) {
            isValid = false;
            message = 'THIS FIELD IS REQUIRED';
        }
    }

    if (!isValid) {
        input.classList.add('error');
        group.classList.add('has-error');
        const errEl = document.createElement('div');
        errEl.className = 'error-msg';
        errEl.textContent = message;
        errEl.style.display = 'block';
        group.appendChild(errEl);
    }

    return isValid;
}

// Real-time validation on blur
const allInputs = form.querySelectorAll('.brutal-input');
allInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    // Focus animation for inputs
    input.addEventListener('focus', () => {
        gsap.fromTo(input, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
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

    // Simulate submission
    const btnText = form.querySelector('.btn-text');
    const btnLoader = form.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    setTimeout(() => {
        // Show success overlay
        successOverlay.classList.add('active');

        // Animate success content
        gsap.fromTo('.success-icon',
            { scale: 0, rotation: -180 },
            { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2)" }
        );
        gsap.fromTo('.success-title',
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power3.out" }
        );
        gsap.fromTo('.success-sub',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, delay: 0.5, ease: "power3.out" }
        );
        gsap.fromTo('.success-overlay .submit-btn',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, delay: 0.7, ease: "power3.out" }
        );

        // Reset button
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }, 1500);
});

// Resize Safety
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
