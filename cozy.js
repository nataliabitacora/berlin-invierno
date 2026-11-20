// ================= Getting Cozy =================
// Un cuarto en pixel art que empieza vacío y frío. Los planes por la ciudad dan
// monedas para decorarlo, y los logros regalan objetos especiales.
// Todo se dibuja en un lienzo de 160x112 píxeles que el CSS amplía sin suavizar.

const W = 160, H = 112;

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
  { monedas: 0, cobrados: [], comprados: [], logros: [], colores: {}, avatar: { nombre: "", estetica: 0, piel: 0, pelo: 1, peinado: 1, jersey: 0 } },
  leer("berlin-cozy", {})
);

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
  let nuevos = [];
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

function color(paleta, porDefecto = 0) {
  return PALETAS[paleta][estado.colores[paleta] ?? porDefecto][1];
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

// ---------- Dibujo en píxeles ----------
const lienzo = document.getElementById("cuarto");
const pantalla = lienzo.getContext("2d");
let ctx = pantalla; // se cambia temporalmente para dibujar los iconos de la tienda

function r(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function sprite(mapa, paleta, x, y) {
  mapa.forEach((fila, j) => {
    for (let i = 0; i < fila.length; i++) {
      const c = paleta[fila[i]];
      if (c) r(x + i, y + j, 1, 1, c);
    }
  });
}

function aclarar(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const m = (v) => Math.round(v + (255 - v) * k);
  return `rgb(${m(n >> 16)}, ${m((n >> 8) & 255)}, ${m(n & 255)})`;
}

function oscurecer(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const m = (v) => Math.round(v * (1 - k));
  return `rgb(${m(n >> 16)}, ${m((n >> 8) & 255)}, ${m(n & 255)})`;
}

function brillo(x, y, radio, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radio);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(255, 200, 120, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - radio, y - radio, radio * 2, radio * 2);
}

// Nieve que cae al otro lado de la ventana.
const copos = Array.from({ length: 26 }, () => ({ x: 97 + Math.random() * 38, y: 13 + Math.random() * 36, v: 0.15 + Math.random() * 0.25 }));

// ---------- Objetos: cómo se dibuja cada uno ----------
// "caja" es el recuadro [x, y, ancho, alto] que se usa como icono en la tienda.
const OBJETOS = {
  radiador: {
    caja: [103, 57, 26, 21],
    dibujar(t) {
      r(104, 62, 24, 14, "#dcdcd8");
      for (let i = 0; i < 8; i++) r(105 + i * 3, 63, 1, 12, "#b5b5b0");
      r(104, 62, 24, 1, "#ecece8");
      r(105, 76, 2, 2, "#8f8f8a"); r(125, 76, 2, 2, "#8f8f8a");
      const f = Math.floor(t / 350) % 2;
      for (const x of [108, 115, 122]) { r(x + f, 59, 1, 1, "#f2b98a"); r(x + 1 - f, 58, 1, 1, "#f2b98a"); }
    }
  },
  lampara: {
    caja: [1, 35, 14, 62],
    dibujar() {
      r(3, 94, 10, 2, "#3b3b3b");
      r(7, 46, 2, 48, "#3b3b3b");
      for (let j = 0; j < 9; j++) r(8 - (3 + j / 2), 37 + j, 6 + j, 1, j === 8 ? "#e2bd72" : "#f3d9a4");
      r(5, 46, 6, 1, "#fff3c4");
    }
  },
  cortinas: {
    caja: [88, 8, 56, 48],
    dibujar() {
      r(88, 8, 56, 1, "#6b4b32");
      for (const x of [89, 136]) {
        r(x, 9, 7, 46, "#b5523b");
        r(x + 2, 9, 1, 46, "#8f3e2c"); r(x + 5, 9, 1, 46, "#8f3e2c");
      }
      r(89, 36, 7, 2, "#e2bd72"); r(136, 36, 7, 2, "#e2bd72");
    }
  },
  alfombra: {
    caja: [47, 95, 66, 11],
    dibujar() {
      const c = color("alfombra");
      r(50, 96, 60, 9, c);
      r(52, 97, 56, 1, aclarar(c, 0.35)); r(52, 103, 56, 1, aclarar(c, 0.35));
      for (let x = 55; x < 106; x += 6) r(x, 100, 2, 1, aclarar(c, 0.5));
      for (let y = 97; y < 105; y += 2) { r(48, y, 2, 1, "#eadfc8"); r(110, y, 2, 1, "#eadfc8"); }
    }
  },
  pintura: {
    caja: [0, 0, 14, 14],
    dibujar() { // solo para el icono: el color se ve en las paredes
      r(2, 4, 10, 9, "#9aa0a8"); r(2, 4, 10, 3, color("pared"));
      r(1, 3, 12, 1, "#7a808a"); r(4, 1, 6, 1, "#4a4a4a"); r(3, 2, 1, 1, "#4a4a4a"); r(10, 2, 1, 1, "#4a4a4a");
      r(5, 7, 2, 3, color("pared"));
    }
  },
  cama: {
    caja: [14, 60, 45, 36],
    dibujar() {
      const c = color("edredon");
      r(14, 60, 4, 36, "#8a6440"); r(14, 60, 4, 1, "#6b4b32");
      r(16, 86, 42, 6, "#8a6440"); r(16, 86, 42, 1, "#a77d54");
      r(17, 92, 2, 4, "#6b4b32"); r(55, 92, 2, 4, "#6b4b32");
      r(18, 79, 40, 7, "#f4f1ea");
      r(18, 73, 10, 6, "#ffffff"); r(18, 78, 10, 1, "#d9d4cc");
      r(27, 76, 31, 11, c); r(27, 76, 31, 1, aclarar(c, 0.35));
      for (let x = 30; x < 56; x += 5) r(x, 80 + ((x / 5) % 2) * 3, 2, 2, aclarar(c, 0.45));
    }
  },
  velas: {
    caja: [97, 41, 11, 10],
    dibujar(t) {
      r(99, 45, 3, 5, "#f6efe0"); r(103, 47, 3, 3, "#f6efe0");
      const f = Math.floor(t / 160) % 2;
      r(100, 43, 1, 2, "#ffcf5a"); r(100, 42 + f, 1, 1, "#ff8a3a");
      r(104, 45, 1, 2, "#ffcf5a"); r(104, 44 + (1 - f), 1, 1, "#ff8a3a");
    }
  },
  guirnalda: {
    caja: [0, 3, 42, 10],
    dibujar(t) {
      const y = (x) => 6 + Math.round(2 * Math.sin(x / 10));
      for (let x = 1; x < 159; x++) r(x, y(x), 1, 1, "#4a5a3a");
      const colores = ["#ffd36b", "#ff8a6b", "#8ad1ff", "#b8ff8a", "#ff9ad8"];
      for (let i = 0; i < 20; i++) {
        const x = 3 + i * 8;
        const apagada = (i + Math.floor(t / 600)) % 4 === 0;
        r(x, y(x) + 1, 2, 2, apagada ? oscurecer(colores[i % 5], 0.45) : colores[i % 5]);
      }
    }
  },
  estanteria: {
    caja: [18, 25, 32, 15],
    dibujar() {
      r(18, 36, 32, 2, "#8a6440"); r(20, 38, 1, 2, "#6b4b32"); r(47, 38, 1, 2, "#6b4b32");
      const libros = [[20, 2, 9, "#b8433a"], [22, 3, 10, "#3f6e9e"], [25, 2, 8, "#d4a237"], [27, 3, 9, "#5d8a5a"], [30, 2, 10, "#7a5a9a"], [32, 2, 7, "#e9e2d0"]];
      for (const [x, w, h, c] of libros) r(x, 36 - h, w, h, c);
      r(35, 33, 1, 3, "#c0453a"); r(36, 32, 1, 1, "#c0453a"); r(36, 33, 1, 3, "#c0453a"); r(37, 31, 1, 2, "#c0453a");
      r(41, 32, 5, 4, "#c4673e"); r(42, 29, 1, 3, "#5d8a5a"); r(44, 28, 1, 4, "#5d8a5a"); r(43, 30, 1, 1, "#6fae5f");
    }
  },
  mesita: {
    caja: [105, 76, 18, 20],
    dibujar(t) {
      r(106, 86, 16, 2, "#8a6440"); r(108, 88, 2, 8, "#6b4b32"); r(118, 88, 2, 8, "#6b4b32");
      r(112, 82, 4, 4, "#ffffff"); r(116, 83, 1, 2, "#ffffff"); r(112, 82, 4, 1, "#b5733a");
      const f = Math.floor(t / 400) % 2;
      r(113 + f, 79, 1, 1, "#ffffff"); r(114 - f, 77, 1, 1, "#ffffff");
    }
  },
  sillon: {
    caja: [126, 67, 32, 27],
    dibujar() {
      const c = color("sillon");
      r(131, 68, 22, 15, c); r(131, 68, 22, 1, aclarar(c, 0.3));
      r(129, 81, 26, 8, oscurecer(c, 0.1)); r(131, 80, 22, 2, aclarar(c, 0.15));
      r(127, 76, 5, 14, oscurecer(c, 0.2)); r(152, 76, 5, 14, oscurecer(c, 0.2));
      r(127, 76, 5, 1, c); r(152, 76, 5, 1, c);
      r(129, 90, 2, 4, "#4a3a2a"); r(153, 90, 2, 4, "#4a3a2a");
    }
  },
  cuadro: {
    caja: [57, 17, 19, 17],
    dibujar() {
      r(58, 18, 17, 15, "#6b4b32"); r(60, 20, 13, 11, "#9cc3e0");
      r(60, 26, 13, 5, "#6f9a5a"); r(62, 25, 5, 1, "#6f9a5a"); r(69, 22, 2, 2, "#f2d26b");
    }
  },
  planta: {
    caja: [144, 0, 14, 25],
    dibujar() {
      r(148, 0, 1, 12, "#a88a64"); r(154, 0, 1, 12, "#a88a64"); r(151, 0, 1, 12, "#a88a64");
      r(146, 12, 11, 1, "#a8502e"); r(147, 13, 9, 4, "#c4673e");
      const hojas = [[146, 16, 2, 4], [145, 19, 1, 5], [149, 17, 2, 7], [153, 16, 2, 3], [155, 17, 1, 6], [149, 10, 2, 2], [152, 9, 2, 3]];
      for (const [x, y, w, h] of hojas) r(x, y, w, h, "#4f8a4a");
      r(146, 17, 1, 1, "#6fae5f"); r(150, 19, 1, 1, "#6fae5f"); r(155, 19, 1, 1, "#6fae5f"); r(152, 10, 1, 1, "#6fae5f");
    }
  },
  gato: {
    caja: [0, 0, 11, 9],
    dibujar(t, enIcono) {
      const [x, y] = enIcono ? [1, 1] : tiene("sillon") ? [138, 72] : [86, 92];
      sprite([
        "o.....o",
        "oo...oo",
        "ooooooo",
        "oeoooeo",
        "ooonooo",
        ".ooooo.",
        ".owwwo.",
        "ooooooo"
      ], { o: "#d9822b", e: "#2a2320", n: "#e8908a", w: "#f5e6d3" }, x, y);
      const cola = Math.floor(t / 500) % 2;
      r(x + 7, y + 7, 1, 1, "#d9822b"); r(x + 8, y + 6, 1, 1, "#d9822b"); r(x + 8 + cola, y + 4 + cola, 1, 2, "#d9822b");
    }
  },

  // ---- Objetos especiales de los logros ----
  postal: {
    caja: [58, 38, 12, 10],
    dibujar() {
      r(59, 39, 11, 8, "#c9c9c9"); r(60, 40, 9, 6, "#ffffff");
      r(66, 41, 2, 2, "#c23b30"); r(61, 42, 4, 1, "#7a8aa8"); r(61, 44, 3, 1, "#7a8aa8");
    }
  },
  peluche: {
    caja: [0, 0, 9, 9],
    dibujar(t, enIcono) {
      const [x, y] = enIcono ? [1, 1] : tiene("cama") ? [30, 69] : [44, 98];
      sprite([
        "b.....b",
        "bbbbbbb",
        "bebbbeb",
        "bbbmbbb",
        ".bbbbb.",
        "bbbbbbb",
        ".b...b."
      ], { b: "#9a6a42", e: "#2a2320", m: "#e0b98f" }, x, y);
    }
  },
  banderin: {
    caja: [19, 12, 33, 10],
    dibujar() {
      const y = (x) => 13 + Math.round(2 * Math.sin(((x - 20) / 30) * Math.PI));
      for (let x = 20; x < 51; x++) r(x, y(x), 1, 1, "#555555");
      [21, 27, 33, 39, 45].forEach((x0, i) => {
        const c = i % 2 ? "#f7ecd8" : "#c23b30";
        const y0 = y(x0 + 2);
        r(x0, y0 + 1, 5, 1, c); r(x0 + 1, y0 + 2, 3, 1, c); r(x0 + 2, y0 + 3, 1, 1, c);
      });
    }
  },
  muro: {
    caja: [90, 65, 13, 31],
    dibujar() {
      r(92, 68, 9, 26, "#a9a59d"); r(91, 66, 11, 3, "#bdb9b1");
      r(93, 72, 3, 2, "#e04a8a"); r(96, 75, 4, 2, "#3fb0e0"); r(93, 80, 5, 1, "#f2d23b");
      r(95, 84, 3, 3, "#5ec46a"); r(97, 88, 3, 1, "#e05a3a"); r(91, 94, 11, 1, "#8a857c");
    }
  },
  poster: {
    caja: [3, 13, 15, 22],
    dibujar() {
      r(4, 14, 13, 20, "#1f2433");
      r(7, 22, 6, 5, "#e2b53e"); r(12, 20, 3, 3, "#e2b53e"); r(13, 19, 1, 1, "#e2b53e");
      r(7, 27, 1, 2, "#e2b53e"); r(11, 27, 1, 2, "#e2b53e");
      r(6, 30, 9, 1, "#e2b53e"); r(7, 32, 7, 1, "#8a8f9e");
    }
  },
  mapa: {
    caja: [75, 21, 15, 17],
    dibujar() {
      r(76, 22, 13, 15, "#efe6cf");
      r(79, 22, 1, 15, "#d6c9a8"); r(85, 22, 1, 15, "#d6c9a8"); r(76, 26, 13, 1, "#d6c9a8"); r(76, 33, 13, 1, "#d6c9a8");
      const rio = [[77, 30], [78, 29], [79, 29], [80, 30], [81, 31], [82, 31], [83, 30], [84, 29], [85, 29], [86, 30], [87, 31]];
      for (const [x, y] of rio) r(x, y, 1, 1, "#6a8fc0");
      r(82, 27, 2, 2, "#c23b30");
    }
  },
  bola: {
    caja: [74, 0, 17, 15],
    dibujar(t) {
      r(82, 0, 1, 4, "#888888");
      r(80, 4, 5, 1, "#b8bcc6"); r(79, 5, 7, 5, "#b8bcc6"); r(80, 10, 5, 1, "#b8bcc6");
      for (let i = 0; i < 7; i++) for (let j = 1; j < 6; j++) if ((i + j) % 2) r(79 + i, 4 + j, 1, 1, "#e6e9ef");
      const s = Math.floor(t / 300);
      const destellos = ["#ffffff", "#fff6b0", "#ff9ad8", "#8ad1ff"];
      for (let k = 0; k < 4; k++) {
        const x = 74 + ((s * 7 + k * 13) % 17), y = 2 + ((s * 5 + k * 3) % 12);
        r(x, y, 1, 1, destellos[k]);
      }
    }
  },
  moka: {
    caja: [122, 38, 10, 13],
    dibujar(t) {
      r(125, 45, 5, 5, "#9aa0a8"); r(126, 43, 3, 2, "#9aa0a8"); r(127, 42, 1, 1, "#2b2b2b");
      r(130, 46, 1, 3, "#2b2b2b"); r(124, 44, 1, 1, "#9aa0a8");
      const f = Math.floor(t / 400) % 2;
      r(123 + f, 41, 1, 1, "#ffffff"); r(124 - f, 39, 1, 1, "#ffffff");
    }
  },
  estrella: {
    caja: [110, 12, 13, 14],
    dibujar() {
      r(116, 13, 1, 4, "#888888");
      const c = "#fff3c4";
      r(115, 18, 3, 5, c); r(113, 19, 7, 3, c);
      r(116, 16, 1, 2, c); r(116, 23, 1, 2, c); r(111, 20, 2, 1, c); r(120, 20, 2, 1, c);
      r(114, 17, 1, 1, c); r(118, 17, 1, 1, c); r(114, 23, 1, 1, c); r(118, 23, 1, 1, c);
      r(116, 20, 1, 1, "#ffd36b");
    }
  },
  ampelmann: {
    caja: [107, 38, 8, 13],
    dibujar() {
      r(108, 39, 6, 11, "#2b2b2b");
      r(109, 40, 4, 4, "#5a1f1f"); r(109, 45, 4, 4, "#1f3a22");
      for (const [x, y] of [[111, 45], [110, 46], [111, 46], [112, 46], [111, 47], [110, 48], [112, 48]]) r(x, y, 1, 1, "#7cf08a");
    }
  },
  arbol: {
    caja: [62, 49, 24, 48],
    dibujar(t) {
      r(71, 90, 6, 6, "#a8502e"); r(73, 87, 2, 3, "#6b4b32");
      for (let k = 0; k < 3; k++) {
        for (let j = 0; j < 11; j++) {
          const w = Math.round(4 + 4 * k + (j / 10) * (8 + 2 * k));
          r(74 - Math.floor(w / 2), 54 + k * 11 + j, w, 1, j === 10 ? "#24563a" : "#2f6b3f");
        }
      }
      r(73, 51, 3, 3, "#ffd36b");
      const luces = [[72, 60], [76, 63], [70, 70], [77, 72], [73, 67], [68, 80], [74, 78], [79, 83], [71, 84], [66, 85]];
      const colores = ["#ffd36b", "#ff6b6b", "#8ad1ff", "#ffffff"];
      luces.forEach(([x, y], i) => {
        if ((i + Math.floor(t / 500)) % 3) r(x, y, 1, 1, colores[i % 4]);
      });
    }
  }
};

// Orden de dibujo: primero lo que está en la pared, luego el suelo de atrás hacia delante.
const ORDEN = ["guirnalda", "poster", "banderin", "estanteria", "cuadro", "mapa", "postal", "radiador", "cortinas",
  "estrella", "bola", "planta", "velas", "moka", "ampelmann", "alfombra", "lampara", "cama", "peluche", "arbol", "muro", "sillon", "mesita", "gato"];

// ---------- Avatar ----------
const CARA = [
  ".ssessess.",
  ".srssssrs.",
  "..ssmmss..",
  "...ssss..."
];
const CABEZAS = {
  "Media melena": [
    "...hhhh...",
    "..hhhhhh..",
    ".hhhhhhhh.",
    ".hssssssh.",
    ...CARA
  ],
  "Largo": [
    "...hhhh...",
    "..hhhhhh..",
    ".hhhhhhhh.",
    "hhsssssshh",
    "hssessessh",
    "hsrssssrsh",
    "hhssmmsshh",
    "hh.ssss.hh"
  ],
  "Corto": [
    "..........",
    "..hhhhhh..",
    ".hhhhhhhh.",
    ".hssssssh.",
    ...CARA
  ],
  "Rapado": [
    "..........",
    "..........",
    "..hhhhhh..",
    ".shhhhhhs.",
    ...CARA
  ],
  "Con barba": [
    "..........",
    "..hhhhhh..",
    ".hhhhhhhh.",
    ".hssssssh.",
    ".ssessess.",
    ".hssssssh.",
    "..hhmmhh..",
    "...hhhh..."
  ]
};
CABEZAS["Moño"] = ["....hh....", "...hhhh...", ...CABEZAS["Media melena"]];

const CUERPOS = {
  Femenina: [
    "..jjjjjj..",
    ".jjjjjjjj.",
    ".jkkkkkkj.",
    ".jjjjjjjj.",
    ".sjjjjjjs.",
    "..pppppp..",
    "..pppppp.."
  ],
  Masculina: [
    ".jjjjjjjj.",
    "jjjjjjjjjj",
    "jjkkkkkkjj",
    "jjjjjjjjjj",
    "sjjjjjjjjs",
    "..pppppp..",
    "..pppppp.."
  ]
};
const PIERNAS = [
  ["..pp..pp..", "..pp..pp..", ".bbb..bbb."],
  ["...pppp...", "...pppp...", "..bbbbbb.."]
];

const esteticaDe = (a = estado.avatar) => AVATAR.estetica[a.estetica ?? 0];
const peinadoDe = (a = estado.avatar) => AVATAR.peinados[esteticaDe(a)][a.peinado ?? 0];
const nombreDe = (a = estado.avatar) => (a.nombre || "").trim();

function mapaAvatar(a, paso, parpadeo) {
  const estetica = esteticaDe(a);
  const peinado = peinadoDe(a);
  let cabeza = CABEZAS[peinado];
  if (parpadeo) cabeza = cabeza.map((f) => f.replace(/e/g, "s"));
  if (estetica === "Masculina") cabeza = cabeza.map((f) => f.replace(/r/g, "s")); // sin colorete
  const cuerpo = [...CUERPOS[estetica]];
  if (peinado === "Largo") cuerpo[0] = "hjjjjjjjjh";
  return [...cabeza, ...cuerpo, ...PIERNAS[paso]];
}

function paletaAvatar(a = estado.avatar) {
  const jersey = AVATAR.jersey[a.jersey];
  return {
    s: AVATAR.piel[a.piel], h: AVATAR.pelo[a.pelo], e: "#2a2320", r: "#e89a8a", m: "#9b4a3f",
    j: jersey, k: aclarar(jersey, 0.35), p: "#3b3f4a", b: "#5a3a2a"
  };
}

const avatar = { x: 74, destino: 74, pausa: 0, paso: 0, parpadeo: 0 };
const PIES = 106;

function moverAvatar() {
  if (avatar.pausa > 0) {
    avatar.pausa--;
  } else if (Math.abs(avatar.x - avatar.destino) < 0.6) {
    avatar.x = avatar.destino;
    avatar.pausa = 25 + Math.floor(Math.random() * 60);
    avatar.destino = 52 + Math.floor(Math.random() * 46);
  } else {
    avatar.x += Math.sign(avatar.destino - avatar.x) * 0.5;
  }
  const andando = avatar.pausa === 0 && avatar.x !== avatar.destino;
  avatar.paso = andando ? (avatar.paso + 0.25) % 2 : 0;
  if (avatar.parpadeo > 0) avatar.parpadeo--;
  else if (Math.random() < 0.02) avatar.parpadeo = 2;
}

function dibujarAvatar() {
  const mapa = mapaAvatar(estado.avatar, Math.floor(avatar.paso), avatar.parpadeo > 0);
  const tiritando = !tiene("radiador") && nivelCozy() < 35;
  const dx = tiritando && Math.random() < 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
  const rebote = avatar.paso >= 1 ? -1 : 0;
  sprite(mapa, paletaAvatar(), Math.round(avatar.x) + dx, PIES - mapa.length + rebote);
}

// ---------- El cuarto completo ----------
function dibujarCuarto(t) {
  ctx = pantalla;
  ctx.clearRect(0, 0, W, H);

  // Pared y suelo.
  const pared = tiene("pintura") ? color("pared") : "#eeeeea";
  r(0, 0, W, 76, pared);
  r(0, 0, W, 2, oscurecer(pared, 0.06));
  r(0, 76, W, 2, "#ffffff");
  r(0, 78, W, 34, "#cfc6ba");
  r(0, 78, W, 1, "#b9b0a3");
  for (let y = 83, fila = 0; y < H; y += 5, fila++) {
    r(0, y, W, 1, "#c2b8aa");
    for (let x = (fila % 2) * 14; x < W; x += 28) r(x, y - 4, 1, 4, "#c2b8aa");
  }

  // Ventana con nieve y la Torre de Televisión a lo lejos.
  r(94, 10, 44, 42, "#ffffff");
  r(97, 13, 38, 36, "#4a5f8f");
  r(97, 38, 6, 6, "#3a4b75"); r(104, 36, 8, 8, "#3a4b75"); r(121, 39, 14, 5, "#3a4b75");
  r(127, 17, 1, 27, "#2c3a5c"); r(126, 22, 3, 3, "#2c3a5c"); r(127, 15, 1, 2, "#2c3a5c");
  r(97, 44, 38, 5, "#e9eef6");
  for (const c of copos) {
    c.y += c.v;
    if (c.y > 48) { c.y = 13; c.x = 97 + Math.random() * 38; }
    const x = c.x + Math.sin((t / 900) + c.y) * 0.8;
    if (x >= 97 && x < 135) r(x, c.y, 1, 1, "#ffffff");
  }
  r(115, 13, 2, 36, "#ffffff"); r(97, 30, 38, 2, "#ffffff");
  r(92, 50, 48, 3, "#ffffff"); r(92, 53, 48, 1, "#d9d6cf");

  // Bombilla desnuda del techo.
  r(58, 0, 1, 10, "#777777"); r(56, 10, 5, 4, "#ffffff"); r(56, 14, 5, 1, "#c9c9c9");

  // Objetos, en orden.
  for (const id of ORDEN) if (tiene(id)) OBJETOS[id].dibujar(t, false);

  // El álbum de fotos, siempre en el suelo.
  r(28, 100, 12, 5, "#8a2f3a"); r(29, 99, 10, 1, "#f6efe0"); r(28, 100, 1, 5, "#5e1f28"); r(33, 102, 3, 1, "#e2b53e");
  if (Math.floor(t / 700) % 3 === 0) { r(41, 97, 1, 1, "#ffd36b"); r(42, 96, 1, 1, "#ffd36b"); }

  dibujarAvatar();

  // Luz: blanca y fría al principio, cálida cuanto más luces haya.
  const luces = ["lampara", "guirnalda", "velas", "arbol", "estrella"].filter(tiene).length;
  if (!luces) {
    r(0, 0, W, H, "rgba(200, 225, 255, 0.12)");
  } else {
    r(0, 0, W, H, `rgba(255, 160, 70, ${0.03 + 0.025 * luces})`);
    if (tiene("lampara")) brillo(8, 46, 55, "rgba(255, 200, 120, 0.3)");
    if (tiene("velas")) brillo(102, 44, 14, "rgba(255, 190, 100, 0.35)");
    if (tiene("arbol")) brillo(74, 72, 26, "rgba(255, 210, 120, 0.18)");
  }
}

// ---------- Bucle de animación (a ritmo de pixel art, ~12 fotogramas por segundo) ----------
let ultimo = 0;
function bucle(t) {
  if (t - ultimo > 80) {
    ultimo = t;
    moverAvatar();
    dibujarCuarto(t);
  }
  requestAnimationFrame(bucle);
}

// ---------- Iconos de la tienda y los logros ----------
const fondoIconos = document.createElement("canvas");
fondoIconos.width = W;
fondoIconos.height = H;

function icono(id, bloqueado = false) {
  const [x, y, w, h] = OBJETOS[id].caja;
  const off = fondoIconos.getContext("2d");
  off.clearRect(0, 0, W, H);
  ctx = off;
  OBJETOS[id].dibujar(0, true);
  ctx = pantalla;

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  g.drawImage(fondoIconos, x, y, w, h, 0, 0, w, h);
  if (bloqueado) {
    g.globalCompositeOperation = "source-in";
    g.fillStyle = "#c9c5bb";
    g.fillRect(0, 0, w, h);
  }
  const escala = Math.min(52 / w, 52 / h);
  c.style.width = `${w * escala}px`;
  c.style.height = `${h * escala}px`;
  c.className = "pixel";
  return c;
}

// ---------- Interfaz: monedas, nivel, tienda y logros ----------
const $ = (id) => document.getElementById(id);

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
}

// ---------- Avisos ----------
function avisar({ titulo, texto, logro }) {
  const caja = document.createElement("div");
  caja.className = "aviso" + (logro ? " aviso-logro" : "");
  caja.setAttribute("role", "status");
  caja.innerHTML = `<b>${titulo}</b><span>${texto}</span>`;
  $("avisos").appendChild(caja);
  setTimeout(() => caja.classList.add("saliendo"), 4500);
  setTimeout(() => caja.remove(), 5000);
}

// ---------- Clics en el cuarto: el avatar habla, el libro abre el álbum ----------
let bocadilloHasta = 0;

lienzo.addEventListener("click", (e) => {
  const caja = lienzo.getBoundingClientRect();
  const x = ((e.clientX - caja.left) / caja.width) * W;
  const y = ((e.clientY - caja.top) / caja.height) * H;

  if (x >= 26 && x <= 43 && y >= 95 && y <= 107) {
    abrirAlbum();
    return;
  }
  if (x >= avatar.x - 2 && x <= avatar.x + 12 && y >= PIES - 22 && y <= PIES + 1) {
    hablar();
  }
});

function hablar() {
  const pct = nivelCozy();
  const frases = FRASES[pct < 35 ? 0 : pct < 75 ? 1 : 2];
  const b = $("bocadillo");
  const frase = frases[Math.floor(Math.random() * frases.length)];
  const nombre = nombreDe();
  b.textContent = "";
  if (nombre) {
    const quien = document.createElement("b");
    quien.textContent = nombre;
    b.append(quien, document.createElement("br"));
  }
  b.append(frase);
  b.style.left = ((avatar.x + 5) / W) * 100 + "%";
  b.style.top = ((PIES - 22) / H) * 100 + "%";
  b.hidden = false;
  avatar.pausa = 40;
  avatar.destino = avatar.x;
  bocadilloHasta = Date.now() + 3500;
  setTimeout(() => { if (Date.now() >= bocadilloHasta) b.hidden = true; }, 3600);
}

// ---------- Editor del avatar ----------
function pintarEditor() {
  const opciones = $("editor-opciones");
  opciones.innerHTML = "";
  const grupos = [["estetica", "Estética"], ["piel", "Piel"], ["pelo", "Pelo"], ["peinado", "Peinado"], ["jersey", "Jersey"]];
  for (const [clave, titulo] of grupos) {
    const valores = clave === "peinado" ? AVATAR.peinados[esteticaDe()] : AVATAR[clave];
    const fila = document.createElement("div");
    fila.className = "editor-fila";
    fila.innerHTML = `<span class="antetitulo">${titulo}</span>`;
    const botones = document.createElement("div");
    botones.className = "muestras";
    valores.forEach((valor, i) => {
      const b = document.createElement("button");
      const elegido = (estado.avatar[clave] ?? 0) === i;
      b.setAttribute("aria-pressed", elegido);
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
      };
      botones.appendChild(b);
    });
    fila.appendChild(botones);
    opciones.appendChild(fila);
  }

  // Vista previa grande.
  const vista = $("editor-vista");
  const g = vista.getContext("2d");
  g.clearRect(0, 0, vista.width, vista.height);
  ctx = g;
  const mapa = mapaAvatar(estado.avatar, 0, false);
  sprite(mapa, paletaAvatar(), 2, vista.height - mapa.length - 1);
  ctx = pantalla;
}

$("editor-nombre").oninput = (e) => {
  estado.avatar.nombre = e.target.value;
  guardar();
  pintarNombre();
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

// ---------- Modo prueba ----------
$("modo-prueba-cozy").onclick = () => {
  estado.monedas += 50;
  guardar();
  pintarTodo();
  avisar({ titulo: "+50 monedas de prueba", texto: "Para probar la tienda sin salir de casa." });
};

// ---------- Arranque ----------
const avisosIniciales = cobrarYDesbloquear();
pintarTodo();
requestAnimationFrame(bucle);
avisosIniciales.forEach((a, i) => setTimeout(() => avisar(a), 400 + i * 700));
