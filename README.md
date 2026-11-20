# The Berlin Winter Project

*Because winter does not have to be boring.*

Web para descubrir Berlín en invierno: planes por la ciudad, un minijuego para decorar un cuarto (Getting Cozy), un repositorio de sitios por explorar y, próximamente, Monthly challenges. Los textos de la web están en inglés.

**Web pública:** https://nataliabitacora.github.io/berlin-invierno/

Se publica con GitHub Pages desde la rama `main` del repositorio público https://github.com/nataliabitacora/berlin-invierno. Cada cambio subido a `main` aparece en la web en uno o dos minutos.

En local no hace falta instalar nada:

```bash
open index.html
```

## Próxima sesión: puntos de acción

1. **Base de datos y cuenta en Supabase.** El código ya está hecho y subido (`cc20098`); falta crear la cuenta y conectarla. Ver [Guardado y sincronización](#guardado-y-sincronización).
   - Crear la cuenta y un proyecto en supabase.com (región Frankfurt).
   - Ejecutar `supabase/esquema.sql` en el SQL Editor.
   - En Authentication → URL Configuration, poner la web pública como Site URL y como Redirect URL.
   - Pasar a Claude el Project URL y la clave *anon public* (nunca la *service_role*) para rellenar `nube-config.js`.
   - Probar el inicio de sesión y la sincronización en el PC y en el móvil.
   - Opcional: desactivar los registros nuevos cuando la cuenta propia ya exista.
2. **Sistema de monedas.** Revisar cómo se ganan y se gastan las monedas del juego. Ahora mismo cada plan hecho da 10 monedas, los 16 objetos de la tienda cuestan entre 8 y 40 (`cozy-datos.js`), y los logros regalan objetos especiales.
3. **Añadir información a la base de datos.** Cargar contenido una vez que Supabase esté funcionando.

## Páginas

- **Plans** (`index.html`): portada con el emblema y la sección "A whole city to explore".
  - Categorías en un carrusel: History, Arts & Culture, Wander, Parties, Cozy Coffee, Christmas Markets y Berliner 101.
  - Lista con dos pestañas, planes sugeridos y planes hechos.
  - Filtro por barrio y chips de barrio en color.
  - Panel con el plan seleccionado: fechas, consejo y botón "Mark as done".
  - Botones "Surprise me" para elegir un plan al azar.
  - Debajo, "Monthly challenges · Coming soon".
- **Game** (`cozy.html`): Getting Cozy, un cuarto isométrico en pixel art.
  - Los planes hechos dan monedas, que se gastan en la tienda.
  - Hay 10 logros especiales y un editor del acompañante.
  - El álbum de fotos tiene una primera foto fija (`fotos/album-primera.jpg`).
- **Repository** (`repositorio.html`): colectivos, centros culturales, lugares y listas de actividades. Se añaden pidiéndoselo a Claude Code.
- `adviento.html` solo redirige a la sección de Monthly challenges, porque el calendario de adviento se retiró.

## Archivos

| Archivo | Qué hay |
| --- | --- |
| `index.html`, `app.js` | Página de planes: categorías, lista, filtros y panel del plan |
| `lugares.js` | Los planes, los subtítulos de cada categoría y el color de cada barrio (`COLOR_BARRIO`). Aquí se añaden planes |
| `cozy.html`, `cozy.js`, `cozy-datos.js` | El minijuego: dibujo del cuarto, tienda, logros y avatar |
| `cozy-album.js` | Álbum de fotos (en el navegador o en la nube) |
| `repositorio.html`, `repositorio.js`, `repositorio-app.js` | El repositorio: datos y página |
| `dibujos.js` | Iconos Phosphor (estilo Fill), con la licencia en `licencias/` |
| `style.css` | Todos los estilos y los tokens de color |
| `fondo.svg` | Fondo de pegatinas de la portada, las cabeceras y las franjas |
| `nube.js`, `nube-config.js` | Sincronización con Supabase (ver abajo) |
| `supabase/esquema.sql` | Tablas, almacén de fotos y reglas de seguridad de Supabase |
| `sistema-diseno/` | Copia del manual del sistema de diseño (publicado en https://claude.ai/artifact/VQA6x7oodMBNng54b5dSYJ) |
| `SESIONES.md` | Diario de cada sesión con Claude Code |

## Diseño, en corto

- **Neutros cálidos:** crema `#fff4d6` de fondo y `#fffaee` para las tarjetas. No se usa blanco puro.
- **Tinta violeta** `#1b1726` para el texto y los trazos.
- **Amarillo** `#ffe223` solo para las acciones principales: los dos "Surprise me" y "Mark as done".
- **Lila apagado** `#c4bad6` para el menú, la categoría elegida y los filtros. La sección de planes lleva fondo lila suave `#e8e2f0`.
- **Ocre:**
  - En la sección de planes solo se usa el más claro (el crema del fondo), en el plan seleccionado y en la pestaña activa.
  - El juego usa un ocre suave `#ecd08f` para los botones secundarios.
- **Barrios:** cada chip tiene su color, sacado de la paleta de las pegatinas con la mitad de saturación.
- **Tipografía:** Unbounded para títulos y números, Anonymous Pro para todo lo demás.
- **Formas:**
  - Trazos de 1,5 px. Solo las divisiones de sección van a 2,5 px.
  - Los botones grandes de acción tienen esquina de 16 px; el resto, forma de cápsula.

El manual (`sistema-diseno/` y el artifact) no recoge todavía los últimos cambios de color: ocre en botones y selección, fondos de sección y chips de barrio.

## Guardado y sincronización

**Hoy:** todo se guarda solo en el navegador de cada dispositivo.
- Los planes hechos van en `localStorage` con la clave `berlin-visitados`.
- La partida va en `berlin-cozy`.
- Las fotos van en IndexedDB.

**Con Supabase conectado** (pendiente, punto 1 de la próxima sesión):
- En el menú aparece un botón con una nube. Se inicia sesión con un enlace que llega por email y hay que abrirlo en el mismo dispositivo.
- Con sesión, los planes hechos y la partida se guardan también en la tabla `datos`, una fila por persona.
- Las fotos van al almacén privado `album`, con sus datos en la tabla `fotos`.
- Las fotos que ya estaban en el navegador se suben solas la primera vez.
- Al abrir o volver a una página se baja lo de la nube. Si cambió algo, la página se recarga.
- Si marcaste planes en varios dispositivos antes de conectarlos, se suman y no se pierde ninguno. En la partida del juego manda la que ya esté en la nube.
- Las reglas de seguridad (RLS) hacen que cada persona solo vea y cambie sus propios datos.
- Mientras `nube-config.js` esté vacío, la web funciona exactamente como antes, sin nube.
