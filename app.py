from flask import Flask, render_template, request
import google.generativeai as genai
from dotenv import load_dotenv
import os
from time import sleep
from utils import carga
from persona import personas, analizar_sentimiento

# Cargar variables de entorno
load_dotenv()

# Configuración API Gemini
api_key = os.getenv("GEMINI_API_KEY")
modelo = "gemini-2.5-flash"   
genai.configure(api_key=api_key)

# Inicializar Flask
app = Flask(__name__)
app.secret_key = 'bootcampdatalat'

# Cargar el contexto del e-commerce F1Store
contexto = carga("datos/f1store.txt")


def bot(prompt):
    """
    Función principal del chatbot.
    - Analiza el sentimiento del usuario.
    - Selecciona la personalidad de respuesta (positivo, neutro o negativo).
    - Genera la respuesta basada en el contexto de F1Store.
    """
    max_intentos = 1  # Número máximo de reintentos
    repeticion = 0
    while True:
        try:
            # Selección de personalidad en función del análisis de sentimiento
            personalidad = personas[analizar_sentimiento(prompt)]
            
            # Instrucciones que guían al modelo
            prompt_sistema = f"""
                                # PERSONA

                                Eres un chatbot de atención al cliente de F1Store, 
                                un e-commerce especializado en productos oficiales de Fórmula 1 
                                (ropa, cascos, miniaturas, accesorios, libros, tecnología de simulación, etc.).

                                No debes responder preguntas que no estén relacionadas con F1Store.
                                Únicamente debes utilizar los datos que estén dentro del 'contexto'.

                                # CONTEXTO
                                {contexto}

                                # PERSONALIDAD
                                {personalidad}
                             """
            
            # Configuración del modelo Gemini
            configuracion_modelo = {
                "temperature": 0.2,        # menor aleatoriedad para respuestas más consistentes
                "max_output_tokens": 8192  # máximo de tokens permitidos
            }

            llm = genai.GenerativeModel(
                model_name=modelo,
                system_instruction=prompt_sistema,
                generation_config=configuracion_modelo   
            )

            respuesta = llm.generate_content(prompt)
            return respuesta.text
        
        except Exception as e:
            repeticion += 1
            if repeticion >= max_intentos:
                return f"Error con Gemini: {e}"
            sleep(50)


@app.route("/chat", methods=["POST"])
def chat():
    """
    Endpoint principal para el chatbot.
    Recibe un mensaje del usuario y devuelve la respuesta del bot.
    """
    prompt = request.json["msg"]
    respuesta = bot(prompt)
    return respuesta


@app.route("/")
def home():
    """
    Ruta principal que renderiza la interfaz web del chatbot.
    """
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
