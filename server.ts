import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load .env.local first (as documented in README), then fall back to .env
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env if .env.local is missing


const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const DATA_FILE = path.join(process.cwd(), "responses.json");

// Validate required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY no está configurada. Crea un archivo .env.local con tu clave API de Gemini.");
  console.error("   Ejemplo: GEMINI_API_KEY=tu_clave_aqui");
  // Don't exit in production - the AI endpoint will return an error when called
}

// Middleware
app.use(express.json());


// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Authorized PINs
const PINS = {
  KIDS: "KIDS10",
  TEENS: "TEENS13",
  TEACHERS: "DOCENTER7",
  ADMIN: "ORGANIZADOR99"
};

// Seed Data
const DEFAULT_RESPONSES = [
  // Kids (10-12)
  {
    id: "k-1",
    type: "kids",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    name: "Santi",
    age: "11",
    spokenToAI: "Sí, uso Siri en el celular de mi mamá y Alexa para pedir música",
    aiForWhat: ["Dibujar y pintar", "Hacer la tarea", "Crear videojuegos"],
    curiosityMiedo: "¿Los robots pueden llegar a pensar por sí mismos o tener sentimientos?",
    excitement: "🤩"
  },
  {
    id: "k-2",
    type: "kids",
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    name: "Mili",
    age: "10",
    spokenToAI: "No lo sé muy bien, creo que sí por TikTok",
    aiForWhat: ["Crear videojuegos", "Hablar con una mascota virtual"],
    curiosityMiedo: "Me da miedo que hagan los trabajos de los humanos y mi papá se quede sin trabajo",
    excitement: "🚀"
  },
  {
    id: "k-3",
    type: "kids",
    timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
    name: "Benja",
    age: "12",
    spokenToAI: "Sí, uso ChatGPT para que me explique cosas de ciencias naturales",
    aiForWhat: ["Hacer la tarea", "Aprender materias de la escuela"],
    curiosityMiedo: "¿Cómo aprende una computadora? ¿Le duele la cabeza por procesar tanto?",
    excitement: "🤩"
  },
  // Teens (13-17)
  {
    id: "t-1",
    type: "teens",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    name: "Valentina",
    age: "15",
    usageFreq: "Diariamente para divertirme",
    aiInterests: ["Creación de imágenes y diseño", "Creación de audios y videos", "Cuestiones éticas y deepfakes"],
    criticalQuestion: "¿Cómo podemos confiar en lo que vemos en internet si las IA pueden crear videos falsos ultra realistas?",
    aiPerspective: "Oportunidad positiva"
  },
  {
    id: "t-2",
    type: "teens",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    name: "Mateo",
    age: "17",
    usageFreq: "Diariamente para la escuela o tareas",
    aiInterests: ["Programación y código", "Estudio y productividad"],
    criticalQuestion: "¿La IA va a reemplazar a los programadores junior para cuando yo termine la universidad?",
    aiPerspective: "Una herramienta tecnológica más"
  },
  {
    id: "t-3",
    type: "teens",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    name: "Sofía",
    age: "14",
    usageFreq: "Ocasionalmente",
    aiInterests: ["Cuestiones éticas y deepfakes", "Futuro del trabajo"],
    criticalQuestion: "Quisiera que debatamos sobre el derecho de autor de las imágenes que usan para entrenar a las IA.",
    aiPerspective: "Amenaza para la humanidad"
  },
  // Teachers
  {
    id: "p-1",
    type: "teachers",
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
    name: "Prof. Laura G. (Lengua y Literatura)",
    subject: "Lengua y Literatura",
    q1Curriculum: "Me gustaría usar IA para co-diseñar consignas de escritura creativa o analizar estructuras de textos. Puede ser una gran aliada para generar ejemplos de diferentes estilos literarios en segundos.",
    q2Ethics: "La falta de honestidad académica: que peguen directamente lo que genera la máquina sin procesarlo críticamente. Me gustaría discutir la diferencia entre automatizar versus pensar autónomamente.",
    q3Challenges: "Observo que muchos adolescentes entregan trabajos totalmente redactados por IA sin haberlos leído. Necesitamos sugerencias sobre cómo evaluar procesos de manera oral o bimodal, y que comprendan el plagio moderno.",
    suggestions: "Sería fabuloso que les muestre cómo usar prompts interactivos de debate didáctico en vez de solo usarlo para pedirle resúmenes directos."
  },
  {
    id: "p-2",
    type: "teachers",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    name: "Ing. Carlos D. (Matemáticas y Fisiología)",
    subject: "Matemática y Física",
    q1Curriculum: "La IA puede actuar como un tutor personalizado que explica un problema de álgebra con diferentes analogías paso a paso. Facilita la diferenciación en aulas numerosas.",
    q2Ethics: "El sesgo de confirmación y el riesgo de creer ciegamente en alucinaciones matemáticas. Deben aprender que la IA no es un buscador de verdades infalibles.",
    q3Challenges: "La dependencia mental fácil: dejan de ejercitar destrezas heurísticas básicas por derivar todo a calculadoras automáticas inteligentes. Queremos que entiendan la IA como un andamio, no como un sustituto intelectual.",
    suggestions: "Sugiero proponer un ejercicio práctico de identificar errores en una explicación generada por una IA."
  }
];

// Read helper
function getResponses() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_RESPONSES, null, 2), "utf-8");
    return DEFAULT_RESPONSES;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading data file:", err);
    return [];
  }
}

// Write helper
function saveResponse(response: any) {
  const current = getResponses();
  current.push(response);
  fs.writeFileSync(DATA_FILE, JSON.stringify(current, null, 2), "utf-8");
}

// Clear helper
function clearResponses() {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
}

// API: Check authorization code on headers or queries
function authorizePin(req: express.Request, expectedPin: string | string[]) {
  const pin = req.headers["x-pin"] || req.query.pin;
  if (!pin) return false;
  if (Array.isArray(expectedPin)) {
    return expectedPin.includes(pin as string);
  }
  return pin === expectedPin;
}

// API Routes

// Retrieve survey results (Admin only)
app.get("/api/responses", (req, res) => {
  if (!authorizePin(req, PINS.ADMIN)) {
    return res.status(403).json({ error: "Acceso no autorizado. PIN incorrecto." });
  }
  res.json(getResponses());
});

// Clear survey results or reset (Admin only)
app.delete("/api/responses", (req, res) => {
  if (!authorizePin(req, PINS.ADMIN)) {
    return res.status(403).json({ error: "Acceso no autorizado. PIN incorrecto." });
  }

  const { action } = req.body;
  if (action === "reset") {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_RESPONSES, null, 2), "utf-8");
    return res.json({ message: "Se reestablecieron las respuestas de ejemplo con éxito.", data: DEFAULT_RESPONSES });
  } else {
    clearResponses();
    return res.json({ message: "Todas las respuestas fueron eliminadas con éxito.", data: [] });
  }
});

// Submit a new response (Allowed write for authorized students or teachers)
app.post("/api/responses", (req, res) => {
  const { surveyType, pin, payload } = req.body;
  
  // Handshake verification based on target collection
  let expectedPin = "";
  if (surveyType === "kids") expectedPin = PINS.KIDS;
  else if (surveyType === "teens") expectedPin = PINS.TEENS;
  else if (surveyType === "teachers") expectedPin = PINS.TEACHERS;
  else {
    return res.status(400).json({ error: "Tipo de encuesta inválido." });
  }

  if (pin !== expectedPin) {
    return res.status(403).json({ error: "PIN de acceso inválido para esta sección." });
  }

  const newResponse = {
    id: `${surveyType[0]}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: surveyType,
    timestamp: new Date().toISOString(),
    ...payload
  };

  saveResponse(newResponse);
  res.status(201).json({ success: true, message: "Respuesta enviada de forma exitosa." });
});

// POST: Generate class outline via Gemini API (Admin only)
app.post("/api/gemini/plan", async (req, res) => {
  if (!authorizePin(req, PINS.ADMIN)) {
    return res.status(403).json({ error: "Acceso no autorizado." });
  }

  try {
    const responses = getResponses();
    
    // Categorize responses to feed structured info
    const kids = responses.filter((r: any) => r.type === "kids");
    const teens = responses.filter((r: any) => r.type === "teens");
    const teachers = responses.filter((r: any) => r.type === "teachers");

    const promptText = `
Sos un Experto Pedagógico de Inteligencia Artificial para el ámbito educativo de habla hispana. He relevado información mediante encuestas para preparar dos charlas taller de 40 minutos cada una.
La primera charla es para niños de primaria (10 a 12 años).
La segunda charla es para adolescentes de secundaria (13 a 17 años).
También los profesores respondieron planteando sugerencias curriculares, comportamientos de aula y desafíos éticos.

Nuestra base de datos de encuestas tiene la siguiente información real recolectada de los dispositivos de los asistentes:

--- ENCUESTAS NIÑOS DE PRIMARIA (10-12 años): ${kids.length} respuestas ---
${kids.map((k: any, index: number) => `- Alumno ${index+1} (Edad: ${k.age || "11"}): Tiene curiosidad o miedo por: "${k.curiosityMiedo || "Nada"}". Lo usaría para: [${(k.aiForWhat || []).join(", ")}]. Interacciones previas: "${k.spokenToAI || "No"}"`).join("\n")}

--- ENCUESTAS ADOLESCENTES DE SECUNDARIA (13-17 años): ${teens.length} respuestas ---
${teens.map((t: any, index: number) => `- Alumno ${index+1} (Edad: ${t.age || "15"}, Perspectiva: ${t.aiPerspective || "Incierta"}): Frecuencia de uso: ${t.usageFreq || "Poco"}. Intereses principales: [${(t.aiInterests || []).join(", ")}]. Pregunta crítica: "${t.criticalQuestion || "Ninguna"}"`).join("\n")}

--- ENCUESTAS DOCENTES: ${teachers.length} respuestas ---
${teachers.map((p: any, index: number) => `- Docente ${index+1} (Materia: ${p.subject}):
  * Cómo complementa la materia: "${p.q1Curriculum}"
  * Valores éticos/uso adecuado a reforzar: "${p.q2Ethics}"
  * Desafíos académicos/mal uso: "${p.q3Challenges}"
  * Sugerencias extras: "${p.suggestions || "Ninguna"}"`).join("\n")}

Objetivos del análisis que debés darme:
Diseña una propuesta de plan didáctico hiper optimizado y adaptado que responda exactamente a las preocupaciones y deseos recolectados en el sondeo. Estructura tu respuesta estrictamente en un formato JSON para que mi frontend lo dibuje como si fuera una diapositiva o un guión didáctico interactivo secuencial paso a paso.

El formato JSON resultante de retorno debe seguir estrictamente este esquema:
{
  "resumenAnalisis": {
    "kidsConceptKey": "Una frase conceptual o enfoque pedagógico para la charla de los niños, basada en sus miedos/inquietudes reales.",
    "teensConceptKey": "Una frase de enfoque crítico/profesional para los adolescentes.",
    "teachersDemands": "Síntesis del desafío docente que hay que aplacar en las aulas de esta institución."
  },
  "planKids": {
    "titulo": "Título sugerido de la clase/taller de primaria (dinámico y divertido)",
    "estructuraMinutos": [
      { "bloque": "Introducción (0-10 min)", "contenido": "...", "actividad": "..." },
      { "bloque": "Núcleo Temático (10-25 min)", "contenido": "...", "actividad": "..." },
      { "bloque": "Espacio de Preguntas (25-35 min)", "contenido": "...", "actividad": "..." },
      { "bloque": "Cierre y Reflexión (35-40 min)", "contenido": "...", "actividad": "..." }
    ],
    "slides": [
      {
        "slideNum": 1,
        "titulo": "...",
        "guionDocente": "Qué decir textualmente y cómo abordar lo que ellos expresaron en las encuestas.",
        "puntosClave": ["...", "..."],
        "consejoPedagogico": "..."
      }
    ],
    "preguntasQA": [
      "Pregunta directa redactada para el Q&A de primaria que resuelva sus preguntas de las encuestas (por ej. si plantearon miedo por pérdida de trabajos de sus padres)."
    ]
  },
  "planTeens": {
    "titulo": "Título de la clase en secundaria (maduro, desafiante y tecnológico)",
    "estructuraMinutos": [
      { "bloque": "Introducción (0-10 min)", "contenido": "...", "actividad": "..." },
      { "bloque": "Sección Crítica (10-25 min)", "contenido": "...", "actividad": "..." },
      { "bloque": "Espacio de Preguntas y Debate (25-35 min)", "contenido": "...", "actividad": "..." },
      { "bloque": "Cierre y Desafío Práctico (35-40 min)", "contenido": "...", "actividad": "..." }
    ],
    "slides": [
      {
        "slideNum": 1,
        "titulo": "...",
        "guionDocente": "...",
        "puntosClave": ["...", "..."],
        "consejoPedagogico": "..."
      }
    ],
    "preguntasQA": [
      "Pregunta de debate directo para secundaria basada en sus intereses éticos o de programación."
    ]
  }
}

Por favor, no respondas nada que no sea el JSON puro. Evita añadir tics de marcado markdown raros externos al bloque JSON, solo el objeto JSON listo para ser parseado por un JSON.parse().
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumenAnalisis: {
              type: Type.OBJECT,
              properties: {
                kidsConceptKey: { type: Type.STRING },
                teensConceptKey: { type: Type.STRING },
                teachersDemands: { type: Type.STRING },
              },
              required: ["kidsConceptKey", "teensConceptKey", "teachersDemands"]
            },
            planKids: {
              type: Type.OBJECT,
              properties: {
                titulo: { type: Type.STRING },
                estructuraMinutos: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      bloque: { type: Type.STRING },
                      contenido: { type: Type.STRING },
                      actividad: { type: Type.STRING }
                    },
                    required: ["bloque", "contenido", "actividad"]
                  }
                },
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      slideNum: { type: Type.INTEGER },
                      titulo: { type: Type.STRING },
                      guionDocente: { type: Type.STRING },
                      puntosClave: { type: Type.ARRAY, items: { type: Type.STRING } },
                      consejoPedagogico: { type: Type.STRING }
                    },
                    required: ["slideNum", "titulo", "guionDocente", "puntosClave"]
                  }
                },
                preguntasQA: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["titulo", "estructuraMinutos", "slides", "preguntasQA"]
            },
            planTeens: {
              type: Type.OBJECT,
              properties: {
                titulo: { type: Type.STRING },
                estructuraMinutos: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      bloque: { type: Type.STRING },
                      contenido: { type: Type.STRING },
                      actividad: { type: Type.STRING }
                    },
                    required: ["bloque", "contenido", "actividad"]
                  }
                },
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      slideNum: { type: Type.INTEGER },
                      titulo: { type: Type.STRING },
                      guionDocente: { type: Type.STRING },
                      puntosClave: { type: Type.ARRAY, items: { type: Type.STRING } },
                      consejoPedagogico: { type: Type.STRING }
                    },
                    required: ["slideNum", "titulo", "guionDocente", "puntosClave"]
                  }
                },
                preguntasQA: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["titulo", "estructuraMinutos", "slides", "preguntasQA"]
            }
          },
          required: ["resumenAnalisis", "planKids", "planTeens"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini Plan Generation Error:", error);
    res.status(500).json({ error: "Error de procesamiento didáctico con Gemini: " + error.message });
  }
});


// Vite connection
// Use NODE_ENV=production OR existence of dist/ folder as production signal
// This prevents Vite from being loaded on platforms that don't set NODE_ENV
const isProduction = process.env.NODE_ENV === "production" || 
  (process.env.NODE_ENV === undefined && fs.existsSync(path.join(process.cwd(), "dist", "index.html")));

if (!isProduction) {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    
    // Fallback route to index.html for React SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "index.html"));
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development full-stack server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("Vite server error — falling back to production static mode:", err.message);
    // Fallback to static production serving if Vite fails to load
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Production full-stack server running on http://localhost:${PORT}`);
      });
    } else {
      console.error("No dist/ folder found. Run 'npm run build' first.");
      process.exit(1);
    }
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  
  if (!fs.existsSync(distPath)) {
    console.error("❌ ERROR: dist/ folder not found. Run 'npm run build' before 'npm start'.");
    process.exit(1);
  }

  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production full-stack server running on http://localhost:${PORT}`);
  });
}
