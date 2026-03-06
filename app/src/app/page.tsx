'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, User, Settings, Info } from 'lucide-react';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<{ id: number, x: number, y: number, duration: number, delay: number, yNode: number }[]>([]);

    useEffect(() => {
        setMounted(true);
        setParticles([...Array(20)].map((_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
            yNode: Math.random() * -500
        })));
    }, []);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80')` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-midnight-900/80 via-midnight-900/90 to-midnight-900" />
            </div>

            <div className="absolute inset-0 pointer-events-none">
                {mounted && particles.map((p) => (
                    <motion.div key={p.id} className="absolute w-1 h-1 bg-aqua-600/30 rounded-full" initial={{ x: p.x, y: p.y }} animate={{ y: [null, p.yNode], opacity: [0, 1, 0] }} transition={{ duration: p.duration, repeat: Infinity, repeatType: 'loop', delay: p.delay }} />
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-lg">
                <motion.div className="text-center mb-8">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-aqua-700 to-brand-700 mb-6 glow-aqua">
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Respeto Vial Colombia</h1>
                    <p className="text-aqua-500 font-medium text-lg">Respeto Vial</p>
                    <p className="text-gray-400 mt-2 text-sm max-w-sm mx-auto">
                        Capacitación virtual obligatoria sobre normas de tránsito en Colombia
                    </p>
                </motion.div>

                <motion.div layout className="glass rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white text-center mb-6">Portal de Acceso</h2>
                    <div className="space-y-4">
                        <a href="/login" className="block w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, rgba(0,191,165,0.15), rgba(30,64,175,0.15))', border: '1px solid rgba(0,191,165,0.2)' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-aqua-700 to-brand-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-aqua-700/25 transition-shadow">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-semibold text-white">Iniciar Sesión</p>
                                    <p className="text-xs text-aqua-200/70">Biometría o Credenciales</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-aqua-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>

                        <a href="/registro" className="block w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-surface-700 flex items-center justify-center">
                                    <Info className="w-7 h-7 text-gray-300" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-semibold text-white">Registrarse</p>
                                    <p className="text-xs text-gray-400">Crear cuenta nueva</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <a href="/capacitacion" className="p-3 rounded-xl bg-aqua-600/10 border border-aqua-600/20 text-center hover:bg-aqua-600/20 transition-colors">
                                <p className="text-sm font-bold text-aqua-400">Ver Capacitación</p>
                            </a>
                            <a href="/admin" className="p-3 rounded-xl bg-purple-600/10 border border-purple-600/20 text-center hover:bg-purple-600/20 transition-colors">
                                <p className="text-sm font-bold text-purple-400">Panel Admin</p>
                            </a>
                        </div>
                    </div>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center text-xs text-gray-600 mt-8">
                    © 2026 Respeto Vial Colombia · Respeto Vial Colombia
                </motion.p>
            </motion.div>
        </div>
    );
}
