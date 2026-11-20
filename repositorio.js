// Repositorio: colectivos, centros culturales, lugares y listas de actividades
// que voy encontrando. Para añadir uno nuevo, copia el bloque de ejemplo,
// quítale las barras // y rellénalo. Los campos vacíos se pueden dejar en "".
//
// tipo: "colectivo" | "centro-cultural" | "lugar" | "lista"
const REPOSITORIO = [
  // {
  //   nombre: "Nombre del sitio o de la lista",
  //   tipo: "colectivo",
  //   barrio: "Neukölln",
  //   enlace: "https://...",
  //   nota: "Por qué me interesa o qué tiene de especial.",
  //   fecha: "2026-11-20"   // cuándo lo guardé
  // },
];

const TIPOS_REPOSITORIO = {
  "colectivo": "Collectives",
  "centro-cultural": "Cultural centres",
  "lugar": "Places",
  "lista": "Activity lists"
};

// Qué dibujo representa cada tipo (ver dibujos.js).
const DIBUJO_TIPO = {
  "colectivo": "grupo",
  "centro-cultural": "edificios",
  "lugar": "pin",
  "lista": "lista"
};
