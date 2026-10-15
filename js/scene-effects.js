/** Spawns ember particles, screenshot zoom, and floating terminal glyphs. */

function lowFx() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    const coarse = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    const weakDevice = (navigator.hardwareConcurrency || 8) <= 4
        || Boolean(navigator.connection?.saveData);
    return coarse && weakDevice;
}

function pauseFxOnHidden() {
    document.addEventListener('visibilitychange', () => {
        const state = document.hidden ? 'paused' : 'running';
        document.querySelectorAll('.ember, .term-glyph, .eruption-streak').forEach((el) => {
            el.style.animationPlayState = state;
        });
    });
}

function spawnEruptionStreaks(field) {
    const fieldRect = field.getBoundingClientRect();
    const cover = document.querySelector('.hero-cover');
    const coverRect = cover ? cover.getBoundingClientRect() : null;
    const originX = coverRect
        ? coverRect.left + coverRect.width / 2 - fieldRect.left
        : fieldRect.width / 2;
    const originY = -Math.max(220, fieldRect.height * 0.28);
    const rays = Math.min(16, Math.max(11, Math.floor(fieldRect.width / 90)));
    const waves = 2;
    const maxAngle = 26 * Math.PI / 180;
    const heats = [
        'linear-gradient(to bottom, transparent 0%, rgba(255, 72, 16, 0.08) 16%, #ff4e12 46%, #ffc14a 76%, #fff6dc 100%)',
        'linear-gradient(to bottom, transparent 0%, rgba(255, 220, 140, 0.12) 10%, #ffd15c 42%, #fff4c8 74%, #fff 100%)',
        'linear-gradient(to bottom, transparent 0%, rgba(160, 12, 18, 0.06) 18%, #9d1218 50%, #e23a22 78%, #ffb199 100%)',
    ];
    for (let i = 0; i < rays * waves; i++) {
        const ray = i % rays;
        const wave = Math.floor(i / rays);
        const t = rays === 1 ? 0.5 : ray / (rays - 1);
        const angle = -maxAngle + t * maxAngle * 2;
        const dist = fieldRect.height - originY + 140;
        const dx = Math.sin(angle) * dist;
        const dy = Math.cos(angle) * dist;
        const tilt = Math.atan2(dx, dy) * (180 / Math.PI) + 180;
        const width = wave === 0 ? 10 : 14;
        const height = wave === 0 ? 86 : 58;
        const duration = Math.min(1.7, Math.max(1.05, dist / 980));
        const streak = document.createElement('span');
        streak.className = 'ember eruption-streak';
        streak.style.left = `${originX}px`;
        streak.style.top = `${originY}px`;
        streak.style.width = `${width}px`;
        streak.style.height = `${height}px`;
        streak.style.marginLeft = `${-width / 2}px`;
        streak.style.marginTop = `${-height / 2}px`;
        streak.style.background = heats[ray % heats.length];
        streak.style.setProperty('--tx', `${dx.toFixed(1)}px`);
        streak.style.setProperty('--ty', `${dy.toFixed(1)}px`);
        streak.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
        streak.style.animationDuration = `${duration.toFixed(2)}s`;
        streak.style.animationDelay = `${(-(t * duration) - wave * duration * 0.5).toFixed(2)}s`;
        field.appendChild(streak);
    }
}

function emberCountForViewport() {
    if (lowFx()) return 0;
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const base = Math.min(48, Math.floor(window.innerWidth / 26));
    return narrow ? Math.min(12, base) : Math.min(15, base);
}

function initSceneEffects() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pauseFxOnHidden();

    document.querySelectorAll('.ember-field').forEach((emberField) => {
        emberField.style.zIndex = '0';
        if (reduceMotion || lowFx() || emberField.childElementCount) return;

        if (emberField.dataset.motion === 'eruption') {
            spawnEruptionStreaks(emberField);
            return;
        }
        const falling = emberField.dataset.motion === 'fall';
        const motion = falling ? 'particleFall' : 'emberRise';
        const emberCount = emberCountForViewport();
        for (let i = 0; i < emberCount; i++) {
            const ember = document.createElement('span');
            ember.className = 'ember';
            const size = 5 + Math.random() * 8;
            const drift = (Math.random() * 2 - 1) * 180;
            ember.style.position = 'absolute';
            ember.style.left = `${Math.random() * 100}%`;
            ember.style.width = `${size}px`;
            ember.style.height = `${falling ? size * 1.6 : size}px`;
            ember.style.borderRadius = falling ? '1px' : '50%';
            ember.style.pointerEvents = 'none';
            const fallColors = ['#e8a0c8', '#6b8fd4', '#f4d27a'];
            ember.style.background = falling
                ? fallColors[i % fallColors.length]
                : 'radial-gradient(circle, #fff 0%, var(--particle, #ffb25a) 46%, transparent 74%)';
            ember.style.boxShadow = 'none';
            if (falling) ember.style.top = '-16px';
            else ember.style.bottom = '-16px';
            ember.style.setProperty('--drift', `${drift}px`);
            ember.style.setProperty('--rise', `${50 + Math.random() * 60}vh`);
            ember.style.animation = `${motion} ${5 + Math.random() * 8}s linear ${-Math.random() * 12}s infinite`;
            emberField.appendChild(ember);
        }
    });

    const galleryImages = document.querySelectorAll('.screenshot-img');
    if (galleryImages.length) {
        const ZOOM_TARGET = 1.8;
        const ZOOM_LERP = 0.14;
        const CLOSE_MS = 130;

        const layer = document.createElement('div');
        layer.className = 'screenshot-zoom-layer';
        const zoomImg = document.createElement('img');
        zoomImg.className = 'screenshot-zoom-img';
        zoomImg.alt = '';
        layer.appendChild(zoomImg);
        document.body.appendChild(layer);

        let scale = 1;
        let target = 1;
        let originX = 50;
        let originY = 50;
        let toX = 50;
        let toY = 50;
        let rafId = null;
        let active = null;
        let lerp = ZOOM_LERP;
        let closing = false;
        let closeFromScale = 1;
        let closeFromX = 50;
        let closeFromY = 50;
        let closeStart = 0;

        const paint = () => {
            zoomImg.style.transformOrigin = `${originX}% ${originY}%`;
            zoomImg.style.transform = `scale(${scale})`;
        };

        const settle = () => {
            scale = target;
            originX = toX;
            originY = toY;
            paint();
            rafId = null;
            if (!active) layer.classList.remove('is-open');
        };

        const ease = () => {
            if (closing) {
                const t = Math.min(1, (performance.now() - closeStart) / CLOSE_MS);
                const k = 1 - (1 - t) * (1 - t);
                scale = closeFromScale + (1 - closeFromScale) * k;
                originX = closeFromX + (50 - closeFromX) * k;
                originY = closeFromY + (50 - closeFromY) * k;
                paint();
                if (t < 1) {
                    rafId = requestAnimationFrame(ease);
                } else {
                    closing = false;
                    settle();
                }
                return;
            }
            scale += (target - scale) * lerp;
            originX += (toX - originX) * lerp;
            originY += (toY - originY) * lerp;
            paint();
            if (Math.abs(target - scale) > 0.0008 ||
                Math.abs(toX - originX) > 0.05 ||
                Math.abs(toY - originY) > 0.05) {
                rafId = requestAnimationFrame(ease);
            } else {
                settle();
            }
        };

        const kick = () => {
            if (reduceMotion) {
                scale = target;
                originX = toX;
                originY = toY;
                paint();
                return;
            }
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(ease);
        };

        const place = (img) => {
            const rect = img.getBoundingClientRect();
            layer.style.left = `${rect.left}px`;
            layer.style.top = `${rect.top}px`;
            layer.style.width = `${rect.width}px`;
            layer.style.height = `${rect.height}px`;
        };

        const open = (img) => {
            active = img;
            const fit = getComputedStyle(img);
            zoomImg.src = img.currentSrc || img.src;
            zoomImg.style.objectFit = fit.objectFit;
            place(img);
            layer.classList.add('is-open');
            closing = false;
            lerp = ZOOM_LERP;
            target = ZOOM_TARGET;
            kick();
        };

        const close = () => {
            active = null;
            target = 1;
            toX = 50;
            toY = 50;
            if (reduceMotion) {
                closing = false;
                scale = 1;
                originX = 50;
                originY = 50;
                paint();
                layer.classList.remove('is-open');
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                return;
            }
            closing = true;
            closeFromScale = scale;
            closeFromX = originX;
            closeFromY = originY;
            closeStart = performance.now();
            kick();
        };

        galleryImages.forEach(img => {
            img.addEventListener('mouseenter', () => open(img));

            img.addEventListener('mousemove', (e) => {
                if (active !== img) return;
                place(img);
                const rect = img.getBoundingClientRect();
                toX = ((e.clientX - rect.left) / rect.width) * 100;
                toY = ((e.clientY - rect.top) / rect.height) * 100;
                kick();
            });

            img.addEventListener('mouseleave', () => {
                if (active === img) close();
            });
        });
    }

    const codeField = document.querySelector('.term-code-field');
    if (codeField && !reduceMotion && !lowFx()) {
        const narrow = window.matchMedia('(max-width: 767px)').matches;
        const glyphTotal = narrow ? 6 : 26;
        const glyphs = ['>', '_', '$', '#', 'PS C:\\>', 'C:\\>', 'IE:', '&', '*', '%', '~', '=>', 'echo', 'cd ..'];
        for (let i = 0; i < glyphTotal; i++) {
            const glyph = document.createElement('span');
            glyph.className = 'term-glyph';
            if (i % 4 === 0) glyph.classList.add('t-green');
            if (i % 5 === 0) glyph.classList.add('t-muted');
            glyph.textContent = glyphs[i % glyphs.length];
            const size = 0.6 + Math.random() * 0.8;
            glyph.style.fontSize = `${size}rem`;
            let leftPct = Math.random() * 100;
            if (narrow) {
                leftPct = i % 2 === 0 ? Math.random() * 12 : 88 + Math.random() * 12;
            }
            glyph.style.left = `${leftPct}%`;
            glyph.style.top = `${Math.random() * 100}%`;
            glyph.style.setProperty('--drift-x', `${(Math.random() * 2 - 1) * 120}px`);
            glyph.style.setProperty('--drift-y', `${(Math.random() * 2 - 1) * 90}px`);
            glyph.style.animationDuration = `${8 + Math.random() * 10}s`;
            glyph.style.animationDelay = `${-Math.random() * 14}s`;
            codeField.appendChild(glyph);
        }
    }
}
