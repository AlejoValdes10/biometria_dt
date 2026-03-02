/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                midnight: {
                    900: '#0A1628',
                    800: '#0A2540',
                    700: '#0F3460',
                    600: '#1A4B8C',
                },
                brand: {
                    900: '#1E3A5F',
                    800: '#1E40AF',
                    700: '#2563EB',
                    600: '#3B82F6',
                    500: '#60A5FA',
                    400: '#93C5FD',
                },
                aqua: {
                    900: '#006B5A',
                    800: '#00897B',
                    700: '#00BFA5',
                    600: '#40E0D0',
                    500: '#67E8CE',
                    400: '#A7F3D0',
                },
                surface: {
                    900: '#0B1120',
                    800: '#111827',
                    700: '#1F2937',
                    600: '#374151',
                    500: '#4B5563',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'radial-gradient(ellipse at center, rgba(0,191,165,0.15) 0%, transparent 70%)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'scan-line': 'scanLine 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0,191,165,0.5), 0 0 20px rgba(0,191,165,0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(0,191,165,0.8), 0 0 60px rgba(0,191,165,0.4)' },
                },
                scanLine: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
            },
        },
    },
    plugins: [],
};
