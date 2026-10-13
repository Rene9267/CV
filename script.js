// Event Listeners and User Interaction Management
function initYoutubeEmbeds() {
    const canEmbed = window.location.protocol === 'http:' || window.location.protocol === 'https:';

    document.querySelectorAll('.video-embed[data-youtube-id]').forEach((container) => {
        const id = container.dataset.youtubeId;
        const title = container.dataset.title || 'YouTube video';
        if (!id) return;

        if (canEmbed) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${id}`;
            iframe.title = title;
            iframe.allow =
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.setAttribute('allowfullscreen', '');
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            container.appendChild(iframe);
            return;
        }

        const link = document.createElement('a');
        link.className = 'video-embed-fallback';
        link.href = `https://www.youtube.com/watch?v=${id}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `Guarda su YouTube: ${title}`);

        const poster = container.dataset.poster;
        if (poster) {
            const img = document.createElement('img');
            img.src = poster;
            img.alt = '';
            img.decoding = 'async';
            link.appendChild(img);
        }

        const label = document.createElement('span');
        label.className = 'video-embed-fallback-label';
        label.textContent = 'Guarda su YouTube';
        link.appendChild(label);

        container.appendChild(link);
    });
}

// We wait for the entire Document Object Model to finish loading before we attempt to attach events to our HTML elements
const startPortfolio = () => {
    initPointerFeedback();
    initSectionSnap();

    console.log('Terminal Audio System and Interaction Grids Successfully Initialized.');

    initCertificateModal();
    initSkillTypewriter();
    initSceneEffects();
    initSectionIndex();
    initYoutubeEmbeds();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPortfolio);
} else {
    startPortfolio();
}
