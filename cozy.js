// ================= Getting Cozy =================
// Un cuarto isométrico en pixel art que empieza vacío y frío. Los planes por la
// ciudad dan monedas para decorarlo, y los logros regalan objetos especiales.
//
// Cómo se dibuja: todo se pinta en un lienzo pequeño de 240x184 píxeles
// ("lógico") y luego se amplía sin suavizar en el lienzo visible, con zoom y
// desplazamiento. El cuarto mide 96x96 unidades de suelo y 64 de alto.
// Proyección isométrica 2:1: x = OX + X - Y, y = OY + (X + Y) / 2 - Z.

const LW = 240, LH = 184, OX = 120, OY = 70;
const SALA = 96, ALTO = 64, GROSOR = 4;

// ---------- Guardado (solo en este navegador) ----------
function leer(clave, porDefecto) {
  try {
    const valor = JSON.parse(localStorage.getItem(clave));
    return valor ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

const estado = Object.assign(
  { monedas: 0, cobrados: [], comprados: [], logros: [], colores: {},
    avatar: { nombre: "", estetica: 0, piel: 0, pelo: 1, peinado: 1, jersey: 0 } },
  leer("berlin-cozy", {})
);
// Si el avatar guardado viene incompleto (partidas antiguas), se completa con los valores por defecto.
estado.avatar = Object.assign({ nombre: "", estetica: 0, piel: 0, pelo: 1, peinado: 1, jersey: 0 }, estado.avatar);

function guardar() {
  try {
    localStorage.setItem("berlin-cozy", JSON.stringify(estado));
  } catch {
    // Sin almacenamiento, el juego funciona pero no recuerda nada.
  }
}

// ---------- Cobrar planes y comprobar logros ----------
function progresoCiudad() {
  const nombres = leer("berlin-visitados", []);
  return {
    visitados: LUGARES.filter((l) => nombres.includes(l.nombre)),
    cumplidas: leer("berlin-adviento-cumplidas", [])
  };
}

function cobrarYDesbloquear() {
  const c = progresoCiudad();
  const avisos = [];

  // Monedas: cada plan se cobra una sola vez, aunque luego se desmarque.
  const nuevos = [];
  for (const l of c.visitados) {
    const clave = "lugar:" + l.nombre;
    if (!estado.cobrados.includes(clave)) {
      estado.cobrados.push(clave);
      estado.monedas += MONEDAS_POR_LUGAR;
      nuevos.push(l.nombre);
    }
  }
  if (nuevos.length) {
    avisos.push({
      titulo: `+${nuevos.length * MONEDAS_POR_LUGAR} monedas`,
      texto: nuevos.length === 1 ? `Por visitar ${nuevos[0]}.` : `Por ${nuevos.length} planes nuevos por la ciudad.`
    });
  }

  let misiones = 0;
  for (const dia of c.cumplidas) {
    const clave = "adviento:" + dia;
    if (!estado.cobrados.includes(clave)) {
      estado.cobrados.push(clave);
      estado.monedas += MONEDAS_POR_MISION;
      misiones++;
    }
  }
  if (misiones) {
    avisos.push({
      titulo: `+${misiones * MONEDAS_POR_MISION} monedas`,
      texto: misiones === 1 ? "Por una misión de adviento." : `Por ${misiones} misiones de adviento.`
    });
  }

  // Logros: una vez conseguidos, se quedan.
  for (const logro of LOGROS) {
    if (!estado.logros.includes(logro.id) && logro.cumple(c)) {
      estado.logros.push(logro.id);
      avisos.push({ titulo: `Logro: ${logro.nombre}`, texto: `Nuevo objeto en tu cuarto: ${logro.objNombre}.`, logro: true });
    }
  }

  guardar();
  return avisos;
}

// ---------- Qué hay en el cuarto ----------
const objetosDeLogros = () => new Set(LOGROS.filter((l) => estado.logros.includes(l.id)).map((l) => l.objeto));

function tiene(id) {
  return estado.comprados.includes(id) || objetosDeLogros().has(id);
}

function color(paleta) {
  return PALETAS[paleta][estado.colores[paleta] ?? 0][1];
}

function nivelCozy() {
  const total = TIENDA.reduce((s, o) => s + o.puntos, 0) + LOGROS.reduce((s, l) => s + l.puntos, 0);
  const puntos = TIENDA.filter((o) => tiene(o.id)).reduce((s, o) => s + o.puntos, 0)
    + LOGROS.filter((l) => estado.logros.includes(l.id)).reduce((s, l) => s + l.puntos, 0);
  return Math.round((puntos / total) * 100);
}

function nombreNivel(pct) {
  if (pct < 15) return "Helado";
  if (pct < 35) return "Fresquito";
  if (pct < 60) return "Templado";
  if (pct < 85) return "Acogedor";
  return "Hygge total";
}

// ---------- Colores ----------
const aRgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const aHex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const aclarar = (h, k) => aHex(aRgb(h).map((v) => v + (255 - v) * k));
const oscurecer = (h, k) => aHex(aRgb(h).map((v) => v * (1 - k)));
const apagar = (h, k) => aHex(aRgb(h).map((v) => v * (1 - k) + 140 * k));

// ---------- Primitivas de dibujo en píxeles ----------
const logico = document.createElement("canvas");
logico.width = LW;
logico.height = LH;
const lg = logico.getContext("2d");
let ctx = lg; // se cambia temporalmente para dibujar los iconos y la vista previa

const P = (X, Y, Z = 0) => [OX + X - Y, OY + (X + Y) / 2 - Z];

function r(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

// Relleno de polígonos sin suavizado: bordes nítidos de pixel art.
function poligono(pts, c) {
  ctx.fillStyle = c;
  let min = Infinity, max = -Infinity;
  for (const [, y] of pts) { min = Math.min(min, y); max = Math.max(max, y); }
  for (let y = Math.floor(min); y < Math.ceil(max); y++) {
    const yc = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      if ((y1 <= yc && y2 > yc) || (y2 <= yc && y1 > yc)) xs.push(x1 + ((yc - y1) * (x2 - x1)) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.round(xs[k]), b = Math.round(xs[k + 1]);
      if (b > a) ctx.fillRect(a, y, b - a, 1);
    }
  }
}
const cara = (pts3, c) => poligono(pts3.map((p) => P(...p)), c);

// Caja isométrica con tres caras sombreadas.
function caja(X, Y, Z, w, d, h, c) {
  cara([[X, Y + d, Z], [X + w, Y + d, Z], [X + w, Y + d, Z + h], [X, Y + d, Z + h]], oscurecer(c, 0.12));
  cara([[X + w, Y, Z], [X + w, Y + d, Z], [X + w, Y + d, Z + h], [X + w, Y, Z + h]], oscurecer(c, 0.26));
  cara([[X, Y, Z + h], [X + w, Y, Z + h], [X + w, Y + d, Z + h], [X, Y + d, Z + h]], c);
}

// Rectángulos sobre un plano: pared izquierda (X fija), pared derecha (Y fija) o suelo (Z fija).
const enX = (x, Y0, Y1, Z0, Z1, c) => cara([[x, Y0, Z0], [x, Y1, Z0], [x, Y1, Z1], [x, Y0, Z1]], c);
const enY = (y, X0, X1, Z0, Z1, c) => cara([[X0, y, Z0], [X1, y, Z0], [X1, y, Z1], [X0, y, Z1]], c);
const plano = (X0, X1, Y0, Y1, Z, c) => cara([[X0, Y0, Z], [X1, Y0, Z], [X1, Y1, Z], [X0, Y1, Z]], c);

function punto(X, Y, Z, c) {
  const [x, y] = P(X, Y, Z);
  r(x, y, 1, 1, c);
}

function linea(a, b, c) {
  let [x0, y0] = P(...a).map(Math.round);
  const [x1, y1] = P(...b).map(Math.round);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  ctx.fillStyle = c;
  for (;;) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

function sprite(mapa, paleta, x, y, espejo = false) {
  mapa.forEach((fila, j) => {
    for (let i = 0; i < fila.length; i++) {
      const c = paleta[fila[espejo ? fila.length - 1 - i : i]];
      if (c) r(x + i, y + j, 1, 1, c);
    }
  });
}

// Sprite apoyado en un punto del mundo (los pies en X, Y, Z). Devuelve su recuadro.
function spriteEn(mapa, paleta, X, Y, Z, espejo = false, dx = 0, dy = 0) {
  const [x, y] = P(X, Y, Z);
  const x0 = Math.round(x) - Math.floor(mapa[0].length / 2) + dx, y0 = Math.round(y) - mapa.length + dy;
  sprite(mapa, paleta, x0, y0, espejo);
  return [x0, y0, mapa[0].length, mapa.length];
}

function brillo(x, y, radio, c) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radio);
  g.addColorStop(0, c);
  g.addColorStop(1, "rgba(255, 200, 120, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - radio, y - radio, radio * 2, radio * 2);
}

// ---------- Fondo: cuadrícula isométrica (se dibuja una vez) ----------
const fondo = document.createElement("canvas");
fondo.width = LW;
fondo.height = LH;
{
  const g = fondo.getContext("2d");
  g.fillStyle = "#f6f3ec";
  g.fillRect(0, 0, LW, LH);
  g.fillStyle = "#ebe5d8";
  for (let k = -2 * LH; k < LW + 2 * LH; k += 16) {
    for (let x = 0; x < LW; x++) {
      g.fillRect(x, Math.floor((x - k) / 2), 1, 1);
      g.fillRect(x, Math.floor((k - x) / 2), 1, 1);
    }
  }
}

// ---------- Nieve al otro lado de la ventana ----------
const VENTANA = { X0: 50, X1: 78, Z0: 22, Z1: 48 };
const copos = Array.from({ length: 22 }, () => ({
  X: VENTANA.X0 + 1.5 + Math.random() * 25, Z: VENTANA.Z0 + 5 + Math.random() * 20, v: 0.12 + Math.random() * 0.2
}));

// ---------- Objetos ----------
// capa "pared": se dibuja con las paredes. capas "suelo" y "colgante": se ordenan por
// profundidad (X + Y) junto con el avatar. capa "icono": solo existe en la tienda.
// dibujar(t, enIcono): enIcono = true cuando se pinta para la tienda.
const OBJETOS = {
  radiador: {
    capa: "pared",
    dibujar(t) {
      caja(54, 0.5, 4, 20, 3, 13, "#dcdcd8");
      for (let X = 56; X <= 72; X += 3) linea([X, 3.5, 5], [X, 3.5, 16], "#b8b8b2");
      caja(55, 1, 2, 1, 1, 2, "#8f8f8a"); caja(72, 1, 2, 1, 1, 2, "#8f8f8a");
      const f = Math.floor(t / 350) % 2;
      for (const X of [58, 64, 70]) { punto(X, 2, 19 + f, "#f2a07a"); punto(X + 1, 2, 21 - f, "#f2a07a"); }
    }
  },
  cortinas: {
    capa: "pared",
    dibujar() {
      linea([42, 1, 53], [86, 1, 53], "#6b4b32");
      for (const X of [44, 79]) {
        caja(X, 0.5, 14, 5, 2, 38, "#b5523b");
        linea([X + 2, 2.5, 15], [X + 2, 2.5, 51], "#8f3e2c");
        caja(X - 0.5, 0.5, 32, 6, 2.5, 2, "#e2bd72");
      }
    }
  },
  velas: {
    capa: "pared",
    dibujar(t) {
      caja(66, 1.5, 22, 2, 2, 6, "#f6efe0"); caja(69.5, 1.5, 22, 2, 2, 4, "#f6efe0");
      const f = Math.floor(t / 160) % 2;
      punto(67, 2.5, 29, "#ffcf5a"); punto(67, 2.5, 30 + f, "#ff8a3a");
      punto(70.5, 2.5, 27, "#ffcf5a"); punto(70.5, 2.5, 28 + (1 - f), "#ff8a3a");
    }
  },
  moka: {
    capa: "pared",
    dibujar(t) {
      caja(74, 1.5, 22, 3, 3, 5, "#9aa0a8"); caja(74.5, 2, 27, 2, 2, 2, "#b5bac2"); caja(75, 2.5, 29, 1, 1, 1, "#2b2b2b");
      const f = Math.floor(t / 400) % 2;
      punto(75 + f, 3, 32, "#ffffff"); punto(76 - f, 3, 34, "#ffffff");
    }
  },
  ampelmann: {
    capa: "pared",
    dibujar() {
      caja(56, 1, 22, 4, 3, 10, "#2b2b2b");
      enY(4.01, 56.5, 59.5, 27.5, 31, "#5a1f1f");
      enY(4.01, 56.5, 59.5, 23, 26.5, "#1f3a22");
      for (const [X, Z] of [[58, 26], [57.5, 25], [58, 25], [58.5, 25], [58, 24], [57.5, 23.5], [58.5, 23.5]]) punto(X, 4, Z, "#7cf08a");
    }
  },
  estrella: {
    capa: "pared",
    dibujar() {
      linea([64.5, 4, 52], [64.5, 4, 46], "#888888");
      const c = "#fff3c4";
      const [x, y] = P(64.5, 4, 41);
      const cx = Math.round(x), cy = Math.round(y);
      r(cx - 1, cy - 3, 3, 7, c); r(cx - 3, cy - 1, 7, 3, c);
      r(cx, cy - 5, 1, 2, c); r(cx, cy + 4, 1, 2, c); r(cx - 5, cy, 2, 1, c); r(cx + 4, cy, 2, 1, c);
      r(cx - 2, cy - 2, 1, 1, c); r(cx + 2, cy - 2, 1, 1, c); r(cx - 2, cy + 2, 1, 1, c); r(cx + 2, cy + 2, 1, 1, c);
      r(cx, cy, 1, 1, "#ffd36b");
    }
  },
  guirnalda: {
    capa: "pared",
    dibujar(t) {
      const colores = ["#ffd36b", "#ff8a6b", "#8ad1ff", "#b8ff8a", "#ff9ad8"];
      const z = (u) => 58 - 2 * Math.abs(Math.sin(u / 7));
      for (let u = 1; u < SALA; u++) { punto(u, 0.3, z(u), "#4a5a3a"); punto(0.3, u, z(u), "#4a5a3a"); }
      for (let i = 0; i < 12; i++) {
        const u = 4 + i * 8;
        const apagada = (i + Math.floor(t / 600)) % 4 === 0;
        const c = apagada ? oscurecer(colores[i % 5], 0.45) : colores[i % 5];
        const c2 = apagada ? oscurecer(colores[(i + 2) % 5], 0.45) : colores[(i + 2) % 5];
        punto(u, 0.3, z(u) - 1, c); punto(u + 1, 0.3, z(u + 1) - 1, c); punto(u, 0.3, z(u) - 2, c);
        punto(0.3, u, z(u) - 1, c2); punto(0.3, u + 1, z(u + 1) - 1, c2); punto(0.3, u, z(u) - 2, c2);
      }
    }
  },
  cuadro: {
    capa: "pared",
    dibujar() {
      enX(0.2, 40, 57, 30, 46, "#6b4b32");
      enX(0.3, 42, 55, 32, 44, "#9cc3e0");
      cara([[0.4, 42, 32], [0.4, 55, 32], [0.4, 55, 37], [0.4, 50, 40], [0.4, 46, 36], [0.4, 42, 38]], "#6f9a5a");
      enX(0.4, 45, 47, 40, 42, "#f2d26b");
    }
  },
  poster: {
    capa: "pared",
    dibujar() {
      enX(0.2, 64, 76, 20, 44, "#1f2433");
      enX(0.3, 66, 73, 30, 35, "#e2b53e"); enX(0.3, 66, 69, 35, 38, "#e2b53e"); enX(0.3, 66, 67, 38, 39, "#e2b53e");
      enX(0.3, 67, 68, 28, 30, "#e2b53e"); enX(0.3, 71, 72, 28, 30, "#e2b53e");
      enX(0.3, 66, 74, 24, 25, "#e2b53e"); enX(0.3, 67, 73, 22, 23, "#8a8f9e");
    }
  },
  mapa: {
    capa: "pared",
    dibujar() {
      enX(0.2, 80, 93, 26, 41, "#efe6cf");
      enX(0.3, 84, 85, 26, 41, "#d6c9a8"); enX(0.3, 89, 90, 26, 41, "#d6c9a8"); enX(0.3, 80, 93, 36, 37, "#d6c9a8");
      const rio = [[81, 31], [82, 32], [83, 32], [84, 31], [85, 30], [86, 30], [87, 31], [88, 32], [89, 32], [90, 31], [91, 30], [92, 30]];
      for (const [Y, Z] of rio) punto(0.4, Y, Z, "#6a8fc0");
      enX(0.4, 86, 88, 33, 35, "#c23b30");
    }
  },
  postal: {
    capa: "pared",
    dibujar() {
      enY(0.2, 15, 25, 30, 37, "#c9c9c9"); enY(0.3, 16, 24, 31, 36, "#ffffff");
      enY(0.4, 21, 23, 33, 35, "#c23b30"); enY(0.4, 17, 20, 33, 34, "#7a8aa8"); enY(0.4, 17, 19, 32, 32.6, "#7a8aa8");
    }
  },
  banderin: {
    capa: "pared",
    dibujar() {
      const z = (Y) => 54 - 2 * Math.sin(((Y - 36) / 28) * Math.PI);
      for (let Y = 36; Y <= 64; Y++) punto(0.3, Y, z(Y), "#555555");
      [37, 43, 49, 55].forEach((Y, i) => {
        const c = i % 2 ? "#f7ecd8" : "#c23b30";
        cara([[0.4, Y, z(Y)], [0.4, Y + 4, z(Y + 4)], [0.4, Y + 2, z(Y + 2) - 5]], c);
      });
    }
  },
  planta: {
    capa: "colgante", prof: 92,
    dibujar() {
      linea([86, 4, 64], [86, 4, 52], "#a88a64"); linea([90, 8, 64], [90, 8, 52], "#a88a64");
      caja(85, 3, 46, 6, 6, 6, "#c4673e"); caja(84.5, 2.5, 51, 7, 7, 1, "#a8502e");
      const hojas = [[84, 9, 40, 6], [86, 10, 38, 8], [90, 9, 41, 5], [91, 6, 39, 7], [88, 10, 44, 3], [85, 4, 52, 3], [89, 5, 53, 2]];
      for (const [X, Y, Z, h] of hojas) caja(X, Y, Z, 1, 1, h, "#4f8a4a");
      for (const [X, Y, Z] of [[84, 9, 42], [86, 10, 41], [91, 6, 42]]) punto(X, Y, Z, "#6fae5f");
    }
  },
  bola: {
    capa: "colgante", prof: 112,
    dibujar(t, enIcono) {
      linea([56, 56, 70], [56, 56, 58], "#888888");
      caja(53, 53, 51, 6, 6, 6, "#b8bcc6");
      for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) if ((i + k) % 2) punto(53 + i, 59, 51 + k, "#e6e9ef");
      if (enIcono) return;
      const s = Math.floor(t / 300);
      const destellos = ["#ffffff", "#fff6b0", "#ff9ad8", "#8ad1ff", "#b8ff8a"];
      for (let k = 0; k < 7; k++) punto(10 + ((s * 7 + k * 23) % 80), 10 + ((s * 11 + k * 31) % 80), 0, destellos[k % 5]);
    }
  },

  // ---- Suelo ----
  alfombra: {
    capa: "suelo", prof: -1,
    dibujar() {
      const c = color("alfombra");
      plano(40, 72, 36, 68, 0.3, c);
      plano(42, 70, 38, 66, 0.4, aclarar(c, 0.3));
      plano(43, 69, 39, 65, 0.5, c);
      cara([[56, 42, 0.6], [66, 52, 0.6], [56, 62, 0.6], [46, 52, 0.6]], aclarar(c, 0.45));
      cara([[56, 46, 0.7], [62, 52, 0.7], [56, 58, 0.7], [50, 52, 0.7]], c);
      for (let Y = 37; Y < 68; Y += 2) { punto(39, Y, 0.3, "#eadfc8"); punto(73, Y, 0.3, "#eadfc8"); }
    }
  },
  estanteria: {
    capa: "suelo", prof: 27,
    dibujar() {
      const m = "#8a6440";
      caja(0, 16, 0, 9, 15, 42, m);
      const libros = ["#b8433a", "#3f6e9e", "#d4a237", "#5d8a5a", "#7a5a9a", "#e9e2d0", "#c0453a", "#4a6a9a"];
      for (const [Z0, Z1] of [[3, 12], [14, 23], [25, 34]]) {
        enX(9.01, 17, 30, Z0, Z1, oscurecer(m, 0.45));
        let Y = 17.5, i = Z0;
        while (Y < 28.5) {
          const w = (i * 7) % 3 === 0 ? 2 : 1.5, h = Z1 - Z0 - 1 - ((i * 5) % 3);
          enX(9.02, Y, Y + w, Z0, Z0 + h, libros[i % libros.length]);
          Y += w + 0.3;
          i++;
        }
      }
      caja(3, 22, 42, 4, 4, 3, "#c4673e"); caja(4, 23, 45, 1, 1, 4, "#5d8a5a"); caja(5, 24, 45, 1, 1, 3, "#6fae5f");
    }
  },
  arbol: {
    capa: "suelo", prof: 12,
    dibujar(t) {
      caja(4, 4, 0, 6, 6, 5, "#a8502e");
      const [bx, by] = P(7, 7, 5);
      const cx = Math.round(bx), cy = Math.round(by);
      r(cx - 1, cy - 4, 3, 4, "#6b4b32");
      for (let k = 0; k < 3; k++) {
        for (let j = 0; j < 13; j++) {
          const w = Math.round(5 + 5 * k + (j / 12) * (10 + 2 * k));
          r(cx - Math.floor(w / 2), cy - 43 + k * 13 + j, w, 1, j === 12 ? "#24563a" : (j + k) % 4 === 0 ? "#3a7a4a" : "#2f6b3f");
        }
      }
      r(cx - 1, cy - 47, 3, 3, "#ffd36b"); r(cx, cy - 48, 1, 5, "#ffd36b"); r(cx - 2, cy - 46, 5, 1, "#ffd36b");
      const luces = [[-2, -37], [3, -33], [-5, -26], [5, -23], [0, -29], [-8, -14], [2, -16], [8, -10], [-3, -8], [-10, -6], [6, -19]];
      const colores = ["#ffd36b", "#ff6b6b", "#8ad1ff", "#ffffff"];
      luces.forEach(([dx, dy], i) => { if ((i + Math.floor(t / 500)) % 3) r(cx + dx, cy + dy, 1, 1, colores[i % 4]); });
    }
  },
  mesita: {
    capa: "suelo", prof: 28,
    dibujar(t) {
      const m = "#8a6440";
      for (const [X, Y] of [[15, 5], [24, 5], [15, 14], [24, 14]]) caja(X, Y, 0, 1, 1, 10, oscurecer(m, 0.2));
      caja(14, 4, 10, 12, 12, 2, m);
      caja(18, 8, 12, 3, 3, 4, "#ffffff"); plano(18, 21, 8, 11, 16.01, "#b5733a"); caja(21, 9, 13, 1, 1, 2, "#ffffff");
      const f = Math.floor(t / 400) % 2;
      punto(19 + f, 9, 19, "#ffffff"); punto(20 - f, 9, 21, "#ffffff");
    }
  },
  sillon: {
    capa: "suelo", prof: 49,
    dibujar() {
      const c = color("sillon");
      caja(28, 2, 0, 20, 18, 8, oscurecer(c, 0.05));
      caja(28, 2, 8, 20, 5, 13, c);
      caja(31, 7, 8, 14, 12, 2, aclarar(c, 0.15));
      caja(28, 2, 8, 3, 18, 6, c); caja(45, 2, 8, 3, 18, 6, c);
    }
  },
  cama: {
    capa: "suelo", prof: 66,
    dibujar() {
      const m = "#8a6440", c = color("edredon");
      caja(0, 36, 0, 36, 24, 7, m);
      caja(1, 37, 7, 34, 22, 4, "#f4f1ea");
      caja(12, 36.5, 9, 24, 23, 3, c);
      for (let i = 0; i < 4; i++) plano(15 + i * 5, 17 + i * 5, 40 + (i % 2) * 8, 44 + (i % 2) * 8, 12.01, aclarar(c, 0.35));
      caja(2, 39, 11, 8, 8, 3, "#ffffff"); caja(2, 49, 11, 8, 8, 3, "#ffffff");
      caja(0, 36, 0, 2, 24, 22, m); caja(0, 36, 22, 2, 24, 1, aclarar(m, 0.2));
    }
  },
  lampara: {
    capa: "suelo", prof: 68,
    dibujar() {
      caja(2, 62, 0, 6, 6, 1, "#3b3b3b");
      caja(4.5, 64.5, 1, 1, 1, 32, "#3b3b3b");
      caja(1, 61, 31, 8, 8, 8, "#f3d9a4");
      plano(1, 9, 61, 69, 39.01, "#fff3c4");
    }
  },
  muro: {
    capa: "suelo", prof: 89,
    dibujar() {
      caja(2, 80, 0, 6, 8, 26, "#a9a59d");
      caja(1.5, 79.5, 26, 7, 9, 2, "#bdb9b1");
      enX(8.01, 81, 84, 18, 22, "#e04a8a"); enX(8.01, 84, 87, 10, 14, "#3fb0e0"); enX(8.01, 81, 83, 5, 8, "#5ec46a");
      enY(88.01, 3, 6, 15, 20, "#f2d23b"); enY(88.01, 4, 7, 6, 9, "#e05a3a");
    }
  },
  libro: {
    capa: "suelo", prof: 127, fijo: true,
    dibujar(t) {
      caja(44, 76, 0, 9, 7, 1.5, "#f6efe0");
      caja(43.5, 75.5, 1.5, 10, 8, 1, "#8a2f3a");
      plano(46, 49, 78, 79, 2.51, "#e2b53e");
      if (Math.floor(t / 700) % 3 === 0) { punto(55, 75, 6, "#ffd36b"); punto(56, 75, 8, "#ffd36b"); punto(54, 75, 7, "#fff3c4"); }
    }
  },
  // Maleta marrón abierta, desde el primer día: un portátil, unos libros y otro conjunto de ropa.
  maleta: {
    capa: "suelo", prof: 158, fijo: true,
    dibujar() {
      const piel = "#8a5a3a", forro = "#c9a27a", correa = "#5e3a22", laton = "#e2b53e";
      // Tapa abierta, apoyada hacia atrás.
      caja(70, 76.5, 4, 16, 1.5, 12, piel);
      enY(78.01, 71, 85, 5, 15, forro);
      enY(78.02, 72, 84, 9, 9.6, oscurecer(forro, 0.2)); // bolsillo
      enY(78.02, 74, 75, 5, 15, correa); enY(78.02, 81, 82, 5, 15, correa);
      // Base, con el forro por dentro.
      caja(70, 78, 0, 16, 10, 4, piel);
      plano(71, 85, 79, 87, 4.01, forro);
      enY(88.01, 73, 75, 2, 3.5, laton); enY(88.01, 81, 83, 2, 3.5, laton);
      enY(88.01, 76.5, 79.5, 3, 3.6, correa);
      enX(86.01, 78, 80, 0, 4, correa); enX(86.01, 86, 88, 0, 4, correa);
      // Dentro: portátil cerrado, una pila de libros y otro conjunto doblado.
      caja(72, 79.5, 4, 6.5, 4.5, 0.8, "#b5bac2");
      plano(74.5, 75.5, 81.5, 82.5, 4.81, "#e6e9ef");
      caja(79.5, 79.5, 4, 4.5, 3.5, 1, "#3f6e9e");
      caja(79.5, 79.5, 5, 4.5, 3.5, 1, "#c0453a");
      caja(79.8, 79.8, 6, 3.8, 2.8, 0.9, "#d4a237");
      caja(72, 84.5, 4, 12, 2.5, 0.8, "#4a6a9a");          // pantalón
      caja(72.5, 84.7, 4.8, 6, 2.2, 0.9, "#e9d8c4");       // camisa
      caja(79, 84.7, 4.8, 5, 2.2, 0.9, "#5d8a5a");         // jersey
    }
  },
  gato: {
    capa: "suelo",
    pos: () => (tiene("cama") ? [26, 48, 12] : [62, 46, 0.5]),
    dibujar(t, enIcono) {
      const [X, Y, Z] = enIcono ? [20, 20, 0] : this.pos();
      const cola = Math.floor(t / 500) % 2;
      const cuerpo = ["o.....o...", "oo...oo...", "ooooooo...", "oeoooeo..."];
      const final = cola
        ? ["ooonooo..o", ".ooooo..o.", ".owwwoo.o.", "oooooooo.."]
        : ["ooonooo...", ".ooooo...o", ".owwwoo.o.", "oooooooo.."];
      spriteEn([...cuerpo, ...final], { o: "#d9822b", e: "#2a2320", n: "#e8908a", w: "#f5e6d3" }, X, Y, Z);
    }
  },
  peluche: {
    capa: "suelo",
    pos: () => (tiene("cama") ? [6, 54, 11] : [38, 84, 0]),
    dibujar(t, enIcono) {
      const [X, Y, Z] = enIcono ? [20, 20, 0] : this.pos();
      spriteEn(["b.....b", "bbbbbbb", "bebbbeb", "bbbmbbb", ".bbbbb.", "bbbbbbb", ".b...b."],
        { b: "#9a6a42", e: "#2a2320", m: "#e0b98f" }, X, Y, Z);
    }
  },

  // ---- Solo para los iconos de la tienda (en el cuarto se ven de otra forma) ----
  pintura: {
    capa: "icono",
    dibujar() {
      caja(10, 10, 0, 10, 10, 10, "#9aa0a8");
      plano(10, 20, 10, 20, 10.01, color("pared"));
      enY(20.01, 12, 16, 3, 10, color("pared"));
    }
  },
  suelo: {
    capa: "icono",
    dibujar() {
      const c = color("suelo");
      plano(0, 24, 0, 24, 0, c);
      for (let Y = 4; Y < 24; Y += 4) linea([0, Y, 0], [24, Y, 0], oscurecer(c, 0.15));
    }
  },
  ropa: {
    capa: "icono",
    dibujar() {
      spriteEn(mapaAvatar(estado.avatar, { ropa: "casa" }), paletaAvatar(), 20, 20, 0);
    }
  }
};

// ---------- Avatar ----------
// Cabeza grande y simpática (estilo chibi): ojos con brillo, colorete y sonrisa.
function filasCara(lados, masc) {
  const L = lados;
  return [
    `.${L}ssssssss${L}.`,
    `.${L}sWessWes${L}.`,
    `.${L}seessees${L}.`,
    masc ? `.${L}ssssssss${L}.` : `.${L}rssssssr${L}.`,
    "..ssmssmss..",
    "...ssmmss...",
    "....ssss...."
  ];
}

function cabeza(peinado, masc) {
  const melena = ["...hhhhhh...", "..hhhhhhhh..", ".hhhhhhhhhh.", ".hhhhhhhhhh."];
  const corto = ["............", "..hhhhhhhh..", ".hhhhhhhhhh.", ".hhhhhhhhhh."];
  switch (peinado) {
    case "Largo": {
      const c = filasCara("h", masc);
      c[4] = "hhssmssmsshh";
      c[5] = "hh.ssmmss.hh";
      c[6] = "hh..ssss..hh";
      return [...melena, ...c];
    }
    case "Moño":
      return ["....hhhh....", "....hhhh....", ...cabeza("Media melena", masc)];
    case "Corto": {
      const c = filasCara("s", masc);
      c[0] = ".hssssssssh.";
      return [...corto, ...c];
    }
    case "Rapado":
      return ["............", "............", "..hhhhhhhh..", ".hhhhhhhhhh.", ...filasCara("s", masc)];
    case "Con barba": {
      const c = filasCara("s", masc);
      c[0] = ".hssssssssh.";
      c[3] = ".hhsssssshh.";
      c[4] = "..hhmssmhh..";
      c[5] = "...hhmmhh...";
      c[6] = "....hhhh....";
      return [...corto, ...c];
    }
    default: { // Media melena
      const c = filasCara("h", masc);
      c[4] = ".hssmssmssh.";
      return [...melena, ...c];
    }
  }
}

// Ropa de calle (abrigo, vaqueros, zapatillas) y ropa de casa (jersey, pijama, calcetines).
const CUERPOS = {
  calle: {
    Femenina: ["..cccttccc..", ".cccccccccc.", ".cdccccccdc.", ".cdccccccdc.", ".cdccccccdc.", ".sdccccccds.", ".cccccccccc."],
    Masculina: [".ccccttcccc.", "cccccccccccc", "cdccccccccdc", "cdccccccccdc", "cdccccccccdc", "sdccccccccds", "..cccccccc.."]
  },
  casa: {
    Femenina: ["..kkkkkkkk..", ".kkkkkkkkkk.", ".kKKKKKKKKk.", ".kkkkkkkkkk.", ".kkkkkkkkkk.", ".skkkkkkkks.", "..kkkkkkkk.."],
    Masculina: [".kkkkkkkkkk.", "kkkkkkkkkkkk", "kKKKKKKKKKKk", "kkkkkkkkkkkk", "kkkkkkkkkkkk", "skkkkkkkkkks", "..kkkkkkkk.."]
  }
};
const PIERNAS = {
  calle: [
    ["...jjjjjj...", "...jj..jj...", "...jj..jj...", "..www..www.."],
    ["...jjjjjj...", "....jjjj....", "....jjjj....", "...wwwwww..."]
  ],
  casa: [
    ["...ppPppP...", "...pp..pp...", "...pP..pp...", "..ooo..ooo.."],
    ["...ppPppP...", "....pPpp....", "....pppP....", "...oooooo..."]
  ]
};
const SENTADO = {
  calle: ["..jjjjjjjj..", "..jj....jj..", "..ww....ww.."],
  casa: ["..ppPppPpp..", "..pp....pp..", "..oo....oo.."]
};

const esteticaDe = (a = estado.avatar) => AVATAR.estetica[a.estetica ?? 0];
const peinadoDe = (a = estado.avatar) => AVATAR.peinados[esteticaDe(a)][a.peinado ?? 0];
const nombreDe = (a = estado.avatar) => (a.nombre || "").trim();

function mapaAvatar(a, { ropa = tiene("ropa") ? "casa" : "calle", paso = 0, parpadeo = false, espalda = false, sentado = false } = {}) {
  const estetica = esteticaDe(a);
  let cab = cabeza(peinadoDe(a), estetica === "Masculina");
  if (parpadeo) cab = cab.map((f) => f.replace(/We/g, "ss")); // ojos cerrados: queda una línea
  let cuerpo = [...CUERPOS[ropa][estetica]];
  if (espalda) {
    cab = cab.map((f, i) => (i < cab.length - 1 ? f.replace(/[sWerm]/g, "h") : f));
    cuerpo = cuerpo.map((f) => f.replace(/t/g, "c").replace(/K/g, "k"));
  }
  if (peinadoDe(a) === "Largo") {
    cuerpo[0] = "h" + cuerpo[0].slice(1, -1) + "h";
    cuerpo[1] = "h" + cuerpo[1].slice(1, -1) + "h";
    if (espalda) cuerpo[2] = "hh" + cuerpo[2].slice(2, -2) + "hh";
  }
  const piernas = sentado ? SENTADO[ropa] : PIERNAS[ropa][paso];
  return [...cab, ...cuerpo, ...piernas];
}

function paletaAvatar(a = estado.avatar) {
  const ropa = AVATAR.jersey[a.jersey];
  const abrigo = apagar(ropa, 0.45);
  return {
    s: AVATAR.piel[a.piel], h: AVATAR.pelo[a.pelo], e: "#2a2320", W: "#ffffff", r: "#f09a8a", m: "#8a3a34",
    c: abrigo, d: oscurecer(abrigo, 0.18), t: "#f2efe8", j: "#4a6a9a", w: "#f4f4f4",
    k: ropa, K: aclarar(ropa, 0.4), p: aclarar(ropa, 0.6), P: aclarar(ropa, 0.25), o: "#f3e6cc"
  };
}

// Emoticonos sobre la cabeza.
const EMOTES = {
  corazon: { mapa: [".r.r.", "rrrrr", "rrrrr", ".rrr.", "..r.."], paleta: { r: "#e2475a" } },
  nota: { mapa: ["..nn", ".n.n", ".n..", "nn..", "nn.."], paleta: { n: "#3b3b3b" } },
  zeta: { mapa: ["zzz", "..z", ".z.", "z..", "zzz"], paleta: { z: "#4a6a9a" } },
  frio: { mapa: ["b.b", ".b.", "b.b"], paleta: { b: "#8ad1ff" } }
};

// Qué puede hacer el avatar según lo que hay en el cuarto.
function actividades() {
  const a = [{ X: 64, Y: 9, Z: 0, espalda: true, dur: 70 }]; // mirar la nieve
  if (tiene("sillon")) a.push({ X: 38, Y: 13, Z: 8, sentado: true, emote: "nota", dur: 120 });
  if (tiene("cama")) a.push({ X: 22, Y: 61, Z: 7, sentado: true, emote: "zeta", dur: 110 });
  if (tiene("estanteria")) a.push({ X: 13, Y: 24, Z: 0, espalda: true, dur: 70 });
  if (tiene("arbol")) a.push({ X: 15, Y: 15, Z: 0, espalda: true, emote: "corazon", dur: 60 });
  if (tiene("mesita")) a.push({ X: 20, Y: 20, Z: 0, emote: "nota", dur: 60 });
  if (tiene("gato")) {
    const [X, Y] = OBJETOS.gato.pos();
    a.push(tiene("cama")
      ? { X: 22, Y: 61, Z: 7, sentado: true, emote: "corazon", dur: 80 }
      : { X: X + 2, Y: Y + 8, Z: 0, emote: "corazon", dur: 70 });
  }
  return a;
}

const av = {
  X: 58, Y: 56, Z: 0, ruta: [], objetivo: null, espera: 20,
  paso: 0, avance: 0, parpadeo: 0, espalda: false, espejo: false, sentado: false, emote: null,
  caja: [0, 0, 0, 0], cabeza: [LW / 2, LH / 2]
};
const CENTRO = { X: 58, Y: 52 };

function elegirDestino() {
  const acts = actividades();
  const objetivo = Math.random() < 0.6
    ? acts[Math.floor(Math.random() * acts.length)]
    : { X: 44 + Math.random() * 30, Y: 34 + Math.random() * 36, Z: 0, dur: 30 + Math.random() * 50 };
  const dentro = (p) => p.X > 38 && p.X < 80 && p.Y > 30 && p.Y < 82;
  av.ruta = dentro(objetivo) && dentro(av) ? [objetivo] : [CENTRO, objetivo];
  av.objetivo = objetivo;
}

function moverAvatar() {
  if (av.parpadeo > 0) av.parpadeo--;
  else if (Math.random() < 0.025) av.parpadeo = 2;

  if (av.espera > 0) {
    av.espera--;
    if (av.espera === 0) {
      av.sentado = false;
      av.emote = null;
      av.Z = 0;
      elegirDestino();
    }
    return;
  }
  const meta = av.ruta[0];
  if (!meta) { elegirDestino(); return; }
  const dX = meta.X - av.X, dY = meta.Y - av.Y, dist = Math.hypot(dX, dY);
  if (dist < 0.7) {
    av.X = meta.X;
    av.Y = meta.Y;
    av.ruta.shift();
    if (!av.ruta.length) {
      const o = av.objetivo;
      av.sentado = !!o.sentado;
      av.Z = o.Z || 0;
      av.espalda = !!o.espalda;
      av.emote = o.emote || null;
      av.espera = Math.round(o.dur);
      av.paso = 0;
    }
    return;
  }
  const v = 0.55;
  av.X += (dX / dist) * v;
  av.Y += (dY / dist) * v;
  av.espalda = dX + dY < 0;  // se aleja de nosotros: de espaldas
  av.espejo = dX - dY < 0;   // va hacia la izquierda de la pantalla
  av.avance += v;
  av.paso = Math.floor(av.avance / 3) % 2;
}

function dibujarAvatar(t) {
  const mapa = mapaAvatar(estado.avatar, {
    paso: av.paso, parpadeo: av.parpadeo > 0 && !av.espalda, espalda: av.espalda, sentado: av.sentado
  });
  const quieto = av.espera > 0;
  const frio = !tiene("radiador") && nivelCozy() < 35;
  const dx = frio && quieto && Math.random() < 0.4 ? (Math.random() < 0.5 ? -1 : 1) : 0;
  const dy = !quieto && av.paso === 1 ? -1 : 0;
  const [x0, y0, w, h] = spriteEn(mapa, paletaAvatar(), av.X, av.Y, av.Z, av.espejo, dx, dy);
  av.caja = [x0, y0, w, h];
  av.cabeza = [x0 + w / 2, y0];
  const emote = av.emote || (frio && Math.floor(t / 1500) % 3 === 0 ? "frio" : null);
  if (emote) {
    const e = EMOTES[emote];
    const flota = Math.floor(t / 400) % 2;
    sprite(e.mapa, e.paleta, Math.round(x0 + w / 2 - e.mapa[0].length / 2), y0 - e.mapa.length - 3 - flota);
  }
}

// ---------- El cuarto completo ----------
function dibujarCuarto(t) {
  ctx = lg;
  ctx.drawImage(fondo, 0, 0);

  const pintada = tiene("pintura");
  const pared = pintada ? color("pared") : "#f2f1ec";
  const borde = pintada ? oscurecer(pared, 0.38) : "#d9d5cc";
  const madera = tiene("suelo");
  const tarima = madera ? color("suelo") : "#e9e6e0";

  // Canto del suelo y suelo.
  cara([[-GROSOR, SALA, -5], [SALA, SALA, -5], [SALA, SALA, 0], [-GROSOR, SALA, 0]], oscurecer(borde, 0.1));
  cara([[SALA, -GROSOR, -5], [SALA, SALA, -5], [SALA, SALA, 0], [SALA, -GROSOR, 0]], oscurecer(borde, 0.25));
  plano(0, SALA, 0, SALA, 0, tarima);
  const junta = oscurecer(tarima, madera ? 0.16 : 0.06);
  for (let Y = 8; Y < SALA; Y += 8) linea([0, Y, 0], [SALA, Y, 0], junta);
  if (madera) {
    for (let Y = 0, f = 0; Y < SALA; Y += 8, f++) {
      for (let X = (f % 2) * 12 + 6; X < SALA; X += 24) linea([X, Y, 0], [X, Y + 8, 0], junta);
    }
  } else {
    for (let X = 8; X < SALA; X += 8) linea([X, 0, 0], [X, SALA, 0], junta);
  }

  // Luz de la ventana en el suelo.
  cara([[52, 2, 0.1], [78, 2, 0.1], [92, 34, 0.1], [66, 34, 0.1]], "rgba(255, 255, 255, 0.10)");

  // Paredes: cara interior, zócalo, cantos y remate superior.
  enX(0, 0, SALA, 0, ALTO, oscurecer(pared, 0.07));
  enY(0, 0, SALA, 0, ALTO, pared);
  enX(0.05, 0, SALA, 0, 3, oscurecer(pared, 0.15));
  enY(0.05, 0, SALA, 0, 3, oscurecer(pared, 0.1));
  cara([[-GROSOR, SALA, -5], [0, SALA, -5], [0, SALA, ALTO], [-GROSOR, SALA, ALTO]], borde);
  cara([[SALA, -GROSOR, -5], [SALA, 0, -5], [SALA, 0, ALTO], [SALA, -GROSOR, ALTO]], oscurecer(borde, 0.15));
  cara([[-GROSOR, -GROSOR, ALTO], [SALA, -GROSOR, ALTO], [SALA, 0, ALTO], [0, 0, ALTO], [0, SALA, ALTO], [-GROSOR, SALA, ALTO]], aclarar(borde, 0.25));

  // Ventana: cielo, edificios, la Torre de Televisión y nieve.
  const { X0, X1, Z0, Z1 } = VENTANA;
  enY(0.1, X0 - 1, X1 + 1, Z0 - 1, Z1 + 1, "#ffffff");
  enY(0.2, X0 + 1, X1 - 1, Z0 + 1, Z1 - 1, "#4a5f8f");
  enY(0.3, X0 + 1, X0 + 7, Z0 + 4, Z0 + 12, "#3a4b75"); enY(0.3, X0 + 8, X0 + 15, Z0 + 4, Z0 + 15, "#3a4b75");
  enY(0.3, X1 - 10, X1 - 1, Z0 + 4, Z0 + 10, "#3a4b75");
  enY(0.3, X0 + 19, X0 + 20, Z0 + 8, Z1 - 4, "#2c3a5c"); enY(0.3, X0 + 18, X0 + 21, Z1 - 12, Z1 - 9, "#2c3a5c");
  enY(0.3, X0 + 1, X1 - 1, Z0 + 1, Z0 + 5, "#e9eef6");
  for (const c of copos) {
    c.Z -= c.v;
    if (c.Z < Z0 + 5) { c.Z = Z1 - 2; c.X = X0 + 1.5 + Math.random() * 25; }
    punto(c.X + Math.sin(t / 900 + c.Z) * 0.6, 0.4, c.Z, "#ffffff");
  }
  enY(0.5, X0 + 13.5, X0 + 14.5, Z0 + 1, Z1 - 1, "#ffffff");
  enY(0.5, X0 + 1, X1 - 1, Z0 + 12.5, Z0 + 13.5, "#ffffff");
  caja(X0 - 2, 0, Z0 - 2, X1 - X0 + 4, 5, 2, "#ffffff");

  // Bombilla desnuda en la pared.
  enX(0.2, 70, 72, 50, 52, "#c9c9c9");
  caja(0.5, 70.5, 46, 2, 2, 3, "#ffffff");

  // Capa de pared; luego suelo y colgantes ordenados por profundidad, con el avatar entre medias.
  for (const [id, o] of Object.entries(OBJETOS)) if (o.capa === "pared" && tiene(id)) o.dibujar(t, false);

  const cola = [];
  for (const [id, o] of Object.entries(OBJETOS)) {
    if ((o.capa === "suelo" || o.capa === "colgante") && (o.fijo || tiene(id))) {
      const prof = o.pos ? o.pos()[0] + o.pos()[1] : o.prof;
      cola.push({ prof, dibujar: () => o.dibujar(t, false) });
    }
  }
  cola.push({ prof: av.X + av.Y + 0.5, dibujar: () => dibujarAvatar(t) });
  cola.sort((a, b) => a.prof - b.prof).forEach((e) => e.dibujar());

  // Luz: blanca y fría al principio, cálida cuanto más luces haya. Solo dentro del cuarto.
  ctx.save();
  ctx.beginPath();
  [[-GROSOR, -GROSOR, ALTO], [SALA, -GROSOR, ALTO], [SALA, -GROSOR, -5], [SALA, SALA, -5], [-GROSOR, SALA, -5], [-GROSOR, SALA, ALTO]]
    .forEach((p, i) => { const [x, y] = P(...p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.closePath();
  ctx.clip();
  const luces = ["lampara", "guirnalda", "velas", "arbol", "estrella"].filter(tiene).length;
  if (!luces) {
    ctx.fillStyle = "rgba(205, 225, 255, 0.14)";
    ctx.fillRect(0, 0, LW, LH);
  } else {
    ctx.fillStyle = `rgba(255, 160, 70, ${0.03 + 0.025 * luces})`;
    ctx.fillRect(0, 0, LW, LH);
    if (tiene("lampara")) brillo(...P(5, 65, 36), 60, "rgba(255, 200, 120, 0.32)");
    if (tiene("velas")) brillo(...P(68, 3, 29), 16, "rgba(255, 190, 100, 0.4)");
    if (tiene("arbol")) brillo(...P(7, 7, 25), 30, "rgba(255, 210, 120, 0.22)");
  }
  ctx.restore();
}

// ---------- Cámara: zoom y desplazamiento ----------
const $ = (id) => document.getElementById(id);
const lienzo = $("cuarto");
const pg = lienzo.getContext("2d");
const vista = { z: 1, cx: LW / 2, cy: LH / 2, seguir: false };
const ZOOM_MAX = 5;

function ajustarTamano() {
  const dpr = window.devicePixelRatio || 1;
  lienzo.width = Math.max(1, Math.round(lienzo.clientWidth * dpr));
  lienzo.height = Math.max(1, Math.round(lienzo.clientWidth * (LH / LW) * dpr));
}
new ResizeObserver(ajustarTamano).observe(lienzo);
ajustarTamano();

const escala = () => (lienzo.width / LW) * vista.z;
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));

function encuadrar() {
  const ancho = LW / vista.z, alto = LH / vista.z;
  vista.cx = limitar(vista.cx, ancho / 2, LW - ancho / 2);
  vista.cy = limitar(vista.cy, alto / 2, LH - alto / 2);
}

function origen() {
  const s = escala();
  return [lienzo.width / 2 - vista.cx * s, lienzo.height / 2 - vista.cy * s, s];
}

function aLogico(clientX, clientY) {
  const caja = lienzo.getBoundingClientRect();
  const dpr = lienzo.width / caja.width;
  const [dx, dy, s] = origen();
  return [((clientX - caja.left) * dpr - dx) / s, ((clientY - caja.top) * dpr - dy) / s];
}

function zoomEn(factor, lx = vista.cx, ly = vista.cy) {
  const z = limitar(vista.z * factor, 1, ZOOM_MAX);
  vista.cx = lx - ((lx - vista.cx) * vista.z) / z; // el punto (lx, ly) se queda bajo el cursor
  vista.cy = ly - ((ly - vista.cy) * vista.z) / z;
  vista.z = z;
  encuadrar();
  pintarControles();
}

function presentar() {
  if (vista.seguir) {
    vista.cx += (av.cabeza[0] - vista.cx) * 0.12;
    vista.cy += (av.cabeza[1] + 14 - vista.cy) * 0.12;
    encuadrar();
  }
  pg.imageSmoothingEnabled = false;
  pg.fillStyle = "#f6f3ec";
  pg.fillRect(0, 0, lienzo.width, lienzo.height);
  const [dx, dy, s] = origen();
  pg.drawImage(logico, dx, dy, LW * s, LH * s);
  colocarBocadillo();
}

// Ratón y dedos: arrastrar para moverse, Ctrl + rueda (o pellizcar) para el zoom.
const punteros = new Map();
let arrastre = null;

lienzo.addEventListener("pointerdown", (e) => {
  lienzo.setPointerCapture(e.pointerId);
  punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
  arrastre = { movido: 0 };
});

lienzo.addEventListener("pointermove", (e) => {
  if (!punteros.has(e.pointerId)) return;
  const antes = punteros.get(e.pointerId);
  const ahora = { x: e.clientX, y: e.clientY };

  if (punteros.size === 2) {
    const otro = [...punteros.entries()].find(([id]) => id !== e.pointerId)[1];
    const d0 = Math.hypot(antes.x - otro.x, antes.y - otro.y);
    const d1 = Math.hypot(ahora.x - otro.x, ahora.y - otro.y);
    const [lx, ly] = aLogico((ahora.x + otro.x) / 2, (ahora.y + otro.y) / 2);
    if (d0 > 0) zoomEn(d1 / d0, lx, ly);
    vista.seguir = false;
    if (arrastre) arrastre.movido += 10;
  } else if (arrastre) {
    const mx = ahora.x - antes.x, my = ahora.y - antes.y;
    arrastre.movido += Math.abs(mx) + Math.abs(my);
    if (vista.z > 1) {
      const caja = lienzo.getBoundingClientRect();
      const s = escala() / (lienzo.width / caja.width);
      vista.cx -= mx / s;
      vista.cy -= my / s;
      encuadrar();
      if (arrastre.movido > 4 && vista.seguir) { vista.seguir = false; pintarControles(); }
    } else if (e.pointerType === "touch") {
      window.scrollBy(0, -my); // sin zoom, el dedo sigue moviendo la página
    }
  }
  punteros.set(e.pointerId, ahora);
});

function soltar(e) {
  if (e.type === "pointerup" && punteros.size === 1 && arrastre && arrastre.movido < 6) pulsar(e.clientX, e.clientY);
  punteros.delete(e.pointerId);
  if (!punteros.size) arrastre = null;
}
lienzo.addEventListener("pointerup", soltar);
lienzo.addEventListener("pointercancel", soltar);

lienzo.addEventListener("wheel", (e) => {
  if (!e.ctrlKey && !e.metaKey) return; // la rueda sola sigue moviendo la página
  e.preventDefault();
  const [lx, ly] = aLogico(e.clientX, e.clientY);
  zoomEn(Math.exp(-e.deltaY * 0.01), lx, ly);
  vista.seguir = false;
}, { passive: false });

$("zoom-mas").onclick = () => zoomEn(1.5);
$("zoom-menos").onclick = () => zoomEn(1 / 1.5);
$("zoom-todo").onclick = () => { vista.z = 1; vista.seguir = false; encuadrar(); pintarControles(); };
$("zoom-seguir").onclick = () => {
  vista.seguir = !vista.seguir;
  if (vista.seguir && vista.z < 2.5) zoomEn(2.5 / vista.z, av.cabeza[0], av.cabeza[1]);
  pintarControles();
};

function pintarControles() {
  $("zoom-mas").disabled = vista.z >= ZOOM_MAX;
  $("zoom-menos").disabled = vista.z <= 1;
  $("zoom-todo").disabled = vista.z <= 1;
  $("zoom-seguir").setAttribute("aria-pressed", vista.seguir);
  $("zoom-seguir").textContent = vista.seguir ? "Siguiendo…" : `Seguir a ${nombreDe() || "tu avatar"}`;
  lienzo.classList.toggle("con-zoom", vista.z > 1);
}

// ---------- Bucle de animación (a ritmo de pixel art, ~12 fotogramas por segundo) ----------
let ultimo = 0;
function bucle(t) {
  if (t - ultimo > 80) {
    ultimo = t;
    moverAvatar();
    dibujarCuarto(t);
  }
  presentar();
  requestAnimationFrame(bucle);
}

// ---------- Iconos de la tienda y los logros ----------
const lienzoIconos = document.createElement("canvas");
lienzoIconos.width = LW;
lienzoIconos.height = LH;
const gIconos = lienzoIconos.getContext("2d", { willReadFrequently: true });

function icono(id, bloqueado = false) {
  gIconos.clearRect(0, 0, LW, LH);
  ctx = gIconos;
  OBJETOS[id].dibujar(0, true);
  ctx = lg;

  // Recortar al contenido.
  const datos = gIconos.getImageData(0, 0, LW, LH).data;
  let x0 = LW, y0 = LH, x1 = 0, y1 = 0;
  for (let y = 0; y < LH; y++) {
    for (let x = 0; x < LW; x++) {
      if (datos[(y * LW + x) * 4 + 3]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
  }
  const w = Math.max(1, x1 - x0 + 1), h = Math.max(1, y1 - y0 + 1);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cg = c.getContext("2d");
  cg.drawImage(lienzoIconos, x0, y0, w, h, 0, 0, w, h);
  if (bloqueado) {
    cg.globalCompositeOperation = "source-in";
    cg.fillStyle = "#c9c5bb";
    cg.fillRect(0, 0, w, h);
  }
  const k = Math.min(52 / w, 52 / h);
  c.style.width = `${w * k}px`;
  c.style.height = `${h * k}px`;
  c.className = "pixel";
  return c;
}

// ---------- Interfaz: monedas, nivel, tienda y logros ----------
function pintarHud() {
  $("monedas").textContent = estado.monedas;
  const pct = nivelCozy();
  $("nivel-relleno").style.width = pct + "%";
  $("nivel-nombre").textContent = `${nombreNivel(pct)} · ${pct}%`;
}

function pintarTienda() {
  const lista = $("tienda");
  lista.innerHTML = "";
  for (const o of TIENDA) {
    const comprado = estado.comprados.includes(o.id);
    const li = document.createElement("li");
    li.className = "objeto" + (comprado ? " comprado" : "");
    const marco = document.createElement("div");
    marco.className = "objeto-icono";
    marco.appendChild(icono(o.id));
    li.appendChild(marco);

    const texto = document.createElement("div");
    texto.className = "objeto-texto";
    texto.innerHTML = `<b>${o.nombre}</b><span>${o.desc}</span>`;
    if (comprado && o.colores) {
      const muestras = document.createElement("div");
      muestras.className = "muestras";
      PALETAS[o.colores].forEach(([nombre, hex], i) => {
        const b = document.createElement("button");
        b.className = "muestra";
        b.style.background = hex;
        b.title = nombre;
        b.setAttribute("aria-label", `${o.nombre}: ${nombre}`);
        b.setAttribute("aria-pressed", (estado.colores[o.colores] ?? 0) === i);
        b.onclick = () => {
          estado.colores[o.colores] = i;
          guardar();
          pintarTienda();
        };
        muestras.appendChild(b);
      });
      texto.appendChild(muestras);
    }
    li.appendChild(texto);

    const accion = document.createElement("div");
    accion.className = "objeto-accion";
    if (comprado) {
      accion.innerHTML = `<span class="en-cuarto">En tu cuarto</span>`;
    } else {
      const falta = o.precio - estado.monedas;
      const boton = document.createElement("button");
      boton.className = "pastilla pastilla-pequena " + (falta > 0 ? "pastilla-borde" : "pastilla-negra");
      boton.innerHTML = `<span class="moneda" aria-hidden="true"></span>${o.precio}`;
      boton.disabled = falta > 0;
      boton.title = falta > 0 ? `Te faltan ${falta} monedas` : `Comprar por ${o.precio} monedas`;
      boton.onclick = () => comprar(o);
      accion.appendChild(boton);
    }
    li.appendChild(accion);
    lista.appendChild(li);
  }
}

function comprar(o) {
  if (estado.monedas < o.precio || estado.comprados.includes(o.id)) return;
  estado.monedas -= o.precio;
  estado.comprados.push(o.id);
  guardar();
  pintarTodo();
  avisar({ titulo: `${o.nombre}, en tu cuarto`, texto: `Nivel de cozy: ${nombreNivel(nivelCozy())}.` });
}

function pintarLogros() {
  const lista = $("logros");
  lista.innerHTML = "";
  for (const l of LOGROS) {
    const hecho = estado.logros.includes(l.id);
    const li = document.createElement("li");
    li.className = "logro" + (hecho ? " hecho" : "");
    const marco = document.createElement("div");
    marco.className = "objeto-icono";
    marco.appendChild(icono(l.objeto, !hecho));
    li.appendChild(marco);
    const texto = document.createElement("div");
    texto.innerHTML = `<b>${l.nombre}</b><span>${hecho ? `Desbloqueado: ${l.objNombre}` : l.pista}</span>`;
    li.appendChild(texto);
    lista.appendChild(li);
  }
  $("cuenta-logros").textContent = `${estado.logros.length}/${LOGROS.length}`;
}

function pintarTodo() {
  pintarNombre();
  pintarHud();
  pintarTienda();
  pintarLogros();
  pintarControles();
}

// ---------- Avisos ----------
function avisar({ titulo, texto, logro }) {
  const caja = document.createElement("div");
  caja.className = "aviso" + (logro ? " aviso-logro" : "");
  caja.setAttribute("role", "status");
  const b = document.createElement("b");
  b.textContent = titulo;
  const s = document.createElement("span");
  s.textContent = texto;
  caja.append(b, s);
  $("avisos").appendChild(caja);
  setTimeout(() => caja.classList.add("saliendo"), 4500);
  setTimeout(() => caja.remove(), 5000);
}

// ---------- Pulsar en el cuarto: el avatar habla, el libro abre el álbum ----------
function pulsar(clientX, clientY) {
  const [x, y] = aLogico(clientX, clientY);
  const [bx, by] = P(48, 79, 2);
  if (Math.abs(x - bx) < 9 && Math.abs(y - by) < 6) {
    abrirAlbum();
    return;
  }
  const [ax, ay, aw, ah] = av.caja;
  if (x >= ax - 2 && x <= ax + aw + 2 && y >= ay - 2 && y <= ay + ah + 1) hablar();
}

let bocadilloHasta = 0;

function hablar() {
  const pct = nivelCozy();
  const frases = FRASES[pct < 35 ? 0 : pct < 75 ? 1 : 2];
  const b = $("bocadillo");
  b.textContent = "";
  const nombre = nombreDe();
  if (nombre) {
    const quien = document.createElement("b");
    quien.textContent = nombre;
    b.append(quien, document.createElement("br"));
  }
  b.append(frases[Math.floor(Math.random() * frases.length)]);
  b.hidden = false;
  if (!av.espera) av.espera = 40;
  bocadilloHasta = Date.now() + 3800;
  setTimeout(() => { if (Date.now() >= bocadilloHasta) b.hidden = true; }, 3900);
}

function colocarBocadillo() {
  const b = $("bocadillo");
  if (b.hidden) return;
  const [dx, dy, s] = origen();
  const dpr = lienzo.width / lienzo.getBoundingClientRect().width;
  b.style.left = (dx + av.cabeza[0] * s) / dpr + "px";
  b.style.top = (dy + (av.cabeza[1] - 2) * s) / dpr + "px";
}

// ---------- Editor del avatar ----------
function pintarEditor() {
  const opciones = $("editor-opciones");
  opciones.innerHTML = "";
  const grupos = [["estetica", "Estética"], ["piel", "Piel"], ["pelo", "Pelo"], ["peinado", "Peinado"], ["jersey", "Color de la ropa"]];
  for (const [clave, titulo] of grupos) {
    const valores = clave === "peinado" ? AVATAR.peinados[esteticaDe()] : AVATAR[clave];
    const fila = document.createElement("div");
    fila.className = "editor-fila";
    fila.innerHTML = `<span class="antetitulo">${titulo}</span>`;
    const botones = document.createElement("div");
    botones.className = "muestras";
    valores.forEach((valor, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-pressed", (estado.avatar[clave] ?? 0) === i);
      if (clave === "peinado" || clave === "estetica") {
        b.className = "filtro";
        b.textContent = valor;
      } else {
        b.className = "muestra";
        b.style.background = valor;
        b.setAttribute("aria-label", `${titulo} ${i + 1}`);
      }
      b.onclick = () => {
        estado.avatar[clave] = i;
        guardar();
        pintarEditor();
        pintarTienda(); // el icono de la ropa de casa usa los colores del avatar
      };
      botones.appendChild(b);
    });
    fila.appendChild(botones);
    opciones.appendChild(fila);
  }

  // Vista previa grande.
  const vistaPrevia = $("editor-vista");
  const g = vistaPrevia.getContext("2d");
  g.clearRect(0, 0, vistaPrevia.width, vistaPrevia.height);
  ctx = g;
  const mapa = mapaAvatar(estado.avatar);
  sprite(mapa, paletaAvatar(), 1, vistaPrevia.height - mapa.length - 1);
  ctx = lg;
}

$("editor-nombre").oninput = (e) => {
  estado.avatar.nombre = e.target.value;
  guardar();
  pintarNombre();
  pintarControles();
};

function pintarNombre() {
  const nombre = nombreDe();
  $("hud-nombre").textContent = nombre ? `El cuarto de ${nombre}` : "Tu cuarto";
  $("editor-titulo").textContent = nombre || "Tu avatar";
}

$("abrir-editor").onclick = () => {
  $("editor-nombre").value = estado.avatar.nombre || "";
  pintarEditor();
  $("editor").showModal();
};
$("cerrar-editor").onclick = () => $("editor").close();

for (const d of document.querySelectorAll("dialog")) {
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
}

// ---------- Arranque ----------
// Versión 2: las monedas solo se ganan con planes. Se ponen a cero una sola vez
// para borrar las que se dieron con el antiguo modo prueba.
if ((estado.version ?? 1) < 2) {
  estado.monedas = 0;
  estado.version = 2;
  guardar();
}
const avisosIniciales = cobrarYDesbloquear();
pintarTodo();
elegirDestino();
requestAnimationFrame(bucle);
avisosIniciales.forEach((a, i) => setTimeout(() => avisar(a), 400 + i * 700));
