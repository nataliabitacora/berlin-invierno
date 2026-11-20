// ================= Getting Cozy: datos del minijuego =================
// Monedas: se ganan haciendo planes por la ciudad.
const MONEDAS_POR_LUGAR = 10;   // cada lugar marcado como visitado en Planes

// Tienda. "puntos" es lo que suma cada objeto al nivel de cozy del cuarto.
// "colores" indica qué paleta se puede elegir una vez comprado (ver PALETAS).
const TIENDA = [
  { id: "radiador",   nombre: "Radiator",               precio: 20, puntos: 12, desc: "First things first: no more freezing." },
  { id: "lampara",    nombre: "Warm floor lamp",        precio: 20, puntos: 12, desc: "Goodbye, bare white bulb." },
  { id: "cortinas",   nombre: "Curtains",               precio: 10, puntos: 6,  desc: "To watch the snow through softer eyes." },
  { id: "alfombra",   nombre: "Rug",                    precio: 15, puntos: 8,  desc: "So your toes never touch the icy floor.", colores: "alfombra" },
  { id: "ropa",       nombre: "Comfy home clothes",     precio: 15, puntos: 10, desc: "Coat off: chunky jumper, pyjamas and thick socks." },
  { id: "suelo",      nombre: "Wooden floor",           precio: 20, puntos: 8,  desc: "Warm floorboards instead of cold tiles.", colores: "suelo" },
  { id: "pintura",    nombre: "Wall paint",             precio: 25, puntos: 10, desc: "Pick a colour for the room.", colores: "pared" },
  { id: "cama",       nombre: "Bed with a duvet",       precio: 35, puntos: 14, desc: "The best place to spend a January afternoon.", colores: "edredon" },
  { id: "velas",      nombre: "Candles",                precio: 8,  puntos: 5,  desc: "On the windowsill, like in every Berlin flat." },
  { id: "guirnalda",  nombre: "Fairy lights",           precio: 15, puntos: 8,  desc: "Colourful light from wall to wall." },
  { id: "estanteria", nombre: "Bookshelf",              precio: 25, puntos: 8,  desc: "Reading for when it gets dark at four." },
  { id: "mesita",     nombre: "Side table with tea",    precio: 15, puntos: 7,  desc: "Always with a steaming mug." },
  { id: "sillon",     nombre: "Armchair",               precio: 30, puntos: 10, desc: "Made for sinking into.", colores: "sillon" },
  { id: "cuadro",     nombre: "Painting",               precio: 12, puntos: 5,  desc: "A summer landscape to get through winter." },
  { id: "planta",     nombre: "Hanging plant",          precio: 10, puntos: 5,  desc: "Something green to survive February." },
  { id: "gato",       nombre: "Cat",                    precio: 40, puntos: 12, desc: "Purring included." }
];

// Logros: al cumplirse, regalan un objeto especial para el cuarto.
// "cumple" recibe { visitados: [lugares visitados] }.
const completa = (cat) => (c) => {
  const grupo = LUGARES.filter((l) => l.categoria === cat);
  return grupo.length > 0 && grupo.every((l) => c.visitados.includes(l));
};

const LOGROS = [
  { id: "primer-plan", nombre: "First plan", pista: "Visit your first place.",
    objeto: "postal", objNombre: "Berlin postcard", puntos: 3, cumple: (c) => c.visitados.length >= 1 },
  { id: "seis-planes", nombre: "Halfway through winter", pista: "Visit 6 places.",
    objeto: "peluche", objNombre: "Teddy bear", puntos: 5, cumple: (c) => c.visitados.length >= 6 },
  { id: "todos", nombre: "Berlin, done", pista: "Visit every place in the guide.",
    objeto: "banderin", objNombre: "Berlin bunting", puntos: 6, cumple: (c) => c.visitados.length === LUGARES.length },
  { id: "history", nombre: "History buff", pista: "Do every plan in History.",
    objeto: "muro", objNombre: "Piece of the Wall", puntos: 6, cumple: completa("history") },
  { id: "arts-culture", nombre: "Museum mouse", pista: "Do every plan in Arts & Culture.",
    objeto: "poster", objNombre: "Film poster", puntos: 5, cumple: completa("arts-culture") },
  { id: "wander", nombre: "Flâneur", pista: "Do every plan in Wander.",
    objeto: "mapa", objNombre: "Map of Berlin", puntos: 5, cumple: completa("wander") },
  { id: "parties", nombre: "Until sunrise", pista: "Do every plan in Parties.",
    objeto: "bola", objNombre: "Disco ball", puntos: 6, cumple: completa("parties") },
  { id: "cozy-coffee", nombre: "Caffeinated", pista: "Do every plan in Cozy Coffee.",
    objeto: "moka", objNombre: "Steaming moka pot", puntos: 5, cumple: completa("cozy-coffee") },
  { id: "christmas-markets", nombre: "Christmas spirit", pista: "Do every plan in Christmas Markets.",
    objeto: "estrella", objNombre: "Paper star", puntos: 6, cumple: completa("christmas-markets") },
  { id: "berliner-101", nombre: "True Berliner", pista: "Do every plan in Berliner 101.",
    objeto: "ampelmann", objNombre: "Traffic-light lamp", puntos: 5, cumple: completa("berliner-101") }
];

// Colores que se pueden elegir.
const PALETAS = {
  pared:    [["Cream", "#f1dfbd"], ["Peach", "#e9b99c"], ["Sage", "#b8c7a3"], ["Lavender", "#c6b6d6"],
             ["Terracotta", "#d9785a"], ["Turquoise", "#6fb7b0"], ["Yellow", "#f2cf6b"], ["Pink", "#f0a8b8"], ["Midnight blue", "#3f5578"]],
  suelo:    [["Oak", "#b9875a"], ["Walnut", "#7a5236"], ["Pine", "#d9b98c"], ["Ash", "#a39a8f"]],
  alfombra: [["Red", "#b8433a"], ["Mustard", "#d4a237"], ["Green", "#5d8a5a"], ["Blue", "#4a6a9a"]],
  edredon:  [["Mustard", "#d4a237"], ["Pink", "#d98a9a"], ["Green", "#5d8a5a"], ["Blue", "#4a6a9a"]],
  sillon:   [["Rust", "#a8573e"], ["Green", "#4f7a5a"], ["Blue", "#3f5f8a"], ["Mustard", "#c7962e"]]
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

// Visible labels for the avatar options (the keys above are used internally to draw it).
const ETIQUETAS_AVATAR = {
  "Femenina": "Feminine", "Masculina": "Masculine",
  "Media melena": "Bob", "Largo": "Long", "Moño": "Bun",
  "Corto": "Short", "Rapado": "Buzz cut", "Con barba": "Beard"
};

// Lo que dice el avatar según lo acogedor que esté el cuarto.
const FRASES = [
  ["Brrr… it's freezing in here.", "I'm still wearing my coat. Where are my thick socks?", "White walls, white light, snow outside. I need plans.", "Shall we go out and earn some coins?"],
  ["This is starting to feel like home.", "A bit more and I won't miss summer at all.", "What shall we buy next?"],
  ["I'm not leaving this room until March.", "This is pure Gemütlichkeit.", "Let it snow as much as it likes."]
];
