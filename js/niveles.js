// Capítulos, niveles, poderes y generadores de preguntas.
// Textos para la jugadora: español con "tú".

const PODERES = {
  nadar:     { id: 'nadar',     nombre: 'Nadar',               num: 5, obst: 'rio',        cap: 1, niv: 1, texto: 'Con el 5 puedes nadar y cruzar ríos profundos.', necesita: 'Este río es muy profundo. Necesitas el poder de nadar.' },
  saltar:    { id: 'saltar',    nombre: 'Saltar alto',         num: 3, obst: 'troncos',    cap: 1, niv: 6, texto: 'Con el 3 saltas muy alto, por encima de troncos y pozos.', necesita: 'Estos troncos son muy altos. Necesitas el poder de saltar alto.' },
  empujar:   { id: 'empujar',   nombre: 'Empujar',             num: 8, obst: 'piedra',     cap: 2, niv: 1, texto: 'Con el 8 tienes fuerza para empujar piedras gigantes.', necesita: 'Esta piedra es enorme. Necesitas el poder de empujar.' },
  escalar:   { id: 'escalar',   nombre: 'Escalar',             num: 9, obst: 'pared',      cap: 2, niv: 6, texto: 'Con el 9 puedes escalar paredes de roca.', necesita: 'Esta pared es muy alta. Necesitas el poder de escalar.' },
  volar:     { id: 'volar',     nombre: 'Volar',               num: 4, obst: 'precipicio', cap: 3, niv: 1, texto: 'Con el 4 puedes volar por encima de los precipicios.', necesita: 'Hay un precipicio. Necesitas el poder de volar.' },
  camuflaje: { id: 'camuflaje', nombre: 'Camuflaje',           num: 7, obst: 'oso',        cap: 3, niv: 6, texto: 'Con el 7 te camuflas como un arbusto y el oso no te ve.', necesita: '¡Un oso hambriento te persigue! Necesitas el poder de camuflaje.' },
  hablar:    { id: 'hablar',    nombre: 'Hablar con animales', num: 2, obst: 'grunon',     cap: 4, niv: 1, texto: 'Con el 2 puedes hablar con los animales y pedirles que te dejen pasar.', necesita: 'Gruñón no te deja pasar. Necesitas el poder de hablar con animales.' },
  ver:       { id: 'ver',       nombre: 'Ver en la oscuridad', num: 6, obst: 'cueva',      cap: 4, niv: 6, texto: 'Con el 6 puedes ver en la oscuridad y cruzar cuevas.', necesita: 'La cueva está muy oscura. Necesitas el poder de ver en la oscuridad.' }
};
const ORDEN_PODERES = ['nadar', 'saltar', 'empujar', 'escalar', 'volar', 'camuflaje', 'hablar', 'ver'];
const VERBOS = { nadar: 'nadar', saltar: 'saltar alto', empujar: 'empujar', escalar: 'escalar', volar: 'volar', camuflaje: 'camuflarte', hablar: 'hablar con los animales', ver: 'ver en la oscuridad' };
for (const id in VERBOS) PODERES[id].verbo = VERBOS[id];
const ANCHO_OBST = { rio: 320, troncos: 84, piedra: 130, pared: 90, precipicio: 240, oso: 40, grunon: 120, cueva: 300 };

// ---------- Pistas y explicaciones según la operación ----------

function pistaSuma(a, b) {
  if (a + b <= 10) return { texto: `Cuenta los puntos: ${a} naranjas y ${b} verdes.`, visual: D.marco10(a, { otros: b }) };
  const g = Math.max(a, b), p = Math.min(a, b);
  if (g === 10) return { texto: `Tienes un 10 completo y ${p} más.`, visual: D.dosMarcos(10, p) };
  const f = 10 - g;
  return { texto: `Primero completa el 10: ${g} + ${f} = 10. Del ${p} te quedan ${p - f}. Entonces es 10 + ${p - f}.`, visual: D.dosMarcos(g, p) };
}

function pistaResta(a, b) {
  if (a <= 10) return { texto: `Empieza con ${a} y quita ${b}. ¿Cuántos quedan?`, visual: D.restaMarcos(a, b) };
  const u = a - 10;
  if (b <= u) return { texto: `Quita ${b} de los ${u} que están fuera del 10.`, visual: D.restaMarcos(a, b) };
  return {
    texto: `Primero baja al 10: ${a} − ${u} = 10. Te falta quitar ${b - u}: 10 − ${b - u}.`,
    visual: D.recta(0, 20, a, [-u, -(b - u)])
  };
}

function pistaMult(a, b) {
  const suma = a <= 5 ? Array(a).fill(b).join(' + ') : `cuenta de ${b} en ${b}`;
  return { texto: `Mira el array: ${a} filas de ${b}. Es ${suma}.`, visual: D.arrayVis(a, b, 'punto') };
}

function pistaDiv(t, d) {
  if (d === 0 || t === 0) return { texto: 'Si no hay nada para repartir, cada uno recibe 0.', visual: '' };
  return { texto: `Reparte ${t} en ${d} grupos iguales. Piensa: ${d} × ? = ${t}.`, visual: D.grupos(d, t / d) };
}

function pistaDe(a, op, b) {
  if (op === '+') return pistaSuma(a, b);
  if (op === '−') return pistaResta(a, b);
  if (op === '×') return pistaMult(a, b);
  return pistaDiv(a, b);
}

function cercanos(a, op, b, r) {
  const v = [r + 1, r - 1, r + 2, r - 2];
  if (op === '−') v.push(a + b);
  if (op === '×') v.push(a * (b + 1), a * (b - 1), (a + 1) * b, a + b);
  if (op === '÷') v.push(a - b, r + 2);
  return v;
}

// Pregunta con la cuenta escrita y 4 respuestas
function preguntaCuenta(a, op, b, o = {}) {
  const r = U.calc(a, op, b);
  const p = pistaDe(a, op, b);
  return {
    tipo: 'opciones',
    texto: o.texto || `${a} ${op} ${b} = ?`,
    sub: o.sub || '',
    visual: o.conVisual ? p.visual : (o.visual || ''),
    resp: r,
    opciones: U.opciones(r, cercanos(a, op, b, r)),
    pista: o.pista || p,
    explica: { texto: o.explica || `${a} ${op} ${b} = ${r}.`, visual: p.visual },
    bien: o.bien || `${a} ${op} ${b} = ${r}`
  };
}

function ordenAzar(a, b) { return Math.random() < 0.5 ? [a, b] : [b, a]; }

// ---------- Sumas ----------

const S = {
  marco() {
    const n = U.rnd(1, 9);
    return {
      tipo: 'opciones', texto: '¿Cuántos faltan para llegar a 10?', sub: 'Puedes tocar los lugares vacíos para contarlos.',
      visual: D.marco10(n, { interactivo: true }), resp: 10 - n, opciones: U.opciones(10 - n, [11 - n, 9 - n, n]),
      pista: { texto: `Hay ${n} puntos. Cuenta los lugares vacíos.`, visual: '' },
      explica: { texto: `${n} y ${10 - n} son amigos del 10.`, visual: D.marco10(n, { otros: 10 - n }) },
      bien: `${n} y ${10 - n} son amigos del 10.`
    };
  },
  bond() {
    const n = U.rnd(1, 9);
    const izq = Math.random() < 0.5;
    return {
      tipo: 'opciones', texto: '¿Qué número completa el 10?', sub: '',
      visual: izq ? D.bond(10, n, '?') : D.bond(10, '?', n), resp: 10 - n, opciones: U.opciones(10 - n, [11 - n, 9 - n, n]),
      pista: { texto: `Busca el amigo del 10 del ${n}. Si te ayuda, mira el marco.`, visual: D.marco10(n) },
      explica: { texto: `${n} y ${10 - n} son amigos del 10.`, visual: D.bond(10, n, 10 - n) },
      bien: `${n} + ${10 - n} = 10`
    };
  },
  falta() {
    const n = U.rnd(1, 9);
    const texto = Math.random() < 0.5 ? `${n} + ? = 10` : `? + ${n} = 10`;
    return {
      tipo: 'opciones', texto, sub: '', visual: '', resp: 10 - n, opciones: U.opciones(10 - n, [11 - n, 9 - n, n]),
      pista: { texto: `¿Cuál es el amigo del 10 del ${n}?`, visual: D.marco10(n) },
      explica: { texto: `${n} y ${10 - n} son amigos del 10.`, visual: D.marco10(n, { otros: 10 - n }) },
      bien: `${n} + ${10 - n} = 10`
    };
  },
  pareja() {
    const a = U.rnd(1, 9), b = 10 - a;
    const resp = `${a} + ${b}`;
    const malas = new Set();
    while (malas.size < 3) {
      const x = U.rnd(1, 9), y = U.rnd(1, 9);
      if (x + y !== 10 && Math.abs(x + y - 10) <= 2) malas.add(`${x} + ${y}`);
    }
    return {
      tipo: 'opciones', texto: '¿Qué pareja suma 10?', sub: '', visual: '', resp, opciones: U.mezclar([resp, ...malas]),
      pista: { texto: 'Los amigos del 10 son 1 y 9, 2 y 8, 3 y 7, 4 y 6, 5 y 5.', visual: '' },
      explica: { texto: `${a} y ${b} son amigos del 10.`, visual: D.marco10(a, { otros: b }) },
      bien: `${a} + ${b} = 10`
    };
  },
  diezMas() {
    const n = U.rnd(1, 9);
    const [x, y] = ordenAzar(10, n);
    return preguntaCuenta(x, '+', y, { conVisual: Math.random() < 0.5, explica: `10 y ${n} más son ${10 + n}.` });
  },
  tres() {
    const a = U.rnd(1, 9), b = 10 - a, c = U.rnd(1, 9);
    const nums = U.mezclar([a, b, c]);
    const r = 10 + c;
    return {
      tipo: 'opciones', texto: `${nums[0]} + ${nums[1]} + ${nums[2]} = ?`, sub: 'Busca primero los amigos del 10.', visual: '',
      resp: r, opciones: U.opciones(r, [r - 1, r + 1, r - 10]),
      pista: { texto: `${a} y ${b} son amigos del 10. Junta esos primero: 10 + ${c}.`, visual: D.dosMarcos(10, c) },
      explica: { texto: `${a} + ${b} = 10, y 10 + ${c} = ${r}.`, visual: D.dosMarcos(10, c) },
      bien: `${a} + ${b} = 10, y 10 + ${c} = ${r}`
    };
  },
  conNueve() {
    const [x, y] = ordenAzar(9, U.rnd(2, 9));
    return preguntaCuenta(x, '+', y);
  },
  conOchoSiete() {
    const g = U.pick([8, 7]);
    const [x, y] = ordenAzar(g, U.rnd(11 - g, 9));
    return preguntaCuenta(x, '+', y);
  },
  hacerDiez() {
    const a = U.rnd(6, 9);
    const [x, y] = ordenAzar(a, U.rnd(Math.max(2, 11 - a), 9));
    return preguntaCuenta(x, '+', y);
  }
};

// ---------- Restas ----------

const R = {
  diezMenos() {
    const n = U.rnd(1, 9);
    return preguntaCuenta(10, '−', n, { visual: D.restaMarcos(10, n), explica: `Si quitas ${n} de 10, quedan ${10 - n}.` });
  },
  amigoFalta() {
    const n = U.rnd(1, 9);
    return {
      tipo: 'opciones', texto: `10 − ? = ${n}`, sub: '', visual: D.bond(10, n, '?'),
      resp: 10 - n, opciones: U.opciones(10 - n, [n, 11 - n, 9 - n]),
      pista: { texto: `¿Cuántos tienes que quitar de 10 para que queden ${n}? Piensa en el amigo del 10 del ${n}.`, visual: D.marco10(n, { otros: 10 - n }) },
      explica: { texto: `10 − ${10 - n} = ${n}, porque ${n} y ${10 - n} son amigos del 10.`, visual: D.restaMarcos(10, 10 - n) },
      bien: `10 − ${10 - n} = ${n}`
    };
  },
  familia() {
    const a = U.rnd(1, 9), b = 10 - a;
    return {
      tipo: 'opciones', texto: `Si ${a} + ${b} = 10, entonces 10 − ${a} = ?`, sub: '', visual: '',
      resp: b, opciones: U.opciones(b, [a, b + 1, b - 1]),
      pista: { texto: `Mira la familia de datos: ${a}, ${b} y 10 van siempre juntos.`, visual: D.familia(a, b, 10, '+') },
      explica: { texto: `${a}, ${b} y 10 son una familia de datos: 10 − ${a} = ${b}.`, visual: D.familia(a, b, 10, '+') },
      bien: `10 − ${a} = ${b}`
    };
  },
  quitarSueltas() {
    const u = U.rnd(1, 8);
    if (Math.random() < 0.5) return preguntaCuenta(10 + u, '−', u, { visual: D.restaMarcos(10 + u, u) });
    return {
      tipo: 'opciones', texto: `${10 + u} − ? = 10`, sub: '', visual: D.restaMarcos(10 + u, 0),
      resp: u, opciones: U.opciones(u, [u + 1, u - 1, 10]),
      pista: { texto: `Hay un 10 completo y ${u} sueltos. ¿Cuántos quitas para que quede solo el 10?`, visual: '' },
      explica: { texto: `${10 + u} − ${u} = 10.`, visual: D.restaMarcos(10 + u, u) },
      bien: `${10 + u} − ${u} = 10`
    };
  },
  quitarDiez() {
    const u = U.rnd(1, 9);
    return preguntaCuenta(10 + u, '−', 10, {
      pista: { texto: `${10 + u} es 10 y ${u} más. Si quitas el 10, ¿qué queda?`, visual: D.restaMarcos(10 + u, 10) }
    });
  },
  bajarDiez() {
    const a = U.rnd(11, 17), u = a - 10;
    return preguntaCuenta(a, '−', U.rnd(u + 1, 9));
  },
  menosNueve() { return preguntaCuenta(U.rnd(11, 18), '−', 9); },
  menosOchoSiete() {
    const s = U.pick([8, 7]);
    return preguntaCuenta(U.rnd(11, s + 9), '−', s);
  },
  comoSuma() {
    const a = U.rnd(11, 18), b = U.rnd(Math.max(2, a - 9), 9), r = a - b;
    return preguntaCuenta(a, '−', b, {
      sub: `Piénsalo como suma: ${b} + ? = ${a}`,
      pista: { texto: `¿Cuánto le sumas a ${b} para llegar a ${a}? Primero llega al 10.`, visual: D.recta(0, 20, b, [10 - b, a - 10]) }
    });
  }
};

// ---------- Multiplicación ----------

const M = {
  sumaRepetida() {
    const f = U.rnd(2, 4), c = U.rnd(2, 5), r = f * c;
    const suma = Array(f).fill(c).join(' + ');
    return {
      tipo: 'opciones', texto: '¿Cuántas zanahorias hay?', sub: `${f} filas de ${c}`, visual: D.arrayVis(f, c, 'zanahoria'),
      resp: r, opciones: U.opciones(r, [r + c, r - c, f + c]),
      pista: { texto: `Suma las filas: ${suma}.`, visual: '' },
      explica: { texto: `${suma} = ${r}. Es ${f} × ${c}.`, visual: D.arrayVis(f, c, 'zanahoria') },
      bien: `${suma} = ${r}`
    };
  },
  leerArray() {
    const f = U.rnd(2, 5);
    let c = U.rnd(2, 5);
    if (c === f) c = f === 5 ? 4 : f + 1;
    const resp = `${f} × ${c}`;
    return {
      tipo: 'opciones', texto: '¿Qué multiplicación muestra el array?', sub: '', visual: D.arrayVis(f, c, 'zanahoria'),
      resp, opciones: U.mezclar([resp, `${f} + ${c}`, `${f} × ${c + 1}`, `${f + 1} × ${c}`]),
      pista: { texto: 'Cuenta las filas (acostadas) y las columnas (paradas). Siempre se dicen primero las filas.', visual: '' },
      explica: { texto: `Hay ${f} filas y ${c} columnas: ${f} × ${c}.`, visual: D.arrayVis(f, c, 'zanahoria') },
      bien: `${f} filas de ${c}: ${f} × ${c}`
    };
  },
  armar(maxF, maxC) {
    return () => {
      const f = U.rnd(2, maxF), c = U.rnd(2, maxC);
      return {
        tipo: 'array', texto: `Arma un array de ${f} filas y ${c} columnas.`, sub: 'Toca la grilla para elegir el tamaño y luego toca Listo.',
        maxF, maxC, resp: { f, c },
        pista: { texto: 'Las filas van acostadas, de izquierda a derecha. Las columnas van paradas, de arriba abajo.', visual: '' },
        explica: { texto: `${f} filas y ${c} columnas: ${f} × ${c} = ${f * c}.`, visual: D.arrayVis(f, c, 'punto') },
        bien: `${f} × ${c} = ${f * c}`
      };
    };
  },
  dosYDiez() {
    const [x, y] = ordenAzar(U.pick([2, 10]), U.rnd(1, 10));
    return preguntaCuenta(x, '×', y, { conVisual: x * y <= 40 });
  },
  cinco() {
    const [x, y] = ordenAzar(5, U.rnd(1, 10));
    return preguntaCuenta(x, '×', y);
  },
  girar() {
    const f = U.rnd(2, 5);
    let c = U.rnd(2, 5);
    if (c === f) c = f === 5 ? 3 : f + 1;
    const resp = `${c} × ${f}`;
    return {
      tipo: 'opciones', texto: `Este array es ${f} × ${c}. Si lo giras, ¿qué multiplicación es?`, sub: '', visual: D.arrayVis(f, c, 'zanahoria'),
      resp, opciones: U.mezclar([resp, `${f} × ${c + 1}`, `${c} + ${f}`, `${c} × ${c}`]),
      pista: { texto: 'Al girarlo, las filas pasan a ser columnas. El total no cambia.', visual: D.arrayVis(c, f, 'zanahoria') },
      explica: { texto: `Girado tiene ${c} filas de ${f}: ${c} × ${f} = ${f * c}. ¡Da lo mismo que ${f} × ${c}!`, visual: D.arrayVis(c, f, 'zanahoria') },
      bien: `${f} × ${c} = ${c} × ${f} = ${f * c}`
    };
  },
  tresCuatro() {
    const [x, y] = ordenAzar(U.pick([3, 4]), U.rnd(1, 10));
    return preguntaCuenta(x, '×', y);
  },
  grandes() {
    const [x, y] = ordenAzar(U.pick([6, 7, 8, 9]), U.rnd(1, 5));
    return preguntaCuenta(x, '×', y);
  }
};

// ---------- División ----------

const DV = {
  repartir() {
    const d = U.rnd(2, 3), q = U.rnd(2, 5), t = d * q;
    return {
      tipo: 'repartir', texto: `Reparte ${t} bayas en ${d} canastas. Todas tienen que tener lo mismo.`, sub: 'Toca una canasta para poner una baya.',
      total: t, canastas: d, resp: q,
      pista: { texto: 'Pon una baya en cada canasta, una vuelta tras otra, hasta que no queden.', visual: '' },
      explica: { texto: `${t} ÷ ${d} = ${q}. Cada canasta tiene ${q}.`, visual: D.grupos(d, q) },
      bien: `${t} ÷ ${d} = ${q}`
    };
  },
  grupos() {
    const k = U.pick([2, 3, 4, 5]), g = U.rnd(2, 5), t = k * g;
    return {
      tipo: 'opciones', texto: `Hay ${t} bellotas. Si pones ${k} en cada bolsa, ¿cuántas bolsas llenas?`, sub: '', visual: D.bayas(t, 'bellota'),
      resp: g, opciones: U.opciones(g, [g + 1, g - 1, k]),
      pista: { texto: `Haz grupos de ${k} y cuenta cuántos grupos salen.`, visual: D.grupos(g, k, 'bellota') },
      explica: { texto: `${t} ÷ ${k} = ${g}. Salen ${g} bolsas.`, visual: D.grupos(g, k, 'bellota') },
      bien: `${t} ÷ ${k} = ${g}`
    };
  },
  conArray() {
    const f = U.rnd(2, 5), c = U.rnd(2, 5), t = f * c;
    return preguntaCuenta(t, '÷', f, {
      texto: `Hay ${t} zanahorias en ${f} filas iguales. ¿Cuántas hay en cada fila?`, sub: `${t} ÷ ${f} = ?`,
      visual: D.arrayVis(f, c, 'zanahoria'),
      pista: { texto: `Mira una sola fila y cuenta. Es ${f} × ? = ${t}.`, visual: '' },
      bien: `${t} ÷ ${f} = ${c}`
    });
  },
  familia() {
    const a = U.rnd(2, 9), b = U.rnd(2, 9), t = a * b;
    return preguntaCuenta(t, '÷', b, {
      texto: `Si ${a} × ${b} = ${t}, entonces ${t} ÷ ${b} = ?`,
      pista: { texto: `${a}, ${b} y ${t} son una familia de datos.`, visual: D.familia(a, b, t, '×') },
      bien: `${t} ÷ ${b} = ${a}`
    });
  },
  porDivisor(divs, maxQ) {
    return () => {
      const d = U.pick(divs), q = U.rnd(1, maxQ);
      return preguntaCuenta(d * q, '÷', d);
    };
  },
  comoMult() {
    const d = U.rnd(2, 9), q = U.rnd(2, 9);
    return preguntaCuenta(d * q, '÷', d, { sub: `Piénsalo como multiplicación: ${d} × ? = ${d * q}` });
  },
  especiales() {
    const n = U.rnd(2, 10);
    const tipo = U.pick(['uno', 'mismo', 'cero']);
    if (tipo === 'uno') return preguntaCuenta(n, '÷', 1, { pista: { texto: 'Si repartes entre 1 solo, se queda con todo.', visual: '' }, explica: `Dividir por 1 deja el número igual: ${n} ÷ 1 = ${n}.` });
    if (tipo === 'mismo') return preguntaCuenta(n, '÷', n, { pista: { texto: `Si repartes ${n} entre ${n}, ¿cuánto le toca a cada uno?`, visual: '' }, explica: `Un número dividido por sí mismo da 1: ${n} ÷ ${n} = 1.` });
    return preguntaCuenta(0, '÷', n, { pista: { texto: 'Si no hay nada para repartir, ¿cuánto le toca a cada uno?', visual: '' }, explica: `0 dividido por cualquier número da 0: 0 ÷ ${n} = 0.` });
  }
};

function mezcla(gens) { return () => U.pick(gens)(); }

// ---------- Cuentas para los portales ----------
// Cada nivel da un generador de cuentas {a, op, b} del tamaño que corresponde.

function cuentasPortal(c, n) {
  if (c === 1) return n <= 4
    ? () => { const a = U.rnd(1, 9); return { a, op: '+', b: U.rnd(1, 10 - a) }; }
    : () => ({ a: U.rnd(1, 9), op: '+', b: U.rnd(1, 9) });
  if (c === 2) return n <= 3
    ? () => ({ a: 10, op: '−', b: U.rnd(1, 9) })
    : () => { const a = U.rnd(11, 18); return { a, op: '−', b: U.rnd(a - 9, 9) }; };
  if (c === 3) {
    if (n <= 3) return () => ({ a: U.rnd(2, 5), op: '×', b: U.rnd(2, 5) });
    if (n <= 7) return () => ({ a: U.rnd(2, 5), op: '×', b: U.rnd(1, 10) });
    return () => ({ a: U.rnd(2, 9), op: '×', b: U.rnd(1, 10) });
  }
  if (n <= 3) return () => { const d = U.rnd(2, 5), q = U.rnd(1, 9); return { a: d * q, op: '÷', b: d }; };
  return () => { const d = U.rnd(2, 9), q = U.rnd(1, 10); return { a: d * q, op: '÷', b: d }; };
}
// Por si el nivel no tiene resultados con la cifra, se usa todo el capítulo
function cuentasCapitulo(c) { return cuentasPortal(c, 10); }

// ---------- Capítulos ----------

const CAPITULOS = [
  {
    id: 1, nombre: 'Sumas', lugar: 'Claro de los Hongos', animal: 'zorrito', animalNombre: 'Hongui',
    intro: () => [
      { texto: '¡Hola, Emily! Soy Ocre, una hoja del bosque. Voy a acompañarte en el camino.' },
      { texto: 'Muévete con las flechas ← y →. Con la flecha ↑ saltas.' },
      { texto: 'Si necesitas ayuda, toca mi hoja, arriba a la derecha. Puedes pedirme todas las pistas que quieras.' },
      { texto: 'En este claro vamos a sumar con los amigos del 10: dos números que juntos hacen 10. 7 y 3 son amigos del 10.', visual: D.marco10(7, { otros: 3 }) },
      { texto: 'Los amigos del 10 son: 1 y 9, 2 y 8, 3 y 7, 4 y 6, 5 y 5.' }
    ],
    niveles: [
      { titulo: 'Completa el marco de 10', explica: 'El marco de 10 tiene 10 lugares. Cuenta cuántos faltan para llenarlo.', gen: S.marco },
      { titulo: 'Amigos del 10', explica: 'El 10 se parte en dos amigos. Si sabes uno, encuentras el otro.', ejemplo: () => D.bond(10, 6, 4), gen: S.bond },
      { titulo: 'El amigo que falta', explica: 'Ahora sin dibujos: ¿qué amigo le falta a cada número para llegar a 10?', gen: S.falta },
      { titulo: 'Parejas del 10', explica: 'Busca la pareja que suma exactamente 10.', gen: S.pareja },
      { titulo: 'Diez y algo más', explica: '10 + 4 es 14: un 10 completo y 4 más.', ejemplo: () => D.dosMarcos(10, 4), gen: S.diezMas },
      { titulo: 'Tres números', explica: 'Cuando sumas tres números, busca primero los amigos del 10.', gen: S.tres },
      { titulo: 'Hacer 10 con el 9', explica: '9 + 5 es 9 + 1 + 4. Primero llegas al 10 y después sumas lo que queda.', ejemplo: () => D.dosMarcos(9, 5), gen: S.conNueve },
      { titulo: 'Hacer 10 con el 8 y el 7', explica: '8 + 6 es 8 + 2 + 4. Primero completas el 10.', ejemplo: () => D.dosMarcos(8, 6), gen: S.conOchoSiete },
      { titulo: 'Hacer 10 con todos', explica: 'Usa lo que aprendiste: completa el 10 y suma lo que queda.', gen: S.hacerDiez },
      { titulo: 'Desafío del Claro', explica: '¡Desafío final del claro! Hay de todo un poco.', gen: mezcla([S.falta, S.pareja, S.diezMas, S.tres, S.conNueve, S.conOchoSiete, S.hacerDiez]) }
    ]
  },
  {
    id: 2, nombre: 'Restas', lugar: 'Río de las Piedras', animal: 'ranoso', animalNombre: 'Ranoso',
    intro: () => [
      { texto: 'Bienvenida al Río de las Piedras. Aquí vamos a restar. Restar es quitar.', visual: D.restaMarcos(10, 4) },
      { texto: 'Si sabes los amigos del 10, también sabes restar: como 3 + 7 = 10, entonces 10 − 3 = 7.', visual: D.familia(3, 7, 10, '+') },
      { texto: 'Cuando el número es más grande que 10, primero bajamos al 10.' }
    ],
    niveles: [
      { titulo: 'Quitar de 10', explica: 'Empieza con 10 y quita algunos. ¿Cuántos quedan?', gen: R.diezMenos },
      { titulo: 'El amigo que falta', explica: '10 − ? = 3. ¿Cuántos quitaste? Piensa en los amigos del 10.', gen: R.amigoFalta },
      { titulo: 'Familia de datos', explica: '3, 7 y 10 son una familia: 3 + 7 = 10, 10 − 3 = 7 y 10 − 7 = 3.', ejemplo: () => D.familia(3, 7, 10, '+'), gen: R.familia },
      { titulo: 'Volver al 10', explica: '14 − 4 = 10. Si quitas los que están fuera del 10, queda el 10.', ejemplo: () => D.restaMarcos(14, 4), gen: R.quitarSueltas },
      { titulo: 'Quitar el 10', explica: '15 − 10 = 5. Si quitas el 10 completo, quedan los sueltos.', gen: R.quitarDiez },
      { titulo: 'Bajar al 10', explica: '13 − 5: primero baja al 10 (13 − 3), y después quita los 2 que faltan.', ejemplo: () => D.recta(0, 20, 13, [-3, -2]), gen: R.bajarDiez },
      { titulo: 'Restar 9', explica: 'Para restar 9, primero baja al 10 y luego sigue.', gen: R.menosNueve },
      { titulo: 'Restar 8 y 7', explica: 'Igual que con el 9: baja al 10 y quita lo que falta.', gen: R.menosOchoSiete },
      { titulo: 'La resta como suma', explica: '12 − 8 es lo mismo que preguntar 8 + ? = 12.', gen: R.comoSuma },
      { titulo: 'Desafío del Río', explica: '¡Desafío final del río! Restas de todo tipo hasta 20.', gen: mezcla([R.amigoFalta, R.familia, R.quitarDiez, R.bajarDiez, R.menosNueve, R.menosOchoSiete, R.comoSuma]) }
    ]
  },
  {
    id: 3, nombre: 'Multiplicación', lugar: 'Huerta de los Arrays', animal: 'bellotin', animalNombre: 'Bellotín',
    intro: () => [
      { texto: 'Bienvenida a la Huerta de los Arrays. Aquí las plantas crecen en filas y columnas.', visual: D.arrayVis(3, 4, 'zanahoria') },
      { texto: 'Este array tiene 3 filas de 4. Se escribe 3 × 4. Siempre decimos primero las filas.' },
      { texto: 'Es como sumar 4 + 4 + 4 = 12. Multiplicar es sumar grupos iguales.' }
    ],
    niveles: [
      { titulo: 'Filas que se suman', explica: 'Cada fila tiene la misma cantidad. Suma las filas para saber el total.', gen: M.sumaRepetida },
      { titulo: 'Leer un array', explica: 'Cuenta las filas y las columnas, y escribe la multiplicación.', gen: M.leerArray },
      { titulo: 'Armar arrays', explica: 'Ahora te toca armar el array en la huerta.', gen: M.armar(5, 5) },
      { titulo: 'Tablas del 2 y del 10', explica: 'Multiplicar por 2 es el doble. Multiplicar por 10 es agregar un 0.', gen: M.dosYDiez },
      { titulo: 'Tabla del 5', explica: 'La tabla del 5 siempre termina en 5 o en 0: 5, 10, 15, 20...', gen: M.cinco },
      { titulo: 'Girar el array', explica: 'Si giras un array, el total no cambia: 3 × 5 = 5 × 3.', ejemplo: () => D.arrayVis(3, 5, 'punto'), gen: M.girar },
      { titulo: 'Tablas del 3 y del 4', explica: 'Si te trabas, imagina el array y suma las filas.', gen: M.tresCuatro },
      { titulo: 'Arrays grandes', explica: 'Arma arrays más grandes, de hasta 6 filas y 10 columnas.', gen: M.armar(6, 10) },
      { titulo: 'Tablas del 6 al 9', explica: 'Números más grandes. Recuerda que puedes girar: 7 × 3 es lo mismo que 3 × 7.', gen: M.grandes },
      { titulo: 'Desafío de la Huerta', explica: '¡Desafío final de la huerta! Hay de todas las tablas.', gen: mezcla([M.sumaRepetida, M.dosYDiez, M.cinco, M.girar, M.tresCuatro, M.grandes]) }
    ]
  },
  {
    id: 4, nombre: 'División', lugar: 'Cueva de las Bayas', animal: 'ardilla', animalNombre: 'Cora',
    intro: () => [
      { texto: 'Bienvenida a la Cueva de las Bayas. Aquí vamos a dividir. Dividir es repartir en partes iguales.', visual: D.grupos(3, 4) },
      { texto: '12 bayas en 3 canastas: 4 en cada una. Se escribe 12 ÷ 3 = 4.' },
      { texto: 'La división es la multiplicación al revés: como 3 × 4 = 12, entonces 12 ÷ 3 = 4.' }
    ],
    niveles: [
      { titulo: 'Repartir bayas', explica: 'Reparte las bayas para que todas las canastas tengan lo mismo.', gen: DV.repartir },
      { titulo: 'Armar grupos', explica: 'Ahora sabes cuántas van en cada bolsa. ¿Cuántas bolsas llenas?', gen: DV.grupos },
      { titulo: 'División con arrays', explica: 'Un array también sirve para dividir: el total repartido en filas iguales.', gen: DV.conArray },
      { titulo: 'Familia de datos', explica: '4 × 5 = 20, entonces 20 ÷ 5 = 4. Son de la misma familia.', ejemplo: () => D.familia(4, 5, 20, '×'), gen: DV.familia },
      { titulo: 'Dividir por 2 y por 10', explica: 'Dividir por 2 es la mitad. Dividir por 10 es quitar el 0.', gen: DV.porDivisor([2, 10], 10) },
      { titulo: 'Dividir por 5', explica: 'Piensa en la tabla del 5: ¿5 por cuánto da ese número?', gen: DV.porDivisor([5], 10) },
      { titulo: 'La división como multiplicación', explica: '24 ÷ 4 es preguntar 4 × ? = 24.', gen: DV.comoMult },
      { titulo: 'Dividir por 3 y por 4', explica: 'Piensa en las tablas del 3 y del 4.', gen: DV.porDivisor([3, 4], 10) },
      { titulo: 'Reglas especiales', explica: 'Dividir por 1 deja el número igual. Un número dividido por sí mismo da 1. Y 0 dividido por cualquier número da 0.', gen: DV.especiales },
      { titulo: 'Desafío de la Cueva', explica: '¡Desafío final de la cueva! Divisiones de todo tipo.', gen: mezcla([DV.conArray, DV.familia, DV.porDivisor([2, 5, 10], 10), DV.comoMult, DV.porDivisor([3, 4], 10), DV.especiales]) }
    ]
  }
];

// ---------- Frases fijas de Ocre ----------
// Están todas acá para poder grabarlas (ver herramientas/guion.js).

const TXT = {
  muyBien: '¡Muy bien!',
  casi: 'Casi. Mira la pista de Ocre y prueba otra vez.',
  volverAtras: 'Toca el botón de volver atrás para intentarlo de nuevo.',
  caidaOso: '¡El oso te alcanzó!',
  caidaRio: '¡Te caíste al río!',
  caidaPrecipicio: '¡Te caíste por el precipicio!',
  pistaCaido: 'Toca el botón de volver atrás, arriba a la izquierda, y vuelve a intentarlo.',
  pistaFin: 'Sigue caminando hacia la derecha hasta la casita.',
  pistaAnimal: nombre => `Camina hacia la derecha. ${nombre} necesita tu ayuda.`,
  pistaArbol: nombre => `${nombre} está arriba del árbol. Sube por las ramas saltando con la flecha ↑.`,
  yaTienes: p => `Ya tienes el poder de ${p.nombre.toLowerCase()}. ¡Sigue adelante!`,
  necesitaPortal: p => `${p.necesita} Entra al portal y busca una cuenta que dé un número con un ${p.num}.`,
  ganaste: p => `¡Ganaste un poder nuevo: ${p.nombre}! ${p.texto}`,
  comoUsar: p => `Cuando lo necesites, entra al portal y busca una cuenta que dé un número con un ${p.num}, como ${p.num}, ${10 + p.num} o ${20 + p.num}.`,
  portalElegir: p => `Busca la cuenta que da un número con un ${p.num}.`,
  portalElegirSub: 'Resuelve las cuentas y elige la que sirve.',
  portalCompletarSub: p => `¿Qué número va en el lugar del ? para que el resultado tenga un ${p.num}?`,
  tieneNum: p => `¡Tiene un ${p.num}! Ya puedes ${p.verbo}.`,
  pruebaOtra: 'Prueba con otra.',
  pistaPortalElegir: p => `Resuelve cada cuenta y mira el resultado. ¿Cuál tiene un ${p.num}? Por ejemplo ${p.num}, ${10 + p.num} o ${20 + p.num}.`,
  pistaPortalCompletar: p => `Prueba cada número: haz la cuenta y fíjate si el resultado tiene un ${p.num}, como ${p.num}, ${10 + p.num} o ${20 + p.num}.`,
  poderInfo: p => `${p.texto} Busca una cuenta que dé un número con un ${p.num}, como ${p.num}, ${10 + p.num} o ${20 + p.num}.`,
  poderTapado: p => `Este poder se gana en ${CAPITULOS[p.cap - 1].nombre}, nivel ${p.niv}.`,
  tocaPoder: 'Toca un poder para saber cómo se usa.',
  finTitulo: '¡Nivel completado!',
  finTodo: '¡Terminaste todo el bosque!',
  fin: { 3: '¡Perfecto! Lo hiciste sin errores.', 2: '¡Muy bien! Casi sin errores.', 1: '¡Lo lograste! Cada error te ayuda a aprender.' },
  pruebaVoz: 'Hola, Emily. Soy Ocre. Así suena mi voz.'
};
