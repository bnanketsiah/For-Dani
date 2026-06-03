// js/meteors.js - Meteor/shooting star effect system
// This is a non-module script loaded via <script src="js/meteors.js">

(function () {
    'use strict';

    // === METEOR CONFIGURATION ===
    const config = {
        enabled: true,
        color: '#00f0ff',
        gradientColor1: '#00f0ff',
        gradientColor2: '#ffffff',
        useGradient: false,
        speed: 10,       // pixels per frame base speed
        density: 30,     // ms between spawns (lower = more meteors)
        trailLength: 80, // trail point count
        maxCount: 50
    };

    let meteors = [];
    let animationId = null;
    let canvas = null;
    let ctx = null;
    let isRunning = false;
    let spawnInterval = null;

    // === GLOBAL STATE FLAGS (used by sphere.js) ===
    window.isMeteorShowerActive = false;

    // === METEOR FACTORY ===
    function createMeteor() {
        const angle = -40 + (Math.random() - 0.5) * 20; // degrees
        const rad = (angle * Math.PI) / 180;
        const x = Math.random() * (window.innerWidth + 300) - 100;
        const y = Math.random() * (window.innerHeight * 0.4) - 80;
        const speed = config.speed * (0.7 + Math.random() * 0.6);

        return {
            x,
            y,
            vx: Math.cos(rad) * speed,
            vy: Math.abs(Math.sin(rad) * speed) + speed * 0.5,
            trail: [],
            maxTrail: config.trailLength,
            opacity: 0.85 + Math.random() * 0.15,
            dead: false
        };
    }

    // === CANVAS SETUP ===
    function setupCanvas() {
        canvas = document.getElementById('meteor-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'meteor-canvas';
            canvas.style.cssText = [
                'position:fixed',
                'top:0',
                'left:0',
                'width:100vw',
                'height:100vh',
                'z-index:5',
                'pointer-events:none'
            ].join(';');
            document.body.appendChild(canvas);
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');
    }

    // === DRAW SINGLE METEOR ===
    function drawMeteor(meteor) {
        if (!ctx || meteor.trail.length < 2) return;

        const head = meteor.trail[meteor.trail.length - 1];
        const tail = meteor.trail[0];

        ctx.save();
        ctx.globalAlpha = meteor.opacity;

        // Trail gradient
        const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        if (config.useGradient) {
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, config.gradientColor1 + '66');
            grad.addColorStop(1, config.gradientColor2);
        } else {
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.6, config.color + '88');
            grad.addColorStop(1, config.color);
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = config.useGradient ? config.gradientColor1 : config.color;

        ctx.beginPath();
        meteor.trail.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // Bright head dot
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = config.useGradient ? config.gradientColor2 : config.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.restore();
    }

    // === ANIMATION LOOP ===
    function animate() {
        if (!isRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        meteors.forEach(meteor => {
            if (meteor.dead) return;

            meteor.x += meteor.vx;
            meteor.y += meteor.vy;

            meteor.trail.push({ x: meteor.x, y: meteor.y });
            if (meteor.trail.length > meteor.maxTrail) {
                meteor.trail.shift();
            }

            if (meteor.x > window.innerWidth + 150 ||
                meteor.y > window.innerHeight + 150 ||
                meteor.x < -300) {
                meteor.dead = true;
            }

            drawMeteor(meteor);
        });

        // Cleanup dead meteors
        meteors = meteors.filter(m => !m.dead);

        animationId = requestAnimationFrame(animate);
    }

    // === SPAWN SYSTEM ===
    function startSpawning() {
        if (spawnInterval) clearInterval(spawnInterval);
        spawnInterval = setInterval(() => {
            if (!config.enabled) return;
            if (meteors.length >= config.maxCount) return;
            meteors.push(createMeteor());
        }, config.density);
    }

    function stopSpawning() {
        if (spawnInterval) {
            clearInterval(spawnInterval);
            spawnInterval = null;
        }
    }

    // === START / STOP ===
    function startMeteors() {
        if (isRunning) return;
        setupCanvas();
        isRunning = true;
        window.isMeteorShowerActive = true;
        startSpawning();
        animate();
    }

    function stopMeteors() {
        isRunning = false;
        window.isMeteorShowerActive = false;
        stopSpawning();
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        meteors = [];
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // === GLOBAL API (used by sphere.js) ===

    /**
     * Toggle meteor shower on/off
     */
    window.toggleMeteorShower = function () {
        if (window.isMeteorShowerActive) {
            stopMeteors();
        } else {
            startMeteors();
        }
    };

    /**
     * Set meteor speed (called from sphere.js controls)
     * @param {number} speed - Speed value (5-50)
     */
    window.setMeteorSpeed = function (speed) {
        config.speed = Math.max(1, speed);
    };

    /**
     * Set meteor density/frequency
     * @param {number} density - Interval in ms between spawns (10-250)
     */
    window.setMeteorDensity = function (density) {
        config.density = Math.max(10, density);
        if (isRunning) {
            stopSpawning();
            startSpawning();
        }
    };

    /**
     * Set meteor color
     * @param {string} color - CSS color string
     */
    window.setMeteorColor = function (color) {
        config.color = color;
        config.useGradient = false;
    };

    /**
     * Set meteor gradient colors
     * @param {string} color1
     * @param {string} color2
     */
    window.setMeteorGradient = function (color1, color2) {
        config.gradientColor1 = color1;
        config.gradientColor2 = color2;
        config.useGradient = true;
    };

    /**
     * Full meteor system API object
     */
    window.meteorSystem = {
        start: startMeteors,
        stop: stopMeteors,
        toggle: window.toggleMeteorShower,
        setColor: window.setMeteorColor,
        setGradient: window.setMeteorGradient,
        setSpeed: window.setMeteorSpeed,
        setDensity: window.setMeteorDensity,
        getConfig: () => Object.assign({}, config)
    };

    // === RESIZE HANDLER ===
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });

    // === AUTO START on load - DISABLED (shooting stars removed) ===
    // Meteors are available via window.meteorSystem.start() / window.toggleMeteorShower()
    // but will NOT auto-start on page load.

})();
