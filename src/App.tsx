import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Code, School, LogOut, CheckCircle, ClipboardList, RefreshCw } from "lucide-react";
import RoleSelector from "./components/RoleSelector";
import KidsSurvey from "./components/KidsSurvey";
import TeensSurvey from "./components/TeensSurvey";
import TeachersSurvey from "./components/TeachersSurvey";
import AdminDashboard from "./components/AdminDashboard";
import LiveInteraction from "./components/LiveInteraction";
import { KidsPayload, TeensPayload, TeachersPayload } from "./types";

export default function App() {
  const [role, setRole] = useState<"kids" | "teens" | "teachers" | "admin" | "live" | null>(null);
  const [pin, setPin] = useState("");
  const [appUrl, setAppUrl] = useState("");

  // Read query parameters on initial page load for QR / WhatsApp direct login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role")?.toLowerCase();
    const pinParam = params.get("pin")?.toUpperCase();

    // Check pre-configured environment variables for links (or fallback to current host)
    setAppUrl(window.location.origin);

    if (roleParam && pinParam) {
      const validPins: { [key: string]: string } = {
        kids: "KIDS10",
        teens: "TEENS13",
        teachers: "DOCENTER7",
        admin: "ORGANIZADOR99",
        live: "1234"
      };

      if (roleParam === "live") {
        setRole("live");
        setPin("1234");
      } else if (validPins[roleParam] === pinParam) {
        setRole(roleParam as any);
        setPin(pinParam);
      } else {
        console.warn("Autenticación directa de URL fallida: PIN inválido.");
      }
    }
  }, []);

  const handleSelectRole = (selectedRole: "kids" | "teens" | "teachers" | "admin" | "live", enteredPin: string) => {
    setRole(selectedRole);
    setPin(enteredPin);
    
    // Smoothly append params to URL for self-referential reload, without forcing a page refresh
    const newUrl = `${window.location.origin}/?role=${selectedRole}&pin=${enteredPin}`;
    window.history.replaceState({ path: newUrl }, "", newUrl);
  };

  const handleLogout = () => {
    setRole(null);
    setPin("");
    
    // Clear URL parameters
    const cleanUrl = window.location.origin + "/";
    window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
  };

  // Submit survey responses directly to centralized API
  const handleSurveySubmit = async (surveyType: "kids" | "teens" | "teachers", payload: KidsPayload | TeensPayload | TeachersPayload) => {
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyType,
          pin,
          payload
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al registrar respuesta.");
      }
      return true;
    } catch (err) {
      console.error("Survey Submission Error:", err);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* Centralized Global Header with Vibrant Palette Theme */}
      <header className="bg-white border-b-4 border-indigo-200 py-4 px-6 sticky top-0 z-50 shadow-md shadow-indigo-100/40 shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-indigo-900 uppercase">Taller IA 2026</h1>
              <p className="text-[10px] md:text-xs font-black text-indigo-400 uppercase tracking-widest leading-tight">Central de Relevamiento Educativo</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-2xs md:text-xs font-black flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
              <span className="hidden xs:inline">SERVIDOR</span> ACTIVO
            </div>
            
            {role && (
              <>
                <span className="hidden border-2 border-indigo-100 sm:inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-black uppercase tracking-wider">
                  {role === "kids" ? "Primaria (10-12)" : role === "teens" ? "Secundaria (13-17)" : role === "teachers" ? "Director/Docente" : role === "live" ? "Interacción en Vivo" : "Administrador"}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs font-black text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-1.5 rounded-xl border-2 border-rose-150 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Salir
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-sky-50 flex flex-col justify-center py-6">
        {(() => {
          if (!role) {
            return <RoleSelector onSelectRole={handleSelectRole} appUrl={appUrl} />;
          }

          switch (role) {
            case "kids":
              return (
                <KidsSurvey
                  onBack={handleLogout}
                  onSubmit={(payload) => handleSurveySubmit("kids", payload)}
                />
              );
            case "teens":
              return (
                <TeensSurvey
                  onBack={handleLogout}
                  onSubmit={(payload) => handleSurveySubmit("teens", payload)}
                />
              );
            case "teachers":
              return (
                <TeachersSurvey
                  onBack={handleLogout}
                  onSubmit={(payload) => handleSurveySubmit("teachers", payload)}
                />
              );
            case "admin":
              return (
                <AdminDashboard
                  pin={pin}
                  appUrl={appUrl}
                  onBack={handleLogout}
                />
              );
            case "live":
              return (
                <LiveInteraction
                  onBack={handleLogout}
                />
              );
            default:
              return <RoleSelector onSelectRole={handleSelectRole} appUrl={appUrl} />;
          }
        })()}


      </main>

      {/* Footer detailing architectural centralization with Vibrant Indigo styling */}
      <footer className="bg-indigo-900 border-t-2 border-indigo-950 py-6 px-6 text-indigo-300 text-xs text-center font-bold tracking-wider uppercase">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-white font-black text-xs">© 2026 AI Education Initiative</span>
            <span className="text-[10px] text-indigo-400 mt-1">Soporte Académico de Inteligencia Artificial para Escuelas</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] text-indigo-400 font-mono">
            <span>Encriptación SSL 256-bit Activa</span>
            <span className="hidden sm:inline">•</span>
            <span>ID Sesión: #AI-TRK-9926</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
