// Selección de elementos del DOM
let chat = document.querySelector('#chat');
let input = document.querySelector('#input');
let botonEnviar = document.querySelector('#boton-enviar');

/**
 * Envía el mensaje del usuario al backend y recibe la respuesta del bot.
 */
async function enviarMensaje() {
    // Validación: no enviar mensajes vacíos
    if (!input.value.trim()) return;

    // Guardar el mensaje del usuario y limpiar el input
    let mensaje = input.value.trim();
    input.value = "";

    // Crear burbuja de usuario
    let nuevaBurbuja = creaBurbujaUsuario();
    nuevaBurbuja.innerHTML = mensaje;
    chat.appendChild(nuevaBurbuja);

    // Crear burbuja de "bot pensando..."
    let nuevaBurbujaBot = creaBurbujaBot();
    nuevaBurbujaBot.innerHTML = "💭 Analizando ...";
    chat.appendChild(nuevaBurbujaBot);
    irParaFinalDelChat();

    try {
        // Enviar mensaje al backend Flask
        const respuesta = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 'msg': mensaje }),
        });

        // Procesar respuesta
        if (!respuesta.ok) {
            throw new Error("Error en la conexión con el servidor.");
        }

        const textoDeRespuesta = await respuesta.text();

        // Simular que el bot tarda un poco en contestar
        setTimeout(() => {
            nuevaBurbujaBot.innerHTML = textoDeRespuesta.replace(/\n/g, '<br>');
            irParaFinalDelChat();
        }, 600);

    } catch (error) {
        // Mostrar error al usuario si falla el servidor
        nuevaBurbujaBot.innerHTML = `⚠️ Error: ${error.message}`;
    }
}

/**
 * Crea la burbuja de mensaje del usuario.
 */
function creaBurbujaUsuario() {
    let burbuja = document.createElement('p');
    burbuja.classList = 'chat__burbuja chat__burbuja--usuario';
    return burbuja;
}

/**
 * Crea la burbuja de mensaje del bot.
 */
function creaBurbujaBot() {
    let burbuja = document.createElement('p');
    burbuja.classList = 'chat__burbuja chat__burbuja--bot';
    return burbuja;
}

/**
 * Desplaza el chat automáticamente hacia el final.
 */
function irParaFinalDelChat() {
    chat.scrollTop = chat.scrollHeight;
}

// Eventos: click en botón enviar o presionar "Enter"
botonEnviar.addEventListener('click', enviarMensaje);
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) { // Tecla Enter
        botonEnviar.click();
    }
});
