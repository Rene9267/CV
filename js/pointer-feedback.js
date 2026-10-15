/** Hover and click sounds, plus the in-site page transition overlay. */
function initPointerFeedback() {
    // We select all the interactive UI elements present on the page storing them in variables for easy iteration
    const retroButtons = document.querySelectorAll('.retro-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const profilePhoto = document.querySelector('.profile-pixel-art');
    const certThumbnails = document.querySelectorAll('.cert-thumbnail');
    const companyLinks = document.querySelectorAll('.timeline-item a.company');
    const hobbyItems = document.querySelectorAll('.hobby-item'); // Selezione elementi hobbies

    // --- Retro Page Transition ---
    const overlay = document.createElement('div');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = '<span class="transition-text">Loading...</span><div class="transition-bar"></div>';
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    function retroNavigate(href) {
        if (reduceMotion) {
            window.location.href = href;
            return;
        }
        overlay.hidden = false;
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.remove('exit');
        overlay.classList.add('active');
        setTimeout(() => { window.location.href = href; }, 500);
    }

    // We iterate over standard buttons assigning distinct audio feedback for hovering and clicking actions
    retroButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            // A short high-frequency square wave gives the impression of a lightweight interface element being highlighted
            playRetroBeep(880, 'square', 0.05, 0.05);
        });

        button.addEventListener('mousedown', () => {
            // A lower frequency square wave on mouse down simulates the satisfying physical click of a mechanical keyboard switch
            playRetroBeep(440, 'square', 0.1, 0.1);
        });

        button.addEventListener('click', (e) => {
            const href = button.getAttribute('href');
            if (!href) return;
            if (href.startsWith('http://') || href.startsWith('https://') || button.target === '_blank') {
                return;
            }
            if (href.startsWith('#')) return;
            if (button.hasAttribute('download') || /\.pdf$/i.test(href)) return;
            e.preventDefault();
            retroNavigate(href);
        });
    });

    // --- Suoni per la Foto Profilo ---
    if (profilePhoto) {
        profilePhoto.addEventListener('mouseenter', () => {
            playRetroBeep(150, 'sawtooth', 0.08, 0.03);
        });
    }

    // We apply heavier and more industrial sound profiles to the project cards to make them feel like physical hardware modules
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Using a low-frequency sawtooth wave creates a buzzing effect similar to an electrical component powering up
            playRetroBeep(150, 'sawtooth', 0.08, 0.03);
        });

        card.addEventListener('mousedown', () => {
            // A deep and slightly longer square wave mimics the heavy thud of inserting a data cartridge into a mainframe
            playRetroBeep(300, 'square', 0.15, 0.08);
        });

        card.addEventListener('click', (e) => {
            const href = card.getAttribute('data-href') || card.getAttribute('href');
            if (!href) return;
            const opensNewTab = card.getAttribute('data-target') === '_blank' || card.target === '_blank';
            if (opensNewTab) {
                e.preventDefault();
                window.open(href, '_blank', 'noopener');
                return;
            }
            if (href.startsWith('http') || href.startsWith('#')) return;
            e.preventDefault();
            if (typeof saveHomeProjectCardScroll === 'function') {
                saveHomeProjectCardScroll(card, href);
            }
            retroNavigate(href);
        });
    });

    // --- Suono Hover per i Certificati ---
    certThumbnails.forEach(thumb => {
        thumb.addEventListener('mouseenter', () => {
            // Un suono leggermente più acuto e rapido rispetto alle card dei progetti grandi
            playRetroBeep(220, 'sawtooth', 0.06, 0.03);
        });
    });

    // --- Suoni per i Link Aziendali / Accademici ---
    companyLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            // Blip testuale molto rapido e acuto
            playRetroBeep(1200, 'square', 0.03, 0.02);
        });

        link.addEventListener('mousedown', () => {
            // Beep di conferma netto
            playRetroBeep(800, 'square', 0.08, 0.05);
        });
    });

    // --- Suoni per gli Hobbies Pixelati ---
    hobbyItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Un "tink" morbido e acuto stile moneta 8-bit
            playRetroBeep(1500, 'triangle', 0.04, 0.02);
        });
    });
}
