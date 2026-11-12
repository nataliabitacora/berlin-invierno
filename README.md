# Berlín en invierno

Web para descubrir Berlín cuando hace frío: mercados navideños, museos, paseos nevados, sitios para entrar en calor y comida típica. Incluye un calendario de adviento con una misión por Berlín para cada día del 1 al 24 de diciembre.

## Cómo abrirla

Publicada con GitHub Pages: https://nataliabitacora.github.io/berlin-invierno/

Cada vez que se sube un cambio a la rama `main`, la web se actualiza sola en uno o dos minutos.

En local no necesita instalar nada. Abre `index.html` en el navegador:

```bash
open index.html
```

## Archivos

- `index.html`: estructura de la página
- `style.css`: estilos (blanco y negro con ilustraciones en línea)
- `patron.svg`: mural de dibujos de Berlín de la portada
- `dibujos.js`: los mismos dibujos, reutilizables en toda la web
- `lugares.js`: datos de cada lugar (edítalo para añadir más)
- `app.js`: contadores por categoría, lista de lugares y "Próximo plan"
- `adviento.js`: calendario de adviento, misiones y árbol
- `SESIONES.md`: diario de lo hecho en cada sesión con Claude Code

El progreso (lugares visitados y adornos del árbol) se guarda solo en el navegador.
