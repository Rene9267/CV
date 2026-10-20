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
        document.querySelectorAll('.ember, .term-glyph').forEach((el) => {
            el.style.animationPlayState = state;
        });
    });
}

function emberCountForViewport() {
    if (lowFx()) return 0;
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const base = Math.min(48, Math.floor(window.innerWidth / 26));
    return narrow ? Math.min(12, base) : Math.min(15, base);
}

function initScreenshotZoom(reduceMotion) {
    const galleryImages = document.querySelectorAll('.screenshot-img');
    if (!galleryImages.length) return;

    const ZOOM_TARGET = 1.8;
    const ZOOM_LERP = 0.14;
    const CLOSE_MS = 130;
    const live = new Map();
    let active = null;
    let stack = 8000;

    const paint = (zoom) => {
        zoom.imgEl.style.transformOrigin = `${zoom.originX}% ${zoom.originY}%`;
        zoom.imgEl.style.transform = `scale(${zoom.scale})`;
    };

    const place = (zoom) => {
        const rect = zoom.source.getBoundingClientRect();
        zoom.layer.style.left = `${rect.left}px`;
        zoom.layer.style.top = `${rect.top}px`;
        zoom.layer.style.width = `${rect.width}px`;
        zoom.layer.style.height = `${rect.height}px`;
    };

    const drop = (zoom) => {
        if (zoom.rafId) cancelAnimationFrame(zoom.rafId);
        zoom.rafId = null;
        zoom.removed = true;
        zoom.layer.remove();
        if (live.get(zoom.source) === zoom) live.delete(zoom.source);
        if (active === zoom) active = null;
    };

    const ease = (zoom) => {
        if (zoom.removed) return;
        if (zoom.closing) {
            const t = Math.min(1, (performance.now() - zoom.closeStart) / CLOSE_MS);
            const k = 1 - (1 - t) * (1 - t);
            zoom.scale = zoom.closeFromScale + (1 - zoom.closeFromScale) * k;
            zoom.originX = zoom.closeFromX + (50 - zoom.closeFromX) * k;
            zoom.originY = zoom.closeFromY + (50 - zoom.closeFromY) * k;
            paint(zoom);
            if (t < 1) {
                zoom.rafId = requestAnimationFrame(() => ease(zoom));
            } else {
                drop(zoom);
            }
            return;
        }
        zoom.scale += (zoom.target - zoom.scale) * zoom.lerp;
        zoom.originX += (zoom.toX - zoom.originX) * zoom.lerp;
        zoom.originY += (zoom.toY - zoom.originY) * zoom.lerp;
        paint(zoom);
        if (Math.abs(zoom.target - zoom.scale) > 0.0008 ||
            Math.abs(zoom.toX - zoom.originX) > 0.05 ||
            Math.abs(zoom.toY - zoom.originY) > 0.05) {
            zoom.rafId = requestAnimationFrame(() => ease(zoom));
        } else {
            zoom.scale = zoom.target;
            zoom.originX = zoom.toX;
            zoom.originY = zoom.toY;
            paint(zoom);
            zoom.rafId = null;
        }
    };

    const kick = (zoom) => {
        if (zoom.removed) return;
        if (reduceMotion) {
            zoom.scale = zoom.target;
            zoom.originX = zoom.toX;
            zoom.originY = zoom.toY;
            paint(zoom);
            if (zoom.closing) drop(zoom);
            return;
        }
        if (zoom.rafId) cancelAnimationFrame(zoom.rafId);
        zoom.rafId = requestAnimationFrame(() => ease(zoom));
    };

    const raise = (zoom) => {
        stack += 1;
        zoom.layer.style.zIndex = String(stack);
    };

    const createZoom = (source) => {
        const layer = document.createElement('div');
        layer.className = 'screenshot-zoom-layer is-open';
        const imgEl = document.createElement('img');
        imgEl.className = 'screenshot-zoom-img';
        imgEl.alt = '';
        const fit = getComputedStyle(source);
        imgEl.src = source.currentSrc || source.src;
        imgEl.style.objectFit = fit.objectFit;
        layer.appendChild(imgEl);
        document.body.appendChild(layer);
        const zoom = {
            source,
            layer,
            imgEl,
            scale: 1,
            target: ZOOM_TARGET,
            originX: 50,
            originY: 50,
            toX: 50,
            toY: 50,
            rafId: null,
            lerp: ZOOM_LERP,
            closing: false,
            removed: false,
            closeFromScale: 1,
            closeFromX: 50,
            closeFromY: 50,
            closeStart: 0,
        };
        place(zoom);
        paint(zoom);
        raise(zoom);
        return zoom;
    };

    const closeZoom = (zoom) => {
        if (!zoom || zoom.closing || zoom.removed) return;
        zoom.closing = true;
        zoom.target = 1;
        zoom.toX = 50;
        zoom.toY = 50;
        if (reduceMotion) {
            zoom.scale = 1;
            drop(zoom);
            return;
        }
        zoom.closeFromScale = zoom.scale;
        zoom.closeFromX = zoom.originX;
        zoom.closeFromY = zoom.originY;
        zoom.closeStart = performance.now();
        kick(zoom);
    };

    const open = (source) => {
        const existing = live.get(source);
        if (existing && !existing.removed) {
            if (active && active !== existing) closeZoom(active);
            existing.closing = false;
            existing.target = ZOOM_TARGET;
            existing.lerp = ZOOM_LERP;
            active = existing;
            raise(existing);
            kick(existing);
            return;
        }
        if (active) closeZoom(active);
        const zoom = createZoom(source);
        live.set(source, zoom);
        active = zoom;
        kick(zoom);
    };

    const close = (source) => {
        if (!active || active.source !== source) return;
        const zoom = active;
        active = null;
        closeZoom(zoom);
    };

    galleryImages.forEach((img) => {
        img.addEventListener('mouseenter', () => open(img));

        img.addEventListener('mousemove', (e) => {
            if (!active || active.source !== img || active.closing) return;
            place(active);
            const rect = img.getBoundingClientRect();
            active.toX = ((e.clientX - rect.left) / rect.width) * 100;
            active.toY = ((e.clientY - rect.top) / rect.height) * 100;
            kick(active);
        });

        img.addEventListener('mouseleave', () => close(img));
    });
}

function initSceneEffects() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pauseFxOnHidden();

    document.querySelectorAll('.ember-field').forEach((emberField) => {
        emberField.style.zIndex = '0';
        if (reduceMotion || lowFx() || emberField.childElementCount) return;

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

    initScreenshotZoom(reduceMotion);

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
