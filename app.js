// Estado: qué filtro está activo y qué lugares se han visitado.
let filtroActivo = "todos";
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

function pintarFiltros() {
  const contenedor = document.getElementById("filtros");
  const opciones = { todos: "Todos", ...CATEGORIAS };
  contenedor.innerHTML = "";

  for (const [clave, texto] of Object.entries(opciones)) {
    const boton = document.createElement("button");
    boton.textContent = texto;
    boton.className = clave === filtroActivo ? "activo" : "";
    boton.onclick = () => {
      filtroActivo = clave;
      pintarFiltros();
      pintarLista();
    };
    contenedor.appendChild(boton);
  }
}

function pintarLista(destacado = null) {
  const lista = document.getElementById("lista");
  const filtrados = LUGARES.filter(
    (l) => filtroActivo === "todos" || l.categoria === filtroActivo
  );
  lista.innerHTML = "";

  for (const lugar of filtrados) {
    const visitado = visitados.includes(lugar.nombre);
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta" +
      (visitado ? " visitado" : "") +
      (lugar === destacado ? " destacada" : "");

    tarjeta.innerHTML = `
      <span class="etiqueta">${CATEGORIAS[lugar.categoria]} · ${lugar.barrio}</span>
      <h3>${lugar.nombre}</h3>
      <p>${lugar.descripcion}</p>
      <p class="consejo">💡 ${lugar.consejo}</p>
      <label><input type="checkbox" ${visitado ? "checked" : ""}> Visitado</label>
    `;

    tarjeta.querySelector("input").onchange = (e) => {
      if (e.target.checked) visitados.push(lugar.nombre);
      else visitados = visitados.filter((n) => n !== lugar.nombre);
      guardarVisitados();
      pintarLista();
    };

    lista.appendChild(tarjeta);
    if (lugar === destacado) tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.getElementById("progreso").textContent =
    `Has visitado ${visitados.length} de ${LUGARES.length} lugares.`;
}

// Elige al azar un lugar que aún no se haya visitado.
document.getElementById("sorpresa").onclick = () => {
  const pendientes = LUGARES.filter((l) => !visitados.includes(l.nombre));
  if (pendientes.length === 0) {
    alert("¡Ya lo has visitado todo! 🎉");
    return;
  }
  const elegido = pendientes[Math.floor(Math.random() * pendientes.length)];
  filtroActivo = "todos";
  pintarFiltros();
  pintarLista(elegido);
};

pintarFiltros();
pintarLista();
