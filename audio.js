/**
 * Web Audio API Sound Synthesizer & Music Box Engine
 * Pure JS sound generator - requires zero external MP3s/WAVs!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.isMuted = false;
    this.melodyTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMusic() {
    this.init();
    if (this.isPlayingMusic) {
      this.stopMusic();
    } else {
      this.playBirthdayMelody();
    }
    return this.isPlayingMusic;
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  playNote(freq, duration = 0.4, type = 'sine', volume = 0.15, delay = 0) {
    if (this.isMuted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

    // Envelope
    const startTime = this.ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playBirthdayMelody() {
    this.isPlayingMusic = true;

    // Frequencies for Happy Birthday notes (C4, D4, E4, F4, G4, A4, B4, C5...)
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;

    // Note sequence [freq, duration, pause]
    const notes = [
      [G4, 0.3, 0.4], [G4, 0.3, 0.4], [A4, 0.6, 0.7], [G4, 0.6, 0.7], [C5, 0.6, 0.7], [B4, 1.0, 1.2],
      [G4, 0.3, 0.4], [G4, 0.3, 0.4], [A4, 0.6, 0.7], [G4, 0.6, 0.7], [D5, 0.6, 0.7], [C5, 1.0, 1.2],
      [G4, 0.3, 0.4], [G4, 0.3, 0.4], [G5, 0.6, 0.7], [E5, 0.6, 0.7], [C5, 0.6, 0.7], [B4, 0.6, 0.7], [A4, 0.8, 1.0],
      [F5, 0.3, 0.4], [F5, 0.3, 0.4], [E5, 0.6, 0.7], [C5, 0.6, 0.7], [D5, 0.6, 0.7], [C5, 1.2, 1.5]
    ];

    let currentStep = 0;

    const playNext = () => {
      if (!this.isPlayingMusic) return;
      const [freq, duration, delay] = notes[currentStep];
      
      // Music Box Dual Harmonic Tones
      this.playNote(freq, duration + 0.3, 'sine', 0.12);
      this.playNote(freq * 2, duration, 'triangle', 0.04);

      currentStep = (currentStep + 1) % notes.length;
      this.melodyTimer = setTimeout(playNext, delay * 600);
    };

    playNext();
  }

  playChime() {
    const tones = [523.25, 659.25, 783.99, 1046.50];
    tones.forEach((t, i) => {
      this.playNote(t, 0.6, 'sine', 0.1, i * 0.1);
    });
  }

  playBlow() {
    this.init();
    if (this.isMuted) return;
    // White noise wind blow effect
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  playSlice() {
    this.playNote(300, 0.15, 'sawtooth', 0.08);
    this.playNote(150, 0.2, 'sine', 0.1, 0.05);
  }

  playCelebrationFanfare() {
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 698.46, 880.00],
      [659.25, 783.99, 1046.50]
    ];
    chords.forEach((chord, step) => {
      chord.forEach(freq => {
        this.playNote(freq, 0.8, 'triangle', 0.08, step * 0.25);
      });
    });
  }
}

window.soundEngine = new SoundEngine();
