// Datos de los lugares. Para añadir uno nuevo, copia un bloque { ... } y edítalo.
// categoria: "history" | "arts-culture" | "wander" | "parties" | "cozy-coffee" | "christmas-markets" | "berliner-101"
const LUGARES = [
  {
    nombre: "Mercado navideño del Palacio de Charlottenburg",
    categoria: "christmas-markets",
    barrio: "Charlottenburg",
    descripcion: "Puestos iluminados frente a un palacio barroco. Ideal al anochecer con un Glühwein (vino caliente).",
    consejo: "Abre del 23 de noviembre al 27 de diciembre (cerrado el 24). Ve entre semana para evitar las multitudes."
  },
  {
    nombre: "Lucia Weihnachtsmarkt (Kulturbrauerei)",
    categoria: "christmas-markets",
    barrio: "Prenzlauer Berg",
    descripcion: "Mercado de inspiración escandinava dentro de una antigua fábrica de cerveza de ladrillo rojo.",
    consejo: "Abre del 23 de noviembre al 22 de diciembre, entre semana desde las 15:00. Prueba el Glögg, la versión nórdica del vino caliente."
  },
  {
    nombre: "Isla de los Museos",
    categoria: "arts-culture",
    barrio: "Mitte",
    descripcion: "Cinco museos en una isla del río Spree. En el Neues Museum está el busto de Nefertiti.",
    consejo: "El Pergamonmuseum sigue cerrado por obras hasta 2027; el Neues Museum, el Altes Museum y el Bode-Museum sí abren."
  },
  {
    nombre: "Cúpula del Reichstag",
    categoria: "history",
    barrio: "Mitte",
    descripcion: "Cúpula de cristal con vistas a la ciudad. Gratis y con audioguía.",
    consejo: "Es gratis, pero hay que reservar online con antelación en bundestag.de y llevar documento de identidad."
  },
  {
    nombre: "Teufelsberg",
    categoria: "history",
    barrio: "Grunewald",
    descripcion: "Colina con una antigua estación de escucha de la Guerra Fría, hoy llena de grafitis. Con nieve es espectacular.",
    consejo: "Lleva calzado que agarre: el camino se hiela."
  },
  {
    nombre: "East Side Gallery",
    categoria: "history",
    barrio: "Friedrichshain",
    descripcion: "El tramo más largo que queda del Muro de Berlín, cubierto de murales.",
    consejo: "Recórrela con luz de día; en invierno anochece hacia las 16:00."
  },
  {
    nombre: "Paseo invernal por el Tiergarten",
    categoria: "wander",
    barrio: "Tiergarten",
    descripcion: "El gran parque de Berlín, silencioso y blanco en invierno. Termina en la Puerta de Brandeburgo.",
    consejo: "Si los lagos se congelan, no pises el hielo salvo que esté permitido."
  },
  {
    nombre: "Liquidrom",
    categoria: "cozy-coffee",
    barrio: "Kreuzberg",
    descripcion: "Baño termal con piscina de agua salada, música bajo el agua y saunas.",
    consejo: "Perfecto para recuperarse tras un día de frío."
  },
  {
    nombre: "Pista de patinaje en Alexanderplatz",
    categoria: "christmas-markets",
    barrio: "Mitte",
    descripcion: "Pista de hielo al aire libre durante la temporada navideña, rodeada de puestos.",
    consejo: "Comprueba antes si este año hay pista: en 2026 el mercado de Alexanderplatz anuncia solo pista de curling bávaro (Eisstock)."
  },
  {
    nombre: "Markthalle Neun",
    categoria: "cozy-coffee",
    barrio: "Kreuzberg",
    descripcion: "Mercado cubierto de 1891. Los jueves de 17:00 a 22:00 hay Street Food Thursday.",
    consejo: "Un sitio caliente para comer algo cuando aprieta el frío."
  },
  {
    nombre: "Currywurst en un Imbiss",
    categoria: "berliner-101",
    barrio: "Toda la ciudad",
    descripcion: "Salchicha con salsa de curry y kétchup: el clásico callejero de Berlín.",
    consejo: "Pídela 'mit Pommes' (con patatas fritas)."
  },
  {
    nombre: "Berlinale",
    categoria: "arts-culture",
    barrio: "Potsdamer Platz",
    descripcion: "Festival internacional de cine. En 2027 se celebra del 10 al 21 de febrero y hay entradas para el público.",
    consejo: "Las entradas salen a la venta pocos días antes de cada pase y vuelan. El 20 y 21 de febrero son días del público, con entradas más baratas."
  }
];

const CATEGORIAS = {
  "history": "History",
  "arts-culture": "Arts & Culture",
  "wander": "Wander",
  "parties": "Parties",
  "cozy-coffee": "Cozy Coffee",
  "christmas-markets": "Christmas Markets",
  "berliner-101": "Berliner 101"
};
