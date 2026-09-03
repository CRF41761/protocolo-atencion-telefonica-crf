/*
=========================================================
ASISTENTE DE ATENCIÓN TELEFÓNICA
CRF LA GRANJA DE EL SALER

Versión protocolo: 04/08/2026

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

let especiesLista = [];

let especieSeleccionada = null;


/*
=========================================================
CARGA DE ESPECIES DESDE JSON
=========================================================
*/


async function cargarEspecies() {

  try {

    const respuesta = await fetch("especies.json");

    especiesLista = await respuesta.json();

    console.log(
      "Especies cargadas:",
      especiesLista.length
    );

  } catch (error) {

    console.error(
      "Error al cargar especies:",
      error
    );

  }

}


/*
=========================================================
FUNCIONES AUXILIARES PARA ATAJOS
=========================================================
*/


function esGalapagoInvasor(especie) {

  const nombre =
    especie.nombreCientifico.toLowerCase();

  if (nombre.startsWith("pseudemys"))
    return true;

  if (
    nombre.startsWith("mauremys") &&
    nombre !== "mauremys leprosa"
  )
    return true;

  return false;

}


function esCazaMayor(especie) {

  const nombre =
    especie.nombreCientifico;

  const cazaMayor = [
    "Sus scrofa",
    "Capra pyrenaica",
    "Capreolus capreolus",
    "Cervus elaphus",
    "Dama dama"
  ];

  return cazaMayor.includes(nombre);

}


function esTortugaMarina(especie) {

  return especie.nombreCientifico ===
    "Caretta caretta";

}


function esGalapagoAutoctono(especie) {

  const nombre =
    especie.nombreCientifico;

  return nombre === "Emys orbicularis" ||
    nombre === "Mauremys leprosa";

}


function esAve(especie) {

  const grupo = especie.grupo.toUpperCase();
  return grupo.includes("AVES") || 
         grupo.includes("RAPACES") ||
         grupo.includes("PASSERIFORMES") ||
         grupo.includes("CICONIFORMES") ||
         grupo.includes("GRUIFORMES") ||
         grupo.includes("ANATIDAS") ||
         grupo.includes("GALLIFORMES") ||
         grupo.includes("CÓRVIDOS") ||
         grupo.includes("LIMÍCOLAS");

}


function esRapaz(especie) {

  const grupo = especie.grupo.toUpperCase();
  return grupo.includes("RAPACES");

}


function esReptil(especie) {

  return especie.grupo.toUpperCase() === "REPTILES";

}


function esMamifero(especie) {

  const grupo = especie.grupo.toUpperCase();
  return grupo.includes("MAMÍFEROS") || 
         grupo.includes("LAGOMORFOS") ||
         grupo.includes("ROEDORES") ||
         grupo.includes("CARNÍVOROS") ||
         grupo.includes("INSECTÍVOROS") ||
         grupo.includes("MURCIÉLAGOS");

}


function esConejoLiebre(especie) {

  const nombre = especie.nombreCientifico;
  return nombre === "Oryctolagus cuniculus" || 
         nombre === "Lepus granatensis";

}


function esErizo(especie) {

  const nombre = especie.nombreCientifico;
  return nombre === "Erinaceus europaeus" ||
         nombre === "Atelerix algirus" ||
         nombre === "Atelerix albiventris";

}


function tieneCasoEspecialAviso(especie) {

  const nombre =
    especie.nombreComun.toLowerCase();

  return nombre.includes("lechuza") ||
    nombre.includes("cernícalo") ||
    nombre.includes("vencejo") ||
    nombre.includes("golondrina") ||
    nombre.includes("avión") ||
    esConejoLiebre(especie) ||
    esErizo(especie) ||
    esGalapagoAutoctono(especie);

}


function obtenerEtiquetaTipo(especie) {

  if (especie.cites)
    return { texto: "CITES", clase: "badge-cites" };

  if (especie.tipo === "doméstico")
    return { texto: "Doméstico", clase: "badge-domestico" };

  if (especie.tipo === "invasor")
    return { texto: "Invasor", clase: "badge-invasor" };

  if (especie.tipo === "exótico") {
    if (esGalapagoInvasor(especie))
      return { texto: "Invasor", clase: "badge-invasor" };
    return { texto: "Exótico", clase: "badge-exotico" };
  }

  if (especie.tipo === "silvestre_autóctono")
    return { texto: "Autóctono", clase: "badge-autoctono" };

  return { texto: "", clase: "" };

}


/*
=========================================================
OBTENER OPCIONES FILTRADAS DEL PASO 4
=========================================================
*/


function obtenerOpcionesPaso4() {

  if (!especieSeleccionada) {
    return obtenerTodasOpcionesPaso4();
  }

  const opciones = [];
  const especie = especieSeleccionada;

  opciones.push(
    { texto: "🏠 Animal suelto dentro de una vivienda", siguiente: "animalVivienda" },
    { texto: "🦅 Animal no atrapado con problemas (fuera de vivienda)", siguiente: "animalProblemas" },
    { texto: "⚡ Problema por causa antropogénica probable", siguiente: "causaAntropogenica" }
  );

  if (esReptil(especie)) {
    opciones.push(
      { texto: "🐢 Tortuga terrestre propiedad de alguien", siguiente: "tortugaPropiedad" },
      { texto: "🐢 Tortuga terrestre o galápago autóctono en el campo", siguiente: "tortugaCampo" }
    );
  }

  if (esAve(especie)) {
    opciones.push(
      { texto: "🪟 Ave estrellada contra un cristal", siguiente: "cristal" }
    );
    
    if (esRapaz(especie)) {
      const nombre = especie.nombreComun.toLowerCase();
      if (nombre.includes("lechuza") || nombre.includes("cernícalo")) {
        opciones.push(
          { texto: "🪶 Cría de rapaz (lechuza o cernícalo)", siguiente: "criaLechuzaCernicalo" }
        );
      } else {
        opciones.push(
          { texto: "🦅 Cría de rapaz (diferente de lechuza/cernícalo)", siguiente: "criaRapazOtra" }
        );
      }
    } else {
      opciones.push(
        { texto: "🐣 Cría de pajarito (volantón o no)", siguiente: "criaAve" }
      );
    }
  }

  if (esMamifero(especie)) {
    if (esConejoLiebre(especie)) {
      opciones.push(
        { texto: "🐇 Cría de conejo o liebre", siguiente: "conejoLiebre" }
      );
    }
    
    if (esErizo(especie)) {
      opciones.push(
        { texto: " Erizo", siguiente: "erizo" }
      );
    }
  }

  opciones.push(
    { texto: "Ninguno de estos casos → Paso 5", siguiente: "paso5" }
  );

  return opciones;

}


function obtenerTodasOpcionesPaso4() {

  return [
    { texto: " Animal suelto dentro de una vivienda", siguiente: "animalVivienda" },
    { texto: "🦅 Animal no atrapado con problemas (fuera de vivienda)", siguiente: "animalProblemas" },
    { texto: "⚡ Problema por causa antropogénica probable", siguiente: "causaAntropogenica" },
    { texto: "🐢 Tortuga terrestre propiedad de alguien", siguiente: "tortugaPropiedad" },
    { texto: "🐢 Tortuga terrestre o galápago autóctono en el campo", siguiente: "tortugaCampo" },
    { texto: "🪟 Ave estrellada contra un cristal", siguiente: "cristal" },
    { texto: "🐇 Cría de conejo o liebre", siguiente: "conejoLiebre" },
    { texto: "🐝 Panal de abejas o avispas", siguiente: "panal" },
    { texto: "🪰 Avispa asiática", siguiente: "avispaAsiatica" },
    { texto: " Cría de rapaz (lechuza o cernícalo)", siguiente: "criaLechuzaCernicalo" },
    { texto: "🦅 Cría de rapaz (diferente de lechuza/cernícalo)", siguiente: "criaRapazOtra" },
    { texto: "🦔 Erizo", siguiente: "erizo" },
    { texto: "🐣 Cría de pajarito o rapaz (volantón o no)", siguiente: "criaAve" },
    { texto: "Ninguno de estos casos → Paso 5", siguiente: "paso5" }
  ];

}


/*
=========================================================
EJECUTAR ATAJO AL SELECCIONAR ESPECIE
=========================================================
*/


function ejecutarAtajo(especie) {

  especieSeleccionada = especie;

  if (especie.tipo === "doméstico") {
    mostrarPantalla("domestico");
    return;
  }

  if (especie.cites === true) {
    mostrarPantalla("citesPregunta");
    return;
  }

  if (especie.tipo === "invasor") {
    mostrarPantalla("invasor");
    return;
  }

  if (especie.tipo === "exótico") {
    if (esGalapagoInvasor(especie)) {
      mostrarPantalla("invasor");
      return;
    }
    mostrarPantalla("exoticoNoInvasor");
    return;
  }

  if (especie.tipo === "silvestre_autóctono") {

    if (esCazaMayor(especie)) {
      mostrarPantalla("cazaMayor");
      return;
    }

    if (esTortugaMarina(especie)) {
      mostrarPantalla("tortugaMarina");
      return;
    }

    if (esGalapagoAutoctono(especie)) {
      mostrarPantallaConEspecie("tortugaCampo");
      return;
    }

    if (tieneCasoEspecialAviso(especie)) {
      mostrarPantallaConEspecie("casosEspeciales");
      return;
    }

    mostrarPantallaConEspecie("vivoMuerto");
    return;

  }

  mostrarPantalla("tipoAnimal");

}


function mostrarPantallaConEspecie(id) {

  if (pantallaActual !== id) {
    historial.push(pantallaActual);
  }

  pantallaActual = id;

  const pantalla = pantallas[id];

  if (!pantalla) {
    console.error("Pantalla no encontrada:", id);
    return;
  }

  app.innerHTML = "";

  actualizarProgreso();

  if (especieSeleccionada) {
    const ficha = document.createElement("div");
    ficha.className = "selected-species-card";
    ficha.innerHTML = `
      <div class="selected-species-info">
        <h4>🐾 ${especieSeleccionada.nombreComun}</h4>
        <p>${especieSeleccionada.nombreCientifico}</p>
      </div>
      <button class="btn-change-species" onclick="cambiarEspecie()">
        Cambiar
      </button>
    `;
    app.appendChild(ficha);
  }

  const titulo = document.createElement("h2");
  titulo.textContent = pantalla.titulo;
  app.appendChild(titulo);

  if (pantalla.descripcion) {
    const descripcion = document.createElement("p");
    descripcion.className = "description";
    descripcion.innerHTML = pantalla.descripcion;
    app.appendChild(descripcion);
  }

  renderContenidoPantalla(pantalla);

  crearNavegacion();

}


function cambiarEspecie() {

  especieSeleccionada = null;
  mostrarPantalla("buscador");

}


/*
=========================================================
FUNCIONES GENERALES
=========================================================
*/


function renderContenidoPantalla(pantalla) {

  if (pantalla.tipo === "pregunta") {

    const opciones = document.createElement("div");
    opciones.className = "options";

    let opcionesAMostrar = pantalla.opciones;
    
    if (pantallaActual === "casosEspeciales") {
      opcionesAMostrar = obtenerOpcionesPaso4();
    }

    opcionesAMostrar.forEach(opcion => {

      const boton = document.createElement("button");
      boton.className = "option-btn";
      boton.innerHTML = opcion.texto;
      boton.onclick = () => {
        if (pantallaActual !== opcion.siguiente) {
          historial.push(pantallaActual);
        }
        pantallaActual = opcion.siguiente;
        const sig = pantallas[opcion.siguiente];
        
        if (!sig) {
          console.error("Pantalla destino no existe:", opcion.siguiente);
          return;
        }
        
        app.innerHTML = "";
        actualizarProgreso();

        const titulo = document.createElement("h2");
        titulo.textContent = sig.titulo;
        app.appendChild(titulo);

        if (especieSeleccionada &&
            ["vivoMuerto", "casosEspeciales", "tortugaCampo"].includes(opcion.siguiente)) {
          const ficha = document.createElement("div");
          ficha.className = "selected-species-card";
          ficha.innerHTML = `
            <div class="selected-species-info">
              <h4>🐾 ${especieSeleccionada.nombreComun}</h4>
              <p>${especieSeleccionada.nombreCientifico}</p>
            </div>
            <button class="btn-change-species" onclick="cambiarEspecie()">
              Cambiar
            </button>
          `;
          app.appendChild(ficha);
        }

        if (sig.descripcion) {
          const descripcion = document.createElement("p");
          descripcion.className = "description";
          descripcion.innerHTML = sig.descripcion;
          app.appendChild(descripcion);
        }

        renderContenidoPantalla(sig);
        crearNavegacion();
      };

      opciones.appendChild(boton);

    });

    app.appendChild(opciones);

  }

  if (pantalla.tipo === "resultado") {

    const resultado = document.createElement("div");
    resultado.className = "result " +
      (pantalla.clase || "");
    resultado.innerHTML = pantalla.contenido;
    app.appendChild(resultado);

  }

  if (pantalla.tipo === "buscador") {

    crearBuscador();

  }

  if (pantalla.tipo === "fin") {

    const resultado = document.createElement("div");
    resultado.className = "result " +
      (pantalla.clase || "");
    resultado.innerHTML = pantalla.contenido;
    app.appendChild(resultado);

    const fin = document.createElement("div");
    fin.className = "finish";
    fin.innerHTML = `<div class="finish-icon">✓</div>`;
    app.appendChild(fin);

  }

}


function mostrarPantalla(id) {

  if (pantallaActual !== id) {
    historial.push(pantallaActual);
  }

  pantallaActual = id;

  const pantalla = pantallas[id];

  if (!pantalla) {
    console.error("Pantalla no encontrada:", id);
    return;
  }

  app.innerHTML = "";

  actualizarProgreso();

  const titulo = document.createElement("h2");
  titulo.textContent = pantalla.titulo;
  app.appendChild(titulo);

  if (pantalla.descripcion) {
    const descripcion = document.createElement("p");
    descripcion.className = "description";
    descripcion.innerHTML = pantalla.descripcion;
    app.appendChild(descripcion);
  }

  renderContenidoPantalla(pantalla);

  crearNavegacion();

}


/*
=========================================================
NAVEGACIÓN
=========================================================
*/


function crearNavegacion() {

  const navegacion = document.createElement("div");
  navegacion.className = "navigation";

  const botonAtras = document.createElement("button");
  botonAtras.className = "btn btn-secondary";
  botonAtras.textContent = "← Atrás";
  botonAtras.onclick = volverAtras;

  if (historial.length === 0) {
    botonAtras.disabled = true;
    botonAtras.style.opacity = "0.4";
  }

  const botonInicio = document.createElement("button");
  botonInicio.className = "btn btn-secondary";
  botonInicio.textContent = "↻ Reiniciar protocolo";
  botonInicio.onclick = reiniciar;

  navegacion.appendChild(botonAtras);
  navegacion.appendChild(botonInicio);

  app.appendChild(navegacion);

}


function volverAtras() {

  if (historial.length === 0) return;

  pantallaActual = historial.pop();

  const pantalla = pantallas[pantallaActual];

  app.innerHTML = "";
  actualizarProgreso();

  const titulo = document.createElement("h2");
  titulo.textContent = pantalla.titulo;
  app.appendChild(titulo);

  if (pantalla.descripcion) {
    const descripcion = document.createElement("p");
    descripcion.className = "description";
    descripcion.innerHTML = pantalla.descripcion;
    app.appendChild(descripcion);
  }

  renderContenidoPantalla(pantalla);
  crearNavegacion();

}


function reiniciar() {

  historial = [];
  pantallaActual = "inicio";
  especieSeleccionada = null;
  mostrarPantalla("inicio");

}


function actualizarProgreso() {

  const pasos = {
    inicio: 0,
    tipoAnimal: 1,
    vivoMuerto: 2,
    casosEspeciales: 3,
    paso5: 4
  };

  const paso = pasos[pantallaActual] ?? 1;
  const total = 5;
  const porcentaje = (paso / total) * 100;

  progressFill.style.width = porcentaje + "%";
  progressText.textContent =
    paso === 0
      ? "Inicio"
      : `Paso ${paso} de ${total}`;

}


/*
=========================================================
BUSCADOR DE ESPECIES (MEJORADO)
=========================================================
*/


function crearBuscador() {

  const input = document.createElement("input");
  input.className = "search-box";
  input.placeholder =
    "Escribe nombre común o científico...";
  input.autofocus = true;

  const hint = document.createElement("div");
  hint.className = "search-hint";
  hint.textContent =
    "Puedes buscar por nombre común (ej: 'águila') o científico (ej: 'Aquila'). Al seleccionar, el sistema te llevará directamente al protocolo correspondiente.";

  const resultados = document.createElement("div");
  resultados.className = "search-results";

  input.addEventListener("input", () => {

    const texto = normalizar(input.value);
    resultados.innerHTML = "";

    if (!texto || texto.length < 2) return;

    const encontrados = especiesLista.filter(especie => {
      const comun = normalizar(especie.nombreComun);
      const cientifico = normalizar(especie.nombreCientifico);
      return comun.includes(texto) ||
        cientifico.includes(texto);
    }).slice(0, 30);

    encontrados.forEach(especie => {

      const etiqueta = obtenerEtiquetaTipo(especie);

      const item = document.createElement("div");
      item.className = "species-result";
      item.innerHTML = `
        <div class="species-result-info">
          <strong>${especie.nombreComun}</strong>
          <span class="species-scientific">${especie.nombreCientifico}</span>
          <span class="species-group">${especie.grupo}</span>
        </div>
        <span class="species-type-badge ${etiqueta.clase}">
          ${etiqueta.texto}
        </span>
      `;
      item.onclick = () => ejecutarAtajo(especie);
      resultados.appendChild(item);

    });

    if (encontrados.length === 0) {
      resultados.innerHTML =
        '<div class="small-note">No se han encontrado especies. Prueba con otro término.</div>';
    }

  });

  app.appendChild(input);
  app.appendChild(hint);
  app.appendChild(resultados);

}


function normalizar(texto) {

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}


/*
=========================================================
PANTALLAS DEL PROTOCOLO (04/08/2026)
=========================================================
*/


const pantallas = {


  inicio: {

    tipo: "pregunta",
    titulo: "¿Sabe la persona qué tipo de animal es?",
    descripcion:
      "Si no sabe identificarlo, puede solicitarse una fotografía para ayudar a identificarlo.",

    opciones: [
      {
        texto: "📷 No lo sabe",
        siguiente: "identificacion"
      },
      {
        texto: " Sí lo sabe",
        siguiente: "tipoAnimal"
      },
      {
        texto: "🔎 Buscar un animal (recomendado)",
        siguiente: "buscador"
      }
    ]

  },


  buscador: {

    tipo: "buscador",
    titulo: "🔎 Buscar especie",
    descripcion:
      "Escribe parte del nombre común o científico del animal. Al seleccionarlo, el sistema te llevará directamente al protocolo correspondiente."

  },


  identificacion: {

    tipo: "resultado",
    titulo: "📷 Identificación del animal",
    contenido: `
      <h3>Pide al ciudadano que envíe una fotografía.</h3>
      <p>WhatsApp de La Granja:</p>
      <div class="contact-box">
        <strong>📱 686 680 254</strong>
        Identificación y ubicación.
      </div>
      <p class="small-note">
        Una vez identificado el animal,
        vuelve al inicio y selecciona
        la categoría correspondiente
        (o búscalo directamente).
      </p>
    `

  },


  tipoAnimal: {

    tipo: "pregunta",
    titulo: "¿Qué tipo de animal es?",
    descripcion:
      "Si tienes dudas sobre la clasificación, utiliza el buscador de animales.",

    opciones: [
      { texto: "🦌 Caza mayor", siguiente: "cazaMayor" },
      { texto: "🐢 Tortuga marina o cetáceo", siguiente: "tortugaMarina" },
      { texto: " Animal doméstico", siguiente: "domestico" },
      { texto: "🦎 Animal exótico", siguiente: "exotico" },
      { texto: "🚨 Animal catalogado como invasor", siguiente: "invasor" },
      { texto: "🦇 Colonias de murciélagos o nidos", siguiente: "murcielagos" },
      { texto: "️ Daños a la fauna o destrucción de nidos", siguiente: "danos" },
      { texto: "🥚 Huevos en la playa", siguiente: "huevosPlaya" },
      { texto: "🐦 Animal silvestre autóctono", siguiente: "vivoMuerto" },
      { texto: "📚 Ver listas de referencia", siguiente: "listasReferencia" }
    ]

  },


  listasReferencia: {

    tipo: "resultado",
    titulo: "📚 Listas de referencia",
    contenido: `
      <div class="reference-list">
        <h4>🏠 Animales domésticos que generan consultas</h4>
        <ul>
          <li>Pavos</li>
          <li>Gallinas</li>
          <li>Faisanes</li>
          <li>Urones</li>
          <li>Palomas bravías</li>
        </ul>
      </div>

      <div class="reference-list">
        <h4>🚨 Animales declarados INVASORES que generan consultas</h4>
        <ul>
          <li>Cotorras</li>
          <li>Galápagos: <em>Trachemys scripta</em>, <em>Pseudemys sp</em>, <em>Mauremys sp</em> (excepto <em>Mauremys leprosa</em> que es autóctona)</li>
          <li>Mapache</li>
          <li>Coipú</li>
          <li>Pitón real (<em>Python regius</em>)</li>
        </ul>
      </div>

      <div class="reference-list">
        <h4>📜 Animales CITES que generan consultas</h4>
        <ul>
          <li>Tortuga de espolones africana (<em>Centrochelys sulcata</em>)</li>
          <li>Águila de Harris (<em>Parabuteo unicinctus</em>)</li>
          <li>Tortuga mapa (<em>Graptemys sp</em>)</li>
        </ul>
      </div>
    `

  },


  cazaMayor: {

    tipo: "fin",
    titulo: "🦌 Caza mayor",
    clase: "warning",
    contenido: `
      <h3>Indicar que llame al 112.</h3>
      <p>Desde el 112 avisarán a la unidad de caza.</p>
      <div class="contact-box">
        <strong>📞 112</strong>
        Emergencias.
      </div>
    `

  },


  tortugaMarina: {

    tipo: "fin",
    titulo: " Tortuga marina o cetáceo",
    contenido: `
      <h3>Indicar que llame al 112.</h3>
      <div class="contact-box">
        <strong>📞 112</strong>
        Emergencias.
      </div>
    `

  },


  domestico: {

    tipo: "fin",
    titulo: " Animal doméstico",
    contenido: `
      <h3>Indicar que se dirija a su Ayuntamiento.</h3>
      <p>
        La atención de estos animales corresponde
        al Ayuntamiento según el apartado 1.b) del
        artículo 34 de la Ley 2/2023, de 13 de marzo,
        de Protección, Bienestar y Tenencia de animales.
      </p>
    `

  },


  exotico: {

    tipo: "pregunta",
    titulo: "¿Qué situación se presenta?",
    opciones: [
      {
        texto: " Animal exótico CITES (posee o Policía Local consulta)",
        siguiente: "citesConsulta"
      },
      {
        texto: " Animal exótico CITES encontrado en la naturaleza",
        siguiente: "citesEncontrado"
      },
      {
        texto: " Animal exótico NO invasor (excepto galápagos)",
        siguiente: "exoticoNoInvasor"
      }
    ]

  },


  exoticoNoInvasor: {

    tipo: "fin",
    titulo: "🏠 Animal exótico no catalogado como invasor",
    contenido: `
      <h3>Indicar que se dirija a su Ayuntamiento.</h3>
      <p>
        Es de su competencia según el apartado 1.b) del
        artículo 34 de la Ley 2/2023.
      </p>
      <p class="small-note">
        ⚠️ <strong>Excepción:</strong> los galápagos exóticos
        (Trachemys, Pseudemys, Mauremys excepto M. leprosa)
        se tratan como invasores, no como exóticos no invasores.
      </p>
    `

  },


  citesPregunta: {

    tipo: "pregunta",
    titulo: "📜 Animal exótico CITES",
    descripcion:
      "Especie protegida por el convenio CITES.",
    opciones: [
      {
        texto: "📋 Posee este animal (o Policía Local consulta)",
        siguiente: "citesConsulta"
      },
      {
        texto: "🦎 Lo ha encontrado en la naturaleza",
        siguiente: "citesEncontrado"
      }
    ]

  },


  citesEncontrado: {

    tipo: "fin",
    titulo: "🦎 Animal exótico CITES encontrado",
    contenido: `
      <h3>Indicar que se dirija a su Ayuntamiento.</h3>
      <p>
        Al no estar catalogado como invasor, es de competencia
        municipal según el art. 34 de la Ley 2/2023.
      </p>
    `

  },


  citesConsulta: {

    tipo: "fin",
    titulo: "📋 Animal exótico CITES",
    contenido: `
      <h3>Indicar que describa su caso por correo.</h3>
      <p>Recibirá instrucciones.</p>
      <div class="contact-box">
        <strong>️ bzn-cites@miteco.es</strong>
        <strong>✉️ bzn-tifies@miteco.es</strong>
      </div>
    `

  },


  invasor: {

    tipo: "pregunta",
    titulo: "🚨 Animal catalogado como invasor",
    descripcion:
      "¿Está cerca de alguna unidad colaboradora?",
    opciones: [
      {
        texto: "Sí, está cerca de una unidad colaboradora",
        siguiente: "invasorUnidad"
      },
      {
        texto: "No está cerca de una unidad",
        siguiente: "invasorNoUnidad"
      }
    ]

  },


  invasorUnidad: {

    tipo: "fin",
    titulo: "🚨 Animal invasor — Unidad colaboradora",
    contenido: `
      <h3>Puede llevarlo a una unidad colaboradora entre semana.</h3>
      <p>Se debe apuntar como <strong>recogida pendiente</strong>.</p>
      <p>También puede traerlo al centro cualquier día.</p>
    `

  },


  invasorNoUnidad: {

    tipo: "pregunta",
    titulo: "🚨 Animal invasor — Sin unidad cerca",
    descripcion:
      "¿El animal es de su propiedad o lo ha encontrado?",
    opciones: [
      {
        texto: "Es de su propiedad",
        siguiente: "invasorPropiedad"
      },
      {
        texto: "Lo ha encontrado",
        siguiente: "invasorEncontrado"
      }
    ]

  },


  invasorPropiedad: {

    tipo: "fin",
    titulo: "🚨 Animal invasor de su propiedad",
    contenido: `
      <h3>Han de traerlo al centro.</h3>
      <p>
        Enviar la ubicación por WhatsApp si es necesario.
      </p>
      <div class="contact-box">
        <strong> 686 680 254</strong>
      </div>
    `

  },


  invasorEncontrado: {

    tipo: "fin",
    titulo: "🚨 Animal invasor encontrado",
    contenido: `
      <h3>Llevarlo a la policía local del municipio.</h3>
      <p>
        Avisar al centro para que vayamos a recogerlo allí.
      </p>
      <div class="contact-box">
        <strong>📱 686 680 254</strong>
      </div>
    `

  },


  murcielagos: {

    tipo: "fin",
    titulo: "🦇 Colonias de murciélagos o presencia de nidos",
    contenido: `
      <h3>No se puede actuar hasta que termine la época de cría.</h3>
      <p>Remitir la consulta al correo:</p>
      <div class="contact-box">
        <strong>✉️ espaciosnaturales_valencia@listas.gva.es</strong>
      </div>
    `

  },


  danos: {

    tipo: "fin",
    titulo: "⚠️ Daños a la fauna o destrucción de nidos",
    contenido: `
      <p>
        Pueden llamar al 112 para contactar con un agente
        medioambiental o enviar un correo.
      </p>
      <div class="contact-box">
        <strong>📞 112</strong>
        <strong>✉️ espaciosnaturales_valencia@gva.es</strong>
      </div>
    `

  },


  huevosPlaya: {

    tipo: "fin",
    titulo: "🥚 Huevos en la playa",
    contenido: `
      <h3>No recoger los huevos.</h3>
      <p>
        El nido del chorlitejo es muy rudimentario
        (prácticamente una depresión en la arena, a veces
        con alguna concha, piedrecita o resto de vegetación)
        y puede parecer que los huevos están abandonados,
        pero <strong>no se deben coger</strong> porque no lo están.
      </p>
    `

  },


  vivoMuerto: {

    tipo: "pregunta",
    titulo: "¿El animal está vivo o muerto?",
    opciones: [
      { texto: "⚫ Está muerto", siguiente: "muerto" },
      { texto: "🟢 Está vivo", siguiente: "casosEspeciales" }
    ]

  },


  muerto: {

    tipo: "pregunta",
    titulo: "Animal muerto — ¿Se trata de una cría aislada?",
    opciones: [
      { texto: "Sí, es una cría aislada", siguiente: "cadaverCria" },
      { texto: "No es una cría", siguiente: "cadaverCausa" }
    ]

  },


  cadaverCria: {

    tipo: "fin",
    titulo: "⚫ Cadáver de cría aislada",
    contenido: `
      <h3>No es necesario recoger el cadáver.</h3>
      <p>Se informa al ciudadano y finaliza la llamada.</p>
    `

  },


  cadaverCausa: {

    tipo: "pregunta",
    titulo: " Animal muerto — Causa de la muerte",
    descripcion:
      "¿Probablemente se trata de una causa antropogénica? (Electrocución, ahogamiento, envenenamiento, colisión contra tendido eléctrico, choque contra cristalera)",
    opciones: [
      { texto: "Sí, probable causa antropogénica", siguiente: "cadaverAntropogenica" },
      { texto: "No, no parece causa antropogénica", siguiente: "cadaverNatural" }
    ]

  },


  cadaverAntropogenica: {

    tipo: "fin",
    titulo: "⚡ Cadáver con causa antropogénica",
    clase: "warning",
    contenido: `
      <h3>Llamar al CPIF.</h3>
      <p>
        Solicitar que vaya un Agente Medioambiental
        a recogerlo.
      </p>
      <p class="small-note">
        <strong>NOTA CPIF:</strong> Si al llamar al CPIF
        no quieren enviar un agente o indican que no hay
        ninguno disponible, se registra la incidencia.
      </p>
    `

  },


  cadaverNatural: {

    tipo: "fin",
    titulo: " Cadáver sin causa antropogénica",
    contenido: `
      <h3>No es necesario recoger el cadáver.</h3>
      <p>Se informa al ciudadano y finaliza la llamada.</p>
    `

  },


  casosEspeciales: {

    tipo: "pregunta",
    titulo: "Casos especiales — Comprobar en este orden",
    descripcion:
      "Si ninguno aplica, continuar al Paso 5.",
    opciones: []

  },


  animalVivienda: {

    tipo: "fin",
    titulo: " Animal dentro de una vivienda",
    contenido: `
      <h3>No cazamos animales.</h3>
      <p>
        Deben facilitar la salida del animal
        de su vivienda.
      </p>
      <p class="small-note">
        Ejemplos: serpiente, pájaros dentro de
        extractores o chimeneas.
      </p>
    `

  },


  animalProblemas: {

    tipo: "fin",
    titulo: "🦅 Animal con problemas fuera de una vivienda",
    contenido: `
      <h3>Llamar al CPIF.</h3>
      <p>
        Solicitar que un Agente Medioambiental
        vaya a conocer la situación e informe.
      </p>
      <p class="small-note">
        Ejemplo: buitre.
      </p>
      <p class="small-note">
        <strong>NOTA CPIF:</strong> Si al llamar al CPIF
        no quieren enviar un agente o indican que no hay
        ninguno disponible, se registra la incidencia.
      </p>
    `

  },


  causaAntropogenica: {

    tipo: "fin",
    titulo: "⚡ Problema por causa antropogénica",
    contenido: `
      <h3>Llamar al CPIF.</h3>
      <p>
        Solicitar que un Agente Medioambiental
        vaya a recogerlo.
      </p>
      <p class="small-note">
        Ejemplos: electrocución, ahogamiento,
        envenenamiento, colisión contra tendido eléctrico,
        choque contra cristalera.
      </p>
      <p class="small-note">
        <strong>NOTA CPIF:</strong> Si al llamar al CPIF
        no quieren enviar un agente o indican que no hay
        ninguno disponible, se registra la incidencia.
      </p>
    `

  },


  tortugaPropiedad: {

    tipo: "fin",
    titulo: "🐢 Tortuga terrestre propiedad de alguien",
    contenido: `
      <h3>Solicitar siempre una fotografía antes de traerla.</h3>
      <div class="contact-box">
        <strong>📱 WhatsApp: 686 680 254</strong>
      </div>
      <p>
        Una vez enviada la foto, continuar según el caso
        (volver al inicio y seleccionar la categoría
        correspondiente o buscar el animal).
      </p>
    `

  },


  tortugaCampo: {

    tipo: "pregunta",
    titulo: " Tortuga terrestre o galápago autóctono en el campo",
    descripcion:
      "¿El animal tiene alguna herida o un comportamiento/síntoma que haga pensar que puede estar enfermo?",
    opciones: [
      { texto: "Sí, tiene heridas o síntomas de enfermedad", siguiente: "paso5" },
      { texto: "No, no tiene heridas ni síntomas", siguiente: "tortugaCampoPeligro" }
    ]

  },


  tortugaCampoPeligro: {

    tipo: "pregunta",
    titulo: " Tortuga sin heridas — ¿Peligro inminente?",
    descripcion:
      "¿Existe un peligro inminente? (Ej: va a pasar un tractor por el camino)",
    opciones: [
      { texto: "Sí, hay peligro inminente", siguiente: "tortugaCampoRetirar" },
      { texto: "No, no hay peligro", siguiente: "tortugaCampoNoLlevar" }
    ]

  },


  tortugaCampoRetirar: {

    tipo: "fin",
    titulo: "🐢 Retirar a lugar seguro",
    contenido: `
      <h3>Retíralo de donde está y ponlo en un lugar seguro.</h3>
      <p>
        <strong>PERO NO TE LO LLEVES.</strong>
      </p>
    `

  },


  tortugaCampoNoLlevar: {

    tipo: "fin",
    titulo: "🐢 No llevárselo",
    contenido: `
      <h3>No es necesario recogerla.</h3>
      <p>
        Si no hay peligro inminente ni heridas ni síntomas,
        dejarla donde está.
      </p>
    `

  },


  cristal: {

    tipo: "pregunta",
    titulo: "🪟 Ave estrellada contra un cristal",
    descripcion:
      "Mantener el animal en una caja en un lugar muy tranquilo durante 2 horas. Pasadas las 2 horas, abrir la caja y sacarlo con cuidado en un lugar libre de obstáculos.",
    opciones: [
      { texto: "Al sacarlo, emprende el vuelo", siguiente: "cristalVuela" },
      { texto: "Al sacarlo, NO puede emprender el vuelo", siguiente: "paso5" }
    ]

  },


  cristalVuela: {

    tipo: "fin",
    titulo: "🪟 Ave recuperada",
    contenido: `
      <h3>El animal se ha recuperado.</h3>
      <p>
        En muchas ocasiones se recuperan de forma espontánea
        de la conmoción sufrida.
      </p>
    `

  },


  conejoLiebre: {

    tipo: "pregunta",
    titulo: " Cría de conejo o liebre",
    opciones: [
      { texto: "No está herida", siguiente: "conejoSano" },
      { texto: "Está herida, debilitada, con ojos cerrados o poco pelo", siguiente: "conejoHerido" }
    ]

  },


  conejoSano: {

    tipo: "fin",
    titulo: " Cría sana",
    contenido: `
      <h3>No cogerla.</h3>
      <p>
        Alejarse rápidamente porque la madre
        está cerca e irá a alimentarla.
      </p>
    `

  },


  conejoHerido: {

    tipo: "fin",
    titulo: "🐇 Cría herida o debilitada",
    contenido: `
      <h3>Colocarla en una caja con algún agujero para que respire.</h3>
      <p>Mantenerla en un ambiente tranquilo.</p>
      <p>Continuar por el Paso 5.</p>
    `

  },


  panal: {

    tipo: "fin",
    titulo: "🐝 Panales de abejas o avispas",
    contenido: `
      <h3>Indicar que llame al 112.</h3>
      <div class="contact-box">
        <strong>📞 112</strong>
      </div>
    `

  },


  avispaAsiatica: {

    tipo: "fin",
    titulo: "🪰 Avispa asiática",
    contenido: `
      <h3>Indicar que llame al 112.</h3>
      <div class="contact-box">
        <strong>📞 112</strong>
      </div>
    `

  },


  criaLechuzaCernicalo: {

    tipo: "pregunta",
    titulo: " Cría de lechuza o cernícalo",
    opciones: [
      { texto: "No tiene heridas", siguiente: "lechuzaSana" },
      { texto: "Tiene heridas", siguiente: "lechuzaHerida" }
    ]

  },


  lechuzaSana: {

    tipo: "fin",
    titulo: "🪶 Cría de lechuza/cernícalo sin heridas",
    contenido: `
      <h3>Buscar el nido y devolverla allí.</h3>
      <p>
        <strong>En el caso de las lechuzas es MUY IMPORTANTE
        que nos den las coordenadas del nido.</strong>
      </p>
      <p>
        Si no se encuentra el nido, meterla en una caja
        con algún agujero para que respire y mantenerla
        en un ambiente tranquilo → Paso 5.
      </p>
    `

  },


  lechuzaHerida: {

    tipo: "fin",
    titulo: "🪶 Cría de lechuza/cernícalo herida",
    contenido: `
      <h3>Meterla en una caja con algún agujero para que respire.</h3>
      <p>Mantenerla en un ambiente tranquilo.</p>
      <p>Continuar por el Paso 5.</p>
    `

  },


  criaRapazOtra: {

    tipo: "pregunta",
    titulo: "🦅 Cría de rapaz (diferente de lechuza/cernícalo)",
    descripcion:
      "¿Dónde se encuentra?",
    opciones: [
      { texto: "En medio natural", siguiente: "rapazNatural" },
      { texto: "En medio urbano", siguiente: "rapazUrbano" }
    ]

  },


  rapazNatural: {

    tipo: "pregunta",
    titulo: " Cría de rapaz en medio natural",
    descripcion:
      "¿Tiene signos de enfermedad o heridas?",
    opciones: [
      { texto: "No tiene signos", siguiente: "rapazNaturalSana" },
      { texto: "Tiene signos de enfermedad o heridas", siguiente: "rapazNaturalHerida" }
    ]

  },


  rapazNaturalSana: {

    tipo: "fin",
    titulo: "🦅 Cría de rapaz sana en medio natural",
    contenido: `
      <h3>Déjala donde está.</h3>
      <p>
        Si no tiene signos de enfermedad o lesión,
        no hay que recogerla.
      </p>
    `

  },


  rapazNaturalHerida: {

    tipo: "fin",
    titulo: "🦅 Cría de rapaz herida en medio natural",
    contenido: `
      <h3>Meterla en una caja con algún agujero para que respire.</h3>
      <p>Mantenerla en un ambiente tranquilo.</p>
      <p>Continuar por el Paso 5.</p>
    `

  },


  rapazUrbano: {

    tipo: "fin",
    titulo: "🦅 Cría de rapaz en medio urbano",
    contenido: `
      <h3>Meterla en una caja con algún agujero para que respire.</h3>
      <p>Mantenerla en un ambiente tranquilo.</p>
      <p>Continuar por el Paso 5.</p>
    `

  },


  erizo: {

    tipo: "pregunta",
    titulo: "🦔 Erizo",
    opciones: [
      { texto: "Son las últimas horas del día o de noche", siguiente: "erizoNoche" },
      { texto: "Es de día (y no lo ha sacado un perro, o el perro no le ha herido)", siguiente: "erizoDia" }
    ]

  },


  erizoNoche: {

    tipo: "pregunta",
    titulo: "🦔 Erizo de noche",
    descripcion:
      "¿El animal tiene signos de enfermedad o heridas?",
    opciones: [
      { texto: "Sí, tiene signos o heridas", siguiente: "paso5" },
      { texto: "No tiene signos, pero hay peligro inminente", siguiente: "erizoNochePeligro" },
      { texto: "No tiene signos y no hay peligro", siguiente: "erizoNocheOk" }
    ]

  },


  erizoNochePeligro: {

    tipo: "fin",
    titulo: "🦔 Erizo con peligro inminente",
    contenido: `
      <h3>Retíralo de donde está y ponlo en un lugar seguro.</h3>
      <p>
        <strong>PERO NO TE LO LLEVES.</strong>
      </p>
      <p class="small-note">
        Ejemplo: está en medio de una carretera.
      </p>
    `

  },


  erizoNocheOk: {

    tipo: "fin",
    titulo: " Erizo de noche sin problemas",
    contenido: `
      <h3>No es necesario recogerlo.</h3>
      <p>Dejarlo donde está.</p>
    `

  },


  erizoDia: {

    tipo: "fin",
    titulo: "🦔 Erizo de día",
    contenido: `
      <h3>Continuar por el Paso 5.</h3>
      <p>
        Un erizo visto de día (y no sacado por un perro
        que le haya herido) suele tener un problema.
      </p>
    `

  },


  criaAve: {

    tipo: "pregunta",
    titulo: "🐣 Cría de pajarito o rapaz",
    descripcion:
      "Las únicas especies que NO pueden estar en el caso de volantón son: <strong>vencejos, aviones, golondrinas</strong> y, entre rapaces, la <strong>lechuza</strong>.",
    opciones: [
      { texto: "Sí, es un volantón", siguiente: "volanton" },
      { texto: "No es un volantón (vencejo, golondrina, avión, sin plumas o herido)", siguiente: "criaAveNoVolanton" }
    ]

  },


  volanton: {

    tipo: "pregunta",
    titulo: "🐣 Volantón — ¿Cuánto tiempo ha pasado?",
    descripcion:
      "Desde que se encontró el animal.",
    opciones: [
      { texto: "Menos de 1 hora y media", siguiente: "volantonMenos90" },
      { texto: "Más de 1 hora y media", siguiente: "volantonMas90" }
    ]

  },


  volantonMenos90: {

    tipo: "pregunta",
    titulo: " Volantón — Menos de 1h 30min",
    descripcion:
      "¿Puede devolverlo al sitio donde lo encontró?",
    opciones: [
      { texto: "Sí, puede devolverlo", siguiente: "volantonDevolver" },
      { texto: "No puede devolverlo", siguiente: "volantonNoDevolver" }
    ]

  },


  volantonDevolver: {

    tipo: "fin",
    titulo: "🐣 Devolver el volantón",
    contenido: `
      <h3>Pedir que lo deje en el sitio donde lo encontró.</h3>
      <p>
        Si estaba en la carretera, pedir que lo deje
        en la acera.
      </p>
    `

  },


  volantonNoDevolver: {

    tipo: "pregunta",
    titulo: "🐣 Volantón que no puede devolverse",
    descripcion:
      "¿Está cerca de una unidad colaboradora?",
    opciones: [
      { texto: "Sí, está cerca de una unidad", siguiente: "criaUnidad" },
      { texto: "No está cerca de una unidad", siguiente: "criaCentro" }
    ]

  },


  volantonMas90: {

    tipo: "pregunta",
    titulo: "🐣 Volantón — Más de 1h 30min",
    descripcion:
      "¿Está cerca de una unidad colaboradora?",
    opciones: [
      { texto: "Sí, está cerca de una unidad", siguiente: "criaUnidad" },
      { texto: "No está cerca de una unidad", siguiente: "criaCentro" }
    ]

  },


  criaAveNoVolanton: {

    tipo: "pregunta",
    titulo: " Cría que no es volantón",
    descripcion:
      "Vencejo, golondrina, avión, otra especie sin plumas o herido.",
    opciones: [
      { texto: "Está cerca de una unidad colaboradora", siguiente: "criaUnidad" },
      { texto: "No está cerca de una unidad", siguiente: "criaCentro" }
    ]

  },


  criaUnidad: {

    tipo: "fin",
    titulo: "🐣 Unidad colaboradora",
    contenido: `
      <h3>Puede llevarla a una unidad colaboradora entre semana.</h3>
      <p>
        También puede llevarla al centro cualquier día.
      </p>
      <p>
        Si la lleva a una unidad colaboradora,
        <strong>apuntar la recogida pendiente</strong>.
      </p>
    `

  },


  criaCentro: {

    tipo: "fin",
    titulo: "🐣 Traer al centro",
    contenido: `
      <h3>No podemos ir a recoger crías de pajaritos.</h3>
      <p>
        Debido al elevado número de animales en las mismas
        circunstancias, nos hacemos cargo de ellas si las
        traen al centro.
      </p>
      <p>
        Mientras la traen, mantenerla en una caja
        <strong>sin comida ni agua</strong>.
      </p>
    `

  },


  paso5: {

    tipo: "pregunta",
    titulo: "Paso 5 — Animal herido o enfermo",
    descripcion:
      "Sin causa antropogénica evidente. ¿Qué día es?",
    opciones: [
      { texto: "📅 Es entre semana", siguiente: "entreSemana" },
      { texto: "🗓️ Es fin de semana", siguiente: "finSemana" }
    ]

  },


  entreSemana: {

    tipo: "pregunta",
    titulo: "¿Hay una unidad colaboradora cerca?",
    opciones: [
      { texto: "Sí, hay una unidad cerca", siguiente: "unidadCerca" },
      { texto: "No hay una unidad cerca", siguiente: "sinUnidad" }
    ]

  },


  unidadCerca: {

    tipo: "fin",
    titulo: " Unidad colaboradora",
    contenido: `
      <h3>Enviar al ciudadano a la unidad colaboradora.</h3>
      <p><strong>Anotar recogida pendiente.</strong></p>
    `

  },


  sinUnidad: {

    tipo: "fin",
    titulo: "🚗 Recogida en domicilio",
    contenido: `
      <h3>Tomar los datos para realizar la recogida en domicilio.</h3>
      <p><strong>Anotar recogida pendiente.</strong></p>
    `

  },


  finSemana: {

    tipo: "pregunta",
    titulo: "🗓️ Fin de semana",
    descripcion:
      "Informar: no tenemos servicio de recogida en fin de semana. Pedir que lo traiga al centro.",
    opciones: [
      { texto: "Sí, puede traerlo", siguiente: "finSemanaPuedeTraer" },
      { texto: "No puede traerlo", siguiente: "finSemanaNoPuede" }
    ]

  },


  finSemanaPuedeTraer: {

    tipo: "fin",
    titulo: "🗓️ Fin de semana — Trae al centro",
    contenido: `
      <h3>Puede traer el animal al centro.</h3>
    `

  },


  finSemanaNoPuede: {

    tipo: "pregunta",
    titulo: "🗓️ Fin de semana — No puede traerlo",
    descripcion:
      "Llamamos al CPIF para ver si puede recogerlo un Agente Medioambiental. ¿El agente puede traerlo?",
    opciones: [
      { texto: "Sí, el agente lo puede traer", siguiente: "agentePuede" },
      { texto: "No, el agente no lo puede traer", siguiente: "agenteNoPuede" }
    ]

  },


  agentePuede: {

    tipo: "fin",
    titulo: " Agente medioambiental recoge",
    contenido: `
      <h3>El Agente Medioambiental se hará cargo de la recogida.</h3>
    `

  },


  agenteNoPuede: {

    tipo: "fin",
    titulo: "🗓️ Iremos el lunes",
    contenido: `
      <h3>Indicar que iremos el lunes.</h3>
      <p>
        Mientras tanto, dejarlo en una caja con algún agujero
        por el que no pueda escapar.
      </p>
      <p>
        <strong>No darle comida, agua ni medicamentos.</strong>
      </p>
      <p class="small-note">
        <strong>Explicación para el ciudadano:</strong>
        los animales silvestres en el medio natural a veces
        no encuentran fácilmente agua o comida y están
        adaptados para resistir; darles lo que no se debe
        puede ser contraproducente.
      </p>
      <p><strong>Apuntar la recogida pendiente.</strong></p>
    `

  }

};


cargarEspecies().then(() => {

  mostrarPantalla("inicio");

});
