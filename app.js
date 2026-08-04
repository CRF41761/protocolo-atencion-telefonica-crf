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

let pantallaActual =
  "inicio";

let especies = [];


/*
=========================================================
CARGA DE ESPECIES DESDE JSON
=========================================================
*/

async function cargarEspecies() {

  try {

    console.log(
      "Intentando cargar especies.json..."
    );


    const respuesta =
      await fetch(
        "./especies.json",
        {
          cache: "no-store"
        }
      );


    if (!respuesta.ok) {

      throw new Error(
        `Error HTTP ${respuesta.status}`
      );

    }


    const datos =
      await respuesta.json();


    /*
    Comprobamos que el JSON sea un array.
    */

    if (!Array.isArray(datos)) {

      throw new Error(
        "El archivo especies.json no contiene un array."
      );

    }


    especies =
      datos;


    console.log(
      `Especies cargadas correctamente: ${especies.length}`
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


function mostrarPantalla(
  id
) {

  if (
    pantallaActual !== id
  ) {

    historial.push(
      pantallaActual
    );

  }


  pantallaActual =
    id;


  const pantalla =
    pantallas[id];


  if (!pantalla) {

    console.error(
      "Pantalla no encontrada:",
      id
    );

    return;

  }


  app.innerHTML =
    "";


  actualizarProgreso();


  const titulo =
    document.createElement(
      "h2"
    );

  titulo.textContent =
    pantalla.titulo;

  app.appendChild(
    titulo
  );


  if (
    pantalla.descripcion
  ) {

    const descripcion =
      document.createElement(
        "p"
      );

    descripcion.className =
      "description";

    descripcion.innerHTML =
      pantalla.descripcion;

    app.appendChild(
      descripcion
    );

  }


  /*
  =========================================
  PANTALLA DE PREGUNTA
  =========================================
  */

  if (
    pantalla.tipo ===
    "pregunta"
  ) {

    const opciones =
      document.createElement(
        "div"
      );

    opciones.className =
      "options";


    pantalla.opciones.forEach(
      opcion => {

        const boton =
          document.createElement(
            "button"
          );

        boton.className =
          "option-btn";


        boton.innerHTML =
          opcion.texto ||
          opcion.text ||
          "";


        boton.onclick =
          () => mostrarPantalla(
            opcion.siguiente
          );


        opciones.appendChild(
          boton
        );

      }
    );


    app.appendChild(
      opciones
    );

  }


  /*
  =========================================
  PANTALLA DE RESULTADO
  =========================================
  */

  if (
    pantalla.tipo ===
    "resultado"
  ) {

    const resultado =
      document.createElement(
        "div"
      );

    resultado.className =
      "result " +
      (
        pantalla.clase ||
        ""
      );


    resultado.innerHTML =
      pantalla.contenido;


    app.appendChild(
      resultado
    );

  }


  /*
  =========================================
  BUSCADOR
  =========================================
  */

  if (
    pantalla.tipo ===
    "buscador"
  ) {

    crearBuscador();

  }


  /*
  =========================================
  PANTALLA FINAL
  =========================================
  */

  if (
    pantalla.tipo ===
    "fin"
  ) {

    const resultado =
      document.createElement(
        "div"
      );

    resultado.className =
      "result " +
      (
        pantalla.clase ||
        ""
      );


    resultado.innerHTML =
      pantalla.contenido;


    app.appendChild(
      resultado
    );


    const fin =
      document.createElement(
        "div"
      );

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


  crearNavegacion();

}


/*
=========================================================
NAVEGACIÓN
=========================================================
*/


function crearNavegacion() {

  const navegacion =
    document.createElement(
      "div"
    );

  navegacion.className =
    "navigation";


  const botonAtras =
    document.createElement(
      "button"
    );

  botonAtras.className =
    "btn btn-secondary";

  botonAtras.textContent =
    "← Atrás";


  botonAtras.onclick =
    volverAtras;


  if (
    historial.length ===
    0
  ) {

    botonAtras.disabled =
      true;

    botonAtras.style.opacity =
      "0.4";

  }


  const botonInicio =
    document.createElement(
      "button"
    );

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


/*
=========================================================
VOLVER ATRÁS
=========================================================
*/


function volverAtras() {

  if (
    historial.length ===
    0
  ) {

    return;

  }


  pantallaActual =
    historial.pop();


  renderActual();

}


/*
=========================================================
RENDERIZAR PANTALLA ACTUAL
=========================================================
*/


function renderActual() {

  const id =
    pantallaActual;


  const pantalla =
    pantallas[id];


  if (!pantalla) {

    console.error(
      "Pantalla no encontrada:",
      id
    );

    return;

  }


  app.innerHTML =
    "";


  actualizarProgreso();


  const titulo =
    document.createElement(
      "h2"
    );

  titulo.textContent =
    pantalla.titulo;


  app.appendChild(
    titulo
  );


  if (
    pantalla.descripcion
  ) {

    const descripcion =
      document.createElement(
        "p"
      );

    descripcion.className =
      "description";


    descripcion.innerHTML =
      pantalla.descripcion;


    app.appendChild(
      descripcion
    );

  }


  /*
  =========================================
  PREGUNTA
  =========================================
  */

  if (
    pantalla.tipo ===
    "pregunta"
  ) {

    const opciones =
      document.createElement(
        "div"
      );

    opciones.className =
      "options";


    pantalla.opciones.forEach(
      opcion => {

        const boton =
          document.createElement(
            "button"
          );

        boton.className =
          "option-btn";


        boton.innerHTML =
          opcion.texto ||
          opcion.text ||
          "";


        boton.onclick =
          () => mostrarPantalla(
            opcion.siguiente
          );


        opciones.appendChild(
          boton
        );

      }
    );


    app.appendChild(
      opciones
    );

  }


  /*
  =========================================
  RESULTADO
  =========================================
  */

  if (
    pantalla.tipo ===
    "resultado"
  ) {

    const resultado =
      document.createElement(
        "div"
      );

    resultado.className =
      "result " +
      (
        pantalla.clase ||
        ""
      );


    resultado.innerHTML =
      pantalla.contenido;


    app.appendChild(
      resultado
    );

  }


  /*
  =========================================
  BUSCADOR
  =========================================
  */

  if (
    pantalla.tipo ===
    "buscador"
  ) {

    crearBuscador();

  }


  /*
  =========================================
  FIN
  =========================================
  */

  if (
    pantalla.tipo ===
    "fin"
  ) {

    const resultado =
      document.createElement(
        "div"
      );


    resultado.className =
      "result " +
      (
        pantalla.clase ||
        ""
      );


    resultado.innerHTML =
      pantalla.contenido;


    app.appendChild(
      resultado
    );

  }


  crearNavegacion();

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


  mostrarPantalla(
    "inicio"
  );

}


/*
=========================================================
PROGRESO
=========================================================
*/


function actualizarProgreso() {

  const pasos = {

    inicio: 0,

    tipoAnimal: 1,

    vivoMuerto: 2,

    casosEspeciales: 3,

    paso5: 4

  };


  const paso =
    pasos[pantallaActual] ??
    1;


  const total =
    5;


  const porcentaje =
    (
      paso /
      total
    ) *
    100;


  progressFill.style.width =
    porcentaje +
    "%";


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

  const contenedor =
    document.createElement(
      "div"
    );


  contenedor.className =
    "species-search";


  /*
  =========================================
  INPUT DE BÚSQUEDA
  =========================================
  */

  const input =
    document.createElement(
      "input"
    );


  input.className =
    "search-box";


  input.placeholder =
    "Escribe el nombre común o científico...";


  input.type =
    "search";


  /*
  =========================================
  CONTENEDOR DE RESULTADOS
  =========================================
  */

  const resultados =
    document.createElement(
      "div"
    );


  resultados.className =
    "search-results";


  /*
  =========================================
  MENSAJE INFORMATIVO
  =========================================
  */

  const mensaje =
    document.createElement(
      "p"
    );


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
  =========================================
  EVENTO DE BÚSQUEDA
  =========================================
  */

  input.addEventListener(
    "input",
    function () {

      realizarBusqueda(
        input.value,
        resultados
      );

    }
  );


  /*
  Permite que el buscador
  reciba automáticamente el foco.
  */

  setTimeout(
    () => input.focus(),
    50
  );

}


/*
=========================================================
REALIZAR BÚSQUEDA
=========================================================
*/


function realizarBusqueda(
  textoBusqueda,
  contenedorResultados
) {

  contenedorResultados.innerHTML =
    "";


  /*
  Normalizamos el texto escrito
  */

  const texto =
    normalizar(
      textoBusqueda
    );


  /*
  Si no se ha escrito nada,
  no mostramos resultados.
  */

  if (
    !texto
  ) {

    return;

  }


  /*
  =========================================
  COMPROBAR CARGA DEL JSON
  =========================================
  */

  if (
    !Array.isArray(
      especies
    ) ||
    especies.length ===
    0
  ) {

    contenedorResultados.innerHTML = `

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
  =========================================
  FILTRAR ESPECIES
  =========================================
  */

  const encontrados =
    especies.filter(
      especie => {

        if (
          !especie ||
          typeof especie !==
          "object"
        ) {

          return false;

        }


        /*
        Admitimos los nombres de campo
        principales.
        */

        const nombreComun =
          normalizar(
            especie.nombre_comun ||
            especie.nombreComun ||
            especie.nombre ||
            ""
          );


        const nombreCientifico =
          normalizar(
            especie.nombre_cientifico ||
            especie.nombreCientifico ||
            especie.scientific_name ||
            especie.scientificName ||
            ""
          );


        /*
        También permitimos buscar
        por grupo.
        */

        const grupo =
          normalizar(
            especie.grupo ||
            ""
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
  =========================================
  SIN RESULTADOS
  =========================================
  */

  if (
    encontrados.length ===
    0
  ) {

    contenedorResultados.innerHTML = `

      <div class="result">

        <p>
          No se han encontrado especies
          que coincidan con:
          <strong>
            ${escaparHTML(
              textoBusqueda
            )}
          </strong>
        </p>

        <p class="small-note">

          Prueba con otro nombre común
          o científico.

        </p>

      </div>

    `;


    return;

  }


  /*
  =========================================
  MOSTRAR RESULTADOS
  =========================================
  */

  encontrados.forEach(
    especie => {

      crearResultadoEspecie(
        especie,
        contenedorResultados
      );

    }
  );

}


/*
=========================================================
CREAR RESULTADO DE ESPECIE
=========================================================
*/


function crearResultadoEspecie(
  especie,
  contenedor
) {

  const item =
    document.createElement(
      "div"
    );


  item.className =
    "species-result";


  /*
  =========================================
  DATOS DE LA ESPECIE
  =========================================
  */

  const nombreComun =
    especie.nombre_comun ||
    especie.nombreComun ||
    especie.nombre ||
    "Nombre común no disponible";


  const nombreCientifico =
    especie.nombre_cientifico ||
    especie.nombreCientifico ||
    especie.scientific_name ||
    especie.scientificName ||
    "Nombre científico no disponible";


  const grupo =
    especie.grupo ||
    "No especificado";


  const origen =
    especie.origen ||
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
  =========================================
  HTML DEL RESULTADO
  =========================================
  */

  item.innerHTML = `

    <div class="species-name">

      <strong>
        ${escaparHTML(
          nombreComun
        )}
      </strong>

    </div>


    <div class="species-scientific">

      <em>
        ${escaparHTML(
          nombreCientifico
        )}
      </em>

    </div>


    <div class="species-info">

      <span>

        <strong>
          Grupo:
        </strong>

        ${escaparHTML(
          grupo
        )}

      </span>


      <span>

        <strong>
          Origen:
        </strong>

        ${escaparHTML(
          origen
        )}

      </span>


      <span>

        <strong>
          Clasificación:
        </strong>

        ${escaparHTML(
          clasificacion
        )}

      </span>


      ${
        proteccion

          ? `

            <span>

              <strong>
                Protección:
              </strong>

              ${escaparHTML(
                proteccion
              )}

            </span>

          `

          : ""

      }

    </div>

  `;


  /*
  =========================================
  SELECCIONAR ESPECIE
  =========================================
  */

  item.addEventListener(
    "click",
    () => {

      seleccionarEspecie(
        especie
      );

    }
  );


  contenedor.appendChild(
    item
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

  const nombreComun =
    especie.nombre_comun ||
    especie.nombreComun ||
    especie.nombre ||
    "Nombre común no disponible";


  const nombreCientifico =
    especie.nombre_cientifico ||
    especie.nombreCientifico ||
    especie.scientific_name ||
    especie.scientificName ||
    "Nombre científico no disponible";


  const grupo =
    especie.grupo ||
    "No especificado";


  const origen =
    especie.origen ||
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
    document.createElement(
      "h2"
    );


  titulo.textContent =
    "Animal seleccionado";


  app.appendChild(
    titulo
  );


  const resultado =
    document.createElement(
      "div"
    );


  resultado.className =
    "result";


  resultado.innerHTML = `

    <h3>
      ${escaparHTML(
        nombreComun
      )}
    </h3>


    <p>

      <strong>
        Nombre científico:
      </strong>

      <em>
        ${escaparHTML(
          nombreCientifico
        )}
      </em>

    </p>


    <p>

      <strong>
        Grupo:
      </strong>

      ${escaparHTML(
        grupo
      )}

    </p>


    <p>

      <strong>
        Origen:
      </strong>

      ${escaparHTML(
        origen
      )}

    </p>


    <p>

      <strong>
        Clasificación para el protocolo:
      </strong>

      ${escaparHTML(
        clasificacion
      )}

    </p>


    ${
      proteccion

        ? `

          <p class="small-note">

            <strong>
              Grado de protección:
            </strong>

            ${escaparHTML(
              proteccion
            )}

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
  =========================================
  BOTÓN VOLVER A BUSCAR
  =========================================
  */

  const botonBuscar =
    document.createElement(
      "button"
    );


  botonBuscar.className =
    "btn btn-secondary";


  botonBuscar.textContent =
    "🔎 Buscar otra especie";


  botonBuscar.onclick =
    () => mostrarPantalla(
      "buscador"
    );


  app.appendChild(
    botonBuscar
  );


  /*
  =========================================
  BOTÓN CONTINUAR
  =========================================
  */

  const botonContinuar =
    document.createElement(
      "button"
    );


  botonContinuar.className =
    "btn btn-primary";


  botonContinuar.textContent =
    "Continuar con el protocolo";


  botonContinuar.onclick =
    () => continuarConEspecie(
      especie
    );


  app.appendChild(
    botonContinuar
  );


  crearNavegacion();

}


/*
=========================================================
CLASIFICACIÓN AUTOMÁTICA
=========================================================
*/


function obtenerClasificacion(
  especie
) {

  const origen =
    normalizar(
      especie.origen ||
      ""
    );


  const proteccion =
    normalizar(
      especie.grado_proteccion ||
      especie.gradoProteccion ||
      ""
    );


  const cites =
    especie.cites === true ||
    especie.cites === "true" ||
    especie.cites === "TRUE";


  /*
  DOMÉSTICO
  */

  if (
    origen.includes(
      "domestico"
    )
  ) {

    return "Animal doméstico";

  }


  /*
  EXÓTICO
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
    EXÓTICO NORMAL
    */

    return "Animal exótico no catalogado como invasor";

  }


  /*
  NATIVA
  */

  if (
    origen.includes(
      "nativa"
    )
  ) {

    return "Animal silvestre autóctono";

  }


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
    especie.grado_proteccion ||
    especie.gradoProteccion;


  if (
    !proteccion
  ) {

    return "";

  }


  if (
    String(
      proteccion
    ).trim() ===
    "0"
  ) {

    return "";

  }


  return String(
    proteccion
  );

}


/*
=========================================================
CONTINUAR CON ESPECIE
=========================================================

IMPORTANTE:

ESTA FUNCIÓN TODAVÍA NO CONECTA
LA ESPECIE CON LA RAMA DEL PROTOCOLO.

SE MANTIENE TEMPORALMENTE PARA
NO MODIFICAR EL FUNCIONAMIENTO ACTUAL.

=========================================================
*/


function continuarConEspecie(
  especie
) {

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
    document.createElement(
      "h2"
    );


  titulo.textContent =
    "Clasificación del animal";


  app.appendChild(
    titulo
  );


  const resultado =
    document.createElement(
      "div"
    );


  resultado.className =
    "result";


  resultado.innerHTML = `

    <h3>

      ${escaparHTML(
        especie.nombre_comun ||
        especie.nombreComun ||
        especie.nombre ||
        ""
      )}

    </h3>


    <p>
      ${mensaje}
    </p>


    <p class="small-note">

      La conexión automática con el flujo
      específico del protocolo se incorporará
      en el siguiente paso.

    </p>

  `;


  app.appendChild(
    resultado
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
ESCAPAR HTML
=========================================================

Evita que caracteres especiales
del JSON rompan el HTML.

=========================================================
*/


function escaparHTML(
  texto
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(
      texto ||
      ""
    );


  return div.innerHTML;

}


/*
=========================================================
PANTALLAS DEL PROTOCOLO
=========================================================

A PARTIR DE AQUÍ:

MANTÉN EXACTAMENTE EL OBJETO
"pantallas" QUE YA TIENES.

=========================================================
*/


const pantallas = {

  /*
  PEGA AQUÍ EL OBJETO "pantallas"
  COMPLETO DEL CÓDIGO ORIGINAL.

  No es necesario modificarlo para
  solucionar el buscador.
  */

};


/*
=========================================================
INICIO DE LA APLICACIÓN
=========================================================
*/


async function iniciarAplicacion() {

  await cargarEspecies();


  mostrarPantalla(
    "inicio"
  );

}


iniciarAplicacion();
```
