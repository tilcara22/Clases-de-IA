import React, { useState, useEffect } from "react";
import { 
  Users, Sparkles, GraduationCap, School, Brain, Calendar, Trash2, 
  RotateCcw, ArrowLeft, Loader2, BookOpen, AlertCircle, ArrowRight,
  MonitorPlay, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, FileText,
  Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SurveyResponse, GeminiPlanResponse, PlanClase, SlideDetalle } from "../types";

interface AdminDashboardProps {
  pin: string;
  appUrl: string;
  onBack: () => void;
}

export default function AdminDashboard({ pin, appUrl, onBack }: AdminDashboardProps) {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"metrics" | "responses" | "aiPlan">("metrics");
  const [activeSegment, setActiveSegment] = useState<"all" | "kids" | "teens" | "teachers">("all");
  
  // Link copiado metadata state
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const getFullLink = (role: string, pinCode: string) => {
    const baseUrl = appUrl || window.location.origin;
    return `${baseUrl}/?role=${role}&pin=${pinCode}`;
  };

  const rolesConfig = {
    kids: {
      title: "Primaria (10-12 Años)",
      expectedPin: "KIDS10",
    },
    teens: {
      title: "Secundaria (13-17 Años)",
      expectedPin: "TEENS13",
    },
    teachers: {
      title: "Docentes / Profesores",
      expectedPin: "DOCENTER7",
    },
    admin: {
      title: "Organizador / Administrador",
      expectedPin: "ORGANIZADOR99",
    }
  };
  
  // Gemini State variables
  const [geminiPlan, setGeminiPlan] = useState<GeminiPlanResponse | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingError, setGeneratingError] = useState("");
  
  // Slide deck state
  const [selectedPlanTab, setSelectedPlanTab] = useState<"kids" | "teens">("kids");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fetch responses from server
  const fetchResponses = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/responses?pin=${pin}`);
      if (!res.ok) throw new Error("Acceso denegado. Revisa tus credenciales.");
      const data = await res.json();
      setResponses(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al recuperar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [pin]);

  // Clean or Reset Database
  const handleDatabaseAction = async (action: "clear" | "reset") => {
    const confirmMsg = action === "clear" 
      ? "¿Estás seguro de eliminar permanentemente TODAS las encuestas?" 
      : "¿Estás seguro de reestablecer la base de datos con respuestas de ejemplo reales?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/responses?pin=${pin}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (!res.ok) throw new Error("Fallo de autenticación de base de datos.");
      const data = await res.json();
      setResponses(data.data);
      alert(data.message || "Operación realizada con éxito.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Generate Gemini Class Agenda & slide script
  const generateTeachingPlan = async () => {
    setGeneratingPlan(true);
    setGeneratingError("");
    try {
      const res = await fetch("/api/gemini/plan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-pin": pin
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Fallo interactivo con Gemini.");
      }
      const data = await res.json();
      setGeminiPlan(data);
      setCurrentSlideIndex(0);
      setActiveTab("aiPlan");
    } catch (err: any) {
      setGeneratingError(err.message || "Error al generar.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Statistics calculation helpers
  const countKids = responses.filter(r => r.type === "kids").length;
  const countTeens = responses.filter(r => r.type === "teens").length;
  const countTeachers = responses.filter(r => r.type === "teachers").length;
  const totalSubmissions = responses.length;

  const getSpokenAiRatio = () => {
    const kidsList = responses.filter(r => r.type === "kids");
    if (kidsList.length === 0) return 0;
    const affirmative = kidsList.filter(k => k.spokenToAI && k.spokenToAI.includes("Sí")).length;
    return Math.round((affirmative / kidsList.length) * 100);
  };

  const getTeenToolFreq = () => {
    const teensList = responses.filter(r => r.type === "teens");
    if (teensList.length === 0) return { high: 0, occasional: 0 };
    const high = teensList.filter(t => t.usageFreq && t.usageFreq.includes("Diariamente")).length;
    return {
      high: Math.round((high / teensList.length) * 100),
      occasional: 100 - Math.round((high / teensList.length) * 100)
    };
  };

  // Topic interest frequencies for summary charts
  const getKidsInterestStats = () => {
    const kidsList = responses.filter(r => r.type === "kids");
    const counts: { [key: string]: number } = {};
    kidsList.forEach(k => {
      (k.aiForWhat || []).forEach(interest => {
        counts[interest] = (counts[interest] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]);
  };

  const getTeensInterestStats = () => {
    const teensList = responses.filter(r => r.type === "teens");
    const counts: { [key: string]: number } = {};
    teensList.forEach(t => {
      (t.aiInterests || []).forEach(interest => {
        counts[interest] = (counts[interest] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]);
  };

  const filterResponses = responses.filter(r => {
    if (activeSegment === "all") return true;
    return r.type === activeSegment;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Upper header navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-extrabold text-xs mb-3 bg-pink-50 px-4.5 py-2.5 rounded-2xl border-2 border-pink-100 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Portal de Roles
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-indigo-950 leading-tight uppercase font-sans tracking-tight">
              Panel Organizador Centralizado
            </h1>
            <span className="text-2xs font-mono font-black bg-pink-550 border border-pink-600 shadow-md shadow-pink-100 text-white px-3 py-1 rounded-full uppercase">
              Admin: OK
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">
            Revisión diagnóstica de las encuestas e integración académica con Gemini AI.
          </p>
        </div>

        {/* Database Quick Actions */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleDatabaseAction("reset")}
            title="Reestablece datos de ejemplo realistas para pruebas rápidas"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 border-2 border-indigo-50 font-black text-xs rounded-2xl transition shadow-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-pink-500 animate-spin" /> Reestablecer Ejemplo
          </button>
          <button
            onClick={() => handleDatabaseAction("clear")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-pink-50 text-pink-700 hover:bg-pink-100 border-2 border-pink-100 font-black text-xs rounded-2xl transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Vaciar Todo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-indigo-950 font-mono font-black text-sm uppercase tracking-wider">Sincronizando encuestas escolares...</p>
        </div>
      ) : errorMsg ? (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="p-4 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-3xl font-bold text-sm mb-4">
            ⚠️ {errorMsg}
          </div>
          <button onClick={fetchResponses} className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs transition duration-150 uppercase tracking-wider">
            Reintentar Conexión
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Dashboard Tabs */}
          <div className="border-b-2 border-indigo-50 flex gap-2 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveTab("metrics")}
              className={`pb-4 px-2 text-xs md:text-sm font-black transition-all border-b-4 relative shrink-0 cursor-pointer uppercase tracking-wider ${
                activeTab === "metrics" ? "text-indigo-650 border-indigo-600" : "text-slate-400 border-transparent hover:text-slate-705"
              }`}
            >
              📊 Indicadores y Métricas
            </button>
            <button
              onClick={() => setActiveTab("responses")}
              className={`pb-4 px-2 text-xs md:text-sm font-black transition-all border-b-4 relative shrink-0 cursor-pointer uppercase tracking-wider ${
                activeTab === "responses" ? "text-indigo-650 border-indigo-600" : "text-slate-400 border-transparent hover:text-slate-705"
              }`}
            >
              📂 Bandeja de Encuestas ({totalSubmissions})
            </button>
            <button
              onClick={() => {
                if (geminiPlan) setActiveTab("aiPlan");
                else {
                  generateTeachingPlan();
                }
              }}
              className={`pb-4 px-2 text-xs md:text-sm font-black transition-all border-b-4 relative shrink-0 cursor-pointer text-pink-600 flex items-center gap-1.5 uppercase tracking-wider ${
                activeTab === "aiPlan" ? "border-pink-500 font-black text-pink-600" : "border-transparent hover:text-pink-805"
              }`}
            >
              <span>✨</span> {geminiPlan ? "Guión de Diapositivas (Listo)" : "Pensar Plan con Gemini"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: METRICS */}
            {activeTab === "metrics" && (
              <motion.div
                key="tab-metrics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Big Info Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  <div className="bg-white rounded-[40px] p-6 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/40 border-b-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RECOLECTADO TOTAL</span>
                      <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100"><Users className="w-4 h-4" /></div>
                    </div>
                    <span className="text-4xl font-black text-indigo-950 text-left block">{totalSubmissions}</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1.5 block">Aportes consolidados</span>
                  </div>

                  <div className="bg-white rounded-[40px] p-6 border-2 border-orange-50 shadow-2xl shadow-orange-100/30 border-b-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-orange-555 uppercase tracking-widest">PRIMARIA (10-12)</span>
                      <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100"><Sparkles className="w-4 h-4" /></div>
                    </div>
                    <span className="text-4xl font-black text-orange-600 text-left block">{countKids}</span>
                    <span className="text-[10px] text-orange-600/80 font-bold mt-1.5 block">Tienen Siri/Alexa o dudas</span>
                  </div>

                  <div className="bg-white rounded-[40px] p-6 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/30 border-b-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">SECUNDARIA (13-17)</span>
                      <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100"><GraduationCap className="w-4 h-4" /></div>
                    </div>
                    <span className="text-4xl font-black text-indigo-600 text-left block">{countTeens}</span>
                    <span className="text-[10px] text-indigo-555 mt-1.5 block font-bold">Uso diario o técnico</span>
                  </div>

                  <div className="bg-white rounded-[40px] p-6 border-2 border-emerald-50 shadow-2xl shadow-emerald-100/30 border-b-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">CÁTEDRA (DOCENTES)</span>
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100"><School className="w-4 h-4" /></div>
                    </div>
                    <span className="text-4xl font-black text-emerald-600 text-left block">{countTeachers}</span>
                    <span className="text-[10px] text-emerald-555 mt-1.5 block font-bold">Demandas curriculares</span>
                  </div>
                </div>

                {/* Gemini Class Planner Banner */}
                <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 border-indigo-800 shadow-2xl border-b-4 border-slate-950">
                  <div className="absolute top-0 right-0 transform translate-x-20 -translate-y-10 text-white/5 pointer-events-none">
                    <Brain className="w-80 h-80" />
                  </div>
                  
                  <div className="space-y-2.5 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-indigo-300 text-[10px] font-black tracking-widest uppercase">
                      ✨ MOTOR INTUITIVO INTELIGENTE
                    </div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Planificador de Clases Taller con Gemini AI</h2>
                    <p className="text-slate-350 text-xs leading-relaxed font-semibold">
                      Gemini de forma server-side procesará el 150% de las respuestas diagnósticas cargadas. Generará un guón didáctico paso a paso para tus 40 minutos de clase primaria y secundaria, contemplando las directrices académicas planteadas por los docentes.
                    </p>
                  </div>

                  <div className="shrink-0 relative z-10">
                    <button
                      onClick={generateTeachingPlan}
                      disabled={generatingPlan || totalSubmissions === 0}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-indigo-500 to-pink-500 hover:brightness-110 text-white font-black uppercase text-xs tracking-wider px-6 py-4 rounded-[20px] shadow-lg transition active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {generatingPlan ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Confeccionando Plan...
                        </>
                      ) : (
                        <>
                          Crear Planificación de Diapositivas <ArrowRight className="w-4 h-4 font-bold" />
                        </>
                      )}
                    </button>
                    {generatingError && (
                      <p className="text-rose-400 text-xxs mt-2 text-center max-w-[240px] italic">
                        {generatingError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Statistics Visualization using reactive clean vectors */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Kids analytics chart */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xxs space-y-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Intereses: Alumnos de Primaria
                      </h3>
                      <p className="text-slate-400 text-2xs">Temáticas solicitadas por niños de 10-12 años para la clase-taller.</p>
                    </div>

                    {countKids === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs italic">
                        Cargando estadísticas de primaria... prueba agregar encuestas de niños.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getKidsInterestStats().map(([label, score], idx) => {
                          const percentage = Math.round((Number(score) / countKids) * 100);
                          return (
                            <div key={label} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700">{label}</span>
                                <span className="text-orange-600 font-mono font-bold">{percentage}% ({score})</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                                  className="h-full bg-orange-500 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                      <p className="text-xs text-orange-950 leading-relaxed">
                        💡 <strong>Inmersión IA Primaria:</strong> El <span className="font-extrabold font-mono text-xs">{getSpokenAiRatio()}%</span> de los niños declaran tener nociones o haber interactuado antes con respuestas de IA (Siri, Alexa, TikTok o ChatGPT).
                      </p>
                    </div>
                  </div>

                  {/* Teens analytics chart */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xxs space-y-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Intereses: Jóvenes de Secundaria
                      </h3>
                      <p className="text-slate-400 text-2xs">Temáticas prioritarias para adolescentes de 13-17 años.</p>
                    </div>

                    {countTeens === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs italic">
                        Cargando estadísticas de secundaria... prueba agregar encuestas de jóvenes.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getTeensInterestStats().map(([label, score], idx) => {
                          const percentage = Math.round((Number(score) / countTeens) * 100);
                          return (
                            <div key={label} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700">{label}</span>
                                <span className="text-indigo-600 font-mono font-bold">{percentage}% ({score})</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                                  className="h-full bg-indigo-600 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                      <p className="text-xs text-indigo-950 leading-relaxed">
                        💼 <strong>Inmersión IA Secundaria:</strong> El <span className="font-extrabold font-mono text-xs">{getTeenToolFreq().high}%</span> de los jóvenes usan activamente herramientas sintéticas a diario para tareas académicas o diversión.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Copy-paste links setup for admin so they can generate and share QRs */}
                <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-100 shadow-2xl shadow-indigo-100/40 text-left">
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                      📂 Generador de Enlaces Directos QR / WhatsApp
                    </h3>
                    <p className="text-indigo-500/95 text-xs mt-1.5 leading-relaxed font-semibold">
                      Como administrador/organizador, puedes copiar estos enlaces listos para enviar a tus alumnos y profesores. El PIN se encuentra inyectado de forma segura en el propio enlace para que puedan entrar directamente desde su celular o Tablet sin recordar la contraseña de acceso.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(Object.keys(rolesConfig) as Array<keyof typeof rolesConfig>).map((roleKey) => {
                      const conf = rolesConfig[roleKey];
                      const link = getFullLink(roleKey, conf.expectedPin);
                      const isCopied = copiedLink === roleKey;

                      return (
                        <div key={roleKey} className="bg-sky-50 rounded-3xl p-5 border-2 border-indigo-55/60 hover:border-indigo-200 transition-colors shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-2xs font-extrabold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-md uppercase">
                                {roleKey === "kids" ? "Primaria" : roleKey === "teens" ? "Secundaria" : roleKey === "teachers" ? "Director" : "Admin"}
                              </span>
                              <span className="text-xs font-black text-pink-600 font-mono">
                                {conf.expectedPin}
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-indigo-950 mb-1">{conf.title}</h4>
                            <p className="text-slate-400 text-3xs truncate mb-4 font-mono">{link}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(link, roleKey)}
                            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isCopied 
                                ? "bg-emerald-500 text-white shadow-md" 
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200/50"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> ¡Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copiar Enlace
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: RESPONSES */}
            {activeTab === "responses" && (
              <motion.div
                key="tab-responses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Segment Filter pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "Todas las encuestas", count: totalSubmissions },
                    { id: "kids", label: "Primaria (10-12)", count: countKids },
                    { id: "teens", label: "Secundaria (13-17)", count: countTeens },
                    { id: "teachers", label: "Docentes / Profesores", count: countTeachers }
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => setActiveSegment(pill.id as any)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                        activeSegment === pill.id 
                          ? "bg-slate-900 text-white" 
                          : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {pill.label} ({pill.count})
                    </button>
                  ))}
                </div>

                {/* List Container */}
                {filterResponses.length === 0 ? (
                  <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 text-center py-20 rounded-3xl">
                    <p className="text-slate-400 text-sm font-medium">No se detectaron encuestas para este segmento.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filterResponses.map((res: SurveyResponse) => (
                      <div 
                        key={res.id} 
                        className={`bg-white rounded-3xl p-5 border shadow-xxs transition duration-200 hover:shadow-xs border-l-4 ${
                          res.type === "kids" 
                            ? "border-l-orange-400 border-slate-200" 
                            : res.type === "teens" 
                            ? "border-l-indigo-500 border-slate-200" 
                            : "border-l-emerald-500 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              res.type === "kids" 
                                ? "bg-orange-50 text-orange-600" 
                                : res.type === "teens" 
                                ? "bg-indigo-50 text-indigo-600" 
                                : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {res.type === "kids" ? "Primaria" : res.type === "teens" ? "Secundaria" : "Docente"}
                            </span>
                            <span className="text-slate-400 text-3xs font-mono ml-2">
                              {new Date(res.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Survey Answers detail mapping */}
                        {res.type === "kids" && (
                          <div className="space-y-2 text-slate-700 text-xs">
                            <p>🧒 <strong>Nombre:</strong> {res.name || "Santi"} (Edad: {res.age || "11"} años)</p>
                            <p>💬 <strong>¿Conversó con IA?:</strong> {res.spokenToAI}</p>
                            <p>⚡ <strong>Quisiera usarla para:</strong> {res.aiForWhat?.join(", ")}</p>
                            <p className="p-2.5 bg-orange-50/50 rounded-xl text-orange-950 font-medium">
                              🕵️‍♂️ <strong>Curiosidad/Miedo:</strong> "{res.curiosityMiedo}"
                            </p>
                            <p>🤩 <strong>Entusiasmo:</strong> {res.excitement}</p>
                          </div>
                        )}

                        {res.type === "teens" && (
                          <div className="space-y-2 text-slate-700 text-xs">
                            <p>🧑 <strong>Pseudónimo:</strong> {res.name || "Mateo99"} (Edad: {res.age || "15"} años)</p>
                            <p>⚡ <strong>Frecuencia de Uso:</strong> {res.usageFreq}</p>
                            <p>🎯 <strong>Intereses seleccionados:</strong> {res.aiInterests?.join(", ")}</p>
                            <p className="p-2.5 bg-indigo-50/30 rounded-xl text-indigo-950 font-medium">
                              🔐 <strong>Pregunta Crítica:</strong> "{res.criticalQuestion}"
                            </p>
                            <p>🛠️ <strong>Perspectiva:</strong> {res.aiPerspective}</p>
                          </div>
                        )}

                        {res.type === "teachers" && (
                          <div className="space-y-2.5 text-slate-700 text-xs text-left">
                            <p>👩‍🏫 <strong>Profesor/a:</strong> {res.name} (Materia: {res.subject})</p>
                            
                            <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <p className="font-bold text-slate-900 text-3xs uppercase text-slate-400">1. Vinculación Curricular:</p>
                              <p className="text-slate-600 font-medium font-serif italic">"{res.q1Curriculum}"</p>
                            </div>

                            <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <p className="font-bold text-slate-900 text-3xs uppercase text-slate-400">2. Ética / Uso Adecuado:</p>
                              <p className="text-slate-600 font-medium font-serif italic">"{res.q2Ethics}"</p>
                            </div>

                            <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <p className="font-bold text-slate-900 text-3xs uppercase text-slate-400">3. Desafíos comportamentales aula:</p>
                              <p className="text-slate-600 font-medium font-serif italic">"{res.q3Challenges}"</p>
                            </div>

                            {res.suggestions && (
                              <p className="text-[11px] text-slate-500">💡 <strong>Extras:</strong> {res.suggestions}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: GEMINI AI PLANS */}
            {activeTab === "aiPlan" && geminiPlan && (
              <motion.div
                key="tab-ai-plan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Synthesis Diagnostic Banner */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 grid md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-2xl shadow-xxs">
                    <h4 className="font-black text-orange-600 mb-1 flex items-center gap-1">🧒 Foco Primaria (10-12)</h4>
                    <p className="text-slate-600 leading-relaxed font-serif italic">"{geminiPlan.resumenAnalisis.kidsConceptKey}"</p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow-xxs">
                    <h4 className="font-black text-indigo-600 mb-1 flex items-center gap-1">🧑 Foco Secundaria (13-17)</h4>
                    <p className="text-slate-600 leading-relaxed font-serif italic md:line-clamp-4">"{geminiPlan.resumenAnalisis.teensConceptKey}"</p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow-xxs">
                    <h4 className="font-black text-emerald-600 mb-1 flex items-center gap-1">👩‍🏫 Reclamo Docente</h4>
                    <p className="text-slate-600 leading-relaxed font-serif italic">"{geminiPlan.resumenAnalisis.teachersDemands}"</p>
                  </div>
                </div>

                {/* Sub-Tabs: Select Plan View */}
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl max-w-xs">
                  <button
                    onClick={() => {
                      setSelectedPlanTab("kids");
                      setCurrentSlideIndex(0);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPlanTab === "kids" ? "bg-white text-slate-900 shadow-xxs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Módulo Primaria
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlanTab("teens");
                      setCurrentSlideIndex(0);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPlanTab === "teens" ? "bg-white text-slate-900 shadow-xxs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Módulo Secundaria
                  </button>
                </div>

                {/* Main Plan Area */}
                {(() => {
                  const currentPlan: PlanClase = selectedPlanTab === "kids" ? geminiPlan.planKids : geminiPlan.planTeens;
                  const activeSlide: SlideDetalle = currentPlan.slides[currentSlideIndex] || {
                    slideNum: 1, 
                    titulo: "Cargando Diapositiva", 
                    guionDocente: "Contenido inexistente",
                    puntosClave: []
                  };

                  return (
                    <div className="grid lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Interactive Simulated PowerPoint Slide Presentation */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative min-h-[360px] flex flex-col justify-between">
                          {/* Slide Head */}
                          <div className="flex justify-between items-center text-3xs font-mono tracking-widest text-indigo-400 uppercase border-b border-white/5 pb-4">
                            <span>Sondeo Clase de IA / DIAPOSITIVA</span>
                            <span>{currentSlideIndex + 1} de {currentPlan.slides.length}</span>
                          </div>

                          {/* Slide Content Body */}
                          <div className="my-8 space-y-4">
                            <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/15 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/20 inline-block">
                              FILMINA {activeSlide.slideNum}
                            </span>
                            <h3 className="text-xl md:text-2xl font-black text-white">{activeSlide.titulo}</h3>
                            
                            <ul className="space-y-2 pt-2">
                              {activeSlide.puntosClave.map((pt, i) => (
                                <li key={i} className="flex gap-2 items-start text-xs text-slate-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 mt-1.5" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Slide Foot control */}
                          <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <p className="text-4xs text-slate-500 font-mono">Taller: {currentPlan.titulo}</p>
                            
                            <div className="flex gap-2">
                              <button
                                disabled={currentSlideIndex === 0}
                                onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer disabled:opacity-30 disabled:hover:bg-white/5"
                              >
                                <ChevronLeft className="w-4 h-4 text-white" />
                              </button>
                              <button
                                disabled={currentSlideIndex === currentPlan.slides.length - 1}
                                onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer disabled:opacity-30 disabled:hover:bg-white/5"
                              >
                                <ChevronRight className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Presenter Guión / Teaching Script Notes */}
                        <div className="bg-amber-50/50 border-2 border-amber-200/50 rounded-3xl p-5 space-y-2 text-left">
                          <h4 className="text-2xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                            👩‍🏫 NOTAS DIDÁCTICAS Y GUIÓN PARA HABLAR EN CLASE
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-serif italic">
                            "{activeSlide.guionDocente}"
                          </p>
                          {activeSlide.consejoPedagogico && (
                            <div className="mt-3 text-3xs text-amber-900 border-t border-amber-200/30 pt-2 font-mono">
                              💡 <strong>Sugerencia Pedagógica:</strong> {activeSlide.consejoPedagogico}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Agenda Chronology & Q&A block */}
                      <div className="lg:col-span-4 space-y-4 text-left">
                        {/* 40 Minutes Agenda Block */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-600" /> Cronograma de 40 Minutos
                          </h4>

                          <div className="space-y-3">
                            {currentPlan.estructuraMinutos.map((bloque, idx) => (
                              <div key={idx} className="flex gap-3 leading-snug">
                                <span className="w-1.5 h-auto bg-slate-200 rounded-full shrink-0" />
                                <div className="space-y-0.5">
                                  <p className="text-3xs font-mono font-bold text-slate-500 uppercase">{bloque.bloque}</p>
                                  <p className="text-xs font-bold text-slate-900">{bloque.contenido}</p>
                                  <p className="text-3xs text-indigo-600 italic">Actividad: {bloque.actividad}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Q&A Questions address card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                          <h4 className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-1">
                            <HelpCircle className="w-4 h-4" /> Preguntas del Alumnado para Responder
                          </h4>
                          <p className="text-[10px] text-slate-400">Preguntas críticas extraídas que Gemini redactó para absolver en el espacio libre de Q&A:</p>
                          
                          <div className="space-y-2">
                            {currentPlan.preguntasQA.map((pregunta, idx) => (
                              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs font-medium leading-relaxed font-serif italic">
                                "{pregunta}"
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
