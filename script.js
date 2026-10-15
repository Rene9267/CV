// Event Listeners and User Interaction Management
const HOME_SCROLL_RESTORE_KEY = 'cv-home-scroll-restore';

function normalizeProjectHref(href) {
    try {
        const url = new URL(href, window.location.href);
        const path = url.pathname.split('/').filter(Boolean).pop();
        return path || href;
    } catch (_) {
        return href;
    }
}

function readHomeScrollRestore() {
    try {
        const raw = sessionStorage.getItem(HOME_SCROLL_RESTORE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data.href !== 'string' || typeof data.top !== 'number') return null;
        return data;
    } catch (_) {
        return null;
    }
}

function saveHomeProjectCardScroll(card, href) {
    if (!document.getElementById('intro')) return;
    const top = card.getBoundingClientRect().top;
    sessionStorage.setItem(HOME_SCROLL_RESTORE_KEY, JSON.stringify({ href, top }));
}

function findProjectCardByHref(href) {
    const target = normalizeProjectHref(href);
    const cards = document.querySelectorAll('.project-card');
    for (const card of cards) {
        const cardHref = card.getAttribute('data-href') || card.getAttribute('href');
        if (!cardHref) continue;
        if (normalizeProjectHref(cardHref) === target) return card;
    }
    return null;
}

function alignCardToViewportTop(card, viewportTop) {
    const delta = card.getBoundingClientRect().top - viewportTop;
    if (Math.abs(delta) < 0.5) return;
    window.scrollTo(0, window.scrollY + delta);
}

function finishHomeScrollRestore() {
    document.documentElement.classList.remove('is-restoring-scroll');
    if (history.scrollRestoration === 'manual') {
        history.scrollRestoration = 'auto';
    }
}

function initHomeScrollRestore() {
    const isHome = document.getElementById('intro') && document.querySelector('.project-card');
    if (!isHome) return;

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        sessionStorage.removeItem(HOME_SCROLL_RESTORE_KEY);
        finishHomeScrollRestore();
    });

    const pending = readHomeScrollRestore();
    if (!pending) return;

    const { href, top } = pending;
    sessionStorage.removeItem(HOME_SCROLL_RESTORE_KEY);

    history.scrollRestoration = 'manual';
    document.documentElement.classList.add('is-restoring-scroll');

    const restore = () => {
        const card = findProjectCardByHref(href);
        if (!card) return false;
        alignCardToViewportTop(card, top);
        return true;
    };

    restore();

    const baselineY = window.scrollY;
    let userScrolled = false;
    const onScroll = () => {
        if (Math.abs(window.scrollY - baselineY) > 2) userScrolled = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const recalcOnce = () => {
        window.removeEventListener('scroll', onScroll);
        if (!userScrolled) restore();
        finishHomeScrollRestore();
    };

    if (document.readyState === 'complete') {
        requestAnimationFrame(recalcOnce);
    } else {
        window.addEventListener('load', () => requestAnimationFrame(recalcOnce), { once: true });
    }
}

function youtubeWatchUrl(id) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}

function pageCanEmbedYoutube() {
    return location.protocol === 'http:' || location.protocol === 'https:';
}

function fillPlayFace(control, poster, labelText) {
    if (poster) {
        const img = document.createElement('img');
        img.src = poster;
        img.alt = '';
        img.decoding = 'async';
        control.appendChild(img);
    }

    const label = document.createElement('span');
    label.className = 'video-embed-play-label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = labelText;
    control.appendChild(label);
}

function showYoutubeExternal(container, id, title, poster) {
    const link = document.createElement('a');
    link.className = 'video-embed-play';
    link.href = youtubeWatchUrl(id);
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', `Apri su YouTube: ${title}`);
    fillPlayFace(link, poster, 'YouTube');
    container.replaceChildren(link);
}

function mountYoutubeFrame(container, id, title, autoplay, poster, host) {
    const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        enablejsapi: '1',
        origin: location.origin,
    });
    if (autoplay) params.set('autoplay', '1');

    const iframe = document.createElement('iframe');
    const frameId = `yt-${id}`;
    iframe.id = frameId;
    iframe.title = title;
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('allowfullscreen', '');
    iframe.src = `${host}/embed/${encodeURIComponent(id)}?${params}`;

    const onMessage = (event) => {
        if (event.source !== iframe.contentWindow) return;
        let data = event.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (_) {
                return;
            }
        }
        if (!data || data.event !== 'onError') return;

        const code = Number(data.info);
        window.removeEventListener('message', onMessage);
        if (code === 153 && host.includes('youtube-nocookie.com')) {
            mountYoutubeFrame(container, id, title, autoplay, poster, 'https://www.youtube.com');
            return;
        }
        if (code === 153 || code === 152 || code === 150 || code === 101) {
            showYoutubeExternal(container, id, title, poster);
        }
    };
    window.addEventListener('message', onMessage);
    iframe.addEventListener('load', () => {
        iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'listening', id: frameId, channel: 'widget' }),
            '*'
        );
    });
    container.replaceChildren(iframe);
}

function mountYoutubePlayer(container, id, title, autoplay) {
    const poster = container.dataset.poster || '';
    if (!pageCanEmbedYoutube()) {
        showYoutubeExternal(container, id, title, poster);
        return;
    }
    mountYoutubeFrame(container, id, title, autoplay, poster, 'https://www.youtube-nocookie.com');
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
    const side = Math.random() < 0.5 ? 'left' : 'right';
    popup.className = `contact-mail-popup contact-mail-popup--${side}`;
    popup.setAttribute('role', 'status');
    popup.textContent = 'Mail copiata';
    button.appendChild(popup);
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

        if (!pageCanEmbedYoutube()) {
            showYoutubeExternal(container, id, title, poster || '');
            return;
        }

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
    if (typeof initHobbyCaption === 'function') initHobbyCaption();
    initSceneEffects();
    initSectionIndex();
    initYoutubeEmbeds();
    initContactMailCopy();
};

function bootPortfolio() {
    initHomeScrollRestore();
    startPortfolio();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPortfolio);
} else {
    bootPortfolio();
}
