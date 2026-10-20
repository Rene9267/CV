/** Volcanic debris / comet rain on the Blu Caligo page background. One canvas, one object pool. */

(function () {
    var DEG = Math.PI / 180;
    var MAX_DT = 0.05;
    var GRAVITY = 22;
    var ASH_GRAVITY = 8;
    var RESIZE_MS = 150;

    var TAU = 6.283185307179586;
    var LAVA = [
        { head: 'rgba(255,106,0,0.7)', near: 'rgba(255,106,0,0.42)', far: 'rgba(255,61,0,0.14)', glow: 'rgb(255,106,0)' },
        { head: 'rgba(255,61,0,0.7)', near: 'rgba(255,61,0,0.4)', far: 'rgba(255,61,0,0.12)', glow: 'rgb(255,61,0)' },
        { head: 'rgba(255,179,71,0.7)', near: 'rgba(255,179,71,0.4)', far: 'rgba(255,106,0,0.14)', glow: 'rgb(255,179,71)' }
    ];
    var ASH = 'rgba(72,70,68,0.35)';

    var field = null;
    var canvas = null;
    var ctx = null;
    var particles = null;
    var viewW = 1;
    var viewH = 1;
    var dpr = 1;
    var rafId = 0;
    var lastTime = 0;
    var resizeTimer = 0;
    var fieldVisible = true;
    var reduced = false;
    var pulseTime = 0;
    var mobileQuery = null;
    var reduceQuery = null;

    function snap(n) {
        return (n + (n < 0 ? -0.5 : 0.5)) | 0;
    }

    function particleCount() {
        if (reduced) return 8;
        return mobileQuery.matches ? 25 : 60;
    }

    function resetParticle(p, scatter) {
        var bomb = Math.random() < 0.04;
        var ash = !bomb && Math.random() < 0.16;
        var angle = (Math.random() * 50 - 25) * DEG;
        var speed;
        p.ash = ash;
        p.bomb = bomb;
        if (ash) {
            speed = 36 + Math.random() * 44;
            p.size = 2 + ((Math.random() * 2) | 0);
            p.trail = 0;
            p.kind = 0;
        } else if (bomb) {
            speed = 48 + Math.random() * 36;
            p.size = 6 + ((Math.random() * 4) | 0);
            p.trail = 0.22 + Math.random() * 0.1;
            p.kind = (Math.random() * 3) | 0;
        } else {
            speed = 100 + Math.random() * 140;
            p.size = 2 + ((Math.random() * 3) | 0);
            p.trail = 0.07 + Math.random() * 0.1;
            p.kind = (Math.random() * 3) | 0;
        }
        p.phase = Math.random() * TAU;
        p.vx = Math.sin(angle) * speed;
        p.vy = Math.cos(angle) * speed;
        p.x = (Math.random() * 1.2 - 0.1) * viewW;
        p.y = scatter ? Math.random() * viewH : -p.size - Math.random() * 24;
    }

    function createPool(count, scatter) {
        var list = new Array(count);
        var i;
        for (i = 0; i < count; i++) {
            var p = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                size: 2,
                trail: 0,
                kind: 0,
                ash: false,
                bomb: false,
                phase: 0
            };
            resetParticle(p, scatter);
            list[i] = p;
        }
        return list;
    }

    function drawParticle(p) {
        var style;
        var x;
        var y;
        var tx;
        var ty;
        var mx;
        var my;
        var headR;
        var wave;
        if (p.y < -8) return;
        x = snap(p.x);
        y = snap(p.y);
        if (p.ash) {
            ctx.fillStyle = ASH;
            ctx.fillRect(x, y, p.size, p.size);
            return;
        }
        style = LAVA[p.kind];
        tx = snap(p.x - p.vx * p.trail);
        ty = snap(p.y - p.vy * p.trail);
        mx = snap(p.x - p.vx * p.trail * 0.45);
        my = snap(p.y - p.vy * p.trail * 0.45);
        ctx.strokeStyle = style.far;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.strokeStyle = style.near;
        ctx.lineWidth = p.bomb ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(x, y);
        ctx.stroke();
        headR = p.size * 0.5;
        wave = 0.5 + 0.5 * Math.sin(pulseTime * 3.4 + p.phase);
        ctx.fillStyle = style.glow;
        ctx.globalAlpha = 0.1 + wave * 0.16;
        ctx.beginPath();
        ctx.arc(x, y, headR + 5.5 + wave * 2.6, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.24 + wave * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, headR + 2.4 + wave * 1.5, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = style.head;
        ctx.beginPath();
        ctx.arc(x, y, headR, 0, TAU);
        ctx.fill();
    }

    function drawAll() {
        var i;
        var n;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, viewW, viewH);
        n = particles.length;
        for (i = 0; i < n; i++) drawParticle(particles[i]);
    }

    function tick(now) {
        var dt;
        var i;
        var n;
        var p;
        var limitX;
        rafId = requestAnimationFrame(tick);
        pulseTime = now * 0.001;
        dt = (now - lastTime) * 0.001;
        lastTime = now;
        if (dt > MAX_DT) dt = MAX_DT;
        if (dt <= 0) return;
        n = particles.length;
        limitX = viewW * 0.18;
        for (i = 0; i < n; i++) {
            p = particles[i];
            p.vy += (p.ash ? ASH_GRAVITY : GRAVITY) * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.y > viewH + 16 || p.x < -limitX || p.x > viewW + limitX) {
                resetParticle(p, false);
            }
        }
        drawAll();
    }

    function stopLoop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        lastTime = 0;
    }

    function startLoop() {
        if (reduced || rafId || !fieldVisible || document.hidden) return;
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
    }

    function layout() {
        var cssW = Math.max(1, field.clientWidth);
        var cssH = Math.max(1, field.clientHeight);
        var nextDpr = Math.min(2, window.devicePixelRatio || 1);
        var bw = Math.round(cssW * nextDpr);
        var bh = Math.round(cssH * nextDpr);
        var count = particleCount();
        viewW = cssW;
        viewH = cssH;
        if (canvas.width !== bw || canvas.height !== bh) {
            canvas.width = bw;
            canvas.height = bh;
            dpr = nextDpr;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        if (!particles || particles.length !== count) {
            particles = createPool(count, true);
        }
        if (reduced) drawAll();
    }

    function scheduleLayout() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, RESIZE_MS);
    }

    function syncMotion() {
        reduced = reduceQuery.matches;
        if (reduced) {
            stopLoop();
            layout();
            return;
        }
        if (!particles || particles.length !== particleCount()) layout();
        if (fieldVisible && !document.hidden) startLoop();
        else stopLoop();
    }

    function boot() {
        field = document.querySelector('.blucaligo-page .caligo-bg');
        if (!field || field.querySelector('.meteor-field')) return;

        mobileQuery = window.matchMedia('(max-width: 768px)');
        reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reduced = reduceQuery.matches;

        canvas = document.createElement('canvas');
        canvas.className = 'meteor-field';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;display:block;';
        field.appendChild(canvas);
        ctx = canvas.getContext('2d', { alpha: true });

        layout();

        if (window.ResizeObserver) {
            var observer = new ResizeObserver(scheduleLayout);
            observer.observe(field);
        } else {
            window.addEventListener('resize', scheduleLayout);
        }

        if (mobileQuery.addEventListener) {
            mobileQuery.addEventListener('change', scheduleLayout);
            reduceQuery.addEventListener('change', syncMotion);
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopLoop();
            else startLoop();
        });

        if ('IntersectionObserver' in window) {
            var visibility = new IntersectionObserver(function (entries) {
                fieldVisible = entries[0].isIntersecting;
                if (fieldVisible) startLoop();
                else stopLoop();
            }, { threshold: 0 });
            visibility.observe(field);
        }

        if (!reduced) startLoop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
