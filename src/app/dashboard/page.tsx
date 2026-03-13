'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Trophy, Award, Star, Lock, ChevronRight, AlertTriangle, Target, GraduationCap, Flame, Medal } from 'lucide-react';
import { getCurrentUser, type User } from '@/lib/store';
import { MODULES } from '@/lib/training-data';
import Link from 'next/link';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

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
    const showTrainingBlock = !progress.completed;

    const moduleIcons: Record<string, typeof BookOpen> = {
        BookOpen, AlertTriangle, Shield: Shield, Target, Award,
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            {/* Welcome header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                    ¡Hola, {user.username}! 👋
                </h1>
                <p className="text-gray-400">
                    {progress.completed
                        ? 'Has completado tu capacitación. ¡Eres un Ciudadano Ejemplar!'
                        : 'Tienes una capacitación obligatoria pendiente. ¡Comienza ahora!'}
                </p>
            </motion.div>

            {/* Training required alert */}
            {showTrainingBlock && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-amber-300 mb-1">Capacitación obligatoria pendiente</h3>
                            <p className="text-sm text-gray-400 mb-3">
                                Debes completar los 5 módulos de capacitación sobre normas de tránsito antes de acceder a todas las funcionalidades.
                            </p>
                            <Link href="/capacitacion" className="btn-primary inline-flex items-center gap-2 text-sm py-2">
                                <GraduationCap className="w-4 h-4" />
                                Ir a capacitación
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Progreso', value: `${completionPct}%`, icon: Target, color: 'aqua' },
                    { label: 'Puntos', value: progress.totalPoints.toString(), icon: Star, color: 'brand' },
                    { label: 'Nivel', value: progress.level, icon: Flame, color: 'amber' },
                    { label: 'Medallas', value: progress.badges.length.toString(), icon: Medal, color: 'purple' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="card text-center"
                    >
                        <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color === 'aqua' ? 'text-aqua-500' : stat.color === 'brand' ? 'text-brand-500' : stat.color === 'amber' ? 'text-amber-400' : 'text-purple-400'}`} />
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Modules overview */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-aqua-500" />
                    Módulos de capacitación
                </h2>
                <div className="space-y-3">
                    {MODULES.map((mod, i) => {
                        const isCompleted = progress.completedModules.includes(mod.id);
                        const isLocked = i > 0 && !progress.completedModules.includes(MODULES[i - 1].id) && !isCompleted;
                        const score = progress.moduleScores[mod.id];

                        return (
                            <motion.div
                                key={mod.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <Link
                                    href={isLocked ? '#' : `/capacitacion/modulo/${mod.id}`}
                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'} ${isCompleted ? 'bg-aqua-700/5 border border-aqua-700/20' : 'bg-surface-800/50 border border-white/5'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${mod.color}20` }}>
                                        {isLocked ? (
                                            <Lock className="w-5 h-5 text-gray-500" />
                                        ) : isCompleted ? (
                                            <Trophy className="w-5 h-5" style={{ color: mod.color }} />
                                        ) : (
                                            <BookOpen className="w-5 h-5" style={{ color: mod.color }} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-white text-sm">{mod.title}</p>
                                            {isCompleted && <span className="badge text-xs">✓ Completado</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{mod.subtitle}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {score !== undefined ? (
                                            <p className="text-sm font-bold text-aqua-400">{score} pts</p>
                                        ) : (
                                            <p className="text-xs text-gray-500">{mod.pointsAvailable} pts</p>
                                        )}
                                        <p className="text-xs text-gray-600">{mod.duration}</p>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 shrink-0 ${isLocked ? 'text-gray-600' : 'text-gray-500'}`} />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Badges section */}
            {progress.badges.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8">
                    <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        Tus medallas
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {progress.badges.map(badge => (
                            <motion.div key={badge} whileHover={{ scale: 1.05 }} className="badge-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                                <Medal className="w-4 h-4" />
                                {badge}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Certificate link */}
            {progress.completed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8">
                    <Link href="/capacitacion/certificado" className="card flex items-center gap-4 p-6 bg-gradient-to-r from-aqua-700/10 to-brand-700/10 border-aqua-700/20 hover:border-aqua-700/40">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aqua-700 to-brand-600 flex items-center justify-center">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Tu Certificado</h3>
                            <p className="text-sm text-gray-400">Descarga tu certificado de capacitación en PDF</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-aqua-500" />
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
