export interface KidsPayload {
  name: string;
  age: string;
  spokenToAI: string;
  aiForWhat: string[];
  curiosityMiedo: string;
  excitement: string;
}

export interface TeensPayload {
  name: string;
  age: string;
  usageFreq: string;
  aiInterests: string[];
  criticalQuestion: string;
  aiPerspective: string;
}

export interface TeachersPayload {
  name: string;
  subject: string;
  q1Curriculum: string;
  q2Ethics: string;
  q3Challenges: string;
  suggestions: string;
}

export interface SurveyResponse {
  id: string;
  type: "kids" | "teens" | "teachers";
  timestamp: string;
  // Dynamic fields
  name?: string;
  age?: string;
  // Kids fields
  spokenToAI?: string;
  aiForWhat?: string[];
  curiosityMiedo?: string;
  excitement?: string;
  // Teens fields
  usageFreq?: string;
  aiInterests?: string[];
  criticalQuestion?: string;
  aiPerspective?: string;
  // Teachers fields
  subject?: string;
  q1Curriculum?: string;
  q2Ethics?: string;
  q3Challenges?: string;
  suggestions?: string;
}

// Plan generator types
export interface BloqueEstructura {
  bloque: string;
  contenido: string;
  actividad: string;
}

export interface SlideDetalle {
  slideNum: number;
  titulo: string;
  guionDocente: string;
  puntosClave: string[];
  consejoPedagogico?: string;
}

export interface PlanClase {
  titulo: string;
  estructuraMinutos: BloqueEstructura[];
  slides: SlideDetalle[];
  preguntasQA: string[];
}

export interface GeminiPlanResponse {
  resumenAnalisis: {
    kidsConceptKey: string;
    teensConceptKey: string;
    teachersDemands: string;
  };
  planKids: PlanClase;
  planTeens: PlanClase;
}
