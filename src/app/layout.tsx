import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Respeto Vial Colombia - Respeto Vial',
    description: 'Capacitación virtual obligatoria sobre normas de tránsito en Colombia. Autenticación biométrica para una experiencia segura.',
    keywords: 'tránsito, Colombia, capacitación vial, normas de tránsito, seguridad vial, biometría',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-midnight-900 text-gray-200 min-h-screen bg-grid antialiased">
                <div className="relative min-h-screen">
                    {/* Background glow effects */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-aqua-700/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-[120px]" />
                    </div>
                    {children}
                </div>
            </body>
        </html>
    );
}
