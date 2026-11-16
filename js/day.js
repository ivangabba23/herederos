/* HEREDEROS · Un día en 2778
   Segunda parte de la Auditoría: según tu linaje vivís un día en el mundo, llega el Silencio
   y terminás cruzándote con Barry o con Lía. Escenas con video, decisiones y mini juegos. */
(() => {
  'use strict';
  const stage = document.getElementById('stage');
  if (!stage) return;
  const vid = stage.querySelector('.stage-vid');
  const ui = stage.querySelector('#stage-ui');
  const chap = stage.querySelector('#stage-chap');
  const flash = stage.querySelector('.stage-flash');
  const muteBtn = stage.querySelector('#stage-mute');
  const V = n => `assets/game/${n}.mp4`;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduced() ? Math.min(ms, 200) : ms));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let run = 0, muted = false, P = {};

  /* ---------- sonido ---------- */
  const sfx = {};
  ['beep', 'denied', 'hit', 'electric', 'riser', 'woosh', 'blip'].forEach(n => { const a = new Audio(`assets/sfx/${n}.mp3`); a.preload = 'auto'; sfx[n] = a; });
  function play(n, vol = .7) { if (muted || !sfx[n]) return; try { const a = sfx[n].cloneNode(); a.volume = vol; a.play().catch(() => {}); } catch (e) {} }
  let hum = null;
  function humOn() {
    if (muted || hum) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const g = ctx.createGain(); g.gain.value = .0001; g.connect(ctx.destination);
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160;
      o.connect(f); f.connect(g); o.start(); g.gain.exponentialRampToValueAtTime(.035, ctx.currentTime + 1.2);
      hum = { ctx, g, o };
    } catch (e) {}
  }
  function humOff(fast) {
    if (!hum) return;
    const h = hum; hum = null;
    try { h.g.gain.cancelScheduledValues(h.ctx.currentTime); h.g.gain.setValueAtTime(fast ? .0001 : h.g.gain.value, h.ctx.currentTime); if (!fast) h.g.gain.exponentialRampToValueAtTime(.0001, h.ctx.currentTime + .4); setTimeout(() => { h.o.stop(); h.ctx.close(); }, 500); } catch (e) {}
  }
  muteBtn.addEventListener('click', () => {
    muted = !muted; muteBtn.setAttribute('aria-pressed', muted); muteBtn.textContent = muted ? 'Sonido: no' : 'Sonido: sí';
    if (muted) humOff(true);
  });

  /* ---------- primitivas de escena ---------- */
  const alive = id => id === run;
  async function clip(name, { loop = true, rate = 1 } = {}) {
    vid.classList.remove('on');
    await sleep(350);
    vid.src = V(name); vid.loop = loop; vid.playbackRate = rate;
    try { await vid.play(); } catch (e) {}
    vid.classList.add('on');
  }
  function chapter(time, place) {
    chap.innerHTML = `<span class="t">${time}</span><span class="p">${place}</span>`;
    chap.classList.remove('in'); void chap.offsetWidth; chap.classList.add('in');
    play('woosh', .4);
  }
  function clearUI() { ui.innerHTML = ''; }
  async function line(text, kind = 'nar', hold = 1600) {
    const id = run;
    const el = document.createElement('p');
    el.className = `ln ${kind}`;
    ui.appendChild(el);
    while (ui.children.length > 3) ui.firstElementChild.remove();
    if (kind.startsWith('dios')) play('blip', .35);
    for (let i = 1; i <= text.length; i++) {
      if (!alive(id)) return;
      el.textContent = text.slice(0, i);
      await sleep(kind.startsWith('dios') ? 26 : 18);
    }
    await sleep(hold);
  }
  function choice(opts, { timer = 0 } = {}) {
    return new Promise(res => {
      const box = document.createElement('div'); box.className = 'ch';
      box.innerHTML = opts.map((o, i) => `<button type="button" data-i="${i}"><span>${'ABC'[i]}</span>${esc(o)}</button>`).join('') +
        (timer ? `<i class="ch-timer" style="animation-duration:${timer}ms"></i>` : '');
      ui.appendChild(box);
      let done = false;
      const finish = i => { if (done) return; done = true; play('beep', .35); box.querySelectorAll('button').forEach((b, k) => b.classList.add(k === i ? 'pick' : 'off')); setTimeout(() => { box.remove(); res(i); }, 450); };
      box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => finish(+b.dataset.i)));
      box.querySelector('button').focus({ preventScroll: true });
      if (timer) setTimeout(() => finish(-1), timer);
    });
  }
  function next(label = 'Seguir') {
    return new Promise(res => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-ghost nx'; b.textContent = label;
      ui.appendChild(b); b.focus({ preventScroll: true });
      b.addEventListener('click', () => { b.remove(); res(); });
    });
  }
  function hold(label, ms = 1400) {
    return new Promise(res => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'holdbtn';
      b.innerHTML = `<i></i><span>${esc(label)}</span>`;
      ui.appendChild(b); b.focus({ preventScroll: true });
      let t0 = 0, raf = 0, done = false;
      const fill = b.querySelector('i');
      const loop = () => { const p = Math.min(1, (performance.now() - t0) / ms); fill.style.transform = `scaleX(${p})`; if (p >= 1) { done = true; b.remove(); res(); } else raf = requestAnimationFrame(loop); };
      const down = e => { e.preventDefault(); if (done) return; t0 = performance.now(); raf = requestAnimationFrame(loop); };
      const up = () => { if (done) return; cancelAnimationFrame(raf); fill.style.transform = 'scaleX(0)'; };
      b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up);
      b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !t0) down(e); });
      b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { up(); t0 = 0; } });
    });
  }
  /* mini juego: Generación. Un pulso recorre la barra; tocá cuando esté en la zona. */
  function rhythm(beats = 8) {
    return new Promise(res => {
      const box = document.createElement('div'); box.className = 'rh';
      box.innerHTML = `<div class="rh-track"><span class="rh-zone"></span><span class="rh-dot"></span></div>
        <div class="rh-row"><button type="button" class="btn btn-red rh-btn">Pisar · Espacio</button><span class="rh-stat mono">0 / ${beats}</span></div>
        <div class="rh-meter"><i></i></div>`;
      ui.appendChild(box);
      const dot = box.querySelector('.rh-dot'), stat = box.querySelector('.rh-stat'), meter = box.querySelector('.rh-meter i'), btn = box.querySelector('.rh-btn');
      let hits = 0, n = 0, t0 = performance.now(), period = 1100, hitThis = false, raf;
      const pos = () => ((performance.now() - t0) % period) / period;
      const tick = () => {
        const p = pos(); dot.style.left = `${p * 100}%`;
        const beat = Math.floor((performance.now() - t0) / period);
        if (beat > n) { n = beat; hitThis = false; stat.textContent = `${hits} / ${beats}`; if (n >= beats) return end(); }
        raf = requestAnimationFrame(tick);
      };
      const press = () => {
        if (hitThis) return; hitThis = true;
        const p = pos(), ok = p > .62 && p < .82;
        box.classList.remove('ok', 'ko'); void box.offsetWidth; box.classList.add(ok ? 'ok' : 'ko');
        if (ok) { hits++; play('blip', .4); meter.style.width = `${hits / beats * 100}%`; } else play('beep', .25);
        stat.textContent = `${hits} / ${beats}`;
      };
      const key = e => { if (e.code === 'Space') { e.preventDefault(); press(); } };
      const end = () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', key); setTimeout(() => { box.remove(); res(hits); }, 300); };
      btn.addEventListener('pointerdown', e => { e.preventDefault(); press(); });
      document.addEventListener('keydown', key);
      btn.focus({ preventScroll: true });
      raf = requestAnimationFrame(tick);
    });
  }
  function qte(label, ms) {
    return new Promise(res => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'qte';
      b.innerHTML = `${esc(label)}<i style="animation-duration:${ms}ms"></i>`;
      ui.appendChild(b); b.focus({ preventScroll: true });
      let done = false;
      const fin = ok => { if (done) return; done = true; b.remove(); res(ok); };
      b.addEventListener('click', () => fin(true));
      setTimeout(() => fin(false), ms);
    });
  }
  async function doFlash(color = '#fff', ms = 160) { flash.style.background = color; flash.classList.add('on'); await sleep(ms); flash.classList.remove('on'); }
  async function black(on) { stage.classList.toggle('dark', on); await sleep(on ? 900 : 400); }

  /* ---------- guion ---------- */
  async function debtDay() {
    const id = run;
    chapter('05:00', 'Dormitorios Verticales · −60 m');
    await clip('capsule');
    if (!alive(id)) return;
    play('beep', .5);
    await line(`SUJETO ${P.sid}. DE PIE.`, 'dios red', 700);
    await hold('Mantené apretado para levantarte');
    if (!alive(id)) return;

    clearUI(); chapter('06:00', 'Sala de Generación · −120 m');
    await clip('b_tread');
    await line('RACIÓN: 800 CAL. TAREA: GENERACIÓN.', 'dios red', 500);
    await line('Pisá cuando la luz pase por la zona marcada.', 'hint', 200);
    const hits = await rhythm(8);
    if (!alive(id)) return;
    clearUI();
    await line(`ENERGÍA ENTREGADA: ${(hits * 0.04).toFixed(2).replace('.', ',')} kWh.`, 'dios red', 400);
    await line('CONDENA DESCONTADA: 0 AÑOS.', 'dios red', 900);
    await line('El trabajo no paga la condena. Paga la ración.', 'nar', 1200);
    await next();
    if (!alive(id)) return;

    clearUI(); chapter('20:00', 'La Despensa · Nivel del Orden');
    await clip('woman');
    await line('Tenés la ración de mañana. Tu pareja asignada, el Sujeto 3308-A, tiene fiebre.', 'nar', 600);
    const c = await choice(['Llevar pan', 'Llevar medicina', 'No llevar nada y volver']);
    if (!alive(id)) return;
    if (c === 2) {
      await line('Volvés sin nada. Mañana va a ser igual.', 'nar', 1200);
    } else {
      await clip('scanner', { loop: false });
      play('denied', .7);
      await doFlash('rgba(229,38,43,.35)', 220);
      await line('SALDO INSUFICIENTE.', 'dios red', 900);
      await clip('guards');
      await line('Los guardias de la Despensa se ríen. Vienen de deudas chicas: reírse es su forma de no volver abajo.', 'nar', 1400);
    }
    await next('Terminar el día');
  }

  async function meritDay() {
    const id = run;
    chapter('09:00', 'La Cumbre · +900 m');
    await clip('meritwake');
    if (!alive(id)) return;
    await line(`Buenos días, ${P.nice}.`, 'dios grn', 700);
    await line('¿Qué querés hacer hoy?', 'dios grn', 200);
    const c1 = await choice(['Lo que D.I.O.S. sugiera', 'Algo distinto']);
    if (!alive(id)) return;
    if (c1 === 1) await line('NO HAY NADA DISTINTO. SUGERENCIA APLICADA.', 'dios grn', 1100);
    else await line('SUGERENCIA APLICADA. QUE DISFRUTES TU DÍA.', 'dios grn', 1100);

    clearUI(); chapter('13:00', 'Jardines colgantes');
    await clip('vitrina');
    await line('En la terraza, una Vitrina. Adentro, una mujer sonríe sin parar. Arriba, un contador: 2.550 espectadores.', 'nar', 600);
    const c2 = await choice(['Mirar el espectáculo', 'Pedir que la liberen', 'Darle la espalda']);
    if (!alive(id)) return;
    if (c2 === 0) await line('2.551 ESPECTADORES. GRACIAS POR TU ATENCIÓN.', 'dios grn', 1200);
    if (c2 === 1) { play('denied', .5); await line('SOLICITUD DENEGADA. SU CONDENA ES ENTRETENERTE.', 'dios grn', 1200); }
    if (c2 === 2) await line('La mujer sigue sonriendo. Nadie le dijo que podía parar.', 'nar', 1300);
    await next();
    if (!alive(id)) return;

    clearUI(); chapter('21:00', 'La Recalculación');
    await clip('05_seal');
    await line('RECALCULANDO LINAJE…', 'dios red', 600);
    play('electric', .6); await doFlash('rgba(229,38,43,.4)', 260);
    await line('DEUDA ENCONTRADA.', 'dios red', 900);
    await line('Tu sello titila en rojo. Por primera vez, sentís lo que sienten abajo.', 'nar', 1300);
    await next('Seguir');
  }

  async function silence() {
    const id = run;
    clearUI(); chapter('23:47', 'El Silencio');
    play('riser', .6);
    await clip('blackout_city', { loop: false });
    await sleep(1200);
    vid.classList.add('powerdown'); play('electric', .7);
    await sleep(3200);
    vid.classList.remove('powerdown');
    if (!alive(id)) return;
    humOff(true);
    vid.pause();
    await black(true);
    await line('Y entonces, todo se apagó.', 'nar center', 1600);
    await line('D.I.O.S. FUERA DE LÍNEA', 'dios center dim', 1200);
    await next('Seguir');
    if (!alive(id)) return;
    await black(false);

    clearUI(); chapter('23:52', 'Sin nadie que decida');
    await clip('06_guard');
    await line('Por primera vez en tu vida, nadie te dice qué hacer. Tenés seis segundos.', 'nar', 300);
    const c = await choice(['Entrar a la Despensa', 'Esconderte', 'Buscar a alguien'], { timer: 6000 });
    if (!alive(id)) return;
    if (c === -1) {
      await line('No decidiste. Nunca te habían enseñado a hacerlo.', 'nar', 900);
      await clip('crowd');
      await line('La multitud decide por vos y te arrastra a la calle.', 'nar', 1100);
    } else if (c === 0) {
      await clip('07_door', { loop: false }); play('hit', .5); await sleep(1400);
      await clip('loot');
      await line('Todos toman todo. Nadie sabe cuánto es suficiente.', 'nar', 1200);
    } else {
      await clip('crowd');
      await line(c === 1 ? 'Te pasan por al lado cientos de personas que nunca habían corrido.' : 'Buscás una cara conocida. Todas las caras son nuevas.', 'nar', 1200);
    }
    if (!alive(id)) return;

    clearUI(); chapter('23:58', 'La línea del Orden');
    await clip('08_riot');
    await line('La Guardia forma una línea. Nadie le dio la orden. Nadie le dijo que no.', 'nar', 300);
    await clip('09_fire', { loop: false });
    await sleep(900);
    play('hit', .8);
    await line('¡FUEGO!', 'shout', 50);
    const ok = await qte('¡Agachate!', 1700);
    if (!alive(id)) return;
    await doFlash(ok ? '#fff' : 'rgba(229,38,43,.6)', 180);
    await line(ok ? 'Las balas pasan por encima tuyo.' : 'Algo te roza el hombro. Seguís de pie.', 'nar', 1200);
    await next();
  }

  async function crossing() {
    const id = run;
    clearUI(); chapter('00:03', 'El cruce');
    await clip('10_cross', { loop: false, rate: .8 });
    await line('Entre el humo, alguien te mira.', 'nar', 900);
    await line(P.merit
      ? 'Es un hombre de gris. El código rojo de su cuello sigue brillando, pero ya no hay nadie que lo lea.'
      : 'Es una mujer de blanco. El sello verde de su muñeca sigue brillando, pero ya no hay nadie que lo lea.', 'nar', 1400);
    await line('Ya no había mérito, ni deuda.', 'nar', 900);
    await line('Solo dos personas, mirándose por primera vez.', 'nar', 1800);
    if (!alive(id)) return;
    clearUI();
    stage.classList.add('ending');
    ui.innerHTML = `<div class="endcard">
      <p class="kick">Fin de la auditoría · ${esc(P.merit ? P.nice : 'Sujeto ' + P.sid)}</p>
      <h2 class="end-title">HEREDEROS</h2>
      <p class="end-sub">Usá la IA con criterio. Antes de que olvides cómo vivir sin ella.</p>
      <div class="res-actions"><button class="btn btn-red" id="end-film" type="button">Ver el corto</button><button class="btn btn-ghost" id="end-again" type="button">Volver a jugar</button></div></div>`;
    ui.querySelector('#end-film').addEventListener('click', () => { close(); document.getElementById('corto')?.scrollIntoView({ behavior: 'smooth' }); });
    ui.querySelector('#end-again').addEventListener('click', () => { close(); window.HEREDEROS.restartAudit && window.HEREDEROS.restartAudit(); });
  }

  /* ---------- abrir / cerrar ---------- */
  async function start(p) {
    P = p; run++;
    stage.hidden = false; stage.classList.remove('dark', 'ending');
    document.body.classList.add('audit-open');
    requestAnimationFrame(() => stage.classList.add('open'));
    clearUI(); humOn();
    const id = run;
    if (p.merit) await meritDay(); else await debtDay();
    if (!alive(id)) return;
    humOn();
    await silence();
    if (!alive(id)) return;
    await crossing();
  }
  function close() {
    run++; humOff(true); vid.pause(); vid.removeAttribute('src'); vid.load();
    stage.classList.remove('open', 'dark', 'ending'); stage.hidden = true;
    if (!document.getElementById('auditoria')?.classList.contains('is-full')) document.body.classList.remove('audit-open');
  }
  stage.querySelector('#stage-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !stage.hidden) { e.stopImmediatePropagation(); close(); } }, true);
  window.HEREDEROS_DAY = { start, close };
})();
