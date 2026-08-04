```javascript
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


const app =
  document.getElementById("app");

const progressText =
  document.getElementById("progress-text");

const progressFill =
  document.getElementById("progress-fill");


let historial = [];

let pantallaActual = "inicio";

let especies = [];

let especieSeleccionada = null;


/*
=========================================================
CARGA DE ESPECIES DESDE JSON
=========================================================
*/


async function cargarEspecies() {

  try {

    const respuesta =
      await fetch("./especies.json", {
        cache: "no-cache"
      });

    if (!respuesta.ok) {

      throw new Error(
        `Error HTTP ${respuesta.status}`
      );

    }

    const datos =
      await respuesta.json();


    if (!Array.isArray(datos)) {

      throw new Error(
        "especies.json no contiene un array válido."
      );

    }


    especies =
      datos;


    console.log(
      "Especies cargadas correctamente:",
      especies.length
    );


  } catch (error) {

    console.error(
      "Error cargando especies.json:",
      error
    );

    especies = [];

  }

}


/*
=========================================================
FUNCIONES GENERALES
=========================================================
*/


function mostrarPantalla(id, guardarHistorial = true) {

  const pantalla =
    pantallas[id];


  if (!pantalla) {

    console.error(
      "Pantalla no encontrada:",
      id
    );

    return;

  }


  /*
  Guardamos la pantalla actual
  para poder volver atrás.
  */

  if (
    guardarHistorial &&
    pantallaActual !== id
  ) {

    historial.push(
      pantallaActual
    );

  }


  pantallaActual =
    id;


  renderActual();

}


/*
=========================================================
RENDERIZAR PANTALLA ACTUAL
=========================================================
*/


function renderActual() {

  const pantalla =
    pantallas[pantallaActual];


  if (!pantalla) {

    console.error(
      "Pantalla no encontrada:",
      pantallaActual
    );

    return;

  }


  app.innerHTML =
    "";


  actualizarProgreso();


  /*
  =======================================================
  TÍTULO
  =======================================================
  */


  const titulo =
    document.createElement("h2");


  titulo.textContent =
    pantalla.titulo;


  app.appendChild(
    titulo
  );


  /*
  =======================================================
  DESCRIPCIÓN
  =======================================================
  */


  if (
    pantalla.descripcion
  ) {

    const descripcion =
      document.createElement("p");


    descripcion.className =
      "description";


    descripcion.innerHTML =
      pantalla.descripcion;


    app.appendChild(
      descripcion
    );

  }


  /*
  =======================================================
  PANTALLA DE TIPO PREGUNTA
  =======================================================
  */


  if (
    pantalla.tipo === "pregunta"
  ) {

    const opciones =
      document.createElement("div");


    opciones.className =
      "options";


    if (
      Array.isArray(
        pantalla.opciones
      )
    ) {

      pantalla.opciones.forEach(
        opcion => {

          const boton =
            document.createElement("button");


          boton.className =
            "option-btn";


          boton.type =
            "button";


          boton.innerHTML =
            opcion.texto ||
            opcion.text ||
            "";


          boton.onclick =
            () => {

              mostrarPantalla(
                opcion.siguiente
              );

            };


          opciones.appendChild(
            boton
          );

        }
      );

    }


    app.appendChild(
      opciones
    );

  }


  /*
  =======================================================
  PANTALLA DE TIPO RESULTADO
  =======================================================
  */


  if (
    pantalla.tipo === "resultado"
  ) {

    const resultado =
      document.createElement("div");


    resultado.className =
      "result " +
      (
        pantalla.clase ||
        ""
      );


    resultado.innerHTML =
      pantalla.contenido ||
      "";


    app.appendChild(
      resultado
    );

  }


  /*
  =======================================================
  PANTALLA DE TIPO BUSCADOR
  =======================================================
  */


  if (
    pantalla.tipo === "buscador"
  ) {

    crearBuscador();

  }


  /*
  =======================================================
  PANTALLA DE TIPO FIN
  =======================================================
  */


  if (
    pantalla.tipo === "fin"
  ) {

    const resultado =
      document.createElement("div");


    resultado.className =
      "result " +
      (
        pantalla.clase ||
        ""
      );


    resultado.innerHTML =
      pantalla.contenido ||
      "";


    app.appendChild(
      resultado
    );


    const fin =
      document.createElement("div");


    fin.className =
      "finish";


    fin.innerHTML =
      `
        <div class="finish-icon">
          ✓
        </div>
      `;


    app.appendChild(
      fin
    );

  }


  /*
  =======================================================
  NAVEGACIÓN
  =======================================================
  */


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


  /*
  BOTÓN ATRÁS
  */


  const botonAtras =
    document.createElement("button");


  botonAtras.className =
    "btn btn-secondary";


  botonAtras.type =
    "button";


  botonAtras.textContent =
    "← Atrás";


  botonAtras.onclick =
    volverAtras;


  if (
    historial.length === 0
  ) {

    botonAtras.disabled =
      true;


    botonAtras.style.opacity =
      "0.4";

  }


  /*
  BOTÓN REINICIAR
  */


  const botonInicio =
    document.createElement("button");


  botonInicio.className =
    "btn btn-secondary";


  botonInicio.type =
    "button";


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


/*
=========================================================
VOLVER ATRÁS
=========================================================
*/


function volverAtras() {

  if (
    historial.length === 0
  ) {

    return;

  }


  pantallaActual =
    historial.pop();


  renderActual();

}


/*
=========================================================
REINICIAR
=========================================================
*/


function reiniciar() {

  historial =
    [];


  pantallaActual =
    "inicio";


  especieSeleccionada =
    null;


  window.especieSeleccionada =
    null;


  renderActual();

}


/*
=========================================================
ACTUALIZAR PROGRESO
=========================================================
*/


function actualizarProgreso() {

  const pasos = {

    inicio: 0,

    identificacion: 0,

    buscador: 0,

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
    (
      paso /
      total
    ) *
    100;


  if (
    progressFill
  ) {

    progressFill.style.width =
      porcentaje +
      "%";

  }


  if (
    progressText
  ) {

    progressText.textContent =
      paso === 0

        ? "Inicio"

        : `Paso ${paso} de ${total}`;

  }

}


/*
=========================================================
OBTENER VALOR DE UN CAMPO
=========================================================

Permite que el buscador funcione aunque el JSON
utilice diferentes nombres de campo.

=========================================================
*/


function obtenerCampo(
  objeto,
  posiblesCampos
) {

  if (
    !objeto ||
    typeof objeto !== "object"
  ) {

    return "";

  }


  for (
    const campo of posiblesCampos
  ) {

    if (
      objeto[campo] !== undefined &&
      objeto[campo] !== null &&
      String(
        objeto[campo]
      ).trim() !== ""
    ) {

      return String(
        objeto[campo]
      ).trim();

    }

  }


  return "";

}


/*
=========================================================
OBTENER NOMBRE COMÚN
=========================================================
*/


function obtenerNombreComun(
  especie
) {

  return obtenerCampo(
    especie,
    [
      "nombre_comun",
      "nombreComun",
      "nombre",
      "especie",
      "common_name",
      "commonName"
    ]
  );

}


/*
=========================================================
OBTENER NOMBRE CIENTÍFICO
=========================================================
*/


function obtenerNombreCientifico(
  especie
) {

  return obtenerCampo(
    especie,
    [
      "nombre_cientifico",
      "nombreCientifico",
      "cientifico",
      "nombre_cientifico",
      "scientific_name",
      "scientificName"
    ]
  );

}


/*
=========================================================
OBTENER GRUPO
=========================================================
*/


function obtenerGrupo(
  especie
) {

  return obtenerCampo(
    especie,
    [
      "grupo",
      "grupo_taxonomico",
      "grupoTaxonomico",
      "taxon",
      "tipo"
    ]
  );

}


/*
=========================================================
OBTENER ORIGEN
=========================================================
*/


function obtenerOrigen(
  especie
) {

  return obtenerCampo(
    especie,
    [
      "origen",
      "procedencia"
    ]
  );

}


/*
=========================================================
BUSCADOR DE ESPECIES
=========================================================
*/


function crearBuscador() {

  const contenedor =
    document.createElement("div");


  contenedor.className =
    "species-search";


  /*
  CAMPO DE BÚSQUEDA
  */


  const input =
    document.createElement("input");


  input.className =
    "search-box";


  input.type =
    "search";


  input.placeholder =
    "Escribe el nombre común o científico...";


  input.autocomplete =
    "off";


  /*
  RESULTADOS
  */


  const resultados =
    document.createElement("div");


  resultados.className =
    "search-results";


  /*
  MENSAJE INICIAL
  */


  const mensaje =
    document.createElement("p");


  mensaje.className =
    "small-note";


  mensaje.textContent =
    "Puedes buscar por nombre común o nombre científico.";


  contenedor.appendChild(
    input
  );


  contenedor.appendChild(
    mensaje
  );


  contenedor.appendChild(
    resultados
  );


  app.appendChild(
    contenedor
  );


  /*
  =======================================================
  EVENTO DE BÚSQUEDA
  =======================================================
  */


  input.addEventListener(
    "input",
    function () {

      const texto =
        normalizar(
          input.value
        );


      resultados.innerHTML =
        "";


      if (
        !texto
      ) {

        return;

      }


      /*
      COMPROBAMOS QUE EL JSON ESTÁ CARGADO
      */


      if (
        !Array.isArray(especies) ||
        especies.length === 0
      ) {

        resultados.innerHTML =
          `

            <div class="result warning">

              <p>
                No se ha podido cargar
                la base de datos de especies.
              </p>

              <p class="small-note">

                Comprueba que el archivo
                <strong>especies.json</strong>
                está en la misma carpeta que
                <strong>app.js</strong>.

              </p>

            </div>

          `;


        return;

      }


      /*
      =====================================================
      FILTRAR ESPECIES
      =====================================================
      */


      const encontrados =
        especies.filter(
          especie => {

            const nombreComun =
              normalizar(
                obtenerNombreComun(
                  especie
                )
              );


            const nombreCientifico =
              normalizar(
                obtenerNombreCientifico(
                  especie
                )
              );


            const grupo =
              normalizar(
                obtenerGrupo(
                  especie
                )
              );


            return (

              nombreComun.includes(
                texto
              )

              ||

              nombreCientifico.includes(
                texto
              )

              ||

              grupo.includes(
                texto
              )

            );

          }
        );


      /*
      =====================================================
      SIN RESULTADOS
      =====================================================
      */


      if (
        encontrados.length === 0
      ) {

        resultados.innerHTML =
          `

            <div class="result">

              <p>
                No se han encontrado especies
                que coincidan con la búsqueda.
              </p>

            </div>

          `;


        return;

      }


      /*
      =====================================================
      MOSTRAR RESULTADOS
      =====================================================
      */


      encontrados.forEach(
        especie => {

          const item =
            document.createElement("div");


          item.className =
            "species-result";


          /*
          DATOS DE LA ESPECIE
          */


          const nombreComun =
            obtenerNombreComun(
              especie
            ) ||
            "Nombre común no disponible";


          const nombreCientifico =
            obtenerNombreCientifico(
              especie
            ) ||
            "Nombre científico no disponible";


          const grupo =
            obtenerGrupo(
              especie
            ) ||
            "No especificado";


          const origen =
            obtenerOrigen(
              especie
            ) ||
            "No especificado";


          const clasificacion =
            obtenerClasificacion(
              especie
            );


          const proteccion =
            obtenerProteccion(
              especie
            );


          /*
          HTML DEL RESULTADO
          */


          item.innerHTML =
            `

              <div class="species-name">

                <strong>
                  ${nombreComun}
                </strong>

              </div>


              <div class="species-scientific">

                <em>
                  ${nombreCientifico}
                </em>

              </div>


              <div class="species-info">

                <span>

                  <strong>
                    Grupo:
                  </strong>

                  ${grupo}

                </span>


                <span>

                  <strong>
                    Origen:
                  </strong>

                  ${origen}

                </span>


                <span>

                  <strong>
                    Clasificación:
                  </strong>

                  ${clasificacion}

                </span>


                ${
                  proteccion

                    ? `

                      <span>

                        <strong>
                          Protección:
                        </strong>

                        ${proteccion}

                      </span>

                    `

                    : ""

                }

              </div>

            `;


          /*
          SELECCIONAR ESPECIE
          */


          item.addEventListener(
            "click",
            function () {

              seleccionarEspecie(
                especie
              );

            }
          );


          resultados.appendChild(
            item
          );

        }
      );

    }
  );


  /*
  =======================================================
  PERMITIR ENTER
  =======================================================
  */


  input.addEventListener(
    "keydown",
    function (evento) {

      if (
        evento.key === "Enter"
      ) {

        const primerResultado =
          resultados.querySelector(
            ".species-result"
          );


        if (
          primerResultado
        ) {

          primerResultado.click();

        }

      }

    }
  );

}


/*
=========================================================
SELECCIÓN DE ESPECIE
=========================================================
*/


function seleccionarEspecie(
  especie
) {

  especieSeleccionada =
    especie;


  window.especieSeleccionada =
    especie;


  const nombreComun =
    obtenerNombreComun(
      especie
    ) ||
    "Nombre común no disponible";


  const nombreCientifico =
    obtenerNombreCientifico(
      especie
    ) ||
    "Nombre científico no disponible";


  const grupo =
    obtenerGrupo(
      especie
    ) ||
    "No especificado";


  const origen =
    obtenerOrigen(
      especie
    ) ||
    "No especificado";


  const clasificacion =
    obtenerClasificacion(
      especie
    );


  const proteccion =
    obtenerProteccion(
      especie
    );


  app.innerHTML =
    "";


  actualizarProgreso();


  const titulo =
    document.createElement("h2");


  titulo.textContent =
    "Animal seleccionado";


  app.appendChild(
    titulo
  );


  const resultado =
    document.createElement("div");


  resultado.className =
    "result";


  resultado.innerHTML =
    `

      <h3>
        ${nombreComun}
      </h3>


      <p>

        <strong>
          Nombre científico:
        </strong>

        <em>
          ${nombreCientifico}
        </em>

      </p>


      <p>

        <strong>
          Grupo:
        </strong>

        ${grupo}

      </p>


      <p>

        <strong>
          Origen:
        </strong>

        ${origen}

      </p>


      <p>

        <strong>
          Clasificación para el protocolo:
        </strong>

        ${clasificacion}

      </p>


      ${
        proteccion

          ? `

            <p class="small-note">

              <strong>
                Grado de protección:
              </strong>

              ${proteccion}

            </p>

          `

          : ""

      }


      <p class="small-note">

        La especie ha sido identificada
        en la base de datos del CRF.

      </p>

    `;


  app.appendChild(
    resultado
  );


  /*
  =======================================================
  BOTÓN VOLVER A BUSCAR
  =======================================================
  */


  const botonBuscar =
    document.createElement("button");


  botonBuscar.className =
    "btn btn-secondary";


  botonBuscar.type =
    "button";


  botonBuscar.textContent =
    "🔎 Buscar otra especie";


  botonBuscar.onclick =
    function () {

      mostrarPantalla(
        "buscador"
      );

    };


  app.appendChild(
    botonBuscar
  );


  /*
  =======================================================
  BOTÓN CONTINUAR
  =======================================================
  */


  const botonContinuar =
    document.createElement("button");


  botonContinuar.className =
    "btn btn-primary";


  botonContinuar.type =
    "button";


  botonContinuar.textContent =
    "Continuar con el protocolo";


  botonContinuar.onclick =
    function () {

      continuarConEspecie(
        especie
      );

    };


  app.appendChild(
    botonContinuar
  );


  crearNavegacion();

}


/*
=========================================================
CLASIFICACIÓN AUTOMÁTICA
=========================================================

Reglas:

- Nativa → Animal silvestre autóctono
- Doméstico → Animal doméstico
- Exótico + Invasora → Animal catalogado como invasor
- Exótico + CITES → Animal exótico CITES
- Exótico → Animal exótico no catalogado como invasor

=========================================================
*/


function obtenerClasificacion(
  especie
) {

  const origen =
    normalizar(
      obtenerOrigen(
        especie
      )
    );


  const proteccion =
    normalizar(
      especie.grado_proteccion ||
      especie.gradoProteccion ||
      ""
    );


  const cites =
    especie.cites === true ||
    normalizar(
      especie.cites
    ) === "true" ||
    normalizar(
      especie.cites
    ) === "si";


  /*
  ANIMAL DOMÉSTICO
  */


  if (
    origen.includes(
      "domestico"
    )
  ) {

    return "Animal doméstico";

  }


  /*
  ANIMAL EXÓTICO
  */


  if (
    origen.includes(
      "exotico"
    )
  ) {

    /*
    INVASORA
    */


    if (
      proteccion.includes(
        "invasora"
      )
    ) {

      return "Animal catalogado como invasor";

    }


    /*
    CITES
    */


    if (
      cites
    ) {

      return "Animal exótico CITES";

    }


    /*
    EXÓTICO NO INVASOR
    */


    return "Animal exótico no catalogado como invasor";

  }


  /*
  ANIMAL NATIVO
  */


  if (
    origen.includes(
      "nativa"
    ) ||
    origen.includes(
      "autoctono"
    ) ||
    origen.includes(
      "autóctono"
    )
  ) {

    return "Animal silvestre autóctono";

  }


  /*
  CLASIFICACIÓN DESCONOCIDA
  */


  return "Clasificación no determinada";

}


/*
=========================================================
GRADO DE PROTECCIÓN
=========================================================
*/


function obtenerProteccion(
  especie
) {

  const proteccion =
    especie.grado_proteccion ??
    especie.gradoProteccion ??
    "";


  if (
    !proteccion
  ) {

    return "";

  }


  if (
    String(
      proteccion
    ) === "0"
  ) {

    return "";

  }


  return proteccion;

}


/*
=========================================================
CONTINUAR CON ESPECIE
=========================================================

Esta función busca primero si la especie tiene definida
una rama concreta del protocolo.

Campos admitidos en especies.json:

- rama_protocolo
- ramaProtocolo
- protocolo
- pantalla_protocolo
- pantallaProtocolo

Ejemplo:

{
  "nombre_comun": "Jabalí",
  "nombre_cientifico": "Sus scrofa",
  "origen": "Nativa",
  "rama_protocolo": "cazaMayor"
}

Si existe esa rama y coincide con una pantalla válida,
el sistema lleva directamente a ella.

Si todavía no existe esa conexión en el JSON,
se muestra la clasificación y se puede continuar
manualmente por el protocolo.

=========================================================
*/


function obtenerRamaProtocolo(
  especie
) {

  const rama =
    obtenerCampo(
      especie,
      [
        "rama_protocolo",
        "ramaProtocolo",
        "protocolo",
        "pantalla_protocolo",
        "pantallaProtocolo"
      ]
    );


  if (
    !rama
  ) {

    return "";

  }


  return rama;

}


/*
=========================================================
CONTINUAR CON ESPECIE
=========================================================
*/


function continuarConEspecie(
  especie
) {

  /*
  Primero comprobamos si la especie tiene
  una rama específica del protocolo.
  */


  const rama =
    obtenerRamaProtocolo(
      especie
    );


  /*
  Si la rama existe y está definida
  en el objeto pantallas, vamos directamente
  a ella.
  */


  if (
    rama &&
    pantallas[rama]
  ) {

    mostrarPantalla(
      rama
    );

    return;

  }


  /*
  Si todavía no hay rama específica,
  mostramos la clasificación.
  */


  const clasificacion =
    obtenerClasificacion(
      especie
    );


  let mensaje =
    "";


  if (
    clasificacion ===
    "Animal doméstico"
  ) {

    mensaje =
      "Esta especie corresponde a la categoría de animal doméstico.";

  }


  else if (
    clasificacion ===
    "Animal catalogado como invasor"
  ) {

    mensaje =
      "Esta especie corresponde a la categoría de animal catalogado como invasor.";

  }


  else if (
    clasificacion ===
    "Animal exótico CITES"
  ) {

    mensaje =
      "Esta especie corresponde a la categoría de animal exótico CITES.";

  }


  else if (
    clasificacion ===
    "Animal exótico no catalogado como invasor"
  ) {

    mensaje =
      "Esta especie corresponde a la categoría de animal exótico no catalogado como invasor.";

  }


  else if (
    clasificacion ===
    "Animal silvestre autóctono"
  ) {

    mensaje =
      "Esta especie corresponde a la categoría de animal silvestre autóctono.";

  }


  else {

    mensaje =
      "No se ha podido determinar automáticamente la categoría.";

  }


  app.innerHTML =
    "";


  actualizarProgreso();


  const titulo =
    document.createElement("h2");


  titulo.textContent =
    "Clasificación del animal";


  app.appendChild(
    titulo
  );


  const resultado =
    document.createElement("div");


  resultado.className =
    "result";


  resultado.innerHTML =
    `

      <h3>
        ${obtenerNombreComun(especie)}
      </h3>


      <p>
        ${mensaje}
      </p>


      <p class="small-note">

        Esta especie todavía no tiene
        una rama específica del protocolo
        asignada en especies.json.

      </p>

    `;


  app.appendChild(
    resultado
  );


  /*
  BOTÓN PARA CONTINUAR MANUALMENTE
  */


  const botonManual =
    document.createElement("button");


  botonManual.className =
    "btn btn-primary";


  botonManual.type =
    "button";


  botonManual.textContent =
    "Continuar manualmente con el protocolo";


  botonManual.onclick =
    function () {

      mostrarPantalla(
        "tipoAnimal"
      );

    };


  app.appendChild(
    botonManual
  );


  crearNavegacion();

}


/*
=========================================================
NORMALIZACIÓN DE TEXTO
=========================================================
*/


function normalizar(
  texto
) {

  return String(
    texto ||
    ""
  )

    .toLowerCase()

    .normalize(
      "NFD"
    )

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .trim();

}


/*
=========================================================
PANTALLAS DEL PROTOCOLO
=========================================================

A PARTIR DE AQUÍ SE MANTIENE EL CONTENIDO
DEL PROTOCOLO ORIGINAL.

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


  buscador: {

    tipo:
      "buscador",

    titulo:
      "🔎 Buscar animal",

    descripcion:
      "Busca el animal por su nombre común o científico. Selecciona el resultado que corresponda."

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


  volantónNoDevolver: {

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


  volantónNoDevolver: {

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


async function iniciarAplicacion() {

  await cargarEspecies();


  mostrarPantalla(
    "inicio",
    false
  );

}


iniciarAplicacion();
```
