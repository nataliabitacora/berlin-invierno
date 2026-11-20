// ================= Getting Cozy: datos del minijuego =================
// Monedas: se ganan haciendo planes por la ciudad.
const MONEDAS_POR_LUGAR = 10;   // cada lugar marcado como visitado en Planes
const MONEDAS_POR_MISION = 5;   // cada misión cumplida del calendario de adviento

// Tienda. "puntos" es lo que suma cada objeto al nivel de cozy del cuarto.
// "colores" indica qué paleta se puede elegir una vez comprado (ver PALETAS).
const TIENDA = [
  { id: "radiador",   nombre: "Radiador",               precio: 20, puntos: 12, desc: "Lo primero: que deje de hacer frío." },
  { id: "lampara",    nombre: "Lámpara de luz cálida",  precio: 20, puntos: 12, desc: "Adiós a la bombilla blanca del techo." },
  { id: "cortinas",   nombre: "Cortinas",               precio: 10, puntos: 6,  desc: "Para mirar la nieve con otros ojos." },
  { id: "alfombra",   nombre: "Alfombra",               precio: 15, puntos: 8,  desc: "Para no pisar el suelo helado.", colores: "alfombra" },
  { id: "ropa",       nombre: "Ropa de estar por casa", precio: 15, puntos: 10, desc: "Fuera el abrigo: jersey gordo, pijama y calcetines." },
  { id: "suelo",      nombre: "Suelo de madera",        precio: 20, puntos: 8,  desc: "Tarima cálida en lugar de baldosa fría.", colores: "suelo" },
  { id: "pintura",    nombre: "Pintura para las paredes", precio: 25, puntos: 10, desc: "Elige el color de tu cuarto.", colores: "pared" },
  { id: "cama",       nombre: "Cama con edredón",       precio: 35, puntos: 14, desc: "El mejor sitio para las tardes de enero.", colores: "edredon" },
  { id: "velas",      nombre: "Velas",                  precio: 8,  puntos: 5,  desc: "En la ventana, como en las casas berlinesas." },
  { id: "guirnalda",  nombre: "Guirnalda de luces",     precio: 15, puntos: 8,  desc: "Luz de colores de pared a pared." },
  { id: "estanteria", nombre: "Estantería con libros",  precio: 25, puntos: 8,  desc: "Lecturas para cuando anochece a las cuatro." },
  { id: "mesita",     nombre: "Mesita con té",          precio: 15, puntos: 7,  desc: "Siempre con una taza humeante." },
  { id: "sillon",     nombre: "Sillón",                 precio: 30, puntos: 10, desc: "Para hundirse en él.", colores: "sillon" },
  { id: "cuadro",     nombre: "Cuadro",                 precio: 12, puntos: 5,  desc: "Un paisaje de verano para el invierno." },
  { id: "planta",     nombre: "Planta colgante",        precio: 10, puntos: 5,  desc: "Algo verde que sobreviva a febrero." },
  { id: "gato",       nombre: "Gato",                   precio: 40, puntos: 12, desc: "Incluye ronroneo." }
];

// Logros: al cumplirse, regalan un objeto especial para el cuarto.
// "cumple" recibe { visitados: [lugares visitados], cumplidas: [días de adviento] }.
const completa = (cat) => (c) => {
  const grupo = LUGARES.filter((l) => l.categoria === cat);
  return grupo.length > 0 && grupo.every((l) => c.visitados.includes(l));
};

const LOGROS = [
  { id: "primer-plan", nombre: "Primer plan", pista: "Visita tu primer lugar.",
    objeto: "postal", objNombre: "Postal de Berlín", puntos: 3, cumple: (c) => c.visitados.length >= 1 },
  { id: "seis-planes", nombre: "Medio invierno", pista: "Visita 6 lugares.",
    objeto: "peluche", objNombre: "Oso de peluche", puntos: 5, cumple: (c) => c.visitados.length >= 6 },
  { id: "todos", nombre: "Berlín, completado", pista: "Visita todos los lugares de la guía.",
    objeto: "banderin", objNombre: "Banderín de Berlín", puntos: 6, cumple: (c) => c.visitados.length === LUGARES.length },
  { id: "history", nombre: "Historiadora", pista: "Completa la categoría History.",
    objeto: "muro", objNombre: "Trozo del Muro", puntos: 6, cumple: completa("history") },
  { id: "arts-culture", nombre: "Ratón de museo", pista: "Completa la categoría Arts & Culture.",
    objeto: "poster", objNombre: "Póster de cine", puntos: 5, cumple: completa("arts-culture") },
  { id: "wander", nombre: "Paseante", pista: "Completa la categoría Wander.",
    objeto: "mapa", objNombre: "Mapa de Berlín", puntos: 5, cumple: completa("wander") },
  { id: "parties", nombre: "Hasta el amanecer", pista: "Completa la categoría Parties.",
    objeto: "bola", objNombre: "Bola de discoteca", puntos: 6, cumple: completa("parties") },
  { id: "cozy-coffee", nombre: "Cafeína", pista: "Completa la categoría Cozy Coffee.",
    objeto: "moka", objNombre: "Cafetera humeante", puntos: 5, cumple: completa("cozy-coffee") },
  { id: "christmas-markets", nombre: "Espíritu navideño", pista: "Completa la categoría Christmas Markets.",
    objeto: "estrella", objNombre: "Estrella de papel", puntos: 6, cumple: completa("christmas-markets") },
  { id: "berliner-101", nombre: "Berlinesa de verdad", pista: "Completa la categoría Berliner 101.",
    objeto: "ampelmann", objNombre: "Lámpara de semáforo", puntos: 5, cumple: completa("berliner-101") },
  { id: "adviento", nombre: "Adviento completo", pista: "Cumple las 24 misiones del calendario de adviento.",
    objeto: "arbol", objNombre: "Árbol de Navidad", puntos: 10, cumple: (c) => c.cumplidas.length >= 24 }
];

// Colores que se pueden elegir.
const PALETAS = {
  pared:    [["Crema", "#f1dfbd"], ["Melocotón", "#e9b99c"], ["Salvia", "#b8c7a3"], ["Lavanda", "#c6b6d6"],
             ["Terracota", "#d9785a"], ["Turquesa", "#6fb7b0"], ["Amarillo", "#f2cf6b"], ["Rosa", "#f0a8b8"], ["Azul noche", "#3f5578"]],
  suelo:    [["Roble", "#b9875a"], ["Nogal", "#7a5236"], ["Pino", "#d9b98c"], ["Ceniza", "#a39a8f"]],
  alfombra: [["Rojo", "#b8433a"], ["Mostaza", "#d4a237"], ["Verde", "#5d8a5a"], ["Azul", "#4a6a9a"]],
  edredon:  [["Mostaza", "#d4a237"], ["Rosa", "#d98a9a"], ["Verde", "#5d8a5a"], ["Azul", "#4a6a9a"]],
  sillon:   [["Teja", "#a8573e"], ["Verde", "#4f7a5a"], ["Azul", "#3f5f8a"], ["Mostaza", "#c7962e"]]
};

// Avatar: opciones del editor.
const AVATAR = {
  piel:    ["#f6d3b8", "#e8b48f", "#c68a5e", "#8d5a3b"],
  pelo:    ["#2b211c", "#6b4226", "#c58b3c", "#e3c27a", "#a8432f"],
  estetica: ["Femenina", "Masculina"],
  // Peinados de cada estética (el mismo número en las dos).
  peinados: {
    Femenina: ["Media melena", "Largo", "Moño"],
    Masculina: ["Corto", "Rapado", "Con barba"]
  },
  jersey:  ["#c0453a", "#3f6e9e", "#5c8a4e", "#d8a23a", "#7a5a9a"]
};

// Lo que dice el avatar según lo acogedor que esté el cuarto.
const FRASES = [
  ["Brrr… aquí hace un frío que pela.", "Todavía llevo el abrigo puesto. ¿Dónde están mis calcetines gordos?", "Paredes blancas, luz blanca, nieve fuera. Necesito planes.", "¿Salimos a ganar monedas?"],
  ["Esto empieza a parecer un hogar.", "Un poco más y no echo de menos el verano.", "¿Qué compramos ahora?"],
  ["No pienso salir de aquí hasta marzo.", "Esto es Gemütlichkeit pura.", "Que nieve todo lo que quiera."]
];
