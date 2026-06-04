import React, { useState } from "react";
import { Send, BookOpen, Sparkles, School, AlertCircle, ArrowLeft, Files, Check } from "lucide-react";
import { motion } from "motion/react";
import { TeachersPayload } from "../types";

interface TeachersSurveyProps {
  onBack: () => void;
  onSubmit: (payload: TeachersPayload) => Promise<boolean>;
}

export default function TeachersSurvey({ onBack, onSubmit }: TeachersSurveyProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [q1Curriculum, setQ1Curriculum] = useState("");
  const [q2Ethics, setQ2Ethics] = useState("");
  const [q3Challenges, setQ3Challenges] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg("Por favor completa la asignatura o materia que dictas.");
      return;
    }
    if (!q1Curriculum.trim() || q1Curriculum.trim().length < 10) {
      setErrorMsg("Por favor responde la pregunta 1 sobre vinculación curricular (utiliza al menos 10 caracteres).");
      return;
    }
    if (!q2Ethics.trim() || q2Ethics.trim().length < 10) {
      setErrorMsg("Por favor responde la pregunta 2 sobre principios éticos a destacar (utiliza al menos 10 caracteres).");
      return;
    }
    if (!q3Challenges.trim() || q3Challenges.trim().length < 10) {
      setErrorMsg("Por favor responde la pregunta 3 sobre comportamientos o desafíos que observa en el aula.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    const payload: TeachersPayload = {
      name: name.trim() || "Profesor Anónimo",
      subject: subject.trim(),
      q1Curriculum: q1Curriculum.trim(),
      q2Ethics: q2Ethics.trim(),
      q3Challenges: q3Challenges.trim(),
      suggestions: suggestions.trim() || "Sin sugerencias adicionales"
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) {
      setIsCompleted(true);
    } else {
      setErrorMsg("Ocurrió un error en el servidor al guardar el sondeo docente. Por favor reinténtalo.");
    }
  };

  if (isCompleted) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[40px] p-8 border-4 border-indigo-200 shadow-2xl"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100">
            <Check className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-indigo-950 mb-3 tracking-tight">Relevamiento Completado</h2>
          <p className="text-slate-605 text-sm leading-relaxed mb-6 font-semibold">
            Estimado/a docente, su perspectiva e inquietud pedagógica fueron almacenadas en el búfer central de planificación. Con estas respuestas coordinaremos los temas de ética y de integración curricular en esta clase taller para que actúe en total consonancia con el programa institucional.
          </p>
          <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 text-left mb-6 text-2xs font-mono text-indigo-900">
            <p className="font-bold uppercase tracking-wider mb-1">Materia Registrada:</p>
            <p className="font-black text-xs text-indigo-950">{subject}</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase rounded-2xl transition shadow-lg cursor-pointer text-xs"
          >
            Volver al Menú
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Back CTA */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-black text-xs mb-6 bg-pink-50 px-4 py-2 rounded-2xl border-2 border-pink-100 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al portal
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-905 via-indigo-900 to-indigo-950 rounded-[40px] p-8 text-white shadow-2xl mb-8 relative border-b-4 border-slate-950">
        <div className="absolute top-4 right-4 text-emerald-500/10">
          <School className="w-28 h-28" />
        </div>
        <span className="text-[10px] font-black tracking-widest bg-white/20 text-white px-3 py-1 rounded-full inline-block mb-3 uppercase border border-white/20">
          🏫 Relevamiento Pedagógico: Sector Docentes
        </span>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Sinergia Curricular y Desafíos Pedagógicos</h1>
        <p className="text-indigo-100 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed font-semibold">
          Su retroalimentación es vital. Centralizamos sus respuestas para coordinar qué conceptos de IA, pautas académicas y aspectos éticos deben ser priorizados en la charla de sus alumnos para enriquecer su malla curricular.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity & Course Section */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-5 border-b-4 border-indigo-100">
          <h3 className="section-title text-base font-black text-indigo-955 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 animate-pulse" /> Información Académica
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Nombre Completo (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Dra. Laura González..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 text-sm border-2 border-indigo-50 rounded-2xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-800 font-bold transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Materia o Asignatura que Dicta (Obligatorio)</label>
              <input
                type="text"
                required
                placeholder="Ej. Lengua y Literatura, Física, Plástica..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full py-3 px-4 text-sm border-2 border-indigo-50 rounded-2xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-800 font-bold transition-all"
              />
            </div>
          </div>
        </div>

        {/* Question 1: Curriculum */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-4">
          <div className="flex gap-2.5 items-start">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
              1
            </span>
            <div>
              <h4 className="text-sm md:text-base font-black text-indigo-955 leading-snug">
                ¿De qué forma cree que la IA podría complementar o enriquecer los contenidos curriculares de su asignatura?
              </h4>
              <p className="text-slate-400 text-xs font-semibold mt-1">Sugerencia: Piense en simulaciones, automatización, co-diseño de consignas o tutores interactivos.</p>
            </div>
          </div>
          <textarea
            rows={3}
            required
            placeholder="Sugerencias metodológicas..."
            value={q1Curriculum}
            onChange={(e) => setQ1Curriculum(e.target.value)}
            className="w-full text-sm p-4 border-2 border-indigo-50 rounded-3xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-705 font-bold transition-all"
          />
        </div>

        {/* Question 2: Ethics */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-4">
          <div className="flex gap-2.5 items-start">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
              2
            </span>
            <div>
              <h4 className="text-sm md:text-base font-black text-indigo-955 leading-snug">
                ¿Qué temáticas éticas, de uso adecuado o ciudadanía digital le gustaría que reforcemos con los alumnos en esta charla-taller?
              </h4>
              <p className="text-slate-400 text-xs font-semibold mt-1">Sugerencia: Desinformación, plagio, sesgo de datos, huella digital o propiedad intelectual del material sintético.</p>
            </div>
          </div>
          <textarea
            rows={3}
            required
            placeholder="Especifique principios a priorizar..."
            value={q2Ethics}
            onChange={(e) => setQ2Ethics(e.target.value)}
            className="w-full text-sm p-4 border-2 border-indigo-50 rounded-3xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-705 font-bold transition-all"
          />
        </div>

        {/* Question 3: Challenges */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-4">
          <div className="flex gap-2.5 items-start">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
              3
            </span>
            <div>
              <h4 className="text-sm md:text-base font-black text-indigo-955 leading-snug">
                ¿Cuáles son los mayores desafíos académicos o comportamientos que observa hoy en el aula con respecto al uso de la IA por parte de los alumnos?
              </h4>
              <p className="text-slate-400 text-xs font-semibold mt-1">Sugerencia: Entrega de resúmenes de IA sin lectura, abandono de práctica crítica analítica, pasividad intelectual, etc.</p>
            </div>
          </div>
          <textarea
            rows={3}
            required
            placeholder="Especifique comportamientos de aula..."
            value={q3Challenges}
            onChange={(e) => setQ3Challenges(e.target.value)}
            className="w-full text-sm p-4 border-2 border-indigo-50 rounded-3xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-705 font-bold transition-all"
          />
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-4">
          <h4 className="text-sm md:text-base font-black text-indigo-955 flex items-center gap-1.5 leading-snug">
            <AlertCircle className="w-4 h-4 text-pink-500 animate-bounce" /> Otras sugerencias e ideas generales para las clases-taller
          </h4>
          <textarea
            rows={2}
            placeholder="Ej: Proponer dinámicas de identificación de de fake news, ideas lúdicas de rol..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full text-sm p-4 border-2 border-indigo-50 rounded-3xl focus:outline-none focus:border-indigo-400 focus:bg-indigo-50/20 text-slate-705 font-bold transition-all"
          />
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold text-xs text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-4.5 rounded-3xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-widest border-b-4 border-indigo-900"
        >
          {isSubmitting ? (
            "Guardando en el búfer central institucional..."
          ) : (
            <>
              <Send className="w-4 h-4 animate-bounce" /> Enviar Directrices Docentes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
