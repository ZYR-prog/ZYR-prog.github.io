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

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var COLORS = ['#ffc848', '#ff9f43', '#ff6b6b', '#4ecdc4', '#5b8def', '#c084fc', '#ffffff'];

  function spawn(x, y) {
    var count = 18 + Math.floor(Math.random() * 8);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      // 爆炸扩散速度（放慢）
      var speed = 1.2 + Math.random() * 2.8;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        // 粒子半径（缩小为原来的一半）
        size: 0.75 + Math.random() * 1.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
        // 约 2 秒完全消失
        decay: 0.0075 + Math.random() * 0.002,
        gravity: 0.05
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
      p.vx *= 0.99;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
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
