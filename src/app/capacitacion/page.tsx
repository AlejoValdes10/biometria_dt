'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Trophy, ChevronRight, Lock, GraduationCap, ArrowLeft } from 'lucide-react';
import { getCurrentUser, type User } from '@/lib/store';
import { MODULES } from '@/lib/training-data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CapacitacionPage() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const u = getCurrentUser();
        if (!u) { router.push('/'); return; }
        setUser(u);
    }, [router]);

    if (!user) return null;

    const progress = user.trainingProgress || {
        currentModule: 0,
        completedModules: [],
        moduleScores: {},
        totalPoints: 0,
        level: 'Novato',
        badges: [],
        completed: false,
    };
    const completionPct = Math.round((progress.completedModules.length / 5) * 100);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aqua-700 to-brand-700 mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Capacitación Vial</h1>
                    <p className="text-gray-400 max-w-md mx-auto">Completa los 5 módulos para convertirte en un Ciudadano Ejemplar en las vías colombianas</p>
                </div>

                {/* Progress bar */}
                <div className="mb-8 p-4 glass rounded-2xl">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progreso general</span>
                        <span className="text-aqua-400 font-bold">{completionPct}%</span>
                    </div>
                    <div className="w-full h-3 bg-surface-900 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="progress-fill h-full rounded-full" />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-500">{progress.completedModules.length}/5 módulos</span>
                        <span className="text-xs text-aqua-500">{progress.totalPoints} puntos</span>
                    </div>
                </div>

                {/* Module list */}
                <div className="space-y-4">
                    {MODULES.map((mod, i) => {
                        const isCompleted = progress.completedModules.includes(mod.id);
                        const isLocked = i > 0 && !progress.completedModules.includes(MODULES[i - 1].id) && !isCompleted;
                        const isCurrent = !isCompleted && !isLocked;
                        const score = progress.moduleScores[mod.id];

                        return (
                            <motion.div
                                key={mod.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={isLocked ? '#' : `/capacitacion/modulo/${mod.id}`}
                                    className={`block p-6 rounded-2xl transition-all duration-300 border ${isCompleted
                                        ? 'bg-aqua-700/5 border-aqua-700/20 hover:border-aqua-700/40'
                                        : isCurrent
                                            ? 'bg-brand-700/5 border-brand-600/20 hover:border-brand-600/40 hover:shadow-lg hover:shadow-brand-600/5'
                                            : 'bg-surface-800/50 border-white/5 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}>
                                            {isLocked ? <Lock className="w-6 h-6 text-gray-500" /> :
                                                isCompleted ? <Trophy className="w-6 h-6" style={{ color: mod.color }} /> :
                                                    <BookOpen className="w-6 h-6" style={{ color: mod.color }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${mod.color}15`, color: mod.color }}>
                                                    Módulo {mod.id}
                                                </span>
                                                {isCompleted && <span className="badge text-xs">✓ Completado</span>}
                                                {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-600/15 text-brand-400 font-medium">Siguiente</span>}
                                            </div>
                                            <h3 className="font-bold text-white text-lg">{mod.title}</h3>
                                            <p className="text-sm text-gray-400 mt-1">{mod.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>⏱️ {mod.duration}</span>
                                                <span>🏆 {score !== undefined ? `${score}/${mod.pointsAvailable}` : `${mod.pointsAvailable}`} pts</span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-6 h-6 shrink-0 ${isLocked ? 'text-gray-700' : 'text-gray-400'}`} />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Certificate section */}
                {progress.completed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8">
                        <Link href="/capacitacion/certificado" className="block p-6 rounded-2xl bg-gradient-to-r from-aqua-700/10 to-brand-600/10 border border-aqua-700/25 hover:border-aqua-700/50 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aqua-700 to-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">¡Certificado disponible!</h3>
                                    <p className="text-sm text-gray-400">Descarga tu certificado oficial de capacitación en Respeto Vial</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-aqua-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
