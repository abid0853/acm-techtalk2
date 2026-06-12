/* ═══════════════════════════════════════════════════════════
   three-setup.js — WebGL Environment (Classical Aesthetic)
   Ambient dust motes · frosted geometries · soft bloom ·
   chromatic aberration · theme-switching · tab-pause
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ═══════════ §1 — THEME PALETTES ═══════════ */
    const THEMES = {
        dark: {
            bg: new THREE.Color(0x0a0f18),         // Deep Oxford Blue / Charcoal
            fogDensity: 0.01,
            primary:  new THREE.Color(0xd4af37),   // Champagne Gold
            secondary: new THREE.Color(0xcd7f32),  // Soft Bronze
            tertiary:  new THREE.Color(0xc0c0c0),   // Silver
            ambient: 0x1a2030,
            bloomStrength: 0.9,                    // Soft cinematic glow
        },
        light: {
            bg: new THREE.Color(0xf5f5f0),         // Alabaster
            fogDensity: 0.008,
            primary:  new THREE.Color(0x1e3a8a),   // Rich Navy
            secondary: new THREE.Color(0xb76e79),  // Rose Gold
            tertiary:  new THREE.Color(0xd4af37),   // Classic Gold
            ambient: 0xa8b2c1,
            bloomStrength: 0.5,                    // Very subtle bloom for light mode
        },
    };

    /* ═══════════ §2 — CONSTANTS ═══════════ */
    const PARTICLE_COUNT   = 2500;
    const PARTICLE_SPREAD  = 80;
    const PARTICLE_DEPTH   = 200;
    const NUM_GEOMETRIES   = 10;
    const MOUSE_INFLUENCE  = 0.12;

    /* ═══════════ §3 — STATE ═══════════ */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let renderer, scene, camera, postProc;
    let particles, geometries = [];
    let lights = {};
    let clock, animId;
    let currentTheme = 'dark';
    let paused = false;

    // Camera keyframes (Hero → About → Speakers → Schedule → Contact)
    const cameraPath = [
        { pos: new THREE.Vector3(0,   0,   50)  },
        { pos: new THREE.Vector3(-8,  15,  20)  },
        { pos: new THREE.Vector3(10,  30,  -10) },
        { pos: new THREE.Vector3(-5,  50,  -40) },
        { pos: new THREE.Vector3(0,   70,  -70) },
    ];

    /* ═══════════ §4 — SHADERS ═══════════ */
    const particleVert = `
        attribute float size;
        attribute vec3 customColor;
        attribute float alpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            vColor = customColor;
            vAlpha = alpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (250.0 / -mv.z); // Slightly larger dust motes
            gl_Position  = projectionMatrix * mv;
        }
    `;
    const particleFrag = `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            // Softer gradient for dust motes
            float g = 1.0 - smoothstep(0.0, 0.5, d);
            g = pow(g, 2.0); 
            gl_FragColor = vec4(vColor, g * vAlpha);
        }
    `;

    /* ———— Post-processing shaders ———— */
    const brightPassFS = `
        uniform sampler2D tDiffuse; uniform float threshold; varying vec2 vUv;
        void main() {
            vec4 c = texture2D(tDiffuse, vUv);
            float l = dot(c.rgb, vec3(0.299,0.587,0.114));
            // softer threshold curve for classic bloom
            gl_FragColor = c * smoothstep(threshold, threshold+0.3, l); 
        }
    `;
    const blurFS = `
        uniform sampler2D tDiffuse; uniform vec2 dir; uniform vec2 res; varying vec2 vUv;
        void main() {
            vec2 px = dir / res; vec4 s = vec4(0.0);
            s += texture2D(tDiffuse, vUv - 4.0*px) * 0.0162;
            s += texture2D(tDiffuse, vUv - 3.0*px) * 0.0540;
            s += texture2D(tDiffuse, vUv - 2.0*px) * 0.1216;
            s += texture2D(tDiffuse, vUv - 1.0*px) * 0.1945;
            s += texture2D(tDiffuse, vUv)           * 0.2270;
            s += texture2D(tDiffuse, vUv + 1.0*px) * 0.1945;
            s += texture2D(tDiffuse, vUv + 2.0*px) * 0.1216;
            s += texture2D(tDiffuse, vUv + 3.0*px) * 0.0540;
            s += texture2D(tDiffuse, vUv + 4.0*px) * 0.0162;
            gl_FragColor = s;
        }
    `;
    const compositeFS = `
        uniform sampler2D tOrig; uniform sampler2D tBloom;
        uniform float bloomStr; uniform float ca; uniform float time;
        varying vec2 vUv;
        void main() {
            vec2 c = vUv - 0.5; float d = length(c);
            float cs = ca * d * d + sin(time*0.5)*0.0001; // subtle CA
            float r = texture2D(tOrig, vUv + c*cs).r;
            float g = texture2D(tOrig, vUv).g;
            float b = texture2D(tOrig, vUv - c*cs).b;
            vec3 col = vec3(r,g,b) + texture2D(tBloom, vUv).rgb * bloomStr;
            
            // Soft classic vignette
            col *= 1.0 - d*0.6;                        
            
            // Subtle film grain
            col += (fract(sin(dot(vUv*time,vec2(12.9898,78.233)))*43758.5453) - 0.5)*0.015; 
            gl_FragColor = vec4(col, 1.0);
        }
    `;
    const quadVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position,1.0); }`;

    /* ═══════════ §5 — POST-PROCESSOR CLASS ═══════════ */
    class PostProcessor {
        constructor(r, s, c) {
            this.r = r; this.s = s; this.c = c; this.clk = new THREE.Clock();
            const sz = r.getSize(new THREE.Vector2()), dp = r.getPixelRatio();
            const w = sz.x*dp, h = sz.y*dp;
            const rtO = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: THREE.HalfFloatType };

            this.rt0 = new THREE.WebGLRenderTarget(w, h, rtO);
            this.rt1 = new THREE.WebGLRenderTarget(w/2, h/2, rtO);
            this.rt2 = new THREE.WebGLRenderTarget(w/4, h/4, rtO);
            this.rt3 = new THREE.WebGLRenderTarget(w/4, h/4, rtO);

            const mk = (u, fs) => new THREE.ShaderMaterial({ uniforms: u, vertexShader: quadVS, fragmentShader: fs });
            this.mBright = mk({ tDiffuse:{value:null}, threshold:{value:0.4} }, brightPassFS);
            this.mBlurH  = mk({ tDiffuse:{value:null}, dir:{value:new THREE.Vector2(1,0)}, res:{value:new THREE.Vector2(w/4,h/4)} }, blurFS);
            this.mBlurV  = mk({ tDiffuse:{value:null}, dir:{value:new THREE.Vector2(0,1)}, res:{value:new THREE.Vector2(w/4,h/4)} }, blurFS);
            this.mComp   = mk({ tOrig:{value:null}, tBloom:{value:null}, bloomStr:{value:0.9}, ca:{value:0.002}, time:{value:0} }, compositeFS);

            const g = new THREE.PlaneGeometry(2,2);
            this.mesh = new THREE.Mesh(g, this.mBright);
            this.qScene = new THREE.Scene(); this.qScene.add(this.mesh);
            this.qCam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
            this.setSize(w,h);
        }
        setSize(w,h) {
            this.rt0.setSize(w,h); this.rt1.setSize(w/2,h/2);
            this.rt2.setSize(w/4,h/4); this.rt3.setSize(w/4,h/4);
            this.mBlurH.uniforms.res.value.set(w/4,h/4);
            this.mBlurV.uniforms.res.value.set(w/4,h/4);
        }
        pass(mat, rt) {
            this.mesh.material = mat;
            this.r.setRenderTarget(rt); this.r.clear();
            this.r.render(this.qScene, this.qCam);
        }
        render() {
            const t = this.clk.getElapsedTime();
            this.r.setRenderTarget(this.rt0); this.r.clear();
            this.r.render(this.s, this.c);

            this.mBright.uniforms.tDiffuse.value = this.rt0.texture;
            this.pass(this.mBright, this.rt1);

            this.mBlurH.uniforms.tDiffuse.value = this.rt1.texture; this.pass(this.mBlurH, this.rt2);
            this.mBlurV.uniforms.tDiffuse.value = this.rt2.texture; this.pass(this.mBlurV, this.rt3);
            
            // Double blur for very soft layerful glow
            this.mBlurH.uniforms.tDiffuse.value = this.rt3.texture; this.pass(this.mBlurH, this.rt2);
            this.mBlurV.uniforms.tDiffuse.value = this.rt2.texture; this.pass(this.mBlurV, this.rt3);

            this.mComp.uniforms.tOrig.value  = this.rt0.texture;
            this.mComp.uniforms.tBloom.value = this.rt3.texture;
            this.mComp.uniforms.time.value   = t;
            this.mesh.material = this.mComp;
            this.r.setRenderTarget(null); this.r.clear();
            this.r.render(this.qScene, this.qCam);
        }
    }

    /* ═══════════ §6 — INIT ═══════════ */
    function init() {
        const canvas = document.getElementById('webgl-canvas');
        clock = new THREE.Clock();

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0; // Slightly lower exposure for classical look

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.copy(cameraPath[0].pos);

        // Apply initial theme
        const htmlTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        currentTheme = htmlTheme;
        applyThemeToScene(currentTheme);

        createParticles();
        createFloatingGeometries();
        createLights();

        postProc = new PostProcessor(renderer, scene, camera);
        postProc.mComp.uniforms.bloomStr.value = THEMES[currentTheme].bloomStrength;

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('resize', onResize);

        // Performance: pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                paused = true;
                clock.stop();
            } else {
                paused = false;
                clock.start();
                animate();
            }
        });

        animate();
    }

    /* ═══════════ §7 — PARTICLES ═══════════ */
    function createParticles() {
        const P = PARTICLE_COUNT, S = PARTICLE_SPREAD, D = PARTICLE_DEPTH;
        const pos = new Float32Array(P * 3);
        const col = new Float32Array(P * 3);
        const siz = new Float32Array(P);
        const alp = new Float32Array(P);
        const pal = THEMES[currentTheme];

        for (let i = 0; i < P; i++) {
            const i3 = i * 3;
            pos[i3]     = (Math.random()-0.5) * S;
            pos[i3 + 1] = (Math.random()-0.5) * D - 30;
            pos[i3 + 2] = (Math.random()-0.5) * S;

            const t = Math.random();
            const c = new THREE.Color();
            if (currentTheme === 'dark') {
                if (t < 0.6) c.lerpColors(new THREE.Color(0xffffff), pal.primary, t*1.5);
                else         c.lerpColors(pal.primary, pal.secondary, (t-0.6)*2.5);
            } else {
                if (t < 0.5) c.lerpColors(pal.primary, pal.tertiary, t*2.0);
                else         c.lerpColors(pal.tertiary, pal.secondary, (t-0.5)*2.0);
            }
            col[i3] = c.r; col[i3+1] = c.g; col[i3+2] = c.b;

            // Varying size for depth of field illusion
            siz[i] = Math.random() * 4 + 1.0; 
            // Softer alpha
            alp[i] = Math.random() * 0.4 + 0.1;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position',    new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('customColor', new THREE.BufferAttribute(col, 3));
        geo.setAttribute('size',        new THREE.BufferAttribute(siz, 1));
        geo.setAttribute('alpha',       new THREE.BufferAttribute(alp, 1));

        const mat = new THREE.ShaderMaterial({
            vertexShader: particleVert,
            fragmentShader: particleFrag,
            transparent: true, depthWrite: false, 
            blending: currentTheme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending,
        });

        particles = new THREE.Points(geo, mat);
        scene.add(particles);
    }

    /* ═══════════ §8 — FLOATING GEOMETRIES ═══════════ */
    function createFloatingGeometries() {
        const types = [
            () => new THREE.IcosahedronGeometry(1.5, 0),
            () => new THREE.TorusGeometry(1.2, 0.4, 16, 32),
            () => new THREE.OctahedronGeometry(1.3, 0),
            () => new THREE.TorusKnotGeometry(1, 0.3, 64, 8, 2, 3),
            () => new THREE.DodecahedronGeometry(1.2, 0),
        ];
        const pal = THEMES[currentTheme];
        
        // Classical frosted glass with gold wireframe effect
        const m1 = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            metalness: 0.1, 
            roughness: 0.8, // frosted look
            transparent: true, 
            opacity: currentTheme === 'dark' ? 0.15 : 0.4, 
            wireframe: true, 
            emissive: pal.primary, 
            emissiveIntensity: currentTheme === 'dark' ? 0.6 : 1.0 // elegant warm glow
        });
        const m2 = m1.clone(); 
        m2.emissive = pal.secondary; 
        m2.emissiveIntensity = currentTheme === 'dark' ? 0.4 : 0.8;

        for (let i = 0; i < NUM_GEOMETRIES; i++) {
            const mat = (i % 2 === 0 ? m1 : m2).clone();
            const mesh = new THREE.Mesh(types[i % types.length](), mat);
            mesh.scale.setScalar(Math.random() * 1.5 + 0.8);
            mesh.position.set(
                (Math.random()-0.5) * 40,
                (i / NUM_GEOMETRIES) * -140 + 20,
                (Math.random()-0.5) * 40 - 10
            );
            mesh.userData = {
                rs: new THREE.Vector3((Math.random()-0.5)*0.006, (Math.random()-0.5)*0.006, (Math.random()-0.5)*0.003), // slower, elegant rotation
                fo: Math.random()*Math.PI*2, fs: Math.random()*0.3+0.1, fa: Math.random()*0.5+0.2, // smoother bobbing
                bp: mesh.position.clone(),
            };
            scene.add(mesh); geometries.push(mesh);
        }
    }

    /* ═══════════ §9 — LIGHTS ═══════════ */
    function createLights() {
        const pal = THEMES[currentTheme];
        lights.ambient = new THREE.AmbientLight(pal.ambient, 0.7);
        // Soft warm studio lighting
        lights.p1 = new THREE.PointLight(pal.primary,   1.5, 120); lights.p1.position.set(15,  15,  20);
        lights.p2 = new THREE.PointLight(pal.secondary, 1.2, 120); lights.p2.position.set(-15, -20, 15);
        lights.p3 = new THREE.PointLight(pal.tertiary,  1.0,  90); lights.p3.position.set(0,   -50, 0);
        scene.add(lights.ambient, lights.p1, lights.p2, lights.p3);
    }

    /* ═══════════ §10 — THEME SWITCH ═══════════ */
    function applyThemeToScene(theme) {
        const pal = THEMES[theme];
        currentTheme = theme;

        renderer.setClearColor(pal.bg, 1);
        scene.fog = new THREE.FogExp2(pal.bg, pal.fogDensity);

        // Recolor particles
        if (particles) {
            particles.material.blending = theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending;
            particles.material.needsUpdate = true;
            
            const colAttr = particles.geometry.attributes.customColor;
            const arr = colAttr.array;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                const t = Math.random();
                const c = new THREE.Color();
                if (theme === 'dark') {
                    if (t < 0.6) c.lerpColors(new THREE.Color(0xffffff), pal.primary, t*1.5);
                    else         c.lerpColors(pal.primary, pal.secondary, (t-0.6)*2.5);
                } else {
                    if (t < 0.5) c.lerpColors(pal.primary, pal.tertiary, t*2.0);
                    else         c.lerpColors(pal.tertiary, pal.secondary, (t-0.5)*2.0);
                }
                arr[i3] = c.r; arr[i3+1] = c.g; arr[i3+2] = c.b;
            }
            colAttr.needsUpdate = true;
        }

        // Recolor geometries
        for (const mesh of geometries) {
            if (mesh.material) {
                const isEven = geometries.indexOf(mesh) % 2 === 0;
                mesh.material.emissive = isEven ? pal.primary : pal.secondary;
                mesh.material.opacity = theme === 'dark' ? 0.15 : 0.4;
                mesh.material.emissiveIntensity = theme === 'dark' ? 0.6 : 1.0;
                mesh.material.needsUpdate = true;
            }
        }

        // Recolor lights
        if (lights.ambient) {
            lights.ambient.color.set(pal.ambient);
            lights.p1.color.copy(pal.primary);
            lights.p2.color.copy(pal.secondary);
            lights.p3.color.copy(pal.tertiary);
        }

        // Adjust bloom for elegant look depending on theme
        if (postProc) {
            postProc.mComp.uniforms.bloomStr.value = pal.bloomStrength;
        }
    }

    function setTheme(theme) {
        applyThemeToScene(theme);
    }

    /* ═══════════ §11 — ANIMATE ═══════════ */
    function animate() {
        if (paused) return;
        animId = requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        // Smooth mouse
        mouse.x += (mouse.tx - mouse.x) * 0.03; // Even smoother follow
        mouse.y += (mouse.ty - mouse.y) * 0.03;

        // Particles: gentle anti-gravity float + slow sine turbulence
        if (particles) {
            const p = particles.geometry.attributes.position;
            const a = p.array;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                a[i3 + 1] += 0.01 + Math.sin(t*0.3 + i*0.01) * 0.003;
                a[i3]     += Math.sin(t*0.2 + i*0.1)  * 0.002;
                a[i3 + 2] += Math.cos(t*0.1 + i*0.15) * 0.002;
                if (a[i3+1] > PARTICLE_DEPTH/2 + 30) {
                    a[i3+1] = -PARTICLE_DEPTH/2 - 30;
                    a[i3]   = (Math.random()-0.5) * PARTICLE_SPREAD;
                    a[i3+2] = (Math.random()-0.5) * PARTICLE_SPREAD;
                }
            }
            p.needsUpdate = true;
        }

        // Geometries: slow rotate + elegant bob + parallax
        for (const m of geometries) {
            const d = m.userData;
            m.rotation.x += d.rs.x; m.rotation.y += d.rs.y; m.rotation.z += d.rs.z;
            m.position.y = d.bp.y + Math.sin(t*d.fs + d.fo) * d.fa;
            m.position.x = d.bp.x + mouse.x * MOUSE_INFLUENCE * 2;
            m.position.z = d.bp.z + mouse.y * MOUSE_INFLUENCE * 1.5;
        }

        // Camera parallax
        camera.rotation.x += (mouse.y * 0.015 - camera.rotation.x) * 0.02;
        camera.rotation.y += (-mouse.x * 0.015 - camera.rotation.y) * 0.02;

        postProc.render();
    }

    /* ═══════════ §12 — CAMERA UPDATE ═══════════ */
    function updateCameraFromScroll(progress) {
        const n = cameraPath.length - 1;
        const raw = progress * n;
        const idx = Math.floor(raw);
        const frac = raw - idx;
        const from = cameraPath[Math.min(idx, n)];
        const to   = cameraPath[Math.min(idx + 1, n)];
        
        // Classical elegant easing: softer sine easing
        const ease = 0.5 - Math.cos(frac * Math.PI) / 2;
        camera.position.lerpVectors(from.pos, to.pos, ease);
    }

    /* ═══════════ §13 — EVENTS ═══════════ */
    function onMouseMove(e) {
        mouse.tx = (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }
    function onResize() {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        const dp = renderer.getPixelRatio();
        postProc.setSize(w*dp, h*dp);
    }

    /* ═══════════ §14 — PUBLIC API ═══════════ */
    window.Scene3D = { init, updateCameraFromScroll, setTheme };
})();
