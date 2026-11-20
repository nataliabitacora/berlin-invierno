# Berlin in Winter

Sistema de diseño de la guía de invierno en Berlín: planes por la ciudad, un calendario de adviento y Getting Cozy, el minijuego de la habitación. La web nace en blanco y negro con ilustraciones de línea gruesa; este sistema le añade dos colores sin perder esa firma.

## La idea

Una ciudad en invierno: nieve y papel cálido (los neutros), el cielo lila del atardecer de las cuatro (el color con el que se interactúa) y, muy de vez en cuando, la luz amarilla de una farola (la acción). La tinta del dibujo lo sostiene todo.

## Paleta

| Token | Valor | Papel |
| --- | --- | --- |
| `cream` | #fff4d6 | Neutro principal. Fondo de página. |
| `snow` | #fffaee | Neutro claro, diseñado para esta paleta. Tarjetas, paneles, filas, menú. |
| `lilac` | #c8b7eb | Secundario y color de interacción: todo lo seleccionado, lo hecho, el juego. |
| `sun` | #ffe223 | Principal, de uso escaso: unos pocos botones de acción. |
| `ink` | #1b1726 | Tinta con un punto violeta. Trazos y texto. |

### Lo que se ve en pantalla

- **Todo son neutros.** Fondo `cream`, tarjetas y paneles `snow`, huecos `surface-sunken`. **El blanco #ffffff no se usa en ningún sitio**: ni en tarjetas, ni en botones, ni en campos de texto.
- **El lila es el color de la interacción.** Categoría activa, pestaña activa, fila seleccionada, página actual del menú, etiquetas de estado y todo el juego. Con `lilac-soft` para lo hecho y los avisos.
- **El amarillo es un detalle.** Solo rellena unos pocos botones de acción, como mucho uno por pantalla y en muchas ninguno: "Surprise me" en la portada, "Mark as done" en el panel del plan y "Buy" en la tienda cuando alcanzan las monedas. Nada de fondos, selecciones, etiquetas, iconos ni texto amarillos.

### Proporción

- **≈85 %** neutros (`cream`, `snow`, `surface-sunken`).
- **≈12 %** tinta: trazos de 2,5 px, texto, ilustración.
- **≈3 %** lila, y el amarillo en uno o dos botones: si se ve más de un amarillo a la vez, sobra uno.

### Reglas de color

- **Texto siempre en `text`** (tinta), también sobre lila (9,6:1) y amarillo (13,5:1). Lila como texto o enlace: `lilac-text`.
- **Todo relleno de color va con trazo de tinta.** Sobre los neutros, el lila solo da 1,7:1 y el amarillo 1,2:1: sin trazo desaparecen.
- **Amarillo y lila nunca en el mismo elemento.**
- **El pixel art del juego** tiene su propia paleta (los colores de los objetos); el marco que lo rodea sigue este sistema.

### Por qué estos neutros

`cream` (#fff4d6) como fondo da calidez sin amarillear la página ahora que el amarillo apenas aparece. `snow` (#fffaee) es el sustituto del blanco: más claro que el crema para que las tarjetas se lean como papel encima del fondo, pero con el mismo calor. Entre los dos solo hay 1,05:1, por eso las tarjetas siempre llevan su trazo.

**La tinta es violeta.** Un negro puro junto al lila queda frío; #1b1726 tiene un punto del lila y lo une todo.

### Tema oscuro

La noche (#17141f) como fondo y #221e2d para las tarjetas; el crema pasa a ser el texto y el trazo. El lila sigue siendo la interacción (9,9:1 sobre la noche) y la sombra dura de lo seleccionado pasa a lila.

## Tipografía

Dirección: underground y brutalista, como Berlín. Letra muy ancha y pesada para gritar poco y bien (títulos y números), y texto sobrio y legible para todo lo demás.

- **Unbounded** (`display`), pesos 600–800: títulos de sección en MAYÚSCULAS y todos los números (contadores, monedas, días, insignias). Muy ancha: frases cortas, nada de párrafos.
- **Anonymous Pro** (`sans` y `mono`): todo el texto, los controles, los nombres de los planes y las etiquetas en mayúsculas. Monoespaciada, con aire de máquina de escribir y fanzine; una sola familia para texto y etiquetas.

### Escala

| Estilo | Familia | Tamaño / interlínea | Peso | Dónde |
| --- | --- | --- | --- | --- |
| `display-xl` | Unbounded | 52 / 1 | 800 | Titular de la portada, en mayúsculas. Uno por página. |
| `display-l` | Unbounded | 36 / 1,05 | 800 | Títulos de sección, en mayúsculas ("YOUR BERLIN WINTER"). |
| `title` | Unbounded | 20 / 1,2 | 700 | Título del plan seleccionado y de los paneles. |
| `number-xl` | Unbounded | 32 / 1 | 700 | Contadores de categoría, monedas, días del adviento. |
| `number` | Unbounded | 14 / 1 | 600 | Números en insignias y pestañas. |
| `body` | Anonymous Pro | 17 / 1,5 | 400 | Texto corrido, hasta unos 65 caracteres por línea. |
| `body-strong` | Anonymous Pro | 16 / 1,4 | 700 | Nombres de los planes en listas y botones. |
| `small` | Anonymous Pro | 14 / 1,45 | 400 | Barrios, notas, pies. |
| `label` | Anonymous Pro | 12 / 1,3 | 500 | Etiquetas en mayúsculas con 0,1 em, antetítulos, fechas cortas. |

### Reglas

- **Unbounded solo en frases cortas.** Es muy ancha: un título de más de cuatro o cinco palabras se parte en demasiadas líneas. Nunca para párrafos ni para nombres de planes.
- **Mayúsculas en los títulos de sección y en la portada**; el título del panel puede ir en mayúsculas y minúsculas.
- **Todos los números en Unbounded**, también los pequeños, para que las cifras se reconozcan como un mismo sistema en toda la web.
- **Dos familias y no más**: Unbounded para títulos y números, Anonymous Pro para todo lo demás.

### Por qué estas fuentes

**Por qué no Horizon.** Era la primera elección, pero su Y es idéntica a su 4 ("YOUR" se lee "4OUR", "COZY" se lee "COZ4") y no tiene acentos ni ß, que la web necesita (Glühwein, Oberbaumbrücke).

**Por qué Unbounded y no Syncopate.** Las dos son anchas, completas y están en Google Fonts. Unbounded gana porque:

- tiene pesos del 200 al 900, así sirve igual para un titular de portada que para un contador pequeño (Syncopate solo tiene 400 y 700);
- tiene minúsculas de verdad, por si un título las necesita (Syncopate convierte las minúsculas en versalitas);
- sus números son más rotundos, que es justo donde más se va a ver.

## Forma

- **Trazo**: 2,5 px (`stroke`) en tarjetas, paneles, botones y menú; 2 px (`stroke-thin`) en filas y chips. El trazo es la firma: sin él, el amarillo desaparece.
- **Esquinas**: cápsula para todo lo que se pulsa (`radius-pill`); 16 px para filas y tarjetas pequeñas; 26 px para paneles.
- **Sombras**: `shadow-pop` (sombra dura desplazada) para lo seleccionado, junto al lila, una por vista; `shadow-soft` para lo que flota.
- **Espaciado**: base de 4 px; los saltos que se usan son 8, 12, 16, 24, 32, 48 y 64.

## Emblema

La Puerta de Brandeburgo en silueta maciza de tinta, con un copo de nieve sobre su pedestal en lugar de la cuadriga: Berlín en invierno en una sola forma.

- **Silueta**: ático escalonado, entablamento, seis columnas con capitel y basa (el paso central más ancho, como en el original) y zócalo. Solo rectángulos: geometría dura, sin curvas.
- **Copo**: seis brazos con una pareja de ramas cada uno, trazo grueso y puntas cuadradas.
- **Tinta**: silueta maciza, completamente negra (`ink`), sin desgaste ni texturas. Lleva detrás una copia en `lilac` desplazada unos píxeles hacia abajo y a la derecha, como una risografía mal registrada.
- **Uso**: encabeza la tarjeta de la portada, a 150 px de ancho. Siempre sobre `snow` o `cream`; nunca sobre el fondo de pegatinas ni en color.
- **El oso** deja de ser el emblema: solo queda como icono de la categoría Berliner 101 y en el aviso del repositorio vacío.

## Fondo

Una pared de pegatinas: collage de formas abstractas inclinadas que se pisan unas a otras, inspirado en las puertas forradas de pegatinas, el stencil y los carteles de Berlín. Nunca objetos reconocibles (osos, torres, tazas): solo formas.

- **Dónde**: portada, cabeceras de las páginas, franja superior del panel del plan, diálogos y pie. Nunca detrás de texto corrido: el texto va siempre sobre una tarjeta `snow`.
- **Formas** (17): círculo, anillo, hexágono, triángulo, rombo, cruz, estrella, estallido, círculo festoneado, arco, ticket con muescas, trapecio, onda, medio círculo, rectángulo y píldoras horizontal y vertical. Interiores: franjas de colores, damero, trama de puntos, rayas, filas de puntos que menguan.
- **Color**: la paleta de la calle (lila, rosa, verde, azul, óxido, amarillo, aguamarina, rosa viejo, oliva) apagada un 32 % hacia `cream`, para que trabaje de fondo. Estos colores viven solo aquí: nunca en botones, texto ni selección.
- **Trazo y sombra**: tinta suavizada, trazo de 2,2 px y sombra dura de 3 px, más finos que los de la interfaz.
- **Textura**: grano de pared muy suave sobre todo el fondo.
- **Archivo**: `fondo.svg`, una tesela de 480 px que se repite sin costuras; en pantalla a 300–360 px.

## Iconos

Iconos macizos del set **Phosphor Icons**, estilo *Fill* (licencia MIT): formas rellenas con esquinas suaves, en el color del texto (`text`), sin trazo ni sombra.

- **Tamaño**: pequeños y al servicio del texto: 18–22 px en tarjetas, filas, filtros y botones; 28 px en tarjetas del repositorio; 44 px solo en avisos vacíos y dentro del círculo del diálogo del adviento.
- **Regla**: el texto manda. En las tarjetas de categoría el nombre va en negrita y más grande que el icono.
- **Categorías**: History → *bank*, Arts & Culture → *palette*, Wander → *footprints*, Parties → *disco-ball*, Cozy Coffee → *coffee*, Christmas Markets → *tree-evergreen*, Berliner 101 → *paw-print*.
- **Otros**: *dice-five* (Surprise me), *funnel* (filtro), *calendar-blank* (fechas), *users-three*, *buildings*, *map-pin*, *list-checks* (repositorio) y, en el adviento, *snowflake*, *binoculars*, *bread*, *tram*, *person-simple-ski*.
- Nunca se mezclan con iconos de línea ni con otros sets.

## Voz

Invitaciones en primera persona del plural, sin "you" en los textos de categoría: "Let's try them all", "A new chapter where we let art and culture all the way in". Frases cortas, inglés británico, sin exclamaciones salvo celebraciones ("Mission accomplished!").

## Cómo aplicarlo a la web

1. Sustituir las variables de `style.css` (`--papel`, `--tinta`, `--blanco`, `--gris`…) por estos tokens; el fondo pasa a `cream` y todo lo que hoy es blanco pasa a `snow`.
2. Selección en lila: categoría activa, pestañas, fila seleccionada, menú, filtros activos.
3. Lo hecho en lila suave: fila y etiqueta "Done".
4. El amarillo solo en "Surprise me", "Mark as done" y el botón de comprar de la tienda.
5. Los botones negros de hoy pasan a neutros (snow con trazo) o a lila si son del juego.
