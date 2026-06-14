// ═══════════════════════════════════════════════════════════════
// Three.js 3D Hero Object — Enhanced World-Class Edition
// ═══════════════════════════════════════════════════════════════

const canvas = document.querySelector('#webgl-canvas');
if (canvas) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Resize to parent container
    function resizeRenderer() {
        const parent = canvas.parentElement;
        if (parent) {
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
    }
    resizeRenderer();

    // Create the icosahedron
    const geometry = new THREE.IcosahedronGeometry(3.2, 0);
    const material = new THREE.MeshStandardMaterial({
        color: 0xbbbbbb,
        metalness: 0.95,
        roughness: 0.12,
        flatShading: true,
        envMapIntensity: 1.5
    });

    const artifact = new THREE.Mesh(geometry, material);
    scene.add(artifact);

    // Wireframe overlay for premium feel
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    const wireframeOverlay = new THREE.Mesh(geometry, wireframeMaterial);
    wireframeOverlay.scale.set(1.02, 1.02, 1.02);
    scene.add(wireframeOverlay);

    // ════════════ LIGHTING ════════════ //
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0x6366f1, 12, 100);
    purpleLight.position.set(5, 5, 5);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 12, 100);
    cyanLight.position.set(-5, -3, 5);
    scene.add(cyanLight);

    const pinkLight = new THREE.PointLight(0xf472b6, 8, 100);
    pinkLight.position.set(0, -5, -3);
    scene.add(pinkLight);

    // ════════════ THEME TOGGLE LISTENER ════════════ //
    const htmlTag = document.documentElement;

    function applyThemeLighting() {
        const theme = htmlTag.getAttribute('data-theme');
        if (theme === 'light') {
            ambientLight.intensity = 0.6;
            material.color.setHex(0xbbbbbb);
            purpleLight.intensity = 12;
            cyanLight.intensity = 12;
            pinkLight.intensity = 8;
            wireframeMaterial.color.setHex(0x6366f1);
        } else {
            ambientLight.intensity = 0.2;
            material.color.setHex(0xdddddd);
            purpleLight.intensity = 8;
            cyanLight.intensity = 8;
            pinkLight.intensity = 5;
            wireframeMaterial.color.setHex(0x818cf8);
        }
    }

    applyThemeLighting();

    window.addEventListener('themeChanged', (e) => {
        applyThemeLighting();
    });

    // ════════════ MOUSE INTERACTION ════════════ //
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        mouseX = (event.clientX - windowHalfX) * 0.003;
        mouseY = (event.clientY - windowHalfY) * 0.003;
    });

    // Initial rapid spin for cinematic entry
    let isRapidSpin = true;
    setTimeout(() => {
        isRapidSpin = false;
    }, 2500);

    // ════════════ ANIMATION LOOP ════════════ //
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        if (isRapidSpin) {
            artifact.rotation.y += 6 * delta;
            artifact.rotation.x += 3 * delta;
        } else {
            targetRotationY = mouseX * 2;
            targetRotationX = mouseY * 2;
            artifact.rotation.y += 0.04 * (targetRotationY - artifact.rotation.y);
            artifact.rotation.x += 0.04 * (targetRotationX - artifact.rotation.x);
            artifact.rotation.z += 0.12 * delta;
        }

        // Subtle floating motion
        artifact.position.y = Math.sin(elapsed * 0.8) * 0.15;

        // Sync wireframe rotation
        wireframeOverlay.rotation.copy(artifact.rotation);
        wireframeOverlay.position.copy(artifact.position);

        // Animate lights in orbit
        purpleLight.position.x = Math.sin(elapsed * 0.5) * 6;
        purpleLight.position.z = Math.cos(elapsed * 0.5) * 6;
        cyanLight.position.x = Math.cos(elapsed * 0.4) * 5;
        cyanLight.position.z = Math.sin(elapsed * 0.4) * 5;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', resizeRenderer);
}
