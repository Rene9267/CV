// Setup for the Retro Audio Synthesizer utilizing the Web Audio API
// We start by initializing the audio context which serves as our main audio engine managing all sound generation and routing
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioEngine = new AudioContext();

// This function dynamically generates an 8-bit style sound effect bypassing the need for external audio files
function playRetroBeep(frequency, type = 'square', duration = 0.1, volume = 0.1) {
    // Browsers automatically suspend audio contexts until the user interacts with the page so we must resume it if necessary
    if (audioEngine.state === 'suspended') {
        audioEngine.resume();
    }

    // We create an oscillator to generate the raw waveform and a gain node to control the output volume
    const oscillator = audioEngine.createOscillator();
    const gainNode = audioEngine.createGain();

    // Setting the oscillator type to square provides the distinct mechanical sound typical of retro terminals
    oscillator.type = type; 
    oscillator.frequency.setValueAtTime(frequency, audioEngine.currentTime);

    // We apply an exponential ramp to the volume to fade the sound out quickly and prevent harsh clicking artifacts
    gainNode.gain.setValueAtTime(volume, audioEngine.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioEngine.currentTime + duration);

    // The audio nodes are connected in a chain routing the oscillator through the gain node and finally to the destination speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioEngine.destination);

    // We initiate the oscillator playback and schedule it to stop exactly after our specified duration has passed
    oscillator.start();
    oscillator.stop(audioEngine.currentTime + duration);
}

// Event Listeners and User Interaction Management
// We wait for the entire Document Object Model to finish loading before we attempt to attach events to our HTML elements
const startPortfolio = () => {
    
    // We select all the interactive UI elements present on the page storing them in variables for easy iteration
    const retroButtons = document.querySelectorAll('.retro-btn, .card-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const profilePhoto = document.querySelector('.profile-pixel-art'); 
    const certThumbnails = document.querySelectorAll('.cert-thumbnail');
    const companyLinks = document.querySelectorAll('.timeline-item a.company'); 
    const hobbyItems = document.querySelectorAll('.hobby-item'); // Selezione elementi hobbies

    // --- Retro Page Transition ---
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = '<span class="transition-text">Loading...</span><div class="transition-bar"></div>';
    document.body.appendChild(overlay);

    function retroNavigate(href) {
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
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                e.preventDefault();
                retroNavigate(href);
            }
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

        card.addEventListener('click', () => {
            const href = card.getAttribute('data-href');
            if (!href) return;
            if (card.getAttribute('data-target') === '_blank') {
                window.open(href, '_blank');
            } else {
                retroNavigate(href);
            }
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

    // --- Scroll Lock: snap between sections with the mouse wheel ---
    const layers = document.querySelectorAll('.layer');
    if (layers.length > 1) {
        let scrollLocked = false;

        const snapTo = (index) => {
            scrollLocked = true;
            window.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
            setTimeout(() => { scrollLocked = false; }, 600);
        };

        window.addEventListener('wheel', (e) => {
            if (scrollLocked) { e.preventDefault(); return; }

            const vh = window.innerHeight;
            const currentSection = Math.max(0, Math.min(layers.length - 1, Math.round(window.scrollY / vh)));
            const atSectionTop = Math.abs(window.scrollY - currentSection * vh) < 8;

            if (!atSectionTop) {
                e.preventDefault();
                const nearest = e.deltaY > 0
                    ? Math.min(layers.length - 1, Math.ceil(window.scrollY / vh))
                    : Math.max(0, Math.floor(window.scrollY / vh));
                snapTo(nearest);
                return;
            }

            const scrollable = layers[currentSection].querySelector('.scrollable-content');
            if (scrollable && scrollable.scrollHeight > scrollable.clientHeight + 2) {
                const atTop = scrollable.scrollTop <= 1;
                const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;
                const goingDown = e.deltaY > 0;

                if ((goingDown && !atBottom) || (!goingDown && !atTop)) {
                    e.preventDefault();
                    scrollable.scrollTop += e.deltaY;
                    return;
                }
            }

            if (e.deltaY > 0 && currentSection < layers.length - 1) {
                e.preventDefault();
                const next = layers[currentSection + 1].querySelector('.scrollable-content');
                if (next) next.scrollTop = 0;
                snapTo(currentSection + 1);
            } else if (e.deltaY < 0 && currentSection > 0) {
                e.preventDefault();
                const prev = layers[currentSection - 1].querySelector('.scrollable-content');
                if (prev) prev.scrollTop = prev.scrollHeight;
                snapTo(currentSection - 1);
            }
        }, { passive: false });
    }

    console.log("Terminal Audio System and Interaction Grids Successfully Initialized.");

    // --- Certificate Modal Logic ---
    const modal = document.getElementById('cert-modal');
    const modalImg = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close-modal');

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

    // --- Typewriter Skills Animation (about page skill boxes) ---
    const skillBoxes = document.querySelectorAll('.skill-box');
    if (skillBoxes.length) {
        skillBoxes.forEach((box) => {
            const ul = box.querySelector('ul');
            if (!ul) return;
            const items = Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim());
            if (!items.length) return;

            const typedContainer = document.createElement('div');
            typedContainer.className = 'about-typed';
            ul.style.display = 'none';
            box.appendChild(typedContainer);

            const cursor = '<span class="cursor">|</span>';
            const prefix = '> ';
            const speed = 30;
            const linePause = 250;

            let lineIdx = 0;
            let charIdx = 0;

            function render() {
                let html = '';
                for (let i = 0; i < lineIdx; i++) {
                    html += `<span class="typed-line">${prefix}${items[i]}</span>`;
                }
                if (lineIdx < items.length) {
                    html += `<span class="typed-line">${prefix}${items[lineIdx].slice(0, charIdx)}${cursor}</span>`;
                } else {
                    html += `<span class="typed-line">${prefix}${items[items.length - 1]}${cursor}</span>`;
                }
                typedContainer.innerHTML = html;
            }

            function type() {
                if (lineIdx >= items.length) return;
                charIdx++;
                render();
                if (charIdx <= items[lineIdx].length) {
                    setTimeout(type, speed);
                } else {
                    lineIdx++;
                    charIdx = 0;
                    setTimeout(type, linePause);
                }
            }

            render();
            setTimeout(type, 350);
        });
    }

    // --- Sfondo teatrale: generazione braci ---
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const emberField = document.querySelector('.ember-field');
    if (emberField && !reduceMotion) {
        const emberCount = Math.min(28, Math.floor(window.innerWidth / 50));
        for (let i = 0; i < emberCount; i++) {
            const ember = document.createElement('span');
            ember.className = 'ember';
            const size = 2 + Math.random() * 4.5;
            ember.style.width = `${size}px`;
            ember.style.height = `${size}px`;
            ember.style.left = `${Math.random() * 100}%`;
            ember.style.setProperty('--drift', `${(Math.random() * 2 - 1) * 140}px`);
            ember.style.setProperty('--rise', `${(Math.random() * 35 + 25)}vh`);
            ember.style.animationDuration = `${7 + Math.random() * 9}s`;
            ember.style.animationDelay = `${-Math.random() * 14}s`;
            emberField.appendChild(ember);
        }
    }

    // --- Zoom con lerp per le gallerie screenshot ---
    const galleryImages = document.querySelectorAll('.screenshot-img');
    if (galleryImages.length && !reduceMotion) {
        const ZOOM_TARGET = 1.5;
        const ZOOM_LERP = 0.12;

        galleryImages.forEach(img => {
            let scale = 1;
            let target = 1;
            let originX = 50;
            let originY = 50;
            let toX = 50;
            let toY = 50;
            let rafId = null;

            const ease = () => {
                scale += (target - scale) * ZOOM_LERP;
                originX += (toX - originX) * ZOOM_LERP;
                originY += (toY - originY) * ZOOM_LERP;
                img.style.transformOrigin = `${originX}% ${originY}%`;
                img.style.transform = `scale(${scale})`;
                if (Math.abs(target - scale) > 0.0008 ||
                    Math.abs(toX - originX) > 0.05 ||
                    Math.abs(toY - originY) > 0.05) {
                    rafId = requestAnimationFrame(ease);
                } else {
                    rafId = null;
                }
            };

            const kick = () => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(ease);
            };

            img.addEventListener('mouseenter', () => {
                target = ZOOM_TARGET;
                kick();
            });

            img.addEventListener('mousemove', (e) => {
                const rect = img.getBoundingClientRect();
                toX = ((e.clientX - rect.left) / rect.width) * 100;
                toY = ((e.clientY - rect.top) / rect.height) * 100;
                kick();
            });

            img.addEventListener('mouseleave', () => {
                target = 1;
                toX = 50;
                toY = 50;
                kick();
            });
        });
    }

    // --- Sfondo terminale: glifi galleggianti ---
    const codeField = document.querySelector('.term-code-field');
    if (codeField && !reduceMotion) {
        const glyphs = ['>', '_', '$', '#', 'PS C:\\>', 'C:\\>', 'IE:', '&', '*', '%', '~', '=>', 'echo', 'cd ..'];
        for (let i = 0; i < 26; i++) {
            const glyph = document.createElement('span');
            glyph.className = 'term-glyph';
            if (i % 4 === 0) glyph.classList.add('t-green');
            if (i % 5 === 0) glyph.classList.add('t-muted');
            glyph.textContent = glyphs[i % glyphs.length];
            const size = 0.6 + Math.random() * 0.8;
            glyph.style.fontSize = `${size}rem`;
            glyph.style.left = `${Math.random() * 100}%`;
            glyph.style.top = `${Math.random() * 100}%`;
            glyph.style.setProperty('--drift-x', `${(Math.random() * 2 - 1) * 120}px`);
            glyph.style.setProperty('--drift-y', `${(Math.random() * 2 - 1) * 90}px`);
            glyph.style.animationDuration = `${8 + Math.random() * 10}s`;
            glyph.style.animationDelay = `${-Math.random() * 14}s`;
            codeField.appendChild(glyph);
        }
    }

    // --- Indice laterale delle sezioni ---
    const indexNav = document.querySelector('.index-nav');
    const menuBtn = document.querySelector('.nav-menu-btn');
    let closeNavDrawer = () => {};

    if (indexNav) {
        const headings = Array.from(document.querySelectorAll(
            '.container-about h2.section-title, .container-about h2.section-title-code'
        ));
        if (headings.length) {
            const ul = document.createElement('ul');

            const readableLabel = (text) => text.trim()
                .replace(/^\/+/, '')
                .replace(/[_-]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            headings.forEach((heading, i) => {
                let id = heading.id;
                if (!id) {
                    const base = heading.textContent.trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    id = base || 'sezione';
                    if (document.getElementById(id)) id = `${id}-${i}`;
                    heading.id = id;
                }

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${id}`;
                a.textContent = readableLabel(heading.textContent);
                a.classList.add('index-link');
                li.appendChild(a);
                ul.appendChild(li);

                a.addEventListener('mouseenter', () => {
                    playRetroBeep(1100, 'square', 0.03, 0.02);
                });
            });

            indexNav.appendChild(ul);

            const links = Array.from(ul.querySelectorAll('a'));
            links.forEach((link) => {
                link.addEventListener('click', (e) => {
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        e.preventDefault();
                        playRetroBeep(700, 'square', 0.08, 0.05);
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        closeNavDrawer();
                    }
                });
            });

            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            links.forEach(l => l.classList.toggle(
                                'active',
                                l.getAttribute('href') === `#${entry.target.id}`
                            ));
                        }
                    });
                }, { rootMargin: '-25% 0px -65% 0px' });
                headings.forEach(h => observer.observe(h));
            }
        }

        const projectActions = document.querySelector('.project-actions');
        if (projectActions) {
            const externalAnchors = Array.from(projectActions.querySelectorAll('a')).filter((anchor) => {
                const href = anchor.getAttribute('href') || '';
                return /itch\.io/i.test(href) || /github\.com/i.test(href);
            });
            if (externalAnchors.length) {
                const linksTitle = document.createElement('h3');
                linksTitle.className = 'index-nav-links-title';
                linksTitle.textContent = '[ // Link ]';
                const linksList = document.createElement('ul');
                externalAnchors.forEach((source) => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = source.href;
                    a.textContent = source.textContent.trim();
                    a.classList.add('index-link', 'index-link--external');
                    if (source.target) a.target = source.target;
                    if (source.rel) a.rel = source.rel;
                    else if (a.target === '_blank') a.rel = 'noopener noreferrer';
                    li.appendChild(a);
                    linksList.appendChild(li);
                    a.addEventListener('click', () => closeNavDrawer());
                    a.addEventListener('mouseenter', () => {
                        playRetroBeep(1100, 'square', 0.03, 0.02);
                    });
                });
                indexNav.appendChild(linksTitle);
                indexNav.appendChild(linksList);
            }
        }
    }

    if (indexNav && menuBtn) {
        let backdrop = document.querySelector('.nav-drawer-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('button');
            backdrop.type = 'button';
            backdrop.className = 'nav-drawer-backdrop';
            backdrop.setAttribute('aria-label', 'Chiudi menu');
            document.body.appendChild(backdrop);
        }

        const setDrawerOpen = (open) => {
            document.body.classList.toggle('nav-drawer-open', open);
            indexNav.classList.toggle('is-open', open);
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        closeNavDrawer = () => setDrawerOpen(false);

        menuBtn.addEventListener('click', () => {
            const willOpen = !indexNav.classList.contains('is-open');
            playRetroBeep(willOpen ? 900 : 600, 'square', 0.06, 0.04);
            setDrawerOpen(willOpen);
        });

        backdrop.addEventListener('click', closeNavDrawer);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && indexNav.classList.contains('is-open')) {
                closeNavDrawer();
            }
        });
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPortfolio);
} else {
    startPortfolio();
}