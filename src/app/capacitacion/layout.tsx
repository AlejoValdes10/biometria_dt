'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, type User } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function CapacitacionLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const u = getCurrentUser();
        if (!u) { router.push('/'); return; }
        setUser(u);
    }, [router]);

    if (!user) return null;

    return <>{children}</>;
}
