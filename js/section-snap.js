/** Snaps the home page between full-height layers on wheel, including inner scrollports. */
function initSectionSnap() {
    // --- Scroll Lock: snap between sections with the mouse wheel ---
    const layers = document.querySelectorAll('.layer:not(.layer-off)');
    if (layers.length > 1) {
        let scrollLocked = false;

        const snapTo = (index) => {
            scrollLocked = true;
            window.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
            setTimeout(() => { scrollLocked = false; }, 600);
        };

        window.addEventListener('wheel', (e) => {
            if (scrollLocked) { e.preventDefault(); return; }

            const vh = window.innerHeight;
            const currentSection = Math.max(0, Math.min(layers.length - 1, Math.round(window.scrollY / vh)));
            const atSectionTop = Math.abs(window.scrollY - currentSection * vh) < 8;

            if (!atSectionTop) {
                e.preventDefault();
                const nearest = e.deltaY > 0
                    ? Math.min(layers.length - 1, Math.ceil(window.scrollY / vh))
                    : Math.max(0, Math.floor(window.scrollY / vh));
                snapTo(nearest);
                return;
            }

            const scrollable = layers[currentSection].querySelector('.scrollable-content');
            if (scrollable && scrollable.scrollHeight > scrollable.clientHeight + 2) {
                const atTop = scrollable.scrollTop <= 1;
                const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;
                const goingDown = e.deltaY > 0;

                if ((goingDown && !atBottom) || (!goingDown && !atTop)) {
                    e.preventDefault();
                    scrollable.scrollTop += e.deltaY;
                    return;
                }
            }

            if (e.deltaY > 0 && currentSection < layers.length - 1) {
                e.preventDefault();
                const next = layers[currentSection + 1].querySelector('.scrollable-content');
                if (next) next.scrollTop = 0;
                snapTo(currentSection + 1);
            } else if (e.deltaY < 0 && currentSection > 0) {
                e.preventDefault();
                const prev = layers[currentSection - 1].querySelector('.scrollable-content');
                if (prev) prev.scrollTop = prev.scrollHeight;
                snapTo(currentSection - 1);
            }
        }, { passive: false });
    }
}
