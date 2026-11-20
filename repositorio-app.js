// Pinta la página del repositorio a partir de repositorio.js.
let tipoActivo = null; // null = todos los tipos

function pintarFiltros() {
  const caja = document.getElementById("filtros");
  const opciones = [[null, "All", REPOSITORIO.length]].concat(
    Object.entries(TIPOS_REPOSITORIO).map(([tipo, nombre]) =>
      [tipo, nombre, REPOSITORIO.filter((e) => e.tipo === tipo).length])
  );
  caja.innerHTML = "";
  for (const [tipo, nombre, cuenta] of opciones) {
    const boton = document.createElement("button");
    boton.className = "filtro";
    boton.setAttribute("aria-pressed", tipoActivo === tipo);
    boton.innerHTML = `${tipo ? dibujo(DIBUJO_TIPO[tipo]) : ""}<span>${nombre}</span><span class="filtro-cuenta">${cuenta}</span>`;
    boton.onclick = () => {
      tipoActivo = tipo;
      pintar();
    };
    caja.appendChild(boton);
  }
}

function pintarLista() {
  const lista = document.getElementById("lista-repo");
  const filtrados = REPOSITORIO.filter((e) => !tipoActivo || e.tipo === tipoActivo)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  if (!filtrados.length) {
    lista.innerHTML = `
      <li class="repo-vacio">
        ${dibujo(tipoActivo ? DIBUJO_TIPO[tipoActivo] : "oso")}
        <p><b>Nothing saved${tipoActivo ? " in this section" : ""} yet.</b></p>
        <p>Send a link or a note to Claude Code and it will be added here.</p>
      </li>`;
    return;
  }

  lista.innerHTML = filtrados.map((e) => `
    <li class="tarjeta-repo">
      <div class="tarjeta-repo-arriba">
        ${dibujo(DIBUJO_TIPO[e.tipo])}
        <span class="chip">${TIPOS_REPOSITORIO[e.tipo]}</span>
      </div>
      <h3>${e.nombre}</h3>
      ${e.barrio ? `<p class="barrio">${e.barrio}</p>` : ""}
      ${e.nota ? `<p>${e.nota}</p>` : ""}
      ${e.enlace ? `<a class="pastilla pastilla-borde pastilla-pequena" href="${e.enlace}" target="_blank" rel="noopener">Open link ↗</a>` : ""}
    </li>`).join("");
}

function pintar() {
  pintarFiltros();
  pintarLista();
}

pintar();
