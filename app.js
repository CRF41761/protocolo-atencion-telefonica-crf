/*
=========================================================
ASISTENTE DE ATENCIÓN TELEFÓNICA
CRF LA GRANJA DE EL SALER

Versión protocolo: 28/07/2026

IMPORTANTE:
Este sistema NO está conectado todavía
con el sistema de recogidas.
=========================================================
*/


const app = document.getElementById("app");

const progressText =
  document.getElementById("progress-text");

const progressFill =
  document.getElementById("progress-fill");


let historial = [];

let pantallaActual = "inicio";


/*
=========================================================
BASE DE ESPECIES
=========================================================
*/


const especies = [

  {
    nombre: "Jabalí",
    categoria: "Caza mayor"
  },

  {
    nombre: "Cabra montés",
    categoria: "Caza mayor"
  },

  {
    nombre: "Corzo",
    categoria: "Caza mayor"
  },

  {
    nombre: "Ciervo",
    categoria: "Caza mayor"
  },

  {
    nombre: "Gamo",
    categoria: "Caza mayor"
  },

  {
    nombre: "Pavo",
    categoria: "Animal doméstico"
  },

  {
    nombre: "Gallina",
    categoria: "Animal doméstico"
  },

  {
    nombre: "Faisán",
    categoria: "Animal doméstico"
  },

  {
    nombre: "Urrón / Urón",
    categoria: "Animal doméstico"
  },

  {
    nombre: "Paloma bravía",
    categoria: "Animal doméstico"
  },

  {
    nombre: "Cotorra",
    categoria: "Animal catalogado como invasor"
  },

  {
    nombre: "Galápago Trachemys scripta",
    categoria: "Animal catalogado como invasor"
  },

  {
    nombre: "Galápago Pseudemys",
    categoria: "Animal catalogado como invasor"
  },

  {
    nombre: "Galápago Mauremys",
    categoria: "Animal catalogado como invasor",
    nota:
      "Excepto Mauremys leprosa, que es autóctona."
  },

  {
    nombre: "Mapache",
    categoria: "Animal catalogado como invasor"
  },

  {
    nombre: "Coipú",
    categoria: "Animal catalogado como invasor"
  },

  {
    nombre: "Pitón real",
    categoria: "Animal catalogado como invasor"
  },

  {
    nombre: "Tortuga de espolones africana",
    categoria: "Animal exótico CITES"
  },

  {
    nombre: "Águila de Harris",
    categoria: "Animal exótico CITES"
  },

  {
    nombre: "Lechuza",
    categoria: "Animal silvestre autóctono",
    nota:
      "Tiene un caso especial cuando se trata de una cría."
  },

  {
    nombre: "Vencejo",
    categoria: "Animal silvestre autóctono",
    nota:
      "Las crías no se consideran volantones."
  },

  {
    nombre: "Golondrina",
    categoria: "Animal silvestre autóctono",
    nota:
      "Las crías no se consideran volantones."
  },

  {
    nombre: "Avión",
    categoria: "Animal silvestre autóctono",
    nota:
      "Las crías no se consideran volantones."
  },

  {
    nombre: "Conejo",
    categoria: "Animal silvestre autóctono"
  },

  {
    nombre: "Liebre",
    categoria: "Animal silvestre autóctono"
  },

  {
    nombre: "Erizo",
    categoria: "Animal silvestre autóctono"
  },

  {
    nombre: "Murciélago",
    categoria: "Animal silvestre autóctono"
  }

];


/*
=========================================================
FUNCIONES GENERALES
=========================================================
*/


function mostrarPantalla(id) {

  if (pantallaActual !== id) {

    historial.push(pantallaActual);

  }

  pantallaActual = id;

  const pantalla =
    pantallas[id];

  if (!pantalla) {

    console.error(
      "Pantalla no encontrada:",
      id
    );

    return;

  }

  app.innerHTML = "";

  actualizarProgreso();

  const titulo =
    document.createElement("h2");

  titulo.textContent =
    pantalla.titulo;

  app.appendChild(titulo);


  if (pantalla.descripcion) {

    const descripcion =
      document.createElement("p");

    descripcion.className =
      "description";

    descripcion.innerHTML =
      pantalla.descripcion;

    app.appendChild(descripcion);

  }


  if (pantalla.tipo === "pregunta") {

    const opciones =
      document.createElement("div");

    opciones.className =
      "options";


    pantalla.opciones.forEach(opcion => {

      const boton =
        document.createElement("button");

      boton.className =
        "option-btn";

      boton.innerHTML =
        opcion.texto;

      boton.onclick =
        () => mostrarPantalla(opcion.siguiente);

      opciones.appendChild(boton);

    });


    app.appendChild(opciones);

  }


  if (pantalla.tipo === "resultado") {

    const resultado =
      document.createElement("div");

    resultado.className =
      "result " +
      (pantalla.clase || "");

    resultado.innerHTML =
      pantalla.contenido;

    app.appendChild(resultado);

  }


  if (pantalla.tipo === "buscador") {

    crearBuscador();

  }


  if (pantalla.tipo === "fin") {

    const resultado =
      document.createElement("div");

    resultado.className =
      "result " +
      (pantalla.clase || "");

    resultado.innerHTML =
      pantalla.contenido;

    app.appendChild(resultado);


    const fin =
      document.createElement("div");

    fin.className =
      "finish";

    fin.innerHTML =
      `<div class="finish-icon">✓</div>`;

    app.appendChild(fin);

  }


  crearNavegacion();

}


/*
=========================================================
NAVEGACIÓN
=========================================================
*/


function crearNavegacion() {

  const navegacion =
    document.createElement("div");

  navegacion.className =
    "navigation";


  const botonAtras =
    document.createElement("button");

  botonAtras.className =
    "btn btn-secondary";

  botonAtras.textContent =
    "← Atrás";

  botonAtras.onclick =
    volverAtras;


  if (historial.length === 0) {

    botonAtras.disabled =
      true;

    botonAtras.style.opacity =
      "0.4";

  }


  const botonInicio =
    document.createElement("button");

  botonInicio.className =
    "btn btn-secondary";

  botonInicio.textContent =
    "↻ Reiniciar protocolo";

  botonInicio.onclick =
    reiniciar;


  navegacion.appendChild(
    botonAtras
  );

  navegacion.appendChild(
    botonInicio
  );


  app.appendChild(
    navegacion
  );

}


function volverAtras() {

  if (historial.length === 0) {

    return;

  }

  pantallaActual =
    historial.pop();

  renderActual();

}


function renderActual() {

  const id =
    pantallaActual;

  const pantalla =
    pantallas[id];

  app.innerHTML = "";

  actualizarProgreso();


  const titulo =
    document.createElement("h2");

  titulo.textContent =
    pantalla.titulo;

  app.appendChild(titulo);


  if (pantalla.descripcion) {

    const descripcion =
      document.createElement("p");

    descripcion.className =
      "description";

    descripcion.innerHTML =
      pantalla.descripcion;

    app.appendChild(descripcion);

  }


  if (pantalla.tipo === "pregunta") {

    const opciones =
      document.createElement("div");

    opciones.className =
      "options";


    pantalla.opciones.forEach(opcion => {

      const boton =
        document.createElement("button");

      boton.className =
        "option-btn";

      boton.innerHTML =
        opcion.texto;

      boton.onclick =
        () => mostrarPantalla(opcion.siguiente);

      opciones.appendChild(boton);

    });


    app.appendChild(opciones);

  }


  if (pantalla.tipo === "resultado") {

    const resultado =
      document.createElement("div");

    resultado.className =
      "result " +
      (pantalla.clase || "");

    resultado.innerHTML =
      pantalla.contenido;

    app.appendChild(resultado);

  }


  if (pantalla.tipo === "buscador") {

    crearBuscador();

  }


  if (pantalla.tipo === "fin") {

    const resultado =
      document.createElement("div");

    resultado.className =
      "result " +
      (pantalla.clase || "");

    resultado.innerHTML =
      pantalla.contenido;

    app.appendChild(resultado);

  }


  crearNavegacion();

}


function reiniciar() {

  historial = [];

  pantallaActual =
    "inicio";

  mostrarPantalla(
    "inicio"
  );

}


function actualizarProgreso() {

  const pasos = {

    inicio: 0,

    tipoAnimal: 1,

    vivoMuerto: 2,

    casosEspeciales: 3,

    paso5: 4

  };


  const paso =
    pasos[pantallaActual] ?? 1;


  const total =
    5;


  const porcentaje =
    (paso / total) * 100;


  progressFill.style.width =
    porcentaje + "%";


  progressText.textContent =
    paso === 0
      ? "Inicio"
      : `Paso ${paso} de ${total}`;

}


/*
=========================================================
BUSCADOR DE ESPECIES
=========================================================
*/


function crearBuscador() {

  const input =
    document.createElement("input");

  input.className =
    "search-box";

  input.placeholder =
    "Escribe el nombre del animal...";


  const resultados =
    document.createElement("div");

  resultados.className =
    "search-results";


  input.addEventListener(
    "input",
    () => {

      const texto =
        normalizar(input.value);


      resultados.innerHTML =
        "";


      if (!texto) {

        return;

      }


      const encontrados =
        especies.filter(
          especie =>
            normalizar(
              especie.nombre
            ).includes(texto)
        );


      encontrados.forEach(
        especie => {

          const item =
            document.createElement("div");

          item.className =
            "species-result";


          item.innerHTML = `

            <strong>
              ${especie.nombre}
            </strong>

            <div class="species-category">

              ${especie.categoria}

            </div>

            ${
              especie.nota
                ? `<p>${especie.nota}</p>`
                : ""
            }

          `;


          resultados.appendChild(
            item
          );

        }

      );

    }

  );


  app.appendChild(
    input
  );

  app.appendChild(
    resultados
  );

}


function normalizar(texto) {

  return texto

    .toLowerCase()

    .normalize(
      "NFD"
    )

    .replace(
      /[\u0300-\u036f]/g,
      ""
    );

}


/*
=========================================================
PANTALLAS DEL PROTOCOLO
=========================================================
*/


const pantallas = {


  inicio: {

    tipo: "pregunta",

    titulo:
      "¿Sabe la persona qué tipo de animal es?",

    descripcion:
      "Si no sabe identificarlo, puede solicitarse una fotografía para ayudar a identificarlo.",

    opciones: [

      {
        texto:
          "📷 No lo sabe",

        siguiente:
          "identificacion"

      },

      {
        texto:
          "🐾 Sí lo sabe",

        siguiente:
          "tipoAnimal"

      },

      {
        texto:
          "🔎 Buscar un animal",

        siguiente:
          "buscador"

      }

    ]

  },


  identificacion: {

    tipo:
      "resultado",

    titulo:
      "📷 Identificación del animal",

    contenido: `

      <h3>Pide al ciudadano que envíe una fotografía.</h3>

      <p>
        WhatsApp de La Granja:
      </p>

      <div class="contact-box">

        <strong>
          📱 686 680 254
        </strong>

        Identificación y ubicación.

      </div>

      <p class="small-note">

        Una vez identificado el animal,
        vuelve al inicio y selecciona
        la categoría correspondiente.

      </p>

    `

  },


  tipoAnimal: {

    tipo:
      "pregunta",

    titulo:
      "¿Qué tipo de animal es?",

    descripcion:
      "Si tienes dudas sobre la clasificación, utiliza el buscador de animales.",

    opciones: [

      {
        texto:
          "🦌 Caza mayor",

        siguiente:
          "cazaMayor"

      },

      {
        texto:
          "🐢 Tortuga marina o cetáceo",

        siguiente:
          "tortugaMarina"

      },

      {
        texto:
          "🏠 Animal doméstico",

        siguiente:
          "domestico"

      },

      {
        texto:
          "🦎 Animal exótico",

        siguiente:
          "exotico"

      },

      {
        texto:
          "🚨 Animal catalogado como invasor",

        siguiente:
          "invasor"

      },

      {
        texto:
          "🦇 Colonias de murciélagos",

        siguiente:
          "murcielagos"

      },

      {
        texto:
          "🪺 Presencia de nidos",

        siguiente:
          "nidos"

      },

      {
        texto:
          "⚠️ Daños a la fauna o destrucción de nidos",

        siguiente:
          "danos"

      },

      {
        texto:
          "🥚 Huevos en la playa",

        siguiente:
          "huevosPlaya"

      },

      {
        texto:
          "🐦 Animal silvestre autóctono",

        siguiente:
          "vivoMuerto"

      }

    ]

  },


  cazaMayor: {

    tipo:
      "fin",

    titulo:
      "🦌 Caza mayor",

    clase:
      "warning",

    contenido: `

      <h3>Indicar que llame al 112.</h3>

      <p>
        Desde el 112 avisarán a la unidad de caza.
      </p>

      <div class="contact-box">

        <strong>📞 112</strong>

        Emergencias.

      </div>

    `

  },


  tortugaMarina: {

    tipo:
      "fin",

    titulo:
      "🐢 Tortuga marina o cetáceo",

    contenido: `

      <h3>Indicar que llame al 112.</h3>

      <div class="contact-box">

        <strong>📞 112</strong>

        Emergencias.

      </div>

    `

  },


  domestico: {

    tipo:
      "fin",

    titulo:
      "🏠 Animal doméstico",

    contenido: `

      <h3>Indicar que se dirija a su Ayuntamiento.</h3>

      <p>
        La atención de estos animales corresponde
        al Ayuntamiento.
      </p>

    `

  },


  exotico: {

    tipo:
      "pregunta",

    titulo:
      "¿Qué situación se presenta?",

    opciones: [

      {

        texto:
          "🦎 Animal exótico CITES encontrado",

        siguiente:
          "citesEncontrado"

      },

      {

        texto:
          "📋 Posee un animal exótico CITES",

        siguiente:
          "citesConsulta"

      },

      {

        texto:
          "🏠 Animal exótico no catalogado como invasor",

        siguiente:
          "exoticoNoInvasor"

      }

    ]

  },


  exoticoNoInvasor: {

    tipo:
      "fin",

    titulo:
      "🏠 Animal exótico no catalogado como invasor",

    contenido: `

      <h3>Indicar que se dirija a su Ayuntamiento.</h3>

    `

  },


  citesEncontrado: {

    tipo:
      "fin",

    titulo:
      "🦎 Animal exótico CITES encontrado",

    contenido: `

      <h3>Indicar que se dirija a su Ayuntamiento.</h3>

    `

  },


  citesConsulta: {

    tipo:
      "fin",

    titulo:
      "📋 Animal exótico CITES",

    contenido: `

      <h3>
        Indicar que describa su caso por correo.
      </h3>

      <p>
        Recibirá instrucciones.
      </p>

      <div class="contact-box">

        <strong>
          ✉️ bzn-cites@miteco.es
        </strong>

        <strong>
          ✉️ bzn-tifies@miteco.es
        </strong>

      </div>

    `

  },


  invasor: {

    tipo:
      "pregunta",

    titulo:
      "¿Está cerca de alguna unidad colaboradora?",

    opciones: [

      {

        texto:
          "Sí, está cerca",

        siguiente:
          "invasorUnidad"

      },

      {

        texto:
          "No está cerca",

        siguiente:
          "invasorCentro"

      }

    ]

  },


  invasorUnidad: {

    tipo:
      "fin",

    titulo:
      "🚨 Animal invasor",

    contenido: `

      <h3>
        Puede llevarlo a una unidad colaboradora
        entre semana.
      </h3>

      <p>
        Se debe apuntar como recogida pendiente.
      </p>

    `

  },


  invasorCentro: {

    tipo:
      "fin",

    titulo:
      "🚨 Animal invasor",

    contenido: `

      <h3>
        Han de traerlo al centro.
      </h3>

      <p>
        Enviar la ubicación por WhatsApp
        si es necesario.
      </p>

      <div class="contact-box">

        <strong>
          📱 686 680 254
        </strong>

      </div>

    `

  },


  murcielagos: {

    tipo:
      "fin",

    titulo:
      "🦇 Colonias de murciélagos",

    contenido: `

      <h3>
        No se puede actuar hasta que termine
        la época de cría.
      </h3>

      <p>
        Remitir la consulta al correo:
      </p>

      <div class="contact-box">

        <strong>
          ✉️ espaciosnaturales_valencia@gva.es
        </strong>

      </div>

    `

  },


  nidos: {

    tipo:
      "fin",

    titulo:
      "🪺 Presencia de nidos",

    contenido: `

      <h3>
        No se puede actuar hasta que termine
        la época de cría.
      </h3>

      <p>
        Remitir la consulta al correo:
      </p>

      <div class="contact-box">

        <strong>
          ✉️ espaciosnaturales_valencia@gva.es
        </strong>

      </div>

    `

  },


  danos: {

    tipo:
      "fin",

    titulo:
      "⚠️ Daños a la fauna o destrucción de nidos",

    contenido: `

      <p>
        Puede enviar un correo o llamar al 112
        para contactar con un agente medioambiental.
      </p>

      <div class="contact-box">

        <strong>
          ✉️ espaciosnaturales_valencia@gva.es
        </strong>

        <strong>
          📞 112
        </strong>

      </div>

    `

  },


  huevosPlaya: {

    tipo:
      "fin",

    titulo:
      "🥚 Huevos en la playa",

    contenido: `

      <h3>
        No recoger los huevos.
      </h3>

      <p>
        El nido del chorlitejo es muy rudimentario
        y puede parecer que los huevos están abandonados.
        Sin embargo, no deben cogerse porque no están abandonados.
      </p>

    `

  },


  vivoMuerto: {

    tipo:
      "pregunta",

    titulo:
      "¿El animal está vivo o muerto?",

    opciones: [

      {

        texto:
          "⚫ Está muerto",

        siguiente:
          "muerto"

      },

      {

        texto:
          "🟢 Está vivo",

        siguiente:
          "casosEspeciales"

      }

    ]

  },


  muerto: {

    tipo:
      "pregunta",

    titulo:
      "¿Se trata de una cría aislada?",

    opciones: [

      {

        texto:
          "Sí, es una cría aislada",

        siguiente:
          "cadaverCria"

      },

      {

        texto:
          "No es una cría",

        siguiente:
          "cadaverAdulto"

      }

    ]

  },


  cadaverCria: {

    tipo:
      "fin",

    titulo:
      "⚫ Cadáver de cría aislada",

    contenido: `

      <h3>
        No es necesario recoger el cadáver.
      </h3>

    `

  },


  cadaverAdulto: {

    tipo:
      "fin",

    titulo:
      "⚫ Animal muerto",

    contenido: `

      <h3>
        Llamar al CPIF.
      </h3>

      <p>
        Solicitar que un Agente Medioambiental
        vaya a recogerlo.
      </p>

      <p class="small-note">
        Si el CPIF no quiere enviar un agente o no hay
        ninguno disponible, se registra la incidencia.
      </p>

    `

  },


  casosEspeciales: {

    tipo:
      "pregunta",

    titulo:
      "¿Se da alguno de estos casos especiales?",

    descripcion:
      "Comprueba los casos en este orden. Si ninguno aplica, continúa al Paso 5.",

    opciones: [

      {

        texto:
          "🏠 Está suelto dentro de una vivienda",

        siguiente:
          "animalVivienda"

      },

      {

        texto:
          "🦅 Está fuera de una vivienda y parece tener problemas",

        siguiente:
          "animalProblemas"

      },

      {

        texto:
          "⚡ Posible causa antropogénica",

        siguiente:
          "causaAntropogenica"

      },

      {

        texto:
          "🐢 Tortuga terrestre propiedad de alguien",

        siguiente:
          "tortugaPropiedad"

      },

      {

        texto:
          "🐢 Tortuga terrestre o galápago autóctono encontrado en el campo",

        siguiente:
          "tortugaCampo"

      },

      {

        texto:
          "🦇 Cría de murciélago",

        siguiente:
          "criaMurcielago"

      },

      {

        texto:
          "🪟 Ave que ha chocado contra un cristal",

        siguiente:
          "cristal"

      },

      {

        texto:
          "🐇 Cría de conejo o liebre",

        siguiente:
          "conejoLiebre"

      },

      {

        texto:
          "🐝 Panal de abejas o avispas",

        siguiente:
          "panal"

      },

      {

        texto:
          "🪶 Cría de lechuza",

        siguiente:
          "criaLechuza"

      },

      {

        texto:
          "🦔 Erizo",

        siguiente:
          "erizo"

      },

      {

        texto:
          "🐣 Cría de pajarito o rapaz",

        siguiente:
          "criaAve"

      },

      {

        texto:
          "Ninguno de estos casos",

        siguiente:
          "paso5"

      }

    ]

  },


  animalVivienda: {

    tipo:
      "fin",

    titulo:
      "🏠 Animal dentro de una vivienda",

    contenido: `

      <h3>
        No cazamos animales.
      </h3>

      <p>
        Deben facilitar la salida del animal
        de su vivienda.
      </p>

    `

  },


  animalProblemas: {

    tipo:
      "fin",

    titulo:
      "🦅 Animal con problemas fuera de una vivienda",

    contenido: `

      <h3>
        Llamar al CPIF.
      </h3>

      <p>
        Solicitar que un Agente Medioambiental
        vaya a conocer la situación e informe.
      </p>

    `

  },


  causaAntropogenica: {

    tipo:
      "fin",

    titulo:
      "⚡ Posible causa antropogénica",

    contenido: `

      <h3>
        Llamar al CPIF.
      </h3>

      <p>
        Solicitar que un Agente Medioambiental
        vaya a recogerlo.
      </p>

      <p class="small-note">
        Ejemplos: electrocución, ahogamiento,
        envenenamiento, colisión contra tendido eléctrico,
        aerogenerador o cristalera.
      </p>

    `

  },


  tortugaPropiedad: {

    tipo:
      "fin",

    titulo:
      "🐢 Tortuga terrestre propiedad de alguien",

    contenido: `

      <h3>
        Solicitar siempre una fotografía antes de traerla.
      </h3>

      <div class="contact-box">

        <strong>
          📱 WhatsApp: 686 680 254
        </strong>

      </div>

      <p>
        Después, continuar según el caso.
      </p>

    `

  },


  tortugaCampo: {

    tipo:
      "resultado",

    titulo:
      "🐢 Tortuga terrestre o galápago autóctono",

    contenido: `

      <h3>
        Continuar comprobando el estado del animal.
      </h3>

      <p>
        Si presenta heridas, comportamiento o síntomas
        que hagan pensar que está enfermo → Paso 5.
      </p>

      <p>
        Si no presenta heridas ni síntomas, y no existe
        peligro inminente, no llevárselo.
      </p>

    `

  },


  criaMurcielago: {

    tipo:
      "pregunta",

    titulo:
      "🦇 ¿Se sabe de dónde ha podido caer?",

    opciones: [

      {

        texto:
          "Sí, se sabe",

        siguiente:
          "murcielagoLugar"

      },

      {

        texto:
          "No se sabe",

        siguiente:
          "murcielagoNoLugar"

      }

    ]

  },


  murcielagoLugar: {

    tipo:
      "fin",

    titulo:
      "🦇 Cría de murciélago",

    contenido: `

      <p>
        Si es muy pequeña, casi sin pelo:
        preparar una botella con agua caliente,
        envolverla con un trapo y colocar la cría
        por la noche sobre el trapo, cerca del lugar
        donde se sospecha que ha caído.
      </p>

      <p>
        Si tiene pelo y es algo mayor:
        puede colocarse con un trocito de trapo
        o en una cajita abierta cerca del lugar
        donde haya caído.
      </p>

    `

  },


  murcielagoNoLugar: {

    tipo:
      "fin",

    titulo:
      "🦇 Cría de murciélago",

    contenido: `

      <p>
        Se puede traer al centro.
      </p>

      <p>
        Se recomienda intentar localizar el lugar
        de donde ha podido caer porque necesita
        el aprendizaje de sus padres.
      </p>

    `

  },


  cristal: {

    tipo:
      "pregunta",

    titulo:
      "🪟 Ave que ha chocado contra un cristal",

    opciones: [

      {

        texto:
          "Han pasado menos de 2 horas",

        siguiente:
          "cristalDosHoras"

      },

      {

        texto:
          "Han pasado más de 2 horas",

        siguiente:
          "paso5"

      }

    ]

  },


  cristalDosHoras: {

    tipo:
      "fin",

    titulo:
      "🪟 Recuperación tras choque",

    contenido: `

      <h3>
        Mantener el animal en una caja
        durante 2 horas.
      </h3>

      <p>
        Mantenerlo en un lugar muy tranquilo.
      </p>

      <p>
        Pasadas las 2 horas, abrir la caja
        y sacarlo con cuidado en un lugar
        libre de obstáculos.
      </p>

      <p>
        Si no puede emprender el vuelo,
        continuar por el Paso 5.
      </p>

    `

  },


  conejoLiebre: {

    tipo:
      "pregunta",

    titulo:
      "🐇 Cría de conejo o liebre",

    opciones: [

      {

        texto:
          "No está herido",

        siguiente:
          "conejoSano"

      },

      {

        texto:
          "Está herido o debilitado",

        siguiente:
          "conejoHerido"

      }

    ]

  },


  conejoSano: {

    tipo:
      "fin",

    titulo:
      "🐇 Cría sana",

    contenido: `

      <h3>
        No cogerla.
      </h3>

      <p>
        Alejarse rápidamente porque la madre
        está cerca y acudirá a alimentarla.
      </p>

    `

  },


  conejoHerido: {

    tipo:
      "fin",

    titulo:
      "🐇 Cría herida o debilitada",

    contenido: `

      <h3>
        Colocarla en una caja con algún agujero.
      </h3>

      <p>
        Mantenerla en un ambiente tranquilo.
      </p>

      <p>
        Continuar por el Paso 5.
      </p>

    `

  },


  panal: {

    tipo:
      "fin",

    titulo:
      "🐝 Panales de abejas o avispas",

    contenido: `

      <h3>
        Indicar que llame al 112.
      </h3>

    `

  },


  criaLechuza: {

    tipo:
      "pregunta",

    titulo:
      "🪶 Cría de lechuza",

    opciones: [

      {

        texto:
          "No tiene heridas",

        siguiente:
          "lechuzaSana"

      },

      {

        texto:
          "Tiene heridas",

        siguiente:
          "lechuzaHerida"

      }

    ]

  },


  lechuzaSana: {

    tipo:
      "fin",

    titulo:
      "🪶 Cría de lechuza sin heridas",

    contenido: `

      <h3>
        Buscar el nido y devolverla allí.
      </h3>

      <p>
        Si no se encuentra el nido,
        colocarla en una caja con algún agujero
        y mantenerla en un ambiente tranquilo.
      </p>

    `

  },


  lechuzaHerida: {

    tipo:
      "fin",

    titulo:
      "🪶 Cría de lechuza herida",

    contenido: `

      <h3>
        Meterla en una caja con algún agujero
        y mantenerla en un ambiente tranquilo.
      </h3>

      <p>
        Continuar por el Paso 5.
      </p>

    `

  },


  erizo: {

    tipo:
      "pregunta",

    titulo:
      "🦔 Erizo",

    opciones: [

      {

        texto:
          "Es de día",

        siguiente:
          "erizoDia"

      },

      {

        texto:
          "Es de noche o últimas horas del día",

        siguiente:
          "erizoNoche"

      }

    ]

  },


  erizoDia: {

    tipo:
      "resultado",

    titulo:
      "🦔 Erizo durante el día",

    contenido: `

      <p>
        Comprobar si tiene signos de enfermedad
        o heridas.
      </p>

      <p>
        Si los tiene → Paso 5.
      </p>

      <p>
        Si no los tiene y existe un peligro inminente,
        retirarlo a un lugar seguro, pero no llevárselo.
      </p>

    `

  },


  erizoNoche: {

    tipo:
      "resultado",

    titulo:
      "🦔 Erizo de noche",

    contenido: `

      <p>
        Comprobar si tiene signos de enfermedad
        o heridas.
      </p>

      <p>
        Si los tiene → Paso 5.
      </p>

    `

  },


  criaAve: {

    tipo:
      "pregunta",

    titulo:
      "🐣 ¿Es un volantón?",

    descripcion:
      "Las únicas especies indicadas en el protocolo que no pueden estar en este caso son vencejos, aviones, golondrinas y, entre rapaces, la lechuza.",

    opciones: [

      {

        texto:
          "Sí, es un volantón",

        siguiente:
          "volanton"

      },

      {

        texto:
          "No es un volantón",

        siguiente:
          "criaAveNoVolanton"

      }

    ]

  },


  volanton: {

    tipo:
      "pregunta",

    titulo:
      "🐣 ¿Puede devolverlo al lugar donde lo encontró?",

    opciones: [

      {

        texto:
          "Sí, puede devolverlo",

        siguiente:
          "volantonDevolver"

      },

      {

        texto:
          "No puede devolverlo",

        siguiente:
          "volantónNoDevolver"

      }

    ]

  },


  volantonDevolver: {

    tipo:
      "fin",

    titulo:
      "🐣 Volantón",

    contenido: `

      <p>
        Si ha transcurrido menos de una hora y media,
        pedir que lo deje en el sitio donde lo encontró.
      </p>

      <p>
        Si estaba en la carretera,
        dejarlo en la acera.
      </p>

    `

  },


  "volantónNoDevolver": {

    tipo:
      "pregunta",

    titulo:
      "🐣 Volantón que no puede devolverse",

    opciones: [

      {

        texto:
          "Está cerca de una unidad colaboradora",

        siguiente:
          "criaUnidad"

      },

      {

        texto:
          "No está cerca de una unidad colaboradora",

        siguiente:
          "criaCentro"

      }

    ]

  },


  criaAveNoVolanton: {

    tipo:
      "pregunta",

    titulo:
      "🐣 Cría de ave que no es un volantón",

    opciones: [

      {

        texto:
          "Está cerca de una unidad colaboradora",

        siguiente:
          "criaUnidad"

      },

      {

        texto:
          "No está cerca de una unidad colaboradora",

        siguiente:
          "criaCentro"

      }

    ]

  },


  criaUnidad: {

    tipo:
      "fin",

    titulo:
      "🐣 Unidad colaboradora",

    contenido: `

      <h3>
        Puede llevarla a una unidad colaboradora
        entre semana.
      </h3>

      <p>
        También puede llevarla al centro cualquier día.
      </p>

      <p>
        Si la lleva a una unidad colaboradora,
        apuntar la recogida pendiente.
      </p>

    `

  },


  criaCentro: {

    tipo:
      "fin",

    titulo:
      "🐣 Cría de ave",

    contenido: `

      <h3>
        El CRF no realiza recogidas de crías de pajaritos.
      </h3>

      <p>
        Se hace cargo de ellas si las traen al centro.
      </p>

      <p>
        Mientras la traen, mantenerla en una caja
        sin comida ni agua.
      </p>

    `

  },


  paso5: {

    tipo:
      "pregunta",

    titulo:
      "Paso 5 — Animal herido o enfermo",

    descripcion:
      "Sin causa antropogénica evidente.",

    opciones: [

      {

        texto:
          "📅 Es entre semana",

        siguiente:
          "entreSemana"

      },

      {

        texto:
          "🗓️ Es fin de semana",

        siguiente:
          "finSemana"

      }

    ]

  },


  entreSemana: {

    tipo:
      "pregunta",

    titulo:
      "¿Hay una unidad colaboradora cerca?",

    opciones: [

      {

        texto:
          "Sí, hay una unidad cerca",

        siguiente:
          "unidadCerca"

      },

      {

        texto:
          "No hay una unidad cerca",

        siguiente:
          "sinUnidad"

      }

    ]

  },


  unidadCerca: {

    tipo:
      "fin",

    titulo:
      "📍 Unidad colaboradora",

    contenido: `

      <h3>
        Enviar al ciudadano a la unidad colaboradora.
      </h3>

      <p>
        Anotar recogida pendiente.
      </p>

    `

  },


  sinUnidad: {

    tipo:
      "fin",

    titulo:
      "🚗 Recogida en domicilio",

    contenido: `

      <h3>
        Tomar los datos para realizar la recogida
        en domicilio.
      </h3>

      <p>
        Anotar recogida pendiente.
      </p>

    `

  },


  finSemana: {

    tipo:
      "pregunta",

    titulo:
      "🗓️ Fin de semana",

    descripcion:
      "No hay servicio de recogida durante el fin de semana.",

    opciones: [

      {

        texto:
          "Sí, puede traerlo al centro",

        siguiente:
          "finSemanaPuedeTraer"

      },

      {

        texto:
          "No puede traerlo",

        siguiente:
          "finSemanaNoPuede"

      }

    ]

  },


  finSemanaPuedeTraer: {

    tipo:
      "fin",

    titulo:
      "🗓️ Fin de semana",

    contenido: `

      <h3>
        Puede traer el animal al centro.
      </h3>

      <p>
        Informar de que no existe servicio
        de recogida durante el fin de semana.
      </p>

    `

  },


  finSemanaNoPuede: {

    tipo:
      "fin",

    titulo:
      "🗓️ Fin de semana",

    contenido: `

      <h3>
        Llamar al CPIF.
      </h3>

      <p>
        Consultar si puede recogerlo un
        Agente Medioambiental.
      </p>

      <p>
        Si el agente puede traerlo,
        se hará cargo de la recogida.
      </p>

      <p>
        Si no puede traerlo, indicar que iremos el lunes.
      </p>

      <p>
        Mientras tanto, mantenerlo en una caja con algún
        agujero por el que no pueda escapar.
      </p>

      <p>
        No darle comida, agua ni medicamentos.
      </p>

      <p>
        Apuntar la recogida pendiente.
      </p>

    `

  }

};


/*
=========================================================
INICIO DE LA APLICACIÓN
=========================================================
*/


mostrarPantalla(
  "inicio"
);
