/* ═══════════════════════════════════════════════════════════
   main.js — DOM logic, GSAP ScrollTrigger, theme toggle,
   countdown, section transitions, accessibility
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ═══════════ §1 — CONFIG ═══════════ */
    const SECTION_IDS = ['hero', 'about', 'speakers', 'schedule', 'contact'];
    const SECTION_COUNT = SECTION_IDS.length;
    const EVENT_DATE = new Date('2026-10-24T09:00:00+05:30');

    /* ═══════════ §2 — STATE ═══════════ */
    let currentSectionIndex = 0;
    let isTransitioning = false;
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

            // Hero entrance
            gsap.fromTo(
                '#section-hero',
                { opacity: 0 },
                { opacity: 1, duration: 1, ease: 'power2.out' }
            );
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
        const bar = document.getElementById('loader-progress');
        if (!loader) { onDone(); return; }

        let p = 0;
        const iv = setInterval(() => {
            p += Math.random() * 15 + 5;
            if (p > 100) p = 100;
            if (bar) {
                bar.style.width = p + '%';
                // Update ARIA
                bar.parentElement.setAttribute('aria-valuenow', Math.round(p));
            }
            if (p >= 100) {
                clearInterval(iv);
                setTimeout(() => {
                    gsap.to(loader, {
                        opacity: 0, duration: 0.8, ease: 'power2.inOut',
                        onComplete: () => { loader.style.display = 'none'; onDone(); },
                    });
                }, 400);
            }
        }, 120);
    }

    /* ═══════════ §5 — SCROLL CONTROLLER ═══════════ */
    function initScrollController() {
        gsap.registerPlugin(ScrollTrigger);

        const scrollContainer = document.getElementById('scroll-container');
        const progressBar = document.getElementById('scroll-progress');

        ScrollTrigger.create({
            trigger: scrollContainer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            onUpdate: (self) => {
                const progress = self.progress;

                // Camera
                Scene3D.updateCameraFromScroll(progress);

                // Progress bar
                if (progressBar) {
                    const pct = progress * 100;
                    progressBar.style.width = pct + '%';
                    progressBar.setAttribute('aria-valuenow', Math.round(pct));
                }

                // Section index
                const idx = Math.min(Math.floor(progress * SECTION_COUNT), SECTION_COUNT - 1);
                if (idx !== currentSectionIndex && !isTransitioning) {
                    transitionSection(currentSectionIndex, idx);
                    currentSectionIndex = idx;
                }
                updateDots(idx);
                updateNavLinks(idx);
            },
        });

        setupInitialSections();
    }

    /* ═══════════ §6 — SECTION TRANSITIONS ═══════════ */
    function transitionSection(fromIdx, toIdx) {
        const fromEl = document.getElementById('section-' + SECTION_IDS[fromIdx]);
        const toEl   = document.getElementById('section-' + SECTION_IDS[toIdx]);
        if (!fromEl || !toEl || fromEl === toEl) return;

        isTransitioning = true;
        gsap.killTweensOf(fromEl);
        gsap.killTweensOf(toEl);

        // Fade out
        gsap.to(fromEl, {
            opacity: 0, duration: 0.4, ease: 'power2.inOut',
            onComplete: () => {
                fromEl.classList.remove('active');
                fromEl.style.visibility = 'hidden';
                gsap.set(fromEl, { y: 0 });
            },
        });

        // Fade in
        const dir = toIdx > fromIdx ? 1 : -1;
        toEl.style.visibility = 'visible';
        toEl.classList.add('active');

        gsap.fromTo(toEl,
            { opacity: 0, y: dir * 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.15,
              onComplete: () => { isTransitioning = false; } }
        );

        // Stagger children
        animateChildren(toEl);

        // Counters
        if (SECTION_IDS[toIdx] === 'about') animateCounters();
    }

    function animateChildren(el) {
        const children = el.querySelectorAll(
            '.section-tag, .section-title, .section-desc, .glass-card, .stat-card, ' +
            '.feature, .speaker-card, .contact-card, .timeline-item, .about-stats, ' +
            '.about-features, .speakers-grid, .timeline, .contact-grid, .contact-lead, ' +
            '.site-footer, .hero-badge, .title-line, .hero-subtitle, .hero-meta, ' +
            '.hero-countdown, .hero-actions, .scroll-hint'
        );
        if (!children.length) return;
        gsap.killTweensOf(children);
        gsap.fromTo(children,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.25 }
        );
    }

    function setupInitialSections() {
        SECTION_IDS.forEach((id, i) => {
            const el = document.getElementById('section-' + id);
            if (!el) return;
            if (i === 0) {
                el.classList.add('active');
                gsap.set(el, { opacity: 1, visibility: 'visible' });
                const heroChildren = el.querySelectorAll(
                    '.hero-badge, .title-line, .hero-subtitle, .hero-meta, .hero-countdown, .hero-actions, .scroll-hint'
                );
                gsap.fromTo(heroChildren,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.3 }
                );
            } else {
                gsap.set(el, { opacity: 0, visibility: 'hidden' });
                el.classList.remove('active');
            }
        });
    }

    /* ═══════════ §7 — NAVIGATION ═══════════ */
    function initNavigation() {
        // All data-target links (buttons, nav links, etc.)
        document.querySelectorAll('[data-target]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                scrollToSection(target);
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
        const idx = SECTION_IDS.indexOf(sectionId);
        if (idx === -1) return;
        const sc = document.getElementById('scroll-container');
        const total = sc.scrollHeight - window.innerHeight;
        const target = (idx / SECTION_COUNT) * total + 1;
        window.scrollTo({ top: target, behavior: 'smooth' });
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

    /* ═══════════ §8 — THEME TOGGLE ═══════════ */
    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        // Restore saved preference
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

        // Update button label
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);

        // Update Three.js scene
        Scene3D.setTheme(theme);
    }

    /* ═══════════ §9 — STAT COUNTERS ═══════════ */
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

    /* ═══════════ §10 — COUNTDOWN ═══════════ */
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

    /* ═══════════ §11 — NAVBAR SCROLL ═══════════ */
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

    /* ═══════════ §12 — KEYBOARD NAVIGATION ═══════════ */
    function initKeyboardNav() {
        // Arrow keys on section dots
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

        // Escape closes mobile menu
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