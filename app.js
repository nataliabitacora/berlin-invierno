// ---------- Estado ----------
let filtroActivo = null;          // null = todas las categorías
let pestana = "sugeridos";        // "sugeridos" (por hacer) o "hechos"
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

// ---------- Dibujo de cada categoría (ver dibujos.js) ----------
const icono = (cat) => dibujo(DIBUJO_CATEGORIA[cat]);

// ---------- Fecha ----------
document.getElementById("fecha").textContent = new Date().toLocaleDateString("es-ES", {
  weekday: "long", day: "numeric", month: "long"
});

// ---------- Contadores por categoría ----------
function pintarContadores() {
  const contenedor = document.getElementById("contadores");
  contenedor.innerHTML = "";

  for (const [cat, nombre] of Object.entries(CATEGORIAS)) {
    const hechos = LUGARES.filter((l) => l.categoria === cat && estaVisitado(l)).length;

    const boton = document.createElement("button");
    boton.className = "contador";
    boton.dataset.cat = cat;
    boton.setAttribute("aria-pressed", filtroActivo === cat);
    boton.title = `${nombre}: ${hechos} ${hechos === 1 ? "lugar visitado" : "lugares visitados"}`;
    boton.innerHTML = `
      <span class="contador-arriba">${icono(cat)}<span class="contador-numero">${hechos}</span></span>
      <span class="contador-etiqueta">${nombre}</span>
    `;
    boton.onclick = () => {
      filtroActivo = filtroActivo === cat ? null : cat;
      pintarTodo();
    };
    contenedor.appendChild(boton);
  }

  // Categoría extra: no filtra, propone un plan al azar.
  const sorpresa = document.createElement("button");
  sorpresa.className = "contador contador-sorpresa";
  sorpresa.title = "Un plan al azar de cualquier categoría";
  sorpresa.innerHTML = `
    <span class="contador-arriba">${dibujo("dado")}<span class="contador-numero">?</span></span>
    <span class="contador-etiqueta">Surprise me</span>
  `;
  sorpresa.onclick = sorprender;
  contenedor.appendChild(sorpresa);
}

// ---------- Lista de lugares ----------
function pintarLista() {
  const lista = document.getElementById("lista");
  const deLaCategoria = LUGARES.filter((l) => !filtroActivo || l.categoria === filtroActivo);
  const sugeridos = deLaCategoria.filter((l) => !estaVisitado(l));
  const hechos = deLaCategoria.filter(estaVisitado);
  const filtrados = pestana === "hechos" ? hechos : sugeridos;

  document.getElementById("titulo-lista").textContent =
    filtroActivo ? CATEGORIAS[filtroActivo] : "Todos los lugares";
  document.getElementById("ver-todo").hidden = !filtroActivo;
  document.getElementById("cuenta-sugeridos").textContent = sugeridos.length;
  document.getElementById("cuenta-hechos").textContent = hechos.length;
  document.getElementById("pestana-sugeridos").setAttribute("aria-selected", pestana === "sugeridos");
  document.getElementById("pestana-hechos").setAttribute("aria-selected", pestana === "hechos");

  let vacio = "";
  if (!deLaCategoria.length) vacio = "Todavía no hay lugares en esta categoría.";
  else if (pestana === "hechos") vacio = "Todavía no has hecho ningún plan aquí. Cuando hagas uno, márcalo en Planes sugeridos y aparecerá en esta pestaña.";
  else vacio = "No quedan planes sugeridos aquí. Prueba otra categoría o pulsa Surprise me.";
  lista.innerHTML = filtrados.length ? "" : `<li class="fila-vacia">${vacio}</li>`;
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
          ${icono(lugar.categoria)}
          <span class="fila-nombre">${lugar.nombre}</span>
          <span class="etiqueta-barrio">${lugar.barrio}</span>
          <span class="flecha" aria-hidden="true">›</span>
        </button>
      </div>
      <div class="fila-detalle" id="detalle-${id}" ${abierto ? "" : "hidden"}>
        <span class="chip">${CATEGORIAS[lugar.categoria]}</span>
        <p>${lugar.descripcion}</p>
        <p class="consejo"><b>Consejo:</b> ${lugar.consejo}</p>
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

for (const nombre of ["sugeridos", "hechos"]) {
  document.getElementById("pestana-" + nombre).onclick = () => {
    pestana = nombre;
    pintarLista();
  };
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
      <span class="chip">${CATEGORIAS[l.categoria]}</span>
      <h4>${l.nombre}</h4>
      <p class="barrio">${l.barrio}</p>
      <p>${l.descripcion}</p>
      <p class="consejo"><b>Consejo:</b> ${l.consejo}</p>
      <div class="plan-acciones">
        <button class="pastilla pastilla-negra pastilla-pequena" id="plan-hecho">Marcar como visitado</button>
        <button class="pastilla pastilla-borde pastilla-pequena" id="plan-otro">Otro plan</button>
      </div>
    </article>
  `;
  document.getElementById("plan-hecho").onclick = () => alternarVisitado(l);
  document.getElementById("plan-otro").onclick = () => {
    elegirPlan();
    pintarPlan(true);
  };
}

function sorprender() {
  elegirPlan();
  pintarPlan(true);
  document.getElementById("plan").scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("sorpresa").onclick = sorprender;

// ---------- Progreso y repintado ----------
function pintarTodo() {
  document.getElementById("ver-lugares").textContent = `Ver los ${LUGARES.length} lugares`;
  document.getElementById("menu-progreso").textContent = `${visitados.length} ${visitados.length === 1 ? "visitado" : "visitados"}`;
  pintarContadores();
  pintarLista();
  pintarPlan();
}

pintarTodo();
