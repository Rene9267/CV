/** Spawns ember particles, screenshot zoom, and floating terminal glyphs. */

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

function spawnFlourPuffs(field) {
    const count = Math.min(9, Math.max(6, Math.floor(window.innerWidth / 180)));
    for (let i = 0; i < count; i++) {
        const puff = document.createElement('span');
        puff.className = 'ember flour-puff';
        const size = 100 + Math.random() * 120;
        const radius = () => `${34 + Math.random() * 32}%`;
        puff.style.position = 'absolute';
        puff.style.left = `${Math.random() * 100}%`;
        puff.style.bottom = '-12vh';
        puff.style.width = `${size}px`;
        puff.style.height = `${size * (0.55 + Math.random() * 0.35)}px`;
        puff.style.borderRadius = `${radius()} ${radius()} ${radius()} ${radius()} / ${radius()} ${radius()} ${radius()} ${radius()}`;
        puff.style.pointerEvents = 'none';
        puff.style.filter = `blur(${14 + Math.random() * 12}px)`;
        puff.style.setProperty('--drift', `${(Math.random() * 2 - 1) * 26}vw`);
        puff.style.setProperty('--rise', `${50 + Math.random() * 55}vh`);
        puff.style.setProperty('--puff-opacity', (0.5 + Math.random() * 0.18).toFixed(2));
        puff.style.animation = `flourDrift ${16 + Math.random() * 14}s ease-in-out ${-Math.random() * 22}s infinite`;
        field.appendChild(puff);
    }
}

function initSceneEffects() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.ember-field').forEach((emberField) => {
        if (reduceMotion || emberField.childElementCount) return;
        emberField.style.zIndex = '5';
        if (emberField.dataset.motion === 'flour') {
            spawnFlourPuffs(emberField);
            return;
        }
        if (emberField.dataset.motion === 'eruption') {
            spawnEruptionStreaks(emberField);
            return;
        }
        const falling = emberField.dataset.motion === 'fall';
        const motion = falling ? 'particleFall' : 'emberRise';
        const emberCount = Math.min(48, Math.floor(window.innerWidth / 26));
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
            ember.style.boxShadow = falling ? 'none' : '0 0 12px 3px var(--particle, #ffb25a)';
            if (falling) ember.style.top = '-16px';
            else ember.style.bottom = '-16px';
            ember.style.setProperty('--drift', `${drift}px`);
            ember.style.setProperty('--rise', `${50 + Math.random() * 60}vh`);
            ember.style.animation = `${motion} ${5 + Math.random() * 8}s linear ${-Math.random() * 12}s infinite`;
            emberField.appendChild(ember);
        }
    });

    // --- Zoom con lerp per le gallerie screenshot ---
    const galleryImages = document.querySelectorAll('.screenshot-img');
    if (galleryImages.length && !reduceMotion) {
        const ZOOM_TARGET = 1.5;
        const ZOOM_LERP = 0.12;

        galleryImages.forEach(img => {
            let scale = 1;
            let target = 1;
            let originX = 50;
            let originY = 50;
            let toX = 50;
            let toY = 50;
            let rafId = null;

            const ease = () => {
                scale += (target - scale) * ZOOM_LERP;
                originX += (toX - originX) * ZOOM_LERP;
                originY += (toY - originY) * ZOOM_LERP;
                img.style.transformOrigin = `${originX}% ${originY}%`;
                img.style.transform = `scale(${scale})`;
                if (Math.abs(target - scale) > 0.0008 ||
                    Math.abs(toX - originX) > 0.05 ||
                    Math.abs(toY - originY) > 0.05) {
                    rafId = requestAnimationFrame(ease);
                } else {
                    rafId = null;
                }
            };

            const kick = () => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(ease);
            };

            img.addEventListener('mouseenter', () => {
                target = ZOOM_TARGET;
                kick();
            });

            img.addEventListener('mousemove', (e) => {
                const rect = img.getBoundingClientRect();
                toX = ((e.clientX - rect.left) / rect.width) * 100;
                toY = ((e.clientY - rect.top) / rect.height) * 100;
                kick();
            });

            img.addEventListener('mouseleave', () => {
                target = 1;
                toX = 50;
                toY = 50;
                kick();
            });
        });
    }

    // --- Sfondo terminale: glifi galleggianti ---
    const codeField = document.querySelector('.term-code-field');
    if (codeField && !reduceMotion) {
        const glyphs = ['>', '_', '$', '#', 'PS C:\\>', 'C:\\>', 'IE:', '&', '*', '%', '~', '=>', 'echo', 'cd ..'];
        for (let i = 0; i < 26; i++) {
            const glyph = document.createElement('span');
            glyph.className = 'term-glyph';
            if (i % 4 === 0) glyph.classList.add('t-green');
            if (i % 5 === 0) glyph.classList.add('t-muted');
            glyph.textContent = glyphs[i % glyphs.length];
            const size = 0.6 + Math.random() * 0.8;
            glyph.style.fontSize = `${size}rem`;
            glyph.style.left = `${Math.random() * 100}%`;
            glyph.style.top = `${Math.random() * 100}%`;
            glyph.style.setProperty('--drift-x', `${(Math.random() * 2 - 1) * 120}px`);
            glyph.style.setProperty('--drift-y', `${(Math.random() * 2 - 1) * 90}px`);
            glyph.style.animationDuration = `${8 + Math.random() * 10}s`;
            glyph.style.animationDelay = `${-Math.random() * 14}s`;
            codeField.appendChild(glyph);
        }
    }
}
