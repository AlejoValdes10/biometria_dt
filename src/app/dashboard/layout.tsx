'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Trophy, Award, LogOut, ChevronRight, Star, Lock, BarChart3, Home, GraduationCap, User as UserIcon, Settings } from 'lucide-react';
import { getCurrentUser, logout, type User } from '@/lib/store';
import { MODULES } from '@/lib/training-data';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const u = getCurrentUser();
        if (!u) { router.push('/'); return; }
        if (u.role === 'admin') { router.push('/admin'); return; }
        setUser(u);
    }, [router, pathname]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!user) return null;

    const progress = user.trainingProgress;
    const completionPct = Math.round((progress.completedModules.length / 5) * 100);

    const navItems = [
        { icon: Home, label: 'Inicio', href: '/dashboard' },
        { icon: GraduationCap, label: 'Capacitación', href: '/capacitacion' },
        { icon: UserIcon, label: 'Perfil', href: '/dashboard' },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-surface-800/50 backdrop-blur-xl border-r border-white/5 min-h-screen fixed left-0 top-0 z-40">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aqua-700 to-brand-700 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-white text-sm">Respeto Vial Colombia</h1>
                            <p className="text-xs text-aqua-500">Respeto Vial</p>
                        </div>
                    </div>
                </div>

                {/* User info */}
                <div className="p-4 m-4 rounded-xl bg-surface-700/50 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aqua-700 to-brand-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{user.username[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Nivel</span>
                            <span className="text-aqua-400 font-medium">{progress.level}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Puntos</span>
                            <span className="text-brand-400 font-medium">{progress.totalPoints}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden mt-1">
                            <div className="progress-fill h-full rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 text-center">{completionPct}% completado</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-aqua-700/15 text-aqua-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-all">
                        <LogOut className="w-5 h-5" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-72 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile bottom nav */}
            <nav className="mobile-nav md:hidden flex items-center justify-around py-2 px-4">
                {navItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-aqua-400' : 'text-gray-500'}`}>
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    );
                })}
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-gray-500">
                    <LogOut className="w-5 h-5" />
                    <span className="text-xs">Salir</span>
                </button>
            </nav>
        </div>
    );
}
