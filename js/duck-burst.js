/** Easter egg: pixel rubber duck flies from the profile photo on click. */

const DUCK_BURST_MAX = 8;
let duckBurstLive = 0;

const DUCK_MARKUP =
    '<svg class="duck-burst__sprite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 18" shape-rendering="crispEdges" aria-hidden="true">' +
    '<rect x="4" y="7" width="14" height="10" fill="#1A1A1A"/>' +
    '<rect x="2" y="8" width="18" height="8" fill="#1A1A1A"/>' +
    '<rect x="1" y="9" width="20" height="6" fill="#1A1A1A"/>' +
    '<rect x="5" y="16" width="12" height="1" fill="#1A1A1A"/>' +
    '<rect x="13" y="1" width="6" height="8" fill="#1A1A1A"/>' +
    '<rect x="11" y="2" width="10" height="6" fill="#1A1A1A"/>' +
    '<rect x="10" y="3" width="11" height="4" fill="#1A1A1A"/>' +
    '<rect x="19" y="4" width="5" height="4" fill="#1A1A1A"/>' +
    '<rect x="5" y="8" width="12" height="8" fill="#FFE14D"/>' +
    '<rect x="3" y="9" width="16" height="6" fill="#FFE14D"/>' +
    '<rect x="2" y="10" width="18" height="4" fill="#FFE14D"/>' +
    '<rect x="6" y="15" width="10" height="1" fill="#FFE14D"/>' +
    '<rect x="14" y="2" width="4" height="6" fill="#FFE14D"/>' +
    '<rect x="12" y="3" width="8" height="5" fill="#FFE14D"/>' +
    '<rect x="11" y="4" width="9" height="3" fill="#FFE14D"/>' +
    '<rect x="13" y="7" width="6" height="2" fill="#FFE14D"/>' +
    '<rect x="4" y="10" width="4" height="2" fill="#FFF6C4"/>' +
    '<rect x="13" y="3" width="2" height="1" fill="#FFF6C4"/>' +
    '<rect x="7" y="11" width="7" height="3" fill="#F0B400"/>' +
    '<rect x="8" y="12" width="5" height="2" fill="#E09800"/>' +
    '<rect x="20" y="5" width="3" height="2" fill="#FF6D00"/>' +
    '<rect x="16" y="4" width="2" height="2" fill="#1A1A1A"/>' +
    '<rect x="16" y="4" width="1" height="1" fill="#FFFFFF"/>' +
    '</svg>';

function playDuckBurstSound() {
    if (typeof playRetroBeep !== 'function') return;
    playRetroBeep(720, 'square', 0.05, 0.07);
    window.setTimeout(() => playRetroBeep(420, 'square', 0.08, 0.06), 45);
}

function spawnDuckBurst(originX, originY, reduceMotion) {
    if (duckBurstLive >= DUCK_BURST_MAX) return;

    const angle = Math.random() * Math.PI * 2;
    const dist = reduceMotion ? 0 : 120 + Math.random() * 60;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const spin = (Math.random() * 2 - 1) * 30;
    const duration = reduceMotion ? 1.4 + Math.random() * 0.3 : 2 + Math.random() * 0.4;
    const size = 60;
    const height = (size * 18) / 24;

    const duck = document.createElement('span');
    duck.className = 'duck-burst-particle';
    duck.style.left = `${originX}px`;
    duck.style.top = `${originY}px`;
    duck.style.width = `${size}px`;
    duck.style.height = `${height}px`;
    duck.style.marginLeft = `${-size / 2}px`;
    duck.style.marginTop = `${-height / 2}px`;
    duck.style.setProperty('--tx', `${tx.toFixed(1)}px`);
    duck.style.setProperty('--ty', `${ty.toFixed(1)}px`);
    duck.style.setProperty('--spin', `${spin.toFixed(1)}deg`);
    duck.style.setProperty('--duration', `${duration.toFixed(2)}s`);
    duck.innerHTML = DUCK_MARKUP;

    duck.addEventListener(
        'animationend',
        () => {
            duck.remove();
            duckBurstLive -= 1;
        },
        { once: true }
    );

    document.body.appendChild(duck);
    duckBurstLive += 1;
}

function burstFromProfile(profile, clientX, clientY) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x = clientX;
    let y = clientY;

    if (x == null || y == null) {
        const rect = profile.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
    }

    playDuckBurstSound();
    spawnDuckBurst(x, y, reduceMotion);
}

function initDuckBurst() {
    const profile = document.querySelector('.profile-pixel-art');
    if (!profile) return;

    profile.setAttribute('tabindex', '0');
    profile.setAttribute('role', 'button');
    profile.setAttribute('aria-label', 'Antonio Troiano');

    profile.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    profile.addEventListener('click', (e) => {
        burstFromProfile(profile, e.clientX, e.clientY);
    });

    profile.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        burstFromProfile(profile, null, null);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDuckBurst);
} else {
    initDuckBurst();
}
