"use strict";

// getElementById
function $id(id) {
    return document.getElementById(id);
}

// output information
function output(msg) {
    let m = $id("messages");
    m.innerHTML = msg + m.innerHTML;
}

// file drag hover
function fileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type === "dragover" ? "hover" : "");
}

// file selection
function fileSelectHandler(e) {

    // cancel event and hover styling
    fileDragHover(e);

    // fetch FileList object
    let files = (e.target.files || e.dataTransfer.files);
    if (e.constructor.name !== "DragEvent") {
        // process all File objects
        for (let i = 0; i < files.length; i++) {
            let file = files.item(i);
            if (file !== null) {
                parseFile(file);
            }
        }
    }

    // files can be added by drag&drop or clicking on form's button
    // if the later, append files to form files field
    const formFiles = $id("upload").fileselect;
    if (formFiles.files.length === 0) {
        formFiles.files = files;
    }
}

// output file information
function parseFile(file) {
    output("<p>Datos del fichero: <strong>" + file.name +
        "</strong> Tipo: <strong>" + file.type +
        "</strong> Tamaño: <strong>" + file.size +
        "</strong> bytes</p>");
}

function validacionCampos(submitform, numFiles) {
    const formImputValidity = [
        submitform.telefono.checkValidity(),
        submitform.mail.checkValidity(),
        submitform.libro.checkValidity(),
        submitform.num_libros.checkValidity(),
    ];

    const fieldsValid = formImputValidity.every(element => element);
    const enoughFiles = numFiles > 1;


    if (!fieldsValid) { alert("Error: Rellene correctamente todos los campos."); }
    if (!enoughFiles) { alert("Error: Incluya al menos 2 archivos."); }

    return formImputValidity.every(element => element) && enoughFiles;
}

function enviar(submitform) {
    // debes devolver una función que recoja los datos de submitform usando FormData y haga una
    // petición post (usando el Fetch API) con dichos datos a /pedido/add
    //  El resultado debes tratarlo como un objeto JSON y mostrarlo pantalla. En concreto la respuesta
    // JSON debe contener las rutas a los ficheros subidos al servidor (al hacer click sobre ellas deben
    // abrirse los ficheros) y los valores del resto de campos

    // Generamos un form data
    let formData = new FormData(submitform);

    let numFiles = 0;
    for (const _ of formData.entries()) { numFiles++; }

    // Validamos los campos
    if (!validacionCampos(submitform, numFiles))
        return;

    // Añadimos los valores a mano porque el comando new FormData(submitform) no lo carga correctamente
    formData.append('nombre', submitform.nombre.value);
    formData.append('telefono', submitform.telefono.value);
    formData.append('mail', submitform.mail.value);
    formData.append('libro', submitform.libro.value);
    formData.append('num_libros', submitform.num_libros.value);

    // Hacemos la petición
    fetch("/pedido/add", {
        method: 'post',
        body: formData,
    })
        .then((response) => response.json())
        .then((responseData) => {
            console.log(responseData);

            let messageSection = $id("responses")
            let imageSection = $id("images")
            imageSection.innerHTML = ''

            if (responseData.success) {
                messageSection.innerHTML = `
                <br><br>
                <h3>Resultados del formulario:</h3> <ul>
                <li>Nombre: ${responseData.nombre}</li>
                <li>Teléfono: ${responseData.telefono}</li>
                <li>E-Mail: ${responseData.mail}</li>
                <li>Libro: ${responseData.libro}</li>
                <li>Cantidad: ${responseData.num_libros}</li>
                <li>Imágenes Subidas: </li>
                </ul>
                `
                responseData.remote_files.forEach(path => {
                    let img = document.createElement('img')
                    img.setAttribute("style", "max-width:200px; max-height:150px; height:auto;")
                    img.src = path.replace(/^(public)/, '')
                    imageSection.appendChild(img)
                })
            } else {
                messageSection.innerHTML = `
                <br><br>
                <h3 style="color: darkred">Error</h3>
                <p><b>Error message:</b> ${responseData.error_message}</p>             
                <p><b>Error JSON:</b></p>         
                <p>${JSON.stringify(responseData.error, undefined, 2)}</p>
                `
            }
        });
}


// initialize
function init() {
    const fileselect = $id("fileselect"), filedrag = $id("filedrag"), submitbutton = $id("enviar");

    submitbutton.onclick = (ev) => {
        enviar($id("upload"));
        ev.preventDefault();
    };

    // file select
    fileselect.addEventListener("change", fileSelectHandler, false);

    // file drop
    filedrag.addEventListener("dragover", fileDragHover, false);
    filedrag.addEventListener("dragleave", fileDragHover, false);
    filedrag.addEventListener("drop", fileSelectHandler, false);
    filedrag.style.display = "block";
}

// call initialization file
if (window.File && window.FileList) {
    init();
}
