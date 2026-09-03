/*
=========================================================
ASISTENTE DE ATENCIÓN TELEFÓNICA
CRF LA GRANJA DE EL SALER

Versión protocolo: 04/08/2026
=========================================================
*/

const app = document.getElementById("app");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

let historial = [];
let pantallaActual = "inicio";
let especiesLista = [];
let especieSeleccionada = null;

/*
=========================================================
CARGA DE ESPECIES
=========================================================
*/
async function cargarEspecies() {
  try {
    const respuesta = await fetch("especies.json");
    especiesLista = await respuesta.json();
    
    // Inyectar casos especiales (Panal y Avispa asiática) para que aparezcan en el buscador
    especiesLista.push(
      { nombreCientifico: "Apis mellifera / Vespidae", nombreComun: "Panal de abejas o avispas", grupo: "INSECTOS", origen: "Nativa", tipo: "silvestre_autóctono", cites: false, gradoProteccion: null },
      { nombreCientifico: "Vespa velutina", nombreComun: "Avispa asiática", grupo: "INSECTOS", origen: "Exótico", tipo: "invasor", cites: false, gradoProteccion: "Invasora" }
    );
    
    console.log("Especies cargadas:", especiesLista.length);
  } catch (error) {
    console.error("Error al cargar especies:", error);
  }
}

/*
=========================================================
FUNCIONES DE CLASIFICACIÓN
=========================================================
*/
function esGalapagoInvasor(especie) {
  const nombre = especie.nombreCientifico.toLowerCase();
  if (nombre.startsWith("pseudemys")) return true;
  if (nombre.startsWith("mauremys") && nombre !== "mauremys leprosa") return true;
  return false;
}

function esCazaMayor(especie) {
  const cazaMayor = ["Sus scrofa", "Capra pyrenaica", "Capreolus capreolus", "Cervus elaphus", "Dama dama"];
  return cazaMayor.includes(especie.nombreCientifico);
}

function esTortugaMarina(especie) {
  return especie.nombreCientifico === "Caretta caretta";
}

function esGalapagoAutoctono(especie) {
  const nombre = especie.nombreCientifico;
  return nombre === "Emys orbicularis" || nombre === "Mauremys leprosa";
}

function esAve(especie) {
  const grupo = especie.grupo.toUpperCase();
  return grupo.includes("AVES") || grupo.includes("RAPACES") || grupo.includes("PASSERIFORMES") ||
         grupo.includes("CICONIFORMES") || grupo.includes("GRUIFORMES") || grupo.includes("ANATIDAS") ||
         grupo.includes("GALLIFORMES") || grupo.includes("CÓRVIDOS") || grupo.includes("LIMÍCOLAS") ||
         grupo.includes("SOMORMUJOS") || grupo.includes("PELECANIFORME");
}

function esRapaz(especie) {
  return especie.grupo.toUpperCase().includes("RAPACES");
}

function esReptil(especie) {
  return especie.grupo.toUpperCase() === "REPTILES";
}

function esMamifero(especie) {
  const grupo = especie.grupo.toUpperCase();
  return grupo.includes("MAMÍFEROS") || grupo.includes("LAGOMORFOS") || grupo.includes("ROEDORES") ||
         grupo.includes("CARNÍVOROS") || grupo.includes("INSECTÍVOROS") || grupo.includes("MURCIÉLAGOS");
}

function esConejoLiebre(especie) {
  const nombre = especie.nombreCientifico;
  return nombre === "Oryctolagus cuniculus" || nombre === "Lepus granatensis";
}

function esErizo(especie) {
  const nombre = especie.nombreCientifico;
  return nombre === "Erinaceus europaeus" || nombre === "Atelerix algirus" || nombre === "Atelerix albiventris";
}

function esMurcielago(especie) {
  return especie.grupo.toUpperCase() === "MURCIÉLAGOS";
}

function tieneCasoEspecialAviso(especie) {
  const nombre = especie.nombreComun.toLowerCase();
  return nombre.includes("lechuza") || nombre.includes("cernícalo") || nombre.includes("vencejo") ||
    nombre.includes("golondrina") || nombre.includes("avión") || esConejoLiebre(especie) ||
    esErizo(especie) || esMurcielago(especie) || esGalapagoAutoctono(especie);
}

function obtenerEtiquetaTipo(especie) {
  if (especie.cites) return { texto: "CITES", clase: "badge-cites" };
  if (especie.tipo === "doméstico") return { texto: "Doméstico", clase: "badge-domestico" };
  if (especie.tipo === "invasor") return { texto: "Invasor", clase: "badge-invasor" };
  if (especie.tipo === "exótico") {
    if (esGalapagoInvasor(especie)) return { texto: "Invasor", clase: "badge-invasor" };
    return { texto: "Exótico", clase: "badge-exotico" };
  }
  if (especie.tipo === "silvestre_autóctono") return { texto: "Autóctono", clase: "badge-autoctono" };
  return { texto: "", clase: "" };
}

/*
=========================================================
FILTRADO DE OPCIONES DEL PASO 4
=========================================================
*/
function obtenerOpcionesPaso4() {
  if (!especieSeleccionada) return obtenerTodasOpcionesPaso4();

  const opciones = [];
  const especie = especieSeleccionada;

  opciones.push(
    { texto: "🏠 Animal suelto dentro de una vivienda", siguiente: "animalVivienda" },
    { texto: "🦅 Animal no atrapado con problemas (fuera de vivienda)", siguiente: "animalProblemas" },
    { texto: " Problema por causa antropogénica probable", siguiente: "causaAntropogenica" }
  );

  if (esReptil(especie)) {
    opciones.push(
      { texto: "🐢 Tortuga terrestre propiedad de alguien", siguiente: "tortugaPropiedad" },
      { texto: "🐢 Tortuga terrestre o galápago autóctono en el campo", siguiente: "tortugaCampo" }
    );
  }

  if (esAve(especie)) {
    opciones.push({ texto: " Ave estrellada contra un cristal", siguiente: "cristal" });
    if (esRapaz(especie)) {
      const nombre = especie.nombreComun.toLowerCase();
      if (nombre.includes("lechuza") || nombre.includes("cernícalo")) {
        opciones.push({ texto: " Cría de rapaz (lechuza o cernícalo)", siguiente: "criaLechuzaCernicalo" });
      } else {
        opciones.push({ texto: "🦅 Cría de rapaz (diferente de lechuza/cernícalo)", siguiente: "criaRapazOtra" });
      }
    } else {
      opciones.push({ texto: "🐣 Cría de pajarito (volantón o no)", siguiente: "criaAve" });
    }
  }

  if (esMamifero(especie)) {
    if (esConejoLiebre(especie)) opciones.push({ texto: " Cría de conejo o liebre", siguiente: "conejoLiebre" });
    if (esErizo(especie)) opciones.push({ texto: "🦔 Erizo", siguiente: "erizo" });
  }

  opciones.push({ texto: "Ninguno de estos casos → Paso 5 (Animal herido/enfermo sin causa antropogénica)", siguiente: "paso5" });
  return opciones;
}

function obtenerTodasOpcionesPaso4() {
  return [
    { texto: "🏠 Animal suelto dentro de una vivienda", siguiente: "animalVivienda" },
    { texto: "🦅 Animal no atrapado con problemas (fuera de vivienda)", siguiente: "animalProblemas" },
    { texto: "⚡ Problema por causa antropogénica probable", siguiente: "causaAntropogenica" },
    { texto: "🐢 Tortuga terrestre propiedad de alguien", siguiente: "tortugaPropiedad" },
    { texto: "🐢 Tortuga terrestre o galápago autóctono en el campo", siguiente: "tortugaCampo" },
    { texto: "🪟 Ave estrellada contra un cristal", siguiente: "cristal" },
    { texto: "🐇 Cría de conejo o liebre", siguiente: "conejoLiebre" },
    { texto: " Panal de abejas o avispas", siguiente: "panal" },
    { texto: "🪰 Avispa asiática", siguiente: "avispaAsiatica" },
    { texto: "🪶 Cría de rapaz (lechuza o cernícalo)", siguiente: "criaLechuzaCernicalo" },
    { texto: "🦅 Cría de rapaz (diferente de lechuza/cernícalo)", siguiente: "criaRapazOtra" },
    { texto: "🦔 Erizo", siguiente: "erizo" },
    { texto: " Cría de pajarito o rapaz (volantón o no)", siguiente: "criaAve" },
    { texto: "Ninguno de estos casos → Paso 5 (Animal herido/enfermo)", siguiente: "paso5" }
  ];
}

/*
=========================================================
EJECUTAR ATAJO
=========================================================
*/
function ejecutarAtajo(especie) {
  especieSeleccionada = especie;
  const nombre = especie.nombreComun.toLowerCase();

  // Interceptamos Panal y Avispa asiática para ir directos al 112
if (nombre.includes("panal") || nombre.includes("abeja") || nombre.includes("avispa")) {
  if (nombre.includes("asiática") || nombre.includes("velutina")) {
    mostrarPantalla("avispaAsiatica");
  } else {
    mostrarPantalla("panal");
  }
  return;
}

  if (especie.tipo === "doméstico") { mostrarPantalla("domestico"); return; }
  if (especie.cites === true) { mostrarPantalla("citesPregunta"); return; }
  if (especie.tipo === "invasor") { mostrarPantalla("invasor"); return; }
  if (especie.tipo === "exótico") {
    if (esGalapagoInvasor(especie)) { mostrarPantalla("invasor"); return; }
    mostrarPantalla("exoticoNoInvasor"); return;
  }

  if (especie.tipo === "silvestre_autóctono") {
    if (esCazaMayor(especie)) { mostrarPantalla("cazaMayor"); return; }
    if (esTortugaMarina(especie)) { mostrarPantalla("tortugaMarina"); return; }
    if (esGalapagoAutoctono(especie)) { mostrarPantallaConEspecie("tortugaCampo"); return; }
    if (tieneCasoEspecialAviso(especie)) { mostrarPantallaConEspecie("casosEspeciales"); return; }
    mostrarPantallaConEspecie("vivoMuerto"); return;
  }

  mostrarPantalla("tipoAnimal");
}

function mostrarPantallaConEspecie(id) {
  if (pantallaActual !== id) historial.push(pantallaActual);
  pantallaActual = id;
  const pantalla = pantallas[id];
  if (!pantalla) { console.error("Pantalla no encontrada:", id); return; }
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
      <button class="btn-change-species" onclick="cambiarEspecie()">Cambiar</button>
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
RENDERIZADO
=========================================================
*/
function renderContenidoPantalla(pantalla) {
  if (pantalla.tipo === "pregunta") {
    const opciones = document.createElement("div");
    opciones.className = "options";
    let opcionesAMostrar = pantalla.opciones;
    if (pantallaActual === "casosEspeciales") opcionesAMostrar = obtenerOpcionesPaso4();

    opcionesAMostrar.forEach(opcion => {
      const boton = document.createElement("button");
      boton.className = "option-btn";
      boton.innerHTML = opcion.texto;
      boton.onclick = () => {
        if (pantallaActual !== opcion.siguiente) historial.push(pantallaActual);
        pantallaActual = opcion.siguiente;
        const sig = pantallas[opcion.siguiente];
        if (!sig) { console.error("Pantalla destino no existe:", opcion.siguiente); return; }
        app.innerHTML = "";
        actualizarProgreso();

        const titulo = document.createElement("h2");
        titulo.textContent = sig.titulo;
        app.appendChild(titulo);

        if (especieSeleccionada && ["vivoMuerto", "casosEspeciales", "tortugaCampo"].includes(opcion.siguiente)) {
          const ficha = document.createElement("div");
          ficha.className = "selected-species-card";
          ficha.innerHTML = `
            <div class="selected-species-info">
              <h4> ${especieSeleccionada.nombreComun}</h4>
              <p>${especieSeleccionada.nombreCientifico}</p>
            </div>
            <button class="btn-change-species" onclick="cambiarEspecie()">Cambiar</button>
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
    resultado.className = "result " + (pantalla.clase || "");
    resultado.innerHTML = pantalla.contenido;
    app.appendChild(resultado);
  }

  if (pantalla.tipo === "buscador") crearBuscador();

  if (pantalla.tipo === "fin") {
    const resultado = document.createElement("div");
    resultado.className = "result " + (pantalla.clase || "");
    resultado.innerHTML = pantalla.contenido;
    app.appendChild(resultado);
    const fin = document.createElement("div");
    fin.className = "finish";
    fin.innerHTML = `<div class="finish-icon">✓</div>`;
    app.appendChild(fin);
  }
}

function mostrarPantalla(id) {
  if (pantallaActual !== id) historial.push(pantallaActual);
  pantallaActual = id;
  const pantalla = pantallas[id];
  if (!pantalla) { console.error("Pantalla no encontrada:", id); return; }
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
  const pasos = { inicio: 0, tipoAnimal: 1, vivoMuerto: 2, casosEspeciales: 3, paso5: 4 };
  const paso = pasos[pantallaActual] ?? 1;
  const total = 5;
  const porcentaje = (paso / total) * 100;
  progressFill.style.width = porcentaje + "%";
  progressText.textContent = paso === 0 ? "Inicio" : `Paso ${paso} de ${total}`;
}

/*
=========================================================
BUSCADOR
=========================================================
*/
function crearBuscador() {
  const input = document.createElement("input");
  input.className = "search-box";
  input.placeholder = "Escribe nombre común o científico...";
  input.autofocus = true;

  const hint = document.createElement("div");
  hint.className = "search-hint";
  hint.textContent = "Puedes buscar por nombre común (ej: 'águila', 'panal') o científico.";

  const resultados = document.createElement("div");
  resultados.className = "search-results";

  input.addEventListener("input", () => {
    const texto = normalizar(input.value);
    resultados.innerHTML = "";
    if (!texto || texto.length < 2) return;

    const encontrados = especiesLista.filter(especie => {
      const comun = normalizar(especie.nombreComun);
      const cientifico = normalizar(especie.nombreCientifico);
      return comun.includes(texto) || cientifico.includes(texto);
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
        <span class="species-type-badge ${etiqueta.clase}">${etiqueta.texto}</span>
      `;
      item.onclick = () => ejecutarAtajo(especie);
      resultados.appendChild(item);
    });

    if (encontrados.length === 0) {
      resultados.innerHTML = '<div class="small-note">No se han encontrado especies. Prueba con otro término.</div>';
    }
  });

  app.appendChild(input);
  app.appendChild(hint);
  app.appendChild(resultados);
}

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/*
=========================================================
PANTALLAS
=========================================================
*/
const pantallas = {

  inicio: {
    tipo: "pregunta",
    titulo: "¿Sabe la persona qué tipo de animal es?",
    descripcion: "Si no sabe identificarlo, puede solicitarse una fotografía para ayudar a identificarlo.",
    opciones: [
      { texto: "📷 No lo sabe", siguiente: "identificacion" },
      { texto: " Sí lo sabe", siguiente: "tipoAnimal" },
      { texto: "🔎 Buscar un animal (recomendado)", siguiente: "buscador" }
    ]
  },

  buscador: {
    tipo: "buscador",
    titulo: "🔎 Buscar especie",
    descripcion: "Escribe parte del nombre común o científico del animal."
  },

  identificacion: {
    tipo: "resultado",
    titulo: "📷 Identificación del animal",
    contenido: `
      <h3>Pide al ciudadano que envíe una fotografía.</h3>
      <p>WhatsApp de La Granja:</p>
      <div class="contact-box">
        <strong> 686 680 254</strong>
        Identificación y ubicación.
      </div>
      <p class="small-note">Una vez identificado, vuelve al inicio y selecciona la categoría o búscalo directamente.</p>
    `
  },

  tipoAnimal: {
    tipo: "pregunta",
    titulo: "¿Qué tipo de animal es?",
    descripcion: "Si tienes dudas, utiliza el buscador.",
    opciones: [
      { texto: "🦌 Caza mayor", siguiente: "cazaMayor" },
      { texto: "🐢 Tortuga marina o cetáceo", siguiente: "tortugaMarina" },
      { texto: "🏠 Animal doméstico", siguiente: "domestico" },
      { texto: "🦎 Animal exótico", siguiente: "exotico" },
      { texto: "🚨 Animal catalogado como invasor", siguiente: "invasor" },
      { texto: "🦇 Colonias de murciélagos o nidos", siguiente: "murcielagos" },
      { texto: "⚠️ Daños a la fauna o destrucción de nidos", siguiente: "danos" },
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
        <h4>🏠 Animales domésticos</h4>
        <ul><li>Pavos</li><li>Gallinas</li><li>Faisanes</li><li>Urones</li><li>Palomas bravías</li></ul>
      </div>
      <div class="reference-list">
        <h4>🚨 Animales INVASORES</h4>
        <ul>
          <li>Cotorras</li>
          <li>Galápagos: <em>Trachemys scripta</em>, <em>Pseudemys sp</em>, <em>Mauremys sp</em> (excepto <em>M. leprosa</em>)</li>
          <li>Mapache</li><li>Coipú</li><li>Pitón real</li>
        </ul>
      </div>
      <div class="reference-list">
        <h4> Animales CITES</h4>
        <ul>
          <li>Tortuga de espolones africana</li>
          <li>Águila de Harris</li>
          <li>Tortuga mapa (<em>Graptemys sp</em>)</li>
        </ul>
      </div>
    `
  },

  cazaMayor: {
    tipo: "fin",
    titulo: "🦌 Caza mayor",
    clase: "warning",
    contenido: `<h3>Indicar que llame al 112.</h3><p>Desde el 112 avisarán a la unidad de caza.</p><div class="contact-box"><strong> 112</strong>Emergencias.</div>`
  },

  tortugaMarina: {
    tipo: "fin",
    titulo: "🐢 Tortuga marina o cetáceo",
    contenido: `<h3>Indicar que llame al 112.</h3><div class="contact-box"><strong>📞 112</strong>Emergencias.</div>`
  },

  domestico: {
    tipo: "fin",
    titulo: "🏠 Animal doméstico",
    contenido: `<h3>Indicar que se dirija a su Ayuntamiento.</h3><p>Competencia municipal según art. 34 Ley 2/2023.</p>`
  },

  exotico: {
    tipo: "pregunta",
    titulo: "¿Qué situación se presenta?",
    opciones: [
      { texto: "🦎 Animal exótico CITES (posee o Policía Local consulta)", siguiente: "citesConsulta" },
      { texto: "🦎 Animal exótico CITES encontrado", siguiente: "citesEncontrado" },
      { texto: " Animal exótico NO invasor (excepto galápagos)", siguiente: "exoticoNoInvasor" }
    ]
  },

  exoticoNoInvasor: {
    tipo: "fin",
    titulo: "🏠 Animal exótico no invasor",
    contenido: `<h3>Indicar que se dirija a su Ayuntamiento.</h3><p class="small-note">⚠️ <strong>Excepción:</strong> los galápagos exóticos se tratan como invasores.</p>`
  },

  citesPregunta: {
    tipo: "pregunta",
    titulo: "📜 Animal exótico CITES",
    descripcion: "Especie protegida por el convenio CITES.",
    opciones: [
      { texto: "📋 Posee este animal", siguiente: "citesConsulta" },
      { texto: " Lo ha encontrado", siguiente: "citesEncontrado" }
    ]
  },

  citesEncontrado: {
    tipo: "fin",
    titulo: "🦎 Animal exótico CITES encontrado",
    contenido: `<h3>Indicar que se dirija a su Ayuntamiento.</h3>`
  },

  citesConsulta: {
    tipo: "fin",
    titulo: " Animal exótico CITES",
    contenido: `<h3>Indicar que describa su caso por correo.</h3><div class="contact-box"><strong>✉️ bzn-cites@miteco.es</strong><strong>✉️ bzn-tifies@miteco.es</strong></div>`
  },

  invasor: {
    tipo: "pregunta",
    titulo: "🚨 Animal catalogado como invasor",
    descripcion: "¿Está cerca de alguna unidad colaboradora?",
    opciones: [
      { texto: "Sí, está cerca", siguiente: "invasorUnidad" },
      { texto: "No está cerca", siguiente: "invasorNoUnidad" }
    ]
  },

  invasorUnidad: {
    tipo: "fin",
    titulo: "🚨 Animal invasor — Unidad colaboradora",
    contenido: `<h3>Puede llevarlo a una unidad colaboradora entre semana.</h3><p>Apuntar como <strong>recogida pendiente</strong>.</p>`
  },

  invasorNoUnidad: {
    tipo: "pregunta",
    titulo: "🚨 Animal invasor — Sin unidad cerca",
    descripcion: "¿El animal es de su propiedad o lo ha encontrado?",
    opciones: [
      { texto: "Es de su propiedad", siguiente: "invasorPropiedad" },
      { texto: "Lo ha encontrado", siguiente: "invasorEncontrado" }
    ]
  },

  invasorPropiedad: {
    tipo: "fin",
    titulo: "🚨 Animal invasor de su propiedad",
    contenido: `<h3>Han de traerlo al centro.</h3><div class="contact-box"><strong>📱 686 680 254</strong></div>`
  },

  invasorEncontrado: {
    tipo: "fin",
    titulo: "🚨 Animal invasor encontrado",
    contenido: `<h3>Llevarlo a la policía local del municipio.</h3><p>Avisar al centro para recogerlo allí.</p><div class="contact-box"><strong>📱 686 680 254</strong></div>`
  },

  murcielagos: {
    tipo: "fin",
    titulo: " Colonias de murciélagos o nidos",
    contenido: `<h3>No se puede actuar hasta que termine la época de cría.</h3><div class="contact-box"><strong>✉️ espaciosnaturales_valencia@listas.gva.es</strong></div>`
  },

  danos: {
    tipo: "fin",
    titulo: "️ Daños a la fauna o destrucción de nidos",
    contenido: `<p>Pueden llamar al 112 o enviar un correo.</p><div class="contact-box"><strong>📞 112</strong><strong>✉️ espaciosnaturales_valencia@gva.es</strong></div>`
  },

  huevosPlaya: {
    tipo: "fin",
    titulo: " Huevos en la playa",
    contenido: `<h3>No recoger los huevos.</h3><p>El nido del chorlitejo es rudimentario pero no están abandonados.</p>`
  },

  vivoMuerto: {
    tipo: "pregunta",
    titulo: "Paso 3 — ¿El animal está vivo o muerto?",
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
    contenido: `<h3>No es necesario recoger el cadáver.</h3>`
  },

  cadaverCausa: {
    tipo: "pregunta",
    titulo: "⚫ Animal muerto — Causa de la muerte",
    descripcion: "¿Probablemente es causa antropogénica? (Electrocución, ahogamiento, envenenamiento, colisión)",
    opciones: [
      { texto: "Sí, causa antropogénica", siguiente: "cadaverAntropogenica" },
      { texto: "No, causa natural", siguiente: "cadaverNatural" }
    ]
  },

  cadaverAntropogenica: {
    tipo: "fin",
    titulo: "⚡ Cadáver con causa antropogénica",
    clase: "warning",
    contenido: `<h3>Llamar al CPIF.</h3><p class="small-note"><strong>NOTA CPIF:</strong> Si no envían agente, registrar la incidencia.</p>`
  },

  cadaverNatural: {
    tipo: "fin",
    titulo: " Cadáver sin causa antropogénica",
    contenido: `<h3>No es necesario recoger el cadáver.</h3>`
  },

  casosEspeciales: {
    tipo: "pregunta",
    titulo: "Paso 4 — Casos especiales (Animal VIVO)",
    descripcion: "Comprobar en este orden. Si ninguno aplica, ir al Paso 5.",
    opciones: []
  },

  animalVivienda: {
    tipo: "fin",
    titulo: "🏠 Animal dentro de una vivienda",
    contenido: `<h3>No cazamos animales.</h3><p>Deben facilitar su salida de la vivienda.</p>`
  },

  animalProblemas: {
    tipo: "fin",
    titulo: " Animal con problemas fuera de vivienda",
    contenido: `<h3>Llamar al CPIF.</h3><p class="small-note"><strong>NOTA CPIF:</strong> Si no envían agente, registrar incidencia.</p>`
  },

  causaAntropogenica: {
    tipo: "fin",
    titulo: "⚡ Problema por causa antropogénica",
    contenido: `<h3>Llamar al CPIF.</h3><p class="small-note"><strong>NOTA CPIF:</strong> Si no envían agente, registrar incidencia.</p>`
  },

  tortugaPropiedad: {
    tipo: "fin",
    titulo: " Tortuga terrestre propiedad de alguien",
    contenido: `<h3>Solicitar fotografía antes de traerla.</h3><div class="contact-box"><strong> WhatsApp: 686 680 254</strong></div>`
  },

  tortugaCampo: {
    tipo: "pregunta",
    titulo: "🐢 Tortuga/galápago autóctono en el campo",
    descripcion: "¿Tiene heridas o síntomas de enfermedad?",
    opciones: [
      { texto: "Sí, tiene heridas/síntomas", siguiente: "paso5" },
      { texto: "No tiene heridas/síntomas", siguiente: "tortugaCampoPeligro" }
    ]
  },

  tortugaCampoPeligro: {
    tipo: "pregunta",
    titulo: "🐢 Tortuga sin heridas — ¿Peligro inminente?",
    opciones: [
      { texto: "Sí, hay peligro", siguiente: "tortugaCampoRetirar" },
      { texto: "No hay peligro", siguiente: "tortugaCampoNoLlevar" }
    ]
  },

  tortugaCampoRetirar: {
    tipo: "fin",
    titulo: "🐢 Retirar a lugar seguro",
    contenido: `<h3>Retíralo y ponlo en lugar seguro.</h3><p><strong>PERO NO TE LO LLEVES.</strong></p>`
  },

  tortugaCampoNoLlevar: {
    tipo: "fin",
    titulo: "🐢 No llevárselo",
    contenido: `<h3>No es necesario recogerla.</h3>`
  },

  cristal: {
    tipo: "pregunta",
    titulo: "🪟 Ave estrellada contra cristal",
    descripcion: "Mantener en caja tranquila 2 horas. Luego sacar en lugar libre de obstáculos.",
    opciones: [
      { texto: "Al sacarlo, emprende el vuelo", siguiente: "cristalVuela" },
      { texto: "NO puede emprender el vuelo", siguiente: "paso5" }
    ]
  },

  cristalVuela: {
    tipo: "fin",
    titulo: "🪟 Ave recuperada",
    contenido: `<h3>El animal se ha recuperado.</h3>`
  },

  conejoLiebre: {
    tipo: "pregunta",
    titulo: "🐇 Cría de conejo o liebre",
    opciones: [
      { texto: "No está herida", siguiente: "conejoSano" },
      { texto: "Está herida/debilitada", siguiente: "conejoHerido" }
    ]
  },

  conejoSano: {
    tipo: "fin",
    titulo: " Cría sana",
    contenido: `<h3>No cogerla. Alejarse rápidamente.</h3><p>La madre está cerca.</p>`
  },

  conejoHerido: {
    tipo: "resultado",
    titulo: " Cría herida",
    contenido: `
      <h3>Poner en caja con agujeros.</h3>
      <p>Mantener en ambiente tranquilo.</p>
      <div style="text-align: center; margin-top: 25px;">
        <button class="btn btn-primary" onclick="mostrarPantalla('paso5')">➡️ Continuar al Paso 5</button>
      </div>
    `
  },

  panal: {
    tipo: "fin",
    titulo: "🐝 Panal de abejas/avispas",
    contenido: `<h3>Indicar que llame al 112.</h3><div class="contact-box"><strong>📞 112</strong></div>`
  },

  avispaAsiatica: {
    tipo: "fin",
    titulo: "🪰 Avispa asiática",
    contenido: `<h3>Indicar que llame al 112.</h3><div class="contact-box"><strong>📞 112</strong></div>`
  },

  criaLechuzaCernicalo: {
    tipo: "pregunta",
    titulo: "🪶 Cría de lechuza/cernícalo",
    opciones: [
      { texto: "No tiene heridas", siguiente: "lechuzaSana" },
      { texto: "Tiene heridas", siguiente: "lechuzaHerida" }
    ]
  },

  lechuzaSana: {
    tipo: "resultado",
    titulo: "🪶 Cría sin heridas",
    contenido: `
      <h3>Buscar el nido y devolverla.</h3>
      <p><strong>IMPORTANTE:</strong> Coordenadas del nido en lechuzas.</p>
      <div style="text-align: center; margin-top: 25px;">
        <button class="btn btn-primary" onclick="mostrarPantalla('paso5')">➡️ Si no encuentras el nido, ir al Paso 5</button>
      </div>
    `
  },

  lechuzaHerida: {
    tipo: "resultado",
    titulo: " Cría herida",
    contenido: `
      <h3>Meter en caja con agujeros.</h3>
      <p>Mantener en ambiente tranquilo.</p>
      <div style="text-align: center; margin-top: 25px;">
        <button class="btn btn-primary" onclick="mostrarPantalla('paso5')">➡️ Continuar al Paso 5</button>
      </div>
    `
  },

  criaRapazOtra: {
    tipo: "pregunta",
    titulo: "🦅 Cría de rapaz (otra)",
    descripcion: "¿Dónde se encuentra?",
    opciones: [
      { texto: "Medio natural", siguiente: "rapazNatural" },
      { texto: "Medio urbano", siguiente: "rapazUrbano" }
    ]
  },

  rapazNatural: {
    tipo: "pregunta",
    titulo: "🦅 Cría en medio natural",
    descripcion: "¿Tiene signos de enfermedad/heridas?",
    opciones: [
      { texto: "No tiene signos", siguiente: "rapazNaturalSana" },
      { texto: "Tiene signos/heridas", siguiente: "rapazNaturalHerida" }
    ]
  },

  rapazNaturalSana: {
    tipo: "fin",
    titulo: "🦅 Cría sana en medio natural",
    contenido: `<h3>Déjala donde está.</h3>`
  },

  rapazNaturalHerida: {
    tipo: "resultado",
    titulo: "🦅 Cría herida",
    contenido: `
      <h3>Meter en caja con agujeros.</h3>
      <p>Mantener en ambiente tranquilo.</p>
      <div style="text-align: center; margin-top: 25px;">
        <button class="btn btn-primary" onclick="mostrarPantalla('paso5')">➡️ Continuar al Paso 5</button>
      </div>
    `
  },

  rapazUrbano: {
    tipo: "resultado",
    titulo: " Cría en medio urbano",
    contenido: `
      <h3>Meter en caja con agujeros.</h3>
      <p>Mantener en ambiente tranquilo.</p>
      <div style="text-align: center; margin-top: 25px;">
        <button class="btn btn-primary" onclick="mostrarPantalla('paso5')">➡️ Continuar al Paso 5</button>
      </div>
    `
  },

  erizo: {
    tipo: "pregunta",
    titulo: "🦔 Erizo",
    opciones: [
      { texto: "Noche/últimas horas", siguiente: "erizoNoche" },
      { texto: "De día", siguiente: "erizoDia" }
    ]
  },

  erizoNoche: {
    tipo: "pregunta",
    titulo: "🦔 Erizo de noche",
    descripcion: "¿Tiene signos de enfermedad/heridas?",
    opciones: [
      { texto: "Sí, tiene signos/heridas", siguiente: "paso5" },
      { texto: "No, pero hay peligro", siguiente: "erizoNochePeligro" },
      { texto: "No, sin peligro", siguiente: "erizoNocheOk" }
    ]
  },

  erizoNochePeligro: {
    tipo: "fin",
    titulo: "🦔 Erizo con peligro",
    contenido: `<h3>Retirar a lugar seguro.</h3><p><strong>PERO NO TE LO LLEVES.</strong></p>`
  },

  erizoNocheOk: {
    tipo: "fin",
    titulo: "🦔 Erizo sin problemas",
    contenido: `<h3>No es necesario recogerlo.</h3>`
  },

  erizoDia: {
    tipo: "resultado",
    titulo: "🦔 Erizo de día",
    contenido: `
      <h3>Un erizo de día suele tener problema.</h3>
      <div style="text-align: center; margin-top: 25px;">
        <button class="btn btn-primary" onclick="mostrarPantalla('paso5')">➡️ Continuar al Paso 5</button>
      </div>
    `
  },

  criaAve: {
    tipo: "pregunta",
    titulo: "🐣 Cría de pajarito",
    descripcion: "¿Es un volantón?",
    opciones: [
      { texto: "Sí, es volantón", siguiente: "volanton" },
      { texto: "No es volantón", siguiente: "criaAveNoVolanton" }
    ]
  },

  volanton: {
    tipo: "pregunta",
    titulo: "🐣 Volantón — ¿Cuánto tiempo?",
    opciones: [
      { texto: "Menos de 1h 30min", siguiente: "volantonMenos90" },
      { texto: "Más de 1h 30min", siguiente: "volantonMas90" }
    ]
  },

  volantonMenos90: {
    tipo: "pregunta",
    titulo: " Volantón — Menos de 1h 30min",
    descripcion: "¿Puede devolverlo?",
    opciones: [
      { texto: "Sí, puede devolverlo", siguiente: "volantonDevolver" },
      { texto: "No puede", siguiente: "volantonNoDevolver" }
    ]
  },

  volantonDevolver: {
    tipo: "fin",
    titulo: "🐣 Devolver el volantón",
    contenido: `<h3>Dejarlo donde lo encontró.</h3>`
  },

  volantonNoDevolver: {
    tipo: "pregunta",
    titulo: "🐣 Volantón — No puede devolver",
    descripcion: "¿Está cerca de unidad colaboradora?",
    opciones: [
      { texto: "Sí, cerca de unidad", siguiente: "criaUnidad" },
      { texto: "No está cerca", siguiente: "criaCentro" }
    ]
  },

  volantonMas90: {
    tipo: "pregunta",
    titulo: "🐣 Volantón — Más de 1h 30min",
    descripcion: "¿Está cerca de unidad colaboradora?",
    opciones: [
      { texto: "Sí, cerca de unidad", siguiente: "criaUnidad" },
      { texto: "No está cerca", siguiente: "criaCentro" }
    ]
  },

  criaAveNoVolanton: {
    tipo: "pregunta",
    titulo: "🐣 Cría no volantón",
    descripcion: "Vencejo, golondrina, avión, sin plumas o herido.",
    opciones: [
      { texto: "Cerca de unidad", siguiente: "criaUnidad" },
      { texto: "No cerca", siguiente: "criaCentro" }
    ]
  },

  criaUnidad: {
    tipo: "fin",
    titulo: "🐣 Unidad colaboradora",
    contenido: `<h3>Llevar a unidad entre semana.</h3><p>Apuntar recogida pendiente.</p>`
  },

  criaCentro: {
    tipo: "fin",
    titulo: "🐣 Traer al centro",
    contenido: `<h3>No hacemos recogidas de crías.</h3><p>Traer al centro en caja sin comida/agua.</p>`
  },

  paso5: {
    tipo: "pregunta",
    titulo: "Paso 5 — Animal herido/enfermo",
    descripcion: "Sin causa antropogénica evidente. ¿Qué día es?",
    opciones: [
      { texto: "📅 Entre semana", siguiente: "entreSemana" },
      { texto: "🗓️ Fin de semana", siguiente: "finSemana" }
    ]
  },

  entreSemana: {
    tipo: "pregunta",
    titulo: "¿Hay unidad colaboradora cerca?",
    opciones: [
      { texto: "Sí, hay unidad", siguiente: "unidadCerca" },
      { texto: "No hay unidad", siguiente: "sinUnidad" }
    ]
  },

  unidadCerca: {
    tipo: "fin",
    titulo: " Unidad colaboradora",
    contenido: `<h3>Enviar a la unidad.</h3><p>Anotar recogida pendiente.</p>`
  },

  sinUnidad: {
    tipo: "fin",
    titulo: "🚗 Recogida en domicilio",
    contenido: `<h3>Tomar datos para recogida.</h3><p>Anotar recogida pendiente.</p>`
  },

  finSemana: {
    tipo: "pregunta",
    titulo: "🗓️ Fin de semana",
    descripcion: "No hay servicio de recogida. ¿Puede traerlo?",
    opciones: [
      { texto: "Sí, puede traerlo", siguiente: "finSemanaPuedeTraer" },
      { texto: "No puede traerlo", siguiente: "finSemanaNoPuede" }
    ]
  },

  finSemanaPuedeTraer: {
    tipo: "fin",
    titulo: "🗓️ Trae al centro",
    contenido: `<h3>Puede traer el animal al centro.</h3>`
  },

  finSemanaNoPuede: {
    tipo: "pregunta",
    titulo: "🗓️ No puede traerlo",
    descripcion: "Llamamos al CPIF. ¿El agente puede recogerlo?",
    opciones: [
      { texto: "Sí, el agente puede", siguiente: "agentePuede" },
      { texto: "No, el agente no puede", siguiente: "agenteNoPuede" }
    ]
  },

  agentePuede: {
    tipo: "fin",
    titulo: "👮 Agente recoge",
    contenido: `<h3>El Agente se hará cargo.</h3>`
  },

  agenteNoPuede: {
    tipo: "fin",
    titulo: "🗓️ Iremos el lunes",
    contenido: `<h3>Indicar que iremos el lunes.</h3><p>Dejar en caja con agujero. <strong>Sin comida/agua/medicamentos.</strong></p><p class="small-note"><strong>Apuntar recogida pendiente.</strong></p>`
  }

};

cargarEspecies().then(() => {
  mostrarPantalla("inicio");
});
