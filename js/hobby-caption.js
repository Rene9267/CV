/** Hover/tap caption with fast typewriter for hobby marquee icons. */
function initHobbyCaption() {
    const panel = document.getElementById('hobby-caption-panel');
    const hobbyItems = document.querySelectorAll('#hobbies-section .hobby-item');
    if (!panel || !hobbyItems.length) return;

    const mediaWrap = panel.querySelector('.hobby-caption-media');
    const captionImg = panel.querySelector('.hobby-caption-img');
    const textContainer = panel.querySelector('.hobby-caption-typed');
    if (!mediaWrap || !captionImg || !textContainer) return;

    const HOBBY_COPY = {
        'hobby-9.png': {
            title: 'Gundam kits',
            description: 'Gunpla on the desk. Mechs, one runner at a time.',
            alt: 'Gundam model kits',
        },
        'hobby-7.png': {
            title: 'Energy drinks',
            description: 'The green can. Fuel for late sessions.',
            alt: 'Energy drinks',
        },
        'hobby-10.png': {
            title: 'Giochi da tavolo',
            description: [
                'Uno dei pezzi della mia infanzia, Risiko era il mio gioco preferito da piccolo, e probabilmente lo è tutt\'ora, una passione che non mi ha mai abbandonato portandomi a diventare un organizzatore di serate di giochi da tavolo',
                'P.s. sono sempre alla ricerca di nuovi giochi, non abbiate paura di consigliare',
            ],
            alt: 'Board games',
        },
        'hobby-8.png': {
            title: 'Hiking',
            description: 'Pack, stick, and a trail off the screen.',
            alt: 'Hiking',
        },
        'hobby-2.png': {
            title: 'Video games',
            description: 'Controller in hand. Playing as much as making.',
            alt: 'Video games',
        },
        'hobby-1.png': {
            title: 'Motorcycles',
            description: 'Two wheels and an open road.',
            alt: 'Motorcycles',
        },
    };

    const cursor = '<span class="cursor">|</span>';
    const prefix = '> ';
    const speed = 10;

    let activeKey = null;
    let timeoutId = null;
    let phase = 'idle';
    let lines = [];
    let charCounts = [];

    function hobbyKeyFromSrc(src) {
        if (!src) return null;
        const file = src.split('/').pop().split('?')[0];
        return HOBBY_COPY[file] ? file : null;
    }

    function clearTimer() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    function escapeText(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function descriptionLines(copy) {
        if (Array.isArray(copy.description)) return copy.description;
        return copy.description ? [copy.description] : [];
    }

    function renderLines() {
        let html = '';
        lines.forEach((line, i) => {
            const shown = line.text.slice(0, charCounts[i]);
            const stillTyping = charCounts[i] < line.text.length;
            const showCaret = stillTyping || (phase === 'done' && i === lines.length - 1);
            const caret = showCaret ? cursor : '';
            if (line.isTitle) {
                html += `<span class="typed-line hobby-caption-title">${prefix}<span class="hobby-caption-name">${escapeText(shown)}</span>${caret}</span>`;
            } else {
                html += `<span class="typed-line">${escapeText(shown)}${caret}</span>`;
            }
        });
        textContainer.innerHTML = html;
    }

    function startTypewriter(key, copy) {
        clearTimer();
        activeKey = key;
        phase = 'typing';
        lines = [
            { text: copy.title, isTitle: true },
            ...descriptionLines(copy).map((text) => ({ text, isTitle: false })),
        ];
        charCounts = lines.map(() => 0);

        captionImg.src = `assets/${key}`;
        captionImg.alt = copy.alt;
        mediaWrap.classList.remove('hidden');
        mediaWrap.setAttribute('aria-hidden', 'false');

        function tick() {
            let pending = false;
            for (let i = 0; i < lines.length; i++) {
                if (charCounts[i] < lines[i].text.length) {
                    charCounts[i]++;
                    if (charCounts[i] < lines[i].text.length) pending = true;
                }
            }
            if (pending) {
                renderLines();
                timeoutId = setTimeout(tick, speed);
            } else {
                phase = 'done';
                renderLines();
                timeoutId = null;
            }
        }

        renderLines();
        timeoutId = setTimeout(tick, speed);
    }

    function activateFromItem(item) {
        const img = item.querySelector('img');
        if (!img) return;
        const key = hobbyKeyFromSrc(img.getAttribute('src') || img.src);
        if (!key) return;
        if (key === activeKey && phase !== 'idle') return;
        startTypewriter(key, HOBBY_COPY[key]);
    }

    hobbyItems.forEach((item) => {
        item.addEventListener('mouseenter', () => activateFromItem(item));
        item.addEventListener('click', () => activateFromItem(item));
    });
}
