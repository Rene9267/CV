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
document.addEventListener("DOMContentLoaded", () => {
    
    // We select all the interactive UI elements present on the page storing them in variables for easy iteration
    const retroButtons = document.querySelectorAll('.retro-btn, .card-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const profilePhoto = document.querySelector('.profile-pixel-art'); // Selezioniamo la foto profilo

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
    });

    // --- AGGIUNTA: Suoni per la Foto Profilo ---
    // Applichiamo gli stessi suoni dei bottoni alla foto 8-bit
    if (profilePhoto) {
        profilePhoto.addEventListener('mouseenter', () => {
            playRetroBeep(150, 'sawtooth', 0.08, 0.03); 
        });

        // profilePhoto.addEventListener('mousedown', () => {
        //     playRetroBeep(440, 'square', 0.1, 0.1);
        // });
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
    });

    console.log("Terminal Audio System and Interaction Grids Successfully Initialized.");

    // --- Certificate Modal Logic ---
    const certThumbnails = document.querySelectorAll('.cert-thumbnail');
    const modal = document.getElementById('cert-modal');
    const modalImg = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close-modal');

    if (modal) { 
        certThumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                playRetroBeep(600, 'square', 0.1, 0.1); 
                const imgSrc = thumb.getAttribute('data-src');
                modalImg.src = imgSrc;
                modal.classList.remove('hidden');
            });
        });

        const closeOverlay = () => {
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
});