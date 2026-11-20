// ================= Nube: el mismo progreso en todos los dispositivos =================
// Con la sesión iniciada (enlace por email), los planes hechos y la partida del juego
// se guardan en Supabase además de en el navegador, y el álbum de fotos va a la nube.
//
// Cómo funciona:
// - La web sigue leyendo y escribiendo en localStorage como siempre; este archivo
//   vigila las dos claves que importan y sube los cambios a la nube.
// - Al abrir una página (y al volver a ella) se baja lo de la nube. Si trae algo
//   distinto de lo que hay en el navegador, se guarda y la página se recarga.
// - "Copia" es lo último que coincidió con la nube; si lo local ha cambiado desde
//   entonces y aún no se ha subido, hay cambios "pendientes" y esos mandan.
// - Los planes hechos se suman siempre que hay dudas: es mejor no perder un plan
//   marcado que recuperar uno desmarcado.

const NUBE_CLAVES = ["berlin-visitados", "berlin-cozy"];
const NUBE_COPIA = "berlin-nube-copia";
const NUBE_PENDIENTE = "berlin-nube-pendiente";

const NUBE = (() => {
  const activa = Boolean(window.supabase && typeof NUBE_CONFIG !== "undefined" && NUBE_CONFIG.url && NUBE_CONFIG.clave);
  let avisarListo;
  const listo = new Promise((ok) => (avisarListo = ok));
  if (!activa) {
    avisarListo();
    return { activa: false, cliente: null, listo, usuario: () => null };
  }

  const cliente = supabase.createClient(NUBE_CONFIG.url, NUBE_CONFIG.clave);
  const setOriginal = Storage.prototype.setItem;
  let usuario = null;
  let bajando = null;
  let temporizador = null;

  // ---------- Lectura y escritura local sin pasar por la vigilancia ----------
  const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const escribir = (k, v) => { try { setOriginal.call(localStorage, k, v); } catch {} };
  const quitar = (k) => { try { localStorage.removeItem(k); } catch {} };
  const copia = () => { try { return JSON.parse(leer(NUBE_COPIA)); } catch { return null; } };
  const lista = (texto) => { try { return JSON.parse(texto) || []; } catch { return []; } };

  function contenidoLocal() {
    const c = {};
    for (const k of NUBE_CLAVES) {
      const v = leer(k);
      if (v != null) c[k] = v;
    }
    return c;
  }

  // ---------- Vigilar los cambios de la web ----------
  // Solo cuenta como cambio pendiente si este dispositivo ya se sincronizó alguna vez
  // (hay copia) y el valor nuevo es distinto del que tiene la nube.
  Storage.prototype.setItem = function (clave, valor) {
    setOriginal.call(this, clave, valor);
    if (this !== localStorage || !NUBE_CLAVES.includes(clave)) return;
    const c = copia();
    if (!c || c[clave] === String(valor)) return;
    escribir(NUBE_PENDIENTE, "1");
    if (usuario) {
      clearTimeout(temporizador);
      temporizador = setTimeout(subir, 800);
    }
  };

  // ---------- Subir y bajar ----------
  async function subir() {
    if (!usuario) return;
    pintarBoton("subiendo");
    const contenido = contenidoLocal();
    const { error } = await cliente.from("datos")
      .upsert({ user_id: usuario.id, contenido, actualizado: new Date().toISOString() });
    if (error) {
      pintarBoton("error");
      return;
    }
    escribir(NUBE_COPIA, JSON.stringify(contenido));
    quitar(NUBE_PENDIENTE);
    pintarBoton("ok");
  }

  function bajar() {
    bajando ??= (async () => {
      try {
        await bajarYa();
      } finally {
        bajando = null;
      }
    })();
    return bajando;
  }

  async function bajarYa() {
    if (!usuario) return;
    const { data, error } = await cliente.from("datos").select("contenido").maybeSingle();
    if (error) {
      pintarBoton("error");
      return;
    }
    const local = contenidoLocal();
    const remoto = data?.contenido || {};
    const primeraVez = !copia();
    const pendiente = Boolean(leer(NUBE_PENDIENTE));

    // Nube vacía: se sube lo de este navegador.
    if (!data) return subir();

    // Planes hechos de los dos lados juntos (sin repetir).
    const juntos = JSON.stringify([...new Set([...lista(remoto["berlin-visitados"]), ...lista(local["berlin-visitados"])])]);

    if (pendiente && !primeraVez) {
      // Lo local es más nuevo: se sube, sumando los planes hechos de la nube.
      if (juntos !== local["berlin-visitados"]) escribir("berlin-visitados", juntos);
      return subir();
    }

    // La nube manda. La primera vez en este dispositivo se suman también sus planes hechos.
    const final = { ...remoto };
    if (primeraVez && local["berlin-visitados"]) final["berlin-visitados"] = juntos;
    let cambia = false;
    for (const k of NUBE_CLAVES) {
      if (final[k] != null && final[k] !== local[k]) {
        escribir(k, final[k]);
        cambia = true;
      }
    }
    escribir(NUBE_COPIA, JSON.stringify(remoto));
    if (final["berlin-visitados"] !== remoto["berlin-visitados"]) {
      escribir(NUBE_PENDIENTE, "1");
      await subir();
    } else {
      pintarBoton("ok");
    }
    if (cambia) recargar();
  }

  // Recarga para que la página pinte lo que llegó de la nube (con freno por si acaso).
  function recargar() {
    let veces = [];
    try { veces = JSON.parse(sessionStorage.getItem("berlin-nube-recargas")) || []; } catch {}
    veces = veces.filter((t) => Date.now() - t < 15000);
    if (veces.length >= 2) return;
    veces.push(Date.now());
    try { sessionStorage.setItem("berlin-nube-recargas", JSON.stringify(veces)); } catch {}
    location.reload();
  }

  // ---------- Sesión ----------
  cliente.auth.onAuthStateChange((evento, sesion) => {
    const antes = usuario?.id;
    usuario = sesion?.user || null;
    // Las llamadas a Supabase van fuera de este aviso (recomendación de la librería).
    setTimeout(() => {
      if (evento === "SIGNED_OUT") {
        quitar(NUBE_COPIA);
        quitar(NUBE_PENDIENTE);
      }
      if (usuario && usuario.id !== antes) bajar();
      pintarBoton(usuario ? "ok" : "fuera");
      pintarDialogo();
      avisarListo();
    }, 0);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !usuario) return;
    if (leer(NUBE_PENDIENTE)) subir();
    else bajar();
  });

  // ---------- Botón del menú y diálogo ----------
  const ICONO = {
    fuera: `<path d="M160.06,40A88.1,88.1,0,0,0,81.29,88.67h0A87.48,87.48,0,0,0,72,127.73,8.18,8.18,0,0,1,64.57,136,8,8,0,0,1,56,128a103.66,103.66,0,0,1,5.34-32.92,4,4,0,0,0-4.75-5.18A64.09,64.09,0,0,0,8,152c0,35.19,29.75,64,65,64H160a88.09,88.09,0,0,0,87.93-91.48C246.11,77.54,207.07,40,160.06,40Z"/>`,
    ok: `<path d="M247.93,124.52C246.11,77.54,207.07,40,160.06,40A88.1,88.1,0,0,0,81.29,88.67h0A87.48,87.48,0,0,0,72,127.73,8.18,8.18,0,0,1,64.57,136,8,8,0,0,1,56,128a103.66,103.66,0,0,1,5.34-32.92,4,4,0,0,0-4.75-5.18A64.09,64.09,0,0,0,8,152c0,35.19,29.75,64,65,64H160A88.09,88.09,0,0,0,247.93,124.52Zm-50.27-6.86-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L144,148.69l42.34-42.35a8,8,0,0,1,11.32,11.32Z"/>`,
    error: `<path d="M248,128.72A87.74,87.74,0,0,1,222.41,190a4,4,0,0,1-5.77-.16L103.78,65.67a4,4,0,0,1,.39-5.76A87.82,87.82,0,0,1,160.87,40C209.15,40.47,248.38,80.43,248,128.72ZM53.92,34.62A8,8,0,1,0,42.08,45.38L81.33,88.56l-.06.11A64,64,0,0,0,8,153c.53,35.12,29.84,63,65,63h87a87.65,87.65,0,0,0,31.78-5.95l10.3,11.33a8,8,0,0,0,11.33.52,8.32,8.32,0,0,0,.29-11.52Z"/>`
  };
  const TEXTO = {
    fuera: "Sign in to sync your progress",
    subiendo: "Saving to the cloud…",
    ok: "Synced",
    error: "Couldn't sync right now"
  };

  const menu = document.querySelector(".menu");
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "menu-nube";
  menu?.appendChild(boton);

  function pintarBoton(estado) {
    const icono = estado === "subiendo" ? ICONO.ok : ICONO[estado];
    boton.innerHTML = `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${icono}</svg>`;
    boton.dataset.estado = estado;
    const texto = estado === "ok" && usuario ? `Synced as ${usuario.email}` : TEXTO[estado];
    boton.setAttribute("aria-label", texto);
    boton.title = texto;
  }
  pintarBoton("fuera");

  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="dialogo dialogo-filtros dialogo-nube" id="dialogo-nube" aria-labelledby="nube-titulo">
      <form id="form-nube">
        <div class="filtros-cabecera">
          <h3 id="nube-titulo">Your progress, everywhere</h3>
          <button type="button" class="cerrar-x" id="cerrar-nube" aria-label="Close">×</button>
        </div>
        <div id="nube-fuera">
          <p>Sign in with your email to keep your plans, your game and your photos on every device. We'll send you a link: open it on this device and you're in.</p>
          <input type="email" id="nube-email" class="nube-email" required autocomplete="email" placeholder="your@email.com" aria-label="Email">
          <div class="dialogo-acciones">
            <button type="submit" class="pastilla pastilla-sol pastilla-pequena">Send me a link</button>
          </div>
        </div>
        <div id="nube-dentro" hidden>
          <p>Signed in as <b id="nube-quien"></b>. Your plans, your game and your photos are saved in the cloud and show up on every device where you sign in.</p>
          <div class="dialogo-acciones">
            <button type="button" class="pastilla pastilla-borde pastilla-pequena" id="nube-salir">Sign out</button>
          </div>
        </div>
        <p class="nube-aviso" id="nube-aviso" role="status"></p>
      </form>
    </dialog>`);

  const dialogo = document.getElementById("dialogo-nube");
  const aviso = document.getElementById("nube-aviso");

  function pintarDialogo() {
    document.getElementById("nube-fuera").hidden = Boolean(usuario);
    document.getElementById("nube-dentro").hidden = !usuario;
    document.getElementById("nube-quien").textContent = usuario?.email || "";
  }

  boton.onclick = () => {
    aviso.textContent = "";
    pintarDialogo();
    dialogo.showModal();
  };
  document.getElementById("cerrar-nube").onclick = () => dialogo.close();

  document.getElementById("form-nube").onsubmit = async (e) => {
    e.preventDefault();
    if (usuario) return;
    const email = document.getElementById("nube-email").value.trim();
    aviso.textContent = "Sending…";
    const { error } = await cliente.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname }
    });
    aviso.textContent = error
      ? "The link couldn't be sent. Check the email and try again in a minute."
      : "Done! Check your inbox and open the link on this device.";
  };

  document.getElementById("nube-salir").onclick = async () => {
    await cliente.auth.signOut();
    aviso.textContent = "Signed out. Your progress stays on this device too.";
  };

  return { activa: true, cliente, listo, usuario: () => usuario };
})();
