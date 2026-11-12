// ---------- Estado ----------
let filtroActivo = null;          // null = todas las categorías
let abiertos = new Set();         // filas desplegadas
let planActual = null;            // lugar propuesto en "Próximo plan"
let visitados = cargarVisitados();

function cargarVisitados() {
  try {
    return JSON.parse(localStorage.getItem("berlin-visitados")) || [];
  } catch {
    return [];
  }
}

function guardarVisitados() {
  try {
    localStorage.setItem("berlin-visitados", JSON.stringify(visitados));
  } catch {
    // Si el navegador no deja guardar, seguimos sin persistencia.
  }
}

const estaVisitado = (lugar) => visitados.includes(lugar.nombre);

function alternarVisitado(lugar) {
  if (estaVisitado(lugar)) visitados = visitados.filter((n) => n !== lugar.nombre);
  else visitados.push(lugar.nombre);
  guardarVisitados();
  pintarTodo();
}

// ---------- Iconos en línea (uno por categoría) ----------
const ICONOS = {
  "mercado": '<path d="M12 2 L18 10 H15 L20 17 H4 L9 10 H6 Z"/><path d="M12 17 V22"/>',
  "museo": '<path d="M3 9 L12 3 L21 9 Z"/><path d="M5 9 V18 M10 9 V18 M14 9 V18 M19 9 V18 M3 21 H21"/>',
  "aire-libre": '<path d="M12 2 V22 M3.3 7 L20.7 17 M3.3 17 L20.7 7"/>',
  "calor": '<path d="M5 9 H16 V17 A3 3 0 0 1 13 20 H8 A3 3 0 0 1 5 17 Z"/><path d="M16 11 H18 A2 2 0 0 1 18 15 H16"/><path d="M9 6 Q8 4 9 2 M12 6 Q11 4 12 2"/>',
  "comida": '<path d="M12 20 C4 20 4 8 9 8 C12 8 13 13 12 15 C11 13 12 8 15 8 C20 8 20 20 12 20 Z"/>'
};
const icono = (cat) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[cat]}</svg>`;

// ---------- Fecha ----------
document.getElementById("fecha").textContent = new Date().toLocaleDateString("es-ES", {
  weekday: "long", day: "numeric", month: "long"
});

// ---------- Contadores por categoría ----------
function pintarContadores() {
  const contenedor = document.getElementById("contadores");
  contenedor.innerHTML = "";

  for (const [cat, nombre] of Object.entries(CATEGORIAS)) {
    const delGrupo = LUGARES.filter((l) => l.categoria === cat);
    const hechos = delGrupo.filter(estaVisitado).length;
    const pendientes = delGrupo.length - hechos;

    const boton = document.createElement("button");
    boton.className = "contador";
    boton.dataset.cat = cat;
    boton.setAttribute("aria-pressed", filtroActivo === cat);
    boton.innerHTML = `
      <span class="contador-arriba">${icono(cat)}<span class="contador-etiqueta">${nombre}</span></span>
      <span class="contador-numero">${hechos}<small>/${delGrupo.length}</small></span>
      <span class="contador-pie">${pendientes === 0 ? "¡Completado!" : `${pendientes} por descubrir`}</span>
    `;
    boton.onclick = () => {
      filtroActivo = filtroActivo === cat ? null : cat;
      pintarTodo();
    };
    contenedor.appendChild(boton);
  }
}

// ---------- Lista de lugares ----------
function pintarLista() {
  const lista = document.getElementById("lista");
  const filtrados = LUGARES.filter((l) => !filtroActivo || l.categoria === filtroActivo);

  document.getElementById("titulo-lista").textContent =
    filtroActivo ? CATEGORIAS[filtroActivo] : "Todos los lugares";
  document.getElementById("cuenta-lista").textContent = filtrados.length;
  document.getElementById("ver-todo").hidden = !filtroActivo;

  lista.innerHTML = "";
  filtrados.forEach((lugar) => {
    const id = LUGARES.indexOf(lugar);
    const abierto = abiertos.has(id);
    const fila = document.createElement("li");
    fila.className = "fila" + (estaVisitado(lugar) ? " visitada" : "") + (abierto ? " abierta" : "");
    fila.innerHTML = `
      <div class="fila-principal">
        <input type="checkbox" class="casilla" id="visitado-${id}" ${estaVisitado(lugar) ? "checked" : ""}
               aria-label="Marcar ${lugar.nombre} como visitado">
        <button class="fila-boton" aria-expanded="${abierto}" aria-controls="detalle-${id}">
          <span class="fila-nombre">${lugar.nombre}</span>
          <span class="etiqueta-barrio">${lugar.barrio}</span>
          <span class="flecha" aria-hidden="true">›</span>
        </button>
      </div>
      <div class="fila-detalle" id="detalle-${id}" ${abierto ? "" : "hidden"}>
        <span class="chip" data-cat="${lugar.categoria}">${CATEGORIAS[lugar.categoria]}</span>
        <p>${lugar.descripcion}</p>
        <p class="consejo">Consejo: ${lugar.consejo}</p>
      </div>
    `;
    fila.querySelector(".casilla").onchange = () => alternarVisitado(lugar);
    fila.querySelector(".fila-boton").onclick = () => {
      abierto ? abiertos.delete(id) : abiertos.add(id);
      pintarLista();
    };
    lista.appendChild(fila);
  });
}

document.getElementById("ver-todo").onclick = () => {
  filtroActivo = null;
  pintarTodo();
};

// ---------- Próximo plan ----------
function elegirPlan() {
  const pendientes = LUGARES.filter((l) => !estaVisitado(l) && l !== planActual);
  const opciones = pendientes.length ? pendientes : LUGARES.filter((l) => !estaVisitado(l));
  planActual = opciones.length ? opciones[Math.floor(Math.random() * opciones.length)] : null;
}

function pintarPlan(animar = false) {
  const caja = document.getElementById("plan-contenido");

  if (!planActual || estaVisitado(planActual)) elegirPlan();
  if (!planActual) {
    caja.innerHTML = `<p class="plan-vacio">Has visitado los ${LUGARES.length} lugares. Berlín en invierno, completado.</p>`;
    return;
  }

  const l = planActual;
  caja.innerHTML = `
    <article class="plan${animar ? " destello" : ""}">
      <span class="chip" data-cat="${l.categoria}">${CATEGORIAS[l.categoria]}</span>
      <h4>${l.nombre}</h4>
      <p class="barrio">${l.barrio}</p>
      <p>${l.descripcion}</p>
      <p class="consejo">Consejo: ${l.consejo}</p>
      <div class="plan-acciones">
        <button class="pastilla pastilla-negra" id="plan-hecho">Marcar como visitado</button>
        <button class="pastilla pastilla-borde" id="plan-otro">Otro plan</button>
      </div>
    </article>
  `;
  document.getElementById("plan-hecho").onclick = () => alternarVisitado(l);
  document.getElementById("plan-otro").onclick = () => {
    elegirPlan();
    pintarPlan(true);
  };
}

document.getElementById("sorpresa").onclick = () => {
  elegirPlan();
  pintarPlan(true);
  document.getElementById("plan").scrollIntoView({ behavior: "smooth", block: "center" });
};

// ---------- Progreso y repintado ----------
function pintarTodo() {
  document.getElementById("menu-progreso").textContent = `${visitados.length}/${LUGARES.length}`;
  pintarContadores();
  pintarLista();
  pintarPlan();
}

pintarTodo();
