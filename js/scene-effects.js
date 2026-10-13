/** Spawns ember particles, screenshot zoom, and floating terminal glyphs. */

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
