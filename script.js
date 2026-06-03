        import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
        import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.02); // Darker fog to match background

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize for mobile
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true; 
        controls.autoRotateSpeed = 0.8;

        // --- PURPLE GLOBE ---
        const particleCount = 4500;
        const globeGeometry = new THREE.BufferGeometry();
        const globePositions = new Float32Array(particleCount * 3);
        const globeColors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x8a2be2); 
        const color2 = new THREE.Color(0xff66cc); 

        for(let i = 0; i < particleCount; i++) {
            const radius = 4.5;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            globePositions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
            globePositions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
            globePositions[i*3+2] = radius * Math.cos(phi);

            const mixedColor = color1.clone().lerp(color2, Math.random());
            globeColors[i*3] = mixedColor.r;
            globeColors[i*3+1] = mixedColor.g;
            globeColors[i*3+2] = mixedColor.b;
        }

        globeGeometry.setAttribute('position', new THREE.BufferAttribute(globePositions, 3));
        globeGeometry.setAttribute('color', new THREE.BufferAttribute(globeColors, 3));

        const dotTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');
        const globeMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            map: dotTexture,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const globe = new THREE.Points(globeGeometry, globeMaterial);
        scene.add(globe);

        // --- FLOATING IMAGES & VIDEOS ---
        const mediaFiles = [
            { type: 'image', url: 'img1.jpeg' },
            { type: 'image', url: 'img2.jpeg' },
            { type: 'image', url: 'img3.jpeg' },
            { type: 'image', url: 'img4.jpeg' },
            { type: 'image', url: 'img5.jpeg' },
            { type: 'video', url: 'vid1.mp4' },
            { type: 'video', url: 'vid2.mp4' },
            { type: 'video', url: 'vid3.mp4' }
        ];

        const numFrames = 60; // Total floating items
        const imageGroup = new THREE.Group();
        scene.add(imageGroup);

        const textureLoader = new THREE.TextureLoader();
        const loadedTextures = []; // Store the loaded textures
        let loadedCount = 0;

        function checkLoading() {
            loadedCount++;
            if (loadedCount === mediaFiles.length) {
                // All media loaded! Create the frames
                createFrames();
                
                // Hide loading overlay and show intro screen
                const loadingOverlay = document.getElementById('loading-overlay');
                const introScreen = document.getElementById('intro-screen');
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    introScreen.style.display = 'flex';
                }, 800);
            }
        }

        // Load all media first
        mediaFiles.forEach(media => {
            if (media.type === 'image') {
                textureLoader.load(media.url, (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    loadedTextures.push(texture);
                    checkLoading();
                });
            } else if (media.type === 'video') {
                const video = document.createElement('video');
                video.src = media.url;
                video.crossOrigin = 'anonymous';
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.play().catch(e => console.log("Auto-play prevented", e));
                
                const videoTexture = new THREE.VideoTexture(video);
                videoTexture.colorSpace = THREE.SRGBColorSpace;
                loadedTextures.push(videoTexture);
                checkLoading();
            }
        });

        function createFrames() {
            const minRadius = 6;
            const maxRadius = 14;

            for (let i = 0; i < numFrames; i++) {
                // Pick a random loaded texture
                const texture = loadedTextures[Math.floor(Math.random() * loadedTextures.length)];
                
                const picGroup = new THREE.Group();

                // White polaroid frame
                const frameMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
                const frameGeometry = new THREE.PlaneGeometry(1.6, 2.2);
                const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
                picGroup.add(frameMesh);

                // Image/Video
                const imgMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    side: THREE.DoubleSide,
                });
                const imgGeometry = new THREE.PlaneGeometry(1.4, 1.8);
                const imgMesh = new THREE.Mesh(imgGeometry, imgMaterial);
                imgMesh.position.z = 0.01; 
                imgMesh.position.y = 0.1; 
                picGroup.add(imgMesh);

                // Position in a disk
                const angle = Math.random() * Math.PI * 2;
                const radius = minRadius + Math.random() * (maxRadius - minRadius);
                picGroup.position.x = Math.cos(angle) * radius;
                picGroup.position.y = (Math.random() - 0.5) * 3; 
                picGroup.position.z = Math.sin(angle) * radius;
                
                imageGroup.add(picGroup);
            }
        }

        // --- BACKGROUND STARS ---
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(3000 * 3);
        for(let i=0; i<9000; i++) {
            starPos[i] = (Math.random() - 0.5) * 100;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.05});
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- SHOOTING STAR ---
        const shootingStarGeo = new THREE.BufferGeometry();
        const shootingStarPos = new Float32Array([0, 0, 0, 0, 0, 0]);
        shootingStarGeo.setAttribute('position', new THREE.BufferAttribute(shootingStarPos, 3));
        const shootingStarMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        const shootingStar = new THREE.Line(shootingStarGeo, shootingStarMat);
        scene.add(shootingStar);

        function spawnShootingStar() {
            const startX = (Math.random() - 0.5) * 100;
            const startY = 20 + Math.random() * 20;
            const startZ = -30 - Math.random() * 30;
            
            const endX = startX - 30 - Math.random() * 20;
            const endY = startY - 30 - Math.random() * 20;
            
            const positions = shootingStar.geometry.attributes.position.array;
            positions[0] = startX; positions[1] = startY; positions[2] = startZ;
            positions[3] = startX; positions[4] = startY; positions[5] = startZ;
            shootingStar.geometry.attributes.position.needsUpdate = true;
            
            shootingStar.material.opacity = 1;
            
            gsap.to(positions, {
                3: endX,
                4: endY,
                duration: 0.7,
                onUpdate: () => {
                    shootingStar.geometry.attributes.position.needsUpdate = true;
                },
                onComplete: () => {
                    gsap.to(shootingStar.material, { opacity: 0, duration: 0.2 });
                }
            });
            
            setTimeout(spawnShootingStar, 2000 + Math.random() * 4000);
        }
        setTimeout(spawnShootingStar, 3000);

        // --- INTERACTION: DOUBLE TAP TO ZOOM ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let lastTap = 0;

        window.addEventListener('dblclick', onDoubleTap);

        window.addEventListener('touchstart', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                onDoubleTap(e.touches[0]);
                e.preventDefault();
            }
            lastTap = currentTime;
        }, { passive: false });

        function onDoubleTap(event) {
            controls.autoRotate = false;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(imageGroup.children, true);

            if (intersects.length > 0) {
                let targetMesh = intersects[0].object;
                if (targetMesh.parent && targetMesh.parent !== imageGroup) {
                    targetMesh = targetMesh.parent;
                }
                const targetPosition = new THREE.Vector3();
                targetMesh.getWorldPosition(targetPosition);
                
                const offset = targetPosition.clone().normalize().multiplyScalar(2.5);
                
                gsap.to(camera.position, {
                    x: targetPosition.x + offset.x,
                    y: targetPosition.y + offset.y,
                    z: targetPosition.z + offset.z,
                    duration: 1.5,
                    ease: "power2.inOut"
                });

                gsap.to(controls.target, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            } else {
                controls.autoRotate = true;
                gsap.to(camera.position, {
                    x: 0,
                    y: 2,
                    z: 15,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
                gsap.to(controls.target, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            }
        }

        // --- RENDER LOOP ---
        function animate() {
            requestAnimationFrame(animate);
            controls.update();

            imageGroup.children.forEach(img => {
                img.lookAt(camera.position);
            });

            renderer.render(scene, camera);
        }

        // --- RESIZE HANDLER ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // --- UI LOGIC ---
        const btnYes = document.getElementById('btn-yes');
        const btnNo = document.getElementById('btn-no');
        const introScreen = document.getElementById('intro-screen');
        const floatingText = document.getElementById('floating-text');
        const helpPanel = document.getElementById('help-panel');
        const helpCloseBtn = document.querySelector('.close-btn');

        btnYes.addEventListener('click', () => {
            introScreen.style.opacity = '0';
            setTimeout(() => {
                introScreen.style.display = 'none';
                helpPanel.classList.add('active'); // Show instructions
            }, 1500);
        });

        helpCloseBtn.addEventListener('click', () => {
            helpPanel.classList.remove('active');
            floatingText.style.opacity = '1'; // Show name
            
            // Try to play videos if they were blocked by browser autoplay policy
            loadedTextures.forEach(tex => {
                if (tex.isVideoTexture && tex.image) {
                    tex.image.play().catch(e => console.log("Play prevented", e));
                }
            });
        });

        const moveBtnNo = () => {
            const btnWidth = btnNo.offsetWidth;
            const btnHeight = btnNo.offsetHeight;
            const x = Math.random() * (window.innerWidth - btnWidth);
            const y = Math.random() * (window.innerHeight - btnHeight);
            btnNo.style.position = 'absolute';
            btnNo.style.left = `${x}px`;
            btnNo.style.top = `${y}px`;
        };
        btnNo.addEventListener('mouseover', moveBtnNo);
        btnNo.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            moveBtnNo();
        });

        animate();
