/**
 * Cake Cutting Mechanics Engine
 * Interactive knife drag-and-drop / swipe slice cutting logic.
 */

class CakeCutter {
  constructor(options = {}) {
    this.onCutComplete = options.onCutComplete || (() => {});
    this.knife = document.getElementById('knife');
    this.slicedPiece = document.getElementById('sliced-piece');
    this.cutIndicator = document.getElementById('cut-line');
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.hasCut = false;

    this.initEvents();
  }

  initEvents() {
    if (!this.knife) return;

    // Mouse Events
    this.knife.addEventListener('mousedown', (e) => this.startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => this.onDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => this.endDrag());

    // Touch Events
    this.knife.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        this.onDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    window.addEventListener('touchend', () => this.endDrag());

    // Click fallback cut button
    const cutBtn = document.getElementById('slice-btn');
    if (cutBtn) {
      cutBtn.addEventListener('click', () => this.performCut());
    }
  }

  startDrag(x, y) {
    if (this.hasCut) return;
    this.isDragging = true;
    this.startX = x;
    this.startY = y;
    this.knife.style.transition = 'none';
  }

  onDrag(x, y) {
    if (!this.isDragging || this.hasCut) return;
    const deltaY = y - this.startY;
    const deltaX = x - this.startX;

    this.knife.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(-25deg)`;

    // Check if dragged down through the cut line (downward vertical slice > 60px)
    if (deltaY > 60 || Math.abs(deltaX) > 100) {
      this.performCut();
    }
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (!this.hasCut) {
      this.knife.style.transition = 'transform 0.4s ease';
      this.knife.style.transform = 'translate(0, 0) rotate(0deg)';
    }
  }

  performCut() {
    if (this.hasCut) return;
    this.hasCut = true;
    this.isDragging = false;

    // Animate knife slice
    if (this.knife) {
      this.knife.style.transition = 'transform 0.6s ease';
      this.knife.style.transform = 'translate(-40px, 120px) rotate(-45deg)';
    }

    // Play slicing sound & trigger piece separation
    if (window.soundEngine) window.soundEngine.playSlice();
    
    setTimeout(() => {
      if (this.slicedPiece) {
        this.slicedPiece.classList.add('cut-done');
      }
      if (this.cutIndicator) {
        this.cutIndicator.style.opacity = '0';
      }

      if (window.soundEngine) window.soundEngine.playCelebrationFanfare();
      if (window.particleEngine) {
        window.particleEngine.triggerConfetti();
        window.particleEngine.triggerFireworks();
      }

      setTimeout(() => {
        this.onCutComplete();
      }, 1500);
    }, 400);
  }
}

window.CakeCutter = CakeCutter;
