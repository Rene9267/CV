// --- 1. SETUP SINTETIZZATORE AUDIO RETRO (Web Audio API) ---
// Inizializziamo il contesto audio (simile a inizializzare l'AudioEngine)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Funzione per generare un "Beep" a 8-bit
function playRetroBeep(frequency, type = 'square', duration = 0.1, volume = 0.1) {
    // Il browser blocca l'audio finché l'utente non interagisce con la pagina
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Creiamo un oscillatore (la nostra fonte sonora)
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain(); // Il controller del volume

    // Impostiamo l'onda su 'square' per il classico suono stile GameBoy/Terminale
    oscillator.type = type; 
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Gestione del volume per evitare "click" fastidiosi (fade out veloce)
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    // Colleghiamo i nodi: Oscillatore -> Volume -> Casse del PC
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Facciamo partire e fermare il suono
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}


// --- 2. GESTIONE DEGLI EVENTI (Event Listeners) ---
// Aspettiamo che tutta la pagina HTML (il DOM) sia caricata in memoria
document.addEventListener("DOMContentLoaded", () => {
    
    // Selezioniamo tutti gli elementi interattivi
    const retroButtons = document.querySelectorAll('.btn-retro, .btn-card');
    const projectCards = document.querySelectorAll('.card-progetto');

    // Suoni per i bottoni classici
    retroButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playRetroBeep(880, 'square', 0.05, 0.05); // Suono acuto e rapido
        });

        button.addEventListener('mousedown', () => {
            // Suono grave al click (mousedown è più reattivo di 'click')
            playRetroBeep(440, 'square', 0.1, 0.1); 
        });
    });

    // Suoni per i "Quadri" (Card dei Progetti)
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Un suono "sawtooth" (dente di sega) a bassa frequenza (150Hz) 
            // simula il ronzio di un componente elettrico che si attiva
            playRetroBeep(150, 'sawtooth', 0.08, 0.03); 
        });

        card.addEventListener('mousedown', () => {
            // Un suono "meccanico" come l'inserimento di una cartuccia
            playRetroBeep(300, 'square', 0.15, 0.08);
        });
    });

    console.log("Sistema Audio e Griglie Inizializzati con Successo.");
});