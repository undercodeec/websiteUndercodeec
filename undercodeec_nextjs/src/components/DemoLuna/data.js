/**
 * Contenido de la experiencia "21 Horas en la Luna".
 *
 * Los textos son hechos históricos del Apolo 11 y las imágenes provienen del
 * archivo público de la NASA (dominio público). Todo el contenido está
 * redactado de forma propia para este proyecto.
 */

// Cronología de la misión que alimenta la línea de tiempo de la superficie.
// `kind` decide qué panel abre cada nodo: una vista panorámica o una narración.
export const TIMELINE = [
  { id: "landing", hour: 0, label: "Alunizaje", kind: "pano", ref: "eagle" },
  { id: "step", hour: 6.5, label: "Primer paso", kind: "story", ref: "step" },
  { id: "footprint", hour: 7, label: "La huella", kind: "pano", ref: "footprint" },
  { id: "flag", hour: 9, label: "La bandera", kind: "pano", ref: "flag" },
  { id: "president", hour: 11, label: "Llamada presidencial", kind: "story", ref: "president" },
  { id: "solar", hour: 13, label: "Viento solar", kind: "story", ref: "solar" },
  { id: "soil", hour: 15, label: "Muestras de suelo", kind: "story", ref: "soil" },
  { id: "ranging", hour: 18, label: "Telemetría láser", kind: "story", ref: "ranging" },
  { id: "earth", hour: 20, label: "La Tierra al fondo", kind: "pano", ref: "earth" },
  { id: "liftoff", hour: 21, label: "Despegue", kind: "story", ref: "liftoff" },
];

// Narraciones (nodos sin imagen). El texto se "escribe" con efecto máquina y
// se acompaña de una barra de reproducción simulada.
export const STORIES = {
  step: {
    tag: "Audio 01 · Un pequeño paso",
    text:
      "A las 02:56 UTC del 21 de julio de 1969, Neil Armstrong bajó por la escalera del módulo Eagle y apoyó su bota izquierda sobre el polvo lunar. Su frase —«un pequeño paso para el hombre, un gran salto para la humanidad»— la siguieron en directo cerca de 600 millones de personas.",
  },
  president: {
    tag: "Audio 02 · Llamada presidencial",
    text:
      "Desde el Despacho Oval, el presidente Richard Nixon habló por teléfono con Armstrong y Aldrin mientras ambos permanecían sobre la Luna. La llamó la conversación telefónica más histórica jamás realizada: durante esos minutos, dijo, la humanidad entera se sintió por un momento una sola.",
  },
  solar: {
    tag: "Audio 03 · Captura de viento solar",
    text:
      "Antes incluso de plantar la bandera, Aldrin desplegó una lámina de aluminio diseñada por la Universidad de Berna y la orientó hacia el Sol. Durante 77 minutos atrapó iones del viento solar —helio, neón y argón— que luego se analizaron en la Tierra. Fue el único experimento no estadounidense a bordo.",
  },
  soil: {
    tag: "Audio 04 · Muestras de suelo",
    text:
      "Nada más pisar la Luna, Armstrong recogió una muestra de contingencia por si había que abortar de inmediato. En total la tripulación trajo 21,5 kilogramos de regolito y basaltos de más de 3.600 millones de años, que confirmaron una Luna seca, sin vida y de origen volcánico.",
  },
  ranging: {
    tag: "Audio 05 · Telemetría láser",
    text:
      "La tripulación instaló un retrorreflector de esquinas cúbicas sobre el Mar de la Tranquilidad. Desde entonces, observatorios terrestres disparan pulsos láser que rebotan en él y regresan, midiendo la distancia Tierra–Luna con precisión de centímetros. Gracias a él sabemos que la Luna se aleja unos 3,8 cm cada año.",
  },
  liftoff: {
    tag: "Audio 06 · Despegue",
    text:
      "Tras casi 22 horas en la superficie, la etapa de ascenso del Eagle encendió su motor y dejó atrás la base Tranquility. La cámara quedó abajo, sobre el polvo, y no filmó el momento: el despegue de la Luna es uno de los grandes instantes de la historia del que no existe registro en vídeo.",
  },
};

// Vistas panorámicas / galería. `ratio` (ancho/alto) se usa para encuadrar la
// imagen en modo "cover" y calcular cuánto recorrido de arrastre queda.
export const PANORAMAS = {
  eagle: {
    src: "/demo-luna/modulo-lunar.jpg",
    ratio: 960 / 863,
    tag: "Alunizaje · Base Tranquility",
    title: "MÓDULO LUNAR EAGLE",
    meta: "Descenso a la superficie · 20 jul 1969",
  },
  footprint: {
    src: "/demo-luna/huella.jpg",
    ratio: 960 / 968,
    tag: "Superficie · Mar de la Tranquilidad",
    title: "LA PRIMERA HUELLA",
    meta: "Bota sobre el regolito · Apollo 11",
  },
  flag: {
    src: "/demo-luna/bandera.jpg",
    ratio: 1280 / 1266,
    tag: "Superficie · Homenaje",
    title: "SALUDO A LA BANDERA",
    meta: "Buzz Aldrin junto a la bandera · Apollo 11",
  },
  earth: {
    src: "/demo-luna/tierra-luna.jpg",
    ratio: 1280 / 1280,
    tag: "Órbita · La Tierra al fondo",
    title: "LA TIERRA DESDE LA LUNA",
    meta: "Vista desde la órbita lunar · Apollo 11",
  },
  visor: {
    src: "/demo-luna/aldrin-visor.jpg",
    ratio: 960 / 960,
    tag: "Retrato · Caminata lunar",
    title: "REFLEJO EN EL VISOR",
    meta: "Buzz Aldrin · 21 jul 1969",
  },
  surface: {
    src: "/demo-luna/aldrin-superficie.jpg",
    ratio: 1280 / 1249,
    tag: "Superficie · Retrato",
    title: "ASTRONAUTA EN TRANQUILITY",
    meta: "Buzz Aldrin en la base · Apollo 11",
  },
  pano: {
    src: "/demo-luna/panorama-tranquility.jpg",
    ratio: 1920 / 547,
    tag: "Panorámica · 360°",
    title: "MAR DE LA TRANQUILIDAD",
    meta: "Base Tranquility · 0.67°N 23.47°E · Apollo 11",
  },
};

export const MISSION = {
  name: "Apollo 11",
  year: "1969",
  site: "Mar de la Tranquilidad",
  coords: "0.67°N 23.47°E",
};
