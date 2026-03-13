'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, Eye, User, Lock, Mail, ChevronRight, Scan, AlertCircle, Volume2 } from 'lucide-react';
import { loginUser, loginWithBiometric, loginWithWebAuthn, type User as UserType, updateAuthTypeAndName } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [mode, setMode] = useState<'welcome' | 'biometric' | 'credentials' | 'details'>('welcome');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [greeting, setGreeting] = useState(false);
    const [fullName, setFullName] = useState('');
    const [authType, setAuthType] = useState<'cara' | 'huella' | 'fallback' | ''>('');
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
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
        // NOTE: We intentionally do NOT auto-redirect here so the landing
        // page is always seen first and the user chooses to go to login.
    }, []);

    const speakGreeting = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('¡Bienvenido ciudadano!');
            utterance.lang = 'es-CO';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const runSuccessGreeting = (user: UserType) => {
        setGreeting(true);
        speakGreeting();
        setTimeout(() => {
            if (user.role === 'admin') router.push('/admin');
            else router.push('/dashboard');
        }, 2500);
    }

    const handleSuccessLogin = async (user: UserType, type: 'cara' | 'huella' | 'fallback') => {
        let finalUser = user;
        if (user.authType !== type && user.name) {
            try {
                finalUser = await updateAuthTypeAndName(user.id, type, user.name);
            } catch (e) { }
        }

        if (!finalUser.name) {
            setCurrentUser(finalUser);
            setAuthType(type);
            setMode('details');
        } else {
            runSuccessGreeting(finalUser);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!fullName.trim()) {
            setError('Por favor ingresa tu nombre completo');
            return;
        }
        setLoading(true);
        try {
            if (currentUser) {
                const updatedUser = await updateAuthTypeAndName(currentUser.id, authType, fullName);
                runSuccessGreeting(updatedUser);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al guardar detalles');
            setLoading(false);
        }
    };

    const handleCredentialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await loginUser(username, password);
            handleSuccessLogin(user, 'fallback');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

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

            <AnimatePresence>
                {greeting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/95">
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.8 }} className="text-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, ease: 'linear' }} className="inline-block mb-6">
                                <Shield className="w-24 h-24 text-aqua-600" />
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-4">¡Bienvenido Ciudadano!</h1>
                            <div className="flex items-center justify-center gap-2 text-aqua-500">
                                <Volume2 className="w-5 h-5 animate-pulse" />
                                <p className="text-lg">Reproduciendo saludo de voz...</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-lg">
                <motion.div className="text-center mb-8">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-aqua-700 to-brand-700 mb-6 glow-aqua">
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Respeto Vial Colombia</h1>
                    <p className="text-aqua-500 font-medium text-lg">Seguridad y Respeto en la Vía</p>
                </motion.div>

                <motion.div layout className="glass rounded-3xl p-8 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {mode === 'welcome' && (
                            <motion.div key="welcome" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-4">
                                <h2 className="text-xl font-bold text-white text-center mb-6">Iniciar sesión</h2>
                                <button onClick={() => setMode('biometric')} className="w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, rgba(0,191,165,0.15), rgba(30,64,175,0.15))', border: '1px solid rgba(0,191,165,0.2)' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-aqua-700 to-brand-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-aqua-700/25 transition-shadow">
                                            <Scan className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-white">Iniciar sesión con biometría (cara o huella)</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-aqua-500 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                                <button onClick={() => setMode('credentials')} className="w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-surface-700 flex items-center justify-center"><User className="w-7 h-7 text-gray-300" /></div>
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-white">Iniciar sesión con credenciales normales</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                                <div className="text-center pt-4 border-t border-white/5">
                                    <p className="text-gray-400 text-sm">¿No tienes cuenta? <a href="/registro" className="text-aqua-500 hover:text-aqua-400 font-medium transition-colors">Regístrate aquí</a></p>
                                </div>
                                <div className="text-center">
                                    <a href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Volver al inicio</a>
                                </div>
                            </motion.div>
                        )}

                        {mode === 'biometric' && (
                            <motion.div key="biometric" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <BiometricLogin onBack={() => setMode('welcome')} onSuccess={handleSuccessLogin} onError={setError} />
                            </motion.div>
                        )}

                        {mode === 'credentials' && (
                            <motion.div key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Iniciar sesión</h2>
                                    <button onClick={() => { setMode('welcome'); setError(''); }} className="text-sm text-aqua-500 hover:text-aqua-400">← Volver</button>
                                </div>
                                <form onSubmit={handleCredentialLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Usuario o correo</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field pl-10" placeholder="usuario@correo.com" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" required />
                                        </div>
                                    </div>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                                        </motion.div>
                                    )}
                                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Ingresar <ChevronRight className="w-5 h-5" /></>}
                                    </button>
                                </form>
                                <div className="text-center pt-2">
                                    <a href="/registro" className="text-sm text-aqua-500 hover:text-aqua-400 font-medium">¿No tienes cuenta? Regístrate</a>
                                </div>
                            </motion.div>
                        )}

                        {mode === 'details' && (
                            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-white mb-2">Completar Datos</h2>
                                    <p className="text-sm text-gray-400">Por favor, necesitamos tu nombre completo para el certificado de la capacitación.</p>
                                </div>
                                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Nombre Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-10" placeholder="Juan Pérez Gomez" required />
                                        </div>
                                    </div>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                                        </motion.div>
                                    )}
                                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Guardar y Continuar <ChevronRight className="w-5 h-5" /></>}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
}

function BiometricLogin({ onBack, onSuccess, onError }: { onBack: () => void; onSuccess: (user: UserType, authType: 'cara' | 'huella') => void; onError: (msg: string) => void; }) {
    const [status, setStatus] = useState<'init' | 'loading' | 'scanning' | 'error' | 'no-support'>('init');
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        if (window.PublicKeyCredential) {
            setStatusMsg('WebAuthn disponible. Puedes usar biometría del dispositivo.');
        }
    }, []);

    const startFaceScan = async () => {
        setStatus('loading');
        setStatusMsg('Cargando modelos de reconocimiento facial...');
        try {
            const faceapi = await import('@vladmandic/face-api');
            // strictly relative to root for Vercel
            const modelPath = '/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
            await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
            await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);

            setStatus('scanning');
            setStatusMsg('Modelos cargados. Posicione su rostro frente a la cámara.');

            if (!navigator || !navigator.mediaDevices) {
                setStatus('error');
                setStatusMsg('La cámara no está disponible. Asegúrese de usar HTTPS.');
                return;
            }
            if (!navigator.mediaDevices.getUserMedia) {
                setStatus('error');
                setStatusMsg('La cámara no está disponible o el navegador no soporta getUserMedia.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            const video = document.getElementById('biometric-video') as HTMLVideoElement;
            if (video) {
                video.srcObject = stream;
                await video.play();
                setTimeout(async () => {
                    try {
                        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
                        stream.getTracks().forEach(t => t.stop());
                        if (detections.length > 0) {
                            const descriptor = detections[0].descriptor;
                            const { loginWithBiometric } = await import('@/lib/store');
                            const user = await loginWithBiometric(descriptor);
                            if (user) {
                                onSuccess(user, 'cara');
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
            setStatusMsg('Los modelos de reconocimiento facial no están disponibles. Intente con huella o credenciales.');
        }
    };

    const tryWebAuthn = async () => {
        try {
            if (!window.PublicKeyCredential) {
                setStatusMsg('WebAuthn no disponible en este navegador.');
                return;
            }
            setStatusMsg('Esperando autenticación biométrica del dispositivo...');

            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            // Use navigator.credentials.get directly with platform authenticator
            // userVerification: 'preferred' prompts fingerprint/faceID without passkey
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    rpId: window.location.hostname,
                    userVerification: 'preferred',
                    timeout: 60000,
                    // Empty allowCredentials = let the authenticator show all registered credentials
                    allowCredentials: [],
                }
            }) as PublicKeyCredential;

            if (assertion) {
                const { loginWithWebAuthn } = await import('@/lib/store');
                const user = await loginWithWebAuthn(assertion.id);
                if (user) {
                    setStatusMsg('¡Autenticado con éxito!');
                    onSuccess(user, 'huella');
                } else {
                    setStatus('error');
                    setStatusMsg('No se pudo autenticar. Regístrese primero con huella o use credenciales.');
                }
            }
        } catch (err) {
            console.error('WebAuthn error:', err);
            setStatus('error');
            setStatusMsg('Error al intentar WebAuthn. Intente con credenciales.');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Autenticación biométrica</h2>
                <button onClick={onBack} className="text-sm text-aqua-500 hover:text-aqua-400">← Volver</button>
            </div>
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
            {statusMsg && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm text-center p-3 rounded-xl ${status === 'error' || status === 'no-support' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-aqua-700/10 text-aqua-400 border border-aqua-700/20'}`}>
                    {statusMsg}
                </motion.p>
            )}
            <div className="space-y-3">
                <button onClick={startFaceScan} className="btn-primary w-full flex items-center justify-center gap-3"><Scan className="w-5 h-5" /> Escanear rostro</button>
                <button onClick={tryWebAuthn} className="btn-secondary w-full flex items-center justify-center gap-3"><Fingerprint className="w-5 h-5" /> Usar huella / FaceID</button>
            </div>
        </div>
    );
}
