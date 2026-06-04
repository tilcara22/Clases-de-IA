import React, { useState } from "react";
import { Send, Sparkles, Wand2, Gamepad2, Palette, Brain, Trash2, Milestone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KidsPayload } from "../types";

interface KidsSurveyProps {
  onBack: () => void;
  onSubmit: (payload: KidsPayload) => Promise<boolean>;
}

export default function KidsSurvey({ onBack, onSubmit }: KidsSurveyProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("11");
  const [spokenToAI, setSpokenToAI] = useState("");
  const [aiForWhat, setAiForWhat] = useState<string[]>([]);
  const [curiosityMiedo, setCuriosityMiedo] = useState("");
  const [excitement, setExcitement] = useState("🤩");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const aiActivities = [
    { id: "dibujar", label: "Dibujar y crear imágenes mágicas 🎨", icon: Palette },
    { id: "juegos", label: "Crear o mejorar videojuegos 🎮", icon: Gamepad2 },
    { id: "tareas", label: "Hacer y organizar la tarea escolar 📚", icon: Wand2 },
    { id: "hablar", label: "Platicar con un robot o mascota virtual 🤖", icon: Sparkles },
    { id: "aprender", label: "Aprender materias difíciles juguetando 💡", icon: Brain }
  ];

  const emojis = ["🤩", "🚀", "🤔", "😐"];

  const handleCheckbox = (label: string) => {
    if (aiForWhat.includes(label)) {
      setAiForWhat(aiForWhat.filter(item => item !== label));
    } else {
      setAiForWhat([...aiForWhat, label]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spokenToAI) {
      setErrorMsg("Por favor responde si has hablado alguna vez con una Inteligencia Artificial.");
      return;
    }
    if (aiForWhat.length === 0) {
      setErrorMsg("Por favor elige al menos una cosa para la que te gustaría usar la Inteligencia Artificial.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    const payload: KidsPayload = {
      name: name.trim() || "Estudiante de Primaria",
      age,
      spokenToAI,
      aiForWhat,
      curiosityMiedo: curiosityMiedo.trim() || "No especificó preguntas",
      excitement
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) {
      setIsCompleted(true);
    } else {
      setErrorMsg("Hubo un problema al enviar la encuesta. Intenta de nuevo.");
    }
  };

  if (isCompleted) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[40px] p-8 border-4 border-indigo-200/60 shadow-2xl"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-black text-indigo-950 mb-3 tracking-tight">¡Muchas Gracias!</h2>
          <p className="text-slate-600 text-sm font-semibold mb-6 leading-relaxed">
            Hemos recibido tus respuestas sobre Inteligencia Artificial. Con lo que tú y tus compañeros nos contaron, armaremos una clase divertidísima y responderemos todas tus preguntas.
          </p>
          <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 mb-8">
            <p className="text-indigo-900 text-xs font-black font-mono">TU ENERGÍA DE CLASE: {excitement} 🚀</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider rounded-2xl transition shadow-lg hover:shadow-xl active:scale-95 cursor-pointer text-xs"
          >
            Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Upper Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-black text-xs mb-6 bg-pink-50 px-4 py-2 rounded-2xl border-2 border-pink-100 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Salir de la encuesta
      </button>

      {/* Title */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-[40px] p-8 text-white text-center shadow-xl mb-8 relative overflow-hidden border-b-4 border-indigo-850">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
          <Wand2 className="w-40 h-40" />
        </div>
        <span className="text-2xs font-black bg-white/20 border border-white/25 px-4 py-1.5 rounded-full inline-block mb-3 tracking-widest uppercase">
          🚀 Misión: ¡Explorar el Futuro! (10-12 Años)
        </span>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Tu Opinión de Inteligencia Artificial</h1>
        <p className="text-indigo-100 text-xs md:text-sm mt-2 max-w-md mx-auto font-medium">
          Ayúdanos a armar la clase perfecta para ti contestando estas preguntas fáciles en un minuto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Age Group Widget */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span>👋</span> ¿Cómo te llamas y cuántos años tienes?
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Nombre o Apodo (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Santi, Mili, Lucas..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 border-2 border-indigo-50 rounded-2xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-800 font-semibold text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Edad Actual</label>
              <div className="flex gap-2">
                {["10", "11", "12"].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAge(val)}
                    className={`flex-1 py-3 px-2 rounded-2xl font-black text-center text-sm border-2 transition-all cursor-pointer ${
                      age === val 
                        ? "border-pink-500 bg-pink-500 text-white shadow-md" 
                        : "border-indigo-50 bg-white text-indigo-905 hover:border-indigo-200"
                    }`}
                  >
                    {val} años
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Premise / Previous Knowledge */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span>💬</span> ¿Has hablado alguna vez con una IA, robot o asistente?
          </h3>
          <p className="text-slate-400 text-xs font-medium">Pistas: Alexa, Siri en el celu, ChatGPT en la tableta, comandos de voz en TikTok o YouTube, etc.</p>

          <div className="grid gap-3">
            {[
              "Sí, sé lo que es y ya jugué con alguna Inteligencia Artificial",
              "Sé qué es, pero nunca hablé directamente con una",
              "No estoy muy seguro de qué es",
              "Nunca he hablado con una ni sé qué es"
            ].map((option) => (
              <label
                key={option}
                className={`flex gap-3 items-center p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                  spokenToAI === option
                    ? "border-pink-400 bg-pink-50/40"
                    : "border-indigo-50 bg-white hover:border-indigo-200"
                }`}
              >
                <input
                  type="radio"
                  name="spokenToAI"
                  value={option}
                  checked={spokenToAI === option}
                  onChange={() => setSpokenToAI(option)}
                  className="accent-pink-600 w-4 h-4"
                />
                <span className="text-indigo-950 text-xs md:text-sm font-bold">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span>✨</span> ¿Para qué cosas te gustaría usar la Inteligencia Artificial?
          </h3>
          <p className="text-slate-400 text-xs font-medium">Puedes elegir todas las que quieras:</p>

          <div className="space-y-2.5">
            {aiActivities.map((activity) => {
              const Icon = activity.icon;
              const isChecked = aiForWhat.includes(activity.label);

              return (
                <div
                  key={activity.id}
                  onClick={() => handleCheckbox(activity.label)}
                  className={`flex gap-3 items-center p-4 rounded-3xl border-2 cursor-pointer transition-all select-none ${
                    isChecked 
                      ? "border-indigo-400 bg-indigo-50/40" 
                      : "border-indigo-50 hover:border-indigo-200 bg-white"
                  }`}
                >
                  <div className={`p-2 rounded-2xl ${isChecked ? "bg-indigo-600 text-white" : "bg-sky-50 text-indigo-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs md:text-sm font-black ${isChecked ? "text-indigo-950" : "text-indigo-900"}`}>
                    {activity.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Miedos/Deseos */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span>🕵️‍♂️</span> ¿Qué te da curiosidad o miedo sobre la Inteligencia Artificial?
          </h3>
          <p className="text-slate-400 text-xs font-medium">Escribe tu pregunta secreta o lo que más te preocupe sobre los robots inteligentes:</p>
          <textarea
            rows={3}
            placeholder="Ej. ¿Los robots van a ser más listos que nosotros? ¿Se pueden rebelar? ¿Cómo aprenden?"
            value={curiosityMiedo}
            onChange={(e) => setCuriosityMiedo(e.target.value)}
            className="w-full p-4 border-2 border-indigo-50 rounded-3xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-700 font-bold text-sm transition-all"
          />
        </div>

        {/* Excitement level */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5">
          <h3 className="section-title text-base font-black text-indigo-950 flex items-center gap-2">
            <span>🎈</span> ¿Cómo te sientes para la charla-taller de Inteligencia Artificial?
          </h3>
          <p className="text-slate-400 text-xs font-medium">Elige el emoji que mejor te represente:</p>

          <div className="flex justify-around bg-sky-50/50 p-4 rounded-3xl border border-indigo-100/50">
            {emojis.map((emoji) => {
              const titles = {
                "🤩": "Súper Entusiasmado",
                "🚀": "¡Listo para despegar!",
                "🤔": "Tengo dudas / Intriga",
                "😐": "Me da igual / Veremos"
              };
              const isSelected = excitement === emoji;

              return (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setExcitement(emoji)}
                  title={titles[emoji as keyof typeof titles]}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer ${
                    isSelected ? "bg-indigo-600 text-white scale-110 shadow-md" : "hover:bg-indigo-50 text-indigo-400"
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-[10px] font-bold uppercase">{titles[emoji as keyof typeof titles].split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold text-xs text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-600 via-pink-500 to-indigo-500 text-white font-black text-sm py-4.5 rounded-3xl shadow-xl hover:shadow-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
        >
          {isSubmitting ? (
            "Enviando respuestas mágicas..."
          ) : (
            <>
              <Send className="w-5 h-5" /> ¡Terminar Encuesta y Enviar! 🚀
            </>
          )}
        </button>
      </form>
    </div>
  );
}
