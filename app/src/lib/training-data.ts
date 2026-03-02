// Training module data for Colombian traffic laws

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface TrainingModule {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    duration: string;
    pointsAvailable: number;
    description: string;
}

export const MODULES: TrainingModule[] = [
    {
        id: 1,
        title: 'Introducción',
        subtitle: 'La realidad vial en Colombia',
        icon: 'BookOpen',
        color: '#1E40AF', // Deep blue
        duration: '5 min',
        pointsAvailable: 100,
        description: 'Conoce las estadísticas de accidentalidad vial en Colombia y el contexto actual.',
    },
    {
        id: 2,
        title: 'Reglas de Tránsito',
        subtitle: 'Conoce tu normativa',
        icon: 'ShieldCheck',
        color: '#00BFA5', // Aquamarine
        duration: '10 min',
        pointsAvailable: 200,
        description: 'Aprende las reglas fundamentales y demuestra tus conocimientos.',
    },
    {
        id: 3,
        title: 'Compromiso',
        subtitle: 'Tu firma digital',
        icon: 'Award',
        color: '#0A2540', // Very deep blue
        duration: '3 min',
        pointsAvailable: 100,
        description: 'Firma tu compromiso digital de respetar las normas de tránsito.',
    },
];

export const INTRO_FACTS = [
    { stat: '7,915', label: 'Muertes por accidentes viales (2024)', icon: 'Skull' },
    { stat: '34,567', label: 'Personas heridas en siniestros', icon: 'Ambulance' },
    { stat: '94', label: 'Accidentes diarios en promedio', icon: 'AlertCircle' },
    { stat: '40%', label: 'Causados por exceso de velocidad', icon: 'Gauge' },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        question: '¿Qué indica una señal de tránsito con forma de triángulo invertido y borde rojo?',
        options: ['Pare obligatorio', 'Ceda el paso', 'Zona escolar', 'Prohibido girar'],
        correctIndex: 1,
        explanation: 'El triángulo invertido con borde rojo es la señal universal de "CEDA EL PASO". Indica que debe reducir la velocidad y ceder paso.',
    },
    {
        id: 2,
        question: '¿Cuál es la velocidad máxima permitida en zona residencial en Colombia?',
        options: ['40 km/h', '30 km/h', '50 km/h', '20 km/h'],
        correctIndex: 1,
        explanation: 'Según la ley, la velocidad máxima en zonas residenciales es de 30 km/h para proteger a peatones.',
    },
    {
        id: 3,
        question: '¿Qué significa una línea amarilla continua en el centro de la vía?',
        options: ['Se puede adelantar con precaución', 'Prohibido adelantar', 'Carril exclusivo', 'Zona de parqueo'],
        correctIndex: 1,
        explanation: 'La línea amarilla continua en el centro indica PROHIBICIÓN DE ADELANTAR. Cruzarla es una infracción grave.',
    },
    {
        id: 4,
        question: '¿Quién tiene prioridad en un paso peatonal?',
        options: ['El vehículo que viene más rápido', 'El peatón siempre', 'Depende del semáforo', 'El vehículo más grande'],
        correctIndex: 1,
        explanation: 'El peatón SIEMPRE tiene prioridad en un paso peatonal. Los conductores deben detenerse completamente.',
    },
];

export const COMMITMENT_TEXT = 'Certifico que completé el taller de respeto a normas de tránsito para evitar infracciones. Me comprometo a respetar y acatar las normas de tránsito, a proteger mi vida y la de los demás, y a ser un ciudadano responsable en las vías de Colombia.';
