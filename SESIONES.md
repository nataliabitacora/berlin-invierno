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
