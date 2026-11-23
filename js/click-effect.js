/* 点击彩色粒子爆炸特效 */
(function () {
  // 只在非触屏设备（电脑）上启用，手机端使用滑动特效
  var isTouchDevice =
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isTouchDevice) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var particles = [];
  var rafId = null;
  var dpr = window.devicePixelRatio || 1;
  var MAX_PARTICLES = 420;

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var COLORS = ['#ffc848', '#ff9f43', '#ff6b6b', '#4ecdc4', '#5b8def', '#c084fc', '#ffffff'];

  function spawn(x, y) {
    var count = 22 + Math.floor(Math.random() * 8);
    for (var i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      // 爆炸飞散速度（半径比之前缩小一半）
      var speed = 0.6 + Math.random() * 1.4;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        // 圆润卡通粒子：半径 2.5~4.5px
        size: 2.5 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
        // 约 4.5 秒完全炸完
        decay: 0.0035 + Math.random() * 0.0006,
        gravity: 0.035
      });
    }
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, Math.max(p.life, 0) * 1.6);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // 前 70% 的时间保持饱满圆润，最后阶段才缩小消失
      ctx.arc(p.x, p.y, p.size * (0.35 + 0.65 * p.life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (particles.length) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      spawn(e.clientX, e.clientY);
    },
    { passive: true }
  );
})();
