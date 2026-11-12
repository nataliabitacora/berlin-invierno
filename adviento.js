// ================= Calendario de adviento =================
// Cada día del 1 al 24 de diciembre se abre una puerta con una misión.
// Al cumplirla se cuelga un adorno en el árbol. Con los 24, se enciende la estrella.

const MISIONES = [
  { dia: 1,  dibujo: "taza",    titulo: "Primer Glühwein", reto: "Pide un vino caliente en cualquier mercado navideño y quédate con la taza de recuerdo (se paga un depósito)." },
  { dia: 2,  dibujo: "torre",   titulo: "Caza la torre", reto: "Encuentra la Torre de Televisión desde tres barrios distintos y hazle una foto desde cada uno." },
  { dia: 3,  dibujo: "pretzel", titulo: "Desayuno berlinés", reto: "Desayuna una Brezel recién hecha en una panadería de barrio." },
  { dia: 4,  dibujo: "puerta",  titulo: "La Puerta al anochecer", reto: "Cruza la Puerta de Brandeburgo cuando ya esté iluminada (en diciembre anochece hacia las 16:00)." },
  { dia: 5,  dibujo: "tranvia", titulo: "Vuelta en tranvía", reto: "Recorre una línea de tranvía de principio a fin mirando por la ventana. La M10 cruza medio Berlín." },
  { dia: 6,  dibujo: "oso",     titulo: "Safari de osos", reto: "Encuentra cinco esculturas de osos de Berlín (Buddy Bären) repartidas por la ciudad." },
  { dia: 7,  dibujo: "arbol",   titulo: "El árbol más grande", reto: "Busca el árbol de Navidad más alto que puedas en una plaza y compáralo con el de tu casa." },
  { dia: 8,  dibujo: "copo",    titulo: "Paseo por el Tiergarten", reto: "Atraviesa el Tiergarten a pie hasta la Columna de la Victoria." },
  { dia: 9,  dibujo: "taza",    titulo: "Al estilo nórdico", reto: "Prueba el Glögg en el mercado escandinavo de la Kulturbrauerei." },
  { dia: 10, dibujo: "puerta",  titulo: "Saluda a Nefertiti", reto: "Visita la Isla de los Museos y busca el busto de Nefertiti en el Neues Museum." },
  { dia: 11, dibujo: "pretzel", titulo: "Tortitas de patata", reto: "Come Kartoffelpuffer con compota de manzana en un puesto de mercado." },
  { dia: 12, dibujo: "muneco",  titulo: "Muñeco de nieve", reto: "Construye un muñeco de nieve en un parque. Si no ha nevado, dibújalo en una servilleta." },
  { dia: 13, dibujo: "puerta",  titulo: "Bajo la cúpula", reto: "Sube a la cúpula de cristal del Reichstag. Es gratis, pero hay que reservar online." },
  { dia: 14, dibujo: "copo",    titulo: "Cima helada", reto: "Sube al Teufelsberg y mira la ciudad desde la antigua estación de escucha." },
  { dia: 15, dibujo: "tranvia", titulo: "El autobús turístico", reto: "Haz el recorrido del autobús 100 entre Zoologischer Garten y Alexanderplatz." },
  { dia: 16, dibujo: "arbol",   titulo: "Adorno artesano", reto: "Compra un adorno hecho a mano en un mercado para colgarlo en tu árbol de verdad." },
  { dia: 17, dibujo: "oso",     titulo: "Muro de colores", reto: "Recorre la East Side Gallery entera y elige tu mural favorito." },
  { dia: 18, dibujo: "taza",    titulo: "Entrar en calor", reto: "Pasa una tarde en una sauna o en el baño termal Liquidrom." },
  { dia: 19, dibujo: "muneco",  titulo: "Sobre hielo", reto: "Patina en una pista al aire libre, aunque sea agarrándote a la barandilla." },
  { dia: 20, dibujo: "pretzel", titulo: "Cena en el mercado", reto: "Cena en la Markthalle Neun, un mercado cubierto de 1891 en Kreuzberg." },
  { dia: 21, dibujo: "copo",    titulo: "El día más corto", reto: "Es el solsticio de invierno: mira la puesta de sol, la más temprana del año." },
  { dia: 22, dibujo: "torre",   titulo: "Luces sobre el Spree", reto: "Cruza el puente Oberbaumbrücke de noche y mira la ciudad iluminada." },
  { dia: 23, dibujo: "arbol",   titulo: "Postal desde Berlín", reto: "Escribe una postal a alguien que quieras y échala al buzón." },
  { dia: 24, dibujo: "oso",     titulo: "Nochebuena", reto: "Brinda por todo lo que has descubierto este mes. ¡Feliz Navidad desde Berlín!" }
];

// Orden desordenado de las puertas, como en los calendarios de verdad.
const ORDEN_PUERTAS = [7, 18, 3, 22, 11, 1, 15, 9, 24, 5, 20, 13, 2, 17, 10, 23, 6, 14, 19, 4, 12, 21, 8, 16];

// Posición de cada adorno (día 1 arriba, día 24 abajo) dentro del árbol.
const POSICIONES_ADORNOS = [
  [150, 60], [138, 84], [162, 84], [118, 100], [182, 100],
  [150, 124], [120, 132], [180, 132], [106, 160], [136, 154], [166, 158], [196, 162],
  [120, 202], [180, 202], [90, 208], [150, 212], [210, 208],
  [72, 248], [102, 240], [132, 252], [162, 242], [192, 252], [224, 242], [56, 266]
];

// ---------- Estado guardado en el navegador ----------
function leer(clave, porDefecto) {
  try {
    const valor = JSON.parse(localStorage.getItem(clave));
    return valor ?? porDefecto;
  } catch {
    return porDefecto;
  }
}
function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento: el juego funciona, pero no recuerda el progreso.
  }
}

let cumplidas = leer("berlin-adviento-cumplidas", []);
let abiertas = leer("berlin-adviento-abiertas", []);
let modoPrueba = leer("berlin-adviento-prueba", false);

// Una puerta se puede abrir si estamos en diciembre y ya ha llegado su día
// (o si el modo prueba está activado).
function disponible(dia) {
  if (modoPrueba) return true;
  const hoy = new Date();
  return hoy.getMonth() === 11 && hoy.getDate() >= dia;
}

const mision = (dia) => MISIONES.find((m) => m.dia === dia);

// ---------- Puertas ----------
function pintarPuertas() {
  const contenedor = document.getElementById("puertas");
  contenedor.innerHTML = "";

  for (const dia of ORDEN_PUERTAS) {
    const m = mision(dia);
    const boton = document.createElement("button");
    boton.className = "puerta";

    if (!disponible(dia)) {
      boton.classList.add("cerrada");
      boton.innerHTML = `<span class="puerta-numero">${dia}</span>`;
      boton.setAttribute("aria-label", `Día ${dia}: se abre el ${dia} de diciembre`);
      boton.title = `Se abre el ${dia} de diciembre`;
    } else if (!abiertas.includes(dia)) {
      boton.classList.add("disponible");
      boton.innerHTML = `<span class="puerta-numero">${dia}</span>`;
      boton.setAttribute("aria-label", `Abrir la puerta del día ${dia}`);
    } else {
      if (cumplidas.includes(dia)) boton.classList.add("cumplida");
      boton.innerHTML = `<span class="puerta-dia">${dia}</span>${dibujo(m.dibujo)}`;
      boton.setAttribute("aria-label", `Día ${dia}: ${m.titulo}${cumplidas.includes(dia) ? " (cumplida)" : ""}`);
      boton.title = m.titulo;
    }

    boton.onclick = () => {
      if (!disponible(dia)) return;
      if (!abiertas.includes(dia)) {
        abiertas.push(dia);
        escribir("berlin-adviento-abiertas", abiertas);
        pintarPuertas();
      }
      abrirDialogo(dia);
    };
    contenedor.appendChild(boton);
  }
}

// ---------- Diálogo con la misión ----------
const dialogo = document.getElementById("dialogo");

function abrirDialogo(dia) {
  const m = mision(dia);
  const hecha = cumplidas.includes(dia);

  document.getElementById("dialogo-contenido").innerHTML = `
    <div class="franja-mural" aria-hidden="true"></div>
    <div class="dialogo-cuerpo">
      ${dibujo(m.dibujo)}
      <p class="antetitulo">${dia} de diciembre</p>
      <h3 id="dialogo-titulo">${m.titulo}</h3>
      <p>${m.reto}</p>
      <div class="dialogo-acciones">
        <button class="pastilla pastilla-negra pastilla-pequena" id="dialogo-cumplir">
          ${hecha ? "Quitar el adorno" : "¡Misión cumplida!"}
        </button>
        <button class="pastilla pastilla-borde pastilla-pequena" id="dialogo-cerrar">Cerrar</button>
      </div>
    </div>
  `;

  document.getElementById("dialogo-cumplir").onclick = () => {
    cumplidas = hecha ? cumplidas.filter((d) => d !== dia) : [...cumplidas, dia];
    escribir("berlin-adviento-cumplidas", cumplidas);
    dialogo.close();
    pintarAdviento(hecha ? null : dia);
  };
  document.getElementById("dialogo-cerrar").onclick = () => dialogo.close();

  dialogo.showModal();
}

// Cerrar al pulsar fuera del diálogo.
dialogo.addEventListener("click", (e) => {
  if (e.target === dialogo) dialogo.close();
});

// ---------- Árbol ----------
function pintarArbol(nuevo = null) {
  const completo = cumplidas.length === MISIONES.length;

  const adornos = POSICIONES_ADORNOS.map(([x, y], i) => {
    const dia = i + 1;
    if (!cumplidas.includes(dia)) {
      return `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="#b9b5ab" stroke-width="2" stroke-dasharray="3 3"/>`;
    }
    const animar = dia === nuevo
      ? `<animateTransform attributeName="transform" type="scale" values="0;1.3;1" dur=".5s" additive="sum"/>`
      : "";
    return `
      <g class="adorno" transform="translate(${x} ${y})">
        <title>Día ${dia}: ${mision(dia).titulo}</title>
        <g>${animar}
          <line x1="0" y1="-14" x2="0" y2="-10" stroke="#111" stroke-width="2"/>
          <circle r="11" fill="#111" stroke="#fff" stroke-width="2"/>
          <text y="4" text-anchor="middle" font-family="DM Mono, monospace" font-size="10" fill="#fff">${dia}</text>
        </g>
      </g>`;
  }).join("");

  document.getElementById("arbol").innerHTML = `
    <svg class="arbol-svg" viewBox="0 0 300 340" role="img"
         aria-label="Árbol de Navidad con ${cumplidas.length} de 24 adornos">
      <g stroke="#111" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <rect x="132" y="275" width="36" height="34" fill="#111"/>
        <path d="M110 309 H190 L182 330 H118 Z" fill="#fff"/>
        <path d="M150 34 L205 105 H180 L240 185 H205 L270 275 H30 L95 185 H60 L120 105 H95 Z" fill="#fff"/>
        <g fill="none" stroke-dasharray="2 7" stroke-width="3">
          <path d="M112 98 Q150 116 188 98"/>
          <path d="M84 178 Q150 200 216 178"/>
          <path d="M50 262 Q150 290 250 262"/>
        </g>
        <polygon points="150,6 157,22 174,22 160,32 165,48 150,38 135,48 140,32 126,22 143,22"
                 fill="${completo ? "#111" : "#fff"}"/>
      </g>
      ${adornos}
    </svg>`;

  document.getElementById("cuenta-adornos").textContent = `${cumplidas.length}/24`;

  const mensaje = document.getElementById("arbol-mensaje");
  if (completo) mensaje.textContent = "¡Árbol completo! La estrella está encendida. Feliz Navidad desde Berlín.";
  else if (cumplidas.length === 0) mensaje.textContent = "Abre una puerta y cumple su misión para colgar el primer adorno.";
  else mensaje.textContent = `Te faltan ${24 - cumplidas.length} adornos para encender la estrella.`;
}

// ---------- Modo prueba ----------
const casillaPrueba = document.getElementById("modo-prueba");
casillaPrueba.checked = modoPrueba;
casillaPrueba.onchange = () => {
  modoPrueba = casillaPrueba.checked;
  escribir("berlin-adviento-prueba", modoPrueba);
  pintarPuertas();
};

function pintarAdviento(nuevo = null) {
  pintarPuertas();
  pintarArbol(nuevo);
}

pintarAdviento();
