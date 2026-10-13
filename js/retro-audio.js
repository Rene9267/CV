// Setup for the Retro Audio Synthesizer utilizing the Web Audio API
// We start by initializing the audio context which serves as our main audio engine managing all sound generation and routing
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioEngine = new AudioContext();

/** Plays one 8-bit beep. Defaults match the original call sites. */
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
