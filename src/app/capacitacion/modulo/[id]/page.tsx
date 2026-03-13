'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Star, Trophy, Award, PenTool, AlertTriangle, BookOpen, ShieldCheck, Target, ChevronRight, RotateCcw, Download } from 'lucide-react';
import { getCurrentUser, completeModule, storeSignature, type User } from '@/lib/store';
import { MODULES, INTRO_FACTS, QUIZ_QUESTIONS, COMMITMENT_TEXT } from '@/lib/training-data';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function ModulePage() {
    const params = useParams();
    const moduleId = Number(params.id);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const u = await getCurrentUser();
            if (!u) { router.push('/'); return; }
            setUser(u);
        };
        loadUser();
    }, [router]);

    if (!user) return null;

    const mod = MODULES.find(m => m.id === moduleId);
    if (!mod) return <div className="p-8 text-center text-gray-400">Módulo no encontrado</div>;

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
            <Link href="/capacitacion" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver a capacitación
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Module header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${mod.color}20`, border: `1px solid ${mod.color}30` }}>
                        <BookOpen className="w-7 h-7" style={{ color: mod.color }} />
                    </div>
                    <div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${mod.color}15`, color: mod.color }}>Módulo {mod.id}</span>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">{mod.title}</h1>
                        <p className="text-gray-400 text-sm">{mod.subtitle}</p>
                    </div>
                </div>

                {/* Module content by ID */}
                {moduleId === 1 && <Module1Intro user={user} onComplete={(score) => { completeModule(user.id, 1, score); router.push('/capacitacion'); }} />}
                {moduleId === 2 && <Module3Rules user={user} onComplete={(score) => { completeModule(user.id, 2, score); router.push('/capacitacion'); }} />}
                {moduleId === 3 && <Module5Commitment user={user} onComplete={(score) => { completeModule(user.id, 3, score); storeSignature(user.id, ''); router.push('/capacitacion/certificado'); }} />}
            </motion.div>
        </div>
    );
}

// MODULE 1: Introduction with stats
function Module1Intro({ user, onComplete }: { user: User; onComplete: (score: number) => void }) {
    const [step, setStep] = useState(0);
    const totalSteps = 3;

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="glass rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-4">🇨🇴 La realidad vial en Colombia</h2>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                Colombia enfrenta una crisis de seguridad vial. Cada año, miles de familias pierden un ser querido en las vías.
                                Detrás de cada estadística hay una madre sin hijo, un hijo sin padre, una comunidad devastada.
                                Conocer estas cifras es el primer paso para cambiar esta realidad.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {INTRO_FACTS.map((fact, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }} className="card text-center p-4">
                                        <p className="text-2xl md:text-3xl font-bold text-gradient mb-1">{fact.stat}</p>
                                        <p className="text-xs text-gray-400">{fact.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setStep(1)} className="btn-primary w-full flex items-center justify-center gap-2">
                            Continuar <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="glass rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-4">📊 Tendencia de accidentalidad</h2>
                            <p className="text-gray-300 mb-6">Las cifras no mienten. Cada año la situación se mantiene crítica:</p>
                            <div className="space-y-4">
                                {[
                                    { year: '2022', deaths: '8,038', injuries: '35,421', color: '#EF4444' },
                                    { year: '2023', deaths: '8,267', injuries: '36,892', color: '#F59E0B' },
                                    { year: '2024', deaths: '7,915', injuries: '34,567', color: '#10B981' },
                                ].map((item, i) => (
                                    <motion.div key={item.year} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 border border-white/5">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg" style={{ background: `${item.color}20`, color: item.color }}>
                                            {item.year.slice(2)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{item.year}</p>
                                            <div className="flex gap-4 text-xs mt-1">
                                                <span className="text-red-400">💀 {item.deaths} fallecidos</span>
                                                <span className="text-amber-400">🏥 {item.injuries} heridos</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-300 text-center font-medium">
                                    ⚠️ Más de 24,000 personas han muerto en las vías colombianas en solo 3 años
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Anterior</button>
                            <button onClick={() => setStep(2)} className="btn-primary flex-1">Continuar →</button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="glass rounded-2xl p-6 md:p-8 text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                <CheckCircle className="w-16 h-16 text-aqua-500 mx-auto mb-4" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-white mb-2">¡Módulo completado!</h2>
                            <p className="text-gray-400 mb-4">Has aprendido sobre la realidad vial en Colombia. Es hora de actuar.</p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aqua-700/15 text-aqua-400 font-bold">
                                <Star className="w-5 h-5" /> +100 puntos
                            </div>
                        </div>
                        <button onClick={() => onComplete(100)} className="btn-primary w-full">
                            Continuar al siguiente módulo →
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



// MODULE 3: Quiz on Rules
function Module3Rules({ user, onComplete }: { user: User; onComplete: (score: number) => void }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [finished, setFinished] = useState(false);

    const handleSelect = (idx: number) => {
        if (answered) return;
        setSelected(idx);
        setAnswered(true);
        if (idx === QUIZ_QUESTIONS[currentQ].correctIndex) {
            setScore(s => s + 33);
        }
    };

    const nextQuestion = () => {
        if (currentQ < QUIZ_QUESTIONS.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelected(null);
            setAnswered(false);
        } else {
            setFinished(true);
        }
    };

    if (finished) {
        const finalScore = Math.min(score, 200);
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="glass rounded-2xl p-8 text-center">
                    <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">¡Quiz completado!</h2>
                    <p className="text-gray-400 mb-4">Tu puntuación en señales y reglas de tránsito:</p>
                    <p className="text-4xl font-bold text-gradient mb-2">{finalScore}/200</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aqua-700/15 text-aqua-400 font-bold">
                        <Star className="w-5 h-5" /> +{finalScore} puntos
                    </div>
                </div>
                <button onClick={() => onComplete(finalScore)} className="btn-primary w-full">Continuar →</button>
            </motion.div>
        );
    }

    const q = QUIZ_QUESTIONS[currentQ];

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center gap-2">
                {QUIZ_QUESTIONS.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= currentQ ? 'bg-aqua-600' : 'bg-surface-700'}`} />
                ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
                <span>Pregunta {currentQ + 1} de {QUIZ_QUESTIONS.length}</span>
                <span>Puntos: {score}</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="glass rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white mb-6">{q.question}</h3>
                        <div className="space-y-3">
                            {q.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(i)}
                                    disabled={answered}
                                    className={`quiz-option w-full text-left flex items-center gap-3 ${answered
                                        ? i === q.correctIndex
                                            ? 'correct'
                                            : i === selected
                                                ? 'incorrect'
                                                : ''
                                        : ''
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${answered && i === q.correctIndex
                                        ? 'bg-green-500/20 text-green-400'
                                        : answered && i === selected && i !== q.correctIndex
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-surface-700 text-gray-400'
                                        }`}>
                                        {answered && i === q.correctIndex ? <CheckCircle className="w-5 h-5" /> :
                                            answered && i === selected ? <XCircle className="w-5 h-5" /> :
                                                String.fromCharCode(65 + i)}
                                    </div>
                                    <span className="text-sm text-gray-200">{opt}</span>
                                </button>
                            ))}
                        </div>

                        {answered && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-brand-800/10 border border-brand-600/20">
                                <p className="text-sm text-brand-300">💡 {q.explanation}</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {answered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button onClick={nextQuestion} className="btn-primary w-full">
                        {currentQ < QUIZ_QUESTIONS.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados →'}
                    </button>
                </motion.div>
            )}
        </div>
    );
}



// MODULE 5: Digital Commitment & Signature
function Module5Commitment({ user, onComplete }: { user: User; onComplete: (score: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [signed, setSigned] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        setDrawing(true);
        setHasDrawn(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!drawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0A2540';
        ctx.lineTo(x, y);
        ctx.stroke();
    }, [drawing]);

    const stopDraw = useCallback(() => setDrawing(false), []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const handleSign = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL();
        storeSignature(user.id, dataUrl);
        setSigned(true);
    };

    if (signed) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="glass rounded-2xl p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                        <Award className="w-20 h-20 text-aqua-500 mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">🎉 ¡Felicitaciones!</h2>
                    <p className="text-gray-300 mb-4">Has completado toda la capacitación y firmado tu compromiso ciudadano.</p>
                    <p className="text-xl font-bold text-gradient mb-4">¡Eres un Ciudadano Ejemplar!</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aqua-700/15 text-aqua-400 font-bold">
                        <Star className="w-5 h-5" /> +100 puntos
                    </div>
                </div>
                <button onClick={() => onComplete(100)} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Ver mi certificado
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="glass rounded-2xl p-6 md:p-8">
                <div className="text-center mb-6">
                    <PenTool className="w-10 h-10 text-aqua-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Tu compromiso ciudadano</h2>
                    <p className="text-gray-400 text-sm">Lee el siguiente texto y firma para completar tu capacitación</p>
                </div>

                {/* Commitment text */}
                <div className="p-6 rounded-xl bg-surface-800/80 border border-aqua-700/20 mb-6">
                    <p className="text-lg text-white font-medium leading-relaxed italic text-center">
                        &ldquo;{COMMITMENT_TEXT}&rdquo;
                    </p>
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 rounded border-gray-600 bg-surface-800 text-aqua-600 focus:ring-aqua-500" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        He leído y acepto el compromiso. Entiendo que al firmar me comprometo a respetar las normas de tránsito vigentes en Colombia.
                    </span>
                </label>

                {/* Signature canvas */}
                {agreed && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-sm text-gray-400 mb-2">Firma aquí abajo:</p>
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={200}
                            className="signature-canvas w-full"
                            style={{ height: '150px' }}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={stopDraw}
                        />
                        <div className="flex gap-3 mt-3">
                            <button onClick={clearCanvas} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                                <RotateCcw className="w-4 h-4" /> Limpiar
                            </button>
                            <button onClick={handleSign} disabled={!hasDrawn} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                                <PenTool className="w-4 h-4" /> Firmar compromiso
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
