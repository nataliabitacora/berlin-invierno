// ---------- Estado ----------
let filtroActivo = null;          // null = todas las categorías
let pestana = "sugeridos";        // "sugeridos" (por hacer) o "hechos"
let barrios = new Set();          // filtro por lugar; vacío = todos
let seleccionado = null;          // lugar que se muestra en el panel derecho
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
  // El panel se queda en este plan y la lista salta a la pestaña donde ha ido a parar.
  seleccionado = lugar;
  pestana = estaVisitado(lugar) ? "hechos" : "sugeridos";
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
  const deLaCategoria = LUGARES.filter((l) =>
    (!filtroActivo || l.categoria === filtroActivo) && (!barrios.size || barrios.has(l.barrio)));
  const sugeridos = deLaCategoria.filter((l) => !estaVisitado(l));
  const hechos = deLaCategoria.filter(estaVisitado);
  const filtrados = pestana === "hechos" ? hechos : sugeridos;

  document.getElementById("titulo-lista").textContent =
    filtroActivo ? CATEGORIAS[filtroActivo] : "Todos los lugares";
  document.getElementById("ver-todo").hidden = !filtroActivo;
  pintarFiltros();
  document.getElementById("cuenta-sugeridos").textContent = sugeridos.length;
  document.getElementById("cuenta-hechos").textContent = hechos.length;
  document.getElementById("pestana-sugeridos").setAttribute("aria-selected", pestana === "sugeridos");
  document.getElementById("pestana-hechos").setAttribute("aria-selected", pestana === "hechos");

  let vacio = "";
  if (!deLaCategoria.length) vacio = barrios.size
    ? "Ningún plan coincide con este filtro de lugar."
    : "Todavía no hay lugares en esta categoría.";
  else if (pestana === "hechos") vacio = "Todavía no has hecho ningún plan aquí. Cuando hagas uno, márcalo en Planes sugeridos y aparecerá en esta pestaña.";
  else vacio = "No quedan planes sugeridos aquí. Prueba otra categoría o pulsa Surprise me.";
  // Si el plan seleccionado ya no está en la lista (cambio de pestaña, filtro o
  // porque se acaba de marcar), se selecciona el primero que se ve.
  if (!filtrados.includes(seleccionado)) seleccionado = filtrados[0] || null;

  lista.innerHTML = filtrados.length ? "" : `<li class="fila-vacia">${vacio}</li>`;
  filtrados.forEach((lugar) => {
    const id = LUGARES.indexOf(lugar);
    const elegido = lugar === seleccionado;
    const fila = document.createElement("li");
    fila.className = "fila" + (estaVisitado(lugar) ? " visitada" : "") + (elegido ? " seleccionada" : "");
    fila.innerHTML = `
      <div class="fila-principal">
        <input type="checkbox" class="casilla" id="visitado-${id}" ${estaVisitado(lugar) ? "checked" : ""}
               aria-label="Marcar ${lugar.nombre} como hecho">
        <button class="fila-boton" aria-pressed="${elegido}" aria-controls="plan">
          ${icono(lugar.categoria)}
          <span class="fila-nombre">${lugar.nombre}</span>
          <span class="etiqueta-barrio">${lugar.barrio}</span>
          <span class="flecha" aria-hidden="true">›</span>
        </button>
      </div>
    `;
    fila.querySelector(".casilla").onchange = () => alternarVisitado(lugar);
    fila.querySelector(".fila-boton").onclick = () => {
      seleccionado = lugar;
      pintarLista();
      pintarPlan(true);
      // En pantallas estrechas el panel queda arriba: lo traemos a la vista.
      if (matchMedia("(max-width: 980px)").matches) {
        document.getElementById("plan").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    lista.appendChild(fila);
  });
}

// ---------- Filtro por lugar ----------
const dialogoFiltros = document.getElementById("dialogo-filtros");
const todosLosBarrios = [...new Set(LUGARES.map((l) => l.barrio))]
  .sort((x, y) => (x === "Toda la ciudad") - (y === "Toda la ciudad") || x.localeCompare(y, "es"));

function marcados() {
  return new Set([...dialogoFiltros.querySelectorAll("input:checked")].map((c) => c.value));
}

function contarConFiltro(seleccion) {
  return LUGARES.filter((l) =>
    (!filtroActivo || l.categoria === filtroActivo) &&
    (!seleccion.size || seleccion.has(l.barrio)) &&
    (pestana === "hechos" ? estaVisitado(l) : !estaVisitado(l))).length;
}

function actualizarBotonAplicar() {
  const n = contarConFiltro(marcados());
  document.getElementById("aplicar-filtros").textContent = `Ver ${n} ${n === 1 ? "plan" : "planes"}`;
}

function abrirFiltros() {
  const caja = document.getElementById("lista-barrios");
  caja.querySelectorAll("label").forEach((l) => l.remove());
  for (const barrio of todosLosBarrios) {
    const cuantos = LUGARES.filter((l) => l.barrio === barrio && (!filtroActivo || l.categoria === filtroActivo)).length;
    const etiqueta = document.createElement("label");
    etiqueta.className = "opcion-barrio";
    etiqueta.innerHTML = `<input type="checkbox" value="${barrio}" ${barrios.has(barrio) ? "checked" : ""}>
      <span>${barrio}</span><span class="opcion-cuenta">${cuantos}</span>`;
    etiqueta.querySelector("input").onchange = actualizarBotonAplicar;
    caja.appendChild(etiqueta);
  }
  actualizarBotonAplicar();
  dialogoFiltros.showModal();
}

function pintarFiltros() {
  const chips = document.getElementById("chips-filtro");
  chips.innerHTML = "";
  for (const barrio of barrios) {
    const chip = document.createElement("button");
    chip.className = "chip chip-filtro";
    chip.innerHTML = `${barrio} <span aria-hidden="true">×</span>`;
    chip.setAttribute("aria-label", `Quitar filtro: ${barrio}`);
    chip.onclick = () => { barrios.delete(barrio); pintarLista(); pintarPlan(); };
    chips.appendChild(chip);
  }
  document.getElementById("zona-filtros").hidden = !barrios.size;
  const cuenta = document.getElementById("cuenta-filtros");
  cuenta.hidden = !barrios.size;
  cuenta.textContent = barrios.size;
  document.getElementById("abrir-filtros").classList.toggle("activo", barrios.size > 0);
}

document.getElementById("abrir-filtros").onclick = abrirFiltros;
document.getElementById("cerrar-filtros").onclick = () => dialogoFiltros.close();
document.getElementById("borrar-filtros").onclick = () => {
  dialogoFiltros.querySelectorAll("input").forEach((c) => (c.checked = false));
  actualizarBotonAplicar();
};
document.getElementById("form-filtros").onsubmit = () => {
  barrios = marcados();
  pintarLista();
  pintarPlan();
};
dialogoFiltros.addEventListener("click", (e) => { if (e.target === dialogoFiltros) dialogoFiltros.close(); });

for (const nombre of ["sugeridos", "hechos"]) {
  document.getElementById("pestana-" + nombre).onclick = () => {
    pestana = nombre;
    pintarLista();
    pintarPlan();
  };
}

document.getElementById("ver-todo").onclick = () => {
  filtroActivo = null;
  pintarTodo();
};

// ---------- Panel derecho: el plan seleccionado ----------
function pintarPlan(animar = false) {
  const caja = document.getElementById("plan-contenido");
  const l = seleccionado;
  if (!l) {
    caja.innerHTML = `<p class="plan-vacio">Elige un plan de la lista para ver aquí todos los detalles.</p>`;
    return;
  }
  const hecho = estaVisitado(l);
  caja.innerHTML = `
    <article class="plan${animar ? " destello" : ""}">
      <div class="plan-etiquetas">
        <span class="chip">${CATEGORIAS[l.categoria]}</span>
        ${hecho ? `<span class="chip chip-hecho">✓ Hecho</span>` : ""}
      </div>
      <h4>${l.nombre}</h4>
      <p class="barrio">${l.barrio}</p>
      <p>${l.descripcion}</p>
      <p class="consejo"><b>Consejo:</b> ${l.consejo}</p>
      <div class="plan-acciones">
        <button class="pastilla ${hecho ? "pastilla-borde" : "pastilla-negra"} pastilla-pequena" id="plan-hecho">
          ${hecho ? "Desmarcar como hecho" : "Marcar como hecho"}
        </button>
      </div>
    </article>
  `;
  document.getElementById("plan-hecho").onclick = () => alternarVisitado(l);
}

// Surprise me: elige al azar un plan sugerido de los que se ven (o de todos si no queda ninguno).
function sorprender() {
  const visibles = LUGARES.filter((l) => !estaVisitado(l) &&
    (!filtroActivo || l.categoria === filtroActivo) && (!barrios.size || barrios.has(l.barrio)));
  let opciones = visibles.filter((l) => l !== seleccionado);
  if (!opciones.length) {
    filtroActivo = null;
    barrios = new Set();
    opciones = LUGARES.filter((l) => !estaVisitado(l) && l !== seleccionado);
  }
  if (!opciones.length) return;
  pestana = "sugeridos";
  seleccionado = opciones[Math.floor(Math.random() * opciones.length)];
  pintarContadores();
  pintarLista();
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
