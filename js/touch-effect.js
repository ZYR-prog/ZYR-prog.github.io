/* 手机端手指滑动星光拖尾特效 */
(function () {
  // 只在触屏设备（手机/平板）上启用
  var isTouchDevice =
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (!isTouchDevice) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var stars = [];
  var rafId = null;
  var dpr = window.devicePixelRatio || 1;
  var lastPos = {};

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var COLORS = ['#ffc848', '#ff9f43', '#ff6b6b', '#4ecdc4', '#5b8def', '#c084fc', '#ffffff'];
  var MAX_STARS = 220;

  function addStar(x, y) {
    if (stars.length >= MAX_STARS) stars.shift();
    stars.push({
      x: x,
      y: y,
      // 星星半径 4~8px
      size: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      // 约 1 秒内淡出消失
      decay: 0.014 + Math.random() * 0.006,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.06,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 + 0.15
    });
  }

  // 在两点之间按距离补点，滑动越快星星越密
  function spawnAlong(x0, y0, x1, y1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var step = 9;
    var count = Math.min(Math.max(Math.floor(dist / step), 1), 8);
    for (var i = 0; i < count; i++) {
      var t = count === 1 ? 1 : i / (count - 1);
      addStar(x0 + dx * t, y0 + dy * t);
    }
  }

  function touchStart(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      lastPos[t.identifier] = { x: t.clientX, y: t.clientY };
      addStar(t.clientX, t.clientY);
    }
    startLoop();
  }

  function touchMove(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var last = lastPos[t.identifier];
      if (last) {
        spawnAlong(last.x, last.y, t.clientX, t.clientY);
      } else {
        addStar(t.clientX, t.clientY);
      }
      lastPos[t.identifier] = { x: t.clientX, y: t.clientY };
    }
    startLoop();
  }

  function touchEnd(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      delete lastPos[e.changedTouches[i].identifier];
    }
  }

  function drawStar(cx, cy, r, rot) {
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var radius = i % 2 === 0 ? r : r * 0.34;
      var ang = rot + (Math.PI / 4) * i - Math.PI / 2;
      var px = cx + Math.cos(ang) * radius;
      var py = cy + Math.sin(ang) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = stars.length - 1; i >= 0; i--) {
      var s = stars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.004;
      s.rot += s.spin;
      s.life -= s.decay;
      if (s.life <= 0) {
        stars.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(s.life, 0);
      ctx.fillStyle = s.color;
      drawStar(s.x, s.y, s.size * s.life, s.rot);
    }
    ctx.globalAlpha = 1;
    if (stars.length) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('touchstart', touchStart, { passive: true });
  document.addEventListener('touchmove', touchMove, { passive: true });
  document.addEventListener('touchend', touchEnd, { passive: true });
  document.addEventListener('touchcancel', touchEnd, { passive: true });
})();
