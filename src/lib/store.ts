import { v4 as uuidv4 } from 'uuid';
import {
    createUserAction,
    loginCredentialAction,
    loginBiometricAction,
    loginWebAuthnAction,
    updateUserAction,
    getUserAction,
    getAllUsersAction
} from '@/app/actions';

// Auth store and utilities for Respeto Vial Colombia
// Refactored to use Server Actions for persistence

export interface User {
    id: string;
    username: string;
    name?: string;
    email: string;
    role: 'user' | 'admin';
    createdDate: string;
    hasBiometric: boolean;
    authType?: string;
    facePhoto?: string;
    trainingProgress: TrainingProgress;
    signatureData?: string;
    certificateDate?: string;
}

export interface TrainingProgress {
    currentModule: number;
    completedModules: number[];
    moduleScores: Record<number, number>;
    totalPoints: number;
    level: string;
    badges: string[];
    completed: boolean;
}

const LEVELS = [
    { name: 'Novato', minPoints: 0 },
    { name: 'Aprendiz', minPoints: 100 },
    { name: 'Consciente', minPoints: 250 },
    { name: 'Responsable', minPoints: 500 },
    { name: 'Ciudadano Ejemplar', minPoints: 800 },
];

export function getLevel(points: number): string {
    let level = LEVELS[0].name;
    for (const l of LEVELS) {
        if (points >= l.minPoints) level = l.name;
    }
    return level;
}

export function getLevelIndex(level: string): number {
    return LEVELS.findIndex(l => l.name === level);
}

export function getNextLevel(points: number): { name: string; minPoints: number } | null {
    for (const l of LEVELS) {
        if (points < l.minPoints) return l;
    }
    return null;
}

const DEFAULT_PROGRESS: TrainingProgress = {
    currentModule: 0,
    completedModules: [],
    moduleScores: {},
    totalPoints: 0,
    level: 'Novato',
    badges: [],
    completed: false,
};

let currentUserCache: User | null = null;

export async function getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem('rv_current_user');
    if (!id) return null;
    if (currentUserCache?.id === id) return currentUserCache;

    // Fetch from API
    const res = await getUserAction(id);
    if (res?.success && res.user) {
        currentUserCache = res.user as User;
        return currentUserCache;
    }
    return null;
}

// Keep a synchronous version for immediate layout checks cautiously 
// where we only care if they are likely logged in.
export function getCurrentUserSync(): User | null {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem('rv_current_user');
    if (!id) return null;
    return currentUserCache || { id, role: 'user' } as User; // basic stub
}

export function setCurrentUser(user: User | null) {
    currentUserCache = user;
    if (user) {
        localStorage.setItem('rv_current_user', user.id);
    } else {
        localStorage.removeItem('rv_current_user');
    }
}

export async function registerUser(username: string, email: string, password: string): Promise<User> {
    const res = await createUserAction({ username, email, password });
    if (!res.success) throw new Error(res.error || 'Error al registrar usuario');
    setCurrentUser(res.user as User);
    return res.user as User;
}

export async function loginUser(usernameOrEmail: string, password: string): Promise<User> {
    const res = await loginCredentialAction(usernameOrEmail, password);
    if (!res.success) throw new Error(res.error || 'Usuario o contraseña incorrectos');
    setCurrentUser(res.user as User);
    return res.user as User;
}

export async function loginWithBiometric(faceDescriptor: Float32Array): Promise<User | null> {
    const res = await loginBiometricAction(Array.from(faceDescriptor));
    if (res.success && res.user) {
        setCurrentUser(res.user as User);
        return res.user as User;
    }
    return null;
}

export async function storeBiometricData(userId: string, descriptor: Float32Array, facePhoto?: string) {
    const dataToUpdate: any = {
        hasBiometric: true,
        faceDescriptor: JSON.stringify(Array.from(descriptor))
    };
    if (facePhoto) {
        dataToUpdate.facePhoto = facePhoto;
    }
    const res = await updateUserAction(userId, dataToUpdate);
    if (res.success && res.user) {
        setCurrentUser(res.user as User);
    }
}

export async function storeWebAuthnCredential(userId: string) {
    if (!window.PublicKeyCredential) throw new Error('WebAuthn no soportado');

    const encodeId = new TextEncoder().encode(userId);
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: { name: 'Respeto Vial Colombia', id: window.location.hostname },
            user: {
                id: encodeId,
                name: userId,
                displayName: userId
            },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
            authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'preferred' },
            timeout: 60000,
            attestation: 'none'
        }
    }) as PublicKeyCredential;

    if (credential) {
        const res = await updateUserAction(userId, {
            hasBiometric: true,
            webAuthnId: credential.id
        });
        if (res.success && res.user) {
            setCurrentUser(res.user as User);
            return true;
        }
    }
    return false;
}

export async function loginWithWebAuthn(credentialId?: string): Promise<User | null> {
    if (!window.PublicKeyCredential) throw new Error('WebAuthn no soportado');

    try {
        let assertionId: string;

        if (credentialId) {
            // Used when the caller already obtained the assertion
            assertionId = credentialId;
        } else {
            // Fallback: do the WebAuthn call here (platform biometric / fingerprint)
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    rpId: window.location.hostname,
                    userVerification: 'preferred',
                    timeout: 60000,
                    allowCredentials: [],
                }
            }) as PublicKeyCredential;

            if (!assertion) return null;
            assertionId = assertion.id;
        }

        const res = await loginWebAuthnAction(assertionId);
        if (res.success && res.user) {
            setCurrentUser(res.user as User);
            return res.user as User;
        }
    } catch (e) {
        console.error('WebAuthn failed', e);
    }
    return null;
}


export async function updateAuthTypeAndName(userId: string, authType: string, name: string): Promise<User> {
    const res = await updateUserAction(userId, { authType, name });
    if (!res.success) throw new Error(res.error || 'Error actualizando usuario');
    setCurrentUser(res.user as User);
    return res.user as User;
}

export async function updateTrainingProgress(userId: string, progress: Partial<TrainingProgress>) {
    const u = await getCurrentUser();
    if (!u) return;

    const newProgress = { ...u.trainingProgress, ...progress };
    newProgress.level = getLevel(newProgress.totalPoints);

    const res = await updateUserAction(userId, {
        level: newProgress.level,
        completedModules: JSON.stringify(newProgress.completedModules),
        moduleScores: JSON.stringify(newProgress.moduleScores),
        totalPoints: newProgress.totalPoints,
        badges: JSON.stringify(newProgress.badges),
        completed: newProgress.completed,
    });

    if (res.success && res.user) {
        setCurrentUser(res.user as User);
    }
}

export async function completeModule(userId: string, moduleId: number, score: number) {
    const u = await getCurrentUser();
    if (!u) return;

    const p = { ...u.trainingProgress };

    if (!p.completedModules.includes(moduleId)) {
        p.completedModules.push(moduleId);
    }
    p.moduleScores[moduleId] = score;
    p.totalPoints += score;
    p.level = getLevel(p.totalPoints);

    if (p.completedModules.length >= 3) {
        p.completed = true;
        if (!p.badges.includes('Capacitación Completa')) {
            p.badges.push('Capacitación Completa');
        }
    }

    if (p.totalPoints >= 100 && !p.badges.includes('Primer Centenario')) {
        p.badges.push('Primer Centenario');
    }
    if (p.totalPoints >= 300 && !p.badges.includes('Medio Millar')) {
        p.badges.push('Medio Millar');
    }
    if (Object.values(p.moduleScores).some(s => s >= 180) && !p.badges.includes('Puntuación Perfecta')) {
        p.badges.push('Puntuación Perfecta');
    }

    const res = await updateUserAction(userId, {
        level: p.level,
        completedModules: JSON.stringify(p.completedModules),
        moduleScores: JSON.stringify(p.moduleScores),
        totalPoints: p.totalPoints,
        badges: JSON.stringify(p.badges),
        completed: p.completed,
    });

    if (res.success && res.user) {
        setCurrentUser(res.user as User);
    }
}

export async function storeSignature(userId: string, signatureDataUrl: string) {
    const res = await updateUserAction(userId, { signature: signatureDataUrl });
    if (res.success && res.user) {
        setCurrentUser(res.user as User);
    }
}

export function logout() {
    currentUserCache = null;
    localStorage.removeItem('rv_current_user');
}

export async function getAllUsers(): Promise<User[]> {
    const users = await getAllUsersAction();
    return users as User[];
}

export async function resetUserTraining(userId: string) {
    const res = await updateUserAction(userId, {
        level: 'Novato',
        completedModules: '[]',
        moduleScores: '{}',
        totalPoints: 0,
        badges: '[]',
        completed: false,
        signature: null,
    });
    if (res.success && res.user) {
        setCurrentUser(res.user as User);
    }
}

export async function initDemoData() {
    // Only fetch checking or handle on backend.
    // Kept empty in frontend. Use a seed action if needed.
}
