window.SPOTS = [
  {
    id: "el-palmar",
    name: "El Palmar",
    province: "Cádiz",
    sports: ["surf"],
    featured: true,
    lat: 36.235,
    lon: -6.024,
    ideal: "Swell W/NW 1.2-1.8m, periodo 13-15s, Levante flojo o moderado, baja subiendo.",
    expert: {
      waveDirections: ["W", "NW"],
      windGood: ["E"],
      windBad: ["W", "SW", "S"],
      waveMin: 0.9,
      waveOptimal: [1.2, 1.8],
      periodMin: 10,
      periodOptimal: [13, 15],
      windMin: 5,
      windMax: 32,
      tideHint: "Mejor con marea baja subiendo.",
      notes: [
        "Beachbreak sensible a bancos.",
        "Con periodo corto tiende a cerrar.",
        "Con Levante bueno se vuelve más hueca."
      ]
    },
    webcams: [
      { title: "Webcam El Palmar · 9 Pies", url: "https://www.escueladesurf9pies.com/es/webcam-el-palmar" }
    ]
  },
  {
    id: "yerbabuena",
    name: "Yerbabuena",
    province: "Cádiz",
    sports: ["surf"],
    featured: true,
    lat: 36.183,
    lon: -5.946,
    ideal: "Mar W/SW 2-3m, 12-15s, Norte terral, baja-media.",
    expert: {
      waveDirections: ["W", "SW"],
      windGood: ["N"],
      windBad: ["W", "SW", "S"],
      waveMin: 1.5,
      waveOptimal: [2.0, 3.0],
      periodMin: 12,
      periodOptimal: [12, 15],
      windMin: 4,
      windMax: 25,
      tideHint: "Baja-media, en alta pierde mucha calidad.",
      notes: [
        "Derecha larga y técnica.",
        "Necesita energía seria.",
        "Spot medio-alto."
      ]
    },
    webcams: []
  },
  {
    id: "los-lances",
    name: "Los Lances",
    province: "Cádiz",
    sports: ["kitesurf", "windsurf"],
    featured: true,
    lat: 36.005,
    lon: -5.610,
    ideal: "Poniente 15-25 kn side-on, mar ordenado y mucha seguridad.",
    expert: {
      waveDirections: ["W", "SW", "NW"],
      windGood: ["W", "SW"],
      windBad: ["E"],
      waveMin: 0.7,
      waveOptimal: [1.0, 2.0],
      periodMin: 7,
      periodOptimal: [8, 12],
      windMin: 28,
      windMax: 46,
      tideHint: "Revisar lagunas interiores con coeficiente alto.",
      notes: [
        "Top para freeride con Poniente.",
        "Levante muy delicado fuera de zonas expertas.",
        "Muy apto para direccional."
      ]
    },
    webcams: [
      { title: "Tarifa live", url: "https://www.youtube.com/embed/dx6jgEqsjBE?autoplay=0&rel=0" }
    ]
  },
  {
    id: "valdevaqueros",
    name: "Valdevaqueros",
    province: "Cádiz",
    sports: ["kitesurf", "windsurf", "wingfoil"],
    featured: true,
    lat: 36.075,
    lon: -5.595,
    ideal: "Poniente side-on 18-25 kn o Levante estable ya asentado.",
    expert: {
      waveDirections: ["W", "SW", "E"],
      windGood: ["W", "SW", "E"],
      windBad: ["N"],
      waveMin: 0.5,
      waveOptimal: [0.8, 1.8],
      periodMin: 6,
      periodOptimal: [7, 10],
      windMin: 30,
      windMax: 65,
      tideHint: "Muy tolerante con marea.",
      notes: [
        "Muy versátil por la forma de la bahía.",
        "El Levante inicial suele ser más racheado.",
        "Con Poniente térmico mejora mucho."
      ]
    },
    webcams: [
      { title: "Ozu Tarifa webcam", url: "https://www.kiteschool-ozutarifa.com/webcam-kitesurf-tarifa" }
    ]
  },
  {
    id: "palmones",
    name: "Palmones",
    province: "Cádiz",
    sports: ["kitesurf", "windsurf"],
    featured: false,
    lat: 36.170,
    lon: -5.430,
    ideal: "Refugio con Levante fuerte en Tarifa y bajamar para agua plato.",
    expert: {
      waveDirections: ["E", "SE"],
      windGood: ["E", "SE"],
      windBad: ["W", "SW"],
      waveMin: 0.2,
      waveOptimal: [0.2, 0.8],
      periodMin: 4,
      periodOptimal: [4, 7],
      windMin: 28,
      windMax: 46,
      tideHint: "Bajamar ideal.",
      notes: [
        "Refugio real para freestyle.",
        "Muy seguro por ángulo de viento.",
        "Poco interés puro de ola, mucho interés de control."
      ]
    },
    webcams: []
  },
  {
    id: "cabopino",
    name: "Cabopino",
    province: "Málaga",
    sports: ["surf"],
    featured: true,
    lat: 36.481,
    lon: -4.752,
    ideal: "Swell E/SE 1.5-2m, 7-8s, Norte/NW terral y marea baja.",
    expert: {
      waveDirections: ["E", "SE"],
      windGood: ["N", "NW"],
      windBad: ["E", "SE", "S"],
      waveMin: 1.0,
      waveOptimal: [1.5, 2.0],
      periodMin: 6,
      periodOptimal: [7, 8],
      windMin: 4,
      windMax: 24,
      tideHint: "Baja ayuda a conectar mejor la derecha.",
      notes: [
        "Derecha muy estética junto al espigón.",
        "Necesita energía suficiente.",
        "Muy buen spot cuando cuadra."
      ]
    },
    webcams: []
  },
  {
    id: "santa-amalia",
    name: "Santa Amalia",
    province: "Málaga",
    sports: ["surf"],
    featured: false,
    lat: 36.543,
    lon: -4.620,
    ideal: "Levante con 1.2-1.5m, 7-8s y Norte/NW de tierra.",
    expert: {
      waveDirections: ["E", "SE"],
      windGood: ["N", "NW"],
      windBad: ["E", "SE", "S"],
      waveMin: 0.8,
      waveOptimal: [1.2, 1.5],
      periodMin: 6,
      periodOptimal: [7, 8],
      windMin: 4,
      windMax: 24,
      tideHint: "Mejor baja-media.",
      notes: [
        "Sin terral se vuelve caótica.",
        "Spot local importante en Fuengirola.",
        "Necesita limpieza del viento."
      ]
    },
    webcams: []
  },
  {
    id: "el-chanquete",
    name: "El Chanquete",
    province: "Málaga",
    sports: ["surf", "sup"],
    featured: true,
    lat: 36.713,
    lon: -4.342,
    ideal: "Swell SE, 6-9s, Norte terral y marea baja-media.",
    expert: {
      waveDirections: ["SE"],
      windGood: ["N"],
      windBad: ["E", "SE", "S"],
      waveMin: 0.8,
      waveOptimal: [1.0, 1.5],
      periodMin: 6,
      periodOptimal: [6, 9],
      windMin: 4,
      windMax: 22,
      tideHint: "Baja-media suele ir mejor.",
      notes: [
        "Muy apto para longboard y volumen.",
        "Spot urbano útil cuando Málaga responde.",
        "Con cruzado pierde bastante."
      ]
    },
    webcams: []
  },
  {
    id: "isla-canela",
    name: "Isla Canela",
    province: "Huelva",
    sports: ["kitesurf", "wingfoil"],
    featured: true,
    lat: 37.180,
    lon: -7.340,
    ideal: "Poniente 15-22 kn y bajamar para lagunas y flat water.",
    expert: {
      waveDirections: ["W", "SW"],
      windGood: ["W", "SW"],
      windBad: ["N", "NE"],
      waveMin: 0.3,
      waveOptimal: [0.5, 1.5],
      periodMin: 5,
      periodOptimal: [6, 10],
      windMin: 28,
      windMax: 42,
      tideHint: "Bajamar crítica para sacar partido real.",
      notes: [
        "Muy buena para freestyle.",
        "Leer bancos de arena al llegar.",
        "También útil para freeride."
      ]
    },
    webcams: [
      { title: "Isla Cristina / Playa Central", url: "https://www.windfinder.com/webcams/isla_cristina" }
    ]
  },
  {
    id: "punta-del-rio",
    name: "Punta del Río",
    province: "Granada",
    sports: ["surf"],
    featured: true,
    lat: 36.734,
    lon: -3.600,
    ideal: "Poniente W/SW 0.8-1.5m, 6-8s y Norte canalizado.",
    expert: {
      waveDirections: ["W", "SW"],
      windGood: ["N"],
      windBad: ["S", "SE", "E"],
      waveMin: 0.8,
      waveOptimal: [0.8, 1.5],
      periodMin: 5,
      periodOptimal: [6, 8],
      windMin: 4,
      windMax: 26,
      tideHint: "Suele ir mejor media subiendo.",
      notes: [
        "Uno de los mejores picos de la zona.",
        "La entrada de energía suele ser buena.",
        "Ojo a corrientes en desembocadura."
      ]
    },
    webcams: []
  },
  {
    id: "playa-granada",
    name: "Playa Granada",
    province: "Granada",
    sports: ["kitesurf", "windsurf", "wingfoil"],
    featured: false,
    lat: 36.708,
    lon: -3.550,
    ideal: "Poniente 18-25 kn con mar activo y buen chopi para rampas.",
    expert: {
      waveDirections: ["W", "SW"],
      windGood: ["W", "SW"],
      windBad: ["E", "SE"],
      waveMin: 0.6,
      waveOptimal: [0.8, 1.8],
      periodMin: 5,
      periodOptimal: [6, 9],
      windMin: 30,
      windMax: 46,
      tideHint: "Menos dependiente de marea que otros spots.",
      notes: [
        "Muy útil para saltos.",
        "Se activa rápido.",
        "Bueno para wind y kite."
      ]
    },
    webcams: [
      { title: "Wisuki Playa Granada", url: "https://es.wisuki.com/forecast/2706/playa-granada" }
    ]
  },
  {
    id: "los-genoveses",
    name: "Los Genoveses",
    province: "Almería",
    sports: ["surf", "kitesurf"],
    featured: true,
    lat: 36.765,
    lon: -2.104,
    ideal: "Levante que deje mar y rolada posterior a Norte o Poniente.",
    expert: {
      waveDirections: ["E", "NE"],
      windGood: ["N", "W"],
      windBad: ["E", "SE", "S"],
      waveMin: 1.0,
      waveOptimal: [1.0, 2.0],
      periodMin: 6,
      periodOptimal: [7, 10],
      windMin: 5,
      windMax: 30,
      tideHint: "Revisar restricciones y ángulo real de viento.",
      notes: [
        "Entorno natural regulado.",
        "Muy sensible al viento local.",
        "Puede dar mucha calidad."
      ]
    },
    webcams: [
      { title: "Forecast Los Genoveses", url: "https://www.todosurf.com/prevision/los-genoveses-spot52.htm" }
    ]
  }
];