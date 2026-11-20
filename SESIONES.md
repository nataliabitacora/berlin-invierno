# Diario de sesiones

Registro de lo que hemos hecho con Claude Code en este proyecto, para retomar el trabajo en la siguiente sesión.

---

## Sesión 1 · 12 de noviembre de 2026

Proyecto pequeño para una introducción a Claude Code: una web para descubrir Berlín en invierno.

### Lo que hicimos, en orden

1. **Primera versión de la web** (`281eec8`): 12 lugares en tarjetas, filtros por categoría, botón "Sorpréndeme" y casilla de "visitado" que se guarda en el navegador.
2. **Repositorio git** creado, con un commit por cada versión.
3. **Rediseño neobrutalista** (`42bab6a`): bordes negros gruesos, sombras duras y colores planos, al estilo de webs como Gumroad.
4. **Investigación en Mobbin** (con el conector MCP): buscamos productos con estética neobrutalista y elegimos 3 referentes, puntuados en estética, navegación y arquitectura de la información:
   - hilos: 25/30
   - fal: 24/30
   - Deezer: 22/30

   La presentación con capturas está en https://claude.ai/artifact/TeYxceFVQkiRRtoNVggaxE
5. **Rediseño inspirado en hilos** (`7dfadbb`): mural de iconos de Berlín en línea negra (`patron.svg`), tarjeta blanca central con el oso de Berlín, menú en cápsula y panel con contadores por categoría.
6. **Todo en blanco y negro + calendario de adviento** (`ee46c31`):
   - La página entera pasa a blanco y negro con dibujos en línea (`dibujos.js`).
   - Minijuego de adviento (`adviento.js`): 24 puertas, una misión por Berlín para cada día del 1 al 24 de diciembre. Cada misión cumplida cuelga un adorno en el árbol, y con las 24 se enciende la estrella.
   - Casilla "Modo prueba" para abrir todas las puertas antes de diciembre.
7. **Subido a GitHub** como repositorio privado: https://github.com/nataliabitacora/berlin-invierno

### Decisiones tomadas

- Estética final: **blanco y negro con ilustraciones en línea**, inspirada en hilos, pero con dibujos propios de Berlín (sin copiar su marca).
- Los datos de los lugares están en `lugares.js` y las misiones en `adviento.js`. Para añadir contenido, basta con editar esos dos archivos.
- El progreso (visitados y adornos) se guarda solo en el navegador (`localStorage`).

### Pendiente o por revisar

- Comprobar los datos reales antes de usar la web en serio: horarios, mercados, salas abiertas de la Isla de los Museos, recorridos del tranvía M10 y del autobús 100.
- El texto "12 lugares" está escrito a mano en el HTML y no se actualiza si añades lugares.
- Las puertas del calendario solo se abren durante diciembre (en enero vuelven a cerrarse).

### Ideas para la próxima sesión

- Mensaje o animación especial al completar el árbol.
- Compartir el progreso (por ejemplo, una imagen del árbol).
- Un mapa con la ubicación de cada lugar.
- Publicar la web (por ejemplo, con GitHub Pages) para abrirla desde el móvil.

## Sesión 2 · 20 de noviembre de 2026

Del prototipo a "The Berlin Winter Project": web en inglés y en varias páginas, minijuego, sistema de diseño propio y el código para guardar el progreso en la nube.

### Lo que hicimos, en orden

1. **Estructura y contenido**
   - Nuevas categorías (History, Arts & Culture, Wander, Parties, Cozy Coffee, Christmas Markets, Berliner 101).
   - Web en tres páginas: Plans, Game y Repository.
   - Toda la web en inglés.
   - Pestañas de planes sugeridos y hechos, filtro por barrio y panel del plan seleccionado.
2. **Getting Cozy**: minijuego isométrico en pixel art.
   - Monedas por plan hecho, tienda, logros y editor del acompañante.
   - Álbum de fotos con una primera foto fija.
3. **Sistema de diseño**: manual publicado en https://claude.ai/artifact/VQA6x7oodMBNng54b5dSYJ, con copia en `sistema-diseno/` y la versión guardada con la etiqueta `v-diseno-2026-11-20`.
   - Neutros cálidos, amarillo escaso, Unbounded y Anonymous Pro.
   - Fondo de pegatinas, emblema de la Puerta de Brandeburgo e iconos Phosphor Fill.
4. **El adviento se retira** y en su lugar queda "Monthly challenges · Coming soon".
5. **Ajustes de color:**
   - Se probó el ocre y se volvió a un lila más apagado.
   - Después, los botones y la selección de planes pasan a ocre.
   - La sección de planes lleva fondo lila suave y los chips de barrio van en color.
6. **Detalles:**
   - "Explore the city".
   - Botones de acción con esquina de 16 px.
   - Dado en los "Surprise me" y check en "Mark as done".
   - Taza en el pie.
   - Tienda fija junto al cuarto.
   - Cabecera del juego más ancha.
7. **Sincronización con Supabase** (`cc20098`): inicio de sesión por email, planes y partida en la nube y álbum en un almacén privado. El código está listo, pero falta conectar la cuenta.

### Pendiente para la próxima sesión

- Base de datos y cuenta en Supabase: pasos en el README.
- Sistema de monedas.
- Añadir información a la base de datos.
- Poner al día el manual con los últimos cambios de color.
