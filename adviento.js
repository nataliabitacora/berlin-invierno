// ================= Calendario de adviento =================
// Cada día del 1 al 24 de diciembre se abre una puerta con una misión.
// Al cumplirla se cuelga un adorno en el árbol. Con los 24, se enciende la estrella.

const MISIONES = [
  { dia: 1,  dibujo: "taza",    titulo: "First Glühwein", reto: "Order a mulled wine at any Christmas market and keep the souvenir mug (you pay a small deposit for it)." },
  { dia: 2,  dibujo: "torre",   titulo: "Tower hunt", reto: "Spot the TV Tower from three different neighbourhoods and take a photo from each one." },
  { dia: 3,  dibujo: "pretzel", titulo: "Berlin breakfast", reto: "Have a freshly baked Brezel for breakfast at a local bakery." },
  { dia: 4,  dibujo: "puerta",  titulo: "The Gate at dusk", reto: "Walk through the Brandenburg Gate once it's lit up (in December it gets dark around 4 pm)." },
  { dia: 5,  dibujo: "tranvia", titulo: "Tram ride", reto: "Ride a tram line from end to end, looking out of the window. The M10 crosses half of Berlin, from Moabit (Turmstraße) to Friedrichshain (Warschauer Straße)." },
  { dia: 6,  dibujo: "oso",     titulo: "Bear safari", reto: "Find five Berlin bear sculptures (Buddy Bears) scattered around the city." },
  { dia: 7,  dibujo: "arbol",   titulo: "The biggest tree", reto: "Find the tallest Christmas tree you can in a city square and compare it with the one at home." },
  { dia: 8,  dibujo: "copo",    titulo: "Tiergarten walk", reto: "Cross the Tiergarten on foot all the way to the Victory Column." },
  { dia: 9,  dibujo: "taza",    titulo: "Nordic style", reto: "Try Glögg at the Scandinavian market in the Kulturbrauerei (open until 22 December)." },
  { dia: 10, dibujo: "puerta",  titulo: "Say hi to Nefertiti", reto: "Visit Museum Island and find the bust of Nefertiti in the Neues Museum." },
  { dia: 11, dibujo: "pretzel", titulo: "Potato pancakes", reto: "Eat Kartoffelpuffer with apple sauce at a market stall." },
  { dia: 12, dibujo: "muneco",  titulo: "Snowman", reto: "Build a snowman in a park. If it hasn't snowed, draw one on a napkin." },
  { dia: 13, dibujo: "puerta",  titulo: "Under the dome", reto: "Go up to the Reichstag's glass dome. It's free, but you need to book online." },
  { dia: 14, dibujo: "copo",    titulo: "Frozen summit", reto: "Climb Teufelsberg and look out over the city from the old listening station." },
  { dia: 15, dibujo: "tranvia", titulo: "The sightseeing bus", reto: "Ride bus 100 between Zoologischer Garten and Alexanderplatz." },
  { dia: 16, dibujo: "arbol",   titulo: "Handmade ornament", reto: "Buy a handmade ornament at a market to hang on your real tree." },
  { dia: 17, dibujo: "oso",     titulo: "Wall of colour", reto: "Walk the whole East Side Gallery and pick your favourite mural." },
  { dia: 18, dibujo: "taza",    titulo: "Warm up", reto: "Spend an afternoon in a sauna or at the Liquidrom thermal baths." },
  { dia: 19, dibujo: "muneco",  titulo: "On ice", reto: "Skate on an open-air rink, even if you spend the whole time clinging to the railing." },
  { dia: 20, dibujo: "pretzel", titulo: "Dinner at the market", reto: "Have dinner at Markthalle Neun, an 1891 covered market in Kreuzberg." },
  { dia: 21, dibujo: "copo",    titulo: "The shortest day", reto: "It's the winter solstice: watch the sunset, the earliest of the year." },
  { dia: 22, dibujo: "torre",   titulo: "Lights over the Spree", reto: "Cross the Oberbaumbrücke at night and take in the city lights." },
  { dia: 23, dibujo: "arbol",   titulo: "Postcard from Berlin", reto: "Write a postcard to someone you love and drop it in a postbox." },
  { dia: 24, dibujo: "oso",     titulo: "Christmas Eve", reto: "Raise a glass to everything you've discovered this month. Merry Christmas from Berlin!" }
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

// Una puerta se puede abrir si estamos en diciembre y ya ha llegado su día.
// En enero y febrero siguen todas abiertas, para poder completar el árbol tarde.
function disponible(dia, hoy = new Date()) {
  const mes = hoy.getMonth();
  if (mes === 0 || mes === 1) return true;
  return mes === 11 && hoy.getDate() >= dia;
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
      boton.setAttribute("aria-label", `Day ${dia}: opens on ${dia} December`);
      boton.title = `Opens on ${dia} December`;
    } else if (!abiertas.includes(dia)) {
      boton.classList.add("disponible");
      boton.innerHTML = `<span class="puerta-numero">${dia}</span>`;
      boton.setAttribute("aria-label", `Open the door for day ${dia}`);
    } else {
      if (cumplidas.includes(dia)) boton.classList.add("cumplida");
      boton.innerHTML = `<span class="puerta-dia">${dia}</span>${dibujo(m.dibujo)}`;
      boton.setAttribute("aria-label", `Day ${dia}: ${m.titulo}${cumplidas.includes(dia) ? " (done)" : ""}`);
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
      <p class="antetitulo">${dia} December</p>
      <h3 id="dialogo-titulo">${m.titulo}</h3>
      <p>${m.reto}</p>
      <div class="dialogo-acciones">
        <button class="pastilla pastilla-negra pastilla-pequena" id="dialogo-cumplir">
          ${hecha ? "Take the ornament down" : "Mission accomplished!"}
        </button>
        <button class="pastilla pastilla-borde pastilla-pequena" id="dialogo-cerrar">Close</button>
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
      return `<circle cx="${x}" cy="${y}" r="7" fill="#fffaee" stroke="#c9b98f" stroke-width="2" stroke-dasharray="3 3"/>`;
    }
    const animar = dia === nuevo
      ? `<animateTransform attributeName="transform" type="scale" values="0;1.3;1" dur=".5s" additive="sum"/>`
      : "";
    return `
      <g class="adorno" transform="translate(${x} ${y})">
        <title>Day ${dia}: ${mision(dia).titulo}</title>
        <g>${animar}
          <line x1="0" y1="-14" x2="0" y2="-10" stroke="#1b1726" stroke-width="2"/>
          <circle r="11" fill="#1b1726" stroke="#fffaee" stroke-width="2"/>
          <text y="4" text-anchor="middle" font-family="DM Mono, monospace" font-size="10" fill="#fffaee">${dia}</text>
        </g>
      </g>`;
  }).join("");

  document.getElementById("arbol").innerHTML = `
    <svg class="arbol-svg" viewBox="0 0 300 340" role="img"
         aria-label="Christmas tree with ${cumplidas.length} of 24 ornaments">
      <g stroke="#1b1726" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <rect x="132" y="275" width="36" height="34" fill="#1b1726"/>
        <path d="M110 309 H190 L182 330 H118 Z" fill="#fffaee"/>
        <path d="M150 34 L205 105 H180 L240 185 H205 L270 275 H30 L95 185 H60 L120 105 H95 Z" fill="#fffaee"/>
        <g fill="none" stroke-dasharray="2 7" stroke-width="3">
          <path d="M112 98 Q150 116 188 98"/>
          <path d="M84 178 Q150 200 216 178"/>
          <path d="M50 262 Q150 290 250 262"/>
        </g>
        <polygon points="150,6 157,22 174,22 160,32 165,48 150,38 135,48 140,32 126,22 143,22"
                 fill="${completo ? "#1b1726" : "#fffaee"}"/>
      </g>
      ${adornos}
    </svg>`;

  document.getElementById("cuenta-adornos").textContent = `${cumplidas.length}/24`;

  const mensaje = document.getElementById("arbol-mensaje");
  if (completo) mensaje.textContent = "Tree complete! The star is lit. Merry Christmas from Berlin.";
  else if (cumplidas.length === 0) mensaje.textContent = "Open a door and complete its mission to hang your first ornament.";
  else mensaje.textContent = `${24 - cumplidas.length} more ornaments to light up the star.`;
}

// Antes había un modo prueba que abría todas las puertas; ya no existe.
try { localStorage.removeItem("berlin-adviento-prueba"); } catch {}

function pintarAdviento(nuevo = null) {
  pintarPuertas();
  pintarArbol(nuevo);
}

pintarAdviento();
