// Datos de los lugares. Para añadir uno nuevo, copia un bloque { ... } y edítalo.
// categoria: "mercado" | "museo" | "aire-libre" | "calor" | "comida"
const LUGARES = [
  {
    nombre: "Mercado navideño del Palacio de Charlottenburg",
    categoria: "mercado",
    barrio: "Charlottenburg",
    descripcion: "Puestos iluminados frente a un palacio barroco. Ideal al anochecer con un Glühwein (vino caliente).",
    consejo: "Ve entre semana para evitar las multitudes."
  },
  {
    nombre: "Lucia Weihnachtsmarkt (Kulturbrauerei)",
    categoria: "mercado",
    barrio: "Prenzlauer Berg",
    descripcion: "Mercado de inspiración escandinava dentro de una antigua fábrica de cerveza de ladrillo rojo.",
    consejo: "Prueba el Glögg, la versión nórdica del vino caliente."
  },
  {
    nombre: "Isla de los Museos",
    categoria: "museo",
    barrio: "Mitte",
    descripcion: "Cinco museos en una isla del río Spree. En el Neues Museum está el busto de Nefertiti.",
    consejo: "Comprueba qué salas están abiertas: algunos edificios están en obras."
  },
  {
    nombre: "Cúpula del Reichstag",
    categoria: "museo",
    barrio: "Mitte",
    descripcion: "Cúpula de cristal con vistas a la ciudad. Gratis y con audioguía.",
    consejo: "Hay que reservar online con antelación."
  },
  {
    nombre: "Teufelsberg",
    categoria: "aire-libre",
    barrio: "Grunewald",
    descripcion: "Colina con una antigua estación de escucha de la Guerra Fría, hoy llena de grafitis. Con nieve es espectacular.",
    consejo: "Lleva calzado que agarre: el camino se hiela."
  },
  {
    nombre: "East Side Gallery",
    categoria: "aire-libre",
    barrio: "Friedrichshain",
    descripcion: "El tramo más largo que queda del Muro de Berlín, cubierto de murales.",
    consejo: "Recórrela con luz de día; en invierno anochece hacia las 16:00."
  },
  {
    nombre: "Paseo invernal por el Tiergarten",
    categoria: "aire-libre",
    barrio: "Tiergarten",
    descripcion: "El gran parque de Berlín, silencioso y blanco en invierno. Termina en la Puerta de Brandeburgo.",
    consejo: "Si los lagos se congelan, no pises el hielo salvo que esté permitido."
  },
  {
    nombre: "Liquidrom",
    categoria: "calor",
    barrio: "Kreuzberg",
    descripcion: "Baño termal con piscina de agua salada, música bajo el agua y saunas.",
    consejo: "Perfecto para recuperarse tras un día de frío."
  },
  {
    nombre: "Pista de patinaje en Alexanderplatz",
    categoria: "calor",
    barrio: "Mitte",
    descripcion: "Pista de hielo al aire libre durante la temporada navideña, rodeada de puestos.",
    consejo: "Se pueden alquilar patines allí mismo."
  },
  {
    nombre: "Markthalle Neun",
    categoria: "comida",
    barrio: "Kreuzberg",
    descripcion: "Mercado cubierto de 1891. Los jueves por la tarde hay Street Food Thursday.",
    consejo: "Un sitio caliente para comer algo cuando aprieta el frío."
  },
  {
    nombre: "Currywurst en un Imbiss",
    categoria: "comida",
    barrio: "Toda la ciudad",
    descripcion: "Salchicha con salsa de curry y kétchup: el clásico callejero de Berlín.",
    consejo: "Pídela 'mit Pommes' (con patatas fritas)."
  },
  {
    nombre: "Berlinale",
    categoria: "museo",
    barrio: "Potsdamer Platz",
    descripcion: "Festival internacional de cine que se celebra cada febrero. Hay entradas para el público.",
    consejo: "Las entradas salen a la venta pocos días antes de cada pase y vuelan."
  }
];

const CATEGORIAS = {
  "mercado": "🎄 Mercados navideños",
  "museo": "🏛️ Cultura",
  "aire-libre": "❄️ Al aire libre",
  "calor": "♨️ Para entrar en calor",
  "comida": "🥨 Comida"
};
