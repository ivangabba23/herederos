/* HEREDEROS · Auditoría de Sangre
   El visitante decide por cinco antepasados (1726 → 2161). D.I.O.S. escanea el árbol
   hacia atrás, cobra cada falta con interés compuesto y emite un registro de linaje. */
(() => {
  'use strict';
  const { RATE, fmt, sentenceAt } = window.HEREDEROS;
  const panel = document.getElementById('audit-panel');
  const svg = document.getElementById('tree');
  if (!panel || !svg) return;

  const GENS = [
    { year: 1726, who: 'Tu antepasado, campesino.',
      situ: 'La cosecha fue mala y el recaudador del rey llega mañana al pueblo.',
      opts: [
        { t: 'Esconde unas monedas debajo de un tablón del piso.', crime: 'Evasión al recaudador', m: 2 / 12, short: 'escondió monedas' },
        { t: 'Paga todo. Su familia pasa el invierno con hambre.', short: 'pagó todo' },
        { t: 'Denuncia a un vecino que escondía grano, a cambio de una rebaja.', short: 'delató a un vecino', note: 'D.I.O.S. registra la delación como virtud.' } ] },
    { year: 1847, who: 'Tu antepasada, obrera textil.',
      situ: 'Su hijo lleva tres días sin comer. Falta una semana para la paga.',
      opts: [
        { t: 'Roba un pan del mercado.', crime: 'Hurto de alimento', m: 3 / 52, short: 'robó un pan' },
        { t: 'Pide un adelanto y acepta jornadas de 16 horas.', short: 'trabajó 16 horas' },
        { t: 'Organiza una huelga con sus compañeras.', crime: 'Alteración del orden', m: 1 / 12, short: 'organizó una huelga' } ] },
    { year: 1931, who: 'Tu antepasado, empleado de correo.',
      situ: 'Lo citan como testigo en el juicio de su mejor amigo.',
      opts: [
        { t: 'Miente para salvarlo.', crime: 'Falso testimonio', m: 1, short: 'mintió por un amigo' },
        { t: 'Dice la verdad. Su amigo va preso.', short: 'dijo la verdad' },
        { t: 'No se presenta al juicio.', crime: 'Desacato', m: 2 / 12, short: 'no se presentó' } ] },
    { year: 2067, who: 'Tu antepasada, programadora.',
      situ: 'Llega el nuevo impuesto digital: se cobra por cada dato que producís.',
      opts: [
        { t: 'Usa un programa para ocultar sus datos.', crime: 'Evasión digital', m: 6 / 12, short: 'ocultó sus datos' },
        { t: 'Paga y comparte todo.', short: 'compartió todo' },
        { t: 'Entra al registro y borra la deuda de todo su barrio.', crime: 'Intrusión en registro público', m: 3, short: 'borró deudas ajenas' } ] },
    { year: 2161, who: 'Tu antepasado, en plena Guerra de la Desconfianza.',
      situ: 'Lo reclutan para el frente del este.',
      opts: [
        { t: 'Deserta.', crime: 'Deserción', m: 5, short: 'desertó' },
        { t: 'Va al frente y pelea.', short: 'peleó' },
        { t: 'Esconde a una familia de refugiados en su sótano.', crime: 'Encubrimiento', m: 2, short: 'escondió refugiados' } ] }
  ];
  const BARRY = 3412;

  let name = '', answers = [];

  /* ---------- árbol ---------- */
  const Y = { 2778: 52, 2161: 142, 2067: 232, 1931: 322, 1847: 412, 1726: 502 };
  const X = { 2778: 210, 2161: 196, 2067: 226, 1931: 194, 1847: 224, 1726: 206 };
  const ORDER = [2778, 2161, 2067, 1931, 1847, 1726];
  function drawTree() {
    let s = '<defs><filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="scan" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E9E4DA" stop-opacity="0"/><stop offset="1" stop-color="#E9E4DA" stop-opacity=".35"/></linearGradient></defs>';
    // ramas colaterales (decorativas)
    ORDER.slice(1).forEach((y, i) => {
      const cx = X[y], cy = Y[y], k = i % 2 ? 1 : -1;
      [[-1, 0.0], [1, 0.0]].forEach(([d]) => {
        const sx = cx + d * (70 + (i * 13) % 30), sy = cy + 22;
        s += `<path d="M${cx},${cy} Q${(cx + sx) / 2},${cy + 4} ${sx},${sy}" stroke="#2a2f33" fill="none"/>`;
        s += `<circle cx="${sx}" cy="${sy}" r="4" fill="#0B0D0F" stroke="#2f3438"/>`;
        s += `<path d="M${sx},${sy} l${d * 34},${14 + k * 4}" stroke="#1f2326" fill="none"/><circle cx="${sx + d * 34}" cy="${sy + 14 + k * 4}" r="2.5" fill="#2a2f33"/>`;
      });
    });
    // tronco
    for (let i = 0; i < ORDER.length - 1; i++) {
      const a = ORDER[i], b = ORDER[i + 1];
      s += `<path id="trunk-${b}" class="tree-node" d="M${X[a]},${Y[a]} C${X[a]},${(Y[a] + Y[b]) / 2} ${X[b]},${(Y[a] + Y[b]) / 2} ${X[b]},${Y[b]}" stroke="#3A3F44" stroke-width="1.5" fill="none" stroke-dasharray="4 4"/>`;
    }
    ORDER.forEach(y => {
      const you = y === 2778;
      s += `<g id="n-${y}"><circle class="tree-node" cx="${X[y]}" cy="${Y[y]}" r="${you ? 13 : 9}" fill="#0B0D0F" stroke="#3A3F44" stroke-width="1.5" stroke-dasharray="${you ? '0' : '3 3'}"/>` +
        `<text x="${X[y] - (you ? 26 : 22)}" y="${Y[y] + 4}" text-anchor="end" font-size="13" fill="#8E9398">${y}</text>` +
        `<text class="lbl" x="${X[y] + (you ? 26 : 22)}" y="${Y[y] + 4}" font-size="11.5" fill="#E9E4DA"></text>` +
        `<text class="val" x="${X[y] + 22}" y="${Y[y] + 19}" font-size="10.5" fill="#8E9398"></text></g>`;
    });
    s += `<rect id="scanbar" x="0" y="-60" width="420" height="60" fill="url(#scan)" opacity="0"/><line id="scanline" x1="0" x2="420" y1="-1" y2="-1" stroke="#E9E4DA" stroke-opacity=".8" opacity="0"/>`;
    s += `<text x="${X[2778] + 26}" y="${Y[2778] - 18}" font-size="10" fill="#8E9398" letter-spacing="2">2778</text>`;
    svg.innerHTML = s;
    svg.querySelector('#n-2778 .lbl').textContent = 'VOS';
  }
  const node = y => svg.querySelector(`#n-${y}`);
  function markAnswered(y, txt) {
    const g = node(y); if (!g) return;
    const c = g.querySelector('circle'); c.setAttribute('stroke', '#E9E4DA'); c.setAttribute('stroke-dasharray', '0');
    g.querySelector('.lbl').textContent = txt;
    const tr = svg.querySelector(`#trunk-${y}`); if (tr) { tr.setAttribute('stroke', '#8E9398'); tr.setAttribute('stroke-dasharray', '0'); }
  }
  function markScanned(y, debt, valTxt) {
    const g = node(y); if (!g) return;
    const c = g.querySelector('circle');
    const col = debt ? '#E5262B' : '#39E58C';
    c.setAttribute('fill', debt ? '#E5262B' : '#0B0D0F'); c.setAttribute('stroke', col);
    if (debt) c.setAttribute('filter', 'url(#glow)');
    g.querySelector('.val').textContent = valTxt || '';
    g.querySelector('.val').setAttribute('fill', debt ? '#E5262B' : '#39E58C');
    const tr = svg.querySelector(`#trunk-${y}`); if (tr && debt) tr.setAttribute('stroke', '#E5262B');
  }
  function scanTo(y) {
    const bar = svg.querySelector('#scanbar'), line = svg.querySelector('#scanline');
    bar.setAttribute('opacity', 1); line.setAttribute('opacity', 1);
    bar.setAttribute('y', y - 60); line.setAttribute('y1', y); line.setAttribute('y2', y);
  }
  function scanOff() { svg.querySelector('#scanbar').setAttribute('opacity', 0); svg.querySelector('#scanline').setAttribute('opacity', 0); }

  /* ---------- utilidades ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const human = yrs => yrs < 1 ? (yrs * 12 < 1 ? `${fmt(yrs * 365)} días` : `${fmt(yrs * 12, 1)} meses`) : `${fmt(yrs, yrs < 10 ? 1 : 0)} años`;
  const hash = str => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const narrow = () => matchMedia('(max-width: 860px)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.min(ms, 60) : ms));

  /* ---------- pantallas ---------- */
  function intro() {
    answers = [];
    drawTree();
    panel.innerHTML = `
      <p class="kick">Auditoría de Sangre</p>
      <h2>¿Qué heredaste?</h2>
      <p class="situ">En 2191, D.I.O.S. revisó todos los árboles genealógicos hasta 1726 y cobró cada condena pendiente con intereses. Ahora es tu turno. Vas a decidir por cinco antepasados tuyos. Lo que hicieron sigue creciendo hoy.</p>
      <form id="audit-form" class="field" autocomplete="off">
        <label for="audit-name">Tu nombre</label>
        <input id="audit-name" name="audit-name" maxlength="24" placeholder="Como te llama tu familia" value="${esc(name)}">
      </form>
      <div class="res-actions"><button class="btn btn-red" id="audit-start" type="button">Iniciar auditoría</button></div>`;
    const go = () => { name = (panel.querySelector('#audit-name').value || '').trim().slice(0, 24) || 'Sin nombre'; ask(0); };
    panel.querySelector('#audit-start').addEventListener('click', go);
    panel.querySelector('#audit-form').addEventListener('submit', e => { e.preventDefault(); go(); });
  }

  function ask(i) {
    const g = GENS[i];
    const bars = GENS.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('');
    panel.innerHTML = `
      <div class="step"><span>GENERACIÓN ${i + 1} DE ${GENS.length}</span><span class="bars">${bars}</span></div>
      <div class="era">${g.year}</div>
      <p class="who">${g.who}</p>
      <p class="situ">${g.situ} ¿Qué hace?</p>
      <div class="opts">${g.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}"><span class="k">${'ABC'[k]}</span><span>${o.t}</span></button>`).join('')}</div>`;
    panel.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const o = g.opts[+b.dataset.k];
      answers[i] = o;
      markAnswered(g.year, o.short);
      i + 1 < GENS.length ? ask(i + 1) : scan();
    }));
    panel.querySelector('.opt').focus({ preventScroll: true });
    if (narrow()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function scan() {
    const id = name.toUpperCase();
    panel.innerHTML = `<p class="kick">D.I.O.S. · Auditoría en curso</p><div class="scan-line" id="scan-out"></div>`;
    const outEl = panel.querySelector('#scan-out');
    if (narrow()) svg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const say = async (html, ms = 520) => { outEl.innerHTML += html + '\n'; await sleep(ms); };
    await say(`> INICIANDO AUDITORÍA DE SANGRE`, 600);
    await say(`> SOLICITANTE: ${esc(id)}`, 500);
    scanTo(Y[2778]); await say(`> REVISANDO GENERACIONES HACIA ATRÁS…`, 700);
    const rows = [];
    for (let k = GENS.length - 1; k >= 0; k--) {
      const g = GENS[k], o = answers[k];
      scanTo(Y[g.year] + 14); await sleep(380);
      if (o.crime) {
        const now = sentenceAt(o.m, g.year);
        rows.push({ year: g.year, crime: o.crime, orig: o.m, now });
        markScanned(g.year, true, human(now));
        await say(`> ${g.year} · <span class="r">${esc(o.crime.toUpperCase())} · ${human(o.m)} → ${human(now)}</span>`, 560);
      } else {
        markScanned(g.year, false, 'limpio');
        await say(`> ${g.year} · <span class="g">SIN FALTAS</span>${o.note ? ' · ' + esc(o.note.toUpperCase()) : ''}`, 480);
      }
    }
    scanTo(560); await sleep(300); scanOff();
    await say(`> APLICANDO INTERÉS PENAL COMPUESTO: 0,948 % ANUAL`, 700);
    let total = rows.reduce((a, r) => a + r.now, 0);

    // Recalculación: un árbol limpio no está limpio para siempre
    let collateral = null;
    if (!total) {
      await say(`> ÁRBOL LIMPIO. EMITIENDO SELLO DE MÉRITO.`, 500);
      result({ rows, total, merit: true, id });
      if (hash(id + answers.map(a => a.short).join()) % 100 < 38) {
        await sleep(2600);
        const yrs = [1764, 1802, 1889, 1956][hash(id) % 4];
        collateral = { year: yrs, crime: 'Multa impaga · rama colateral', orig: 15 / 365 };
        collateral.now = sentenceAt(collateral.orig, yrs);
        recalc(collateral);
      }
      return;
    }
    result({ rows, total, merit: false, id });
  }

  function subjectId(id) {
    const h = hash(id + answers.map(a => a.short).join('|'));
    return `${String(1000 + h % 9000)}-${'ABCDEFGHJK'[h % 10]}`;
  }

  function result({ rows, total, merit, id, recalculated }) {
    ORDER.forEach(y => { if (y === 2778) { const c = node(2778).querySelector('circle'); c.setAttribute('fill', merit ? '#39E58C' : '#E5262B'); c.setAttribute('stroke', merit ? '#39E58C' : '#E5262B'); c.setAttribute('filter', 'url(#glow)'); } });
    node(2778).querySelector('.lbl').textContent = merit ? id : 'SUJETO ' + subjectId(id);
    const sid = subjectId(id);
    const lives = total / 60;
    const vsBarry = total / BARRY * 100;
    const table = rows.length ? `<table class="breakdown">${rows.sort((a, b) => a.year - b.year).map(r => `<tr><td>${r.year}</td><td>${esc(r.crime)}<br><span class="mut">${human(r.orig)} originales</span></td><td class="red">${human(r.now)}</td></tr>`).join('')}</table>` : '';
    const greeting = merit ? `Buenos días, ${esc(id.charAt(0) + id.slice(1).toLowerCase())}.` : `SUJETO ${sid}. DE PIE.`;
    panel.innerHTML = `
      <div class="result">
        <p class="kick">${recalculated ? 'Registro de linaje · recalculado' : 'Registro de linaje'}</p>
        <div class="idcard ${merit ? 'merit' : 'debt'}">
          <div class="id-top"><span>D.I.O.S. · Auditoría de Sangre</span><span>2778</span></div>
          <div class="id-name">${merit ? esc(id) : 'SUJETO ' + sid}</div>
          <div class="id-sub ${merit ? 'grn' : 'red'}">${merit ? 'Linaje de Mérito' : 'Linaje de Deuda'}</div>
          <div class="id-big">${merit ? '0 años' : human(total)}</div>
          <div class="mut" style="font-size:.9rem">${merit ? 'Árbol limpio. No vas a deber nada. Por ahora.' : `Equivale a ${fmt(lives, lives < 10 ? 1 : 0)} vidas de prisión · ${fmt(vsBarry, vsBarry < 10 ? 1 : 0)} % de la condena de Barry.`}</div>
          <div class="id-mark">${merit ? '<span class="seal"></span>' : '<svg class="barcode" id="res-bc"></svg>'}<span class="mono mut" style="font-size:.7rem">${merit ? 'SELLO VERDE · MUÑECA' : 'CÓDIGO ROJO · CUELLO'}</span></div>
        </div>
        ${table}
        <p class="dios-says">${greeting}</p>
        <div class="res-actions">
          <button class="btn" id="res-copy" type="button">Copiar resultado</button>
          <button class="btn btn-ghost" id="res-again" type="button">Auditar otro linaje</button>
          <a class="btn btn-red" href="#corto">Ver el corto</a>
        </div>
        <span class="mono mut" id="res-msg" style="font-size:.72rem;min-height:1.2em" aria-live="polite"></span>
      </div>`;
    if (narrow()) setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
    if (!merit) window.drawBarcode(panel.querySelector('#res-bc'), hash(sid));
    panel.querySelector('#res-again').addEventListener('click', intro);
    panel.querySelector('#res-copy').addEventListener('click', () => {
      const txt = merit
        ? `D.I.O.S. auditó mi linaje: ${id}, Linaje de Mérito. Árbol limpio. Por ahora. #Herederos`
        : `D.I.O.S. auditó mi linaje: SUJETO ${sid}, Linaje de Deuda. Condena heredada: ${human(total)}. #Herederos`;
      const msg = panel.querySelector('#res-msg');
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(() => { msg.textContent = 'Resultado copiado.'; })
        .catch(() => { msg.textContent = txt; });
    });
  }

  async function recalc(c) {
    const card = panel.querySelector('.idcard');
    if (!card) return;
    const say = panel.querySelector('.dios-says');
    say.style.borderColor = 'var(--debt)';
    say.innerHTML = 'RECALCULANDO LINAJE…';
    card.animate([{ filter: 'none' }, { filter: 'hue-rotate(-120deg) saturate(3)' }, { filter: 'none' }, { filter: 'hue-rotate(-120deg) saturate(3)' }, { filter: 'none' }], { duration: 900 });
    await sleep(1800);
    say.innerHTML = `DEUDA ENCONTRADA · RAMA COLATERAL · ${c.year}.`;
    await sleep(1600);
    const y = c.year;
    result({ rows: [c], total: c.now, merit: false, id: name.toUpperCase(), recalculated: true });
    panel.querySelector('.dios-says').insertAdjacentHTML('beforebegin', `<p class="mut" style="font-size:.92rem;margin:0">Un pariente lejano de ${y} nunca pagó una multa de quince días. Igual que Lía, tu árbol estaba limpio hasta que dejó de estarlo.</p>`);
  }

  intro();
})();
