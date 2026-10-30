(() => {
  const canvas = document.querySelector('.pixel-canvas');
  const stage = document.querySelector('.pixel-stage');
  const hero = document.querySelector('.hero-motion');
  const context = canvas?.getContext('2d');
  if (!context) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const size = 500;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  context.scale(ratio, ratio);
  const ease = value => 1 - Math.pow(1 - Math.max(0, Math.min(1, value)), 4);
  const mix = (a, b, t) => a + (b - a) * t;
  // A seeded distribution keeps the composition stable across reloads.
  let seed = 187;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  async function initialize() {
    const mark = new Image();
    mark.src = 'assets/diarva-tech-d-white.svg';
    await mark.decode();
    await document.fonts.ready;
    const mask = document.createElement('canvas');
    mask.width = size;
    mask.height = size;
    const maskContext = mask.getContext('2d', { willReadFrequently: true });
    if (!maskContext) return;
    // Sample the actual approved mark rather than approximating its silhouette.
    maskContext.drawImage(mark, 115, 67, 270, 262);
    maskContext.fillStyle = '#fff';
    maskContext.textAlign = 'center';
    maskContext.font = '600 32px "Space Grotesk", Arial, sans-serif';
    maskContext.fillText('DIARVA TECH', 250, 392);
    const pixels = maskContext.getImageData(0, 0, size, size).data;
    const particles = [];
    for (let y = 25; y < 430; y += y < 350 ? 6 : 2) {
      const spacing = y < 350 ? 6 : 2;
      for (let x = 25; x < 475; x += spacing) {
        if (pixels[(y * size + x) * 4 + 3] < 90) continue;
        const angle = random() * Math.PI * 2;
        const radius = 145 + random() * 170;
        particles.push({ x, y, pixelSize: spacing - .3, startX: 250 + Math.cos(angle) * radius,
          startY: 250 + Math.sin(angle) * radius, delay: random() * 1000,
          drift: random() * Math.PI * 2, shade: 185 + Math.floor(random() * 70) });
      }
    }
    if (!particles.length) return;
    function draw(time) {
      context.clearRect(0, 0, size, size);
      const phase = time % 12000;
      particles.forEach(particle => {
        let assembled;
        if (phase < 4700) assembled = ease((phase - 500 - particle.delay) / 3000);
        else if (phase < 8200) assembled = 1;
        else assembled = 1 - ease((phase - 8200 - particle.delay * .5) / 2700);
        const driftX = Math.sin(time * .0005 + particle.drift) * 12;
        const driftY = Math.cos(time * .0004 + particle.drift) * 12;
        const x = mix(particle.startX + driftX, particle.x, assembled);
        const y = mix(particle.startY + driftY, particle.y, assembled);
        const square = mix(1.3, particle.pixelSize, assembled);
        context.globalAlpha = mix(.25, 1, assembled);
        const white = Math.round(mix(particle.shade, 245, assembled));
        context.fillStyle = `rgb(${white},${white},${white})`;
        context.fillRect(x - square / 2, y - square / 2, square, square);
      });
      context.globalAlpha = 1;
    }
    let elapsed = 0;
    let previous = null;
    let inView = true;
    draw(reducedMotion.matches ? 6000 : 0);
    stage.classList.add('pixels-ready');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { inView = entries[0].isIntersecting; },
        { threshold: 0 }).observe(canvas);
    }
    let staticFrameShown = reducedMotion.matches;
    function frame(timestamp) {
      const delta = previous === null ? 0 : Math.min(timestamp - previous, 60);
      previous = timestamp;
      if (reducedMotion.matches) {
        if (!staticFrameShown) draw(6000);
        staticFrameShown = true;
      } else {
        staticFrameShown = false;
        if (!hero.classList.contains('motion-paused') && inView && !document.hidden) {
          elapsed += delta;
          draw(elapsed);
        }
      }
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }
  // The original SVG and wordmark remain visible if canvas or font loading fails.
  initialize().catch(() => {});
})();
