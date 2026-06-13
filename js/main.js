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
        // Cursor tracking
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
    zIndex: '9998', // Overlays globally, below navbar
    pointerEvents: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    opacity: '0.1' // Extremely thin and subtle
});

const boxSize = 80; // Larger linked boxes
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
    if(window.innerWidth <= 768) return; 
    const mx = e.clientX;
    const my = e.clientY;
    
    boxes.forEach(box => {
        const dx = box.x + (boxSize / 2) - mx;
        const dy = box.y + (boxSize / 2) - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Hide/shrink on proximity
        if (dist < 120) {
            if (box.active) {
                box.active = false;
                box.el.style.transform = 'scale(0)';
                box.el.style.opacity = '0';
                
                // Rejoin after cursor leaves
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
    // Default is light
    const currentTheme = htmlTag.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlTag.setAttribute('data-theme', newTheme);
    
    // Dispatch custom event for Three.js to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
});

// Initial trigger for three js to sync up
window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: 'light' } }));

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

// ════════════ TEXT SPLITTING UTILITY ════════════ //
function splitTextIntoChars(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = text.split('').map(char => 
            char === ' ' ? '&nbsp;' : `<span class="char">${char}</span>`
        ).join('');
    });
}
splitTextIntoChars('.hero-title .line span');

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
      .fromTo('.hero-title .char', 
          { y: 200, scale: 0.5, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.9, stagger: 0.03, ease: "back.out(1.5)" },
          "-=0.3"
      )
      .fromTo('.hero-sub span',
          { y: '100%' },
          { y: '0%', duration: 0.6, ease: "power3.out" },
          "-=0.4"
      )
      .fromTo('.hero-details .brutal-box-small',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" },
          "-=0.2"
      );

    initScrollAnimations();
}

// ════════════ SCROLL ANIMATIONS ════════════ //
function initScrollAnimations() {
    
    // 1. Responsive Layer-by-Layer Stacking (MatchMedia)
    let mm = gsap.matchMedia();

    // Only apply pinning for Desktop/Tablet (screens >= 769px)
    mm.add("(min-width: 769px)", () => {
        const panels = gsap.utils.toArray('.panel');
        panels.forEach((panel, i) => {
            if (i === panels.length - 1) return; // Don't pin the final section
            
            const isTall = panel.offsetHeight > window.innerHeight;

            ScrollTrigger.create({
                trigger: panel,
                start: isTall ? "bottom bottom" : "top top",
                end: () => "+=" + window.innerHeight,
                pin: true,
                pinSpacing: false, // MANDATORY for strict layer-by-layer overlap
                invalidateOnRefresh: true, // Crucial for responsive resizing
                id: `panel-${i}`
            });
        });
    });

    // 2. Line-by-Line Text Reveal
    const clipLines = gsap.utils.toArray('.clip-line span');
    clipLines.forEach(line => {
        if(line.closest('.hero-content') || line.closest('.footer-text')) return;

        gsap.fromTo(line, 
            { y: '110%' }, 
            {
                y: '0%',
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: line.parentElement,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // 3. Brutal Titles Reveal
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

    // 4. Parallax Images
    const parallaxImgs = gsap.utils.toArray('.parallax-img');
    parallaxImgs.forEach(img => {
        gsap.fromTo(img,
            { scale: 1.5, y: -50 },
            {
                scale: 1.0, y: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: img.closest('.speaker-img-wrapper'),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });

    // Final refresh to ensure pin calculations are accurate
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);
}

// Resize Safety
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});