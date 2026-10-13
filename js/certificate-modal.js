/** Opens and closes the about-page certificate lightbox. */
function initCertificateModal() {
    // --- Certificate Modal Logic ---
    const modal = document.getElementById('cert-modal');
    const modalImg = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close-modal');
    const certThumbnails = document.querySelectorAll('.cert-thumbnail');

    if (modal) {
        certThumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Suono di apertura modale (Apertura file)
                playRetroBeep(600, 'square', 0.1, 0.1);
                const imgSrc = thumb.getAttribute('data-src');
                modalImg.src = imgSrc;
                modal.classList.remove('hidden');
            });
        });

        const closeOverlay = () => {
            // Suono di chiusura modale (Chiusura file)
            playRetroBeep(300, 'square', 0.15, 0.1);
            modal.classList.add('hidden');
            modalImg.src = "";
        };

        if (closeModal) {
            closeModal.addEventListener('click', closeOverlay);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeOverlay();
            }
        });
    }
}
