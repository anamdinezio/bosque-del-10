// Motor del juego: pantallas, movimiento, desafíos, portales y ventanas.

const TRAMO = 720; // distancia entre desafíos
const W = 960, H = 540, SUELO = C.SUELO, G = 1900, SALTO = 600, VEL = 230, HW = 14;
const $ = s => document.querySelector(s);
const lienzo = $('#lienzo'), ctx = lienzo.getContext('2d');
const TODO_ABIERTO = new URLSearchParams(location.search).has('todo');

const J = {
  pantalla: 'inicio', cap: 1, niv: 1, nivel: null,
  conejo: null, teclas: { izq: false, der: false, arriba: false },
  cam: 0, t: 0, errores: 0, script: null, aviso: 0,
  caido: false, caida: null, terminado: false, gotas: []
};

// Gotas de agua y burbujas
function salpicar(x, y, n) {
  for (let i = 0; i < n; i++) J.gotas.push({ x: x + U.rnd(-12, 12), y, vx: U.rnd(-90, 90), vy: -U.rnd(120, 300), r: U.rnd(2, 4), vida: 1 });
}
function moverGotas(dt) {
  for (const g of J.gotas) {
    g.vida -= dt * (g.burbuja ? 0.8 : 1.2);
    if (!g.burbuja) g.vy += 900 * dt;
    g.x += g.vx * dt; g.y += g.vy * dt;
  }
  J.gotas = J.gotas.filter(g => g.vida > 0 && (g.burbuja || g.y < SUELO + 40));
}

// ---------- Progreso ----------

const clave = (c, n) => c + '-' + n;
const estrellasDe = (c, n) => Guardado.datos.estrellas[clave(c, n)] || 0;
function desbloqueado(c, n) {
  if (TODO_ABIERTO) return true;
  if (c === 1 && n === 1) return true;
  if (n === 1) return estrellasDe(c - 1, 10) > 0;
  return estrellasDe(c, n - 1) > 0;
}
const poderGanado = id => desbloqueado(PODERES[id].cap, PODERES[id].niv);

// ---------- Construcción del nivel ----------

function construirNivel(c, n) {
  const disp = ORDEN_PODERES.filter(id => { const p = PODERES[id]; return p.cap < c || (p.cap === c && p.niv <= n); });
  const nuevo = ORDEN_PODERES.find(id => PODERES[id].cap === c && PODERES[id].niv === n) || null;
  const posObs = n === 10 ? [1, 3, 5, 7] : [1, 4, 6];
  const obs = nuevo ? [nuevo] : [];
  let bolsa = U.mezclar(disp.filter(x => x !== nuevo));
  while (obs.length < posObs.length) {
    if (!bolsa.length) bolsa = U.mezclar(disp);
    obs.push(bolsa.pop());
  }
  const posArbol = n === 10 ? [2, 6] : [3];
  const desafios = [], plataformas = [], troncos = [];
  let k = 0;
  for (let i = 0; i < 8; i++) {
    const x = 600 + i * TRAMO;
    if (posArbol.includes(i)) {
      // Árbol grande: el tronco no deja pasar por abajo; se sube por las ramas,
      // arriba espera un animal y se baja por las ramas del otro lado.
      const arriba = SUELO - 205;
      troncos.push({ x: x - 30, w: 60, h: 195 });
      plataformas.push(
        // las ramas de subida llegan hasta el tronco, así no se cae en el hueco
        { x: x - 165, w: 135, y: SUELO - 72, lado: -1, troncoX: x },
        { x: x - 108, w: 78, y: SUELO - 140, lado: -1, troncoX: x },
        { x: x - 62, w: 154, y: arriba, lado: 0, troncoX: x },
        { x: x + 92, w: 72, y: SUELO - 135, lado: 1, troncoX: x },
        { x: x + 162, w: 76, y: SUELO - 68, lado: 1, troncoX: x }
      );
      desafios.push({ clase: 'arbol', x, animalX: x + 44, arriba, barrera: x - 2, resuelto: false, salida: 0 });
    } else if (posObs.includes(i)) {
      const poder = obs[k++], tipo = PODERES[poder].obst, w = ANCHO_OBST[tipo];
      desafios.push({
        clase: 'obst', poder, tipo, x, w, resuelto: false, conPoder: false,
        portalX: tipo === 'oso' ? x - 60 : x - 230,
        barrera: tipo === 'oso' ? x + 30 : x - 4,
        dx: 0, alpha: 1, oculto: false, osoX: null, portalAlpha: 1
      });
    } else {
      desafios.push({ clase: 'animal', x, barrera: x - 46, resuelto: false, salida: 0 });
    }
  }
  // Cosas chicas para saltar, distintas en cada tramo
  const tipos = ['piedra', 'hongo', 'tronquito', 'planta', 'calabaza'];
  const altos = { piedra: 30, hongo: 36, tronquito: 30, planta: 34, calabaza: 32 };
  const cosa = x => { const tipo = U.pick(tipos); return { x, w: 46, h: altos[tipo], tipo }; };
  const piedritas = [cosa(330)];
  for (let i = 0; i < 7; i++) piedritas.push(cosa(600 + i * TRAMO + 430)); // el último tramo queda libre para la casita
  return { desafios, piedritas, plataformas, troncos, fin: 600 + 7 * TRAMO + 560, nuevo, avisoArbol: false };
}

function nuevoConejo(x) {
  return { x, y: SUELO, vy: 0, dir: 1, fase: 0, enSuelo: true, caminando: false, modo: 'normal' };
}

const desafioActual = () => J.nivel.desafios.find(d => !d.resuelto) || null;

// ---------- Pantallas ----------

function mostrarSolo(id) {
  for (const el of document.querySelectorAll('.pantalla')) el.hidden = el.id !== id;
}

function irAlInicio() {
  J.pantalla = 'inicio'; $('#hud').hidden = true; $('#controles-tactiles').hidden = true;
  mostrarSolo('pantalla-inicio');
}

let capMapa = 1;
function irAlMapa(cap) {
  Voz.callar();
  cerrarCapas();
  J.pantalla = 'mapa'; J.caido = false; lienzo.classList.remove('gris');
  $('#hud').hidden = true; $('#controles-tactiles').hidden = true; $('#cuenta-activa').hidden = true;
  if (cap) capMapa = cap;
  mostrarSolo('pantalla-mapa');
  dibujarMapa();
}

function dibujarMapa() {
  const tabs = $('#mapa-capitulos');
  tabs.innerHTML = '';
  CAPITULOS.forEach(cap => {
    const b = document.createElement('button');
    b.className = 'cap-btn' + (cap.id === capMapa ? ' activo' : '');
    b.disabled = !desbloqueado(cap.id, 1);
    b.innerHTML = `<span class="cap-nombre">${cap.nombre}</span><span class="cap-lugar">${cap.lugar}</span>`;
    b.onclick = () => { capMapa = cap.id; dibujarMapa(); };
    tabs.appendChild(b);
  });
  const prox = document.createElement('button');
  prox.className = 'cap-btn'; prox.disabled = true;
  prox.innerHTML = '<span class="cap-nombre">Fracciones</span><span class="cap-lugar">Próximamente</span>';
  tabs.appendChild(prox);

  const cap = CAPITULOS[capMapa - 1];
  const cont = $('#mapa-niveles');
  cont.innerHTML = '';
  cap.niveles.forEach((nv, i) => {
    const n = i + 1, b = document.createElement('button');
    const abierto = desbloqueado(cap.id, n);
    b.className = 'nivel-btn'; b.disabled = !abierto;
    b.innerHTML = `<span class="nivel-num">${n}</span><span class="nivel-tit">${nv.titulo}</span>${abierto ? D.estrellas(estrellasDe(cap.id, n)) : '<span class="candado">Cerrado</span>'}`;
    b.onclick = () => iniciarNivel(cap.id, n);
    cont.appendChild(b);
  });
}

// ---------- Inicio de nivel ----------

async function iniciarNivel(c, n) {
  cerrarCapas();
  J.cap = c; J.niv = n; J.nivel = construirNivel(c, n);
  J.errores = 0; J.script = null; J.caido = false; J.caida = null; J.terminado = false; J.puerta = 0;
  J.conejo = nuevoConejo(200); J.cam = 0; J.checkpoint = 200;
  lienzo.classList.remove('gris'); $('#aviso-caida').hidden = true; $('#cuenta-activa').hidden = true;
  J.pantalla = 'nivel';
  mostrarSolo(null);
  $('#hud').hidden = false;
  $('#controles-tactiles').hidden = !esTactil();
  const cap = CAPITULOS[c - 1], nv = cap.niveles[n - 1];
  $('#titulo-nivel').textContent = `${cap.nombre} · Nivel ${n}: ${nv.titulo}`;
  const pasos = [];
  if (n === 1) pasos.push(...cap.intro());
  pasos.push({ texto: nv.explica, visual: nv.ejemplo ? nv.ejemplo() : '' });
  if (J.nivel.nuevo) {
    const p = PODERES[J.nivel.nuevo];
    pasos.push({ texto: TXT.ganaste(p), visual: D.tarjetaPoder(p.id) });
    pasos.push({ texto: TXT.comoUsar(p) });
  }
  await dialogo(pasos);
}

function esTactil() { return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; }

// ---------- Diálogo de Ocre ----------

let finDialogo = null;
function dialogo(pasos) {
  return new Promise(res => {
    let i = 0;
    soltarTeclas();
    const mostrar = () => {
      const p = pasos[i];
      $('#dialogo-texto').textContent = p.texto;
      $('#dialogo-visual').innerHTML = p.visual || '';
      $('#dialogo-visual').hidden = !p.visual;
      $('#dialogo-seguir').textContent = i < pasos.length - 1 ? 'Seguir' : '¡Vamos!';
      $('#dialogo').hidden = false;
      Voz.hablar(p.texto);
    };
    finDialogo = () => {
      i++;
      if (i < pasos.length) mostrar();
      else { $('#dialogo').hidden = true; finDialogo = null; Voz.callar(); res(); }
    };
    $('#dialogo-voz').onclick = () => Voz.hablar(pasos[i].texto);
    mostrar();
  });
}
$('#dialogo-seguir').onclick = () => finDialogo && finDialogo();

let tGlobo = null;
function globo(texto, ms = 5500) {
  $('#globo-texto').textContent = texto;
  $('#globo-ocre').hidden = false;
  Voz.hablar(texto);
  clearTimeout(tGlobo);
  tGlobo = setTimeout(() => { $('#globo-ocre').hidden = true; }, ms);
}

// ---------- Hoja que cae ----------

let rafHoja = null;
function caerHoja(xFin, yFin, alTerminar) {
  const el = $('#hoja-cayendo');
  cancelAnimationFrame(rafHoja);
  el.hidden = false;
  Sonido.hoja();
  const x0 = 62 + Math.random() * 14, y0 = -4, dur = 1500, t0 = performance.now();
  const paso = now => {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 2);
    const vaiven = Math.sin(p * Math.PI * 4) * 6 * (1 - p * 0.7);
    el.style.left = (x0 + (xFin - x0) * e + vaiven) + '%';
    el.style.top = (y0 + (yFin - y0) * e) + '%';
    el.style.transform = `translate(-50%,-50%) rotate(${Math.cos(p * Math.PI * 4) * 40 * (1 - p * 0.6)}deg)`;
    if (p < 1) rafHoja = requestAnimationFrame(paso);
    else {
      if (alTerminar) alTerminar();
      setTimeout(() => { el.hidden = true; }, 2600);
    }
  };
  rafHoja = requestAnimationFrame(paso);
}

function posPantalla(xMundo, yMundo) {
  return [((xMundo - J.cam) / W) * 100, (yMundo / H) * 100];
}

// ---------- Pistas ----------

function pedirPista() {
  if (!$('#panel-pregunta').hidden) return mostrarPistaPregunta();
  if (!$('#panel-portal').hidden) return mostrarPistaPortal();
  if (J.pantalla !== 'nivel' || hayCapa()) return;
  const c = J.conejo;
  const [px, py] = posPantalla(c.x - 40, c.y - 120);
  caerHoja(px, py, () => globo(textoPistaCamino()));
}

function textoPistaCamino() {
  if (J.caido) return TXT.pistaCaido;
  const d = desafioActual();
  if (!d) return TXT.pistaFin;
  if (d.clase === 'animal') return TXT.pistaAnimal(CAPITULOS[J.cap - 1].animalNombre);
  if (d.clase === 'arbol') return TXT.pistaArbol(CAPITULOS[J.cap - 1].animalNombre);
  const p = PODERES[d.poder];
  if (d.conPoder) return TXT.yaTienes(p);
  return TXT.necesitaPortal(p);
}

function mostrarPistaPregunta() {
  const q = J.preguntaActual;
  if (!q) return;
  caerHoja(22, 30, () => mostrarCajaPista($('#preg-pista'), q.pista));
}

function mostrarCajaPista(caja, pista) {
  caja.innerHTML = `<div class="pista-hoja">${D.hoja(true)}</div><div class="pista-cuerpo"><p>${pista.texto}</p>${pista.visual || ''}</div>`;
  caja.hidden = false;
  Voz.hablar(pista.texto);
  ligarMarcos(caja);
}

// ---------- Preguntas de los animales ----------

function hayCapa() { return !!document.querySelector('.capa:not([hidden]), #dialogo:not([hidden])'); }

function cerrarCapas() {
  for (const el of document.querySelectorAll('.capa')) el.hidden = true;
  $('#dialogo').hidden = true; finDialogo = null;
  $('#globo-ocre').hidden = true;
}

function abrirPregunta(d) {
  soltarTeclas();
  const cap = CAPITULOS[J.cap - 1];
  const q = cap.niveles[J.niv - 1].gen();
  J.preguntaActual = q;
  let intentos = 0, listo = false;
  $('#preg-titulo').textContent = `${cap.animalNombre} necesita tu ayuda`;
  $('#preg-texto').textContent = q.texto;
  $('#preg-sub').textContent = q.sub || '';
  $('#preg-sub').hidden = !q.sub;
  $('#preg-visual').innerHTML = q.visual || '';
  $('#preg-visual').hidden = !q.visual;
  $('#preg-pista').hidden = true;
  $('#preg-feedback').textContent = '';
  $('#preg-feedback').className = 'feedback';
  $('#preg-seguir').hidden = true;
  const resp = $('#preg-respuestas');
  resp.innerHTML = '';
  ligarMarcos($('#preg-visual'));
  $('#preg-voz').onclick = () => Voz.hablar(q.texto + (q.sub ? '. ' + q.sub : ''));

  const terminar = () => {
    $('#panel-pregunta').hidden = true;
    J.preguntaActual = null;
    d.resuelto = true;
    J.checkpoint = d.clase === 'arbol' ? d.x + 270 : d.x + 60;
  };
  const acierto = () => {
    listo = true;
    Sonido.bien();
    $('#preg-feedback').textContent = TXT.muyBien + ' ' + q.bien;
    $('#preg-feedback').className = 'feedback bien';
    Voz.hablar(TXT.muyBien + ' ' + q.bien);
    setTimeout(terminar, 1900);
  };
  const error = (alMostrarRespuesta) => {
    J.errores++; intentos++;
    Sonido.mal();
    if (intentos === 1) {
      $('#preg-feedback').textContent = TXT.casi;
      Voz.hablar(TXT.casi);
      $('#preg-feedback').className = 'feedback mal';
      caerHoja(22, 30, () => mostrarCajaPista($('#preg-pista'), q.pista));
    } else {
      listo = true;
      if (alMostrarRespuesta) alMostrarRespuesta();
      $('#preg-feedback').textContent = q.explica.texto;
      $('#preg-feedback').className = 'feedback explica';
      $('#preg-pista').hidden = true;
      if (q.explica.visual) { $('#preg-visual').innerHTML = q.explica.visual; $('#preg-visual').hidden = false; }
      Voz.hablar(q.explica.texto);
      $('#preg-seguir').hidden = false;
      $('#preg-seguir').onclick = terminar;
    }
  };

  if (q.tipo === 'opciones') {
    q.opciones.forEach(op => {
      const b = document.createElement('button');
      b.className = 'btn-opcion'; b.textContent = op;
      b.onclick = () => {
        if (listo) return;
        if (op === q.resp) { b.classList.add('bien'); acierto(); }
        else {
          b.classList.add('mal'); b.disabled = true;
          error(() => { for (const x of resp.children) if (x.textContent === String(q.resp)) x.classList.add('bien'); });
        }
      };
      resp.appendChild(b);
    });
  } else if (q.tipo === 'array') {
    armarGrilla(resp, q, () => listo, acierto, error);
  } else if (q.tipo === 'repartir') {
    armarReparto(resp, q, () => listo, acierto, error);
  }
  $('#panel-pregunta').hidden = false;
  Voz.hablar(q.texto + (q.sub ? '. ' + q.sub : ''));
}

// Marco de 10 tocable: los lugares vacíos se pintan al tocarlos
function ligarMarcos(raiz) {
  for (const celda of raiz.querySelectorAll('.marco.interactivo .celda')) {
    celda.onclick = () => {
      const on = celda.classList.toggle('pintada');
      celda.setAttribute('fill', on ? '#F3C79A' : 'transparent');
    };
  }
}

function armarGrilla(cont, q, estaListo, acierto, error) {
  let sel = { f: 0, c: 0 };
  const caja = document.createElement('div');
  caja.className = 'grilla-caja';
  const grilla = document.createElement('div');
  grilla.className = 'grilla';
  grilla.style.gridTemplateColumns = `repeat(${q.maxC}, 1fr)`;
  const etiqueta = document.createElement('div');
  etiqueta.className = 'grilla-etiqueta';
  etiqueta.textContent = 'Toca una casilla';
  const pintar = () => {
    for (const el of grilla.children) {
      const f = +el.dataset.f, c = +el.dataset.c;
      el.classList.toggle('on', f < sel.f && c < sel.c);
    }
    if (sel.f) etiqueta.textContent = `${sel.f} ${sel.f === 1 ? 'fila' : 'filas'} y ${sel.c} ${sel.c === 1 ? 'columna' : 'columnas'}`;
  };
  for (let f = 0; f < q.maxF; f++) for (let c = 0; c < q.maxC; c++) {
    const el = document.createElement('button');
    el.className = 'casilla'; el.dataset.f = f; el.dataset.c = c;
    el.setAttribute('aria-label', `${f + 1} filas y ${c + 1} columnas`);
    el.onclick = () => { if (estaListo()) return; sel = { f: f + 1, c: c + 1 }; pintar(); };
    grilla.appendChild(el);
  }
  const listoBtn = document.createElement('button');
  listoBtn.className = 'btn-accion'; listoBtn.textContent = 'Listo';
  listoBtn.onclick = () => {
    if (estaListo() || !sel.f) return;
    if (sel.f === q.resp.f && sel.c === q.resp.c) acierto();
    else error(() => { sel = { f: q.resp.f, c: q.resp.c }; pintar(); });
  };
  caja.append(grilla, etiqueta, listoBtn);
  cont.appendChild(caja);
}

function armarReparto(cont, q, estaListo, acierto, error) {
  let quedan = q.total, cuentas = Array(q.canastas).fill(0);
  const caja = document.createElement('div');
  caja.className = 'reparto';
  const monton = document.createElement('div');
  monton.className = 'monton';
  const filaCanastas = document.createElement('div');
  filaCanastas.className = 'canastas';
  const dibujar = () => {
    monton.innerHTML = quedan ? D.bayas(quedan) : '<span class="vacio">¡No quedan bayas!</span>';
    filaCanastas.innerHTML = '';
    cuentas.forEach((n, i) => {
      const b = document.createElement('button');
      b.className = 'canasta';
      b.setAttribute('aria-label', `Canasta ${i + 1}, tiene ${n}`);
      b.innerHTML = `<div class="canasta-bayas">${n ? D.bayas(n) : ''}</div><div class="canasta-num">${n}</div>`;
      b.onclick = () => {
        if (estaListo() || !quedan) return;
        cuentas[i]++; quedan--; Sonido.nota(900 + cuentas[i] * 60, 0.1, 'sine', 0.08);
        dibujar();
        if (!quedan) revisar();
      };
      filaCanastas.appendChild(b);
    });
  };
  const revisar = () => {
    if (cuentas.every(n => n === q.resp)) acierto();
    else {
      error(() => { cuentas = Array(q.canastas).fill(q.resp); quedan = 0; dibujar(); });
      if (!estaListo()) setTimeout(() => { quedan = q.total; cuentas = Array(q.canastas).fill(0); dibujar(); }, 1200);
    }
  };
  const reiniciar = document.createElement('button');
  reiniciar.className = 'btn-chico'; reiniciar.textContent = 'Empezar de nuevo';
  reiniciar.onclick = () => { if (estaListo()) return; quedan = q.total; cuentas = Array(q.canastas).fill(0); dibujar(); };
  caja.append(monton, filaCanastas, reiniciar);
  cont.appendChild(caja);
  dibujar();
}

// ---------- Portales ----------

function buscarCuentas(gen, num, cuantasMalas) {
  for (let i = 0; i < 400; i++) {
    const buena = gen(), rb = U.calc(buena.a, buena.op, buena.b);
    if (!U.tieneCifra(rb, num)) continue;
    const malas = [], vistas = new Set([`${buena.a}${buena.op}${buena.b}`]);
    for (let j = 0; j < 200 && malas.length < cuantasMalas; j++) {
      const m = gen(), rm = U.calc(m.a, m.op, m.b), k = `${m.a}${m.op}${m.b}`;
      if (!U.tieneCifra(rm, num) && !vistas.has(k)) { vistas.add(k); malas.push(m); }
    }
    if (malas.length === cuantasMalas) return { buena, malas };
  }
  return null;
}

function buscarCompletar(gen, num) {
  for (let i = 0; i < 400; i++) {
    const base = gen();
    if (base.op === '÷') return null;
    const a = base.op === '−' ? U.rnd(11, 18) : base.a;
    const cand = base.op === '+' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : base.op === '−' ? [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(b => b < a) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const buenas = cand.filter(b => U.tieneCifra(U.calc(a, base.op, b), num));
    const malas = cand.filter(b => !U.tieneCifra(U.calc(a, base.op, b), num));
    if (buenas.length && malas.length >= 3) return { a, op: base.op, buena: U.pick(buenas), malas: U.mezclar(malas).slice(0, 3) };
  }
  return null;
}

function abrirPortal(d) {
  soltarTeclas();
  Sonido.portal();
  const p = PODERES[d.poder], num = p.num;
  $('#portal-titulo').textContent = `Portal del ${num}: ${p.nombre}`;
  $('#portal-tarjeta').innerHTML = D.tarjetaPoder(p.id);
  $('#portal-pista').hidden = true;
  $('#portal-feedback').textContent = ''; $('#portal-feedback').className = 'feedback';
  const cont = $('#portal-opciones');
  cont.innerHTML = '';
  let listo = false;
  const exito = texto => {
    listo = true;
    Sonido.bien();
    const msg = `${texto}. ${TXT.tieneNum(p)}`;
    $('#portal-feedback').textContent = msg; $('#portal-feedback').className = 'feedback bien';
    Voz.hablar(msg);
    setTimeout(() => {
      $('#panel-portal').hidden = true;
      d.conPoder = true;
      $('#cuenta-activa').innerHTML = `<span class="cuenta-num">${num}</span> ${texto}`;
      $('#cuenta-activa').hidden = false;
    }, 2000);
  };
  const fallo = (b, texto, r) => {
    J.errores++;
    Sonido.mal();
    b.classList.add('mal'); b.disabled = true;
    const msg = `${texto} = ${r}, y ${r} no tiene un ${num}. ${TXT.pruebaOtra}`;
    $('#portal-feedback').textContent = msg; $('#portal-feedback').className = 'feedback mal';
    Voz.hablar(msg);
  };

  const completar = J.niv >= 6 && J.cap !== 4 ? buscarCompletar(cuentasPortal(J.cap, J.niv), num) : null;
  if (completar) {
    const { a, op } = completar;
    $('#portal-texto').textContent = `${a} ${op} ? `;
    $('#portal-sub').textContent = TXT.portalCompletarSub(p);
    J.pistaPortal = { texto: TXT.pistaPortalCompletar(p), visual: '' };
    U.mezclar([completar.buena, ...completar.malas]).forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'btn-opcion'; btn.textContent = b;
      const r = U.calc(a, op, b), texto = `${a} ${op} ${b}`;
      btn.onclick = () => {
        if (listo) return;
        if (U.tieneCifra(r, num)) { btn.classList.add('bien'); exito(`${texto} = ${r}`); }
        else fallo(btn, texto, r);
      };
      cont.appendChild(btn);
    });
  } else {
    const set = buscarCuentas(cuentasPortal(J.cap, J.niv), num, 2) || buscarCuentas(cuentasCapitulo(J.cap), num, 2) || buscarCuentas(cuentasCapitulo(1), num, 2);
    $('#portal-texto').textContent = TXT.portalElegir(p);
    $('#portal-sub').textContent = TXT.portalElegirSub;
    J.pistaPortal = { texto: TXT.pistaPortalElegir(p), visual: '' };
    U.mezclar([set.buena, ...set.malas]).forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'btn-opcion piedra';
      const texto = `${m.a} ${m.op} ${m.b}`, r = U.calc(m.a, m.op, m.b);
      btn.textContent = texto;
      btn.onclick = () => {
        if (listo) return;
        if (U.tieneCifra(r, num)) { btn.classList.add('bien'); btn.textContent = `${texto} = ${r}`; exito(`${texto} = ${r}`); }
        else { btn.textContent = `${texto} = ${r}`; fallo(btn, texto, r); }
      };
      cont.appendChild(btn);
    });
  }
  $('#portal-voz').onclick = () => Voz.hablar($('#portal-texto').textContent + '. ' + $('#portal-sub').textContent);
  $('#panel-portal').hidden = false;
  Voz.hablar($('#portal-texto').textContent + '. ' + $('#portal-sub').textContent);
}

function mostrarPistaPortal() {
  caerHoja(22, 30, () => mostrarCajaPista($('#portal-pista'), J.pistaPortal));
}

// ---------- Cruces con poder (animaciones) ----------

function iniciarCruce(d) {
  const c = J.conejo, x0 = c.x;
  c.dir = 1; c.vy = 0;
  let dur = 2, f, alFin = null;
  if (d.tipo === 'rio') {
    // baja por la orilla, nada con el agua al pecho y sale con las patas mojadas
    const A = SUELO + 18, hondo = A + 64, entra = d.x + 72, sale = d.x + d.w - 72, x1 = d.x + d.w + 24;
    let salpico1 = false, salpico2 = false;
    dur = 4.4;
    f = p => {
      c.caminando = true; c.enSuelo = false;
      if (p < 0.12) { const k = p / 0.12; c.x = U.lerp(x0, entra, k); c.y = U.lerp(SUELO, hondo, k * k); c.modo = 'normal'; }
      else if (p < 0.88) {
        const k = (p - 0.12) / 0.76;
        c.x = U.lerp(entra, sale, k); c.y = hondo + Math.sin(k * 26) * 3; c.modo = 'nadar';
        if (!salpico1) { salpicar(c.x, A, 16); salpico1 = true; }
        if (Math.random() < 0.18) salpicar(c.x + U.rnd(-14, 18), A, 1);
      } else {
        const k = (p - 0.88) / 0.12; c.x = U.lerp(sale, x1, k); c.y = U.lerp(hondo, SUELO, Math.sqrt(k)); c.modo = 'normal';
        if (!salpico2) { salpicar(c.x, A, 10); salpico2 = true; }
      }
    };
    alFin = () => { c.mojado = 3; };
  } else if (d.tipo === 'troncos') {
    const x1 = d.x + d.w + 44; dur = 1.2; Sonido.salto();
    f = p => { c.x = U.lerp(x0, x1, p); c.y = SUELO - 4 * 210 * p * (1 - p); c.enSuelo = p >= 1; c.caminando = false; };
  } else if (d.tipo === 'piedra') {
    dur = 2.4;
    f = p => {
      c.modo = 'empujar';
      if (p < 0.55) { const a = p / 0.55; c.x = x0 + 70 * a; d.dx = 70 * a; c.caminando = true; }
      else { const b = (p - 0.55) / 0.45; d.dx = 70 + 900 * b * b; d.alpha = 1 - b; c.caminando = false; }
    };
    alFin = () => { d.oculto = true; };
  } else if (d.tipo === 'precipicio') {
    const x1 = d.x + d.w + 44; dur = 2.3;
    f = p => { c.x = U.lerp(x0, x1, p); c.y = SUELO - 4 * 150 * p * (1 - p); c.modo = p < 0.97 ? 'volar' : 'normal'; c.caminando = false; };
  } else if (d.tipo === 'pared') {
    const top = SUELO - 180; dur = 3.2;
    f = p => {
      if (p < 0.45) { const a = p / 0.45; c.x = d.x - HW; c.y = SUELO - 180 * a; c.modo = 'escalar'; c.caminando = false; }
      else if (p < 0.65) { const b = (p - 0.45) / 0.2; c.x = U.lerp(d.x - HW, d.x + 45, b); c.y = top; c.modo = 'normal'; c.caminando = true; }
      else { const k = (p - 0.65) / 0.35; c.x = U.lerp(d.x + 45, d.x + d.w + 40, k); c.y = U.lerp(top, SUELO, k * k) - 40 * Math.sin(k * Math.PI); c.caminando = false; }
    };
  } else if (d.tipo === 'grunon') {
    dur = 3.2;
    J.burbujas = true;
    f = p => { d.contento = p > 0.35; d.alpha = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4; d.dy = p < 0.6 ? 0 : -60 * (p - 0.6) / 0.4; c.caminando = false; };
    alFin = () => { d.oculto = true; J.burbujas = false; };
  } else if (d.tipo === 'cueva') {
    const x1 = d.x + d.w + 40; dur = 3.4;
    f = p => { c.x = U.lerp(x0, x1, p); c.modo = 'ver'; c.caminando = true; J.enCueva = p < 0.98; };
    alFin = () => { J.enCueva = false; };
  } else if (d.tipo === 'oso') {
    dur = 3.6;
    const ox = d.osoX;
    f = p => {
      c.modo = 'arbusto'; c.caminando = false;
      if (p < 0.4) d.osoX = U.lerp(ox, c.x - 120, p / 0.4);
      else if (p < 0.65) d.olfatea = true;
      else { d.olfatea = false; d.osoDir = -1; d.osoX = U.lerp(c.x - 120, c.x - 900, (p - 0.65) / 0.35); }
    };
    alFin = () => { d.osoX = null; };
  }
  J.script = {
    t: 0, dur, f,
    fin: () => {
      if (alFin) alFin();
      c.modo = 'normal'; c.y = SUELO; c.enSuelo = true; c.caminando = false;
      d.resuelto = true;
      J.checkpoint = d.x + d.w + 60;
      $('#cuenta-activa').hidden = true;
    }
  };
}

// ---------- Caídas y volver atrás ----------

function caer(motivo) {
  if (J.caido) return;
  J.caido = true;
  soltarTeclas();
  Sonido.mal();
  setTimeout(() => {
    lienzo.classList.add('gris');
    $('#aviso-caida-texto').textContent = motivo + ' ' + TXT.volverAtras;
    $('#aviso-caida').hidden = false;
    $('#btn-volver').classList.add('llamando');
    Voz.hablar(motivo + ' ' + TXT.volverAtras);
  }, J.caida ? 900 : 300);
}

function volverAtras() {
  if (J.pantalla !== 'nivel' || J.script || J.terminado || hayCapa()) return;
  const d = desafioActual();
  J.caido = false; J.caida = null;
  lienzo.classList.remove('gris');
  $('#aviso-caida').hidden = true;
  $('#btn-volver').classList.remove('llamando');
  if (d && d.clase === 'obst') {
    d.conPoder = false; d.osoX = null; d.olfatea = false;
    $('#cuenta-activa').hidden = true;
    J.conejo = nuevoConejo(Math.max(120, (d.tipo === 'oso' ? d.x - 480 : d.portalX - 140)));
  } else {
    J.conejo = nuevoConejo(Math.max(120, J.checkpoint));
  }
  Voz.callar();
}

// ---------- Fin de nivel ----------

// Se abre la puerta de la casita, Emily entra y la puerta se cierra
function entrarCasita() {
  const c = J.conejo, x0 = c.x, puertaX = J.nivel.fin + 14;
  soltarTeclas();
  c.dir = 1; c.vy = 0; c.y = SUELO;
  Sonido.portal();
  J.script = {
    t: 0, dur: 3.2,
    f: p => {
      if (p < 0.3) { J.puerta = p / 0.3; c.caminando = false; }
      else if (p < 0.62) { const k = (p - 0.3) / 0.32; J.puerta = 1; c.x = U.lerp(x0, puertaX, k); c.caminando = true; c.fase += 0.2; }
      else if (p < 0.8) { const k = (p - 0.62) / 0.18; c.caminando = false; c.alpha = 1 - k; }
      else { c.alpha = 0; J.puerta = 1 - (p - 0.8) / 0.2; }
    },
    fin: () => { J.puerta = 0; terminarNivel(); }
  };
}

function terminarNivel() {
  J.terminado = true;
  soltarTeclas();
  const est = J.errores === 0 ? 3 : J.errores <= 2 ? 2 : 1;
  const k = clave(J.cap, J.niv);
  const antes = Guardado.datos.estrellas[k] || 0;
  Guardado.datos.estrellas[k] = Math.max(antes, est);
  Guardado.guardar();
  for (let i = 0; i < est; i++) Sonido.estrella(i);
  const ultimo = J.cap === CAPITULOS.length && J.niv === 10;
  const textos = TXT.fin;
  $('#fin-titulo').textContent = ultimo ? TXT.finTodo : TXT.finTitulo;
  $('#fin-estrellas').innerHTML = D.estrellas(est);
  $('#fin-texto').textContent = textos[est];
  $('#fin-siguiente').hidden = ultimo;
  $('#panel-fin').hidden = false;
  Voz.hablar(($('#fin-titulo').textContent) + ' ' + textos[est]);
}

$('#fin-siguiente').onclick = () => {
  const n = J.niv < 10 ? J.niv + 1 : 1, c = J.niv < 10 ? J.cap : J.cap + 1;
  iniciarNivel(c, n);
};
$('#fin-repetir').onclick = () => iniciarNivel(J.cap, J.niv);
$('#fin-mapa').onclick = () => irAlMapa(J.cap);

// ---------- Ventanas: poderes y ajustes ----------

function abrirPoderes() {
  soltarTeclas();
  const g = $('#poderes-grilla');
  g.innerHTML = '';
  $('#poderes-info').textContent = TXT.tocaPoder;
  ORDEN_PODERES.forEach(id => {
    const p = PODERES[id], tiene = poderGanado(id);
    const b = document.createElement('button');
    b.className = 'poder-btn' + (tiene ? '' : ' tapado');
    b.innerHTML = (tiene ? D.tarjetaPoder(id) : D.tapada()) + `<span>${tiene ? p.nombre : `${CAPITULOS[p.cap - 1].nombre}, nivel ${p.niv}`}</span>`;
    b.onclick = () => {
      const t = tiene
        ? TXT.poderInfo(p)
        : TXT.poderTapado(p);
      $('#poderes-info').textContent = t;
      Voz.hablar(t);
    };
    g.appendChild(b);
  });
  $('#panel-poderes').hidden = false;
}

function abrirAjustes() {
  soltarTeclas();
  const a = Guardado.datos.ajustes;
  $('#aj-voz').value = a.voz; $('#aj-sonido').value = a.sonido; $('#aj-musica').value = a.musica;
  $('#aj-salir').hidden = J.pantalla !== 'nivel';
  $('#aj-maquina').checked = !!a.vozMaquina;
  const sel = $('#aj-cual-voz');
  if (!Voz.voz) Voz.elegirVoz();
  const voces = Voz.voces().sort((x, y) => Voz.puntaje(y) - Voz.puntaje(x));
  sel.innerHTML = voces.length
    ? voces.map(v => {
      const corto = v.name.replace(/^(Microsoft|Google)\s+/, '').replace(/\s*Online \(Natural\)/, '').replace(/\s*-\s*Spanish.*$/, '').trim();
      return `<option value="${v.name}"${Voz.voz && v.name === Voz.voz.name ? ' selected' : ''}>${corto} (${v.lang})${/natural|online/i.test(v.name) ? ' · natural' : ''}</option>`;
    }).join('')
    : '<option>Sin voces en español</option>';
  $('#aj-nota-edge').hidden = voces.some(v => /natural|online/i.test(v.name));
  $('#panel-ajustes').hidden = false;
}
$('#aj-maquina').onchange = e => {
  Guardado.datos.ajustes.vozMaquina = e.target.checked;
  Guardado.guardar();
  if (e.target.checked) Voz.hablar(TXT.pruebaVoz); else Voz.callar();
};
$('#aj-cual-voz').onchange = e => {
  Guardado.datos.ajustes.vozNombre = e.target.value;
  Guardado.guardar();
  Voz.elegirVoz();
  Voz.hablar(TXT.pruebaVoz);
};
for (const id of ['voz', 'sonido', 'musica']) {
  $('#aj-' + id).oninput = e => {
    Guardado.datos.ajustes[id] = +e.target.value;
    Guardado.guardar();
    Sonido.volumenes();
  };
}
$('#aj-voz').onchange = () => Voz.hablar(TXT.pruebaVoz);
$('#aj-listo').onclick = () => { $('#panel-ajustes').hidden = true; };
$('#aj-salir').onclick = () => irAlMapa(J.cap);
for (const b of document.querySelectorAll('[data-cerrar]')) b.onclick = () => { $('#' + b.dataset.cerrar).hidden = true; Voz.callar(); };

// Pantalla completa (en iPad Safari se usa la versión con prefijo webkit)
function enPantallaCompleta() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function alternarPantallaCompleta() {
  const d = document, el = d.documentElement;
  if (enPantallaCompleta()) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
  const pedir = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!pedir) { globo(TXT.sinPantallaCompleta, 9000); return; }
  try {
    const r = pedir.call(el);
    if (r && r.catch) r.catch(() => globo(TXT.sinPantallaCompleta, 9000));
  } catch (e) { globo(TXT.sinPantallaCompleta, 9000); }
}
function marcarPantallaCompleta() {
  document.body.classList.toggle('pantalla-completa', enPantallaCompleta());
  setTimeout(ajustarTamano, 200);
}
document.addEventListener('fullscreenchange', marcarPantallaCompleta);
document.addEventListener('webkitfullscreenchange', marcarPantallaCompleta);
for (const b of document.querySelectorAll('.btn-pantalla')) b.onclick = alternarPantallaCompleta;
// Abierto desde el ícono de la pantalla de inicio ya ocupa toda la pantalla
if (window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone) {
  for (const b of document.querySelectorAll('.btn-pantalla')) b.hidden = true;
}

$('#btn-ajustes').onclick = abrirAjustes;
$('#btn-poderes').onclick = abrirPoderes;
$('#btn-pista').onclick = pedirPista;
$('#btn-volver').onclick = volverAtras;
$('#mapa-poderes').onclick = abrirPoderes;
$('#mapa-ajustes').onclick = abrirAjustes;
$('#mapa-inicio').onclick = irAlInicio;
$('#btn-jugar').onclick = () => { Sonido.iniciar(); Voz.elegirVoz(); irAlMapa(); };

// ---------- Teclado y controles táctiles ----------

function soltarTeclas() { J.teclas.izq = J.teclas.der = J.teclas.arriba = false; }
const MAPA_TECLAS = { ArrowLeft: 'izq', ArrowRight: 'der', ArrowUp: 'arriba' };
addEventListener('keydown', e => {
  if (MAPA_TECLAS[e.key] && J.pantalla === 'nivel') { e.preventDefault(); if (!hayCapa()) J.teclas[MAPA_TECLAS[e.key]] = true; }
  if ((e.key === 'Enter' || e.key === ' ') && finDialogo) { e.preventDefault(); finDialogo(); }
});
addEventListener('keyup', e => { if (MAPA_TECLAS[e.key]) J.teclas[MAPA_TECLAS[e.key]] = false; });
addEventListener('blur', soltarTeclas);
for (const b of document.querySelectorAll('#controles-tactiles button')) {
  const k = b.dataset.tecla;
  b.addEventListener('pointerdown', e => { e.preventDefault(); if (!hayCapa()) J.teclas[k] = true; });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => { J.teclas[k] = false; });
}

// ---------- Actualización ----------

function actualizar(dt) {
  J.t += dt;
  moverGotas(dt);
  if (J.conejo && J.conejo.mojado > 0) J.conejo.mojado = Math.max(0, J.conejo.mojado - dt);
  if (J.pantalla !== 'nivel') { J.cam += 18 * dt; return; }
  const c = J.conejo, nivel = J.nivel;
  for (const d of nivel.desafios) {
    if ((d.clase === 'animal' || d.clase === 'arbol') && d.resuelto && d.salida < 1) d.salida = Math.min(1, d.salida + dt * 1.4);
    if (d.clase === 'obst' && d.conPoder && d.portalAlpha > 0) d.portalAlpha = Math.max(0, d.portalAlpha - dt * 1.5);
  }
  if (J.terminado || hayCapa()) return;
  if (J.script) {
    const s = J.script;
    s.t += dt; const p = Math.min(s.t / s.dur, 1);
    c.fase += dt * 9;
    s.f(p);
    if (p >= 1) { J.script = null; s.fin(); }
    camara();
    return;
  }
  if (J.caido) {
    if (J.caida) {
      J.caida.t += dt; c.vy += G * dt; c.y += c.vy * dt;
      if (J.caida.tipo === 'rio') {
        c.y = Math.min(c.y, SUELO + 110);
        if (Math.random() < 0.2) J.gotas.push({ x: c.x + U.rnd(-10, 10), y: c.y - 60, vx: 0, vy: -50, r: U.rnd(2, 4), vida: 1.4, burbuja: true });
      }
    }
    return;
  }
  const d = desafioActual();

  // movimiento horizontal
  const vx = (J.teclas.der ? 1 : 0) - (J.teclas.izq ? 1 : 0);
  if (vx) c.dir = vx;
  c.caminando = vx !== 0 && c.enSuelo;
  if (c.caminando) c.fase += dt * 12;
  let nx = c.x + vx * VEL * dt;
  nx = Math.max(40, nx);
  // barreras que no dejan pasar
  if (d && d.clase === 'arbol') {
    // el animal del árbol solo frena arriba, en su rama
    if (c.y <= d.arriba + 2) nx = Math.min(nx, d.barrera - HW);
  } else if (d && !(d.clase === 'obst' && d.conPoder)) {
    const peligro = d.clase === 'obst' && (d.tipo === 'rio' || d.tipo === 'precipicio');
    if (!peligro) nx = Math.min(nx, d.barrera - HW);
  }
  if (d && d.clase === 'obst' && d.conPoder) nx = Math.min(nx, d.barrera - HW);
  if (d && d.tipo === 'oso' && d.osoX !== null) nx = Math.max(nx, d.osoX + 110);
  for (const p of nivel.piedritas.concat(nivel.troncos)) {
    if (c.y > SUELO - p.h + 1) {
      if (c.x + HW <= p.x && nx + HW > p.x) nx = p.x - HW;
      if (c.x - HW >= p.x + p.w && nx - HW < p.x + p.w) nx = p.x + p.w + HW;
    }
  }
  c.x = nx;

  // salto y gravedad
  if (J.teclas.arriba && c.enSuelo) { c.vy = -SALTO; c.enSuelo = false; Sonido.salto(); }
  c.vy += G * dt;
  let ny = c.y + c.vy * dt, piso = SUELO;
  for (const p of nivel.piedritas.concat(nivel.troncos)) {
    if (c.x + HW > p.x && c.x - HW < p.x + p.w) {
      const top = SUELO - p.h;
      if (c.y <= top + 1 && ny >= top) piso = Math.min(piso, top);
    }
  }
  // ramas: se atraviesan saltando desde abajo y se pisan al caer
  if (c.vy >= 0) {
    for (const p of nivel.plataformas) {
      if (c.x > p.x - 6 && c.x < p.x + p.w + 6 && c.y <= p.y + 1 && ny >= p.y) piso = Math.min(piso, p.y);
    }
  }
  if (ny >= piso) { ny = piso; c.vy = 0; c.enSuelo = true; } else c.enSuelo = false;
  c.y = ny;

  J.aviso = Math.max(0, J.aviso - dt);
  if (d) revisarDesafio(d, dt);
  else if (c.x >= nivel.fin - 150) entrarCasita();
  camara();
}

function revisarDesafio(d, dt) {
  const c = J.conejo;
  if (d.clase === 'animal') {
    if (c.x + HW >= d.barrera - 3 && c.enSuelo) abrirPregunta(d);
    return;
  }
  if (d.clase === 'arbol') {
    if (!J.nivel.avisoArbol && c.x > d.x - 330) { J.nivel.avisoArbol = true; globo(TXT.pistaArbol(CAPITULOS[J.cap - 1].animalNombre)); }
    if (Math.abs(c.y - d.arriba) < 2 && c.enSuelo && c.x + HW >= d.barrera - 3) abrirPregunta(d);
    return;
  }
  const p = PODERES[d.poder];
  if (d.tipo === 'oso') {
    if (d.osoX === null && c.x > d.x - 420) {
      d.osoX = J.cam - 160; d.osoDir = 1;
      globo(TXT.necesitaPortal(p));
    }
    if (d.osoX !== null && !d.conPoder) {
      d.osoX += 150 * dt;
      if (d.osoX + 120 >= c.x) caer(TXT.caidaOso);
    }
  }
  if (!d.conPoder) {
    // el portal es más alto que el salto, así que también cuenta si pasa saltando
    if (Math.abs(c.x - d.portalX) < 28) { abrirPortal(d); return; }
    if (d.tipo === 'rio' && c.x > d.x + 20) { J.caida = { tipo: 'rio', t: 0 }; c.vy = 60; salpicar(c.x, SUELO + 18, 18); caer(TXT.caidaRio); return; }
    if (d.tipo === 'precipicio' && c.x > d.x + 12) { J.caida = { tipo: 'precipicio', t: 0 }; c.vy = 0; caer(TXT.caidaPrecipicio); return; }
    if (c.x + HW >= d.barrera - 3 && J.aviso <= 0 && d.tipo !== 'oso') {
      J.aviso = 6;
      globo(TXT.necesitaPortal(p));
    }
  } else if (c.x + HW >= d.barrera - 3 && c.enSuelo) {
    iniciarCruce(d);
  }
}

function camara() {
  const objetivo = Math.max(0, Math.min(J.conejo.x - W * 0.35, J.nivel.fin + 200 - W));
  J.cam += (objetivo - J.cam) * 0.15;
}

// ---------- Dibujo ----------

function dibujar() {
  const t = J.t;
  ctx.clearRect(0, 0, W, H);
  C.fondo(ctx, J.cam);
  C.pasto(ctx, J.cam);
  if (J.pantalla === 'nivel' && J.nivel) {
    const c = J.conejo, nivel = J.nivel;
    ctx.save();
    ctx.translate(-J.cam, 0);
    const visible = (x0, x1) => x1 > J.cam - 100 && x0 < J.cam + W + 100;
    C.asomados(ctx, J.cam, t);
    C.bichitos(ctx, J.cam, t);
    C.tortugas(ctx, J.cam, t, c.x);
    for (const d of nivel.desafios) if (d.clase === 'arbol' && visible(d.x - 220, d.x + 260)) C.arbolGrande(ctx, d.x, t);
    for (const p of nivel.plataformas) if (visible(p.x, p.x + p.w)) C.rama(ctx, p, t);
    for (const p of nivel.piedritas) if (visible(p.x, p.x + p.w)) C.piedrita(ctx, p, t);
    for (const d of nivel.desafios) {
      if (d.clase !== 'obst' || !visible(d.portalX - 60, d.x + d.w + 60)) continue;
      C.obstaculo(ctx, d, t);
      if (!d.resuelto && d.portalAlpha > 0) C.portal(ctx, d.portalX, t, PODERES[d.poder].num, d.portalAlpha);
    }
    if (visible(nivel.fin - 160, nivel.fin + 160)) C.casita(ctx, nivel.fin, t, J.puerta || 0);
    for (const d of nivel.desafios) {
      if (d.clase === 'animal' && d.salida < 1 && visible(d.x - 60, d.x + 60)) {
        const s = d.salida;
        C.animal(ctx, CAPITULOS[J.cap - 1].animal, d.x + s * 40, SUELO - Math.sin(s * Math.PI) * 50, 1 - s);
        if (!d.resuelto) C.pregunta(ctx, d.x, SUELO - 135, t);
      }
      if (d.clase === 'arbol' && d.salida < 1 && visible(d.animalX - 60, d.animalX + 60)) {
        const s = d.salida;
        C.animal(ctx, CAPITULOS[J.cap - 1].animal, d.animalX + s * 40, d.arriba - Math.sin(s * Math.PI) * 50, 1 - s);
        if (!d.resuelto) C.pregunta(ctx, d.animalX, d.arriba - 135, t);
      }
      if (d.tipo === 'grunon' && !d.oculto && visible(d.x - 100, d.x + 160)) {
        ctx.save(); ctx.translate(0, d.dy || 0);
        C.grunon(ctx, d.x + 80, t, d.alpha, d.contento);
        ctx.restore();
        if (J.burbujas && J.script) dibujarCorazones(d.x, t);
      }
    }
    C.conejo(ctx, c.x, c.y, c);
    C.mariposas(ctx, J.cam, t);
    for (const d of nivel.desafios) {
      if (d.tipo === 'rio' && visible(d.x, d.x + d.w)) C.aguaFrente(ctx, d, t, c);
      if (d.tipo === 'oso' && d.osoX !== null) {
        ctx.save();
        if (d.osoDir === -1) { ctx.translate(d.osoX * 2, 0); ctx.scale(-1, 1); }
        C.oso(ctx, d.osoX, t, d.olfatea);
        ctx.restore();
      }
    }
    C.gotas(ctx, J.gotas);
    ctx.restore();
    if (J.enCueva) C.oscuridad(ctx, c.x - J.cam, c.y - 60, 150, 0.95);
  }
  C.frente(ctx, J.cam, t);
  C.ambiente(ctx, t);
}

function dibujarCorazones(x, t) {
  for (let k = 0; k < 3; k++) {
    const y = SUELO - 150 - ((t * 40 + k * 30) % 90), hx = x - 10 + k * 26;
    ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(hx, y); ctx.scale(0.8, 0.8);
    ctx.fillStyle = '#D9606E'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-16, 0, -10, -12, 0, -4); ctx.bezierCurveTo(10, -12, 16, 0, 0, 10); ctx.fill();
    ctx.restore();
  }
}

// ---------- Bucle y tamaño ----------

function ajustarTamano() {
  const r = lienzo.getBoundingClientRect(), k = (r.width / W) * (window.devicePixelRatio || 1);
  lienzo.width = Math.round(W * k); lienzo.height = Math.round(H * k);
  ctx.setTransform(k, 0, 0, k, 0, 0);
}
addEventListener('resize', ajustarTamano);

let ultimo = performance.now();
function bucle(now) {
  const dt = Math.min(0.05, (now - ultimo) / 1000);
  ultimo = now;
  actualizar(dt);
  dibujar();
  requestAnimationFrame(bucle);
}

Guardado.cargar();
C.preparar();
$('#conejo-inicio').innerHTML = D.conejoGrande();
$('#ocre-inicio').innerHTML = D.hoja(true);
$('#btn-pista').innerHTML = D.hoja(true);
$('#dialogo-hoja').innerHTML = D.hoja(true);
$('#globo-hoja').innerHTML = D.hoja(true);
$('#hoja-cayendo').innerHTML = D.hoja(true);
ajustarTamano();
irAlInicio();
requestAnimationFrame(bucle);
