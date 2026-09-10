/**
 * Main Application Orchestrator
 * Controls state, scene transitions, love gifts, customizer, and audio UI.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Engines
  const particles = new ParticleEngine('particle-canvas');
  window.particleEngine = particles;

  let currentScene = 1;
  const scenes = {
    1: document.getElementById('scene-1'),
    2: document.getElementById('scene-2'),
    3: document.getElementById('scene-3'),
    4: document.getElementById('scene-4')
  };

  function switchScene(nextSceneNum) {
    if (scenes[currentScene]) {
      scenes[currentScene].classList.remove('active');
    }
    currentScene = nextSceneNum;
    if (scenes[currentScene]) {
      scenes[currentScene].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // 2. Scene 1: Envelope & Unseal interaction
  const envelope = document.getElementById('envelope');
  const openCardBtn = document.getElementById('open-card-btn');

  function openEnvelope() {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');

    if (window.soundEngine) {
      window.soundEngine.playChime();
    }
    particles.triggerConfetti();

    setTimeout(() => {
      switchScene(2);
      // Auto-start soft music on first interaction
      if (window.soundEngine && !window.soundEngine.isPlayingMusic) {
        window.soundEngine.toggleMusic();
        updateMusicBtnUI(true);
      }
    }, 1200);
  }

  if (envelope) envelope.addEventListener('click', openEnvelope);
  if (openCardBtn) openCardBtn.addEventListener('click', openEnvelope);

  // 3. Scene 2: Candle Blowing Logic
  const candleBlower = new CandleBlower({
    onExtinguishAll: () => {
      setTimeout(() => {
        switchScene(3);
      }, 1000);
    }
  });

  // 4. Scene 3: Cake Cutting Logic
  const cakeCutter = new CakeCutter({
    onCutComplete: () => {
      setTimeout(() => {
        switchScene(4);
      }, 1200);
    }
  });

  // 5. Audio Toggle Control
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  function updateMusicBtnUI(isPlaying) {
    if (!musicToggleBtn) return;
    musicToggleBtn.innerHTML = isPlaying ? '🎵' : '🔇';
    musicToggleBtn.setAttribute('aria-label', isPlaying ? 'Mute Music' : 'Play Music');
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      if (window.soundEngine) {
        const isPlaying = window.soundEngine.toggleMusic();
        updateMusicBtnUI(isPlaying);
      }
    });
  }

  // 6. Interactive Surprise Gift Boxes in Scene 4
  const loveQuotes = [
    "Your smile lights up my whole world! 🌟",
    "You are my favorite person, today and forever! 💖",
    "Every single moment with you is a blessing! ✨",
    "Happy Birthday to the girl who stole my heart! 🎂👑"
  ];

  document.querySelectorAll('.gift-box').forEach((box, index) => {
    box.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playChime();
      particles.triggerConfetti(
        box.getBoundingClientRect().left + 50,
        box.getBoundingClientRect().top + 50
      );

      const quote = loveQuotes[index % loveQuotes.length];
      showToast(quote);
    });
  });

  // Floating Toast Notification
  function showToast(message) {
    let toast = document.getElementById('toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-msg';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: linear-gradient(135deg, rgba(255,64,129,0.95), rgba(194,24,91,0.95));
        border: 1px solid var(--accent-blush);
        color: #fff;
        padding: 16px 28px;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 2000;
        font-weight: 600;
        font-size: 1.1rem;
        opacity: 0;
        transition: all 0.4s ease;
        text-align: center;
        max-width: 90vw;
      `;
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }

  // 7. Customizer Drawer Overlay
  const customizeBtn = document.getElementById('customize-btn');
  const customizerOverlay = document.getElementById('customizer-overlay');
  const closeCustomizerBtn = document.getElementById('close-customizer-btn');
  const customizerForm = document.getElementById('customizer-form');

  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      customizerOverlay.classList.add('open');
    });
  }

  if (closeCustomizerBtn) {
    closeCustomizerBtn.addEventListener('click', () => {
      customizerOverlay.classList.remove('open');
    });
  }

  if (customizerForm) {
    customizerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const gfName = document.getElementById('gf-name-input').value.trim();
      const wishMsg = document.getElementById('wish-msg-input').value.trim();
      const letterText = document.getElementById('letter-text-input').value.trim();

      if (gfName) {
        document.querySelectorAll('.gf-name-target').forEach(el => el.innerText = gfName);
      }
      if (wishMsg) {
        document.querySelectorAll('.wish-msg-target').forEach(el => el.innerText = wishMsg);
      }
      if (letterText) {
        const letterEl = document.getElementById('letter-text-target');
        if (letterEl) letterEl.innerText = letterText;
      }

      customizerOverlay.classList.remove('open');
      showToast('💖 Personalization saved!');
    });
  }
});
