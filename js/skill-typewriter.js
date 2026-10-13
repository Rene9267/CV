/** Types each about-page skill list one character at a time. */
function initSkillTypewriter() {
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
}
