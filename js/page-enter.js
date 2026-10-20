/** Keeps the Loading overlay over the incoming page, then slides it down off screen. */
const PAGE_ENTER_KEY = 'cv-page-enter';

function createPageTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = '<span class="transition-text">Loading...</span><div class="transition-bar"></div>';
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    return overlay;
}

function slideOutPageTransition(overlay) {
    const finish = () => {
        // A new navigation removes .leave and takes the overlay back over.
        if (!overlay.classList.contains('leave')) return;
        overlay.classList.remove('active', 'is-held', 'leave', 'exit');
        overlay.hidden = true;
        overlay.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('is-page-entering');
    };
    const onEnd = (event) => {
        if (event.target !== overlay) return;
        overlay.removeEventListener('transitionend', onEnd);
        finish();
    };
    overlay.addEventListener('transitionend', onEnd);
    // transitionend never fires in a background tab.
    setTimeout(finish, 400);
    overlay.classList.add('leave');
}

(function () {
    let shouldEnter = false;
    try {
        shouldEnter = sessionStorage.getItem(PAGE_ENTER_KEY) === '1';
        sessionStorage.removeItem(PAGE_ENTER_KEY);
    } catch (_) { /* sessionStorage unavailable */ }

    if (shouldEnter && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const overlay = createPageTransitionOverlay();
        overlay.hidden = false;
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-held');
        document.documentElement.appendChild(overlay);
        document.documentElement.classList.add('is-page-entering');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => slideOutPageTransition(overlay));
        });
    }

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        try {
            sessionStorage.removeItem(PAGE_ENTER_KEY);
        } catch (_) { /* sessionStorage unavailable */ }
        const overlay = document.querySelector('.page-transition-overlay.active');
        if (overlay) slideOutPageTransition(overlay);
    });
})();
