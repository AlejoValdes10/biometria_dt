'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, GraduationCap, Shield, Award, Calendar, User as UserIcon, Star } from 'lucide-react';
import { getCurrentUser, type User } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CertificadoPage() {
    const [user, setUser] = useState<User | null>(null);
    const [generating, setGenerating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function loadUser() {
            const u = await getCurrentUser();
            if (!u) { router.push('/'); return; }
            if (!u.trainingProgress?.completed) { router.push('/capacitacion'); return; }
            setUser(u);
        }
        loadUser();
    }, [router]);

    const generatePDF = async () => {
        if (!user) return;
        setGenerating(true);
        try {
            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
            const doc = await PDFDocument.create();
            const page = doc.addPage([842, 595]); // A4 landscape
            const { width, height } = page.getSize();

            const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
            const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
            const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

            // Background
            page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.04, 0.09, 0.16) });

            // Border
            page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0, 0.75, 0.65), borderWidth: 2 });
            page.drawRectangle({ x: 30, y: 30, width: width - 60, height: height - 60, borderColor: rgb(0.23, 0.25, 0.37), borderWidth: 1 });

            // Header
            page.drawText('CERTIFICADO DE CAPACITACIÓN', { x: width / 2 - 200, y: height - 90, size: 28, font: fontBold, color: rgb(0.4, 0.88, 0.81) });
            page.drawText('RESPETO VIAL COLOMBIA', { x: width / 2 - 130, y: height - 120, size: 18, font: fontRegular, color: rgb(0.6, 0.6, 0.7) });

            // Shield icon placeholder
            page.drawText('🛡️', { x: width / 2 - 15, y: height - 165, size: 30, font: fontRegular, color: rgb(1, 1, 1) });

            // Body text
            page.drawText('Se certifica que:', { x: width / 2 - 60, y: height - 210, size: 14, font: fontItalic, color: rgb(0.7, 0.7, 0.8) });

            // Name
            page.drawText(user.username.toUpperCase(), { x: width / 2 - (user.username.length * 10), y: height - 250, size: 32, font: fontBold, color: rgb(1, 1, 1) });

            // Line under name
            page.drawLine({ start: { x: 150, y: height - 260 }, end: { x: width - 150, y: height - 260 }, color: rgb(0, 0.75, 0.65), thickness: 1 });

            // Description
            const certificationText = `Certifico que ${user.username} completó el taller de respeto a normas`;
            const certificationText2 = 'de tránsito para evitar infracciones.';
            page.drawText(certificationText, { x: width / 2 - 220, y: height - 295, size: 13, font: fontRegular, color: rgb(0.8, 0.8, 0.9) });
            page.drawText(certificationText2, { x: width / 2 - 120, y: height - 315, size: 13, font: fontRegular, color: rgb(0.8, 0.8, 0.9) });

            // Stats
            const totalPts = user.trainingProgress.totalPoints;
            const modulesCompleted = 3;
            page.drawText(`Puntuación: ${totalPts} puntos | Módulos: 3/3 | Nivel: ${user.trainingProgress.level}`, {
                x: width / 2 - 200, y: height - 355, size: 11, font: fontRegular, color: rgb(0.4, 0.88, 0.81),
            });

            // Date
            const date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            page.drawText(`Fecha de emisión: ${date}`, { x: width / 2 - 100, y: height - 395, size: 11, font: fontRegular, color: rgb(0.5, 0.5, 0.6) });

            // Commitment
            page.drawText('"Yo me comprometo a respetar y acatar las normas y órdenes de tránsito"', {
                x: width / 2 - 250, y: height - 440, size: 11, font: fontItalic, color: rgb(0.6, 0.65, 0.75),
            });

            // Footer
            page.drawText('Respeto Vial Colombia - Respeto Vial', { x: width / 2 - 120, y: 60, size: 10, font: fontBold, color: rgb(0.4, 0.88, 0.81) });
            page.drawText('Programa de Capacitación Virtual | Colombia 2026', { x: width / 2 - 130, y: 45, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.5) });

            const pdfBytes = await doc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `certificado_respeto_vial_${user.username}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error generating PDF:', err);
        } finally {
            setGenerating(false);
        }
    };

    if (!user) return null;

    const date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Certificate preview */}
                <div className="glass rounded-3xl overflow-hidden">
                    {/* Certificate header */}
                    <div className="bg-gradient-to-r from-aqua-700/20 to-brand-700/20 p-8 md:p-12 text-center border-b border-white/5">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                            <GraduationCap className="w-16 h-16 text-aqua-500 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-aqua-400 font-medium text-sm uppercase tracking-widest mb-2">Certificado de Capacitación</p>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Respeto Vial Colombia</h1>
                    </div>

                    {/* Certificate body */}
                    <div className="p-8 md:p-12 text-center space-y-6">
                        <p className="text-gray-400 italic">Se certifica que:</p>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient">{user.username}</h2>
                            <div className="w-64 h-px bg-gradient-to-r from-transparent via-aqua-600 to-transparent mx-auto mt-3" />
                        </div>
                        <p className="text-gray-300 max-w-lg mx-auto leading-relaxed">
                            Certifico que completó el <strong className="text-white">taller de respeto a normas de tránsito para evitar infracciones.</strong>
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-aqua-400">{user.trainingProgress.totalPoints}</p>
                                <p className="text-xs text-gray-500">Puntos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-brand-400">3/3</p>
                                <p className="text-xs text-gray-500">Módulos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-400">{user.trainingProgress.level}</p>
                                <p className="text-xs text-gray-500">Nivel</p>
                            </div>
                        </div>

                        {/* Commitment */}
                        <div className="p-4 rounded-xl bg-surface-800/50 border border-white/5 max-w-lg mx-auto">
                            <p className="text-sm text-gray-400 italic">
                                &ldquo;Yo me comprometo a respetar y acatar las normas y órdenes de tránsito, a proteger mi vida y la de los demás.&rdquo;
                            </p>
                        </div>

                        {/* Date */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>Emitido el {date}</span>
                        </div>

                        {/* Badges */}
                        {user.trainingProgress.badges.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {user.trainingProgress.badges.map(badge => (
                                    <span key={badge} className="badge-gold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                        <Award className="w-3 h-3" /> {badge}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 text-center bg-surface-800/30 border-t border-white/5">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Shield className="w-3 h-3 text-aqua-600" />
                            <span>Respeto Vial Colombia · Respeto Vial · Colombia 2026</span>
                        </div>
                    </div>
                </div>

                {/* Download button */}
                <button onClick={generatePDF} disabled={generating} className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg disabled:opacity-50">
                    {generating ? (
                        <>
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generando PDF...
                        </>
                    ) : (
                        <>
                            <Download className="w-6 h-6" />
                            Descargar certificado en PDF
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
