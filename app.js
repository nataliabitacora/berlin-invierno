// ---------- Estado ----------
let filtroActivo = null;          // null = todas las categorías
let pestana = "sugeridos";        // "sugeridos" (por hacer) o "hechos"
let barrios = new Set();          // filtro por lugar; vacío = todos
let seleccionado = null;          // lugar que se muestra en el panel derecho
let visitados = cargarVisitados();

function cargarVisitados() {
  try {
    // Old saves use the Spanish place names: translate them to the current ones.
    const guardados = JSON.parse(localStorage.getItem("berlin-visitados")) || [];
    return [...new Set(guardados.map(nombreActual))];
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

guardarVisitados(); // stores the list with the current (English) names

// ---------- Fecha ----------
document.getElementById("fecha").textContent = new Date().toLocaleDateString("en-GB", {
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
    boton.title = `${nombre}: ${hechos} ${hechos === 1 ? "place visited" : "places visited"}`;
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
    filtroActivo ? CATEGORIAS[filtroActivo] : "All places";
  document.getElementById("ver-todo").hidden = !filtroActivo;
  const subtitulo = document.getElementById("subtitulo-lista");
  subtitulo.textContent = filtroActivo ? SUBTITULOS[filtroActivo] || "" : "";
  subtitulo.hidden = !subtitulo.textContent;
  pintarFiltros();
  document.getElementById("cuenta-sugeridos").textContent = sugeridos.length;
  document.getElementById("cuenta-hechos").textContent = hechos.length;
  document.getElementById("pestana-sugeridos").setAttribute("aria-selected", pestana === "sugeridos");
  document.getElementById("pestana-hechos").setAttribute("aria-selected", pestana === "hechos");

  let vacio = "";
  if (!deLaCategoria.length) vacio = barrios.size
    ? "No plans match this area filter."
    : "There are no places in this category yet.";
  else if (pestana === "hechos") vacio = "You haven't done any plans here yet. When you do one, tick it in Suggested plans and it will show up in this tab.";
  else vacio = "No suggested plans left here. Try another category or hit Surprise me.";
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
               aria-label="Mark ${lugar.nombre} as done">
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
  .sort((x, y) => (x === "All over the city") - (y === "All over the city") || x.localeCompare(y, "en"));

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
  document.getElementById("aplicar-filtros").textContent = `Show ${n} ${n === 1 ? "plan" : "plans"}`;
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
    chip.setAttribute("aria-label", `Remove filter: ${barrio}`);
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
    caja.innerHTML = `<p class="plan-vacio">Pick a plan from the list to see all the details here.</p>`;
    return;
  }
  const hecho = estaVisitado(l);
  caja.innerHTML = `
    <article class="plan${animar ? " destello" : ""}">
      <div class="plan-etiquetas">
        <span class="chip">${CATEGORIAS[l.categoria]}</span>
        ${hecho ? `<span class="chip chip-hecho">✓ Done</span>` : ""}
      </div>
      <h4>${l.nombre}</h4>
      <p class="barrio">${l.barrio}</p>
      <p>${l.descripcion}</p>
      <p class="consejo"><b>Tip:</b> ${l.consejo}</p>
      <div class="plan-acciones">
        <button class="pastilla ${hecho ? "pastilla-borde" : "pastilla-negra"} pastilla-pequena" id="plan-hecho">
          ${hecho ? "Mark as not done" : "Mark as done"}
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
// Surprise me next to the "Your Berlin winter" heading.
const botonSorpresa = document.getElementById("sorpresa-panel");
botonSorpresa.insertAdjacentHTML("afterbegin", dibujo("dado"));
botonSorpresa.onclick = sorprender;

// ---------- Progreso y repintado ----------
function pintarTodo() {
  document.getElementById("ver-lugares").textContent = `See all ${LUGARES.length} places`;
  pintarContadores();
  pintarLista();
  pintarPlan();
}

pintarTodo();
