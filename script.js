// Event Listeners and User Interaction Management
function mountYoutubePlayer(container, id, title, autoplay) {
    const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
    });
    if (autoplay) params.set('autoplay', '1');

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`;
    iframe.title = title;
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('allowfullscreen', '');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    container.replaceChildren(iframe);
}

async function copyTextToClipboard(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (_) {
        /* fallback below */
    }

    try {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.left = '-9999px';
        document.body.appendChild(field);
        field.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(field);
        return ok;
    } catch (_) {
        return false;
    }
}

function showMailCopiedPopup(button) {
    const existing = button.querySelector('.contact-mail-popup');
    if (existing) existing.remove();

    const popup = document.createElement('span');
    popup.className = 'contact-mail-popup';
    popup.setAttribute('role', 'status');
    popup.textContent = 'Mail copiata';
    button.appendChild(popup);

    void popup.offsetWidth;
    popup.classList.add('contact-mail-popup--show');
    popup.addEventListener('animationend', () => popup.remove(), { once: true });
}

function initContactMailCopy() {
    document.querySelectorAll('[data-copy-mail]').forEach((button) => {
        button.addEventListener('click', async () => {
            const mail = button.getAttribute('data-copy-mail');
            if (!mail) return;
            const copied = await copyTextToClipboard(mail);
            if (copied) showMailCopiedPopup(button);
        });
    });
}

function initYoutubeEmbeds() {
    document.querySelectorAll('.video-embed[data-youtube-id]').forEach((container) => {
        const id = container.dataset.youtubeId;
        const title = container.dataset.title || 'YouTube video';
        const poster = container.dataset.poster;
        if (!id) return;

        if (!poster) {
            mountYoutubePlayer(container, id, title, false);
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'video-embed-play';
        button.setAttribute('aria-label', `Riproduci: ${title}`);

        const img = document.createElement('img');
        img.src = poster;
        img.alt = '';
        img.decoding = 'async';
        button.appendChild(img);

        const label = document.createElement('span');
        label.className = 'video-embed-play-label';
        label.setAttribute('aria-hidden', 'true');
        label.textContent = 'Play';
        button.appendChild(label);

        button.addEventListener('click', () => {
            mountYoutubePlayer(container, id, title, true);
        });

        container.appendChild(button);
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
    initContactMailCopy();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPortfolio);
} else {
    startPortfolio();
}
