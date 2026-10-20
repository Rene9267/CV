/** Email tab copies the address and spawns a retro damage-number floater. */

const MAIL_COPIED_MAX = 6;
let mailCopiedLive = 0;

function mailAddressFrom(link) {
    const href = link.getAttribute('href') || '';
    return href.replace(/^mailto:/i, '').split('?')[0];
}

function copyMailFallback(text) {
    try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
    } catch (_) {
        return false;
    }
}

function announceMailCopied() {
    let status = document.querySelector('.mail-copied-status');
    if (!status) {
        status = document.createElement('div');
        status.className = 'mail-copied-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        document.body.appendChild(status);
    }
    status.textContent = '';
    window.requestAnimationFrame(() => {
        status.textContent = 'Mail copiata';
    });
}

function playMailCopiedSound() {
    if (typeof playRetroBeep !== 'function') return;
    playRetroBeep(880, 'square', 0.04, 0.05);
    window.setTimeout(() => playRetroBeep(520, 'square', 0.06, 0.04), 40);
}

function spawnMailCopied(originX, originY, reduceMotion) {
    if (mailCopiedLive >= MAIL_COPIED_MAX) return;

    const floater = document.createElement('span');
    floater.className = 'mail-copied-floater';
    floater.setAttribute('aria-hidden', 'true');
    floater.textContent = 'Mail copiata';
    floater.style.left = `${originX}px`;
    floater.style.top = `${originY}px`;
    floater.style.setProperty('--dx', `${(Math.random() * 72 - 36).toFixed(1)}px`);
    floater.style.setProperty('--duration', reduceMotion ? '1.1s' : '1s');

    floater.addEventListener(
        'animationend',
        () => {
            floater.remove();
            mailCopiedLive -= 1;
        },
        { once: true }
    );

    document.body.appendChild(floater);
    mailCopiedLive += 1;
}

function initMailCopied() {
    const link = document.querySelector('.avatar-tab--email');
    if (!link) return;

    link.addEventListener('click', (event) => {
        event.preventDefault();
        const email = mailAddressFrom(link);
        if (!email) return;

        const rect = link.getBoundingClientRect();
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        playMailCopiedSound();
        announceMailCopied();
        spawnMailCopied(rect.left + rect.width / 2, rect.top + rect.height * 0.35, reduceMotion);

        copyMailFallback(email);
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(email).catch(() => {});
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMailCopied);
} else {
    initMailCopied();
}
