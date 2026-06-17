import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function LiveInteraction({ onBack }: { onBack?: () => void }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/live/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Anónimo",
          role: "Participante",
          answer: answer.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar interacción.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-xs font-black text-indigo-650 hover:text-indigo-800 uppercase tracking-wider transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </button>
      )}
      <div className="bg-white rounded-[32px] p-6 border-2 border-indigo-100 shadow-xl shadow-indigo-150/20 w-full text-left">
        {/* Visual Header */}
        <div className="flex items-center justify-between border-b border-indigo-50 pb-4 mb-5 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-150 rounded-xl flex items-center justify-center text-indigo-750">
              <MessageSquare className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest font-black text-indigo-500 block">RESPUESTA AL INSTANTE</span>
              <h3 className="text-sm font-black text-indigo-950 uppercase">Interacción en Vivo</h3>
            </div>
          </div>
          <div className="px-3 py-1 bg-pink-100 rounded-full border border-pink-200 text-[10px] font-black text-pink-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
            AULA
          </div>
        </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-50 rounded-2xl p-6 border border-emerald-250 text-center space-y-4"
          >
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-emerald-900 uppercase">¡Respuesta Enviada!</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tu respuesta <strong>"{answer}"</strong> fue enviada con éxito en tiempo real. Presta atención a la pantalla o proyector gigante de la clase.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setAnswer("");
                }}
                className="text-2xs font-extrabold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 border border-indigo-200 px-5 py-2.5 rounded-xl transition cursor-pointer uppercase tracking-widest"
              >
                Enviar otra respuesta al profesor
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Guide to listen to the oral question */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Escucha la pregunta o consigna oral que el profesor dirá en el aula, escribe tu respuesta a continuación y envíala de inmediato.
              </p>
            </div>

            {/* Answer body area */}
            <div>
              <label className="block text-indigo-900 text-2xs font-black mb-1.5 uppercase tracking-wider">
                Tu Respuesta:
              </label>
              <textarea
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                rows={4}
                maxLength={150}
                className="w-full text-sm font-semibold py-3.5 px-4 rounded-2xl border-2 border-indigo-50 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-300 focus:ring-3 focus:ring-indigo-100 transition-all leading-normal resize-none placeholder:text-slate-405"
              />
              <div className="flex justify-between items-center text-3xs text-slate-400 mt-1.5">
                <span>⚠️ Máximo 150 caracteres</span>
                <span>{answer.length}/150 caracteres</span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-rose-600 text-[11px] font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading || !answer.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Enviar respuesta al profesor
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Synchronized status footer */}
      <div className="mt-4 border-t border-slate-150/60 pt-3 flex justify-between items-center text-3xs text-slate-450 font-bold uppercase">
        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          Aula interactiva activa
        </span>
        <span className="text-slate-400 font-mono">100% Anónimo</span>
      </div>
  </div>
</div>
  );
}
