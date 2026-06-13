const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.IcosahedronGeometry(3.5, 0); 
const material = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa, // Default to light theme grey
    metalness: 1.0,
    roughness: 0.15,
    flatShading: true
});

const artifact = new THREE.Mesh(geometry, material);
scene.add(artifact);

// ════════════ LIGHTING SETUP (DEFAULT LIGHT THEME) ════════════ //
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pinkLight = new THREE.PointLight(0xFF0055, 15, 100);
pinkLight.position.set(5, 5, 5);
scene.add(pinkLight);

const cyanLight = new THREE.PointLight(0x00FFCC, 15, 100);
cyanLight.position.set(-5, -5, 5);
scene.add(cyanLight);

// ════════════ THEME TOGGLE LISTENER ════════════ //
window.addEventListener('themeChanged', (e) => {
    const theme = e.detail.theme;
    if (theme === 'light') {
        ambientLight.intensity = 0.8;
        material.color.setHex(0xaaaaaa); 
        pinkLight.intensity = 15;
        cyanLight.intensity = 15;
    } else {
        ambientLight.intensity = 0.2;
        material.color.setHex(0xcccccc);
        pinkLight.intensity = 8;
        cyanLight.intensity = 8;
    }
});

// ════════════ PHYSICS & ANIMATION ════════════ //
let targetRotationX = 0;
let targetRotationY = 0;
let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.003;
    mouseY = (event.clientY - windowHalfY) * 0.003;
});

let isRapidSpin = true;
setTimeout(() => {
    isRapidSpin = false;
}, 3000);

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (isRapidSpin) {
        artifact.rotation.y += 8 * delta;
        artifact.rotation.x += 4 * delta;
    } else {
        targetRotationY = mouseX * 2;
        targetRotationX = mouseY * 2;
        artifact.rotation.y += 0.05 * (targetRotationY - artifact.rotation.y);
        artifact.rotation.x += 0.05 * (targetRotationX - artifact.rotation.x);
        artifact.rotation.z += 0.15 * delta;
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
