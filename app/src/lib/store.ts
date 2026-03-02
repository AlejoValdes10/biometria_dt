import { v4 as uuidv4 } from 'uuid';

// Auth store and utilities for Respeto Vial Colombia
// Uses localStorage for demo persistence

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    createdDate: string;
    hasBiometric: boolean;
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

// Demo users storage
function getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('rv_users');
    return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
    localStorage.setItem('rv_users', JSON.stringify(users));
}

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem('rv_current_user');
    if (!id) return null;
    const users = getUsers();
    return users.find(u => u.id === id) || null;
}

export function setCurrentUser(user: User | null) {
    if (user) {
        localStorage.setItem('rv_current_user', user.id);
        // Update user in storage
        const users = getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx >= 0) users[idx] = user;
        else users.push(user);
        saveUsers(users);
    } else {
        localStorage.removeItem('rv_current_user');
    }
}

export function registerUser(username: string, email: string, password: string): User {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        throw new Error('El correo ya está registrado');
    }
    if (users.find(u => u.username === username)) {
        throw new Error('El nombre de usuario no está disponible');
    }

    const newUser: User = {
        id: uuidv4(),
        username,
        email,
        role: email === 'admin@ciudadano.co' ? 'admin' : 'user',
        createdDate: new Date().toISOString(),
        hasBiometric: false,
        trainingProgress: { ...DEFAULT_PROGRESS },
    };

    // Store password hash (demo - just base64)
    localStorage.setItem(`rv_pwd_${newUser.id}`, btoa(password));

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    return newUser;
}

export function loginUser(usernameOrEmail: string, password: string): User {
    const users = getUsers();
    const user = users.find(u => u.email === usernameOrEmail || u.username === usernameOrEmail);
    if (!user) throw new Error('Usuario o contraseña incorrectos');

    const stored = localStorage.getItem(`rv_pwd_${user.id}`);
    if (!stored || atob(stored) !== password) {
        throw new Error('Usuario o contraseña incorrectos');
    }

    setCurrentUser(user);
    return user;
}

export function loginWithBiometric(faceDescriptor: Float32Array): User | null {
    const users = getUsers();
    for (const user of users) {
        if (!user.hasBiometric) continue;
        const storedStr = localStorage.getItem(`rv_face_${user.id}`);
        if (!storedStr) continue;

        const stored = new Float32Array(JSON.parse(storedStr));
        const distance = euclideanDistance(faceDescriptor, stored);
        if (distance < 0.6) {
            setCurrentUser(user);
            return user;
        }
    }
    return null;
}

export function storeBiometricData(userId: string, descriptor: Float32Array) {
    localStorage.setItem(`rv_face_${userId}`, JSON.stringify(Array.from(descriptor)));
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.hasBiometric = true;
        saveUsers(users);
        setCurrentUser(user);
    }
}

// Convert string to Uint8Array safely
const bufferDecode = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const bufferEncode = (value: ArrayBuffer) => btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(value))));

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
            authenticatorSelection: { userVerification: 'required' },
            timeout: 60000,
            attestation: 'none'
        }
    }) as PublicKeyCredential;

    if (credential) {
        localStorage.setItem(`rv_webauthn_${userId}`, credential.id);
        const users = getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.hasBiometric = true;
            saveUsers(users);
            setCurrentUser(user);
        }
        return true;
    }
    return false;
}

export async function loginWithWebAuthn(): Promise<User | null> {
    if (!window.PublicKeyCredential) throw new Error('WebAuthn no soportado');

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    try {
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge,
                rpId: window.location.hostname,
                userVerification: 'required',
                timeout: 60000
            }
        }) as PublicKeyCredential;

        if (assertion) {
            const users = getUsers();
            // Find user holding this credential
            for (const user of users) {
                if (localStorage.getItem(`rv_webauthn_${user.id}`) === assertion.id) {
                    setCurrentUser(user);
                    return user;
                }
            }
        }
    } catch (e) {
        console.error('WebAuthn failed', e);
    }
    return null;
}

function euclideanDistance(a: Float32Array, b: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

export function updateTrainingProgress(userId: string, progress: Partial<TrainingProgress>) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.trainingProgress = { ...user.trainingProgress, ...progress };
        user.trainingProgress.level = getLevel(user.trainingProgress.totalPoints);
        saveUsers(users);
        setCurrentUser(user);
    }
}

export function completeModule(userId: string, moduleId: number, score: number) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!user.trainingProgress.completedModules.includes(moduleId)) {
        user.trainingProgress.completedModules.push(moduleId);
    }
    user.trainingProgress.moduleScores[moduleId] = score;
    user.trainingProgress.totalPoints += score;
    user.trainingProgress.level = getLevel(user.trainingProgress.totalPoints);

    if (user.trainingProgress.completedModules.length >= 3) {
        user.trainingProgress.completed = true;
        if (!user.trainingProgress.badges.includes('Capacitación Completa')) {
            user.trainingProgress.badges.push('Capacitación Completa');
        }
    }

    // Award badges
    if (user.trainingProgress.totalPoints >= 100 && !user.trainingProgress.badges.includes('Primer Centenario')) {
        user.trainingProgress.badges.push('Primer Centenario');
    }
    if (user.trainingProgress.totalPoints >= 300 && !user.trainingProgress.badges.includes('Medio Millar')) {
        user.trainingProgress.badges.push('Medio Millar');
    }
    if (Object.values(user.trainingProgress.moduleScores).some(s => s >= 180) && !user.trainingProgress.badges.includes('Puntuación Perfecta')) {
        user.trainingProgress.badges.push('Puntuación Perfecta');
    }

    saveUsers(users);
    setCurrentUser(user);
}

export function storeSignature(userId: string, signatureDataUrl: string) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.signatureData = signatureDataUrl;
        user.certificateDate = new Date().toISOString();
        saveUsers(users);
        setCurrentUser(user);
    }
}

export function logout() {
    localStorage.removeItem('rv_current_user');
}

export function getAllUsers(): User[] {
    return getUsers();
}

export function resetUserTraining(userId: string) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.trainingProgress = { ...DEFAULT_PROGRESS };
        user.signatureData = undefined;
        user.certificateDate = undefined;
        saveUsers(users);
    }
}

// Initialize demo admin account
export function initDemoData() {
    if (typeof window === 'undefined') return;
    const users = getUsers();
    if (!users.find(u => u.email === 'admin@ciudadano.co')) {
        const admin: User = {
            id: uuidv4(),
            username: 'admin',
            email: 'admin@ciudadano.co',
            role: 'admin',
            createdDate: new Date().toISOString(),
            hasBiometric: false,
            trainingProgress: { ...DEFAULT_PROGRESS, completed: true },
        };
        localStorage.setItem(`rv_pwd_${admin.id}`, btoa('admin123'));
        users.push(admin);
        saveUsers(users);
    }
}
