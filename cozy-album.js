// ================= Álbum de fotos =================
// El libro del suelo del cuarto. Las fotos se reducen y se guardan en este
// navegador (IndexedDB), que admite mucho más espacio que localStorage.

let baseDeDatos = null;
function abrirBD() {
  baseDeDatos ??= new Promise((ok, mal) => {
    const peticion = indexedDB.open("berlin-cozy-album", 1);
    peticion.onupgradeneeded = () => peticion.result.createObjectStore("fotos", { keyPath: "id", autoIncrement: true });
    peticion.onsuccess = () => ok(peticion.result);
    peticion.onerror = () => mal(peticion.error);
  });
  return baseDeDatos;
}

async function operacion(modo, fn) {
  const bd = await abrirBD();
  return new Promise((ok, mal) => {
    const tx = bd.transaction("fotos", modo);
    const peticion = fn(tx.objectStore("fotos"));
    tx.oncomplete = () => ok(peticion.result);
    tx.onerror = () => mal(tx.error);
  });
}

const listarFotos = () => operacion("readonly", (s) => s.getAll());
const guardarFoto = (foto) => operacion("readwrite", (s) => s.add(foto));
const borrarFoto = (id) => operacion("readwrite", (s) => s.delete(id));

// Reduce la foto a 1200 px de lado como mucho, en JPEG.
async function reducir(archivo) {
  const imagen = await createImageBitmap(archivo);
  const k = Math.min(1, 1200 / Math.max(imagen.width, imagen.height));
  const c = document.createElement("canvas");
  c.width = Math.round(imagen.width * k);
  c.height = Math.round(imagen.height * k);
  c.getContext("2d").drawImage(imagen, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

// Primera foto del álbum, fija: no se guarda en el navegador ni se puede borrar.
const FOTO_FIJA = `
    <figure class="polaroid polaroid-fija">
      <img src="fotos/album-primera.jpg" alt="People sitting on the steps by the Spree, watching a street musician">
      <figcaption><b>By the Spree</b><span>The first photo</span></figcaption>
    </figure>`;

const escapar = (texto) => texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ---------- Interfaz ----------
const album = document.getElementById("album");
const formulario = document.getElementById("album-form");
const entradaArchivo = document.getElementById("album-archivo");
const nombreArchivo = document.getElementById("album-archivo-nombre");
const selectorLugar = document.getElementById("album-lugar");

// Lugares de la guía para etiquetar la foto.
for (const l of LUGARES) {
  const op = document.createElement("option");
  op.value = l.nombre;
  op.textContent = l.nombre;
  selectorLugar.appendChild(op);
}

entradaArchivo.onchange = () => {
  nombreArchivo.textContent = entradaArchivo.files[0]?.name || "No photo chosen";
};

async function pintarAlbum() {
  const caja = document.getElementById("album-fotos");
  let fotos = [];
  try {
    fotos = await listarFotos();
  } catch {
    caja.innerHTML = FOTO_FIJA + `<p class="album-vacio">This browser won't let us save photos (this can happen in a private window).</p>`;
    return;
  }
  document.getElementById("album-cuenta").textContent = fotos.length + 1;

  // La foto fija va siempre la primera; detrás, las del usuario, de la más nueva a la más antigua.
  caja.innerHTML = FOTO_FIJA + fotos.reverse().map((f) => `
    <figure class="polaroid">
      <img src="${f.imagen}" alt="${escapar(f.pie || "Album photo")}">
      <figcaption>
        ${f.pie ? `<b>${escapar(f.pie)}</b>` : ""}
        <span>${f.lugar ? escapar(nombreActual(f.lugar)) + " · " : ""}${new Date(f.fecha).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
      </figcaption>
      <button class="polaroid-borrar" data-id="${f.id}" aria-label="Delete photo">×</button>
    </figure>`).join("");

  for (const b of caja.querySelectorAll(".polaroid-borrar")) {
    b.onclick = async () => {
      if (!confirm("Delete this photo from the album?")) return;
      await borrarFoto(Number(b.dataset.id));
      pintarAlbum();
    };
  }
}

formulario.onsubmit = async (e) => {
  e.preventDefault();
  const archivo = entradaArchivo.files[0];
  const aviso = document.getElementById("album-aviso");
  if (!archivo) {
    aviso.textContent = "Choose a photo first.";
    return;
  }
  aviso.textContent = "Saving…";
  try {
    await guardarFoto({
      imagen: await reducir(archivo),
      pie: document.getElementById("album-pie").value.trim(),
      lugar: selectorLugar.value,
      fecha: Date.now()
    });
    formulario.reset();
    nombreArchivo.textContent = "No photo chosen";
    aviso.textContent = "";
    pintarAlbum();
  } catch {
    aviso.textContent = "The photo couldn't be saved. Try another image (JPG or PNG).";
  }
};

function abrirAlbum() {
  pintarAlbum();
  album.showModal();
}

document.getElementById("abrir-album").onclick = abrirAlbum;
document.getElementById("cerrar-album").onclick = () => album.close();
