// Places data (shown in English). To add one, copy a { ... } block and edit it.
// categoria: "history" | "arts-culture" | "wander" | "parties" | "cozy-coffee" | "christmas-markets" | "berliner-101"
const LUGARES = [
  {
    nombre: "Charlottenburg Palace Christmas Market",
    categoria: "christmas-markets",
    barrio: "Charlottenburg",
    descripcion: "Twinkling stalls in front of a baroque palace. Best at dusk with a Glühwein (mulled wine).",
    consejo: "Open 23 November to 27 December (closed on the 24th). Go on a weekday to avoid the crowds."
  },
  {
    nombre: "Lucia Christmas Market (Kulturbrauerei)",
    categoria: "christmas-markets",
    barrio: "Prenzlauer Berg",
    descripcion: "A Scandinavian-inspired market inside a former red-brick brewery.",
    consejo: "Open 23 November to 22 December, from 3 pm on weekdays. Try Glögg, the Nordic take on mulled wine."
  },
  {
    nombre: "Museum Island",
    categoria: "arts-culture",
    barrio: "Mitte",
    descripcion: "Five museums on an island in the River Spree. The bust of Nefertiti lives in the Neues Museum.",
    consejo: "The Pergamonmuseum is closed for renovation until 2027; the Neues Museum, Altes Museum and Bode-Museum are open."
  },
  {
    nombre: "Reichstag Dome",
    categoria: "history",
    barrio: "Mitte",
    descripcion: "A glass dome with views over the city. Free, with an audio guide.",
    consejo: "Entry is free, but you need to book online in advance at bundestag.de and bring photo ID."
  },
  {
    nombre: "Teufelsberg",
    categoria: "history",
    barrio: "Grunewald",
    descripcion: "A hill topped by a former Cold War listening station, now covered in graffiti. Spectacular in the snow.",
    consejo: "Wear shoes with good grip: the path gets icy."
  },
  {
    nombre: "East Side Gallery",
    categoria: "history",
    barrio: "Friedrichshain",
    descripcion: "The longest surviving stretch of the Berlin Wall, covered in murals.",
    consejo: "Walk it in daylight; in winter it gets dark around 4 pm."
  },
  {
    nombre: "Winter walk through the Tiergarten",
    categoria: "wander",
    barrio: "Tiergarten",
    descripcion: "Berlin's great park, quiet and white in winter. It ends at the Brandenburg Gate.",
    consejo: "If the lakes freeze over, stay off the ice unless it's officially allowed."
  },
  {
    nombre: "Liquidrom",
    categoria: "cozy-coffee",
    barrio: "Kreuzberg",
    descripcion: "Thermal baths with a saltwater pool, underwater music and saunas.",
    consejo: "Perfect for thawing out after a freezing day."
  },
  {
    nombre: "Alexanderplatz ice rink",
    categoria: "christmas-markets",
    barrio: "Mitte",
    descripcion: "An open-air ice rink during the Christmas season, surrounded by stalls.",
    consejo: "Check first whether there's a rink this year: in 2026 the Alexanderplatz market only lists a Bavarian curling lane (Eisstock)."
  },
  {
    nombre: "Markthalle Neun",
    categoria: "cozy-coffee",
    barrio: "Kreuzberg",
    descripcion: "A covered market hall from 1891. Street Food Thursday runs every Thursday from 5 to 10 pm.",
    consejo: "A warm spot to grab a bite when the cold really bites."
  },
  {
    nombre: "Currywurst at an Imbiss",
    categoria: "berliner-101",
    barrio: "All over the city",
    descripcion: "Sausage with curry sauce and ketchup: Berlin's classic street food.",
    consejo: "Order it 'mit Pommes' (with fries)."
  },
  {
    nombre: "Berlinale",
    categoria: "arts-culture",
    barrio: "Potsdamer Platz",
    descripcion: "International film festival. In 2027 it runs from 10 to 21 February, with tickets for the general public.",
    consejo: "Tickets go on sale a few days before each screening and sell out fast. 20 and 21 February are audience days, with cheaper tickets."
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

// Subtitle shown under the list title when a category is selected.
const SUBTITULOS = {
  "history": "So much happened right here. What better way to understand history than standing exactly where it took place?",
  "arts-culture": "A new chapter where we let art and culture all the way in. Maybe this is what life is really about.",
  "wander": "Wander with no destination and notice what surrounds you. Not everything needs a plan: let the city carry you.",
  "parties": "New scenes, new people, new energy. Get inspired, meet each other in unfamiliar places and express yourself.",
  "cozy-coffee": "A pause in the middle of the city: a coffee or a hot chocolate, a good book or your laptop.",
  "christmas-markets": "Every market has a personality of its own. Go and find your favourite.",
  "berliner-101": "The things that make Berlin, Berlin. Try them all to get to know the city and what it stands for."
};

// Old Spanish names → current names. Visited places and earned coins are saved in
// the browser by name, so old saves are translated when the page loads.
const NOMBRES_ANTIGUOS = {
  "Mercado navideño del Palacio de Charlottenburg": "Charlottenburg Palace Christmas Market",
  "Lucia Weihnachtsmarkt (Kulturbrauerei)": "Lucia Christmas Market (Kulturbrauerei)",
  "Isla de los Museos": "Museum Island",
  "Cúpula del Reichstag": "Reichstag Dome",
  "Paseo invernal por el Tiergarten": "Winter walk through the Tiergarten",
  "Pista de patinaje en Alexanderplatz": "Alexanderplatz ice rink",
  "Currywurst en un Imbiss": "Currywurst at an Imbiss"
};
const nombreActual = (nombre) => NOMBRES_ANTIGUOS[nombre] || nombre;
