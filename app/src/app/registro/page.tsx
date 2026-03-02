'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Mail, Lock, Camera, CheckCircle, AlertCircle, ArrowLeft, Scan } from 'lucide-react';
import { registerUser, storeBiometricData, storeWebAuthnCredential, getCurrentUser } from '@/lib/store';
import { useRouter } from 'next/navigation';

type Step = 'form' | 'capture' | 'success';

export default function RegistroPage() {
    const [step, setStep] = useState<Step>('form');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const [scanStatus, setScanStatus] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        if (user) router.push('/dashboard');
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        setLoading(true);
        try {
            const user = registerUser(username, email, password);
            setUserId(user.id);
            setStep('capture');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    const startCapture = async () => {
        setScanStatus('Iniciando cámara...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setScanStatus('Cámara lista. Haga clic en "Capturar rostro".');
            }
        } catch {
            setScanStatus('No se pudo acceder a la cámara. Puede omitir este paso.');
        }
    };

    const captureFace = async () => {
        setScanStatus('Capturando rostro... Permanezca quieto.');
        try {
            const faceapi = await import('@vladmandic/face-api');
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

            if (videoRef.current) {
                const detections = await faceapi
                    .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                if (detections.length > 0) {
                    storeBiometricData(userId, detections[0].descriptor);
                    setScanStatus('¡Rostro capturado exitosamente!');
                    streamRef.current?.getTracks().forEach(t => t.stop());
                    setTimeout(() => setStep('success'), 1500);
                } else {
                    setScanStatus('No se detectó un rostro. Intente de nuevo.');
                }
            }
        } catch {
            setScanStatus('Modelos no disponibles. Puede omitir este paso.');
        }
    };

    const registerWebAuthn = async () => {
        setScanStatus('Esperando autenticación del dispositivo...');
        try {
            const success = await storeWebAuthnCredential(userId);
            if (success) {
                setScanStatus('¡Dispositivo registrado exitosamente!');
                streamRef.current?.getTracks().forEach(t => t.stop());
                setTimeout(() => setStep('success'), 1500);
            } else {
                setScanStatus('No se pudo registrar el dispositivo.');
            }
        } catch (err) {
            console.error(err);
            setScanStatus('WebAuthn no soportado o cancelado.');
        }
    };

    const skipCapture = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setStep('success');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background */}
            <div className="fixed inset-0">
                <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80')` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-midnight-900/80 via-midnight-900/95 to-midnight-900" />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aqua-700 to-brand-700 mb-4 glow-aqua">
                        <Shield className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-display font-bold text-white">Crear cuenta</h1>
                    <p className="text-gray-400 text-sm mt-1">Únete a la capacitación de Respeto Vial</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {['Datos', 'Biometría', 'Listo'].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= ['form', 'capture', 'success'].indexOf(step) ? 'bg-aqua-700 text-white' : 'bg-surface-700 text-gray-500'}`}>
                                {i + 1}
                            </div>
                            <span className={`text-xs hidden sm:inline ${i <= ['form', 'capture', 'success'].indexOf(step) ? 'text-aqua-400' : 'text-gray-600'}`}>{label}</span>
                            {i < 2 && <div className={`w-8 h-0.5 ${i < ['form', 'capture', 'success'].indexOf(step) ? 'bg-aqua-700' : 'bg-surface-700'}`} />}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="glass rounded-3xl p-8">
                    <AnimatePresence mode="wait">
                        {/* Form step */}
                        {step === 'form' && (
                            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Nombre de usuario</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field pl-11" placeholder="tu_usuario" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Correo electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-11" placeholder="correo@ejemplo.com" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-11" placeholder="Mínimo 8 caracteres" required minLength={8} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Confirmar contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field pl-11" placeholder="Repite la contraseña" required />
                                    </div>
                                </div>
                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4 shrink-0" />{error}
                                    </div>
                                )}
                                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">{loading ? 'Registrando...' : 'Continuar'}</button>
                                <div className="text-center">
                                    <a href="/" className="text-sm text-aqua-500 hover:text-aqua-400 inline-flex items-center gap-1">
                                        <ArrowLeft className="w-4 h-4" /> Ya tengo cuenta
                                    </a>
                                </div>
                            </motion.form>
                        )}

                        {/* Capture step */}
                        {step === 'capture' && (
                            <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <div className="text-center mb-4">
                                    <Camera className="w-10 h-10 text-aqua-500 mx-auto mb-2" />
                                    <h3 className="text-lg font-bold text-white">Registro biométrico</h3>
                                    <p className="text-gray-400 text-sm">Capture su rostro para iniciar sesión con biometría</p>
                                </div>
                                <div className="webcam-container aspect-[4/3] bg-surface-800">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                                </div>
                                {scanStatus && <p className="text-sm text-center text-aqua-400 p-2 rounded-lg bg-aqua-700/10">{scanStatus}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={startCapture} className="btn-secondary flex items-center justify-center gap-2">
                                        <Camera className="w-4 h-4" /> Iniciar
                                    </button>
                                    <button onClick={captureFace} className="btn-primary flex items-center justify-center gap-2">
                                        <Scan className="w-4 h-4" /> Capturar
                                    </button>
                                </div>
                                <button onClick={registerWebAuthn} className="btn-secondary w-full mt-3 flex items-center justify-center gap-2">
                                    <Shield className="w-4 h-4" /> Registrar Huella / FaceID (WebAuthn)
                                </button>
                                <button onClick={skipCapture} className="w-full text-sm text-gray-500 hover:text-gray-400 mt-2 py-2">
                                    Omitir por ahora →
                                </button>
                            </motion.div>
                        )}

                        {/* Success step */}
                        {step === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                                    <CheckCircle className="w-20 h-20 text-aqua-500 mx-auto" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white">¡Registro exitoso!</h3>
                                <p className="text-gray-400">Tu cuenta ha sido creada. Ahora debes completar la capacitación obligatoria de Respeto Vial.</p>
                                <button onClick={() => router.push('/dashboard')} className="btn-primary w-full mt-4">
                                    Comenzar capacitación →
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
