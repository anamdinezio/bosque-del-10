// Utilidades generales: azar, guardado, sonido y voz.

const U = {
  rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  mezclar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  // 4 opciones distintas y no negativas, con la respuesta entre ellas
  opciones(resp, extra) {
    const s = new Set([resp]);
    for (const v of U.mezclar((extra || []).filter(v => Number.isInteger(v) && v >= 0 && v !== resp))) {
      if (s.size < 4) s.add(v);
    }
    let d = 1;
    while (s.size < 4) {
      const v = resp + (Math.random() < 0.5 ? -d : d);
      if (v >= 0) s.add(v);
      if (Math.random() < 0.5) d++;
      if (d > 12) d = 1;
    }
    return U.mezclar([...s]);
  },
  tieneCifra(n, d) { return String(n).includes(String(d)); },
  calc(a, op, b) {
    if (op === '+') return a + b;
    if (op === '−') return a - b;
    if (op === '×') return a * b;
    return a / b;
  },
  lerp(a, b, t) { return a + (b - a) * t; }
};

const Guardado = {
  clave: 'bosque-emily-v1',
  datos: { estrellas: {}, ajustes: { voz: 0.8, sonido: 0.6, musica: 0.35, vozMaquina: true } },
  cargar() {
    try {
      const t = localStorage.getItem(this.clave);
      if (t) {
        const d = JSON.parse(t);
        this.datos.estrellas = d.estrellas || {};
        Object.assign(this.datos.ajustes, d.ajustes || {});
      }
    } catch (e) { /* sin almacenamiento: se juega igual */ }
  },
  guardar() {
    try { localStorage.setItem(this.clave, JSON.stringify(this.datos)); } catch (e) { }
  }
};

const Sonido = {
  ctx: null, sfx: null, mus: null,
  iniciar() {
    if (this.ctx) { this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.sfx = this.ctx.createGain();
      this.mus = this.ctx.createGain();
      this.sfx.connect(this.ctx.destination);
      this.mus.connect(this.ctx.destination);
      this.volumenes();
      this.musica();
    } catch (e) { this.ctx = null; }
  },
  volumenes() {
    if (!this.ctx) return;
    const a = Guardado.datos.ajustes;
    this.sfx.gain.value = a.sonido;
    this.mus.gain.value = a.musica * 0.6;
  },
  nota(freq, dur, tipo, vol, destino, cuando, freqFin) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + (cuando || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = tipo || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (freqFin) o.frequency.exponentialRampToValueAtTime(freqFin, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(destino || this.sfx);
    o.start(t);
    o.stop(t + dur + 0.05);
  },
  // Sonidos cortos y agudos, sin tonos graves
  bien() { [784, 988, 1175].forEach((f, i) => this.nota(f, 0.3, 'sine', 0.16, null, i * 0.08)); },
  mal() { this.nota(660, 0.18, 'sine', 0.1); this.nota(587, 0.22, 'sine', 0.08, null, 0.1); },
  salto() { this.nota(700, 0.14, 'sine', 0.07, null, 0, 1100); },
  portal() { [880, 1047, 1319, 1568].forEach((f, i) => this.nota(f, 0.4, 'sine', 0.08, null, i * 0.07)); },
  estrella(i) { this.nota(1047 + i * 220, 0.35, 'sine', 0.14, null, i * 0.25); },
  hoja() { this.nota(1400, 0.35, 'sine', 0.04, null, 0, 1000); },

  // Fondo de bosque: viento suave y pajaritos de vez en cuando
  musica() {
    const c = this.ctx;
    const largo = c.sampleRate * 4;
    const buf = c.createBuffer(1, largo, c.sampleRate);
    const datos = buf.getChannelData(0);
    let ultimo = 0;
    for (let i = 0; i < largo; i++) { ultimo = (ultimo + 0.02 * (Math.random() * 2 - 1)) / 1.02; datos[i] = ultimo * 3; }
    const ruido = c.createBufferSource();
    ruido.buffer = buf; ruido.loop = true;
    const filtro = c.createBiquadFilter();
    filtro.type = 'bandpass'; filtro.frequency.value = 900; filtro.Q.value = 0.6;
    const viento = c.createGain();
    viento.gain.value = 0.05;
    const lfo = c.createOscillator(), lfoGain = c.createGain();
    lfo.frequency.value = 0.07; lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain); lfoGain.connect(viento.gain);
    ruido.connect(filtro); filtro.connect(viento); viento.connect(this.mus);
    ruido.start(); lfo.start();
    const pajarito = () => {
      if (Guardado.datos.ajustes.musica > 0) {
        const base = 2600 + Math.random() * 1400, notas = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < notas; i++) {
          const f = base + (Math.random() * 600 - 300);
          this.nota(f, 0.09, 'sine', 0.035, this.mus, i * 0.13, f * (Math.random() < 0.5 ? 1.25 : 0.8));
        }
      }
      setTimeout(pajarito, 2500 + Math.random() * 5000);
    };
    setTimeout(pajarito, 1500);
  }
};

// Voz de Ocre: cada frase se busca grabada en audio/ocre/<id>.mp3 (lista en audio/ocre/lista.js).
// Lo que no está grabado (por ejemplo las cuentas) solo se lee en pantalla, salvo que se active
// la voz de la computadora en Ajustes.
const Voz = {
  voz: null, cola: [], audio: null, turno: 0,
  // Mismo id en el navegador y en las herramientas de node
  id(frase) {
    let h = 5381;
    for (const ch of frase) h = ((h * 33) ^ ch.codePointAt(0)) >>> 0;
    return h.toString(36);
  },
  frases(t) {
    return t.split(/(?<=[.!?])\s+(?=[¡¿A-ZÁÉÍÓÚÑ0-9])/).map(s => s.trim()).filter(Boolean);
  },
  grabada(frase) { return !!(typeof window !== 'undefined' && window.AUDIOS_OCRE && window.AUDIOS_OCRE[this.id(frase)]); },
  voces() {
    if (typeof speechSynthesis === 'undefined') return [];
    return speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
  },
  // Primero las neuronales ("Natural"/"Online") de Latinoamérica; las de España al final
  puntaje(v) {
    const n = v.name.toLowerCase(), l = v.lang.toLowerCase();
    let p = 0;
    if (n.includes('natural') || n.includes('online')) p += 100;
    if (n.includes('google')) p += 40;
    if (/es-(ar|mx|us|419|co|cl|uy|pe)/.test(l)) p += 30;
    if (l === 'es-es') p -= 20;
    return p;
  },
  elegirVoz() {
    const voces = this.voces();
    if (!voces.length) return;
    const guardada = Guardado.datos.ajustes.vozNombre;
    this.voz = voces.find(v => v.name === guardada) || voces.slice().sort((a, b) => this.puntaje(b) - this.puntaje(a))[0];
  },
  esNatural() { return !!this.voz && /natural|online/i.test(this.voz.name); },
  // Convierte los símbolos de las cuentas en palabras (solo para la voz de la computadora)
  texto(t) {
    return t
      .replace(/×/g, ' por ')
      .replace(/÷/g, ' dividido ')
      .replace(/−/g, ' menos ')
      .replace(/\+/g, ' más ')
      .replace(/=/g, ' es igual a ')
      .replace(/(^|\s)\?(?=\s|$|,|\.)/g, ' cuánto ')
      .replace(/←/g, 'izquierda').replace(/→/g, 'derecha').replace(/↑/g, 'arriba');
  },
  hablar(t) {
    this.callar();
    if (Guardado.datos.ajustes.voz <= 0) return;
    this.cola = this.frases(t);
    this.siguiente(++this.turno);
  },
  siguiente(turno) {
    if (turno !== this.turno) return;
    const frase = this.cola.shift();
    if (!frase) return;
    const vol = Guardado.datos.ajustes.voz;
    const seguir = () => this.siguiente(turno);
    if (this.grabada(frase)) {
      const a = new Audio('audio/ocre/' + this.id(frase) + '.mp3');
      a.volume = Math.min(1, vol);
      a.onended = seguir; a.onerror = seguir;
      this.audio = a;
      a.play().catch(seguir);
    } else if (Guardado.datos.ajustes.vozMaquina && typeof speechSynthesis !== 'undefined') {
      try {
        if (!this.voz) this.elegirVoz();
        const u = new SpeechSynthesisUtterance(this.texto(frase));
        u.lang = this.voz ? this.voz.lang : 'es-ES';
        if (this.voz) u.voice = this.voz;
        u.volume = vol * 0.85; u.rate = 0.86; u.pitch = this.esNatural() ? 1 : 0.9;
        u.onend = seguir; u.onerror = seguir;
        speechSynthesis.speak(u);
      } catch (e) { seguir(); }
    } else {
      seguir();
    }
  },
  callar() {
    this.cola = []; this.turno++;
    if (this.audio) { this.audio.pause(); this.audio = null; }
    try { speechSynthesis.cancel(); } catch (e) { }
  }
};
if (typeof speechSynthesis !== 'undefined') speechSynthesis.onvoiceschanged = () => Voz.elegirVoz();
