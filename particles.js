/**
 * High-performance Physics Particle Engine
 * Handles background floating romantic hearts, twinkling starfield, smoke, confetti, and fireworks.
 */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.fireworks = [];
    this.hearts = [];
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
    this.initHearts();
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initHearts() {
    this.hearts = [];
    const count = Math.min(Math.floor(window.innerWidth / 30), 40);
    for (let i = 0; i < count; i++) {
      this.hearts.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 14 + 10,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: Math.sin(Math.random() * Math.PI) * 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        color: ['#ff4081', '#ff80ab', '#ffc1e3', '#ffd700'][Math.floor(Math.random() * 4)]
      });
    }
  }

  drawHeart(ctx, x, y, size, color, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // top left curve
    ctx.bezierCurveTo(
      x, y, 
      x - size / 2, y, 
      x - size / 2, y + topCurveHeight
    );
    // bottom left curve
    ctx.bezierCurveTo(
      x - size / 2, y + (size + topCurveHeight) / 2, 
      x, y + size, 
      x, y + size
    );
    // bottom right curve
    ctx.bezierCurveTo(
      x, y + size, 
      x + size / 2, y + (size + topCurveHeight) / 2, 
      x + size / 2, y + topCurveHeight
    );
    // top right curve
    ctx.bezierCurveTo(
      x + size / 2, y, 
      x, y, 
      x, y + topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  triggerConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    const colors = ['#ff4081', '#ffd700', '#00e676', '#00b0ff', '#e040fb', '#ffffff'];
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: Math.random() * 10 - 5,
        life: 1,
        decay: Math.random() * 0.015 + 0.008
      });
    }
  }

  triggerFireworks() {
    const count = 5;
    for (let f = 0; f < count; f++) {
      setTimeout(() => {
        const targetX = Math.random() * (this.canvas.width * 0.8) + this.canvas.width * 0.1;
        const targetY = Math.random() * (this.canvas.height * 0.5) + this.canvas.height * 0.1;
        this.createExplosion(targetX, targetY);
      }, f * 300);
    }
  }

  createExplosion(x, y) {
    const hue = Math.random() * 360;
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: `hsl(${hue}, 100%, 65%)`,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw floating hearts
    this.hearts.forEach(h => {
      h.y -= h.speedY;
      h.x += Math.sin(h.y * 0.02) * 0.5;
      if (h.y < -30) {
        h.y = this.canvas.height + 20;
        h.x = Math.random() * this.canvas.width;
      }
      this.drawHeart(this.ctx, h.x, h.y, h.size, h.color, h.opacity);
    });

    // Update and draw Confetti
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.rotation += p.rSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    // Update and draw Fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.05;
      fw.alpha -= fw.decay;

      if (fw.alpha <= 0) {
        this.fireworks.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = fw.alpha;
      this.ctx.fillStyle = fw.color;
      this.ctx.beginPath();
      this.ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

window.ParticleEngine = ParticleEngine;
