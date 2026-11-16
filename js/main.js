/* HEREDEROS · interacciones generales */
(() => {
  'use strict';
  const RATE = Math.pow(3412 * 6, 1 / 1052) - 1;          // 0,948 % anual: 2 meses (1726) → 3.412 años (2778)
  const SEC_YEAR = 31557600;
  const fmt = (n, d = 0) => n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
  window.HEREDEROS = { RATE, fmt, sentenceAt: (orig, from, to = 2778) => orig * Math.pow(1 + RATE, to - from) };

  /* Contador en vivo de la condena de Barry */
  const live = document.getElementById('live-debt');
  const t0 = performance.now();
  const perSec = 3412 * Math.log(1 + RATE) / SEC_YEAR;
  let silent = false;
  (function tick() {
    if (!silent && live) live.textContent = fmt(3412 + perSec * (performance.now() - t0) / 1000, 6);
    requestAnimationFrame(tick);
  })();

  /* Códigos de barras */
  window.drawBarcode = (svg, seed = 7741) => {
    let s = seed, x = 0, out = '';
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    while (x < 180) {
      const w = [1, 1, 2, 3][Math.floor(rnd() * 4)];
      if (rnd() > 0.4) out += `<rect x="${x}" y="0" width="${w}" height="30"/>`;
      x += w + 1 + Math.floor(rnd() * 2);
    }
    svg.setAttribute('viewBox', '0 0 180 30');
    svg.innerHTML = out;
  };
  document.querySelectorAll('svg.barcode').forEach(s => drawBarcode(s));

  /* Terminal de D.I.O.S. */
  const lines = [
    'SUJETO 7741-B. DE PIE.',
    'RACIÓN: 800 CAL. TAREA: GENERACIÓN.',
    'PAREJA ASIGNADA: SUJETO 3308-A.',
    'Buenos días, Lía.',
    'CONDENA ORIGINAL: 2 MESES.',
    'CONDENA ACTUAL: 3.412 AÑOS.',
    'VEREDICTO: CULPABLE. DELIBERACIÓN: 0,3 S.',
    'SALDO INSUFICIENTE.',
    'RECALCULANDO LINAJE…',
    'DEUDA ENCONTRADA.'
  ];
  const out = document.getElementById('term-out');
  const clock = document.getElementById('term-clock');
  setInterval(() => { if (clock) clock.textContent = new Date().toTimeString().slice(0, 8); }, 1000);
  let li = 0, shown = [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function typeLine() {
    if (!out) return;
    const line = lines[li % lines.length]; li++;
    let i = 0;
    const step = () => {
      if (silent) { setTimeout(step, 400); return; }
      i++;
      const cur = '> ' + line.slice(0, i);
      out.innerHTML = [...shown, cur].map(esc).join('\n') + '<span class="c"></span>';
      if (i < line.length) setTimeout(step, reduce ? 0 : 28 + Math.random() * 40);
      else { shown.push('> ' + line); if (shown.length > 6) shown.shift(); setTimeout(typeLine, 1300); }
    };
    step();
  }
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (out) { shown = lines.slice(0, 3).map(l => '> ' + l); li = 3; typeLine(); }

  /* Curva de la deuda */
  const svg = document.getElementById('debt-chart');
  const range = document.getElementById('debt-range');
  if (svg && range) {
    const W = 800, H = 320, L = 56, R = 16, T = 16, B = 34;
    const x = y => L + (y - 1726) / (2778 - 1726) * (W - L - R);
    const yv = v => { const lo = Math.log10(0.1), hi = Math.log10(10000); return T + (1 - (Math.log10(v) - lo) / (hi - lo)) * (H - T - B); };
    const val = y => (2 / 12) * Math.pow(1 + RATE, y - 1726);
    let p = '';
    for (let y = 1726; y <= 2778; y += 4) p += (p ? 'L' : 'M') + x(y).toFixed(1) + ',' + yv(val(y)).toFixed(1);
    let g = '';
    [0.1, 1, 10, 100, 1000, 10000].forEach(v => {
      g += `<line x1="${L}" x2="${W - R}" y1="${yv(v)}" y2="${yv(v)}" stroke="#23272B"/>`;
      g += `<text x="${L - 8}" y="${yv(v) + 4}" text-anchor="end">${fmt(v, v < 1 ? 1 : 0)}</text>`;
    });
    [1726, 1900, 2100, 2300, 2500, 2778].forEach(y => g += `<text x="${x(y)}" y="${H - 10}" text-anchor="middle">${y}</text>`);
    svg.innerHTML = `${g}
      <rect x="${x(2140)}" y="${T}" width="${x(2187) - x(2140)}" height="${H - T - B}" fill="#3A3F44" opacity=".35"/>
      <line x1="${L}" x2="${W - R}" y1="${yv(60)}" y2="${yv(60)}" stroke="#C8A15A" stroke-dasharray="5 4"/>
      <text x="${L + 8}" y="${yv(60) - 7}" style="fill:#C8A15A">una vida ≈ 60 años</text>
      <path d="${p}L${x(2778)},${H - B}L${x(1726)},${H - B}Z" fill="rgba(229,38,43,.10)"/>
      <path d="${p}" fill="none" stroke="#E5262B" stroke-width="2.5"/>
      <line id="dc-v" y1="${T}" y2="${H - B}" stroke="#E9E4DA" stroke-opacity=".5"/>
      <circle id="dc-p" r="6" fill="#E9E4DA" stroke="#E5262B" stroke-width="2"/>`;
    const yearEl = document.getElementById('debt-year'), valEl = document.getElementById('debt-val'), note = document.getElementById('debt-note');
    const human = yrs => {
      if (yrs < 1) { const m = yrs * 12; return m < 1 ? `${fmt(yrs * 365)} días` : `${fmt(m, 1)} meses`; }
      return `${fmt(yrs, yrs < 10 ? 1 : 0)} años`;
    };
    const update = () => {
      const y = +range.value, v = val(y);
      yearEl.textContent = y; valEl.textContent = human(v);
      svg.querySelector('#dc-v').setAttribute('x1', x(y)); svg.querySelector('#dc-v').setAttribute('x2', x(y));
      svg.querySelector('#dc-p').setAttribute('cx', x(y)); svg.querySelector('#dc-p').setAttribute('cy', yv(v));
      note.textContent = y < 2191 ? 'Todavía nadie la cobra. D.I.O.S. no existe.'
        : v < 60 ? 'Todavía se podría cumplir en una vida.'
        : `Equivale a ${fmt(v / 60)} vidas humanas de prisión.`;
    };
    range.addEventListener('input', update); update();
  }

  /* Sonido: zumbido eléctrico de D.I.O.S. */
  let ctx, hum;
  const bS = document.getElementById('btn-sound');
  bS && bS.addEventListener('click', () => {
    const on = bS.getAttribute('aria-pressed') !== 'true';
    bS.setAttribute('aria-pressed', on);
    if (on) {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(ctx.destination);
      const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 50;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 100.6;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180;
      o1.connect(f); o2.connect(f); f.connect(g); o1.start(); o2.start();
      g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.5);
      hum = { g, o: [o1, o2] };
    } else if (hum) {
      hum.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      const h = hum; setTimeout(() => h.o.forEach(o => o.stop()), 500); hum = null;
    }
  });

  /* Modo Silencio */
  const bQ = document.getElementById('btn-silence'), bo = document.getElementById('blackout'), hud = document.getElementById('hud-line'), vid = document.getElementById('hero-video');
  bQ && bQ.addEventListener('click', () => {
    silent = bQ.getAttribute('aria-pressed') !== 'true';
    bQ.setAttribute('aria-pressed', silent);
    bo.classList.add('on');
    setTimeout(() => {
      document.body.classList.toggle('silencio', silent);
      if (hud) hud.textContent = silent ? 'SECTOR CENIZA · AÑO 2778 · SIN SEÑAL' : 'SECTOR CENIZA · AÑO 2778 · D.I.O.S. EN LÍNEA';
      if (vid) silent ? vid.pause() : vid.play().catch(() => {});
      if (hum && silent) bS.click();
      bo.classList.remove('on');
    }, silent ? 900 : 300);
  });
})();
