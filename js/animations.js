// js/animations.js
gsap.registerPlugin(ScrollTrigger);

const splitTextToChars = (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = text.split('').map(char => {
            if (char === ' ') return `<span class="char" style="display:inline-block; width:0.3em; visibility:hidden;">&nbsp;</span>`;
            return `<span class="char" style="display:inline-block; visibility:hidden;">${char}</span>`;
        }).join('');
    });
};

document.addEventListener("DOMContentLoaded", () => {
    splitTextToChars('.split-line');

    const masterTl = gsap.timeline();
    document.body.style.overflow = 'hidden';

    masterTl
        .to(".loader-text", { y: 0, duration: 1.2, stagger: 0.2, ease: "expo.out" })
        .to({}, { duration: 1 })
        .to(".loader-text", { y: "-100%", duration: 0.8, stagger: 0.1, ease: "expo.in" })
        .to(".loader-progress", { opacity: 0, duration: 0.4 }, "<")
        .to(".loader-panel.top", { yPercent: -100, duration: 1.5, ease: "power4.inOut" }, "+=0.1")
        .to(".loader-panel.bottom", { 
            yPercent: 100, 
            duration: 1.5, 
            ease: "power4.inOut",
            onComplete: () => {
                document.body.style.overflow = '';
                document.body.style.overflowX = 'hidden'; 
                document.getElementById('loader').style.display = 'none';
            }
        }, "<")
        .fromTo(".nav-container", { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, "-=0.8")
        .fromTo(".orb", { scale: 0, opacity: 0 }, { scale: 1, opacity: 0.4, duration: 2, ease: "elastic.out(1, 0.5)", stagger: 0.2 }, "-=1.2")
        .fromTo(".char", { y: 100, opacity: 0, rotationX: -90, transformOrigin: "bottom center" }, { y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.03, ease: "back.out(1.7)", autoAlpha: 1 }, "-=1.5")
        .fromTo(".hero-elem:not(.split-line)", { y: 40, opacity: 0 }, { y: 0, opacity: 1, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power3.out" }, "-=1");

    gsap.to(".hero-content", {
        yPercent: 30, opacity: 0, scale: 0.9,
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.to(".orb-1", { yPercent: 40, xPercent: 20, scale: 1.2, scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 } });
    gsap.to(".orb-2", { yPercent: -40, xPercent: -20, scale: 1.2, scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.5 } });

    gsap.set(".stat-card", { autoAlpha: 0, rotationX: 45, y: 100, transformOrigin: "top center" });
    ScrollTrigger.create({
        trigger: "#stats",
        start: "top 80%",
        onEnter: () => {
            gsap.to(".stat-card", { autoAlpha: 1, rotationX: 0, y: 0, duration: 1.2, stagger: 0.2, ease: "elastic.out(1, 0.6)" });
            document.querySelectorAll('.stat-number').forEach(counter => {
                const target = +counter.getAttribute('data-target');
                gsap.fromTo(counter, { innerText: 0 }, { 
                    innerText: target, duration: 2, ease: "power2.out", snap: { innerText: 1 },
                    onUpdate: function() { counter.innerText = Math.ceil(this.targets()[0].innerText) + (target > 100 ? '+' : ''); }
                });
            });
        }
    });

    gsap.set(".feature-item", { autoAlpha: 0, x: -50 });
    gsap.to(".feature-item", {
        scrollTrigger: { trigger: ".feature-grid", start: "top 85%" },
        autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.5)"
    });

    gsap.fromTo(".card-1", 
        { x: -100, y: 100, rotationZ: -30, autoAlpha: 0 },
        { 
            x: 0, y: 0, rotationZ: -6, autoAlpha: 1, duration: 1.5, ease: "power3.out",
            scrollTrigger: { trigger: ".about-visual", start: "top 75%" },
            onComplete: () => { gsap.to(".card-1", { y: -15, rotationZ: -9, ease: "sine.inOut", duration: 3, yoyo: true, repeat: -1 }); }
        }
    );

    gsap.fromTo(".card-2", 
        { x: 100, y: 100, rotationZ: 30, autoAlpha: 0 },
        { 
            x: 0, y: 0, rotationZ: 6, autoAlpha: 1, duration: 1.5, ease: "power3.out", delay: 0.2,
            scrollTrigger: { trigger: ".about-visual", start: "top 75%" },
            onComplete: () => { gsap.to(".card-2", { y: 15, rotationZ: 9, ease: "sine.inOut", duration: 3.5, yoyo: true, repeat: -1 }); }
        }
    );

    gsap.set(".speaker-card", { autoAlpha: 0, rotationY: 90, transformOrigin: "left center" });
    gsap.to(".speaker-card", {
        scrollTrigger: { trigger: ".speaker-grid", start: "top 80%" },
        autoAlpha: 1, rotationY: 0, duration: 1.2, stagger: 0.2, ease: "power4.out"
    });

    gsap.to(".timeline", {
        "--line-progress": "100%", ease: "none",
        scrollTrigger: { trigger: ".timeline", start: "top center", end: "bottom center", scrub: true }
    });

    gsap.set(".timeline-item", { autoAlpha: 0, x: 50 });
    gsap.utils.toArray('.timeline-item').forEach(item => {
        gsap.to(item, {
            scrollTrigger: { trigger: item, start: "top 70%" },
            autoAlpha: 1, x: 0, duration: 0.8, ease: "back.out(1.2)"
        });
    });
    
    gsap.set(".reveal-up", { autoAlpha: 0, y: 50 });
    gsap.utils.toArray('.reveal-up').forEach(item => {
        gsap.to(item, {
            scrollTrigger: { trigger: item, start: "top 85%" },
            autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out"
        });
    });

    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
            gsap.to(btn, { x: x, y: y, duration: 0.4, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
        });
    });

    const cursor = document.querySelector('.cursor-spotlight');
    if (window.innerWidth > 768 && cursor) {
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        gsap.ticker.add(() => { gsap.set(cursor, { x: mouseX, y: mouseY }); });
    }

    gsap.to(".scroll-progress", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true }
    });
});