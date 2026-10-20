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
            description: [
                'Cosa può esistere di più affascinante dei robottoni giganti con spade laser, cannoni Vulcan e reattori più instabili delle mie prime bozze di linked list in C++? La risposta è assolutamente niente!',
                'Ed ecco qui che entrano in campo i Gundam, dall\'anime ai kit fino al gioco di carte. Questo franchise mi ha ammaliato da sempre, portandomi ad amare il genere dei mecha.',
                'L\'unico lato negativo? La pila di model kit che mi giudica dall\'angolo buio della stanza, in attesa di essere montata.',
            ],
            alt: 'Gundam model kits',
        },
        'hobby-7.png': {
            title: 'Energy drinks',
            description: [
                'La dipendenza che mi accompagna ormai dai tempi del liceo. Ormai gli energy drink non sono semplicemente un mezzo per restare sveglio o per avere un boost, sono diventati uno strumento di condivisione, una pratica sociale!',
                'Alcune delle amicizie più strette sono nate tramite la Monster e anche i rapporti aziendali sono diventati più stretti grazie alla giornata Monster (quel giorno della settimana in cui tutti devono bere un energy drink).',
            ],
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
            description: [
                'Ogni fissato con l\'informatica ha bisogno di staccare ogni tanto dalla routine del PC per evitare di bruciarsi completamente le retine. Bene, la mia scelta personale è una fantastica scampagnata, più complessa è, più a contatto con la natura mi fa sentire!',
                'Sono sempre pronto ad una nuova avventura. Basta una giornata non troppo burrascosa e sono pronto a partire!',
            ],
            alt: 'Hiking',
        },
        'hobby-2.png': {
            title: 'Video games',
            description: [
                'I videogiochi sono tutt\'oggi una piccola parte di me, quello sfogo che ti aiuta a staccare la testa quando la giornata diventa troppo pesante, quella storia che non ascolti soltanto, ma la vivi, quella sfida che ti sprona a migliorare per superare un ostacolo.',
                'I videogiochi sono stati per me il primo gesto di intesa con mio padre, che da quando ero piccino mi teneva sulle gambe mentre giocava a titoli come Oni o il primo Halo. Ho ancora con me quei CD e sono un tesoro prezioso.',
            ],
            alt: 'Video games',
        },
        'hobby-1.png': {
            title: 'Motorcycles',
            description: [
                'Uno degli ultimi traguardi che sono riuscito a chiudere. Sono sempre stato un amante delle due ruote, dalle bici fino al sogno della motocross.',
                'La patente l\'ho presa al secondo tentativo, dopo una comica bocciatura all\'esame, e ora posso finalmente godermi la strada.',
            ],
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
