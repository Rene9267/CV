/** Builds the project-page section index and the narrow-viewport drawer. */
function initSectionIndex() {
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
                    const href = link.getAttribute('href');
                    if (!href || !href.startsWith('#')) return;
                    const target = document.querySelector(href);
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
                return /^https?:\/\//i.test(href);
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
}
