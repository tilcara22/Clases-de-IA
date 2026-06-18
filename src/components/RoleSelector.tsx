import React, { useState } from "react";
import { Sparkles, GraduationCap, School, Settings, HelpCircle, Copy, Check, QrCode, ClipboardList, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

interface RoleSelectorProps {
  onSelectRole: (role: "kids" | "teens" | "teachers" | "admin" | "live", pin: string) => void;
  appUrl: string;
}

export default function RoleSelector({ onSelectRole, appUrl }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<"kids" | "teens" | "teachers" | "admin" | "live" | null>(null);
  const [pinValue, setPinValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const rolesConfig = {
    kids: {
      title: "Primaria (10 a 12 años)",
      description: "Encuesta divertida con emojis sobre juegos, robots e Inteligencia Artificial.",
      icon: Sparkles,
      color: "from-amber-400 to-orange-500",
      accent: "text-orange-500",
      expectedPin: "KIDS10",
      bg: "bg-orange-50/50"
    },
    teens: {
      title: "Secundaria (13 a 17 años)",
      description: "Sondeo tecnológico y ético sobre herramientas digitales y futuro profesional.",
      icon: GraduationCap,
      color: "from-blue-500 to-indigo-600",
      accent: "text-indigo-600",
      expectedPin: "TEENS13",
      bg: "bg-indigo-50/50"
    },
    teachers: {
      title: "Docentes / Profesores",
      description: "Preguntas clave para coordinar la vinculación curricular y desafíos del aula.",
      icon: School,
      color: "from-emerald-500 to-teal-600",
      accent: "text-teal-600",
      expectedPin: "DOCENTER7",
      bg: "bg-teal-50/50"
    },
    live: {
      title: "Consignas en Vivo",
      description: "Respuestas directas y anónimas a preguntas orales hechas por el profesor en clase.",
      icon: MessageSquare,
      color: "from-fuchsia-500 to-pink-600",
      accent: "text-pink-600",
      expectedPin: "1234",
      bg: "bg-fuchsia-10"
    },
    admin: {
      title: "Organizador / Administrador",
      description: "Panel centralizado para graficar respuestas y diseñar planes de clase con IA.",
      icon: Settings,
      color: "from-slate-700 to-slate-900",
      accent: "text-slate-800",
      expectedPin: "ORGANIZADOR89",
      bg: "bg-slate-100"
    }
  };

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    const config = rolesConfig[selectedRole];
    
    if (selectedRole === "live") {
      const enteredValue = pinValue.trim();
      // Allow entered empty string or 1234 or *1234*
      if (enteredValue === "" || enteredValue === "1234" || enteredValue === "*1234*") {
        setErrorMsg("");
        onSelectRole("live", "1234");
      } else {
        setErrorMsg("Ingresa '1234' o deja el casillero completamente vacío para ingresar.");
      }
      return;
    }

    if (pinValue.trim().toUpperCase() === config.expectedPin) {
      setErrorMsg("");
      onSelectRole(selectedRole, pinValue.trim().toUpperCase());
    } else {
      setErrorMsg("Código PIN incorrecto para este perfil. Intenta nuevamente.");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const getFullLink = (role: string, pin: string) => {
    const baseUrl = appUrl || window.location.origin;
    return `${baseUrl}/?role=${role}&pin=${pin}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-4"
        >
          <ClipboardList className="w-4 h-4" /> RELEVAMIENTO PEDAGÓGICO DE IA
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4"
        >
          Planificación de Clases Taller sobre <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Inteligencia Artificial</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 text-base"
        >
          Por favor, selecciona tu perfil para responder el sondeo o acceder a los resultados centralizados. Cada sección requiere de un código de acceso dedicado.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Main Selection Area */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Portales de Acceso</h2>
          
          <div className="grid gap-4">
            {(Object.keys(rolesConfig) as Array<keyof typeof rolesConfig>).map((roleKey, idx) => {
              const conf = rolesConfig[roleKey];
              const IconComp = conf.icon;
              const isSelected = selectedRole === roleKey;

              return (
                <motion.div
                  key={roleKey}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedRole(roleKey);
                    setPinValue("");
                    setErrorMsg("");
                  }}
                  className={`cursor-pointer rounded-3xl p-5 border-2 transition-all duration-200 ${
                    isSelected 
                      ? "border-indigo-500 bg-white shadow-xl shadow-indigo-150/40 ring-4 ring-indigo-500/10" 
                      : "border-indigo-100 hover:border-indigo-300 bg-white hover:shadow-md shadow-sm"
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${conf.color} text-white shadow-md`}>
                      <IconComp className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-center gap-1">
                        <h3 className="font-black text-indigo-950 text-md tracking-tight">
                          {roleKey === "kids" ? "Exploradores IA" : roleKey === "teens" ? "Creadores IA" : roleKey === "teachers" ? "Panel Docente" : roleKey === "live" ? "Interacción en Vivo" : "Panel Organizador"}
                        </h3>
                        <span className="text-3xs font-black bg-indigo-50 px-2.5 py-0.5 rounded-full text-indigo-500 border border-indigo-100">
                          {conf.title}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">{conf.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Access validation sidebar */}
        <div className="md:col-span-5">
          {selectedRole ? (
            <motion.div
              layoutId="auth-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 shadow-2xl shadow-indigo-100/60 relative overflow-hidden"
            >
              {/* Top border colored stripe */}
              <div className={`absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r ${rolesConfig[selectedRole].color}`} />

              <h3 className="text-xl font-black text-indigo-950 mb-1.5 flex items-center gap-2 tracking-tight">
                Autenticación Requerida
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                {selectedRole === "live" ? (
                  "Ingresa el PIN '1234' o déjalo vacío para participar directamente."
                ) : (
                  `Ingresa el código PIN provisto por el organizador para acceder a la sección ${rolesConfig[selectedRole].title}.`
                )}
              </p>

              <form onSubmit={handleAccess} className="space-y-5">
                <div>
                  <label className="block text-indigo-900 text-xs font-black mb-2 uppercase tracking-widest">
                    Código de Acceso (PIN)
                  </label>
                  <input
                    type="text"
                    required={selectedRole !== "live"}
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    placeholder={selectedRole === "live" ? "Opcional (deja vacío o escribe 1234)" : `Ej: ${rolesConfig[selectedRole].expectedPin}`}
                    className="w-full text-center tracking-widest font-mono text-lg py-3 px-4 rounded-2xl border-2 border-indigo-100 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                  />
                </div>

                {errorMsg && (
                  <p className="text-rose-600 text-xs font-bold bg-rose-50 p-3 rounded-xl border-2 border-rose-100">
                    ⚠️ {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className={`w-full py-4 px-4 font-black text-sm text-white shadow-xl shadow-indigo-100 transition-all duration-150 rounded-2xl cursor-pointer bg-gradient-to-r ${rolesConfig[selectedRole].color} hover:shadow-2xl hover:brightness-105 active:scale-[0.98] uppercase tracking-wider`}
                >
                  Confirmar y Entrar
                </button>
              </form>

              <div className="mt-6 border-t border-indigo-50 pt-4 text-center">
                <span className="text-slate-400 text-3xs font-semibold flex items-center justify-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> ¿No tienes el PIN? Búscalo en tu WhatsApp escolar.
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-50 text-center py-12 shadow-2xl shadow-indigo-100/40 space-y-4">
              <QrCode className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
              <h3 className="font-black text-indigo-950 text-base tracking-tight">Acceso Escolar</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed font-medium">
                Selecciona un perfil a la izquierda e ingresa su código PIN para responder la encuesta o gestionar el organizador centralizado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
