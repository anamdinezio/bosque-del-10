// Dibujos: D arma SVG para las preguntas y ventanas; C dibuja el bosque en el canvas.

const COL = {
  madera: '#5A3B26', maderaClara: '#A57E5C', tinta: '#3A2416', papel: '#FFF8EE',
  naranja: '#E8792A', verde: '#4F8A78', baya: '#B8433A'
};
const FUENTE = "Baloo 2, Nunito, sans-serif";

const D = {
  marco10(llenos, o = {}) {
    const otros = o.otros || 0, tach = o.tachados || 0, total = llenos + otros;
    let s = `<svg class="vis marco${o.interactivo ? ' interactivo' : ''}" viewBox="0 0 214 94" role="img" aria-label="Marco de 10">`;
    s += `<rect x="2" y="2" width="210" height="90" rx="6" fill="${COL.papel}" stroke="${COL.madera}" stroke-width="3"/>`;
    for (let i = 0; i < 10; i++) {
      const c = i % 5, r = Math.floor(i / 5);
      const x = 2 + c * 42, y = 2 + r * 45, cx = x + 21, cy = y + 22.5;
      s += `<rect x="${x}" y="${y}" width="42" height="45" fill="none" stroke="${COL.madera}" stroke-width="2"/>`;
      if (i < total) {
        s += `<circle cx="${cx}" cy="${cy}" r="14" fill="${i < llenos ? COL.naranja : COL.verde}"/>`;
        if (i >= total - tach) s += `<path d="M${cx - 13} ${cy - 13} L${cx + 13} ${cy + 13} M${cx + 13} ${cy - 13} L${cx - 13} ${cy + 13}" stroke="${COL.tinta}" stroke-width="4" stroke-linecap="round"/>`;
      } else if (o.interactivo) {
        s += `<circle class="celda" data-i="${i}" cx="${cx}" cy="${cy}" r="15" fill="transparent" stroke="#C9B9A0" stroke-width="2" stroke-dasharray="4 3"/>`;
      }
    }
    return s + '</svg>';
  },
  dosMarcos(g, p) {
    const f = 10 - g;
    return `<div class="dos-marcos">${D.marco10(g, { otros: f })}${D.marco10(0, { otros: p - f })}</div>`;
  },
  restaMarcos(a, b) {
    if (a <= 10) return D.marco10(a, { tachados: b });
    const u = a - 10;
    return `<div class="dos-marcos">${D.marco10(10, { tachados: Math.max(0, b - u) })}${D.marco10(u, { tachados: Math.min(b, u) })}</div>`;
  },
  bond(total, a, b) {
    const t = (x, y, v) => {
      const q = v === '?';
      return `<circle cx="${x}" cy="${y}" r="27" fill="${q ? '#FDE3C8' : COL.papel}" stroke="${q ? COL.naranja : COL.madera}" stroke-width="3"/>` +
        `<text x="${x}" y="${y + 9}" text-anchor="middle" font-size="26" font-weight="700" font-family="${FUENTE}" fill="${q ? COL.naranja : COL.tinta}">${v}</text>`;
    };
    return `<svg class="vis" viewBox="0 0 200 150" role="img" aria-label="Number bond">` +
      `<path d="M100 40 L50 112 M100 40 L150 112" stroke="${COL.madera}" stroke-width="3"/>` +
      t(100, 32, total) + t(50, 116, a) + t(150, 116, b) + '</svg>';
  },
  recta(desde, hasta, inicio, saltos) {
    const W = 440, x0 = 20, x1 = 420, paso = (x1 - x0) / (hasta - desde);
    const X = v => x0 + (v - desde) * paso;
    let s = `<svg class="vis" viewBox="0 0 ${W} 124" role="img" aria-label="Recta numérica">`;
    s += `<line x1="${x0}" y1="84" x2="${x1}" y2="84" stroke="${COL.madera}" stroke-width="3"/>`;
    for (let v = desde; v <= hasta; v++) {
      const big = v % 5 === 0;
      s += `<line x1="${X(v)}" y1="${big ? 74 : 78}" x2="${X(v)}" y2="${big ? 94 : 90}" stroke="${COL.madera}" stroke-width="2"/>`;
      s += `<text x="${X(v)}" y="112" text-anchor="middle" font-size="${big ? 15 : 12}" font-family="${FUENTE}" fill="${COL.tinta}">${v}</text>`;
    }
    const cols = [COL.naranja, COL.verde, '#C9621F'];
    let pos = inicio;
    s += `<circle cx="${X(pos)}" cy="84" r="6" fill="${COL.tinta}"/>`;
    saltos.forEach((sl, i) => {
      if (!sl) return;
      const a = X(pos), b = X(pos + sl), m = (a + b) / 2, h = Math.min(60, 22 + Math.abs(sl) * 5);
      s += `<path d="M${a} 80 Q${m} ${80 - h * 1.5} ${b} 80" fill="none" stroke="${cols[i % 3]}" stroke-width="3"/>`;
      s += `<text x="${m}" y="${80 - h * 0.75 - 6}" text-anchor="middle" font-size="16" font-weight="700" font-family="${FUENTE}" fill="${cols[i % 3]}">${sl > 0 ? '+' : '−'}${Math.abs(sl)}</text>`;
      pos += sl;
      s += `<circle cx="${b}" cy="84" r="6" fill="${cols[i % 3]}"/>`;
    });
    return s + '</svg>';
  },
  zanahoria(x, y) {
    return `<path d="M${x - 7} ${y - 6} L${x + 7} ${y - 6} L${x} ${y + 12} Z" fill="${COL.naranja}"/>` +
      `<path d="M${x} ${y - 6} L${x - 5} ${y - 14} M${x} ${y - 6} L${x} ${y - 15} M${x} ${y - 6} L${x + 5} ${y - 14}" stroke="#4F8A3E" stroke-width="2.5" stroke-linecap="round"/>`;
  },
  baya(x, y, tipo) {
    if (tipo === 'bellota') return `<ellipse cx="${x}" cy="${y + 2}" rx="7" ry="8" fill="#B07A45"/><path d="M${x - 8} ${y - 2} Q${x} ${y - 12} ${x + 8} ${y - 2} Z" fill="#6E4A33"/>`;
    return `<circle cx="${x}" cy="${y}" r="8" fill="${COL.baya}"/><circle cx="${x - 3}" cy="${y - 3}" r="2.2" fill="#E9877E"/>`;
  },
  arrayVis(f, c, obj) {
    const cel = 34, W = c * cel + 16, H = f * cel + 16;
    let s = `<svg class="vis array" viewBox="0 0 ${W} ${H}" role="img" aria-label="Array de ${f} filas y ${c} columnas">`;
    for (let r = 0; r < f; r++) {
      s += `<rect x="4" y="${8 + r * cel + 2}" width="${W - 8}" height="${cel - 4}" rx="8" fill="${r % 2 ? '#EFE3CF' : '#E6D6BC'}"/>`;
      for (let k = 0; k < c; k++) {
        const x = 8 + k * cel + cel / 2, y = 8 + r * cel + cel / 2;
        s += obj === 'zanahoria' ? D.zanahoria(x, y) : `<circle cx="${x}" cy="${y}" r="11" fill="${COL.naranja}"/>`;
      }
    }
    return s + '</svg>';
  },
  grupos(g, k, tipo) {
    const R = 44, W = g * 104;
    const cols = Math.ceil(Math.sqrt(k)), filas = Math.ceil(k / cols);
    let s = `<svg class="vis" viewBox="0 0 ${W} 108" role="img" aria-label="${g} grupos de ${k}">`;
    for (let i = 0; i < g; i++) {
      const cx = 52 + i * 104, cy = 54;
      s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#E6D6BC" stroke="${COL.madera}" stroke-width="3"/>`;
      for (let j = 0; j < k; j++) {
        const cc = j % cols, rr = Math.floor(j / cols);
        s += D.baya(cx + (cc - (cols - 1) / 2) * 20, cy + (rr - (filas - 1) / 2) * 20, tipo);
      }
    }
    return s + '</svg>';
  },
  bayas(n, tipo) {
    const porFila = 10, filas = Math.ceil(n / porFila);
    let s = `<svg class="vis" viewBox="0 0 ${porFila * 24 + 10} ${filas * 26 + 10}" role="img" aria-label="${n} objetos">`;
    for (let i = 0; i < n; i++) s += D.baya(17 + (i % porFila) * 24, 18 + Math.floor(i / porFila) * 26, tipo);
    return s + '</svg>';
  },
  familia(a, b, c, op) {
    const inv = op === '+' ? '−' : '÷';
    const hechos = [`${a} ${op} ${b} = ${c}`, `${b} ${op} ${a} = ${c}`, `${c} ${inv} ${a} = ${b}`, `${c} ${inv} ${b} = ${a}`];
    const num = (x, y, v) => `<circle cx="${x}" cy="${y}" r="20" fill="${COL.papel}" stroke="${COL.madera}" stroke-width="3"/><text x="${x}" y="${y + 7}" text-anchor="middle" font-size="19" font-weight="700" font-family="${FUENTE}" fill="${COL.tinta}">${v}</text>`;
    let s = `<svg class="vis" viewBox="0 0 320 140" role="img" aria-label="Familia de datos">`;
    s += `<path d="M70 26 L22 112 L118 112 Z" fill="#E6D6BC" stroke="${COL.madera}" stroke-width="3"/>`;
    s += num(70, 30, c) + num(26, 110, a) + num(114, 110, b);
    hechos.forEach((h, i) => { s += `<text x="150" y="${32 + i * 28}" font-size="19" font-family="${FUENTE}" fill="${COL.tinta}">${h}</text>`; });
    return s + '</svg>';
  },
  // Cabeza chiquita de Emily para las tarjetas
  cabeza(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})">` +
      `<ellipse cx="-6" cy="-24" rx="4" ry="12" fill="#FFF" stroke="#56635A" stroke-width="1.5"/><ellipse cx="6" cy="-24" rx="4" ry="12" fill="#FFF" stroke="#56635A" stroke-width="1.5"/>` +
      `<ellipse cx="0" cy="0" rx="15" ry="12" fill="#FFF" stroke="#56635A" stroke-width="1.5"/>` +
      `<circle cx="-5" cy="-1" r="2.4" fill="#3A3A32"/><circle cx="5" cy="-1" r="2.4" fill="#3A3A32"/></g>`;
  },
  tarjetaPoder(id) {
    const p = PODERES[id];
    let dib = '';
    if (id === 'nadar') dib = `<path d="M10 80 L114 80 L114 108 L10 108 Z" fill="#6FA4B3" opacity="0.4"/>` + D.cabeza(60, 70, 1.1) + `<path d="M10 84 Q24 76 38 84 T66 84 T94 84 T114 84" stroke="#6FA4B3" stroke-width="3" fill="none"/>`;
    if (id === 'saltar') dib = `<rect x="22" y="84" width="80" height="18" rx="9" fill="#8A6748"/><path d="M28 80 Q52 18 80 80" stroke="#B9A88F" stroke-width="2" stroke-dasharray="4 4" fill="none"/>` + D.cabeza(52, 44, 0.95);
    if (id === 'empujar') dib = `<path d="M58 100 Q52 50 82 46 Q112 46 112 100 Z" fill="#9E9C8C"/>` + D.cabeza(34, 62, 0.95) + `<path d="M46 74 L58 70" stroke="#56635A" stroke-width="3" stroke-linecap="round"/>`;
    if (id === 'escalar') dib = `<rect x="66" y="18" width="44" height="88" rx="4" fill="#7E7B6D"/><path d="M66 40 L110 40 M66 64 L110 64 M66 88 L110 88" stroke="#6A675A" stroke-width="2"/>` + D.cabeza(50, 58, 0.95) + `<path d="M58 66 L66 60" stroke="#56635A" stroke-width="3" stroke-linecap="round"/>`;
    if (id === 'volar') dib = `<path d="M47 66 Q30 54 32 72 Q40 71 47 71 Z" fill="#E8B04A" opacity="0.5"/><path d="M75 66 Q92 54 90 72 Q82 71 75 71 Z" fill="#E8B04A" opacity="0.5"/>` + D.cabeza(61, 64, 1.05);
    if (id === 'camuflaje') dib = `<ellipse cx="22" cy="50" rx="3.5" ry="9" fill="#FFF" stroke="#56635A" stroke-width="1.5"/><ellipse cx="32" cy="50" rx="3.5" ry="9" fill="#FFF" stroke="#56635A" stroke-width="1.5"/>` +
      `<circle cx="28" cy="80" r="20" fill="#4F7F3E"/><circle cx="48" cy="86" r="16" fill="#5E9C46"/><circle cx="14" cy="88" r="13" fill="#5E9C46"/><circle cx="24" cy="76" r="2.5" fill="#3A3A32"/><circle cx="33" cy="76" r="2.5" fill="#3A3A32"/>` +
      `<circle cx="92" cy="74" r="20" fill="#6B4A33"/><circle cx="78" cy="58" r="7" fill="#6B4A33"/><circle cx="104" cy="58" r="7" fill="#6B4A33"/><ellipse cx="92" cy="82" rx="9" ry="7" fill="#C9A27E"/><circle cx="85" cy="70" r="2.2" fill="#1E1E1A"/><circle cx="99" cy="70" r="2.2" fill="#1E1E1A"/>`;
    if (id === 'hablar') dib = D.cabeza(36, 74, 1) + `<rect x="54" y="26" width="56" height="34" rx="10" fill="#FFF" stroke="#56635A" stroke-width="1.5"/><path d="M62 60 L58 70 L72 60 Z" fill="#FFF" stroke="#56635A" stroke-width="1.5"/>` +
      `<path d="M74 43 C70 36 62 40 68 47 L74 52 L80 47 C86 40 78 36 74 43 Z" fill="${COL.baya}"/><circle cx="92" cy="43" r="3" fill="#56635A"/><circle cx="101" cy="43" r="3" fill="#56635A"/>`;
    if (id === 'ver') dib = `<rect x="8" y="14" width="108" height="94" rx="8" fill="#1B2316"/><circle cx="62" cy="64" r="34" fill="#F7C870" opacity="0.18"/>` + D.cabeza(62, 70, 1.1) +
      `<circle cx="56.5" cy="69" r="4" fill="#F7C870"/><circle cx="67.5" cy="69" r="4" fill="#F7C870"/>`;
    return `<svg class="tarjeta" viewBox="0 0 124 124" role="img" aria-label="${p.nombre}">` +
      `<rect width="124" height="124" rx="8" fill="#F3EBDD"/>${dib}` +
      `<circle cx="102" cy="22" r="17" fill="${COL.naranja}"/><text x="102" y="30" text-anchor="middle" font-size="22" font-weight="700" font-family="${FUENTE}" fill="#FFF">${p.num}</text></svg>`;
  },
  tapada() {
    return `<svg class="tarjeta" viewBox="0 0 124 124" role="img" aria-label="Poder sin ganar"><rect width="124" height="124" rx="8" fill="#B8A88F"/>` +
      `<path d="M0 30 L124 30 M0 62 L124 62 M0 94 L124 94" stroke="#A8977C" stroke-width="2"/>` +
      `<text x="62" y="76" text-anchor="middle" font-size="40" font-weight="700" font-family="${FUENTE}" fill="#6E5A45">?</text></svg>`;
  },
  hoja(conBrillo) {
    return `<svg viewBox="-20 -20 40 40" class="hoja-svg" aria-hidden="true">` +
      (conBrillo ? `<circle r="18" fill="#F7A440" opacity="0.15"/><circle r="12" fill="#F7A440" opacity="0.22"/>` : '') +
      `<path d="M0 6 L0 14" stroke="#8A4A1E" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M0 7 Q-5 3 -6 -2 L-9 -5 L-5 -5 L-5.5 -9 L-2.5 -6.5 L0 -11 L2.5 -6.5 L5.5 -9 L5 -5 L9 -5 L6 -2 Q5 3 0 7 Z" fill="#E8792A"/>` +
      `<path d="M0 7 Q5 3 6 -2 L9 -5 L5 -5 L5.5 -9 L2.5 -6.5 L0 -11 Z" fill="#C95E1C"/>` +
      `<circle cx="-2.5" cy="-1" r="1.1" fill="#3A2416"/><circle cx="2.5" cy="-1" r="1.1" fill="#3A2416"/>` +
      `<path d="M-1.8 2.2 Q0 3.6 1.8 2.2" stroke="#3A2416" stroke-width="0.8" fill="none" stroke-linecap="round"/></svg>`;
  },
  estrellas(n, total = 3) {
    let s = '';
    for (let i = 0; i < total; i++) {
      s += `<svg class="estrella${i < n ? ' llena' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6 Z"/></svg>`;
    }
    return `<span class="estrellas" aria-label="${n} de ${total} estrellas">${s}</span>`;
  },
  conejoGrande() {
    return `<svg viewBox="-40 -140 80 150" class="conejo-grande" aria-hidden="true">
<ellipse cx="0" cy="4" rx="26" ry="5" fill="#000" opacity="0.25"/>
<g transform="rotate(-10 -10 -88)"><ellipse cx="-10" cy="-108" rx="7" ry="24" fill="#F4EEE6"/><ellipse cx="-10" cy="-106" rx="3" ry="17" fill="#F2BFB4"/></g>
<g transform="rotate(10 10 -88)"><ellipse cx="10" cy="-108" rx="7" ry="24" fill="#F4EEE6"/><ellipse cx="10" cy="-106" rx="3" ry="17" fill="#F2BFB4"/></g>
<path d="M-15 -60 Q-17 -20 -12 -10 L12 -10 Q17 -20 15 -60 Z" fill="#F4EEE6"/><path d="M6 -60 Q14 -40 13 -12 L12 -10 Q17 -20 15 -60 Z" fill="#DDD4C8"/>
<ellipse cx="-19" cy="-44" rx="5" ry="17" fill="#F4EEE6"/><ellipse cx="19" cy="-44" rx="5" ry="17" fill="#DDD4C8"/>
<circle cx="-4" cy="-24" r="10" fill="#FFFFFF"/>
<rect x="-12" y="-14" width="8" height="12" rx="4" fill="#F4EEE6"/><rect x="4" y="-14" width="8" height="12" rx="4" fill="#DDD4C8"/>
<ellipse cx="-9" cy="-2" rx="6" ry="3.5" fill="#E6DDD1"/><ellipse cx="9" cy="-2" rx="6" ry="3.5" fill="#D6CCBF"/>
<ellipse cx="0" cy="-72" rx="22" ry="17" fill="#F4EEE6"/>
<ellipse cx="-8" cy="-73" rx="4.2" ry="5.5" fill="#3A3A32"/><ellipse cx="8" cy="-73" rx="4.2" ry="5.5" fill="#3A3A32"/>
<circle cx="-6.8" cy="-75" r="1.6" fill="#FFF"/><circle cx="9.2" cy="-75" r="1.6" fill="#FFF"/>
<path d="M-12 -78 L-14 -81 M-11 -79.5 L-12 -83 M12 -78 L14 -81 M11 -79.5 L12 -83" stroke="#3A3A32" stroke-width="1.2" stroke-linecap="round"/>
<path d="M-2 -66 L2 -66 L0 -64 Z" fill="#D9788A"/>
<path d="M-6 -63.5 Q0 -54 6 -63.5 Z" fill="#6B2E35" stroke="#3A3A32" stroke-width="1.1" stroke-linejoin="round"/>
<ellipse cx="0" cy="-58.5" rx="3.2" ry="1.8" fill="#E98793"/>
<circle cx="-8.6" cy="-70.5" r="0.9" fill="#FFF"/><circle cx="7.4" cy="-70.5" r="0.9" fill="#FFF"/>
<ellipse cx="-15" cy="-65" rx="4" ry="3" fill="#F2A096" opacity="0.75"/><ellipse cx="15" cy="-65" rx="4" ry="3" fill="#F2A096" opacity="0.75"/></svg>`;
  }
};

// ---------- Canvas ----------

const C = {
  W: 960, H: 540, SUELO: 430,
  semilla: 7,
  azar() { this.semilla = (this.semilla * 9301 + 49297) % 233280; return this.semilla / 233280; },
  capas: null,
  preparar() {
    this.semilla = 7;
    const lejos = [], medios = [], pasto = [];
    for (let i = 0; i < 12; i++) lejos.push({ x: i * 92 + this.azar() * 40, w: 6 + this.azar() * 6 });
    for (let i = 0; i < 6; i++) medios.push({ x: i * 190 + this.azar() * 80, w: 11 + this.azar() * 6 });
    for (let i = 0; i < 40; i++) pasto.push({ x: i * 140 + this.azar() * 90 });
    this.capas = { lejos, medios, pasto };
  },
  el(ctx, x, y, rx, ry, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); },
  // Posición repetida para capas con parallax
  rep(x, cam, factor, span) { return ((x - cam * factor) % span + span) % span - 60; },

  fondo(ctx, cam) {
    const { W, H } = this;
    ctx.fillStyle = '#C3D9CC'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#A9C6B7'; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 16) { const wx = x + cam * 0.1; ctx.lineTo(x, 250 + Math.sin(wx * 0.004) * 26 + Math.sin(wx * 0.013) * 9); }
    ctx.lineTo(W, H); ctx.fill();
    ctx.fillStyle = '#97B9AB';
    for (const t of this.capas.lejos) ctx.fillRect(this.rep(t.x, cam, 0.25, W + 120), 40, t.w, 300);
    ctx.fillStyle = '#969B4E'; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) { const wx = x + cam * 0.5; ctx.lineTo(x, 335 - Math.abs(Math.sin(wx * 0.012)) * 34 - Math.sin(wx * 0.003) * 10); }
    ctx.lineTo(W, H); ctx.fill();
    for (const t of this.capas.medios) {
      const x = this.rep(t.x, cam, 0.65, W + 160);
      ctx.fillStyle = '#84594C'; ctx.fillRect(x, 0, t.w, 380);
      ctx.fillStyle = '#6B463B'; ctx.fillRect(x, 0, t.w * 0.38, 380);
    }
    ctx.fillStyle = '#4E7630'; ctx.fillRect(0, this.SUELO, W, H - this.SUELO);
    ctx.fillStyle = '#6E9A3E'; ctx.fillRect(0, this.SUELO, W, 20);
    ctx.fillStyle = '#7FAA48'; ctx.fillRect(0, this.SUELO, W, 6);
  },
  pasto(ctx, cam) {
    ctx.strokeStyle = '#3E6326'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (const p of this.capas.pasto) {
      const x = this.rep(p.x, cam, 1, 5600);
      if (x < -20 || x > this.W + 20) continue;
      const y = this.SUELO + 40;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y - 10); ctx.moveTo(x + 4, y); ctx.lineTo(x + 4, y - 12); ctx.moveTo(x + 8, y); ctx.lineTo(x + 12, y - 9); ctx.stroke();
    }
  },
  frente(ctx, cam, t) {
    const { W, H } = this;
    // copa oscura
    ctx.fillStyle = '#3F5A21';
    ctx.fillRect(0, 0, W, 26);
    for (let k = 0; k < 18; k++) { const x = this.rep(k * 64, cam, 0.85, W + 120); ctx.beginPath(); ctx.arc(x, 26, 34 + (k % 3) * 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#2E431A';
    ctx.fillRect(0, 0, W, 12);
    for (let k = 0; k < 20; k++) { const x = this.rep(k * 58 + 20, cam, 0.9, W + 120); ctx.beginPath(); ctx.arc(x, 10, 24 + (k % 2) * 6, 0, Math.PI * 2); ctx.fill(); }
    // rayos de luz
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(320, 0); ctx.lineTo(500, 400); ctx.lineTo(410, 400); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.moveTo(380, 0); ctx.lineTo(420, 0); ctx.lineTo(600, 380); ctx.lineTo(550, 380); ctx.fill();
    // sombra en los bordes
    let g = ctx.createLinearGradient(0, 0, 230, 0);
    g.addColorStop(0, 'rgba(18,28,12,0.55)'); g.addColorStop(1, 'rgba(18,28,12,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 230, H);
    g = ctx.createLinearGradient(W - 230, 0, W, 0);
    g.addColorStop(0, 'rgba(18,28,12,0)'); g.addColorStop(1, 'rgba(18,28,12,0.55)');
    ctx.fillStyle = g; ctx.fillRect(W - 230, 0, 230, H);
    // troncos que enmarcan y arbustos de adelante
    ctx.fillStyle = '#4C301F'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(50, 0); ctx.lineTo(56, H); ctx.lineTo(6, H); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W - 46, 0); ctx.lineTo(W - 14, 0); ctx.lineTo(W - 4, H); ctx.lineTo(W - 58, H); ctx.fill();
    ctx.fillStyle = '#3A2416'; ctx.fillRect(14, 0, 12, H); ctx.fillRect(W - 22, 0, 10, H);
    this.el(ctx, 60, H + 10, 70, 46, '#2F5424'); this.el(ctx, 12, H - 20, 46, 40, '#365F29');
    this.el(ctx, W - 60, H + 10, 72, 46, '#2F5424'); this.el(ctx, W - 10, H - 24, 44, 40, '#365F29');
  },

  piedrita(ctx, p, t) {
    const S = this.SUELO, cx = p.x + p.w / 2, el = (a, b, rx, ry, col) => this.el(ctx, a, b, rx, ry, col);
    el(cx, S + 2, p.w / 2 + 6, 5, 'rgba(30,46,20,0.4)');
    if (p.tipo === 'hongo') {
      ctx.fillStyle = '#F1E3CF'; ctx.beginPath(); ctx.roundRect(cx - 7, S - 22, 14, 22, 5); ctx.fill();
      ctx.fillStyle = '#C8553D'; ctx.beginPath(); ctx.ellipse(cx, S - 20, 24, 16, 0, Math.PI, 0); ctx.fill();
      el(cx - 10, S - 28, 3.5, 3, '#F6E7D3'); el(cx + 6, S - 31, 4, 3.5, '#F6E7D3'); el(cx + 15, S - 24, 2.5, 2.5, '#F6E7D3');
      return;
    }
    if (p.tipo === 'tronquito') {
      ctx.fillStyle = '#6E4A33'; ctx.beginPath(); ctx.roundRect(p.x, S - 28, p.w, 28, 12); ctx.fill();
      ctx.fillStyle = '#5A3B26'; ctx.fillRect(p.x + 8, S - 10, p.w - 20, 4);
      el(p.x + p.w - 6, S - 14, 9, 14, '#A57E5C');
      ctx.strokeStyle = '#8A6748'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(p.x + p.w - 6, S - 14, 5, 8, 0, 0, 6.3); ctx.stroke();
      ctx.fillStyle = '#5F8A3A'; ctx.beginPath(); ctx.ellipse(p.x + 14, S - 28, 9, 4, 0, Math.PI, 0); ctx.fill();
      return;
    }
    if (p.tipo === 'planta') {
      const v = Math.sin(t * 2 + p.x) * 1.5;
      el(cx - 12 + v, S - 14, 14, 14, '#3F6B2E'); el(cx + 12 + v, S - 14, 14, 14, '#3F6B2E'); el(cx + v, S - 22, 15, 13, '#4F8A3E');
      el(cx - 8 + v, S - 26, 3, 3, '#F2B33D'); el(cx + 9 + v, S - 20, 3, 3, '#E98793'); el(cx + 2 + v, S - 31, 2.5, 2.5, '#FFF8EE');
      return;
    }
    if (p.tipo === 'calabaza') {
      el(cx - 12, S - 14, 12, 14, '#D9732C'); el(cx + 12, S - 14, 12, 14, '#D9732C'); el(cx, S - 15, 14, 15, '#E8873A');
      ctx.strokeStyle = '#B85E22'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 6, S - 28); ctx.quadraticCurveTo(cx - 9, S - 15, cx - 6, S - 2); ctx.moveTo(cx + 6, S - 28); ctx.quadraticCurveTo(cx + 9, S - 15, cx + 6, S - 2); ctx.stroke();
      ctx.fillStyle = '#5A3B26'; ctx.fillRect(cx - 2, S - 36, 4, 8);
      ctx.fillStyle = '#5F8A3A'; ctx.beginPath(); ctx.ellipse(cx + 7, S - 32, 6, 3, -0.4, 0, 6.3); ctx.fill();
      return;
    }
    ctx.fillStyle = '#9E9C8C'; ctx.beginPath();
    ctx.moveTo(p.x, S); ctx.quadraticCurveTo(p.x + 2, S - p.h, p.x + p.w / 2, S - p.h); ctx.quadraticCurveTo(p.x + p.w - 2, S - p.h, p.x + p.w, S); ctx.fill();
    ctx.fillStyle = '#82806F'; ctx.beginPath();
    ctx.moveTo(p.x + p.w * 0.55, S - p.h + 2); ctx.quadraticCurveTo(p.x + p.w - 2, S - p.h, p.x + p.w, S); ctx.lineTo(p.x + p.w * 0.6, S); ctx.fill();
  },

  conejo(ctx, x, y, o) {
    const c = ctx;
    c.save();
    if (o.alpha !== undefined) c.globalAlpha = o.alpha;
    c.translate(x, y);
    if (o.modo !== 'nadar' && o.modo !== 'volar' && o.enSuelo !== false) this.el(c, 0, 2, 22, 5, 'rgba(30,46,20,0.45)');
    const s = 0.92;
    c.scale(s * (o.dir || 1), s);
    if (o.modo === 'arbusto') {
      this.el(c, -12, -60, 4, 12, '#F4EEE6'); this.el(c, 0, -62, 4, 12, '#F4EEE6');
      this.el(c, -6, -26, 30, 28, '#4F7F3E'); this.el(c, 18, -16, 22, 18, '#5E9C46'); this.el(c, -28, -14, 18, 15, '#5E9C46'); this.el(c, 4, -40, 18, 15, '#5E9C46');
      this.el(c, -10, -34, 3, 3.6, '#3A3A32'); this.el(c, 2, -34, 3, 3.6, '#3A3A32');
      c.restore(); return;
    }
    const bob = o.caminando ? -Math.abs(Math.sin(o.fase)) * 3 : 0;
    c.translate(0, bob);
    if (o.modo === 'volar') {
      // alas chicas y transparentes, como de hada
      const a = Math.sin(o.fase * 2.2) * 0.4;
      c.save(); c.globalAlpha = 0.45;
      c.save(); c.translate(-6, -52); c.rotate(-0.4 - a);
      c.fillStyle = '#F3E3B0'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-22, -18, -20, 4); c.quadraticCurveTo(-10, 4, 0, 3); c.fill(); c.restore();
      c.save(); c.translate(6, -52); c.rotate(0.4 + a);
      c.fillStyle = '#EBD9A2'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(22, -18, 20, 4); c.quadraticCurveTo(10, 4, 0, 3); c.fill(); c.restore();
      c.restore();
    }
    const blanco = '#F4EEE6', sombra = '#DDD4C8';
    // orejas paradas y un poco abiertas (se ve contento)
    const oreja = (x, ang, col) => {
      c.save(); c.translate(x, -88); c.rotate(ang);
      this.el(c, 0, -20, 7, 24, col); this.el(c, 0, -18, 3, 17, '#F2BFB4');
      c.restore();
    };
    oreja(-8, -0.18, blanco); oreja(12, 0.18, sombra);
    this.el(c, -16, -26, 9, 9, '#FFFFFF'); // cola
    const l = o.caminando ? Math.sin(o.fase) * 4 : 0;
    const pata1 = o.mojado > 0 ? '#C4D3D8' : blanco, pata2 = o.mojado > 0 ? '#AFC0C6' : sombra;
    c.fillStyle = pata1; c.beginPath(); c.roundRect(-12 + l, -14, 8, 12, 4); c.fill();
    c.fillStyle = pata2; c.beginPath(); c.roundRect(4 - l, -14, 8, 12, 4); c.fill();
    if (o.mojado > 0) for (let k = 0; k < 3; k++) { const dy = ((o.fase * 7 + k * 9) % 18); this.el(c, -8 + k * 8, -2 + dy, 1.6, 2.4, `rgba(127,193,214,${1 - dy / 18})`); }
    this.el(c, -9 + l, -2, 6, 3.5, '#E6DDD1'); this.el(c, 9 - l, -2, 6, 3.5, '#D6CCBF');
    c.fillStyle = blanco; c.fill(new Path2D('M-15 -60 Q-17 -20 -12 -10 L12 -10 Q17 -20 15 -60 Z'));
    c.fillStyle = sombra; c.fill(new Path2D('M6 -60 Q14 -40 13 -12 L12 -10 Q17 -20 15 -60 Z'));
    // brazos
    if (o.modo === 'nadar') {
      const g = o.fase * 0.8;
      c.save(); c.translate(-10, -56); c.rotate(g); this.el(c, 0, 14, 5, 17, blanco); c.restore();
      c.save(); c.translate(12, -56); c.rotate(g + Math.PI); this.el(c, 0, 14, 5, 17, sombra); c.restore();
    } else if (o.modo === 'empujar') {
      c.save(); c.translate(10, -50); c.rotate(-1.35); this.el(c, 0, 10, 5, 16, blanco); c.restore();
    } else if (o.modo === 'escalar') {
      const b = Math.sin(o.fase * 3) * 0.3;
      c.save(); c.translate(-8, -52); c.rotate(-2.6 + b); this.el(c, 0, 10, 5, 15, blanco); c.restore();
      c.save(); c.translate(10, -52); c.rotate(-2.4 - b); this.el(c, 0, 10, 5, 15, sombra); c.restore();
    } else {
      const b = o.caminando ? Math.sin(o.fase) * 0.25 : 0;
      c.save(); c.translate(-17, -58); c.rotate(b); this.el(c, 0, 14, 5, 17, blanco); c.restore();
      c.save(); c.translate(17, -58); c.rotate(-b); this.el(c, 0, 14, 5, 17, sombra); c.restore();
    }
    // cabeza
    this.el(c, 2, -72, 22, 17, blanco);
    const ojo = o.modo === 'ver' ? '#F7C870' : '#3A3A32';
    this.el(c, -5, -73, 4.2, 5.5, ojo); this.el(c, 11, -73, 4.2, 5.5, ojo);
    // brillos grandes en los ojos
    this.el(c, -3.6, -75.5, 1.9, 1.9, '#FFFFFF'); this.el(c, 12.4, -75.5, 1.9, 1.9, '#FFFFFF');
    this.el(c, -6.2, -71, 0.9, 0.9, '#FFFFFF'); this.el(c, 9.8, -71, 0.9, 0.9, '#FFFFFF');
    c.strokeStyle = '#3A3A32'; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-9, -78); c.lineTo(-11, -81); c.moveTo(-8, -79.5); c.lineTo(-9, -83); c.moveTo(15, -78); c.lineTo(17, -81); c.stroke();
    c.fillStyle = '#D9788A'; c.beginPath(); c.moveTo(1, -67); c.lineTo(5, -67); c.lineTo(3, -65); c.fill();
    // sonrisa abierta con lengüita
    c.fillStyle = '#6B2E35';
    c.beginPath(); c.moveTo(-3, -63.5); c.quadraticCurveTo(3, -54, 9, -63.5); c.closePath(); c.fill();
    c.save(); c.clip(); this.el(c, 3, -58, 3.6, 2.4, '#E98793'); c.restore();
    c.strokeStyle = '#3A3A32'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-3, -63.5); c.quadraticCurveTo(3, -54, 9, -63.5); c.closePath(); c.stroke();
    this.el(c, -11, -65, 4, 3, 'rgba(242,160,150,0.75)'); this.el(c, 17, -65, 4, 3, 'rgba(242,160,150,0.75)');
    c.restore();
  },

  pregunta(ctx, x, y, t) {
    const b = Math.sin(t * 3) * 3;
    this.el(ctx, x, y + b, 15, 15, '#FFF8EE');
    ctx.fillStyle = '#E8792A'; ctx.font = `700 22px ${FUENTE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', x, y + b + 1);
  },

  animal(ctx, tipo, x, y, alpha) {
    const c = ctx, el = (a, b, rx, ry, col) => this.el(c, a, b, rx, ry, col);
    c.save(); c.globalAlpha = alpha; c.translate(x, y);
    el(0, 2, 26, 5, 'rgba(30,46,20,0.45)');
    if (tipo === 'zorrito') {
      c.fillStyle = '#F1E3CF'; c.fillRect(20, -44, 8, 32);
      c.fillStyle = '#C8553D'; c.beginPath(); c.ellipse(24, -46, 21, 15, 0, Math.PI, 0); c.fill();
      el(16, -52, 3, 3, '#F6E7D3'); el(28, -55, 3.5, 3.5, '#F6E7D3'); el(36, -49, 2.5, 2.5, '#F6E7D3');
      el(0, -28, 22, 24, '#D98A4E'); el(6, -26, 14, 20, '#C27840'); el(0, -22, 12, 15, '#F6E7D3');
      el(-10, -3, 8, 4, '#B5703D'); el(10, -3, 8, 4, '#B5703D');
      c.fillStyle = '#D98A4E';
      c.beginPath(); c.moveTo(-17, -66); c.lineTo(-12, -92); c.lineTo(-2, -74); c.fill();
      c.beginPath(); c.moveTo(17, -66); c.lineTo(12, -92); c.lineTo(2, -74); c.fill();
      c.fillStyle = '#5A3B26';
      c.beginPath(); c.moveTo(-13, -70); c.lineTo(-11, -84); c.lineTo(-5, -74); c.fill();
      c.beginPath(); c.moveTo(13, -70); c.lineTo(11, -84); c.lineTo(5, -74); c.fill();
      el(0, -62, 18, 17, '#D98A4E'); el(0, -55, 10, 7, '#F6E7D3');
      el(0, -58, 2.8, 2.4, '#3A3A32'); el(-7, -66, 2.6, 3, '#3A3A32'); el(7, -66, 2.6, 3, '#3A3A32');
    } else if (tipo === 'ranoso') {
      c.scale(1.3, 1.3); c.translate(0, -18);
      el(-20, -18, 6, 6, '#4F7F3E'); el(20, -18, 6, 6, '#4F7F3E');
      el(0, 0, 27, 18, '#9CC46E'); el(12, 2, 14, 14, '#82AA58');
      el(-10, -16, 8, 8, '#9CC46E'); el(10, -16, 8, 8, '#9CC46E');
      el(-10, -17, 4.5, 4.5, '#FFF'); el(10, -17, 4.5, 4.5, '#FFF');
      el(-10, -17, 2.2, 2.2, '#3A3A32'); el(10, -17, 2.2, 2.2, '#3A3A32');
      c.strokeStyle = '#3A3A32'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(0, 7, 9, 0); c.stroke();
      el(0, 6, 14, 8, '#C4DE9E');
    } else if (tipo === 'bellotin') {
      c.scale(1.3, 1.3); c.translate(0, -32);
      el(0, 6, 22, 26, '#C29A70'); el(9, 8, 12, 22, '#A9845F'); el(0, 12, 13, 16, '#E6D2B8');
      c.fillStyle = '#7A5A3E'; c.beginPath(); c.moveTo(-21, -10); c.quadraticCurveTo(0, -40, 21, -10); c.fill(); c.fillRect(-2, -34, 4, 8);
      el(-8, -4, 8, 8, '#FFF'); el(8, -4, 8, 8, '#FFF'); el(-8, -4, 3.5, 3.5, '#3A3A32'); el(8, -4, 3.5, 3.5, '#3A3A32');
      c.fillStyle = '#E5A85A'; c.beginPath(); c.moveTo(-3, 3); c.lineTo(3, 3); c.lineTo(0, 8); c.fill();
      el(-21, 10, 5, 12, '#A9845F'); el(21, 10, 5, 12, '#8E6D4E');
    } else if (tipo === 'ardilla') {
      // cola de corazón
      c.save(); c.translate(26, -56); c.rotate(0.25);
      c.fillStyle = '#D9606E'; c.beginPath(); c.moveTo(0, 26); c.bezierCurveTo(-34, 4, -22, -26, 0, -10); c.bezierCurveTo(22, -26, 34, 4, 0, 26); c.fill();
      c.fillStyle = '#E98793'; c.beginPath(); c.moveTo(-6, -8); c.bezierCurveTo(-18, -18, -24, 0, -12, 6); c.fill();
      c.restore();
      el(0, -26, 18, 22, '#A88B6F'); el(5, -24, 11, 18, '#937759'); el(0, -22, 10, 14, '#E6D8C6');
      el(-9, -3, 7, 4, '#86694F'); el(9, -3, 7, 4, '#86694F');
      c.fillStyle = '#A88B6F';
      c.beginPath(); c.moveTo(-14, -66); c.lineTo(-10, -82); c.lineTo(-3, -70); c.fill();
      c.beginPath(); c.moveTo(14, -66); c.lineTo(10, -82); c.lineTo(3, -70); c.fill();
      el(0, -58, 15, 14, '#A88B6F'); el(0, -53, 8, 6, '#E6D8C6');
      el(0, -56, 2.4, 2, '#3A3A32'); el(-6, -61, 2.4, 2.8, '#3A3A32'); el(6, -61, 2.4, 2.8, '#3A3A32');
    }
    c.restore();
  },

  portal(ctx, x, t, num, alpha) {
    const c = ctx, cy = this.SUELO - 78;
    c.save(); c.globalAlpha = alpha;
    for (let i = 3; i > 0; i--) this.el(c, x, cy, 36 + i * 9, 68 + i * 9, `rgba(247,164,64,${0.06 * i})`);
    this.el(c, x, cy, 34, 66, 'rgba(111,164,179,0.6)');
    c.strokeStyle = 'rgba(255,240,210,0.75)'; c.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      c.beginPath(); c.ellipse(x, cy, 26 - k * 8, 54 - k * 16, 0, t * (1.5 + k) + k, t * (1.5 + k) + k + 3.6); c.stroke();
    }
    c.strokeStyle = '#F7A440'; c.lineWidth = 6; c.beginPath(); c.ellipse(x, cy, 34, 66, 0, 0, Math.PI * 2); c.stroke();
    this.el(c, x, cy - 94, 23, 23, '#E8792A');
    c.fillStyle = '#FFF'; c.font = `700 30px ${FUENTE}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(num), x, cy - 90);
    c.restore();
  },

  // Obstáculo por detrás del conejo
  obstaculo(ctx, d, t) {
    const c = ctx, S = this.SUELO, H = this.H, x = d.x, w = d.w;
    if (d.tipo === 'rio') {
      const A = S + 18;
      // orillas de barro que bajan al agua
      c.fillStyle = '#4A3A26';
      c.beginPath(); c.moveTo(x - 14, S); c.lineTo(x + 62, H); c.lineTo(x + w - 62, H); c.lineTo(x + w + 14, S); c.fill();
      c.fillStyle = '#5E4A30';
      c.beginPath(); c.moveTo(x - 14, S); c.lineTo(x + 4, S); c.lineTo(x + 70, H); c.lineTo(x + 62, H); c.fill();
      c.beginPath(); c.moveTo(x + w + 14, S); c.lineTo(x + w - 4, S); c.lineTo(x + w - 70, H); c.lineTo(x + w - 62, H); c.fill();
      // agua profunda
      const g = c.createLinearGradient(0, A, 0, H);
      g.addColorStop(0, '#6FB3C8'); g.addColorStop(0.35, '#3F8199'); g.addColorStop(1, '#173E50');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(x + 2, A); c.lineTo(x + 66, H); c.lineTo(x + w - 66, H); c.lineTo(x + w - 2, A); c.fill();
      // piedras y plantas del fondo
      this.el(c, x + w * 0.35, H - 8, 18, 9, '#2C5566'); this.el(c, x + w * 0.62, H - 6, 24, 10, '#24495A');
      c.strokeStyle = '#2F6A5A'; c.lineWidth = 3; c.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        const px = x + 90 + k * (w - 180) / 3, sw = Math.sin(t * 1.5 + k) * 5;
        c.beginPath(); c.moveTo(px, H); c.quadraticCurveTo(px + sw, H - 22, px - sw, H - 40 - (k % 2) * 12); c.stroke();
      }
    } else if (d.tipo === 'precipicio') {
      c.fillStyle = '#16200F'; c.fillRect(x, S - 2, w, H - S + 2);
      c.fillStyle = '#4E7630';
      c.beginPath(); c.moveTo(x, S - 2); c.lineTo(x + 14, S + 30); c.lineTo(x + 4, S + 60); c.lineTo(x + 12, H); c.lineTo(x, H); c.fill();
      c.beginPath(); c.moveTo(x + w, S - 2); c.lineTo(x + w - 16, S + 40); c.lineTo(x + w - 6, S + 80); c.lineTo(x + w - 14, H); c.lineTo(x + w, H); c.fill();
      for (let k = 0; k < 4; k++) this.el(c, x + 40 + k * 55, H - 20 + Math.sin(t + k) * 5, 40, 12, 'rgba(195,217,204,0.12)');
    } else if (d.tipo === 'troncos') {
      this.el(c, x + w / 2, S + 2, w / 2 + 14, 6, 'rgba(30,46,20,0.45)');
      const tronco = (cx, cy) => { this.el(c, cx, cy, 26, 26, '#6E4A33'); this.el(c, cx, cy, 20, 20, '#A57E5C'); c.strokeStyle = '#8A6748'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 12, 0, 6.3); c.stroke(); c.beginPath(); c.arc(cx, cy, 5, 0, 6.3); c.stroke(); };
      tronco(x + 16, S - 26); tronco(x + 68, S - 26); tronco(x + 42, S - 74); tronco(x + 16, S - 122 + 0); tronco(x + 68, S - 122);
    } else if (d.tipo === 'piedra' && !d.oculto) {
      c.save(); c.globalAlpha = d.alpha; c.translate(d.dx, 0);
      const cx = x + 65;
      if (d.dx > 0) { c.translate(cx, S - 62); c.rotate(d.dx / 64); c.translate(-cx, -(S - 62)); }
      this.el(c, cx, S + 2, 74, 7, 'rgba(30,46,20,0.45)');
      this.el(c, cx, S - 62, 68, 64, '#9E9C8C');
      c.fillStyle = '#82806F'; c.beginPath(); c.ellipse(cx + 18, S - 54, 48, 54, 0, -1.2, 1.6); c.fill();
      this.el(c, cx - 26, S - 96, 14, 8, '#B3B1A2');
      c.restore();
    } else if (d.tipo === 'pared') {
      this.el(c, x + w / 2, S + 2, w / 2 + 12, 6, 'rgba(30,46,20,0.45)');
      c.fillStyle = '#7E7B6D'; c.beginPath(); c.roundRect(x, S - 180, w, 180, [10, 10, 0, 0]); c.fill();
      c.fillStyle = '#6A675A'; c.fillRect(x + w - 26, S - 176, 26, 176);
      c.strokeStyle = '#5E5B4F'; c.lineWidth = 2;
      for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x, S - k * 36); c.lineTo(x + w, S - k * 36 + 4); c.stroke(); }
      c.fillStyle = '#5F8A3A'; c.beginPath(); c.roundRect(x - 4, S - 186, w + 8, 14, 7); c.fill();
    } else if (d.tipo === 'cueva') {
      c.fillStyle = '#5E5B4F'; c.beginPath();
      c.moveTo(x - 40, S); c.lineTo(x - 30, S - 200); c.quadraticCurveTo(x + w / 2, S - 300, x + w + 30, S - 200); c.lineTo(x + w + 40, S); c.fill();
      c.fillStyle = '#4A483E'; c.beginPath(); c.moveTo(x + w * 0.6, S - 260); c.quadraticCurveTo(x + w + 20, S - 240, x + w + 40, S); c.lineTo(x + w, S); c.fill();
      c.fillStyle = '#0E140A'; c.beginPath();
      c.moveTo(x, S); c.lineTo(x + 6, S - 150); c.quadraticCurveTo(x + w / 2, S - 210, x + w - 6, S - 150); c.lineTo(x + w, S); c.fill();
      c.fillStyle = '#5F8A3A'; for (let k = 0; k < 6; k++) this.el(c, x - 20 + k * 68, S - 222 - Math.sin(k * 1.7) * 30, 22, 10, '#5F8A3A');
    }
  },

  // Superficie del agua por delante del conejo: lo que está abajo se ve mojado
  aguaFrente(ctx, d, t, conejo) {
    const c = ctx, S = this.SUELO, H = this.H, A = S + 18, x = d.x, w = d.w;
    const g = c.createLinearGradient(0, A, 0, H);
    g.addColorStop(0, 'rgba(95,166,189,0.62)'); g.addColorStop(1, 'rgba(23,62,80,0.9)');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(x + 2, A); c.lineTo(x + 66, H); c.lineTo(x + w - 66, H); c.lineTo(x + w - 2, A); c.fill();
    c.strokeStyle = 'rgba(225,245,250,0.85)'; c.lineWidth = 2.5;
    c.beginPath();
    for (let px = x + 4; px <= x + w - 4; px += 6) c.lineTo(px, A + Math.sin(px * 0.08 + t * 3) * 1.6);
    c.stroke();
    c.strokeStyle = 'rgba(225,245,250,0.45)'; c.lineWidth = 2; c.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      const wx = x + 24 + ((k * 53 + t * 22) % (w - 60)), wy = A + 10 + (k % 3) * 14;
      c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + 14 + (k % 2) * 8, wy); c.stroke();
    }
    // pececitos por encima del velo del agua, apenas transparentes, para que se vean bien
    c.save(); c.globalAlpha = 0.9;
    const colores = ['#F2994A', '#F7D44C', '#F28C8C'];
    for (let k = 0; k < 3; k++) {
      const ciclo = (t * (22 + k * 6) + k * 90) % (2 * (w - 140)), ida = ciclo < w - 140;
      const fx = x + 70 + (ida ? ciclo : 2 * (w - 140) - ciclo), fy = A + 30 + k * 18 + Math.sin(t * 2 + k) * 4;
      this.pez(c, fx, fy, ida ? 1 : -1, colores[k], t + k);
    }
    c.restore();
    // de vez en cuando uno salta fuera del agua
    const salto = (t + x * 0.01) % 7;
    if (salto < 1) this.pez(c, x + w * 0.4 + salto * 70, A - Math.sin(salto * Math.PI) * 55, 1, '#F2994A', t, Math.cos(salto * Math.PI) * 0.9);
    if (conejo && conejo.modo === 'nadar') {
      for (let k = 0; k < 3; k++) {
        const r = (t * 34 + k * 14) % 42;
        c.strokeStyle = `rgba(235,250,255,${0.7 * (1 - r / 42)})`; c.lineWidth = 2;
        c.beginPath(); c.ellipse(conejo.x, A + 2, 16 + r, 4 + r * 0.15, 0, 0, Math.PI * 2); c.stroke();
      }
    }
  },
  gotas(ctx, lista) {
    for (const g of lista) {
      if (g.burbuja) {
        ctx.strokeStyle = `rgba(230,248,255,${Math.min(1, g.vida)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.stroke();
      } else this.el(ctx, g.x, g.y, g.r, g.r * 1.2, `rgba(200,236,246,${Math.min(1, g.vida * 1.5)})`);
    }
  },

  grunon(ctx, x, t, alpha, contento) {
    const c = ctx, S = this.SUELO, el = (a, b, rx, ry, col) => this.el(c, a, b, rx, ry, col);
    c.save(); c.globalAlpha = alpha; c.translate(x, S);
    el(0, 2, 70, 8, 'rgba(30,46,20,0.45)');
    el(10, -52, 64, 46, '#6E5A45'); el(30, -46, 40, 36, '#5E4C3A');
    for (const lx of [-32, -6, 26, 48]) { c.fillStyle = '#4E3E2F'; c.beginPath(); c.roundRect(lx, -16, 14, 16, 5); c.fill(); }
    // cuernos de rama
    c.strokeStyle = '#5A3B26'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-40, -86); c.lineTo(-56, -126); c.moveTo(-50, -110); c.lineTo(-68, -118); c.moveTo(-22, -90); c.lineTo(-14, -130); c.moveTo(-16, -114); c.lineTo(-2, -124); c.stroke();
    el(-36, -66, 34, 30, '#7A6450');
    el(-58, -56, 16, 13, '#C9A27E'); el(-64, -58, 3, 4, '#3A2416'); el(-54, -58, 3, 4, '#3A2416');
    c.fillStyle = '#F4EEE6'; c.beginPath(); c.moveTo(-66, -46); c.lineTo(-70, -36); c.lineTo(-62, -44); c.fill(); c.beginPath(); c.moveTo(-50, -46); c.lineTo(-46, -36); c.lineTo(-54, -44); c.fill();
    el(-44, -76, 4, 4, '#1E1E1A'); el(-28, -76, 4, 4, '#1E1E1A');
    c.strokeStyle = '#3A2416'; c.lineWidth = 3;
    c.beginPath();
    if (contento) { c.moveTo(-50, -86); c.lineTo(-40, -88); c.moveTo(-34, -88); c.lineTo(-24, -86); }
    else { c.moveTo(-50, -88); c.lineTo(-40, -82); c.moveTo(-34, -82); c.lineTo(-24, -88); }
    c.stroke();
    c.restore();
  },

  oso(ctx, x, t, olfatea) {
    const c = ctx, S = this.SUELO, el = (a, b, rx, ry, col) => this.el(c, a, b, rx, ry, col);
    const paso = Math.sin(t * 10) * 5;
    c.save(); c.translate(x, S);
    el(0, 2, 62, 8, 'rgba(30,46,20,0.45)');
    c.fillStyle = '#4F3624';
    c.beginPath(); c.roundRect(-40 + paso, -26, 18, 26, 7); c.fill(); c.beginPath(); c.roundRect(20 - paso, -26, 18, 26, 7); c.fill();
    el(-4, -58, 58, 44, '#6B4A33'); el(-14, -50, 40, 32, '#5E4029');
    const hy = olfatea ? -70 + Math.sin(t * 8) * 4 : -86;
    el(44, hy - 26, 10, 10, '#6B4A33'); el(70, hy - 22, 10, 10, '#6B4A33');
    el(56, hy, 30, 28, '#6B4A33'); el(70, hy + 10, 15, 11, '#C9A27E'); el(78, hy + 6, 5, 4, '#1E1E1A');
    el(52, hy - 8, 3.5, 4, '#1E1E1A'); el(66, hy - 8, 3.5, 4, '#1E1E1A');
    c.strokeStyle = '#3A2416'; c.lineWidth = 3; c.beginPath(); c.moveTo(46, hy - 15); c.lineTo(56, hy - 12); c.stroke();
    if (!olfatea) { c.fillStyle = '#3A1E14'; c.beginPath(); c.ellipse(68, hy + 18, 8, 5, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
  },

  // Casita de madera con flores al final del nivel. "abierta" va de 0 (cerrada) a 1 (abierta).
  casita(ctx, x, t, abierta) {
    const c = ctx, S = this.SUELO, el = (a, b, rx, ry, col) => this.el(c, a, b, rx, ry, col);
    const L = x - 110, R = x + 110, techo = S - 150;
    el(x, S + 3, 130, 9, 'rgba(30,46,20,0.45)');
    // chimenea con humo
    c.fillStyle = '#7E6A5A'; c.fillRect(x + 50, techo - 66, 26, 50);
    c.fillStyle = '#6A5848'; c.fillRect(x + 50, techo - 70, 26, 8);
    for (let k = 0; k < 3; k++) {
      const f = (t * 0.35 + k / 3) % 1;
      el(x + 63 + Math.sin(f * 6 + k) * 8, techo - 80 - f * 70, 8 + f * 10, 7 + f * 8, `rgba(235,235,228,${0.5 * (1 - f)})`);
    }
    // paredes de tablas
    c.fillStyle = '#B07A4E'; c.fillRect(L, techo, R - L, S - techo);
    c.strokeStyle = '#8E5F3A'; c.lineWidth = 2;
    for (let yy = techo + 18; yy < S; yy += 18) { c.beginPath(); c.moveTo(L, yy); c.lineTo(R, yy); c.stroke(); }
    c.fillStyle = 'rgba(70,40,20,0.18)'; c.fillRect(x + 40, techo, R - x - 40, S - techo);
    c.fillStyle = '#7A5236'; c.fillRect(L - 4, techo, 10, S - techo); c.fillRect(R - 6, techo, 10, S - techo);
    // techo
    c.fillStyle = '#8A3F2B';
    c.beginPath(); c.moveTo(L - 26, techo + 6); c.lineTo(x, techo - 92); c.lineTo(R + 26, techo + 6); c.closePath(); c.fill();
    c.fillStyle = '#74321F';
    c.beginPath(); c.moveTo(x, techo - 92); c.lineTo(R + 26, techo + 6); c.lineTo(x + 30, techo + 6); c.closePath(); c.fill();
    c.strokeStyle = '#6A2C1B'; c.lineWidth = 2;
    for (let k = 1; k < 5; k++) { const yy = techo - 92 + k * 19.6, half = (k * 19.6) / 98 * (R - L + 52) / 2; c.beginPath(); c.moveTo(x - half, yy); c.lineTo(x + half, yy); c.stroke(); }
    // ventana redonda con luz cálida
    const vx = x - 62, vy = techo + 48;
    el(vx, vy, 22, 22, '#6E4A33'); el(vx, vy, 17, 17, '#F7D58A'); el(vx - 4, vy - 4, 7, 6, 'rgba(255,248,220,0.8)');
    c.strokeStyle = '#6E4A33'; c.lineWidth = 3; c.beginPath(); c.moveTo(vx - 17, vy); c.lineTo(vx + 17, vy); c.moveTo(vx, vy - 17); c.lineTo(vx, vy + 17); c.stroke();
    // maceta con flores bajo la ventana
    c.fillStyle = '#7A5236'; c.fillRect(vx - 28, vy + 24, 56, 13);
    const flor = (fx, fy, col) => { for (let a = 0; a < 5; a++) el(fx + Math.cos(a * 1.26) * 4, fy + Math.sin(a * 1.26) * 4, 3.4, 3.4, col); el(fx, fy, 2.4, 2.4, '#F2D24A'); };
    el(vx - 18, vy + 23, 8, 5, '#4F8A3E'); el(vx + 2, vy + 22, 9, 5, '#4F8A3E'); el(vx + 20, vy + 23, 8, 5, '#4F8A3E');
    flor(vx - 18, vy + 17, '#E98793'); flor(vx, vy + 15, '#D9606E'); flor(vx + 18, vy + 17, '#FFF1D6');
    // farolito
    c.strokeStyle = '#3A2416'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 46, techo + 30); c.lineTo(x + 46, techo + 42); c.stroke();
    el(x + 46, techo + 52, 16, 16, 'rgba(247,200,112,0.25)'); c.fillStyle = '#F7C870'; c.fillRect(x + 40, techo + 42, 12, 16);
    c.strokeStyle = '#3A2416'; c.strokeRect(x + 40, techo + 42, 12, 16);
    // puerta: hueco cálido por dentro y la hoja que gira sobre la bisagra izquierda
    const pw = 50, ph = 88, px = x - pw / 2 + 14, py = S - ph;
    c.fillStyle = '#5A3B26'; c.beginPath(); c.roundRect(px - 5, py - 5, pw + 10, ph + 5, [26, 26, 0, 0]); c.fill();
    c.fillStyle = '#3A2416'; c.beginPath(); c.roundRect(px, py, pw, ph, [22, 22, 0, 0]); c.fill();
    if (abierta > 0) { el(px + pw / 2, py + ph * 0.55, pw * 0.42, ph * 0.4, `rgba(247,200,112,${0.45 * abierta})`); }
    const ancho = pw * (1 - abierta * 0.85);
    c.fillStyle = '#7A4A2C'; c.beginPath(); c.roundRect(px, py, ancho, ph, [Math.min(22, ancho / 2), Math.min(22, ancho / 2), 0, 0]); c.fill();
    if (ancho > 14) {
      c.strokeStyle = '#5E3820'; c.lineWidth = 2;
      for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(px + ancho * k / 3, py + 8); c.lineTo(px + ancho * k / 3, S); c.stroke(); }
      el(px + ancho - 9, py + ph * 0.55, 3.5, 3.5, '#E8B04A');
      // corazón en la puerta
      const hx = px + ancho / 2, hy = py + 24, k = ancho / pw;
      c.fillStyle = '#D9606E'; c.beginPath(); c.moveTo(hx, hy + 6); c.bezierCurveTo(hx - 9 * k, hy, hx - 5 * k, hy - 8, hx, hy - 3); c.bezierCurveTo(hx + 5 * k, hy - 8, hx + 9 * k, hy, hx, hy + 6); c.fill();
    }
    // flores al pie de la casa
    for (let k = 0; k < 7; k++) {
      const fx = L + 8 + k * 32;
      if (fx > px - 12 && fx < px + pw + 12) continue;
      el(fx, S - 4, 10, 6, '#4F8A3E');
      flor(fx, S - 11 + Math.sin(t * 2 + k) * 0.8, ['#E98793', '#F2B33D', '#FFF1D6', '#D9606E'][k % 4]);
    }
  },

  // ---------- Árbol grande con ramas para trepar ----------

  arbolGrande(ctx, x, t) {
    const c = ctx, S = this.SUELO, el = (a, b, rx, ry, col) => this.el(c, a, b, rx, ry, col);
    el(x, S + 2, 60, 7, 'rgba(30,46,20,0.45)');
    // raíces
    c.fillStyle = '#4A3020';
    c.beginPath(); c.moveTo(x - 30, S - 30); c.quadraticCurveTo(x - 40, S - 4, x - 62, S); c.lineTo(x + 62, S); c.quadraticCurveTo(x + 40, S - 4, x + 30, S - 30); c.fill();
    // tronco
    c.fillStyle = '#5C3D27'; c.fillRect(x - 30, 0, 60, S - 20);
    c.fillStyle = '#4A3020'; c.fillRect(x + 8, 0, 22, S - 20);
    c.strokeStyle = '#3E2818'; c.lineWidth = 2; c.lineCap = 'round';
    for (let k = 0; k < 7; k++) {
      const yy = 40 + k * 52, xx = x - 20 + (k % 3) * 12;
      c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 3, yy + 14, xx - 1, yy + 28); c.stroke();
    }
    el(x - 6, S - 110, 7, 10, '#2E1C10'); el(x - 6, S - 108, 4, 6, '#1A100A');
    // copa propia, más oscura
    el(x - 50, 40, 70, 42, '#2F4A1C'); el(x + 50, 30, 72, 40, '#2B4419'); el(x, 60, 80, 40, '#36521F');
  },

  rama(ctx, p, t) {
    const c = ctx, el = (a, b, rx, ry, col) => this.el(c, a, b, rx, ry, col);
    c.strokeStyle = '#5C3D27'; c.lineWidth = 11; c.lineCap = 'round';
    if (p.lado === -1) { c.beginPath(); c.moveTo(p.x + p.w - 10, p.y + 6); c.lineTo(p.troncoX - 26, p.y + 26); c.stroke(); }
    if (p.lado === 1) { c.beginPath(); c.moveTo(p.x + 10, p.y + 6); c.lineTo(p.troncoX + 26, p.y + 26); c.stroke(); }
    c.fillStyle = '#6E4A33'; c.beginPath(); c.roundRect(p.x, p.y, p.w, 13, 6); c.fill();
    c.fillStyle = '#946A47'; c.beginPath(); c.roundRect(p.x + 3, p.y, p.w - 6, 4, 2); c.fill();
    const v = Math.sin(t * 1.6 + p.x) * 1.5;
    const hojas = hx => { el(hx + v, p.y - 2, 13, 9, '#4F7F3E'); el(hx + 9 + v, p.y + 4, 10, 8, '#5E9C46'); el(hx - 8 + v, p.y + 5, 9, 7, '#5E9C46'); el(hx + 3 + v, p.y - 6, 3, 2.5, '#E8792A'); };
    if (p.lado === -1) hojas(p.x + 4);
    else if (p.lado === 1) hojas(p.x + p.w - 6);
    else { hojas(p.x + 2); hojas(p.x + p.w - 4); }
  },

  // ---------- Vida del bosque (solo adorno) ----------

  // Bichitos que van y vienen por el sendero (coordenadas del mundo)
  bichitos(ctx, cam, t) {
    const S = this.SUELO;
    for (let k = 0; k < 9; k++) {
      const base = 450 + k * 640;
      if (base < cam - 200 || base > cam + this.W + 200) continue;
      const ciclo = (t * 14 + k * 37) % 240, ida = ciclo < 120;
      const x = base + (ida ? ciclo : 240 - ciclo), y = S + 30 + (k % 3) * 8;
      const pata = Math.sin(t * 18 + k) * 1.5;
      ctx.save(); ctx.translate(x, y); ctx.scale(ida ? 1 : -1, 1);
      ctx.strokeStyle = '#1E2A3A'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(-6, 5 + pata); ctx.moveTo(0, 2); ctx.lineTo(0, 5 - pata); ctx.moveTo(4, 2); ctx.lineTo(6, 5 + pata); ctx.stroke();
      this.el(ctx, 0, 0, 7, 4.5, k % 2 ? '#2E4A6B' : '#7A2E2E'); this.el(ctx, 7, -0.5, 3, 3, '#1E2A3A');
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 4); ctx.stroke();
      ctx.restore();
    }
  },
  // Mariposas que revolotean (mundo)
  mariposas(ctx, cam, t) {
    const cols = ['#F2B33D', '#E98793', '#FFF1D6', '#9CC4D8'];
    for (let k = 0; k < 10; k++) {
      const base = 380 + k * 560;
      if (base < cam - 200 || base > cam + this.W + 200) continue;
      const x = base + Math.sin(t * 0.45 + k * 1.7) * 90, y = 300 + Math.sin(t * 1.1 + k * 2.3) * 45 - (k % 2) * 60;
      const ala = 0.25 + Math.abs(Math.sin(t * 11 + k)) * 0.75;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = cols[k % cols.length];
      ctx.save(); ctx.scale(ala, 1); ctx.beginPath(); ctx.ellipse(-5, -3, 5, 6, 0.4, 0, 6.3); ctx.ellipse(5, -3, 5, 6, -0.4, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-4, 4, 3.5, 4, -0.3, 0, 6.3); ctx.ellipse(4, 4, 3.5, 4, 0.3, 0, 6.3); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#3A2416'; ctx.fillRect(-1, -6, 2, 12);
      ctx.restore();
    }
  },
  // Ardillita que se asoma de vez en cuando detrás de los arbustos del fondo (mundo)
  asomados(ctx, cam, t) {
    for (let k = 0; k < 6; k++) {
      const x = 700 + k * 980;
      if (x < cam - 100 || x > cam + this.W + 100) continue;
      const s = Math.sin(t * 0.5 + k * 2.1);
      if (s < 0.55) continue;
      const sube = Math.min(1, (s - 0.55) / 0.2) * 22, y = 352 - sube;
      this.el(ctx, x, y, 11, 10, '#8A6E55');
      ctx.fillStyle = '#8A6E55'; ctx.beginPath(); ctx.moveTo(x - 9, y - 5); ctx.lineTo(x - 6, y - 16); ctx.lineTo(x - 2, y - 8); ctx.moveTo(x + 9, y - 5); ctx.lineTo(x + 6, y - 16); ctx.lineTo(x + 2, y - 8); ctx.fill();
      const parpadeo = (t * 1.3 + k) % 4 < 0.15;
      this.el(ctx, x - 4, y - 1, 2, parpadeo ? 0.4 : 2.2, '#1E1E1A'); this.el(ctx, x + 4, y - 1, 2, parpadeo ? 0.4 : 2.2, '#1E1E1A');
      this.el(ctx, x, y + 3, 1.8, 1.4, '#3A2416');
      this.el(ctx, x - 18, 356, 16, 12, '#7C8040'); this.el(ctx, x + 16, 357, 15, 11, '#7C8040'); this.el(ctx, x, 360, 18, 10, '#868A46');
    }
  },
  pez(ctx, x, y, dir, col, t, giro) {
    const c = ctx, cola = Math.sin(t * 9) * 0.35;
    c.save(); c.translate(x, y); c.scale(dir, 1); if (giro) c.rotate(-giro);
    c.fillStyle = col;
    c.save(); c.translate(-9, 0); c.rotate(cola); c.beginPath(); c.moveTo(0, 0); c.lineTo(-9, -6); c.lineTo(-9, 6); c.closePath(); c.fill(); c.restore();
    this.el(c, 0, 0, 11, 6.5, col);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(1, -2, 6, 2, 0, 0, Math.PI * 2); c.fill();
    this.el(c, 6, -1.5, 1.8, 1.8, '#FFFFFF'); this.el(c, 6.4, -1.5, 1, 1, '#1E1E1A');
    c.restore();
  },
  // Tortuguita que camina despacio por el sendero; si Emily se acerca, se esconde en el caparazón
  tortugas(ctx, cam, t, conejoX) {
    const S = this.SUELO;
    for (let k = 0; k < 4; k++) {
      const base = 1100 + k * 1500;
      if (base < cam - 300 || base > cam + this.W + 300) continue;
      const ciclo = (t * 7 + k * 60) % 360, ida = ciclo < 180;
      const x = base + (ida ? ciclo : 360 - ciclo), y = S + 34;
      const escondida = Math.abs(conejoX - x) < 90;
      const c = ctx, el = (a, b, rx, ry, col) => this.el(c, a, b, rx, ry, col);
      c.save(); c.translate(x, y); c.scale(ida ? 1 : -1, 1);
      el(0, 3, 20, 4, 'rgba(30,46,20,0.4)');
      if (!escondida) {
        const p = Math.sin(t * 6 + k) * 2;
        el(-11 + p, 1, 4, 3, '#8DB86A'); el(9 - p, 1, 4, 3, '#8DB86A');
        el(18, -5, 6, 5, '#8DB86A'); el(20, -6.5, 1.3, 1.3, '#1E1E1A');
        c.strokeStyle = '#3A3A32'; c.lineWidth = 1; c.beginPath(); c.arc(20, -4, 2, 0.2, 1.4); c.stroke();
      }
      c.fillStyle = '#6E8A3A'; c.beginPath(); c.ellipse(0, -2, 17, 13, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#5A7330'; c.fillRect(-17, -3, 34, 3);
      c.strokeStyle = '#A9B86A'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-8, -3); c.lineTo(-5, -11); c.lineTo(5, -11); c.lineTo(8, -3); c.moveTo(-5, -11); c.lineTo(-11, -9); c.moveTo(5, -11); c.lineTo(11, -9); c.stroke();
      c.restore();
    }
  },
  // Cosas de pantalla: luciérnagas, ojitos en los arbustos y un pájaro que cruza
  ambiente(ctx, t) {
    const { W, H } = this;
    for (let k = 0; k < 10; k++) {
      const lado = k % 2 ? W - 80 - (k * 13) % 90 : 70 + (k * 17) % 100;
      const x = lado + Math.sin(t * 0.7 + k * 3) * 25, y = 140 + (k * 37) % 260 + Math.cos(t * 0.5 + k) * 18;
      const a = 0.25 + 0.5 * Math.max(0, Math.sin(t * 2 + k * 1.9));
      this.el(ctx, x, y, 6, 6, `rgba(247,220,120,${a * 0.25})`); this.el(ctx, x, y, 2.2, 2.2, `rgba(255,240,170,${a})`);
    }
    const ojos = (x, y, fase) => {
      const c = (t + fase) % 14;
      if (c > 3) return;
      const parpadeo = c > 1.4 && c < 1.55;
      this.el(ctx, x - 6, y, 3.6, parpadeo ? 0.6 : 4, '#F7E9B0'); this.el(ctx, x + 6, y, 3.6, parpadeo ? 0.6 : 4, '#F7E9B0');
      this.el(ctx, x - 5, y + 0.5, 1.6, parpadeo ? 0.3 : 2, '#1E1E1A'); this.el(ctx, x + 7, y + 0.5, 1.6, parpadeo ? 0.3 : 2, '#1E1E1A');
    };
    ojos(70, H - 30, 0); ojos(W - 70, H - 32, 7);
    const ciclo = (t * 80) % 2400;
    if (ciclo < W + 120) {
      const x = W + 60 - ciclo, y = 92 + Math.sin(t * 2) * 10, ala = Math.sin(t * 14) * 6;
      ctx.strokeStyle = '#2E3A26'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 10, y - ala); ctx.quadraticCurveTo(x - 4, y - 2, x, y); ctx.quadraticCurveTo(x + 4, y - 2, x + 10, y - ala); ctx.stroke();
    }
  },

  // Oscuridad con un círculo de luz alrededor de Emily (cueva)
  oscuridad(ctx, sx, sy, radio, fuerza) {
    const { W, H } = this;
    const g = ctx.createRadialGradient(sx, sy, radio * 0.3, sx, sy, radio);
    g.addColorStop(0, 'rgba(8,10,6,0)');
    g.addColorStop(1, `rgba(8,10,6,${fuerza})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
};
