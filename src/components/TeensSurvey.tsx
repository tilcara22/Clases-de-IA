import React, { useState } from "react";
import { Send, Cpu, GraduationCap, Code, Compass, ArrowLeft, Terminal, Check } from "lucide-react";
import { motion } from "motion/react";
import { TeensPayload } from "../types";

interface TeensSurveyProps {
  onBack: () => void;
  onSubmit: (payload: TeensPayload) => Promise<boolean>;
}

export default function TeensSurvey({ onBack, onSubmit }: TeensSurveyProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("15");
  const [usageFreq, setUsageFreq] = useState("");
  const [aiInterests, setAiInterests] = useState<string[]>([]);
  const [criticalQuestion, setCriticalQuestion] = useState("");
  const [aiPerspective, setAiPerspective] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const interestTopics = [
    { id: "programacion", label: "Programación y código" },
    { id: "diseno", label: "Creación de imágenes y diseño" },
    { id: "multimedia", label: "Creación de audios y videos" },
    { id: "desafio", label: "Cuestiones éticas y deepfakes" },
    { id: "empleo", label: "Futuro del trabajo" },
    { id: "productividad", label: "Estudio y productividad" }
  ];

  const handleInterestToggle = (label: string) => {
    if (aiInterests.includes(label)) {
      setAiInterests(aiInterests.filter(i => i !== label));
    } else {
      setAiInterests([...aiInterests, label]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageFreq) {
      setErrorMsg("Por favor indica con qué frecuencia utilizas herramientas de Inteligencia Artificial.");
      return;
    }
    if (aiInterests.length === 0) {
      setErrorMsg("Elige al menos un tema de interés para el taller.");
      return;
    }
    if (!aiPerspective) {
      setErrorMsg("Cuéntanos qué perspectiva o sensación te produce el avance de la IA.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    const payload: TeensPayload = {
      name: name.trim() || "Estudiante de Secundaria",
      age,
      usageFreq,
      aiInterests,
      criticalQuestion: criticalQuestion.trim() || "No planteó preguntas críticas",
      aiPerspective
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) {
      setIsCompleted(true);
    } else {
      setErrorMsg("Ocurrió un error al enviar el sondeo. Por favor reinténtalo.");
    }
  };

  if (isCompleted) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-indigo-950 rounded-[40px] p-8 border-4 border-indigo-800 shadow-2xl text-white"
        >
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
            <Terminal className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-3">Feedback Centralizado</h2>
          <p className="text-slate-300 text-sm font-semibold leading-relaxed mb-6">
            Tus respuestas relativas al ecosistema de la Inteligencia Artificial fueron indexadas con éxito. Usaremos estos datos para adaptar la charla-taller a temas técnicos y éticos reales que te interesen, evitando repeticiones de bases teóricas.
          </p>
          <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono text-indigo-300 mb-6 border border-indigo-900/60 text-left space-y-1">
            <span>&gt; system_status: response_logged_successfully()</span><br/>
            <span>&gt; viewpoint_registered: "{aiPerspective}"</span>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:brightness-110 text-white font-black rounded-xl uppercase tracking-wider text-xs transition shadow-md active:scale-95 cursor-pointer"
          >
            Volver
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Off-canvas selector */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-750 font-black text-xs mb-6 bg-pink-50 px-4 py-2 rounded-2xl border-2 border-pink-100 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Salir del sondeo
      </button>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 rounded-[40px] p-8 text-white border-2 border-indigo-800 shadow-2xl mb-8 relative border-b-4 border-slate-950">
        <div className="absolute top-4 right-4 text-indigo-500/20">
          <Cpu className="w-24 h-24" />
        </div>
        <span className="text-[10px] font-mono tracking-widest bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-3 py-1 rounded-full inline-block mb-3 uppercase font-black">
          ⚡ Sandbox de Relevamiento: Secundaria (13-17 Años)
        </span>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-sans">
          Sondeo de Clases Taller sobre IA
        </h1>
        <p className="text-slate-400 text-xs mt-2 max-w-md font-semibold leading-relaxed">
          Configura tus preferencias temáticas. Queremos evitar charlas repetitivas y enfocar el debate en código, ética, deepfakes y futuro laboral real.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic metadata */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span className="text-pink-550">01 /</span> Identificación y Edad
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Nombre o Pseudónimo (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Mateo99, Sofía..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 text-sm border-2 border-indigo-50 rounded-2xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-800 font-bold transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Edad Actual</label>
              <div className="flex gap-1.5">
                {["13", "14", "15", "16", "17"].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAge(val)}
                    className={`flex-1 py-3 text-center text-xs font-black rounded-xl border-2 transition-all cursor-pointer ${
                      age === val
                        ? "border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-100"
                        : "border-indigo-50 bg-white text-slate-700 hover:border-indigo-200"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Frequency */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span className="text-pink-550">02 /</span> ¿Cuán seguido usas herramientas de IA generativa?
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">Ej: ChatGPT: Gemini, Midjourney, Github Copilot, creadores de stickers o remixes en redes.</p>

          <div className="grid gap-2.5">
            {[
              "Diariamente para tareas de la escuela o programar",
              "Diariamente para divertirme o cuestiones personales",
              "Ocasionalmente cuando lo necesito para algo puntual",
              "Casi nunca o nunca he usado una de forma activa"
            ].map((option) => (
              <label
                key={option}
                className={`flex gap-3 items-center p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                  usageFreq === option
                    ? "border-indigo-400 bg-indigo-50/30"
                    : "border-indigo-50 hover:border-indigo-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="usageFreq"
                  value={option}
                  checked={usageFreq === option}
                  onChange={() => setUsageFreq(option)}
                  className="accent-indigo-600 w-4 h-4"
                />
                <span className="text-indigo-950 text-xs md:text-sm font-bold">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests - Multiselect */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span className="text-pink-550">03 /</span> ¿Qué temáticas te gustaría profundizar o debatir?
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">Puedes seleccionar múltiples temas clave:</p>

          <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
            {interestTopics.map((topic) => {
              const isSelected = aiInterests.includes(topic.label);
              return (
                <div
                  key={topic.id}
                  onClick={() => handleInterestToggle(topic.label)}
                  className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-pink-500 bg-pink-50/35"
                      : "border-indigo-50 hover:border-indigo-200 bg-white"
                  }`}
                >
                  <span className={`text-xs md:text-sm font-black ${isSelected ? "text-indigo-950" : "text-slate-700"}`}>
                    {topic.label}
                  </span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all ${
                    isSelected ? "bg-pink-555 border-pink-500 text-white" : "border-indigo-100 bg-white"
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical society question */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span className="text-pink-550">04 /</span> Tu Pregunta Crítica
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">La pregunta más extraña, crítica o existencial que tengas sobre la IA para tirar en clase:</p>
          <textarea
            rows={3}
            placeholder="Ej: ¿Qué pasa con los derechos de autor de las imágenes de entrenamiento? ¿La IA puede tener conciencia sintética?"
            value={criticalQuestion}
            onChange={(e) => setCriticalQuestion(e.target.value)}
            className="w-full text-sm p-4 border-2 border-indigo-50 rounded-3xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-705 font-bold transition-all"
          />
        </div>

        {/* Vision / Perspective */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span className="text-pink-550">05 /</span> Resumen en un Concepto
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5 font-sans">¿Cuál de estos conceptos define mejor tu postura actual ante la IA?</p>

          <div className="grid md:grid-cols-2 gap-3 pt-1">
            {[
              { label: "Oportunidad positiva", desc: "Un acelerador para la ciencia, el arte y el aprendizaje humano." },
              { label: "Una herramienta tecnológica más", desc: "Como lo fue el buscador o la calculadora, sin sobredimensión." },
              { label: "Amenaza para la humanidad", desc: "Páginas falsas, pérdida masiva de valor y automatización sin control." },
              { label: "Una moda publicitaria sobreestimada", desc: "Mucha exageración corporativa, poco impacto real disruptivo hoy." }
            ].map((p) => {
              const isSelected = aiPerspective === p.label;
              return (
                <div
                  key={p.label}
                  onClick={() => setAiPerspective(p.label)}
                  className={`p-4 rounded-3xl border-2 cursor-pointer text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/30 shadow-md shadow-indigo-50"
                      : "border-indigo-50 hover:border-indigo-200 bg-white"
                  }`}
                >
                  <p className={`text-xs font-black ${isSelected ? "text-indigo-950" : "text-slate-800"}`}>{p.label}</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-semibold leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold text-xs text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-black text-sm py-4.5 rounded-3xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-widest"
        >
          {isSubmitting ? (
            "Transmitiendo datos curriculares..."
          ) : (
            <>
              <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" /> Enviar Configuración de Sondeo
            </>
          )}
        </button>
      </form>
    </div>
  );
}
