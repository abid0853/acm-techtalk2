// ═══════════════════════════════════════════════════════════════
// ACM TechTalk 2026 — Main JavaScript (World-Class Edition)
// ═══════════════════════════════════════════════════════════════

// ════════════ THEME TOGGLE ════════════ //
const themeToggle = document.getElementById('theme-toggle');
const htmlTag = document.documentElement;

const savedTheme = localStorage.getItem('techtalk-theme') || 'light';
htmlTag.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlTag.setAttribute('data-theme', newTheme);
    localStorage.setItem('techtalk-theme', newTheme);

    // Dispatch event to update Three.js lighting
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
});

// ════════════ SMOOTH SCROLL ════════════ //
document.querySelectorAll('.nav-links a, a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href.startsWith('#')) return;
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// ════════════ NAVBAR SCROLL EFFECT ════════════ //
const nav = document.getElementById('main-nav');
if (nav) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });
}

// ════════════ MOBILE HAMBURGER MENU ════════════ //
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('mobile-open');
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('mobile-open');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('mobile-open');
        }
    });
}

// ════════════ LIVE COUNTDOWN TIMER ════════════ //
function updateCountdown() {
    const eventDate = new Date('2026-10-24T09:00:00+05:30').getTime();
    const now = new Date().getTime();
    const diff = eventDate - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    if (!daysEl) return;

    if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ════════════ SCROLL REVEAL ANIMATIONS ════════════ //
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children');

    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

initScrollReveal();

// ════════════ CUSTOM CURSOR ════════════ //
function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (!dot || !ring) return;

    // Check for touch devices
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

    // Scale on hover interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .speaker-card, .stat-card, .timeline-card, .perk-card, input, textarea, select');
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
}

initCustomCursor();

// ════════════ PARTICLE BACKGROUND ════════════ //
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }

        draw() {
            const isDark = htmlTag.getAttribute('data-theme') === 'dark';
            const color = isDark ? `rgba(129, 140, 248, ${this.opacity})` : `rgba(99, 102, 241, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        const isDark = htmlTag.getAttribute('data-theme') === 'dark';
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.12;
                    const color = isDark ? `rgba(129, 140, 248, ${opacity})` : `rgba(99, 102, 241, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animate);
    }

    animate();
}

initParticles();

// ════════════ STAT COUNTER ANIMATION ════════════ //
function initCounterAnimation() {
    const statCards = document.querySelectorAll('.stat-card h3');
    if (!statCards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const match = text.match(/(\d+)/);
                if (match) {
                    const endVal = parseInt(match[1]);
                    const suffix = text.replace(match[1], '');
                    let current = 0;
                    const step = Math.ceil(endVal / 40);
                    const interval = setInterval(() => {
                        current += step;
                        if (current >= endVal) {
                            current = endVal;
                            clearInterval(interval);
                        }
                        target.textContent = String(current).padStart(2, '0') + suffix;
                    }, 30);
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statCards.forEach(card => observer.observe(card));
}

initCounterAnimation();