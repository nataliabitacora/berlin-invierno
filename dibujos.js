// Dibujos en línea negra, los mismos del mural de la portada (patron.svg).
// Cada dibujo ocupa una caja de 80x80. Las partes rellenas usan "currentColor"
// y el resto el color de --relleno, así se pueden invertir (blanco sobre negro).
const DIBUJOS = {
  torre: `
    <line x1="40" y1="6" x2="40" y2="20"/>
    <path d="M36 74 L37 40 H43 L44 74 Z"/>
    <path d="M28 74 H52"/>
    <circle cx="40" cy="30" r="11"/>
    <path d="M29 30 H51" stroke-width="4"/>`,
  copo: `
    <g fill="currentColor">
      <line x1="40" y1="14" x2="40" y2="66"/>
      <line x1="17.5" y1="27" x2="62.5" y2="53"/>
      <line x1="17.5" y1="53" x2="62.5" y2="27"/>
      <circle cx="40" cy="14" r="3.5"/><circle cx="40" cy="66" r="3.5"/>
      <circle cx="17.5" cy="27" r="3.5"/><circle cx="62.5" cy="53" r="3.5"/>
      <circle cx="17.5" cy="53" r="3.5"/><circle cx="62.5" cy="27" r="3.5"/>
    </g>`,
  oso: `
    <circle cx="25" cy="24" r="9"/><circle cx="55" cy="24" r="9"/>
    <circle cx="25" cy="24" r="3.5" fill="currentColor"/><circle cx="55" cy="24" r="3.5" fill="currentColor"/>
    <circle cx="40" cy="44" r="22"/>
    <ellipse cx="40" cy="53" rx="9" ry="7"/>
    <ellipse cx="40" cy="49.5" rx="3.5" ry="2.5" fill="currentColor"/>
    <circle cx="32" cy="40" r="2.5" fill="currentColor" stroke="none"/>
    <circle cx="48" cy="40" r="2.5" fill="currentColor" stroke="none"/>`,
  taza: `
    <path d="M30 24 q-4 -6 0 -12 M40 24 q-4 -6 0 -12" fill="none"/>
    <path d="M52 40 h6 a7 7 0 0 1 0 14 h-6" fill="none"/>
    <rect x="22" y="30" width="30" height="36" rx="5"/>
    <rect x="22" y="44" width="30" height="7" fill="currentColor"/>`,
  arbol: `
    <rect x="36" y="58" width="8" height="12" fill="currentColor"/>
    <path d="M40 8 L58 34 H50 L66 58 H14 L30 34 H22 Z"/>
    <circle cx="34" cy="46" r="3" fill="currentColor"/>
    <circle cx="48" cy="40" r="3" fill="currentColor"/>
    <circle cx="44" cy="52" r="3" fill="currentColor"/>`,
  puerta: `
    <rect x="32" y="12" width="16" height="9" fill="currentColor"/>
    <rect x="16" y="32" width="8" height="34"/><rect x="29" y="32" width="8" height="34"/>
    <rect x="43" y="32" width="8" height="34"/><rect x="56" y="32" width="8" height="34"/>
    <rect x="12" y="21" width="56" height="11"/>
    <path d="M8 67 H72"/>`,
  tranvia: `
    <path d="M40 22 L32 11 H48" fill="none"/>
    <rect x="12" y="22" width="56" height="38" rx="9"/>
    <rect x="19" y="29" width="11" height="12" rx="2"/>
    <rect x="34.5" y="29" width="11" height="12" rx="2"/>
    <rect x="50" y="29" width="11" height="12" rx="2"/>
    <rect x="12" y="47" width="56" height="5" fill="currentColor"/>
    <circle cx="25" cy="62" r="5" fill="currentColor"/>
    <circle cx="55" cy="62" r="5" fill="currentColor"/>`,
  pretzel: `
    <path d="M40 62 C12 62 10 24 28 22 C42 20 46 38 40 46 C34 38 38 20 52 22 C70 24 68 62 40 62 Z" fill="none" stroke-width="5"/>
    <g fill="currentColor" stroke="none">
      <circle cx="26" cy="44" r="1.8"/><circle cx="54" cy="44" r="1.8"/><circle cx="40" cy="57" r="1.8"/>
    </g>`,
  muneco: `
    <circle cx="40" cy="55" r="16"/>
    <circle cx="40" cy="29" r="12"/>
    <rect x="31" y="8" width="18" height="10" fill="currentColor"/>
    <path d="M27 18 H53"/>
    <circle cx="36" cy="27" r="1.8" fill="currentColor" stroke="none"/>
    <circle cx="44" cy="27" r="1.8" fill="currentColor" stroke="none"/>
    <circle cx="40" cy="50" r="2" fill="currentColor" stroke="none"/>
    <circle cx="40" cy="59" r="2" fill="currentColor" stroke="none"/>`
};

function dibujo(nombre, clase = "dibujo") {
  return `<svg class="${clase}" viewBox="0 0 80 80" aria-hidden="true"
    style="fill: var(--relleno, #fff); stroke: currentColor"
    stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${DIBUJOS[nombre]}</svg>`;
}

// Qué dibujo representa cada categoría de lugares.
const DIBUJO_CATEGORIA = {
  "mercado": "arbol",
  "museo": "puerta",
  "aire-libre": "copo",
  "calor": "taza",
  "comida": "pretzel"
};
