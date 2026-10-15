/** Opens and closes the about-page certificate lightbox. */
function initCertificateModal() {
    const dialog = document.getElementById('cert-modal');
    const modalImg = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.querySelector('.cert-modal__prev');
    const nextBtn = document.querySelector('.cert-modal__next');
    const certThumbnails = Array.from(document.querySelectorAll('.cert-thumbnail'));

    if (!dialog || !modalImg || !certThumbnails.length) return;

    let currentIndex = 0;
    let lastFocus = null;

    const showAt = (index) => {
        currentIndex = (index + certThumbnails.length) % certThumbnails.length;
        const thumb = certThumbnails[currentIndex];
        const img = thumb.querySelector('img');
        const src = thumb.getAttribute('data-src') || img?.src || '';
        modalImg.src = src;
        modalImg.alt = img?.alt || thumb.getAttribute('aria-label') || 'Certificato';
    };

    const openModal = (index) => {
        lastFocus = document.activeElement;
        showAt(index);
        playRetroBeep(600, 'square', 0.1, 0.1);
        dialog.showModal();
        if (closeBtn) closeBtn.focus();
    };

    const closeModal = () => {
        playRetroBeep(300, 'square', 0.15, 0.1);
        dialog.close();
        modalImg.src = '';
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    certThumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => openModal(index));
        thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(index);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showAt(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showAt(currentIndex + 1);
        });
    }

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeModal();
    });

    dialog.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeModal();
    });

    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showAt(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            showAt(currentIndex + 1);
        }
    });

    let touchStartX = 0;
    dialog.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    dialog.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) < 50) return;
        if (dx > 0) showAt(currentIndex - 1);
        else showAt(currentIndex + 1);
    }, { passive: true });
}
