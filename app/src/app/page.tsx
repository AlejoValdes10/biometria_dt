'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, Eye, User, Lock, Mail, ChevronRight, Scan, AlertCircle, Volume2 } from 'lucide-react';
import { getCurrentUser, loginUser, loginWithBiometric, loginWithWebAuthn, initDemoData, type User as UserType } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const [mode, setMode] = useState<'welcome' | 'biometric' | 'credentials'>('welcome');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [greeting, setGreeting] = useState(false);
    const router = useRouter();

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

        initDemoData();
        /* No automatic redirects to prevent 404s on fresh deploys */
    }, [router]);

    const speakGreeting = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('¡Bienvenido ciudadano!');
            utterance.lang = 'es-CO';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSuccessLogin = (user: UserType) => {
        setGreeting(true);
        speakGreeting();
        setTimeout(() => {
            if (user.role === 'admin') router.push('/admin');
            else router.push('/dashboard');
        }, 2500);
    };

    const handleCredentialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = loginUser(username, password);
            handleSuccessLogin(user);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Hero background */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-midnight-900/80 via-midnight-900/90 to-midnight-900" />
            </div>

            {/* Animated particles */}
            <div className="absolute inset-0 pointer-events-none">
                {mounted && particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute w-1 h-1 bg-aqua-600/30 rounded-full"
                        initial={{ x: p.x, y: p.y }}
                        animate={{
                            y: [null, p.yNode],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            repeatType: 'loop',
                            delay: p.delay,
                        }}
                    />
                ))}
            </div>

            {/* Greeting overlay */}
            <AnimatePresence>
                {greeting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/95"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', duration: 0.8 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, ease: 'linear' }}
                                className="inline-block mb-6"
                            >
                                <Shield className="w-24 h-24 text-aqua-600" />
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-4">
                                ¡Bienvenido Ciudadano!
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-aqua-500">
                                <Volume2 className="w-5 h-5 animate-pulse" />
                                <p className="text-lg">Reproduciendo saludo de voz...</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Logo and title */}
                <motion.div className="text-center mb-8">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-aqua-700 to-brand-700 mb-6 glow-aqua"
                    >
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                        Respeto Vial Colombia
                    </h1>
                    <p className="text-aqua-500 font-medium text-lg">Respeto Vial</p>
                    <p className="text-gray-400 mt-2 text-sm max-w-sm mx-auto">
                        Capacitación virtual obligatoria sobre normas de tránsito en Colombia
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    layout
                    className="glass rounded-3xl p-8 shadow-2xl"
                >
                    <AnimatePresence mode="wait">
                        {/* Welcome mode */}
                        {mode === 'welcome' && (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-bold text-white text-center mb-6">
                                    Inicia sesión
                                </h2>
                                {/* Biometric button */}
                                <button
                                    onClick={() => setMode('biometric')}
                                    className="w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0,191,165,0.15), rgba(30,64,175,0.15))',
                                        border: '1px solid rgba(0,191,165,0.2)',
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-aqua-700 to-brand-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-aqua-700/25 transition-shadow">
                                            <Scan className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-white">Iniciar con biometría</p>
                                            <p className="text-xs text-gray-400">Reconocimiento facial, iris o huella</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-aqua-500 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>

                                {/* Credential button */}
                                <button
                                    onClick={() => setMode('credentials')}
                                    className="w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]"
                                    style={{
                                        background: 'rgba(30,41,59,0.4)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-surface-700 flex items-center justify-center">
                                            <User className="w-7 h-7 text-gray-300" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-white">Usuario y contraseña</p>
                                            <p className="text-xs text-gray-400">Acceso tradicional</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>

                                {/* Direct Access Links */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <a
                                        href="/capacitacion"
                                        className="p-3 rounded-xl bg-aqua-600/10 border border-aqua-600/20 text-center hover:bg-aqua-600/20 transition-colors"
                                    >
                                        <p className="text-sm font-bold text-aqua-400">Ver Capacitación</p>
                                    </a>
                                    <a
                                        href="/admin"
                                        className="p-3 rounded-xl bg-purple-600/10 border border-purple-600/20 text-center hover:bg-purple-600/20 transition-colors"
                                    >
                                        <p className="text-sm font-bold text-purple-400">Panel Admin</p>
                                    </a>
                                </div>

                                {/* Register link */}
                                <div className="text-center pt-4 border-t border-white/5">
                                    <p className="text-gray-400 text-sm">
                                        ¿No tienes cuenta?{' '}
                                        <a href="/registro" className="text-aqua-500 hover:text-aqua-400 font-medium transition-colors">
                                            Regístrate aquí
                                        </a>
                                    </p>
                                </div>

                                {/* Demo info */}
                                <div className="mt-4 p-3 rounded-xl bg-brand-800/10 border border-brand-600/20">
                                    <p className="text-xs text-brand-400 text-center">
                                        <strong>Demo Admin:</strong> admin@ciudadano.co / admin123
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Biometric mode */}
                        {mode === 'biometric' && (
                            <motion.div
                                key="biometric"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <BiometricLogin
                                    onBack={() => setMode('welcome')}
                                    onSuccess={handleSuccessLogin}
                                    onError={setError}
                                />
                            </motion.div>
                        )}

                        {/* Credentials mode */}
                        {mode === 'credentials' && (
                            <motion.div
                                key="credentials"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Iniciar sesión</h2>
                                    <button
                                        onClick={() => { setMode('welcome'); setError(''); }}
                                        className="text-sm text-aqua-500 hover:text-aqua-400"
                                    >
                                        ← Volver
                                    </button>
                                </div>

                                <form onSubmit={handleCredentialLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Usuario o correo</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="input-field pl-11"
                                                placeholder="usuario@correo.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="input-field pl-11"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Ingresar
                                                <ChevronRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center pt-2">
                                    <a href="/registro" className="text-sm text-aqua-500 hover:text-aqua-400 font-medium">
                                        ¿No tienes cuenta? Regístrate
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-xs text-gray-600 mt-8"
                >
                    © 2026 Respeto Vial Colombia · Respeto Vial Colombia
                </motion.p>
            </motion.div>
        </div>
    );
}

// Biometric login sub-component
function BiometricLogin({
    onBack,
    onSuccess,
    onError,
}: {
    onBack: () => void;
    onSuccess: (user: UserType) => void;
    onError: (msg: string) => void;
}) {
    const [status, setStatus] = useState<'init' | 'loading' | 'scanning' | 'error' | 'no-support'>('init');
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        // Check if WebAuthn is supported
        if (window.PublicKeyCredential) {
            setStatusMsg('WebAuthn disponible. Puedes usar biometría del dispositivo.');
        }
    }, []);

    const startFaceScan = async () => {
        setStatus('loading');
        setStatusMsg('Cargando modelos de reconocimiento facial...');

        try {
            const faceapi = await import('@vladmandic/face-api');

            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

            setStatus('scanning');
            setStatusMsg('Modelos cargados. Posicione su rostro frente a la cámara.');

            if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setStatus('error');
                setStatusMsg('La cámara no está disponible. Asegúrese de usar HTTPS o localhost.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('biometric-video') as HTMLVideoElement;
            if (video) {
                video.srcObject = stream;
                await video.play();

                // Wait for face detection
                setTimeout(async () => {
                    try {
                        const detections = await faceapi
                            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                            .withFaceLandmarks()
                            .withFaceDescriptors();

                        stream.getTracks().forEach(t => t.stop());

                        if (detections.length > 0) {
                            const descriptor = detections[0].descriptor;
                            const user = loginWithBiometric(descriptor);
                            if (user) {
                                onSuccess(user);
                            } else {
                                setStatus('error');
                                setStatusMsg('Rostro no reconocido. Intente con credenciales o regístrese primero.');
                            }
                        } else {
                            setStatus('error');
                            setStatusMsg('No se detectó ningún rostro. Intente de nuevo.');
                        }
                    } catch {
                        setStatus('error');
                        setStatusMsg('Error durante el escaneo facial.');
                    }
                }, 3000);
            }
        } catch (err) {
            console.error('Face API error:', err);
            setStatus('no-support');
            setStatusMsg('Los modelos de reconocimiento facial no están disponibles. Use el inicio de sesión por credenciales o descargue los modelos en /public/models/.');
        }
    };

    const tryWebAuthn = async () => {
        try {
            if (!window.PublicKeyCredential) {
                setStatusMsg('WebAuthn no disponible en este navegador.');
                return;
            }
            setStatusMsg('Esperando autenticación del dispositivo...');
            const user = await loginWithWebAuthn();
            if (user) {
                setStatusMsg('¡Autenticado con éxito!');
                onSuccess(user);
            } else {
                setStatus('error');
                setStatusMsg('No se pudo autenticar o usuario no registrado.');
            }
        } catch {
            setStatus('error');
            setStatusMsg('Error al intentar WebAuthn.');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Autenticación biométrica</h2>
                <button onClick={onBack} className="text-sm text-aqua-500 hover:text-aqua-400">← Volver</button>
            </div>

            {/* Video container */}
            {(status === 'scanning' || status === 'loading') && (
                <div className="webcam-container aspect-[4/3] bg-surface-800 scan-overlay">
                    <video id="biometric-video" autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-surface-900/80">
                            <div className="w-10 h-10 border-3 border-aqua-600/30 border-t-aqua-600 rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            )}

            {/* Status message */}
            {statusMsg && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm text-center p-3 rounded-xl ${status === 'error' || status === 'no-support' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-aqua-700/10 text-aqua-400 border border-aqua-700/20'}`}
                >
                    {statusMsg}
                </motion.p>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
                <button onClick={startFaceScan} className="btn-primary w-full flex items-center justify-center gap-3">
                    <Scan className="w-5 h-5" />
                    Escanear rostro
                </button>

                <button onClick={tryWebAuthn} className="btn-secondary w-full flex items-center justify-center gap-3">
                    <Fingerprint className="w-5 h-5" />
                    Huella / Iris (WebAuthn)
                </button>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>Iris disponible si su dispositivo lo soporta via WebAuthn</span>
                </div>
            </div>
        </div>
    );
}
