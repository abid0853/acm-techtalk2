/* ═══════════════════════════════════════════════════════════
   main.js — Native Scroll Logic, GSAP, Theme Toggle
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ═══════════ §1 — CONFIG ═══════════ */
    const SECTION_IDS = ['hero', 'about', 'speakers', 'schedule', 'contact'];
    const EVENT_DATE = new Date('2026-10-24T09:00:00+05:30');

    /* ═══════════ §2 — STATE ═══════════ */
    let countersAnimated = false;

    /* ═══════════ §3 — BOOT ═══════════ */
    function boot() {
        // 1. Init Three.js scene
        Scene3D.init();

        // 2. Loader animation → then reveal
        animateLoader(() => {
            initScrollController();
            startCountdown();
            initThemeToggle();
            initNavigation();
            setupNavbarScroll();
            initKeyboardNav();

            // Initial children animation for sections in view
            ScrollTrigger.refresh();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    /* ═══════════ §4 — LOADER ═══════════ */
    function animateLoader(onDone) {
        const loader = document.getElementById('loader');
        if (!loader) { onDone(); return; }

        // Simple delay to let 3D context compile, then fade out
        setTimeout(() => {
            gsap.to(loader, {
                opacity: 0, duration: 0.8, ease: 'power2.inOut',
                onComplete: () => { loader.style.display = 'none'; onDone(); },
            });
        }, 800);
    }

    /* ═══════════ §5 — SCROLL CONTROLLER (NATIVE) ═══════════ */
    function initScrollController() {
        gsap.registerPlugin(ScrollTrigger);

        const progressBar = document.getElementById('scroll-progress');

        // Global scroll trigger for camera and progress bar
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (self) => {
                const progress = self.progress;

                // Move 3D Camera smoothly
                Scene3D.updateCameraFromScroll(progress);

                // Update Progress bar
                if (progressBar) {
                    const pct = progress * 100;
                    progressBar.style.width = pct + '%';
                    progressBar.setAttribute('aria-valuenow', Math.round(pct));
                }
            },
        });

        // Trigger animations per section as they enter viewport
        SECTION_IDS.forEach((id, index) => {
            const el = document.getElementById('section-' + id);
            if (!el) return;

            // Prepare children for animation
            const children = el.querySelectorAll(
                '.section-tag, .section-title, .section-desc, .glass-card, .stat-card, ' +
                '.feature, .speaker-card, .contact-card, .timeline-item, .about-stats, ' +
                '.about-features, .speakers-grid, .timeline, .contact-grid, .contact-lead, ' +
                '.site-footer, .hero-badge, .title-line, .hero-subtitle, .hero-meta, ' +
                '.hero-countdown, .hero-actions, .scroll-hint'
            );
            
            if (children.length > 0) {
                gsap.set(children, { opacity: 0, y: 30 });
            }

            ScrollTrigger.create({
                trigger: el,
                start: 'top 80%', // Triggers when top of section hits 80% of viewport
                onEnter: () => {
                    if (children.length > 0) {
                        gsap.to(children, {
                            opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out'
                        });
                    }
                    if (id === 'about') animateCounters();
                    updateDots(index);
                    updateNavLinks(index);
                },
                onEnterBack: () => {
                    updateDots(index);
                    updateNavLinks(index);
                }
            });
        });
    }

    /* ═══════════ §6 — NAVIGATION ═══════════ */
    function initNavigation() {
        // All data-target links
        document.querySelectorAll('[data-target]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const targetId = link.getAttribute('data-target');
                scrollToSection(targetId);
                
                // Close mobile menu
                document.getElementById('nav-links')?.classList.remove('mobile-open');
                const toggle = document.getElementById('mobile-toggle');
                if (toggle) { toggle.classList.remove('active'); toggle.setAttribute('aria-expanded', 'false'); }
            });
        });

        // Mobile toggle
        const mobileToggle = document.getElementById('mobile-toggle');
        const navLinks = document.getElementById('nav-links');
        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                const open = mobileToggle.classList.toggle('active');
                navLinks.classList.toggle('mobile-open');
                mobileToggle.setAttribute('aria-expanded', String(open));
                mobileToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
            });
        }
    }

    function scrollToSection(sectionId) {
        const el = document.getElementById('section-' + sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function updateDots(idx) {
        document.querySelectorAll('.dot').forEach((dot, i) => {
            const active = i === idx;
            dot.classList.toggle('active', active);
            dot.setAttribute('aria-selected', String(active));
        });
    }

    function updateNavLinks(idx) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const active = link.getAttribute('data-target') === SECTION_IDS[idx];
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    /* ═══════════ §7 — THEME TOGGLE ═══════════ */
    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        const saved = localStorage.getItem('tt2026-theme');
        if (saved) applyTheme(saved);

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('tt2026-theme', next);
        });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#05050a' : '#f4f6fb';

        const btn = document.getElementById('theme-toggle');
        if (btn) btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);

        Scene3D.setTheme(theme);
    }

    /* ═══════════ §8 — STAT COUNTERS ═══════════ */
    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;
        document.querySelectorAll('.stat-number[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            const obj = { val: 0 };
            gsap.to(obj, {
                val: target, duration: 2, ease: 'power2.out',
                onUpdate: () => { el.textContent = Math.round(obj.val); },
            });
        });
    }

    /* ═══════════ §9 — COUNTDOWN ═══════════ */
    function startCountdown() {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    function updateCountdown() {
        let diff = EVENT_DATE - new Date();
        if (diff < 0) diff = 0;
        const d = Math.floor(diff / 864e5);
        const h = Math.floor(diff / 36e5 % 24);
        const m = Math.floor(diff / 6e4 % 60);
        const s = Math.floor(diff / 1e3 % 60);
        setText('cd-days', d); setText('cd-hours', h);
        setText('cd-mins', m); setText('cd-secs', s);
    }

    function setText(id, v) {
        const el = document.getElementById(id);
        if (el) el.textContent = String(v).padStart(2, '0');
    }

    /* ═══════════ §10 — NAVBAR SCROLL ═══════════ */
    function setupNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        ScrollTrigger.create({
            start: 50,
            onUpdate: self => {
                navbar.classList.toggle('scrolled', self.scroll() > 50);
            },
        });
    }

    /* ═══════════ §11 — KEYBOARD NAVIGATION ═══════════ */
    function initKeyboardNav() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.addEventListener('keydown', e => {
                let next = i;
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.min(i + 1, dots.length - 1);
                else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.max(i - 1, 0);
                else return;
                e.preventDefault();
                dots[next].focus();
                dots[next].click();
            });
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const navLinks = document.getElementById('nav-links');
                const toggle = document.getElementById('mobile-toggle');
                if (navLinks?.classList.contains('mobile-open')) {
                    navLinks.classList.remove('mobile-open');
                    if (toggle) { toggle.classList.remove('active'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
                }
            }
        });
    }

})();