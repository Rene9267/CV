/** Snaps the home page between sections on wheel (desktop + fine pointer only). */
function initSectionSnap() {
    const layers = document.querySelectorAll('.layer:not(.layer-off)');
    if (layers.length <= 1) return;

    const canSnap = window.matchMedia('(min-width: 900px) and (pointer: fine)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canSnap) return;

    const sectionTops = () => Array.from(layers).map((layer) => layer.offsetTop);

    let scrollLocked = false;

    const snapTo = (index) => {
        const tops = sectionTops();
        const top = tops[Math.max(0, Math.min(layers.length - 1, index))];
        scrollLocked = true;
        window.scrollTo({ top, behavior: 'smooth' });
        setTimeout(() => { scrollLocked = false; }, 600);
    };

    const currentSectionIndex = () => {
        const tops = sectionTops();
        const y = window.scrollY;
        let idx = 0;
        for (let i = 0; i < tops.length; i++) {
            if (y + 8 >= tops[i]) idx = i;
        }
        return idx;
    };

    window.addEventListener('wheel', (e) => {
        if (scrollLocked) {
            e.preventDefault();
            return;
        }

        const tops = sectionTops();
        const currentSection = currentSectionIndex();
        const atSectionTop = Math.abs(window.scrollY - tops[currentSection]) < 8;

        if (!atSectionTop) {
            e.preventDefault();
            const nearest = e.deltaY > 0
                ? Math.min(layers.length - 1, currentSection + 1)
                : Math.max(0, currentSection - 1);
            snapTo(nearest);
            return;
        }

        if (e.deltaY > 0 && currentSection < layers.length - 1) {
            e.preventDefault();
            snapTo(currentSection + 1);
        } else if (e.deltaY < 0 && currentSection > 0) {
            e.preventDefault();
            snapTo(currentSection - 1);
        }
    }, { passive: false });
}
