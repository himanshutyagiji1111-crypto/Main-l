/**
 * Candle Blowing Physics & Microphone Detection Engine
 * Uses Web Audio API MediaDevices to listen for blowing sound/wind, with full tap/click fallback.
 */

class CandleBlower {
  constructor(options = {}) {
    this.onExtinguishAll = options.onExtinguishAll || (() => {});
    this.micStream = null;
    this.audioCtx = null;
    this.analyser = null;
    this.isListening = false;
    this.candlesBlown = 0;
    this.totalCandles = 3;
    this.isFinished = false;

    this.blowBtn = document.getElementById('blow-btn');
    this.micBtn = document.getElementById('mic-btn');
    this.meterFill = document.getElementById('meter-fill');
    this.meterStatus = document.getElementById('meter-status');

    this.setupListeners();
  }

  setupListeners() {
    if (this.blowBtn) {
      this.blowBtn.addEventListener('click', () => this.blowManual());
    }
    if (this.micBtn) {
      this.micBtn.addEventListener('click', () => this.startMicListener());
    }
  }

  async startMicListener() {
    if (this.isListening) return;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.isListening = true;
      if (this.micBtn) {
        this.micBtn.style.background = 'rgba(0, 230, 118, 0.3)';
        this.micBtn.innerHTML = '🎤 Mic Active (Blow Now!)';
      }
      if (this.meterStatus) {
        this.meterStatus.innerText = 'Blow into your microphone! 🌬️';
      }

      this.analyzeLoop();
    } catch (err) {
      console.warn('Microphone permission denied or unsupported:', err);
      if (this.meterStatus) {
        this.meterStatus.innerText = 'Mic unavailable. Tap the "Blow Candles" button below!';
      }
    }
  }

  analyzeLoop() {
    if (!this.isListening || this.isFinished) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const levelPercent = Math.min(100, Math.round((average / 120) * 100));

    if (this.meterFill) {
      this.meterFill.style.width = `${levelPercent}%`;
    }

    // Threshold for blowing air into mic (usually sudden increase in frequency average > 35)
    if (average > 35) {
      this.extinguishOne();
    }

    requestAnimationFrame(() => this.analyzeLoop());
  }

  blowManual() {
    if (this.isFinished) return;
    
    // Simulate blow effect meter
    if (this.meterFill) {
      this.meterFill.style.width = '100%';
      setTimeout(() => {
        if (this.meterFill) this.meterFill.style.width = '0%';
      }, 500);
    }

    this.extinguishOne();
  }

  extinguishOne() {
    const flames = document.querySelectorAll('.flame:not(.extinguished)');
    if (flames.length > 0) {
      const targetFlame = flames[0];
      targetFlame.classList.add('extinguished');
      
      // Spawn Smoke Particles
      const candle = targetFlame.parentElement;
      for (let i = 0; i < 4; i++) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        smoke.style.left = `${50 + (Math.random() * 20 - 10)}%`;
        candle.appendChild(smoke);
        setTimeout(() => smoke.remove(), 1600);
      }

      if (window.soundEngine) window.soundEngine.playBlow();
      this.candlesBlown++;

      if (flames.length === 1 && !this.isFinished) {
        this.isFinished = true;
        if (this.meterStatus) {
          this.meterStatus.innerText = '✨ All candles blown out! Make a wish! 💖';
        }
        if (window.soundEngine) window.soundEngine.playCelebrationFanfare();
        if (window.particleEngine) window.particleEngine.triggerConfetti();

        setTimeout(() => {
          this.onExtinguishAll();
        }, 1200);
      }
    }
  }

  reset() {
    this.candlesBlown = 0;
    this.isFinished = false;
    document.querySelectorAll('.flame').forEach(f => f.classList.remove('extinguished'));
  }
}

window.CandleBlower = CandleBlower;
